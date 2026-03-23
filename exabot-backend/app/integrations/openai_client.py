"""LLM chat completions: unified OpenAI-compatible gateway or official OpenAI SDK."""
from typing import Optional
import openai

from app.config import settings
from app.integrations import unified_llm


class OpenAIKeyPool:
    """
    Runtime key pool — seeded from env, extended at runtime by KeyPoolManager.
    """

    def __init__(self):
        self._keys: list[str] = list(settings.openai_seed_keys)
        self._index: int = 0

    def register(self, key: str) -> None:
        if key not in self._keys:
            self._keys.append(key)

    def get_next(self) -> Optional[str]:
        if not self._keys:
            return None
        key = self._keys[self._index % len(self._keys)]
        self._index += 1
        return key

    def remove(self, key: str) -> None:
        if key in self._keys:
            self._keys.remove(key)

    @property
    def count(self) -> int:
        return len(self._keys)


key_pool = OpenAIKeyPool()


def _use_unified() -> bool:
    if settings.LLM_PROVIDER.lower() == "unified":
        return bool(settings.LLM_API_KEY.strip())
    if settings.LLM_API_KEY.strip():
        return True
    return False


def _openai_compatible_model(requested: Optional[str]) -> str:
    """Use requested model only if it looks like an OpenAI model id; else default."""
    m = (requested or "gpt-4o-mini").strip()
    lower = m.lower()
    if lower.startswith("gpt") or lower.startswith("o1") or lower.startswith("o3") or lower.startswith("o4"):
        return m
    return "gpt-4o-mini"


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    retries: int = 3,
) -> Optional[str]:
    """
    Chat completion: prefers unified LLM when configured, else OpenAI official API with key pool.
    """
    use_model = model or settings.LLM_MODEL

    if _use_unified():
        content = await unified_llm.chat_completions(
            messages=messages,
            model=use_model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        if content:
            return content
        if settings.LLM_PROVIDER.lower() == "unified":
            return None

    last_error = None
    for _attempt in range(retries):
        api_key = key_pool.get_next()
        if not api_key:
            return None
        try:
            client = openai.AsyncOpenAI(api_key=api_key)
            om = _openai_compatible_model(model)
            response = await client.chat.completions.create(
                model=om,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content
        except openai.RateLimitError:
            key_pool.remove(api_key)
            last_error = "RateLimitError"
        except openai.AuthenticationError:
            key_pool.remove(api_key)
            last_error = "AuthenticationError"
        except Exception as e:
            last_error = str(e)

    return None
