from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from ..services.weather_api import WeatherAPIService
from ..services.cache import get_cache
from ..models.db_models import WeatherRecord, ForecastRecord
from .. import db

weather_bp = Blueprint("weather", __name__)


# ── /api/weather/current ─────────────────────────────────────────────────────
@weather_bp.route("/weather/current")
def current_weather():
    location = request.args.get("location", "").strip()
    if not location:
        return jsonify({"error": "location parameter is required"}), 400

    cache = get_cache()
    cache_key = f"current_{location.lower()}"
    cached = cache.get(cache_key)
    if cached:
        return jsonify(cached)

    try:
        svc = WeatherAPIService(current_app.config["OWM_API_KEY"])
        data = svc.get_current_weather(location)

        # Persist to DB
        record = WeatherRecord(
            location_name=data["location"]["name"],
            lat=data["location"]["lat"],
            lon=data["location"]["lon"],
            timestamp=datetime.utcnow(),
            temperature=data["temperature"],
            feels_like=data.get("feels_like"),
            humidity=data["humidity"],
            wind_speed=data["wind_speed"],
            wind_deg=data.get("wind_deg"),
            pressure=data["pressure"],
            visibility=data.get("visibility"),
            weather_main=data["weather_main"],
            weather_description=data["weather_description"],
            weather_icon=data["weather_icon"],
        )
        db.session.add(record)
        db.session.commit()

        cache.set(cache_key, data, ttl=current_app.config["CACHE_TTL"])
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── /api/weather/forecast ────────────────────────────────────────────────────
@weather_bp.route("/weather/forecast")
def weather_forecast():
    location = request.args.get("location", "").strip()
    days = min(int(request.args.get("days", 7)), 7)
    if not location:
        return jsonify({"error": "location parameter is required"}), 400

    cache = get_cache()
    cache_key = f"forecast_{location.lower()}_{days}"
    cached = cache.get(cache_key)
    if cached:
        return jsonify(cached)

    try:
        svc = WeatherAPIService(current_app.config["OWM_API_KEY"])
        current = svc.get_current_weather(location)
        owm_forecast = svc.get_5day_forecast(location)

        # Pull recent history from DB for LSTM context
        history = (
            WeatherRecord.query
            .filter_by(location_name=current["location"]["name"])
            .order_by(WeatherRecord.timestamp.desc())
            .limit(30)
            .all()
        )

        from ..services.ml_service import MLService
        ml = MLService(current_app.config["ML_MODEL_DIR"])
        predictions = ml.predict(
            current_data=current,
            owm_forecast=owm_forecast,
            history=[r.to_dict() for r in history],
            days=days,
        )

        # Persist predictions
        for pred in predictions:
            fr = ForecastRecord(
                location_name=current["location"]["name"],
                lat=current["location"]["lat"],
                lon=current["location"]["lon"],
                forecast_date=datetime.fromisoformat(pred["date"].replace("Z", "")),
                temperature_pred=pred["temperature"],
                humidity_pred=pred["humidity"],
                wind_speed_pred=pred["wind_speed"],
                temp_lower=pred["confidence"]["temperature"][0],
                temp_upper=pred["confidence"]["temperature"][1],
                humidity_lower=pred["confidence"]["humidity"][0],
                humidity_upper=pred["confidence"]["humidity"][1],
                wind_lower=pred["confidence"]["wind_speed"][0],
                wind_upper=pred["confidence"]["wind_speed"][1],
                weather_main=pred.get("weather_main", "Clear"),
                weather_icon=pred.get("weather_icon", "01d"),
            )
            db.session.add(fr)
        db.session.commit()

        result = {
            "location": current["location"],
            "forecast": predictions,
            "hourly": owm_forecast,
            "model_version": "1.0",
            "generated_at": datetime.utcnow().isoformat(),
        }
        cache.set(cache_key, result, ttl=900)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── /api/weather/history ─────────────────────────────────────────────────────
@weather_bp.route("/weather/history")
def weather_history():
    location = request.args.get("location", "").strip()
    from_str = request.args.get("from", "")
    to_str = request.args.get("to", "")
    if not location:
        return jsonify({"error": "location parameter is required"}), 400

    try:
        query = WeatherRecord.query.filter_by(location_name=location)
        if from_str:
            query = query.filter(WeatherRecord.timestamp >= datetime.fromisoformat(from_str))
        if to_str:
            query = query.filter(WeatherRecord.timestamp <= datetime.fromisoformat(to_str))
        records = query.order_by(WeatherRecord.timestamp.asc()).limit(500).all()
        return jsonify({"location": location, "history": [r.to_dict() for r in records]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
