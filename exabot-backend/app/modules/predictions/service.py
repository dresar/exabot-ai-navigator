"""Core prediction pipeline — orchestrates all AI sub-models."""
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import MarketEvent, Prediction, NewsArticle
from app.ai.sentiment_bert import sentiment_bert
from app.ai.xgboost_model import xgboost_model
from app.ai.lstm_model import lstm_model
from app.ai.gpt_reasoning import generate_prediction
from app.ai.ensemble import combine, compute_ai_edge, compute_factor_scores
from app.core.exceptions import NotFoundError
from app.redis_client import cache
from app.modules.websocket.manager import manager


async def run_prediction_pipeline(
    db: AsyncSession,
    event_id: str,
    user_id: Optional[str] = None,
) -> Prediction:
    """Full AI pipeline for an event. Returns persisted Prediction."""

    # Load event
    result = await db.execute(select(MarketEvent).where(MarketEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise NotFoundError("Market event not found")

    # Load news articles
    news_result = await db.execute(
        select(NewsArticle).where(NewsArticle.event_id == event_id).limit(20)
    )
    articles = news_result.scalars().all()
    news_texts = [a.title + " " + (a.content or "") for a in articles]
    news_summaries = [a.title for a in articles]

    # 1. BERT Sentiment
    sentiment = sentiment_bert.analyze(news_texts)

    # 2. XGBoost
    xgb_features = {
        "yes_price": float(event.yes_price),
        "volume_usd": float(event.volume_usd),
        "change_24h": float(event.change_24h),
        "sentiment_positive": sentiment.get("positive", 50),
        "sentiment_negative": sentiment.get("negative", 25),
        "days_to_end": 30,
    }
    xgb_prob = xgboost_model.predict(xgb_features) * 100

    # 3. LSTM (use yes_price as price series proxy — real impl uses historical prices)
    lstm_prob = lstm_model.predict([float(event.yes_price)]) * 100

    # 4. GPT Reasoning
    market_data = {
        "yes_price": float(event.yes_price),
        "volume_usd": float(event.volume_usd),
        "change_24h": float(event.change_24h),
    }
    gpt_result = await generate_prediction(
        event_name=event.name,
        event_description=event.description or "",
        market_data=market_data,
        news_summaries=news_summaries,
    )

    # 5. Ensemble
    ensemble = combine(
        sentiment_prob=sentiment.get("positive", 50),
        xgboost_prob=xgb_prob,
        lstm_prob=lstm_prob,
        gpt_prob=gpt_result["probability"],
        gpt_confidence=gpt_result["confidence"],
    )

    market_prob = float(event.yes_price) * 100
    ai_edge = compute_ai_edge(ensemble["probability"], market_prob)
    factor_scores = compute_factor_scores(sentiment, len(articles), float(event.volume_usd), float(event.change_24h))

    model_outputs = {
        "sentiment_bert": round(sentiment.get("positive", 50), 2),
        "xgboost": round(xgb_prob, 2),
        "lstm": round(lstm_prob, 2),
        "gpt4": round(gpt_result["probability"], 2),
        "supporting_factors": gpt_result.get("supporting_factors", []),
        "risk_factors": gpt_result.get("risk_factors", []),
    }

    prediction = Prediction(
        event_id=event_id,
        user_id=user_id,
        ai_probability=round(ensemble["probability"], 2),
        market_probability=round(market_prob, 2),
        confidence=round(ensemble["confidence"], 2),
        ai_edge=round(ai_edge, 2),
        reasoning=gpt_result.get("reasoning"),
        sentiment_data=sentiment,
        factor_scores=factor_scores,
        model_outputs=model_outputs,
        status="pending",
    )
    db.add(prediction)
    await db.commit()
    await db.refresh(prediction)

    # Invalidate live predictions cache
    await cache.delete("predictions:live")

    # Push to WebSocket subscribers (in-process; no Redis)
    await manager.broadcast(
        "predictions",
        {
            "type": "new_prediction",
            "prediction_id": prediction.id,
            "event_id": event_id,
            "ai_probability": float(prediction.ai_probability),
            "confidence": float(prediction.confidence),
        },
    )

    return prediction
