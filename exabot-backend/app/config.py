from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str = "ExaBot"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database (must be async — see field validator below)
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def database_url_must_use_async_driver(cls, v: str) -> str:
        v = (v or "").strip()
        if not v.startswith("postgresql+asyncpg://"):
            raise ValueError(
                "DATABASE_URL must use asyncpg for SQLAlchemy async engine. "
                "Use: postgresql+asyncpg://USER:PASS@HOST:5432/DATABASE?ssl=require "
                "Do not use postgresql:// without +asyncpg (that loads psycopg2 and fails with "
                "'The asyncio extension requires an async driver'). "
                "See exabot-backend/.env.example and exabot-backend/DEV_LOGIN.md"
            )
        return v

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ENCRYPTION_KEY: str

    # External APIs
    OPENAI_API_KEY_1: str = ""
    OPENAI_API_KEY_2: str = ""
    POLYMARKET_API_URL: str = "https://clob.polymarket.com"
    POLYMARKET_GAMMA_URL: str = "https://gamma-api.polymarket.com"
    NEWS_API_KEY: str = ""
    COINGECKO_API_KEY: str = ""
    TWITTER_BEARER_TOKEN: str = ""

    # File Storage
    S3_BUCKET_NAME: str = "exabot-datasets"
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_REGION: str = "auto"

    # LLM (OpenAI-compatible gateway, e.g. Apprentice unified API)
    LLM_PROVIDER: str = "unified"  # unified | openai
    LLM_BASE_URL: str = "https://one.apprentice.cyou/api/v1"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080,http://localhost:8083"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Dev-only: single source in this file / exabot-backend/.env (no frontend env for credentials)
    AUTH_DEV_QUICK_LOGIN: bool = True
    AUTO_SEED_DEV_USER_ON_STARTUP: bool = True
    DEV_QUICK_LOGIN_EMAIL: str = "dev@localhost"
    DEV_SEED_EMAIL: str = "dev@localhost"
    DEV_SEED_USERNAME: str = "dev"
    DEV_SEED_PASSWORD: str = "DevPass123!"

    @property
    def auth_dev_quick_login_allowed(self) -> bool:
        """POST /auth/dev-login only when not production."""
        return self.ENVIRONMENT != "production" and self.AUTH_DEV_QUICK_LOGIN

    @property
    def auto_seed_dev_user_allowed(self) -> bool:
        """Create dev user on API startup when not production."""
        return self.ENVIRONMENT != "production" and self.AUTO_SEED_DEV_USER_ON_STARTUP

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def openai_seed_keys(self) -> List[str]:
        keys = []
        if self.OPENAI_API_KEY_1:
            keys.append(self.OPENAI_API_KEY_1)
        if self.OPENAI_API_KEY_2:
            keys.append(self.OPENAI_API_KEY_2)
        return keys

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
