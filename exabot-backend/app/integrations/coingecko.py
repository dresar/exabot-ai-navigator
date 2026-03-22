"""CoinGecko API client for crypto price data."""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


class CoinGeckoClient:
    BASE_URL = "https://api.coingecko.com/api/v3"
    PRO_BASE_URL = "https://pro-api.coingecko.com/api/v3"

    def __init__(self):
        self.api_key = settings.COINGECKO_API_KEY
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def base_url(self) -> str:
        return self.PRO_BASE_URL if self.api_key else self.BASE_URL

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            headers = {}
            if self.api_key:
                headers["x-cg-pro-api-key"] = self.api_key
            self._client = httpx.AsyncClient(headers=headers, timeout=20)
        return self._client

    async def get_prices(self, coin_ids: List[str], vs_currency: str = "usd") -> Dict[str, Any]:
        if not coin_ids:
            return {}
        try:
            resp = await self.client.get(
                f"{self.base_url}/simple/price",
                params={
                    "ids": ",".join(coin_ids),
                    "vs_currencies": vs_currency,
                    "include_24hr_change": "true",
                    "include_market_cap": "true",
                },
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError:
            return {}

    async def get_market_chart(
        self, coin_id: str, days: int = 30, vs_currency: str = "usd"
    ) -> Dict[str, Any]:
        try:
            resp = await self.client.get(
                f"{self.base_url}/coins/{coin_id}/market_chart",
                params={"vs_currency": vs_currency, "days": days},
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError:
            return {}

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()


coingecko_client = CoinGeckoClient()
