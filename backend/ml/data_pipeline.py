"""
LSTM Data Pipeline — preprocessing, synthetic data generation,
and sequence windowing for model training and inference.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import pickle
import os
from datetime import datetime, timedelta
import random

FEATURES = ["temperature", "humidity", "wind_speed", "pressure"]
TARGETS = ["temperature", "humidity", "wind_speed"]
SEQ_LEN = 14   # Look-back window (days)
PRED_DAYS = 7  # Forecast horizon


class DataPipeline:
    def __init__(self):
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.target_scaler = MinMaxScaler(feature_range=(0, 1))
        self._fitted = False

    def generate_synthetic_data(self, n_days: int = 730, seed: int = 42) -> pd.DataFrame:
        """Generate 2 years of realistic seasonal weather data for training."""
        random.seed(seed)
        np.random.seed(seed)
        start = datetime(2023, 1, 1)
        dates = [start + timedelta(days=i) for i in range(n_days)]
        data = []
        for i, d in enumerate(dates):
            # Seasonal temperature (India-like): 15–42°C
            day_of_year = d.timetuple().tm_yday
            base_temp = 28 + 14 * np.sin((day_of_year - 90) * 2 * np.pi / 365)
            temp = base_temp + np.random.normal(0, 2.5)
            # Humidity: higher in monsoon (Jun–Sep)
            base_hum = 55 + 30 * np.sin((day_of_year - 150) * 2 * np.pi / 365)
            hum = np.clip(base_hum + np.random.normal(0, 8), 10, 100)
            # Wind speed
            wind = np.clip(np.random.exponential(3.5) + 1, 0, 25)
            # Pressure
            pressure = 1013 + np.random.normal(0, 5) - 0.3 * (temp - 25)
            data.append({
                "timestamp": d,
                "temperature": round(float(temp), 2),
                "humidity": round(float(hum), 2),
                "wind_speed": round(float(wind), 2),
                "pressure": round(float(pressure), 2),
            })
        return pd.DataFrame(data)

    def fit_transform(self, df: pd.DataFrame):
        """Fit scalers and return scaled numpy arrays."""
        feat = df[FEATURES].values
        tgt = df[TARGETS].values
        scaled_feat = self.scaler.fit_transform(feat)
        self.target_scaler.fit_transform(tgt)
        self._fitted = True
        return scaled_feat

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        feat = df[FEATURES].values
        return self.scaler.transform(feat)

    def make_sequences(self, scaled: np.ndarray, seq_len: int = SEQ_LEN, pred_days: int = PRED_DAYS):
        """Sliding window: X shape (N, seq_len, features), y shape (N, pred_days, 3)."""
        X, y = [], []
        tgt_indices = [FEATURES.index(t) for t in TARGETS]
        for i in range(len(scaled) - seq_len - pred_days + 1):
            X.append(scaled[i: i + seq_len])
            y.append(scaled[i + seq_len: i + seq_len + pred_days][:, tgt_indices])
        return np.array(X), np.array(y)

    def inverse_transform_targets(self, scaled_preds: np.ndarray) -> np.ndarray:
        """Inverse scale output predictions back to real values."""
        shape = scaled_preds.shape
        flat = scaled_preds.reshape(-1, len(TARGETS))
        orig = self.target_scaler.inverse_transform(flat)
        return orig.reshape(shape)

    def save(self, path: str):
        os.makedirs(path, exist_ok=True)
        with open(os.path.join(path, "pipeline.pkl"), "wb") as f:
            pickle.dump(self, f)

    @staticmethod
    def load(path: str) -> "DataPipeline":
        with open(os.path.join(path, "pipeline.pkl"), "rb") as f:
            return pickle.load(f)
