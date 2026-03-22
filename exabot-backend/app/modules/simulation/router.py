from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, SimulationAccount, SimulationTrade, MarketEvent, Prediction
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError, BadRequestError
from app.modules.simulation.schemas import (
    SimulationAccountOut, TradeRequest, SimulationTradeOut, SimulationHistoryResponse,
)

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.get("/account", response_model=SimulationAccountOut)
async def get_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SimulationAccount).where(SimulationAccount.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise NotFoundError("Simulation account not found")

    total = account.wins + account.losses
    win_rate = round(account.wins / total * 100, 1) if total > 0 else 0.0

    out = SimulationAccountOut.model_validate(account)
    out.win_rate = win_rate
    return out


@router.get("/history", response_model=SimulationHistoryResponse)
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    account_result = await db.execute(
        select(SimulationAccount).where(SimulationAccount.user_id == current_user.id)
    )
    account = account_result.scalar_one_or_none()
    if not account:
        raise NotFoundError("Simulation account not found")

    query = select(SimulationTrade).where(SimulationTrade.account_id == account.id).order_by(SimulationTrade.created_at.desc())
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    items = result.scalars().all()

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("/trade", response_model=SimulationTradeOut, status_code=201)
async def place_trade(
    body: TradeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if body.position not in ("YES", "NO"):
        raise BadRequestError("Position must be YES or NO")
    if body.amount <= 0:
        raise BadRequestError("Amount must be positive")

    account_result = await db.execute(
        select(SimulationAccount).where(SimulationAccount.user_id == current_user.id)
    )
    account = account_result.scalar_one_or_none()
    if not account:
        raise NotFoundError("Simulation account not found")

    if float(account.balance) < body.amount:
        raise BadRequestError("Insufficient simulation balance")

    # Get market event
    event_result = await db.execute(select(MarketEvent).where(MarketEvent.id == body.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise NotFoundError("Market event not found")

    # Get latest AI prediction
    pred_result = await db.execute(
        select(Prediction)
        .where(Prediction.event_id == body.event_id)
        .order_by(Prediction.created_at.desc())
        .limit(1)
    )
    latest_pred = pred_result.scalar_one_or_none()

    entry_price = float(event.yes_price) if body.position == "YES" else float(event.no_price)

    trade = SimulationTrade(
        account_id=account.id,
        event_id=body.event_id,
        position=body.position,
        amount=body.amount,
        ai_probability=float(latest_pred.ai_probability) if latest_pred else None,
        entry_price=entry_price,
    )
    db.add(trade)

    # Deduct balance
    account.balance = float(account.balance) - body.amount
    db.add(account)

    await db.commit()
    await db.refresh(trade)
    return trade


@router.post("/reset", status_code=204)
async def reset_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    account_result = await db.execute(
        select(SimulationAccount).where(SimulationAccount.user_id == current_user.id)
    )
    account = account_result.scalar_one_or_none()
    if not account:
        raise NotFoundError("Simulation account not found")

    account.balance = float(account.initial_balance)
    account.total_profit = 0
    account.wins = 0
    account.losses = 0
    db.add(account)

    # Delete all trades
    trades_result = await db.execute(
        select(SimulationTrade).where(SimulationTrade.account_id == account.id)
    )
    for trade in trades_result.scalars().all():
        await db.delete(trade)

    await db.commit()
