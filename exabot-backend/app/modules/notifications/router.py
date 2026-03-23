from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Notification
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.redis_client import cache

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications(
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Notification).where(Notification.user_id == current_user.id)
    if category:
        q = q.where(Notification.category == category)
    q = q.order_by(Notification.created_at.desc()).limit(100)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": n.id,
            "category": n.category,
            "title": n.title,
            "description": n.description,
            "is_read": n.is_read,
            "is_urgent": n.is_urgent,
            "metadata": n.meta_json,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in rows
    ]


@router.patch("/{notif_id}/read", status_code=204)
async def mark_read(
    notif_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notif_id,
            Notification.user_id == current_user.id,
        )
    )
    n = result.scalar_one_or_none()
    if not n:
        raise NotFoundError("Notification not found")
    n.is_read = True
    db.add(n)
    await db.commit()


@router.post("/read-all", status_code=204)
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    await db.commit()


@router.delete("/{notif_id}", status_code=204)
async def delete_notification(
    notif_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notif_id,
            Notification.user_id == current_user.id,
        )
    )
    n = result.scalar_one_or_none()
    if not n:
        raise NotFoundError("Notification not found")
    await db.delete(n)
    await db.commit()
