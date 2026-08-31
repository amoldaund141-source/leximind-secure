
import json
import logging
import urllib.request
import urllib.error
from django.conf import settings

logger = logging.getLogger("apps.ai.openrouter")

class OpenRouterError(Exception):
    pass

FALLBACK_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "inclusionai/ling-3.0-flash-fin:free",
    "mistralai/mistral-7b-instruct:free",
    "liquid/lfm-2.5-2.6b:free",
]

def chat_completion(
    messages: list[dict],
    model: str = None,
    max_tokens: int = 1024,
    temperature: float = 0.2,
) -> str:
    """
    Call OpenRouter /chat/completions and return the assistant's text.
    Automatically falls back to alternative free models if the primary one fails.
    """
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise OpenRouterError("OPENROUTER_API_KEY is not set in environment.")

    primary_model = model or settings.OPENROUTER_MODEL
    base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
    url = f"{base_url}/chat/completions"

    models_to_try = [primary_model]
    for fallback in FALLBACK_MODELS:
        if fallback not in models_to_try:
            models_to_try.append(fallback)

    last_error = None

    for current_model in models_to_try:
        payload = {
            "model": current_model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.OPENROUTER_SITE_URL,
            "X-Title": settings.OPENROUTER_SITE_NAME,
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                return body["choices"][0]["message"]["content"].strip()

        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", errors="replace")
            logger.warning(f"OpenRouter HTTP error {exc.code} for model {current_model}: {err_body}")
            last_error = f"HTTP {exc.code}: {err_body}"
            # Only retry on 5xx errors or 429 Too Many Requests, else fail immediately
            if exc.code not in (404, 403, 429, 500, 502, 503, 504):
                break
        except urllib.error.URLError as exc:
            logger.warning(f"OpenRouter connection error for model {current_model}: {exc}")
            last_error = f"Connection error: {exc}"
        except (KeyError, IndexError, json.JSONDecodeError) as exc:
            logger.warning(f"OpenRouter malformed response for model {current_model}: {exc}")
            last_error = f"Malformed response: {exc}"

    logger.error(f"All OpenRouter models failed. Last error: {last_error}")
    raise OpenRouterError(f"All AI models failed. Last error: {last_error}")

def is_configured() -> bool:
    return bool(settings.OPENROUTER_API_KEY)
