"""Polymarket CLOB + Gamma API client."""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


class PolymarketClient:
    def __init__(self):
        self.gamma_url = settings.POLYMARKET_GAMMA_URL
        self.clob_url = settings.POLYMARKET_API_URL
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30)
        return self._client

    async def get_markets(
        self,
        limit: int = 50,
        offset: int = 0,
        active: bool = True,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        params: Dict[str, Any] = {
            "limit": limit,
            "offset": offset,
            "active": str(active).lower(),
        }
        if category:
            params["category"] = category

        try:
            resp = await self.client.get(f"{self.gamma_url}/markets", params=params)
            resp.raise_for_status()
            data = resp.json()
            return data if isinstance(data, list) else data.get("markets", [])
        except httpx.HTTPError:
            return []

    async def get_market(self, market_id: str) -> Optional[Dict[str, Any]]:
        try:
            resp = await self.client.get(f"{self.gamma_url}/markets/{market_id}")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError:
            return None

    def normalize_market(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Polymarket market dict to our schema shape."""
        tokens = raw.get("tokens", [])
        yes_token = next((t for t in tokens if t.get("outcome", "").upper() == "YES"), {})
        no_token = next((t for t in tokens if t.get("outcome", "").upper() == "NO"), {})

        yes_price = float(yes_token.get("price", 0.5))
        no_price = float(no_token.get("price", 0.5))
        volume = float(raw.get("volume", raw.get("volumeNum", 0)))

        return {
            "external_id": raw.get("id") or raw.get("conditionId"),
            "name": raw.get("question") or raw.get("title", "Unknown"),
            "category": raw.get("category", "general"),
            "description": raw.get("description", ""),
            "yes_price": round(yes_price, 4),
            "no_price": round(no_price, 4),
            "volume_usd": round(volume, 2),
            "change_24h": float(raw.get("change24h", 0)),
            "status": "active" if raw.get("active", True) else "resolved",
            "end_date": raw.get("endDate") or raw.get("endDateIso"),
            "source": "polymarket",
            "raw_data": raw,
        }

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()


polymarket_client = PolymarketClient()
