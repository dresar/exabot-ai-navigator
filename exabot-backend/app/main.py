"""
ExaBot FastAPI application entrypoint.
REST API under /api/v1; WebSocket endpoints at /ws/* (root).
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import ProgrammingError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import AsyncSessionLocal
from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ServiceUnavailableError,
    UnauthorizedError,
)
from app.core.middleware import (
    RateLimitMiddleware,
    RequestLoggingMiddleware,
    setup_cors,
)
from app.modules.api_keys.service import key_pool_manager
from app.modules.auth import service as auth_service

logger = logging.getLogger("exabot")

# ─── Routers (REST /api/v1) ─────────────────────────────────
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.markets.router import router as markets_router
from app.modules.predictions.router import router as predictions_router
from app.modules.analysis.router import router as analysis_router
from app.modules.api_keys.router import router as api_keys_router
from app.modules.simulation.router import router as simulation_router
from app.modules.backtesting.router import router as backtesting_router
from app.modules.training.router import router as training_router
from app.modules.strategies.router import router as strategies_router
from app.modules.websocket.router import router as websocket_router
from app.modules.stats.router import router as stats_router
from app.modules.ai_models.router import router as ai_models_router
from app.modules.risk.router import router as risk_router
from app.modules.logs.router import router as logs_router
from app.modules.notifications.router import router as notifications_router
from app.modules.status.router import router as status_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev user in DB (non-production) — same row used by POST /auth/dev-login
    try:
        async with AsyncSessionLocal() as db:
            await auth_service.ensure_dev_user_if_configured(db)
    except ProgrammingError as e:
        detail = str(getattr(e, "orig", None) or e)
        if "does not exist" in detail:
            logger.warning(
                "ensure_dev_user_skipped: database tables missing — from repo root run: npm run db:migrate"
            )
        else:
            logger.warning("ensure_dev_user_failed: %s", e)
    except Exception as e:
        logger.warning("ensure_dev_user_failed: %s", e)

    # Sync OpenAI keys from DB into runtime pool
    try:
        async with AsyncSessionLocal() as db:
            await key_pool_manager.sync_openai_keys(db)
    except Exception as e:
        logger.warning("startup_key_sync_failed: %s", e)

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

setup_cors(app)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(stats_router, prefix=API_PREFIX)
app.include_router(markets_router, prefix=API_PREFIX)
app.include_router(predictions_router, prefix=API_PREFIX)
app.include_router(analysis_router, prefix=API_PREFIX)
app.include_router(ai_models_router, prefix=API_PREFIX)
app.include_router(api_keys_router, prefix=API_PREFIX)
app.include_router(simulation_router, prefix=API_PREFIX)
app.include_router(backtesting_router, prefix=API_PREFIX)
app.include_router(training_router, prefix=API_PREFIX)
app.include_router(strategies_router, prefix=API_PREFIX)
app.include_router(risk_router, prefix=API_PREFIX)
app.include_router(logs_router, prefix=API_PREFIX)
app.include_router(notifications_router, prefix=API_PREFIX)
app.include_router(status_router, prefix=API_PREFIX)
app.include_router(websocket_router)


# ─── Exception handlers ─────────────────────────────────────
@app.exception_handler(NotFoundError)
async def not_found_handler(_: Request, exc: NotFoundError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(ConflictError)
async def conflict_handler(_: Request, exc: ConflictError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(UnauthorizedError)
async def unauthorized_handler(_: Request, exc: UnauthorizedError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None) or {},
    )


@app.exception_handler(ForbiddenError)
async def forbidden_handler(_: Request, exc: ForbiddenError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(BadRequestError)
async def bad_request_handler(_: Request, exc: BadRequestError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(ServiceUnavailableError)
async def service_unavailable_handler(_: Request, exc: ServiceUnavailableError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(StarletteHTTPException)
async def starlette_http_handler(_: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api": API_PREFIX,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
