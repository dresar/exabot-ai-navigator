import time
import uuid
import structlog
from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.redis_client import cache

logger = structlog.get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start = time.perf_counter()

        request.state.request_id = request_id
        log = logger.bind(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        try:
            response: Response = await call_next(request)
            elapsed = (time.perf_counter() - start) * 1000
            log.info(
                "request_complete",
                status_code=response.status_code,
                elapsed_ms=round(elapsed, 2),
            )
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            log.error("request_error", error=str(exc), elapsed_ms=round(elapsed, 2))
            raise


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding window rate limit per IP (in-process cache; no Redis)."""

    LIMIT = settings.RATE_LIMIT_PER_MINUTE
    WINDOW = 60  # seconds

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks & docs
        p = request.url.path
        if p in ("/", "/health", "/docs", "/redoc", "/openapi.json") or p.startswith("/docs"):
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{ip}"

        try:
            count = await cache.incr(key, ttl=self.WINDOW)
            if count > self.LIMIT:
                return Response(
                    content='{"detail":"Rate limit exceeded. Try again later."}',
                    status_code=429,
                    media_type="application/json",
                )
        except Exception:
            pass  # If rate-limit store fails, allow request

        return await call_next(request)


def setup_cors(app) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
