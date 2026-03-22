from typing import Dict, List, Optional
from pydantic import BaseModel


class CategoryAllocationIn(BaseModel):
    category: str
    allocation: int


class RiskSettingsUpdate(BaseModel):
    max_daily_loss: Optional[float] = None
    max_bet_per_event: Optional[float] = None
    min_confidence: Optional[int] = None
    max_drawdown: Optional[int] = None
    stop_loss_enabled: Optional[bool] = None
    risk_notifications: Optional[bool] = None
    conservative_mode: Optional[bool] = None
    anti_martingale: Optional[bool] = None
    drawdown_protection: Optional[bool] = None
    correlation_limit: Optional[bool] = None
    category_allocations: Optional[List[CategoryAllocationIn]] = None


class RiskSettingsOut(BaseModel):
    id: str
    max_daily_loss: float
    max_bet_per_event: float
    min_confidence: int
    max_drawdown: int
    stop_loss_enabled: bool
    risk_notifications: bool
    conservative_mode: bool
    anti_martingale: bool
    drawdown_protection: bool
    correlation_limit: bool
    category_allocations: List[CategoryAllocationIn] = []

    model_config = {"from_attributes": True}
