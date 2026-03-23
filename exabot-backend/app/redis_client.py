"""
In-process async cache (no Redis). Replaces former redis.asyncio usage so the API
runs without a Redis server. Celery/docker may still use REDIS_* for workers.
"""
from __future__ import annotations

import asyncio
import fnmatch
import json
import time
from typing import Any, Dict, Optional, Tuple

class MemoryCache:
    """JSON-friendly cache + rate-limit counter; all state is in-process."""

    def __init__(self) -> None:
        self._data: Dict[str, Tuple[str, float]] = {}  # key -> (json_str, expiry_epoch)
        self._incr: Dict[str, Tuple[int, float]] = {}  # key -> (count, window_end_epoch)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            item = self._data.get(key)
            if item is None:
                return None
            raw, exp = item
            if exp < time.time():
                del self._data[key]
                return None
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return raw

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        serialized = json.dumps(value, default=str)
        async with self._lock:
            self._data[key] = (serialized, time.time() + ttl)

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._data.pop(key, None)

    async def delete_pattern(self, pattern: str) -> None:
        async with self._lock:
            for k in list(self._data.keys()):
                if fnmatch.fnmatch(k, pattern):
                    self._data.pop(k, None)

    async def publish(self, channel: str, message: Any) -> None:
        """Deprecated: use app.modules.websocket.manager.manager.broadcast instead."""
        # No-op — live WS fan-out is in-process via ConnectionManager.broadcast.
        return

    async def incr(self, key: str, ttl: Optional[int] = None) -> int:
        window = float(ttl or 60)
        async with self._lock:
            now = time.time()
            if key not in self._incr:
                self._incr[key] = (1, now + window)
                return 1
            count, end = self._incr[key]
            if now >= end:
                self._incr[key] = (1, now + window)
                return 1
            self._incr[key] = (count + 1, end)
            return count + 1


cache = MemoryCache()
