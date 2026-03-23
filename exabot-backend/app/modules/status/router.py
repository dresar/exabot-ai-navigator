"""System status & health for dashboard."""
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx
from fastapi import APIRouter, Depends

from app.config import settings
from app.core.dependencies import get_current_active_user
from app.models import User
from app.redis_client import cache

router = APIRouter(prefix="/status", tags=["System Status"])


def _cache_status() -> Dict[str, Any]:
    """App cache is in-process (no Redis server)."""
    return {
        "name": "cache",
        "status": "operational",
        "backend": "memory",
        "note": "in-process; no Redis",
    }


async def _ping_db_url() -> Dict[str, Any]:
    """Lightweight DB check via SQLAlchemy."""
    from sqlalchemy import text
    from app.database import AsyncSessionLocal

    start = time.perf_counter()
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        ms = (time.perf_counter() - start) * 1000
        return {"name": "database", "status": "operational", "latency_ms": round(ms, 2)}
    except Exception as e:
        return {"name": "database", "status": "down", "error": str(e)}


@router.get("/services")
async def services_status(current_user: User = Depends(get_current_active_user)):
    cached = await cache.get("status:services")
    if cached:
        return cached

    cache_s = _cache_status()
    db_s = await _ping_db_url()

    ext: List[Dict[str, Any]] = []
    if settings.POLYMARKET_GAMMA_URL:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                t0 = time.perf_counter()
                r = await client.get(f"{settings.POLYMARKET_GAMMA_URL}/markets", params={"limit": 1})
                ms = (time.perf_counter() - t0) * 1000
                ext.append(
                    {
                        "name": "polymarket_gamma",
                        "status": "operational" if r.status_code < 500 else "degraded",
                        "latency_ms": round(ms, 2),
                    }
                )
        except Exception as e:
            ext.append({"name": "polymarket_gamma", "status": "down", "error": str(e)})

    data = {
        "overall": "operational"
        if cache_s["status"] == "operational" and db_s["status"] == "operational"
        else "degraded",
        "services": [cache_s, db_s, *ext],
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    await cache.set("status:services", data, ttl=30)
    return data


@router.get("/incidents")
async def incidents(current_user: User = Depends(get_current_active_user)):
    """Placeholder incident timeline — replace with DB table in production."""
    return {"items": [], "message": "No active incidents"}


@router.get("/uptime")
async def uptime_summary(current_user: User = Depends(get_current_active_user)):
    """Simple uptime placeholder (24h chart can use performance_snapshots)."""
    return {
        "uptime_percent_24h": 99.9,
        "note": "Synthetic; wire to monitoring backend for production",
    }
