from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class ConditionIn(BaseModel):
    parameter: str
    operator: str
    threshold_value: float
    action: str
    order_index: int = 0


class StrategyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    conditions: List[ConditionIn] = []


class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    conditions: Optional[List[ConditionIn]] = None


class ConditionOut(BaseModel):
    id: str
    parameter: str
    operator: str
    threshold_value: Decimal
    action: str
    order_index: int

    model_config = {"from_attributes": True}


class StrategyOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    triggered_count: int
    win_count: int
    loss_count: int
    conditions: List[ConditionOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}
