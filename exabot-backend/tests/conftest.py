"""Set required env vars before `app` is imported (pydantic-settings reads .env)."""
import os

from cryptography.fernet import Fernet

# Force minimal valid values so tests run without a local .env (override with PYTEST_* if needed).
if not os.environ.get("EXABOT_TEST_SKIP_ENV"):
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://test:test@127.0.0.1:5432/exabot_test"
    os.environ["SECRET_KEY"] = "x" * 64
    os.environ["ENCRYPTION_KEY"] = Fernet.generate_key().decode()
