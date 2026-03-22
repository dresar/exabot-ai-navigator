"""
PyTorch LSTM temporal prediction model.
Uses price timeseries to predict market direction.
Falls back to heuristic when no trained model or no GPU.
"""
import os
import json
from typing import List, Dict, Any, Optional
import numpy as np


class LSTMModel:
    MODEL_PATH = "models/lstm_market.pt"
    SEQ_LEN = 30

    def __init__(self):
        self._model = None
        self._device = "cpu"
        self._load_model()

    def _load_model(self):
        if not os.path.exists(self.MODEL_PATH):
            return
        try:
            import torch
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = torch.load(self.MODEL_PATH, map_location=self._device)
            self._model.eval()
        except Exception:
            self._model = None

    def predict(self, price_series: List[float]) -> float:
        """Returns probability 0.0–1.0 from price history."""
        if not price_series:
            return 0.5

        if self._model is not None and len(price_series) >= self.SEQ_LEN:
            try:
                return self._torch_predict(price_series)
            except Exception:
                pass

        return self._heuristic_predict(price_series)

    def _torch_predict(self, prices: List[float]) -> float:
        import torch
        seq = np.array(prices[-self.SEQ_LEN:], dtype=np.float32)
        seq = (seq - seq.mean()) / (seq.std() + 1e-8)
        tensor = torch.FloatTensor(seq).unsqueeze(0).unsqueeze(-1).to(self._device)
        with torch.no_grad():
            output = self._model(tensor)
            prob = float(torch.sigmoid(output).squeeze())
        return max(0.05, min(0.95, prob))

    def _heuristic_predict(self, prices: List[float]) -> float:
        if len(prices) < 2:
            return 0.5
        recent = prices[-min(7, len(prices)):]
        trend = (recent[-1] - recent[0]) / (recent[0] + 1e-8)
        prob = 0.5 + trend * 2
        return max(0.05, min(0.95, prob))

    def train(self, sequences: np.ndarray, labels: np.ndarray, epochs: int = 50) -> List[Dict]:
        """Train and persist model. Returns epoch history."""
        import torch
        import torch.nn as nn
        from torch.utils.data import DataLoader, TensorDataset

        X = torch.FloatTensor(sequences)
        y = torch.FloatTensor(labels)
        dataset = TensorDataset(X, y)
        loader = DataLoader(dataset, batch_size=32, shuffle=True)

        model = _LSTMNet(input_size=1, hidden_size=64, num_layers=2)
        optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
        criterion = nn.BCEWithLogitsLoss()

        history = []
        for epoch in range(epochs):
            model.train()
            total_loss = 0.0
            for xb, yb in loader:
                optimizer.zero_grad()
                out = model(xb.unsqueeze(-1))
                loss = criterion(out.squeeze(), yb)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()

            model.eval()
            with torch.no_grad():
                preds = (torch.sigmoid(model(X.unsqueeze(-1))).squeeze() > 0.5).float()
                acc = float((preds == y).float().mean())

            history.append({"epoch": epoch + 1, "accuracy": round(acc * 100, 2), "loss": round(total_loss / len(loader), 6)})

        os.makedirs("models", exist_ok=True)
        torch.save(model, self.MODEL_PATH)
        self._model = model
        return history


class _LSTMNet:
    """Minimal LSTM for binary classification."""
    def __init__(self, input_size, hidden_size, num_layers):
        import torch.nn as nn
        import torch
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        import torch
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


lstm_model = LSTMModel()
