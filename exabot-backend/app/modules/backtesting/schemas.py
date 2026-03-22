from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class BacktestRunRequest(BaseModel):
    time_range: str  # 1m|3m|6m|1y|2y
    model_id: Optional[str] = None
    category: Optional[str] = None


class BacktestJobOut(BaseModel):
    id: str
    time_range: str
    category: Optional[str] = None
    status: str
    accuracy: Optional[Decimal] = None
    total_predictions: Optional[int] = None
    brier_score: Optional[Decimal] = None
    vs_baseline: Optional[Decimal] = None
    results: Optional[Any] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
