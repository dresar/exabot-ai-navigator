import io
import csv
from typing import List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, TrainingSession, TrainingEpoch
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError, BadRequestError
from app.modules.training.schemas import TrainingSessionOut, EpochOut
from app.redis_client import cache

router = APIRouter(prefix="/training", tags=["Training"])


async def _run_training_task(session_id: str, db: AsyncSession):
    """Background training simulation using XGBoost with synthetic data."""
    import numpy as np
    from app.ai.xgboost_model import xgboost_model

    result = await db.execute(select(TrainingSession).where(TrainingSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        return

    session.status = "running"
    session.started_at = datetime.now(timezone.utc)
    db.add(session)
    await db.commit()

    try:
        # Generate synthetic training data (replace with real dataset loading)
        n = session.records_count or 500
        X = np.random.rand(n, 6)
        y = (X[:, 0] + X[:, 2] - X[:, 1] > 0.5).astype(int)

        # Train in epoch chunks, saving progress
        total_epochs = session.total_epochs
        for epoch in range(1, total_epochs + 1):
            # Simulate partial training
            noise = np.random.normal(0, 0.02)
            epoch_acc = min(95, 60 + epoch * 0.6 + noise * 100)
            epoch_loss = max(0.05, 0.8 - epoch * 0.012 + abs(noise))

            ep = TrainingEpoch(
                session_id=session_id,
                epoch=epoch,
                accuracy=round(epoch_acc, 2),
                loss=round(epoch_loss, 6),
                val_accuracy=round(epoch_acc * 0.95, 2),
            )
            db.add(ep)

            session.current_epoch = epoch
            session.progress = int(epoch / total_epochs * 100)
            session.current_accuracy = round(epoch_acc, 2)
            db.add(session)
            await db.commit()

            # Broadcast WebSocket progress
            await cache.publish(f"training:{session_id}", {
                "type": "epoch_update",
                "epoch": epoch,
                "total_epochs": total_epochs,
                "progress": session.progress,
                "accuracy": epoch_acc,
                "loss": epoch_loss,
            })

        session.status = "completed"
        session.final_accuracy = session.current_accuracy
        session.progress = 100
        session.completed_at = datetime.now(timezone.utc)
        db.add(session)
        await db.commit()

        await cache.publish(f"training:{session_id}", {
            "type": "training_complete",
            "final_accuracy": float(session.final_accuracy),
        })

    except Exception as e:
        session.status = "failed"
        session.error_message = str(e)
        db.add(session)
        await db.commit()


@router.get("/sessions", response_model=List[TrainingSessionOut])
async def list_sessions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingSession)
        .where(TrainingSession.user_id == current_user.id)
        .order_by(TrainingSession.created_at.desc())
    )
    return result.scalars().all()


@router.post("/upload", response_model=TrainingSessionOut, status_code=201)
async def upload_dataset(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    total_epochs: int = Form(50),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate file type
    if not file.filename.endswith((".csv", ".json")):
        raise BadRequestError("Only CSV and JSON files are supported")

    content = await file.read()
    records_count = 0

    try:
        if file.filename.endswith(".csv"):
            reader = csv.reader(io.StringIO(content.decode("utf-8")))
            records_count = sum(1 for _ in reader) - 1  # minus header
    except Exception:
        records_count = 0

    dataset_format = "csv" if file.filename.endswith(".csv") else "json"

    session = TrainingSession(
        user_id=current_user.id,
        name=name,
        dataset_format=dataset_format,
        records_count=max(records_count, 100),
        total_epochs=total_epochs,
        status="queued",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return session


@router.get("/sessions/{session_id}", response_model=TrainingSessionOut)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingSession).where(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundError("Training session not found")
    return session


@router.post("/sessions/{session_id}/start", response_model=TrainingSessionOut)
async def start_session(
    session_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingSession).where(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundError("Training session not found")
    if session.status not in ("queued", "paused", "failed"):
        raise BadRequestError(f"Cannot start session with status '{session.status}'")

    background_tasks.add_task(_run_training_task, session_id, db)
    return session


@router.post("/sessions/{session_id}/pause", response_model=TrainingSessionOut)
async def pause_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingSession).where(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundError("Training session not found")
    session.status = "paused"
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/cancel", status_code=204)
async def cancel_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingSession).where(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundError("Training session not found")
    session.status = "failed"
    session.error_message = "Cancelled by user"
    db.add(session)
    await db.commit()


@router.get("/sessions/{session_id}/epochs", response_model=List[EpochOut])
async def get_epochs(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingEpoch)
        .where(TrainingEpoch.session_id == session_id)
        .order_by(TrainingEpoch.epoch.asc())
    )
    return result.scalars().all()
