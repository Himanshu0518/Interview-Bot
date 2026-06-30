import asyncio
from typing import Any, Dict

from langchain_core.runnables import Runnable
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)


def _is_retryable(exc: Exception) -> bool:
    """Retry only on transient errors; immediately give up on rate-limits (429)."""
    msg = str(exc).lower()
    return not any(kw in msg for kw in ("429", "quota", "rate limit", "resource exhausted"))


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=3, max=8),
    retry=retry_if_exception(_is_retryable),
    reraise=True,           # surface the real exception after all retries fail
)
async def _safe_call(chain: Runnable, input_data: dict) -> Any:
    """
    Invoke a LangChain chain with automatic retries (3 attempts,
    exponential back-off .
    """
    return await chain.ainvoke(input_data)


# One semaphore for the whole process — limits concurrent LLM calls to 5
_semaphore = asyncio.Semaphore(5)


async def protected_invoke(chain: Runnable, input_data: Dict[str, Any]) -> Any | None:
    """
    Rate-limited, retry-wrapped chain invocation.

    Returns the parsed output on success, or None if every retry fails.
    """
    async with _semaphore:
        await asyncio.sleep(0.1)   # tiny jitter to smooth out burst requests
        try:
            return await _safe_call(chain, input_data)
        except Exception as exc:
            print(f"[protected_invoke] All retries exhausted: {exc}")
            return None
