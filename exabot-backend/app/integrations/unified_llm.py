"""
OpenAI-compatible chat completions over HTTP (Apprentice unified API or any compatible gateway).
POST {LLM_BASE_URL}/chat/completions
"""
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings


def _completions_url() -> str:
    base = settings.LLM_BASE_URL.rstrip("/")
    return f"{base}/chat/completions"


async def chat_completions(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    timeout: float = 120.0,
) -> Optional[str]:
    """
    Returns assistant message content, or None on failure.
    """
    api_key = settings.LLM_API_KEY.strip()
    if not api_key:
        return None

    payload = {
        "model": model or settings.LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(_completions_url(), json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        choices = data.get("choices") or []
        if not choices:
            return None
        msg = choices[0].get("message") or {}
        content = msg.get("content")
        return content if isinstance(content, str) else None
    except Exception:
        return None
