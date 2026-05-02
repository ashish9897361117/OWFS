import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from ml.lstm_model import load_model, mc_predict, TF_AVAILABLE
from ml.data_pipeline import DataPipeline, SEQ_LEN, FEATURES, TARGETS

class MLService:
    """Service to handle LSTM inference for weather forecasting."""

    def __init__(self, model_dir: str):
        self.model_dir = model_dir
        self.model = None
        self.pipeline = None
        self._load_resources()

    def _load_resources(self):
        """Lazy load model and pipeline if available."""
        if not TF_AVAILABLE:
            return

        try:
            if os.path.exists(os.path.join(self.model_dir, "lstm_weather.keras")):
                self.model = load_model(self.model_dir)
                self.pipeline = DataPipeline.load(self.model_dir)
        except Exception as e:
            print(f"⚠️ Error loading ML model: {e}")

    def predict(self, current_data: dict, owm_forecast: list, history: list, days: int = 7) -> list:
        """
        Generates predictions for 'days' into the future.
        Uses historical data + current conditions + OWM forecast as guidance.
        """
        if not self.model or not self.pipeline:
            return self._generate_fallback_forecast(current_data, owm_forecast, days)

        try:
            # 1. Prepare input sequence (X)
            # We need SEQ_LEN (14) days of data.
            # We combine historical database records + current data.
            combined_history = []
            for h in history:
                combined_history.append({
                    "temperature": h["temperature"],
                    "humidity": h["humidity"],
                    "wind_speed": h["wind_speed"],
                    "pressure": h["pressure"]
                })
            
            # Add current
            combined_history.append({
                "temperature": current_data["temperature"],
                "humidity": current_data["humidity"],
                "wind_speed": current_data["wind_speed"],
                "pressure": current_data["pressure"]
            })

            # If we don't have enough history, pad with current or OWM forecast backfilled
            while len(combined_history) < SEQ_LEN:
                combined_history.insert(0, combined_history[0].copy())
            
            # Take last SEQ_LEN
            seq_df = pd.DataFrame(combined_history[-SEQ_LEN:])
            X_scaled = self.pipeline.transform(seq_df)
            X_input = X_scaled.reshape(1, SEQ_LEN, len(FEATURES))

            # 2. Run MC Dropout Inference
            mean_pred, std_pred = mc_predict(self.model, X_input, n_samples=20)
            
            # 3. Inverse transform results
            # mean_pred shape: (1, 7, 3)
            real_preds = self.pipeline.inverse_transform_targets(mean_pred)[0]
            real_stds = (self.pipeline.inverse_transform_targets(mean_pred + std_pred)[0] - real_preds)

            # 4. Format output
            forecast = []
            base_date = datetime.utcnow()
            
            for i in range(days):
                pred_date = base_date + timedelta(days=i+1)
                
                # Use OWM forecast for weather icons/main as guidance if available
                owm_match = next((f for f in owm_forecast if i*8 < owm_forecast.index(f) <= (i+1)*8), {})
                
                forecast.append({
                    "date": pred_date.date().isoformat(),
                    "temperature": round(float(real_preds[i][0]), 1),
                    "humidity": round(float(real_preds[i][1]), 1),
                    "wind_speed": round(float(real_preds[i][2]), 1),
                    "weather_main": owm_match.get("weather_main", "Clear"),
                    "weather_icon": owm_match.get("weather_icon", "01d"),
                    "confidence": {
                        "temperature": [
                            round(float(real_preds[i][0] - 1.96 * real_stds[i][0]), 1),
                            round(float(real_preds[i][0] + 1.96 * real_stds[i][0]), 1)
                        ],
                        "humidity": [
                            round(float(real_preds[i][1] - 1.96 * real_stds[i][1]), 1),
                            round(float(real_preds[i][1] + 1.96 * real_stds[i][1]), 1)
                        ],
                        "wind_speed": [
                            round(float(real_preds[i][2] - 1.96 * real_stds[i][2]), 1),
                            round(float(real_preds[i][2] + 1.96 * real_stds[i][2]), 1)
                        ]
                    }
                })
            
            return forecast

        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return self._generate_fallback_forecast(current_data, owm_forecast, days)

    def _generate_fallback_forecast(self, current: dict, owm_forecast: list, days: int) -> list:
        """Fallback to OWM forecast if model is not trained or fails."""
        forecast = []
        base_date = datetime.utcnow()
        
        # OWM gives data every 3 hours. We pick one per day (approx noon)
        daily_owm = []
        for i in range(days):
            # Find closest to 12:00 PM for each day
            target_time = (base_date + timedelta(days=i+1)).replace(hour=12, minute=0, second=0)
            best_match = None
            min_diff = float('inf')
            
            for entry in owm_forecast:
                entry_time = datetime.strptime(entry["timestamp"], "%Y-%m-%d %H:%M:%S")
                diff = abs((entry_time - target_time).total_seconds())
                if diff < min_diff:
                    min_diff = diff
                    best_match = entry
            
            if best_match:
                daily_owm.append(best_match)
            else:
                # If OWM doesn't go far enough, use last known or current
                daily_owm.append({
                    "temperature": current["temperature"],
                    "humidity": current["humidity"],
                    "wind_speed": current["wind_speed"],
                    "weather_main": current["weather_main"],
                    "weather_icon": current["weather_icon"]
                })

        for i, data in enumerate(daily_owm):
            pred_date = base_date + timedelta(days=i+1)
            temp = data["temperature"]
            forecast.append({
                "date": pred_date.date().isoformat(),
                "temperature": temp,
                "humidity": data["humidity"],
                "wind_speed": data["wind_speed"],
                "weather_main": data["weather_main"],
                "weather_icon": data["weather_icon"],
                "confidence": {
                    "temperature": [temp - 2, temp + 2],
                    "humidity": [data["humidity"] - 5, data["humidity"] + 5],
                    "wind_speed": [data["wind_speed"] - 1, data["wind_speed"] + 1]
                }
            })
            
        return forecast
