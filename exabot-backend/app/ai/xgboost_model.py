"""
XGBoost statistical prediction model.
Trained on historical market data (yes_price, volume, change_24h, sentiment).
Falls back to a calibrated heuristic when no trained model exists.
"""
import os
import pickle
from typing import Dict, Any, Optional
import numpy as np


class XGBoostModel:
    MODEL_PATH = "models/xgboost_market.pkl"

    def __init__(self):
        self._model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.MODEL_PATH):
            try:
                with open(self.MODEL_PATH, "rb") as f:
                    self._model = pickle.load(f)
            except Exception:
                self._model = None

    def predict(self, features: Dict[str, Any]) -> float:
        """Returns probability (0.0–1.0)."""
        vec = self._build_feature_vector(features)

        if self._model is not None:
            try:
                import xgboost as xgb
                dmatrix = xgb.DMatrix(np.array([vec]))
                prob = float(self._model.predict(dmatrix)[0])
                return max(0.01, min(0.99, prob))
            except Exception:
                pass

        return self._heuristic_predict(features)

    def _build_feature_vector(self, f: Dict[str, Any]) -> list:
        return [
            float(f.get("yes_price", 0.5)),
            float(f.get("volume_usd", 0)),
            float(f.get("change_24h", 0)),
            float(f.get("sentiment_positive", 50)) / 100,
            float(f.get("sentiment_negative", 25)) / 100,
            float(f.get("days_to_end", 30)),
        ]

    def _heuristic_predict(self, f: Dict[str, Any]) -> float:
        base = float(f.get("yes_price", 0.5))
        sentiment_factor = (float(f.get("sentiment_positive", 50)) - float(f.get("sentiment_negative", 25))) / 200
        volume_factor = min(float(f.get("volume_usd", 0)) / 1_000_000, 0.1)
        change_factor = float(f.get("change_24h", 0)) / 100
        prob = base + sentiment_factor * 0.1 + volume_factor * 0.05 + change_factor * 0.05
        return max(0.05, min(0.95, prob))

    def train(self, X: np.ndarray, y: np.ndarray) -> float:
        """Train and persist model, return validation accuracy."""
        try:
            import xgboost as xgb
            from sklearn.model_selection import train_test_split

            X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
            dtrain = xgb.DMatrix(X_train, label=y_train)
            dval = xgb.DMatrix(X_val, label=y_val)

            params = {
                "objective": "binary:logistic",
                "eval_metric": "logloss",
                "max_depth": 6,
                "eta": 0.1,
                "subsample": 0.8,
            }
            model = xgb.train(
                params, dtrain, num_boost_round=100,
                evals=[(dval, "val")], verbose_eval=False,
            )
            preds = (model.predict(dval) > 0.5).astype(int)
            accuracy = float(np.mean(preds == y_val))

            os.makedirs("models", exist_ok=True)
            with open(self.MODEL_PATH, "wb") as f:
                pickle.dump(model, f)
            self._model = model
            return accuracy
        except Exception as e:
            raise RuntimeError(f"XGBoost training failed: {e}")


xgboost_model = XGBoostModel()
