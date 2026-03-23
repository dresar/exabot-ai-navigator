from typing import Any, AsyncGenerator, Dict, Tuple
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# libpq / JDBC-style query flags often present in hosted Postgres URLs; asyncpg.connect() rejects unknown kwargs.
_LIBPQ_QUERY_KEYS_DROP = frozenset(
    {
        "channel_binding",  # SCRAM option (libpq 16+); asyncpg: TypeError unexpected keyword
        "target_session_attrs",  # libpq only
    }
)


def _normalize_asyncpg_url(url: str) -> Tuple[str, Dict[str, Any]]:
    """
    asyncpg does not accept libpq-only query params (e.g. sslmode, channel_binding).
    Map sslmode to connect_args['ssl'] and drop the rest.
    """
    parsed = urlparse(url)
    if not parsed.query:
        return url, {}

    pairs = parse_qsl(parsed.query, keep_blank_values=True)
    connect_args: Dict[str, Any] = {}
    new_pairs = []
    for key, value in pairs:
        kl = key.lower()
        if kl == "sslmode":
            if value in ("require", "verify-ca", "verify-full", "prefer"):
                connect_args["ssl"] = True
            elif value == "disable":
                connect_args["ssl"] = False
        elif kl in _LIBPQ_QUERY_KEYS_DROP:
            continue
        else:
            new_pairs.append((key, value))

    new_query = urlencode(new_pairs)
    clean = urlunparse(parsed._replace(query=new_query))
    return clean, connect_args


_db_url, _asyncpg_connect_args = _normalize_asyncpg_url(settings.DATABASE_URL)

engine = create_async_engine(
    _db_url,
    echo=settings.DEBUG,
    connect_args=_asyncpg_connect_args,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Optional: create tables via SQLAlchemy (dev quickstart). Prefer Alembic migrations."""
    if settings.is_production:
        return
    async with engine.begin() as conn:
        from app import models  # noqa: F401 — triggers model registration
        await conn.run_sync(Base.metadata.create_all)
