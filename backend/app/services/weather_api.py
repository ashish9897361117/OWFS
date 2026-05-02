"""OpenWeatherMap API integration service."""

import requests
from datetime import datetime


class WeatherAPIService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base = "https://api.openweathermap.org"

    def _get(self, path: str, params: dict) -> dict:
        params["appid"] = self.api_key
        params["units"] = "metric"
        r = requests.get(f"{self.base}{path}", params=params, timeout=8)
        r.raise_for_status()
        return r.json()

    def get_current_weather(self, location: str) -> dict:
        data = self._get("/data/2.5/weather", {"q": location})
        return self._parse_current(data)

    def get_current_by_coords(self, lat: float, lon: float) -> dict:
        data = self._get("/data/2.5/weather", {"lat": lat, "lon": lon})
        return self._parse_current(data)

    def _parse_current(self, data: dict) -> dict:
        w = data.get("weather", [{}])[0]
        wind = data.get("wind", {})
        main = data.get("main", {})
        sys = data.get("sys", {})
        return {
            "location": {
                "name": data.get("name", ""),
                "country": sys.get("country", ""),
                "lat": data.get("coord", {}).get("lat", 0),
                "lon": data.get("coord", {}).get("lon", 0),
            },
            "temperature": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "temp_min": main.get("temp_min"),
            "temp_max": main.get("temp_max"),
            "humidity": main.get("humidity"),
            "pressure": main.get("pressure"),
            "wind_speed": wind.get("speed"),
            "wind_deg": wind.get("deg"),
            "visibility": data.get("visibility", 10000) / 1000,  # km
            "weather_main": w.get("main", "Clear"),
            "weather_description": w.get("description", ""),
            "weather_icon": w.get("icon", "01d"),
            "sunrise": sys.get("sunrise"),
            "sunset": sys.get("sunset"),
            "last_updated": datetime.utcnow().isoformat(),
        }

    def get_5day_forecast(self, location: str) -> list:
        data = self._get("/data/2.5/forecast", {"q": location, "cnt": 40})
        items = []
        for entry in data.get("list", []):
            w = entry.get("weather", [{}])[0]
            main = entry.get("main", {})
            wind = entry.get("wind", {})
            items.append({
                "timestamp": entry.get("dt_txt", ""),
                "temperature": main.get("temp"),
                "humidity": main.get("humidity"),
                "wind_speed": wind.get("speed"),
                "pressure": main.get("pressure"),
                "weather_main": w.get("main", "Clear"),
                "weather_icon": w.get("icon", "01d"),
            })
        return items

    def geocode(self, query: str, limit: int = 5) -> list:
        results = self._get("/geo/1.0/direct", {"q": query, "limit": limit})
        return [
            {
                "name": r.get("name", ""),
                "country": r.get("country", ""),
                "state": r.get("state", ""),
                "lat": r.get("lat"),
                "lon": r.get("lon"),
                "display": f"{r.get('name')}"
                           + (f", {r.get('state')}" if r.get("state") else "")
                           + f", {r.get('country', '')}",
            }
            for r in results
        ]
