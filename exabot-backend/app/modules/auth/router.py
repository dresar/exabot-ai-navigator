from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import ForbiddenError
from app.database import get_db
from app.modules.auth import service
from app.modules.auth.schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    RefreshRequest, AccessTokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await service.register_user(db, body.email, body.username, body.password)
    access_token, refresh_token = await service.login_user(db, body.email, body.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    access_token, refresh_token = await service.login_user(db, body.email, body.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/dev-login", response_model=TokenResponse)
async def dev_login(db: AsyncSession = Depends(get_db)):
    """
    Development only: issue JWT for `DEV_QUICK_LOGIN_EMAIL` user in DB (no password).
    Disabled when `ENVIRONMENT=production` or `AUTH_DEV_QUICK_LOGIN=false`.
    """
    if not settings.auth_dev_quick_login_allowed:
        raise ForbiddenError("Dev quick login is disabled")
    access_token, refresh_token = await service.dev_quick_login(
        db, settings.DEV_QUICK_LOGIN_EMAIL.strip()
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    access_token = await service.refresh_access_token(db, body.refresh_token)
    return AccessTokenResponse(access_token=access_token)


@router.post("/logout", status_code=204)
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await service.logout_user(db, body.refresh_token)
