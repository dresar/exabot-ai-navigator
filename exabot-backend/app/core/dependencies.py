from typing import AsyncGenerator, Optional
from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedError
from app.redis_client import cache


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub", "")
    except JWTError:
        raise UnauthorizedError("Invalid or expired token")

    # Try cache first
    cached = await cache.get(f"user:{user_id}:profile")
    if cached:
        user = User(**{k: v for k, v in cached.items() if k in User.__mapper__.attrs.keys()})
        return user

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedError("User not found or inactive")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise UnauthorizedError("Inactive user")
    return current_user
