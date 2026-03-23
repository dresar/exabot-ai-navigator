"""Celery tasks — ingestion, API key maintenance, snapshots."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from decimal import Decimal

from dateutil import parser as date_parser
from sqlalchemy import select, func

from app.workers.celery_app import celery_app


def _parse_dt(val):
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        try:
            return date_parser.parse(val)
        except Exception:
            return None
    return None


@celery_app.task(name="app.workers.tasks.sync_polymarket_markets")
def sync_polymarket_markets():
    async def _go():
        from app.database import AsyncSessionLocal
        from app.integrations.polymarket import polymarket_client
        from app.models import MarketEvent

        raw_list = await polymarket_client.get_markets(limit=80)
        async with AsyncSessionLocal() as db:
            for raw in raw_list:
                norm = polymarket_client.normalize_market(raw)
                ext_id = norm.get("external_id")
                if not ext_id:
                    continue
                ext_id = str(ext_id)
                existing = await db.execute(
                    select(MarketEvent).where(MarketEvent.external_id == ext_id)
                )
                row = existing.scalar_one_or_none()
                end_at = _parse_dt(norm.get("end_date"))
                if row:
                    row.name = norm["name"]
                    row.category = norm.get("category", "general")
                    row.description = norm.get("description") or ""
                    row.yes_price = Decimal(str(norm.get("yes_price", 0.5)))
                    row.no_price = Decimal(str(norm.get("no_price", 0.5)))
                    row.volume_usd = Decimal(str(norm.get("volume_usd", 0)))
                    row.change_24h = Decimal(str(norm.get("change_24h", 0)))
                    row.status = norm.get("status", "active")
                    row.end_date = end_at
                    row.raw_data = norm.get("raw_data")
                    db.add(row)
                else:
                    db.add(
                        MarketEvent(
                            external_id=ext_id,
                            name=norm["name"],
                            category=norm.get("category", "general"),
                            description=norm.get("description") or "",
                            yes_price=Decimal(str(norm.get("yes_price", 0.5))),
                            no_price=Decimal(str(norm.get("no_price", 0.5))),
                            volume_usd=Decimal(str(norm.get("volume_usd", 0))),
                            change_24h=Decimal(str(norm.get("change_24h", 0))),
                            status=norm.get("status", "active"),
                            end_date=end_at,
                            source=norm.get("source", "polymarket"),
                            raw_data=norm.get("raw_data"),
                        )
                    )
            await db.commit()
        await polymarket_client.close()

    asyncio.run(_go())


@celery_app.task(name="app.workers.tasks.sync_news_for_events")
def sync_news_for_events():
    async def _go():
        from app.database import AsyncSessionLocal
        from app.integrations.news_api import news_client
        from app.models import MarketEvent, NewsArticle

        async with AsyncSessionLocal() as db:
            r = await db.execute(
                select(MarketEvent).where(MarketEvent.status == "active").limit(15)
            )
            events = r.scalars().all()
            for ev in events:
                articles = await news_client.get_articles(query=ev.name[:120], page_size=5)
                for a in articles:
                    norm = news_client.normalize_article(a, ev.id)
                    pub = _parse_dt(norm.get("published_at"))
                    db.add(
                        NewsArticle(
                            event_id=ev.id,
                            source=norm["source"],
                            title=norm["title"],
                            content=norm.get("content"),
                            url=norm.get("url"),
                            published_at=pub,
                        )
                    )
            await db.commit()
        await news_client.close()

    asyncio.run(_go())


@celery_app.task(name="app.workers.tasks.check_api_key_limits")
def check_api_key_limits():
    async def _go():
        from app.database import AsyncSessionLocal
        from app.modules.api_keys.service import key_pool_manager

        async with AsyncSessionLocal() as db:
            await key_pool_manager.check_and_rotate(db)

    asyncio.run(_go())


@celery_app.task(name="app.workers.tasks.reset_api_key_daily_usage")
def reset_api_key_daily_usage():
    async def _go():
        from app.database import AsyncSessionLocal
        from app.modules.api_keys.service import key_pool_manager

        async with AsyncSessionLocal() as db:
            await key_pool_manager.reset_daily_usage(db)

    asyncio.run(_go())


@celery_app.task(name="app.workers.tasks.compute_performance_snapshots")
def compute_performance_snapshots():
    async def _go():
        from app.database import AsyncSessionLocal
        from app.models import User, Prediction, PerformanceSnapshot

        today = datetime.now(timezone.utc).date()
        async with AsyncSessionLocal() as db:
            users = (await db.execute(select(User.id))).scalars().all()
            for uid in users:
                q = await db.execute(
                    select(
                        func.count(Prediction.id),
                        func.avg(Prediction.ai_probability),
                        func.avg(Prediction.confidence),
                    ).where(Prediction.user_id == uid)
                )
                cnt, avg_ai, avg_conf = q.one()
                wins = await db.execute(
                    select(func.count(Prediction.id)).where(
                        Prediction.user_id == uid,
                        Prediction.result == True,
                    )
                )
                losses = await db.execute(
                    select(func.count(Prediction.id)).where(
                        Prediction.user_id == uid,
                        Prediction.result == False,
                    )
                )
                wn, ln = wins.scalar_one() or 0, losses.scalar_one() or 0
                resolved = wn + ln
                win_rate = Decimal("0")
                acc = None
                if resolved:
                    win_rate = Decimal(str(round(wn / resolved * 100, 2)))
                    acc = win_rate

                snap = await db.execute(
                    select(PerformanceSnapshot).where(
                        PerformanceSnapshot.user_id == uid,
                        PerformanceSnapshot.snapshot_date == today,
                    )
                )
                existing = snap.scalar_one_or_none()
                if existing:
                    existing.ai_accuracy = acc
                    existing.win_rate = win_rate
                    existing.total_predictions = cnt or 0
                    existing.avg_confidence = Decimal(str(round(float(avg_conf or 0), 2)))
                    existing.wins = wn
                    existing.losses = ln
                    db.add(existing)
                else:
                    db.add(
                        PerformanceSnapshot(
                            user_id=uid,
                            snapshot_date=today,
                            ai_accuracy=acc,
                            win_rate=win_rate,
                            total_predictions=cnt or 0,
                            avg_confidence=Decimal(str(round(float(avg_conf or 0), 2))),
                            wins=wn,
                            losses=ln,
                        )
                    )
            await db.commit()

    asyncio.run(_go())
