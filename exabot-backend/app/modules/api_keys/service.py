"""API key vault service + KeyPoolManager."""
import time
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.models import ApiKey
from app.core.encryption import encrypt, decrypt, mask_key
from app.core.exceptions import NotFoundError, BadRequestError
from app.integrations.openai_client import key_pool


class KeyPoolManager:
    """Syncs active DB keys into the runtime OpenAI key pool."""

    async def sync_openai_keys(self, db: AsyncSession) -> None:
        result = await db.execute(
            select(ApiKey).where(
                ApiKey.provider == "openai",
                ApiKey.status == "active",
            )
        )
        keys = result.scalars().all()
        for k in keys:
            try:
                plain = decrypt(k.key_encrypted)
                key_pool.register(plain)
            except Exception:
                pass

    async def get_available_key(
        self, db: AsyncSession, provider: str
    ) -> Optional[ApiKey]:
        """Returns least-used active key for a provider."""
        result = await db.execute(
            select(ApiKey)
            .where(ApiKey.provider == provider, ApiKey.status == "active")
            .order_by(ApiKey.daily_usage.asc())
        )
        return result.scalars().first()

    async def record_usage(self, db: AsyncSession, key_id: str) -> None:
        await db.execute(
            update(ApiKey)
            .where(ApiKey.id == key_id)
            .values(
                usage_count=ApiKey.usage_count + 1,
                daily_usage=ApiKey.daily_usage + 1,
                last_used_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()

    async def check_and_rotate(self, db: AsyncSession) -> int:
        """Mark keys over threshold as 'limit'. Returns count rotated."""
        result = await db.execute(
            select(ApiKey).where(ApiKey.status == "active", ApiKey.daily_limit.isnot(None))
        )
        keys = result.scalars().all()
        rotated = 0
        for k in keys:
            threshold_usage = int(k.daily_limit * k.rotate_at_threshold / 100)
            if k.daily_usage >= threshold_usage:
                k.status = "limit"
                db.add(k)
                rotated += 1
        if rotated:
            await db.commit()
        return rotated

    async def reset_daily_usage(self, db: AsyncSession) -> None:
        """Reset daily usage counters (call at midnight)."""
        await db.execute(
            update(ApiKey)
            .values(daily_usage=0, last_reset_at=datetime.now(timezone.utc))
            .where(ApiKey.status == "limit")
            .values(status="active")
        )
        await db.execute(
            update(ApiKey)
            .values(daily_usage=0, last_reset_at=datetime.now(timezone.utc))
        )
        await db.commit()


key_pool_manager = KeyPoolManager()


async def create_api_key(
    db: AsyncSession,
    user_id: str,
    name: str,
    provider: str,
    key_value: str,
    category: Optional[str],
    daily_limit: Optional[int],
    rotate_at_threshold: int,
    is_auto_rotate: bool,
) -> ApiKey:
    encrypted = encrypt(key_value)
    masked = mask_key(key_value)
    api_key = ApiKey(
        user_id=user_id,
        name=name,
        provider=provider,
        key_encrypted=encrypted,
        key_masked=masked,
        category=category,
        daily_limit=daily_limit,
        rotate_at_threshold=rotate_at_threshold,
        is_auto_rotate=is_auto_rotate,
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    return api_key


async def get_user_keys(db: AsyncSession, user_id: str) -> List[ApiKey]:
    result = await db.execute(select(ApiKey).where(ApiKey.user_id == user_id))
    return result.scalars().all()


async def delete_api_key(db: AsyncSession, key_id: str, user_id: str) -> None:
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API key not found")
    await db.delete(key)
    await db.commit()


async def rotate_api_key(db: AsyncSession, key_id: str, user_id: str, new_key_value: str) -> ApiKey:
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise NotFoundError("API key not found")
    key.key_encrypted = encrypt(new_key_value)
    key.key_masked = mask_key(new_key_value)
    key.status = "active"
    key.daily_usage = 0
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return key


async def test_openai_key(key_value: str) -> dict:
    """Quick validation: call GPT with minimal tokens."""
    import openai
    start = time.perf_counter()
    try:
        client = openai.AsyncOpenAI(api_key=key_value)
        await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=1,
        )
        latency = (time.perf_counter() - start) * 1000
        return {"success": True, "message": "Key is valid", "latency_ms": round(latency, 1)}
    except openai.AuthenticationError:
        return {"success": False, "message": "Invalid API key", "latency_ms": None}
    except Exception as e:
        return {"success": False, "message": str(e), "latency_ms": None}
