#!/usr/bin/env python3
"""Entry point for the Weather Forecasting Flask API."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    print("  Weather Forecasting API")
    print(f"   Running on  - http://localhost:{port}")
    print(f"   Health check - http://localhost:{port}/api/health")
    print(f"   Mode         - {'development' if debug else 'production'}")
    app.run(debug=debug, host="0.0.0.0", port=port)
