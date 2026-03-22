import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.config import settings

_redis_pool: Optional[aioredis.Redis] = None


def get_redis_pool() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _redis_pool


async def get_redis() -> aioredis.Redis:
    return get_redis_pool()


class RedisCache:
    """Thin async wrapper for JSON-serialized caching."""

    def __init__(self):
        self._r: Optional[aioredis.Redis] = None

    @property
    def r(self) -> aioredis.Redis:
        if self._r is None:
            self._r = get_redis_pool()
        return self._r

    async def get(self, key: str) -> Optional[Any]:
        raw = await self.r.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return raw

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        serialized = json.dumps(value, default=str)
        await self.r.setex(key, ttl, serialized)

    async def delete(self, key: str) -> None:
        await self.r.delete(key)

    async def delete_pattern(self, pattern: str) -> None:
        keys = await self.r.keys(pattern)
        if keys:
            await self.r.delete(*keys)

    async def publish(self, channel: str, message: Any) -> None:
        await self.r.publish(channel, json.dumps(message, default=str))

    async def incr(self, key: str, ttl: Optional[int] = None) -> int:
        val = await self.r.incr(key)
        if ttl and val == 1:
            await self.r.expire(key, ttl)
        return val


cache = RedisCache()
