import os
from dotenv import load_dotenv

# Load .env from the project root (two levels above this file)
_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(_root, ".env"))


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///weather.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    OWM_API_KEY = os.environ.get("OPENWEATHERMAP_API_KEY", "")
    OWM_BASE_URL = "https://api.openweathermap.org"

    CACHE_TTL = 900  # 15 minutes
    MAX_FORECAST_DAYS = 7

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    ML_MODEL_DIR = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "ml",
        "saved_models",
    )
