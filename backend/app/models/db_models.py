from datetime import datetime
from .. import db


class WeatherRecord(db.Model):
    """Stores live weather readings ingested from OWM."""
    __tablename__ = "weather_records"

    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(100), nullable=False, index=True)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    temperature = db.Column(db.Float)
    feels_like = db.Column(db.Float)
    humidity = db.Column(db.Float)
    wind_speed = db.Column(db.Float)
    wind_deg = db.Column(db.Float)
    pressure = db.Column(db.Float)
    visibility = db.Column(db.Float)
    weather_main = db.Column(db.String(50))
    weather_description = db.Column(db.String(100))
    weather_icon = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "timestamp": self.timestamp.isoformat(),
            "temperature": self.temperature,
            "feels_like": self.feels_like,
            "humidity": self.humidity,
            "wind_speed": self.wind_speed,
            "pressure": self.pressure,
            "visibility": self.visibility,
            "weather_main": self.weather_main,
            "weather_description": self.weather_description,
            "weather_icon": self.weather_icon,
        }


class ForecastRecord(db.Model):
    """Stores ML model predictions for auditing and chart overlays."""
    __tablename__ = "forecast_records"

    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(100), nullable=False, index=True)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    forecast_date = db.Column(db.DateTime, nullable=False, index=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    temperature_pred = db.Column(db.Float)
    humidity_pred = db.Column(db.Float)
    wind_speed_pred = db.Column(db.Float)
    temp_lower = db.Column(db.Float)
    temp_upper = db.Column(db.Float)
    humidity_lower = db.Column(db.Float)
    humidity_upper = db.Column(db.Float)
    wind_lower = db.Column(db.Float)
    wind_upper = db.Column(db.Float)
    model_version = db.Column(db.String(20), default="1.0")
    weather_main = db.Column(db.String(50))
    weather_icon = db.Column(db.String(20))

    def to_dict(self):
        return {
            "date": self.forecast_date.isoformat(),
            "temperature": self.temperature_pred,
            "humidity": self.humidity_pred,
            "wind_speed": self.wind_speed_pred,
            "weather_main": self.weather_main,
            "weather_icon": self.weather_icon,
            "confidence": {
                "temperature": [self.temp_lower, self.temp_upper],
                "humidity": [self.humidity_lower, self.humidity_upper],
                "wind_speed": [self.wind_lower, self.wind_upper],
            },
        }
