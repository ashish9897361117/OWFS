"""
LSTM model definition for weather forecasting.
Architecture: Bidirectional LSTM × 2 + Dropout (Monte Carlo) + Dense output.
"""

import numpy as np
import os

try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


SEQ_LEN = 14
N_FEATURES = 4
PRED_DAYS = 7
N_TARGETS = 3  # temperature, humidity, wind_speed


def build_model(seq_len: int = SEQ_LEN, n_features: int = N_FEATURES,
                pred_days: int = PRED_DAYS, n_targets: int = N_TARGETS):
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed. Run: pip install tensorflow")

    inputs = keras.Input(shape=(seq_len, n_features))
    x = keras.layers.Bidirectional(
        keras.layers.LSTM(64, return_sequences=True)
    )(inputs)
    x = keras.layers.Dropout(0.2)(x, training=True)   # MC Dropout — keep training=True for inference uncertainty
    x = keras.layers.Bidirectional(
        keras.layers.LSTM(32)
    )(x)
    x = keras.layers.Dropout(0.2)(x, training=True)
    x = keras.layers.Dense(64, activation="relu")(x)
    # Output: flatten (pred_days × n_targets), then reshape
    outputs = keras.layers.Dense(pred_days * n_targets)(x)
    outputs = keras.layers.Reshape((pred_days, n_targets))(outputs)

    model = keras.Model(inputs, outputs)
    model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse", metrics=["mae"])
    return model


def save_model(model, path: str):
    os.makedirs(path, exist_ok=True)
    model.save(os.path.join(path, "lstm_weather.keras"))


def load_model(path: str):
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed.")
    model_path = os.path.join(path, "lstm_weather.keras")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No model found at {model_path}")
    return keras.models.load_model(model_path)


def mc_predict(model, X: np.ndarray, n_samples: int = 30) -> tuple:
    """Monte Carlo Dropout inference — returns (mean, std) over n_samples passes."""
    preds = np.stack([model(X, training=True).numpy() for _ in range(n_samples)], axis=0)
    return preds.mean(axis=0), preds.std(axis=0)
