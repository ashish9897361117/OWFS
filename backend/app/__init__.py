from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    from .config import Config
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app, origins=app.config.get("CORS_ORIGINS", ["http://localhost:5173"]))

    from .routes.weather import weather_bp
    from .routes.search import search_bp
    from .routes.health import health_bp

    app.register_blueprint(weather_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app
