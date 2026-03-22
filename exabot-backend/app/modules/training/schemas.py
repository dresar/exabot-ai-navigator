from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class TrainingSessionOut(BaseModel):
    id: str
    name: str
    dataset_format: str
    records_count: Optional[int] = None
    status: str
    progress: int
    total_epochs: int
    current_epoch: int
    current_accuracy: Optional[Decimal] = None
    final_accuracy: Optional[Decimal] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EpochOut(BaseModel):
    epoch: int
    accuracy: Optional[Decimal] = None
    loss: Optional[Decimal] = None
    val_accuracy: Optional[Decimal] = None
    created_at: datetime

    model_config = {"from_attributes": True}
