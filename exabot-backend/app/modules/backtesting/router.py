from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, BacktestJob
from app.core.dependencies import get_current_active_user
from app.core.exceptions import NotFoundError
from app.modules.backtesting.schemas import BacktestRunRequest, BacktestJobOut
from app.modules.backtesting.service import run_backtest

router = APIRouter(prefix="/backtest", tags=["Backtesting"])


async def run_backtest_job_task(job_id: str) -> None:
    from app.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(BacktestJob).where(BacktestJob.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            await run_backtest(db, job)


@router.post("/run", response_model=BacktestJobOut, status_code=201)
async def run(
    body: BacktestRunRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    job = BacktestJob(
        user_id=current_user.id,
        model_id=body.model_id,
        time_range=body.time_range,
        category=body.category,
        status="running",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(run_backtest_job_task, str(job.id))

    return job


@router.get("/history", response_model=list)
async def history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BacktestJob)
        .where(BacktestJob.user_id == current_user.id)
        .order_by(BacktestJob.created_at.desc())
        .limit(20)
    )
    return [BacktestJobOut.model_validate(j).model_dump(mode="json") for j in result.scalars().all()]


@router.get("/{job_id}", response_model=BacktestJobOut)
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BacktestJob).where(BacktestJob.id == job_id, BacktestJob.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise NotFoundError("Backtest job not found")
    return job


@router.get("/{job_id}/status")
async def job_status(
    job_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BacktestJob.status, BacktestJob.accuracy, BacktestJob.brier_score)
        .where(BacktestJob.id == job_id, BacktestJob.user_id == current_user.id)
    )
    row = result.first()
    if not row:
        raise NotFoundError("Backtest job not found")
    return {"status": row[0], "accuracy": row[1], "brier_score": row[2]}
