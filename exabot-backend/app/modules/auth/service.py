from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, RefreshToken, SimulationAccount, UserSettings, RiskSettings
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, hash_token
from app.core.exceptions import ConflictError, UnauthorizedError, BadRequestError, NotFoundError


async def register_user(db: AsyncSession, email: str, username: str, password: str) -> User:
    # Check uniqueness
    existing_email = await db.execute(select(User).where(User.email == email))
    if existing_email.scalar_one_or_none():
        raise ConflictError("Email already registered")

    existing_user = await db.execute(select(User).where(User.username == username))
    if existing_user.scalar_one_or_none():
        raise ConflictError("Username already taken")

    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
    )
    db.add(user)
    await db.flush()  # get user.id

    # Bootstrap related records
    db.add(SimulationAccount(user_id=user.id))
    db.add(UserSettings(user_id=user.id))
    db.add(RiskSettings(user_id=user.id))

    await db.commit()
    await db.refresh(user)
    return user


async def _issue_session_tokens(db: AsyncSession, user: User) -> tuple[str, str]:
    access_token = create_access_token(str(user.id))
    raw_refresh, hashed_refresh = create_refresh_token()
    token = RefreshToken(
        user_id=user.id,
        token_hash=hashed_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(token)
    await db.commit()
    return access_token, raw_refresh


async def login_user(db: AsyncSession, email: str, password: str) -> tuple[str, str]:
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")
    return await _issue_session_tokens(db, user)


async def dev_quick_login(db: AsyncSession, email: str) -> tuple[str, str]:
    """Development only: JWT for existing user (same DB row as normal login)."""
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError(
            "User dev tidak ada di database. Pastikan migrasi sudah jalan dan API sudah auto-seed, "
            "atau jalankan: npm run db:setup"
        )
    return await _issue_session_tokens(db, user)


async def ensure_dev_user_if_configured(db: AsyncSession) -> None:
    """Create default dev user if missing (non-production only)."""
    from app.config import settings

    if not settings.auto_seed_dev_user_allowed:
        return
    email = settings.DEV_SEED_EMAIL.strip()
    username = settings.DEV_SEED_USERNAME.strip()
    password = settings.DEV_SEED_PASSWORD
    if len(password) < 8:
        return
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        return
    try:
        await register_user(db, email, username, password)
    except ConflictError:
        pass


async def refresh_access_token(db: AsyncSession, raw_refresh: str) -> str:
    hashed = hash_token(raw_refresh)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hashed)
    )
    token = result.scalar_one_or_none()
    if not token:
        raise UnauthorizedError("Invalid refresh token")
    if token.expires_at < datetime.now(timezone.utc):
        await db.delete(token)
        await db.commit()
        raise UnauthorizedError("Refresh token expired")

    access_token = create_access_token(str(token.user_id))
    return access_token


async def logout_user(db: AsyncSession, raw_refresh: str) -> None:
    hashed = hash_token(raw_refresh)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hashed)
    )
    token = result.scalar_one_or_none()
    if token:
        await db.delete(token)
        await db.commit()
