from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, ApiKey
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.core.encryption import decrypt
from app.modules.api_keys import service
from app.modules.api_keys.schemas import (
    ApiKeyCreate,
    ApiKeyUpdate,
    ApiKeyOut,
    ApiKeyTestResult,
    RotateRequest,
)

router = APIRouter(prefix="/keys", tags=["API Keys"])


@router.get("", response_model=List[ApiKeyOut])
async def list_keys(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    keys = await service.get_user_keys(db, current_user.id)
    return keys


@router.post("", response_model=ApiKeyOut, status_code=201)
async def create_key(
    body: ApiKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.create_api_key(
        db,
        user_id=current_user.id,
        name=body.name,
        provider=body.provider,
        key_value=body.key_value,
        category=body.category,
        daily_limit=body.daily_limit,
        rotate_at_threshold=body.rotate_at_threshold,
        is_auto_rotate=body.is_auto_rotate,
    )


@router.get("/{key_id}", response_model=ApiKeyOut)
async def get_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API key not found")
    return key


@router.put("/{key_id}", response_model=ApiKeyOut)
async def update_key(
    key_id: str,
    body: ApiKeyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API key not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(key, field, value)
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return key


@router.delete("/{key_id}", status_code=204)
async def delete_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await service.delete_api_key(db, key_id, current_user.id)


@router.post("/{key_id}/rotate", response_model=ApiKeyOut)
async def rotate_key(
    key_id: str,
    body: RotateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.rotate_api_key(db, key_id, current_user.id, body.key_value)


@router.post("/{key_id}/test", response_model=ApiKeyTestResult)
async def test_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API key not found")

    plain = decrypt(key.key_encrypted)
    if key.provider == "openai":
        return await service.test_openai_key(plain)
    return {"success": True, "message": f"Provider '{key.provider}' test not implemented", "latency_ms": None}
