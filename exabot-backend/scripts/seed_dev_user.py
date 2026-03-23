"""
Sync dev user password / create user using the same defaults as app.config (exabot-backend/.env).

Usage (from repo root): npm run seed:dev
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


async def main() -> None:
    from sqlalchemy import select

    from app.config import settings
    from app.database import AsyncSessionLocal
    from app.models import User
    from app.modules.auth import service
    from app.core.security import hash_password

    email = settings.DEV_SEED_EMAIL.strip()
    username = settings.DEV_SEED_USERNAME.strip()
    password = settings.DEV_SEED_PASSWORD
    if len(password) < 8:
        print("DEV_SEED_PASSWORD must be at least 8 characters (see app.config / .env).")
        sys.exit(1)

    async with AsyncSessionLocal() as db:
        r = await db.execute(select(User).where(User.email == email))
        user = r.scalar_one_or_none()
        if user:
            user.password_hash = hash_password(password)
            await db.commit()
            print(f"Updated password for: {email}")
        else:
            await service.register_user(db, email, username, password)
            print(f"Created dev user: {email} (username: {username})")


if __name__ == "__main__":
    asyncio.run(main())
