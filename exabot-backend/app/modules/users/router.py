from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserSettings
from app.core.dependencies import get_current_active_user
from app.core.security import verify_password, hash_password
from app.core.exceptions import BadRequestError, NotFoundError
from app.modules.users.schemas import (
    UserOut, UserUpdateRequest, PasswordChangeRequest,
    UserSettingsOut, UserSettingsUpdate,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserOut)
async def update_me(
    body: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if body.username:
        current_user.username = body.username
    if body.email:
        current_user.email = body.email
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put("/me/password", status_code=204)
async def change_password(
    body: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise BadRequestError("Current password is incorrect")
    if len(body.new_password) < 8:
        raise BadRequestError("New password must be at least 8 characters")
    current_user.password_hash = hash_password(body.new_password)
    db.add(current_user)
    await db.commit()


@router.get("/me/settings", response_model=UserSettingsOut)
async def get_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    s = result.scalar_one_or_none()
    if not s:
        raise NotFoundError("Settings not found")
    return s


@router.put("/me/settings", response_model=UserSettingsOut)
async def update_settings(
    body: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    s = result.scalar_one_or_none()
    if not s:
        s = UserSettings(user_id=current_user.id)
        db.add(s)

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(s, field, value)

    await db.commit()
    await db.refresh(s)
    return s
