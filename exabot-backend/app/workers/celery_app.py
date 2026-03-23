"""Celery application — broker/result from settings."""
from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "exabot",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

# Beat schedule (intervals in seconds via celery.schedules.schedule)
celery_app.conf.beat_schedule = {
    "sync-markets-every-5m": {
        "task": "app.workers.tasks.sync_polymarket_markets",
        "schedule": crontab(minute="*/5"),
    },
    "sync-news-every-15m": {
        "task": "app.workers.tasks.sync_news_for_events",
        "schedule": crontab(minute="*/15"),
    },
    "key-rotation-check-every-minute": {
        "task": "app.workers.tasks.check_api_key_limits",
        "schedule": crontab(minute="*"),
    },
    "daily-key-reset-midnight-utc": {
        "task": "app.workers.tasks.reset_api_key_daily_usage",
        "schedule": crontab(hour=0, minute=5),
    },
    "performance-snapshot-hourly": {
        "task": "app.workers.tasks.compute_performance_snapshots",
        "schedule": crontab(minute=15, hour="*"),
    },
}
