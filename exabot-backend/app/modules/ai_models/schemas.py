from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AiModelCreate(BaseModel):
    name: str
    model_type: str = Field(..., description="ensemble|sentiment|statistical|temporal|llm")
    description: Optional[str] = None
    version: str = "1.0"
    weight: Decimal = Decimal("0.2")
    config: Optional[Dict[str, Any]] = None


class AiModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None
    weight: Optional[Decimal] = None
    accuracy: Optional[Decimal] = None
    prev_accuracy: Optional[Decimal] = None
    latency_ms: Optional[int] = None
    config: Optional[Dict[str, Any]] = None


class AiModelOut(BaseModel):
    id: str
    name: str
    model_type: str
    description: Optional[str] = None
    version: str
    accuracy: Optional[Decimal] = None
    prev_accuracy: Optional[Decimal] = None
    latency_ms: Optional[int] = None
    is_active: bool
    weight: Decimal
    config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
