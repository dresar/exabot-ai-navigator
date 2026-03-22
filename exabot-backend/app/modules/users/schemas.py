from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    email: str
    username: str
    plan: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class UserSettingsOut(BaseModel):
    theme: str
    language: str
    density: str
    animations_enabled: bool
    auto_refresh: bool
    push_notifications: bool
    debug_mode: bool
    two_factor_enabled: bool

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    density: Optional[str] = None
    animations_enabled: Optional[bool] = None
    auto_refresh: Optional[bool] = None
    push_notifications: Optional[bool] = None
    debug_mode: Optional[bool] = None
    two_factor_enabled: Optional[bool] = None
