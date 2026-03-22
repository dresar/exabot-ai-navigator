"""
SQLAlchemy ORM models — all tables defined in the architecture plan.
Imported by database.py so that Base.metadata knows about every table.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Decimal, ForeignKey,
    Integer, String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ──────────────────────────────────────────────────────────────
# AUTH / USER TABLES
# ──────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # relationships
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user")
    simulation_account = relationship("SimulationAccount", back_populates="user", uselist=False, cascade="all, delete-orphan")
    training_sessions = relationship("TrainingSession", back_populates="user")
    strategies = relationship("Strategy", back_populates="user", cascade="all, delete-orphan")
    risk_settings = relationship("RiskSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    performance_snapshots = relationship("PerformanceSnapshot", back_populates="user", cascade="all, delete-orphan")
    backtest_jobs = relationship("BacktestJob", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


# ──────────────────────────────────────────────────────────────
# MARKET / PREDICTION
# ──────────────────────────────────────────────────────────────

class MarketEvent(Base):
    __tablename__ = "market_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    external_id = Column(String(255), unique=True, nullable=True)
    name = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    yes_price = Column(Decimal(6, 4), default=0.5)
    no_price = Column(Decimal(6, 4), default=0.5)
    volume_usd = Column(Decimal(20, 2), default=0)
    change_24h = Column(Decimal(8, 4), default=0)
    is_trending = Column(Boolean, default=False)
    status = Column(String(50), default="active")
    resolution = Column(Boolean, nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    source = Column(String(100), default="polymarket")
    raw_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    predictions = relationship("Prediction", back_populates="event", cascade="all, delete-orphan")
    news_articles = relationship("NewsArticle", back_populates="event", cascade="all, delete-orphan")
    simulation_trades = relationship("SimulationTrade", back_populates="event")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    event_id = Column(UUID(as_uuid=False), ForeignKey("market_events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ai_probability = Column(Decimal(5, 2), nullable=False)
    market_probability = Column(Decimal(5, 2), nullable=False)
    confidence = Column(Decimal(5, 2), nullable=False)
    ai_edge = Column(Decimal(6, 2), nullable=True)
    status = Column(String(50), default="pending")
    result = Column(Boolean, nullable=True)
    reasoning = Column(Text, nullable=True)
    sentiment_data = Column(JSONB, nullable=True)
    factor_scores = Column(JSONB, nullable=True)
    model_outputs = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    event = relationship("MarketEvent", back_populates="predictions")
    user = relationship("User", back_populates="predictions")


# ──────────────────────────────────────────────────────────────
# AI MODELS
# ──────────────────────────────────────────────────────────────

class AiModel(Base):
    __tablename__ = "ai_models"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    model_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), default="1.0")
    accuracy = Column(Decimal(5, 2), nullable=True)
    prev_accuracy = Column(Decimal(5, 2), nullable=True)
    latency_ms = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    weight = Column(Decimal(5, 4), default=0.2)
    config = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    training_sessions = relationship("TrainingSession", back_populates="model")
    backtest_jobs = relationship("BacktestJob", back_populates="model")


# ──────────────────────────────────────────────────────────────
# API KEYS
# ──────────────────────────────────────────────────────────────

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=False)
    key_encrypted = Column(Text, nullable=False)
    key_masked = Column(String(50), nullable=False)
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="active")
    usage_count = Column(Integer, default=0)
    daily_limit = Column(Integer, nullable=True)
    daily_usage = Column(Integer, default=0)
    rotate_at_threshold = Column(Integer, default=90)
    is_auto_rotate = Column(Boolean, default=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    last_reset_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="api_keys")


# ──────────────────────────────────────────────────────────────
# TRAINING
# ──────────────────────────────────────────────────────────────

class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    model_id = Column(UUID(as_uuid=False), ForeignKey("ai_models.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    dataset_path = Column(Text, nullable=True)
    dataset_format = Column(String(50), default="csv")
    records_count = Column(Integer, nullable=True)
    status = Column(String(50), default="queued")
    progress = Column(Integer, default=0)
    total_epochs = Column(Integer, default=50)
    current_epoch = Column(Integer, default=0)
    current_accuracy = Column(Decimal(5, 2), nullable=True)
    final_accuracy = Column(Decimal(5, 2), nullable=True)
    error_message = Column(Text, nullable=True)
    celery_task_id = Column(String(255), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="training_sessions")
    model = relationship("AiModel", back_populates="training_sessions")
    epochs = relationship("TrainingEpoch", back_populates="session", cascade="all, delete-orphan")


class TrainingEpoch(Base):
    __tablename__ = "training_epochs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("training_sessions.id", ondelete="CASCADE"), nullable=False)
    epoch = Column(Integer, nullable=False)
    accuracy = Column(Decimal(5, 2), nullable=True)
    loss = Column(Decimal(8, 6), nullable=True)
    val_accuracy = Column(Decimal(5, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("TrainingSession", back_populates="epochs")


# ──────────────────────────────────────────────────────────────
# SIMULATION
# ──────────────────────────────────────────────────────────────

class SimulationAccount(Base):
    __tablename__ = "simulation_accounts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance = Column(Decimal(20, 2), default=100000)
    initial_balance = Column(Decimal(20, 2), default=100000)
    total_profit = Column(Decimal(20, 2), default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="simulation_account")
    trades = relationship("SimulationTrade", back_populates="account", cascade="all, delete-orphan")


class SimulationTrade(Base):
    __tablename__ = "simulation_trades"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    account_id = Column(UUID(as_uuid=False), ForeignKey("simulation_accounts.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=False), ForeignKey("market_events.id", ondelete="SET NULL"), nullable=True)
    position = Column(String(10), nullable=False)  # YES | NO
    amount = Column(Decimal(20, 2), nullable=False)
    ai_probability = Column(Decimal(5, 2), nullable=True)
    entry_price = Column(Decimal(6, 4), nullable=True)
    exit_price = Column(Decimal(6, 4), nullable=True)
    result = Column(String(20), default="pending")  # menang|kalah|pending
    profit = Column(Decimal(20, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    account = relationship("SimulationAccount", back_populates="trades")
    event = relationship("MarketEvent", back_populates="simulation_trades")


# ──────────────────────────────────────────────────────────────
# BACKTESTING
# ──────────────────────────────────────────────────────────────

class BacktestJob(Base):
    __tablename__ = "backtest_jobs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(UUID(as_uuid=False), ForeignKey("ai_models.id", ondelete="SET NULL"), nullable=True)
    time_range = Column(String(20), nullable=False)
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="pending")
    accuracy = Column(Decimal(5, 2), nullable=True)
    total_predictions = Column(Integer, nullable=True)
    brier_score = Column(Decimal(8, 6), nullable=True)
    vs_baseline = Column(Decimal(6, 2), nullable=True)
    results = Column(JSONB, nullable=True)
    celery_task_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="backtest_jobs")
    model = relationship("AiModel", back_populates="backtest_jobs")


# ──────────────────────────────────────────────────────────────
# STRATEGIES
# ──────────────────────────────────────────────────────────────

class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    triggered_count = Column(Integer, default=0)
    win_count = Column(Integer, default=0)
    loss_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="strategies")
    conditions = relationship("StrategyCondition", back_populates="strategy", cascade="all, delete-orphan", order_by="StrategyCondition.order_index")


class StrategyCondition(Base):
    __tablename__ = "strategy_conditions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    strategy_id = Column(UUID(as_uuid=False), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False)
    parameter = Column(String(100), nullable=False)
    operator = Column(String(10), nullable=False)
    threshold_value = Column(Decimal(10, 4), nullable=False)
    action = Column(String(100), nullable=False)
    order_index = Column(Integer, default=0)

    strategy = relationship("Strategy", back_populates="conditions")


# ──────────────────────────────────────────────────────────────
# RISK
# ──────────────────────────────────────────────────────────────

class RiskSettings(Base):
    __tablename__ = "risk_settings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    max_daily_loss = Column(Decimal(20, 2), default=50000)
    max_bet_per_event = Column(Decimal(20, 2), default=25000)
    min_confidence = Column(Integer, default=70)
    max_drawdown = Column(Integer, default=20)
    stop_loss_enabled = Column(Boolean, default=True)
    risk_notifications = Column(Boolean, default=True)
    conservative_mode = Column(Boolean, default=False)
    anti_martingale = Column(Boolean, default=True)
    drawdown_protection = Column(Boolean, default=False)
    correlation_limit = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="risk_settings")
    category_allocations = relationship("CategoryAllocation", back_populates="risk_settings", cascade="all, delete-orphan")


class CategoryAllocation(Base):
    __tablename__ = "category_allocations"
    __table_args__ = (UniqueConstraint("risk_settings_id", "category"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    risk_settings_id = Column(UUID(as_uuid=False), ForeignKey("risk_settings.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)
    allocation = Column(Integer, default=20)

    risk_settings = relationship("RiskSettings", back_populates="category_allocations")


# ──────────────────────────────────────────────────────────────
# LOGS / NOTIFICATIONS
# ──────────────────────────────────────────────────────────────

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    log_type = Column(String(50), nullable=False)
    event_name = Column(Text, nullable=True)
    action = Column(Text, nullable=False)
    status = Column(String(20), nullable=False)
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="activity_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)
    is_urgent = Column(Boolean, default=False)
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# ──────────────────────────────────────────────────────────────
# USER SETTINGS / PERFORMANCE
# ──────────────────────────────────────────────────────────────

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String(20), default="dark")
    language = Column(String(10), default="id")
    density = Column(String(20), default="normal")
    animations_enabled = Column(Boolean, default=True)
    auto_refresh = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    debug_mode = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="settings")


class PerformanceSnapshot(Base):
    __tablename__ = "performance_snapshots"
    __table_args__ = (UniqueConstraint("user_id", "snapshot_date"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    ai_accuracy = Column(Decimal(5, 2), nullable=True)
    win_rate = Column(Decimal(5, 2), nullable=True)
    total_predictions = Column(Integer, nullable=True)
    avg_confidence = Column(Decimal(5, 2), nullable=True)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    market_baseline = Column(Decimal(5, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="performance_snapshots")


# ──────────────────────────────────────────────────────────────
# NEWS
# ──────────────────────────────────────────────────────────────

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    event_id = Column(UUID(as_uuid=False), ForeignKey("market_events.id", ondelete="CASCADE"), nullable=False)
    source = Column(String(255), nullable=True)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    sentiment = Column(String(20), nullable=True)
    sentiment_score = Column(Decimal(4, 3), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("MarketEvent", back_populates="news_articles")
