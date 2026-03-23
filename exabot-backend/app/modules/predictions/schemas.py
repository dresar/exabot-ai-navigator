from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class PredictionOut(BaseModel):
    id: str
    event_id: str
    event_name: Optional[str] = None
    category: Optional[str] = None
    ai_probability: Decimal
    market_probability: Decimal
    confidence: Decimal
    ai_edge: Optional[Decimal] = None
    status: str
    result: Optional[bool] = None
    reasoning: Optional[str] = None
    sentiment_data: Optional[Dict[str, Any]] = None
    factor_scores: Optional[Dict[str, Any]] = None
    model_outputs: Optional[Dict[str, Any]] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PredictionListResponse(BaseModel):
    items: List[PredictionOut]
    total: int
    page: int
    limit: int


class AnalyzeRequest(BaseModel):
    event_id: str
