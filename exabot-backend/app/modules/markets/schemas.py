from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class MarketEventOut(BaseModel):
    id: str
    external_id: Optional[str] = None
    name: str
    category: str
    description: Optional[str] = None
    yes_price: Decimal
    no_price: Decimal
    volume_usd: Decimal
    change_24h: Decimal
    is_trending: bool
    status: str
    end_date: Optional[datetime] = None
    source: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MarketListResponse(BaseModel):
    items: List[MarketEventOut]
    total: int
    page: int
    limit: int


class MarketCategoriesResponse(BaseModel):
    """Distinct categories among active market events."""

    items: List[str]
