"""NewsAPI.org client for fetching news articles related to market events."""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


class NewsAPIClient:
    BASE_URL = "https://newsapi.org/v2"

    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=20)
        return self._client

    async def get_articles(
        self,
        query: str,
        page_size: int = 10,
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        if not self.api_key:
            return []
        try:
            resp = await self.client.get(
                f"{self.BASE_URL}/everything",
                params={
                    "q": query,
                    "pageSize": page_size,
                    "language": language,
                    "sortBy": "relevancy",
                    "apiKey": self.api_key,
                },
            )
            resp.raise_for_status()
            return resp.json().get("articles", [])
        except httpx.HTTPError:
            return []

    def normalize_article(self, raw: Dict[str, Any], event_id: str) -> Dict[str, Any]:
        source = raw.get("source", {})
        return {
            "event_id": event_id,
            "source": source.get("name", "Unknown"),
            "title": raw.get("title", ""),
            "content": raw.get("content") or raw.get("description", ""),
            "url": raw.get("url", ""),
            "published_at": raw.get("publishedAt"),
        }

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()


news_client = NewsAPIClient()
