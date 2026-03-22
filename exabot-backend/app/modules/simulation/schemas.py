from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class SimulationAccountOut(BaseModel):
    id: str
    balance: Decimal
    initial_balance: Decimal
    total_profit: Decimal
    wins: int
    losses: int
    win_rate: float = 0.0
    created_at: datetime

    model_config = {"from_attributes": True}


class TradeRequest(BaseModel):
    event_id: str
    position: str  # YES | NO
    amount: float


class SimulationTradeOut(BaseModel):
    id: str
    event_id: Optional[str] = None
    position: str
    amount: Decimal
    ai_probability: Optional[Decimal] = None
    entry_price: Optional[Decimal] = None
    result: str
    profit: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class SimulationHistoryResponse(BaseModel):
    items: List[SimulationTradeOut]
    total: int
    page: int
    limit: int
