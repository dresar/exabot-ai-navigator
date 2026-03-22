"""OpenAI client with key pool support."""
from typing import Optional
import openai
from app.config import settings


class OpenAIKeyPool:
    """
    Runtime key pool — seeded from env, extended at runtime by KeyPoolManager.
    KeyPoolManager (in api_keys module) pulls active DB keys and registers them here.
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


async def chat_completion(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
    max_tokens: int = 1024,
    retries: int = 3,
) -> Optional[str]:
    """Call OpenAI chat completion, rotating keys on failure."""
    last_error = None
    for attempt in range(retries):
        api_key = key_pool.get_next()
        if not api_key:
            return None
        try:
            client = openai.AsyncOpenAI(api_key=api_key)
            response = await client.chat.completions.create(
                model=model,
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
