"""Dashboard statistics aggregation."""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Prediction, PerformanceSnapshot
from app.core.dependencies import get_current_active_user
from app.redis_client import cache

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/summary")
async def stats_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"stats:summary:{current_user.id}"
    cached = await cache.get(cache_key)
    if cached:
        return cached

    pred_q = await db.execute(
        select(
            func.count(Prediction.id),
            func.avg(Prediction.ai_probability),
            func.avg(Prediction.confidence),
        ).where(Prediction.user_id == current_user.id)
    )
    row = pred_q.one()
    total = row[0] or 0
    avg_ai = float(row[1] or 0)
    avg_conf = float(row[2] or 0)

    resolved = await db.execute(
        select(func.count(Prediction.id)).where(
            Prediction.user_id == current_user.id,
            Prediction.result.isnot(None),
        )
    )
    resolved_n = resolved.scalar_one() or 0

    correct = await db.execute(
        select(func.count(Prediction.id)).where(
            Prediction.user_id == current_user.id,
            Prediction.result == True,
        )
    )
    wins = correct.scalar_one() or 0

    win_rate = round(wins / resolved_n * 100, 2) if resolved_n else 0.0

    data = {
        "total_predictions": total,
        "resolved_predictions": resolved_n,
        "win_rate": win_rate,
        "avg_ai_probability": round(avg_ai, 2),
        "avg_confidence": round(avg_conf, 2),
    }
    await cache.set(cache_key, data, ttl=60)
    return data


def _period_days(period: str) -> int:
    mapping = {"1m": 30, "3m": 90, "6m": 180, "9m": 270, "1y": 365, "2y": 730}
    return mapping.get(period, 90)


@router.get("/performance")
async def stats_performance(
    period: str = Query("9m", description="1m|3m|6m|9m|1y|2y"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    days = _period_days(period)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    since_date = since.date()
    result = await db.execute(
        select(PerformanceSnapshot)
        .where(
            PerformanceSnapshot.user_id == current_user.id,
            PerformanceSnapshot.snapshot_date >= since_date,
        )
        .order_by(PerformanceSnapshot.snapshot_date.asc())
    )
    rows = result.scalars().all()
    series: List[Dict[str, Any]] = [
        {
            "date": r.snapshot_date.isoformat(),
            "ai_accuracy": float(r.ai_accuracy) if r.ai_accuracy is not None else None,
            "win_rate": float(r.win_rate) if r.win_rate is not None else None,
            "total_predictions": r.total_predictions,
            "market_baseline": float(r.market_baseline) if r.market_baseline is not None else None,
        }
        for r in rows
    ]
    return {"period": period, "days": days, "series": series}


@router.get("/weekly")
async def stats_weekly(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Last 7 days aggregate."""
    since = datetime.now(timezone.utc) - timedelta(days=7)
    q = await db.execute(
        select(func.count(Prediction.id), func.avg(Prediction.ai_probability)).where(
            Prediction.user_id == current_user.id,
            Prediction.created_at >= since,
        )
    )
    cnt, avg_p = q.one()
    return {
        "week_predictions": cnt or 0,
        "avg_ai_probability": round(float(avg_p or 0), 2),
    }
