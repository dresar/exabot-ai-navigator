from typing import Optional, Set
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import MarketEvent, User, UserWatchlist
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError, ConflictError
from app.redis_client import cache
from app.modules.markets.schemas import MarketEventOut, MarketListResponse, MarketCategoriesResponse

router = APIRouter(prefix="/markets", tags=["Markets"])

SORT_WHITELIST: Set[str] = {
    "volume_usd",
    "yes_price",
    "no_price",
    "change_24h",
    "created_at",
    "name",
    "category",
}


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

    safe_sort = sort_by if sort_by in SORT_WHITELIST else "volume_usd"
    sort_col = getattr(MarketEvent, safe_sort, MarketEvent.volume_usd)

    filters = [MarketEvent.status == "active"]
    if category:
        filters.append(MarketEvent.category == category)
    if search:
        filters.append(
            or_(
                MarketEvent.name.ilike(f"%{search}%"),
                MarketEvent.description.ilike(f"%{search}%"),
            )
        )

    count_stmt = select(func.count()).select_from(MarketEvent).where(*filters)
    total = (await db.execute(count_stmt)).scalar_one()

    query = select(MarketEvent).where(*filters)
    if order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

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


@router.get("/categories", response_model=MarketCategoriesResponse)
async def list_market_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Distinct `category` values for active events (for tab filters)."""
    stmt = (
        select(MarketEvent.category)
        .where(MarketEvent.status == "active")
        .distinct()
        .order_by(MarketEvent.category.asc())
    )
    result = await db.execute(stmt)
    items = [row[0] for row in result.all() if row[0]]
    return MarketCategoriesResponse(items=items)


@router.post("/{market_id}/watch", status_code=status.HTTP_201_CREATED)
async def add_watch(
    market_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    m = await db.execute(select(MarketEvent).where(MarketEvent.id == market_id))
    if not m.scalar_one_or_none():
        raise NotFoundError("Market event not found")

    existing = await db.execute(
        select(UserWatchlist).where(
            UserWatchlist.user_id == current_user.id,
            UserWatchlist.market_event_id == market_id,
        )
    )
    if existing.scalar_one_or_none():
        raise ConflictError("Already in watchlist")

    w = UserWatchlist(user_id=current_user.id, market_event_id=market_id)
    db.add(w)
    await db.commit()
    await db.refresh(w)
    return {"watchlist_id": w.id, "market_id": market_id}


@router.delete("/{market_id}/watch", status_code=status.HTTP_204_NO_CONTENT)
async def remove_watch(
    market_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(UserWatchlist).where(
            UserWatchlist.user_id == current_user.id,
            UserWatchlist.market_event_id == market_id,
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise NotFoundError("Watchlist entry not found")
    await db.delete(row)
    await db.commit()


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
