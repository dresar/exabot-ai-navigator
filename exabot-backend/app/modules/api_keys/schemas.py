from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    name: str
    provider: str
    key_value: str
    category: Optional[str] = None
    daily_limit: Optional[int] = None
    rotate_at_threshold: int = 90
    is_auto_rotate: bool = True


class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    daily_limit: Optional[int] = None
    rotate_at_threshold: Optional[int] = None
    is_auto_rotate: Optional[bool] = None
    status: Optional[str] = None


class ApiKeyOut(BaseModel):
    id: str
    name: str
    provider: str
    key_masked: str
    category: Optional[str] = None
    status: str
    usage_count: int
    daily_limit: Optional[int] = None
    daily_usage: int
    rotate_at_threshold: int
    is_auto_rotate: bool
    last_used_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApiKeyTestResult(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None


class RotateRequest(BaseModel):
    """Body for rotating an API key (new secret only)."""

    key_value: str
