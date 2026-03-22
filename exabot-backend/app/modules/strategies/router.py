from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Strategy, StrategyCondition
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.modules.strategies.schemas import StrategyCreate, StrategyUpdate, StrategyOut

router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.get("", response_model=List[StrategyOut])
async def list_strategies(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Strategy)
        .options(selectinload(Strategy.conditions))
        .where(Strategy.user_id == current_user.id)
        .order_by(Strategy.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=StrategyOut, status_code=201)
async def create_strategy(
    body: StrategyCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    strategy = Strategy(
        user_id=current_user.id,
        name=body.name,
        description=body.description,
    )
    db.add(strategy)
    await db.flush()

    for c in body.conditions:
        db.add(StrategyCondition(
            strategy_id=strategy.id,
            parameter=c.parameter,
            operator=c.operator,
            threshold_value=c.threshold_value,
            action=c.action,
            order_index=c.order_index,
        ))

    await db.commit()

    result = await db.execute(
        select(Strategy).options(selectinload(Strategy.conditions)).where(Strategy.id == strategy.id)
    )
    return result.scalar_one()


@router.get("/{strategy_id}", response_model=StrategyOut)
async def get_strategy(
    strategy_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Strategy)
        .options(selectinload(Strategy.conditions))
        .where(Strategy.id == strategy_id, Strategy.user_id == current_user.id)
    )
    s = result.scalar_one_or_none()
    if not s:
        raise NotFoundError("Strategy not found")
    return s


@router.put("/{strategy_id}", response_model=StrategyOut)
async def update_strategy(
    strategy_id: str,
    body: StrategyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Strategy).where(Strategy.id == strategy_id, Strategy.user_id == current_user.id)
    )
    strategy = result.scalar_one_or_none()
    if not strategy:
        raise NotFoundError("Strategy not found")

    if body.name is not None:
        strategy.name = body.name
    if body.description is not None:
        strategy.description = body.description
    if body.is_active is not None:
        strategy.is_active = body.is_active

    if body.conditions is not None:
        # Replace all conditions
        cond_result = await db.execute(
            select(StrategyCondition).where(StrategyCondition.strategy_id == strategy_id)
        )
        for c in cond_result.scalars().all():
            await db.delete(c)
        for c in body.conditions:
            db.add(StrategyCondition(
                strategy_id=strategy_id,
                parameter=c.parameter,
                operator=c.operator,
                threshold_value=c.threshold_value,
                action=c.action,
                order_index=c.order_index,
            ))

    db.add(strategy)
    await db.commit()

    result = await db.execute(
        select(Strategy).options(selectinload(Strategy.conditions)).where(Strategy.id == strategy_id)
    )
    return result.scalar_one()


@router.delete("/{strategy_id}", status_code=204)
async def delete_strategy(
    strategy_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Strategy).where(Strategy.id == strategy_id, Strategy.user_id == current_user.id)
    )
    s = result.scalar_one_or_none()
    if not s:
        raise NotFoundError("Strategy not found")
    await db.delete(s)
    await db.commit()


@router.patch("/{strategy_id}/toggle", response_model=StrategyOut)
async def toggle_strategy(
    strategy_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Strategy)
        .options(selectinload(Strategy.conditions))
        .where(Strategy.id == strategy_id, Strategy.user_id == current_user.id)
    )
    s = result.scalar_one_or_none()
    if not s:
        raise NotFoundError("Strategy not found")
    s.is_active = not s.is_active
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s
