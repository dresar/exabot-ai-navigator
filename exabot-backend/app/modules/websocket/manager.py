"""
WebSocket connection manager — in-process broadcast to subscribed channels.
"""
import json
import logging
from typing import Dict, List

from fastapi import WebSocket

logger = logging.getLogger("exabot.ws")


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


manager = ConnectionManager()
