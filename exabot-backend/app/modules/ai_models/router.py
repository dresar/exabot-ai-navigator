from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, AiModel
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.modules.ai_models.schemas import AiModelCreate, AiModelUpdate, AiModelOut

router = APIRouter(prefix="/models", tags=["AI Models"])


@router.get("", response_model=List[AiModelOut])
async def list_models(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AiModel).order_by(AiModel.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=AiModelOut, status_code=201)
async def create_model(
    body: AiModelCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    m = AiModel(
        name=body.name,
        model_type=body.model_type,
        description=body.description,
        version=body.version,
        weight=body.weight,
        config=body.config,
    )
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m


@router.get("/{model_id}", response_model=AiModelOut)
async def get_model(
    model_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AiModel).where(AiModel.id == model_id))
    m = result.scalar_one_or_none()
    if not m:
        raise NotFoundError("Model not found")
    return m


@router.patch("/{model_id}", response_model=AiModelOut)
async def patch_model(
    model_id: str,
    body: AiModelUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AiModel).where(AiModel.id == model_id))
    m = result.scalar_one_or_none()
    if not m:
        raise NotFoundError("Model not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(m, k, v)
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m


@router.delete("/{model_id}", status_code=204)
async def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AiModel).where(AiModel.id == model_id))
    m = result.scalar_one_or_none()
    if not m:
        raise NotFoundError("Model not found")
    await db.delete(m)
    await db.commit()
