from typing import Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Prediction
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.redis_client import cache
from app.modules.predictions import service
from app.modules.predictions.schemas import (
    PredictionOut, PredictionListResponse, AnalyzeRequest,
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("", response_model=PredictionListResponse)
async def list_predictions(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Prediction).where(Prediction.user_id == current_user.id)
    if status:
        query = query.where(Prediction.status == status)
    query = query.order_by(Prediction.created_at.desc())

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    items = result.scalars().all()

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/live", response_model=list)
async def live_predictions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    cached = await cache.get("predictions:live")
    if cached:
        return cached

    result = await db.execute(
        select(Prediction)
        .where(Prediction.status == "pending")
        .order_by(Prediction.created_at.desc())
        .limit(20)
    )
    items = result.scalars().all()
    data = [PredictionOut.model_validate(i).model_dump(mode="json") for i in items]
    await cache.set("predictions:live", data, ttl=120)
    return data


@router.get("/{prediction_id}", response_model=PredictionOut)
async def get_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Prediction).where(Prediction.id == prediction_id))
    pred = result.scalar_one_or_none()
    if not pred:
        raise NotFoundError("Prediction not found")
    return pred


@router.post("/analyze", response_model=PredictionOut, status_code=201)
async def analyze_event(
    body: AnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger the full AI pipeline for an event and return the prediction."""
    prediction = await service.run_prediction_pipeline(db, body.event_id, current_user.id)
    return prediction
