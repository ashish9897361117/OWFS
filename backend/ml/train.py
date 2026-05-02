"""
Training script — generates synthetic data, trains LSTM, saves model + pipeline.
Run from backend/: python -m ml.train
"""

import os
import sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.data_pipeline import DataPipeline, SEQ_LEN, PRED_DAYS
from ml.lstm_model import build_model, save_model, TF_AVAILABLE

MODEL_SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_models")


def train(epochs: int = 30, batch_size: int = 32, verbose: int = 1):
    if not TF_AVAILABLE:
        print("❌ TensorFlow not installed. Run: pip install tensorflow")
        return

    print("Generating synthetic training data (2 years)...")
    pipeline = DataPipeline()
    df = pipeline.generate_synthetic_data(n_days=730)
    scaled = pipeline.fit_transform(df)

    print("Creating sequences...")
    X, y = pipeline.make_sequences(scaled, seq_len=SEQ_LEN, pred_days=PRED_DAYS)

    # Train/val split
    split = int(len(X) * 0.85)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    print(f"   Train samples : {len(X_train)}")
    print(f"   Val samples   : {len(X_val)}")
    print(f"   Input shape   : {X_train.shape}")
    print(f"   Output shape  : {y_train.shape}")

    import tensorflow as tf
    model = build_model()
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3, verbose=1),
    ]

    print("\nTraining LSTM model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=verbose,
    )

    # Evaluate on val set
    val_loss, val_mae = model.evaluate(X_val, y_val, verbose=0)
    print(f"\nValidation Loss (MSE): {val_loss:.4f}  |  MAE: {val_mae:.4f}")

    print(f"Saving model and pipeline to {MODEL_SAVE_DIR}")
    save_model(model, MODEL_SAVE_DIR)
    pipeline.save(MODEL_SAVE_DIR)
    print("Training complete!\n")
    return model, pipeline


if __name__ == "__main__":
    train()
