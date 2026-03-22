"""
Ensemble model: weighted combination of BERT, XGBoost, LSTM, and GPT outputs.
Weights are loaded from the ai_models table; defaults are hardcoded here.
"""
from typing import Dict, Any, Optional
import math


DEFAULT_WEIGHTS = {
    "sentiment": 0.20,   # BERT sentiment
    "statistical": 0.25, # XGBoost
    "temporal": 0.20,    # LSTM
    "llm": 0.35,         # GPT-4
}


def combine(
    sentiment_prob: float,
    xgboost_prob: float,
    lstm_prob: float,
    gpt_prob: float,
    gpt_confidence: float,
    weights: Optional[Dict[str, float]] = None,
) -> Dict[str, float]:
    """
    Weighted ensemble. Returns {probability, confidence, ai_edge} given market_prob.
    All probabilities in 0–100 range.
    """
    w = weights or DEFAULT_WEIGHTS

    # Normalize weights
    total_w = sum(w.values())
    wn = {k: v / total_w for k, v in w.items()}

    ensemble_prob = (
        sentiment_prob * wn.get("sentiment", 0.2)
        + xgboost_prob * wn.get("statistical", 0.25)
        + lstm_prob * wn.get("temporal", 0.2)
        + gpt_prob * wn.get("llm", 0.35)
    )

    # Confidence: GPT-provided confidence blended with model agreement
    model_std = _std([sentiment_prob, xgboost_prob, lstm_prob, gpt_prob])
    agreement_score = max(0, 100 - model_std * 2)  # less variance → higher agreement
    confidence = gpt_confidence * 0.6 + agreement_score * 0.4

    return {
        "probability": round(max(1, min(99, ensemble_prob)), 2),
        "confidence": round(max(10, min(99, confidence)), 2),
    }


def _std(values: list[float]) -> float:
    if not values:
        return 0
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return math.sqrt(variance)


def compute_ai_edge(ai_prob: float, market_prob: float) -> float:
    """Positive = AI thinks outcome more likely than market."""
    return round(ai_prob - market_prob, 2)


def compute_factor_scores(
    sentiment: Dict[str, float],
    news_count: int,
    volume_usd: float,
    change_24h: float,
) -> Dict[str, float]:
    """Returns named factor scores (0–100) for UI display."""
    media_score = min(100, sentiment.get("positive", 50) + news_count * 2)
    volume_score = min(100, math.log10(max(1, volume_usd)) * 10)
    momentum_score = min(100, max(0, 50 + change_24h * 100))

    return {
        "media_sentiment": round(media_score, 1),
        "market_volume": round(volume_score, 1),
        "price_momentum": round(momentum_score, 1),
        "data_availability": round(min(100, news_count * 10 + 20), 1),
    }
