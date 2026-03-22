from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import MarketEvent, User
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.redis_client import cache
from app.modules.markets.schemas import MarketEventOut, MarketListResponse

router = APIRouter(prefix="/markets", tags=["Markets"])


@router.get("", response_model=MarketListResponse)
async def list_markets(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("volume_usd"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    cache_key = f"markets:list:{category}:{search}:{sort_by}:{order}:{page}:{limit}"
    cached = await cache.get(cache_key)
    if cached:
        return cached

    query = select(MarketEvent).where(MarketEvent.status == "active")

    if category:
        query = query.where(MarketEvent.category == category)
    if search:
        query = query.where(
            or_(
                MarketEvent.name.ilike(f"%{search}%"),
                MarketEvent.description.ilike(f"%{search}%"),
            )
        )

    # Sorting
    sort_col = getattr(MarketEvent, sort_by, MarketEvent.volume_usd)
    if order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    # Paginate
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    response = {
        "items": [MarketEventOut.model_validate(i).model_dump(mode="json") for i in items],
        "total": total,
        "page": page,
        "limit": limit,
    }
    await cache.set(cache_key, response, ttl=300)
    return response


@router.get("/{market_id}", response_model=MarketEventOut)
async def get_market(
    market_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    cached = await cache.get(f"market:{market_id}")
    if cached:
        return cached

    result = await db.execute(select(MarketEvent).where(MarketEvent.id == market_id))
    market = result.scalar_one_or_none()
    if not market:
        raise NotFoundError("Market event not found")

    data = MarketEventOut.model_validate(market).model_dump(mode="json")
    await cache.set(f"market:{market_id}", data, ttl=300)
    return data
