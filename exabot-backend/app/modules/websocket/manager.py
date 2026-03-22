"""
WebSocket connection manager with Redis pub/sub fan-out.
Supports multiple workers broadcasting to all connected clients.
"""
import asyncio
import json
from typing import Dict, List, Set
from fastapi import WebSocket
import redis.asyncio as aioredis
from app.redis_client import get_redis_pool


class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str) -> None:
        await websocket.accept()
        if channel not in self._connections:
            self._connections[channel] = []
        self._connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str) -> None:
        if channel in self._connections:
            try:
                self._connections[channel].remove(websocket)
            except ValueError:
                pass

    async def broadcast(self, channel: str, message: dict) -> None:
        dead = []
        for ws in self._connections.get(channel, []):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, channel)

    async def start_subscriber(self) -> None:
        """Long-running Redis pub/sub listener. Call from startup."""
        r = get_redis_pool()
        pubsub = r.pubsub()

        channels = ["predictions", "market", "notifications", "system"]
        await pubsub.subscribe(*channels)

        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            channel = message["channel"]
            try:
                data = json.loads(message["data"])
                await self.broadcast(channel, data)
            except Exception:
                pass


manager = ConnectionManager()
