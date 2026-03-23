from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import User, RiskSettings, CategoryAllocation
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.modules.risk.schemas import RiskSettingsOut, RiskSettingsUpdate

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/settings", response_model=RiskSettingsOut)
async def get_risk_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RiskSettings)
        .options(selectinload(RiskSettings.category_allocations))
        .where(RiskSettings.user_id == current_user.id)
    )
    rs = result.scalar_one_or_none()
    if not rs:
        raise NotFoundError("Risk settings not found")

    allocations = [
        {"category": c.category, "allocation": c.allocation}
        for c in (rs.category_allocations or [])
    ]
    return RiskSettingsOut(
        id=rs.id,
        max_daily_loss=float(rs.max_daily_loss),
        max_bet_per_event=float(rs.max_bet_per_event),
        min_confidence=rs.min_confidence,
        max_drawdown=rs.max_drawdown,
        stop_loss_enabled=rs.stop_loss_enabled,
        risk_notifications=rs.risk_notifications,
        conservative_mode=rs.conservative_mode,
        anti_martingale=rs.anti_martingale,
        drawdown_protection=rs.drawdown_protection,
        correlation_limit=rs.correlation_limit,
        category_allocations=allocations,
    )


@router.put("/settings", response_model=RiskSettingsOut)
async def update_risk_settings(
    body: RiskSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RiskSettings)
        .options(selectinload(RiskSettings.category_allocations))
        .where(RiskSettings.user_id == current_user.id)
    )
    rs = result.scalar_one_or_none()
    if not rs:
        rs = RiskSettings(user_id=current_user.id)
        db.add(rs)
        await db.flush()

    data = body.model_dump(exclude_none=True)
    cats = data.pop("category_allocations", None)

    for k, v in data.items():
        setattr(rs, k, v)

    if cats is not None:
        for c in list(rs.category_allocations or []):
            await db.delete(c)
        for item in cats:
            d = item.model_dump() if hasattr(item, "model_dump") else item
            db.add(
                CategoryAllocation(
                    risk_settings_id=rs.id,
                    category=d["category"],
                    allocation=d["allocation"],
                )
            )

    db.add(rs)
    await db.commit()

    result = await db.execute(
        select(RiskSettings)
        .options(selectinload(RiskSettings.category_allocations))
        .where(RiskSettings.id == rs.id)
    )
    rs = result.scalar_one()
    allocations = [
        {"category": c.category, "allocation": c.allocation}
        for c in (rs.category_allocations or [])
    ]
    return RiskSettingsOut(
        id=rs.id,
        max_daily_loss=float(rs.max_daily_loss),
        max_bet_per_event=float(rs.max_bet_per_event),
        min_confidence=rs.min_confidence,
        max_drawdown=rs.max_drawdown,
        stop_loss_enabled=rs.stop_loss_enabled,
        risk_notifications=rs.risk_notifications,
        conservative_mode=rs.conservative_mode,
        anti_martingale=rs.anti_martingale,
        drawdown_protection=rs.drawdown_protection,
        correlation_limit=rs.correlation_limit,
        category_allocations=allocations,
    )
