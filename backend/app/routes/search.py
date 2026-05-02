from flask import Blueprint, request, jsonify, current_app
from ..services.weather_api import WeatherAPIService
from ..services.cache import get_cache

search_bp = Blueprint("search", __name__)


@search_bp.route("/search/autocomplete")
def autocomplete():
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify([])

    cache = get_cache()
    cache_key = f"geo_{q.lower()}"
    cached = cache.get(cache_key)
    if cached:
        return jsonify(cached)

    try:
        svc = WeatherAPIService(current_app.config["OWM_API_KEY"])
        results = svc.geocode(q, limit=6)
        cache.set(cache_key, results, ttl=3600)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
