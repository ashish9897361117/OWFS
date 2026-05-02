from flask import Blueprint, jsonify
import time

health_bp = Blueprint("health", __name__)
_start_time = time.time()


@health_bp.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "uptime_seconds": round(time.time() - _start_time, 1),
        "service": "Weather Forecasting API",
        "version": "1.0.0",
    })
