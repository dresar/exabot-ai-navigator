from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Prediction, NewsArticle, MarketEvent
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.redis_client import cache
from app.modules.predictions.service import run_prediction_pipeline

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/{event_id}")
async def get_analysis(
    event_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    cached = await cache.get(f"analysis:{event_id}")
    if cached:
        return cached

    # Get latest prediction for event
    pred_result = await db.execute(
        select(Prediction)
        .where(Prediction.event_id == event_id)
        .order_by(Prediction.created_at.desc())
        .limit(1)
    )
    prediction = pred_result.scalar_one_or_none()

    event_result = await db.execute(select(MarketEvent).where(MarketEvent.id == event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise NotFoundError("Event not found")

    data = {
        "event_id": event_id,
        "event_name": event.name,
        "prediction": None,
    }

    if prediction:
        data["prediction"] = {
            "ai_probability": float(prediction.ai_probability),
            "market_probability": float(prediction.market_probability),
            "confidence": float(prediction.confidence),
            "ai_edge": float(prediction.ai_edge) if prediction.ai_edge else None,
            "reasoning": prediction.reasoning,
            "sentiment_data": prediction.sentiment_data,
            "factor_scores": prediction.factor_scores,
            "model_outputs": prediction.model_outputs,
            "created_at": prediction.created_at.isoformat() if prediction.created_at else None,
        }

    await cache.set(f"analysis:{event_id}", data, ttl=600)
    return data


@router.get("/{event_id}/news")
async def get_event_news(
    event_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    cached = await cache.get(f"news:{event_id}")
    if cached:
        return cached

    result = await db.execute(
        select(NewsArticle)
        .where(NewsArticle.event_id == event_id)
        .order_by(NewsArticle.published_at.desc())
        .limit(20)
    )
    articles = result.scalars().all()
    data = [
        {
            "id": a.id,
            "source": a.source,
            "title": a.title,
            "url": a.url,
            "sentiment": a.sentiment,
            "sentiment_score": float(a.sentiment_score) if a.sentiment_score else None,
            "published_at": a.published_at.isoformat() if a.published_at else None,
        }
        for a in articles
    ]
    await cache.set(f"news:{event_id}", data, ttl=900)
    return data


@router.post("/{event_id}/regenerate")
async def regenerate_analysis(
    event_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await cache.delete(f"analysis:{event_id}")
    prediction = await run_prediction_pipeline(db, event_id, current_user.id)
    return {
        "message": "Analysis regenerated",
        "prediction_id": prediction.id,
    }
