"""
BERT-based sentiment analysis using HuggingFace transformers.
Falls back to keyword heuristics if model is unavailable (e.g., no GPU).
"""
import re
from typing import Dict, List
from functools import lru_cache


@lru_cache(maxsize=1)
def _load_pipeline():
    try:
        from transformers import pipeline
        return pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            truncation=True,
            max_length=512,
        )
    except Exception:
        return None


class SentimentBERT:
    POSITIVE_WORDS = {"win", "success", "approve", "increase", "gain", "pass", "rise", "up", "bullish", "positive"}
    NEGATIVE_WORDS = {"loss", "fail", "reject", "decrease", "drop", "fall", "down", "bearish", "negative", "crisis"}

    def analyze(self, texts: List[str]) -> Dict[str, float]:
        """Returns {positive, negative, neutral} as percentages summing to 100."""
        if not texts:
            return {"positive": 33.3, "negative": 33.3, "neutral": 33.4}

        pipe = _load_pipeline()
        if pipe:
            return self._bert_analyze(texts, pipe)
        return self._heuristic_analyze(texts)

    def _bert_analyze(self, texts: List[str], pipe) -> Dict[str, float]:
        label_map = {
            "positive": "positive", "POSITIVE": "positive",
            "negative": "negative", "NEGATIVE": "negative",
            "neutral": "neutral", "NEUTRAL": "neutral",
            "LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive",
        }
        counts = {"positive": 0, "negative": 0, "neutral": 0}
        for text in texts[:20]:  # limit to 20 articles
            try:
                result = pipe(text[:512])[0]
                label = label_map.get(result["label"], "neutral")
                counts[label] += 1
            except Exception:
                counts["neutral"] += 1

        total = sum(counts.values()) or 1
        return {k: round(v / total * 100, 1) for k, v in counts.items()}

    def _heuristic_analyze(self, texts: List[str]) -> Dict[str, float]:
        counts = {"positive": 0, "negative": 0, "neutral": 0}
        for text in texts:
            words = set(re.findall(r"\w+", text.lower()))
            pos = len(words & self.POSITIVE_WORDS)
            neg = len(words & self.NEGATIVE_WORDS)
            if pos > neg:
                counts["positive"] += 1
            elif neg > pos:
                counts["negative"] += 1
            else:
                counts["neutral"] += 1

        total = sum(counts.values()) or 1
        return {k: round(v / total * 100, 1) for k, v in counts.items()}


sentiment_bert = SentimentBERT()
