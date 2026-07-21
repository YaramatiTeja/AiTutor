from __future__ import annotations

import os
from pathlib import Path
from threading import Lock

from dotenv import load_dotenv
from google import genai
from google.genai import Client
from google.genai import errors as genai_errors

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_ROOT / ".env")

DEFAULT_MODEL = "gemini-2.0-flash"

_client: Client | None = None
_model_name: str = DEFAULT_MODEL
_initialized = False
_init_lock = Lock()


class GeminiServiceError(Exception):
    """Base error for Gemini service failures."""


class GeminiNotConfiguredError(GeminiServiceError):
    """Raised when the Gemini API key is missing."""


class GeminiAuthenticationError(GeminiServiceError):
    """Raised when the Gemini API key is invalid or unauthorized."""


class GeminiGenerationError(GeminiServiceError):
    """Raised when Gemini fails to generate a response."""


def _resolve_api_key(api_key: str | None = None) -> str:
    key = (api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
    if not key:
        raise GeminiNotConfiguredError("GEMINI_API_KEY is missing in the environment.")
    return key


def initialize_gemini(api_key: str | None = None, model: str | None = None) -> Client:
    """Initialize and return the shared Gemini client."""
    global _client, _model_name, _initialized

    if _initialized and _client is not None:
        return _client

    with _init_lock:
        if _initialized and _client is not None:
            return _client

        key = _resolve_api_key(api_key)
        resolved_model = (model or os.getenv("GEMINI_MODEL") or DEFAULT_MODEL).strip()

        try:
            _client = genai.Client(api_key=key)
            _model_name = resolved_model
            _initialized = True
            return _client
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise GeminiServiceError("Failed to initialize Gemini client.") from exc


def get_gemini_client() -> Client:
    """Return the initialized Gemini client, creating it on first use."""
    if not _initialized or _client is None:
        return initialize_gemini()
    return _client


def _map_sdk_error(exc: Exception) -> GeminiServiceError:
    if isinstance(exc, genai_errors.ClientError):
        message = exc.message or ""
        if exc.code in (401, 403) or (exc.code == 400 and "api key" in message.lower()):
            resolved_message = exc.message or "Invalid or unauthorized Gemini API key."
            return GeminiAuthenticationError(resolved_message)
        resolved_message = exc.message or "Gemini rejected the request."
        return GeminiGenerationError(resolved_message)

    if isinstance(exc, genai_errors.ServerError):
        message = exc.message or "Gemini service is temporarily unavailable."
        return GeminiGenerationError(message)

    return GeminiGenerationError("Failed to generate a Gemini response.")


def generate_response(prompt: str, *, model: str | None = None) -> str:
    """Generate text from a prompt using the shared Gemini client."""
    if not prompt or not prompt.strip():
        raise ValueError("prompt must not be empty")

    client = get_gemini_client()

    try:
        response = client.models.generate_content(
            model=model or _model_name,
            contents=prompt.strip(),
        )
        text = getattr(response, "text", None)
        if not text:
            raise GeminiGenerationError("Gemini returned an empty response.")
        return text.strip()
    except GeminiServiceError:
        raise
    except Exception as exc:  # pragma: no cover - defensive wrapper
        raise _map_sdk_error(exc) from exc