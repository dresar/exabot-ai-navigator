from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError

from app.core.security import decode_access_token
from app.modules.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])


async def _authenticate_ws(token: str) -> str:
    """Returns user_id or raises on invalid token."""
    try:
        payload = decode_access_token(token)
        return payload["sub"]
    except JWTError:
        return None


@router.websocket("/ws/predictions")
async def ws_predictions(websocket: WebSocket, token: str = Query(...)):
    user_id = await _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return
    await manager.connect(websocket, "predictions")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "predictions")


@router.websocket("/ws/market")
async def ws_market(websocket: WebSocket, token: str = Query(...)):
    user_id = await _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return
    await manager.connect(websocket, "market")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "market")


@router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket, token: str = Query(...)):
    user_id = await _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return
    await manager.connect(websocket, "notifications")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "notifications")


@router.websocket("/ws/training/{session_id}")
async def ws_training(session_id: str, websocket: WebSocket, token: str = Query(...)):
    user_id = await _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return
    channel = f"training:{session_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)


@router.websocket("/ws/system")
async def ws_system(websocket: WebSocket, token: str = Query(...)):
    user_id = await _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001)
        return
    await manager.connect(websocket, "system")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "system")
