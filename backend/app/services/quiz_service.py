from json import JSONDecodeError, loads
from pydantic import ValidationError

from app.models.quiz import QuizResponse
import app.services.gemini_service as gemini_service
from app.utils.prompts import build_quiz_prompt
from google.genai import types


class QuizResponseParseError(Exception):
    """Raised when Gemini returns invalid JSON or wrong schema for quiz responses."""


def generate_quiz(topic: str, grade: str, language: str) -> QuizResponse:
    """Generate a quiz using Gemini response based on topic, grade, and language."""
    client = gemini_service.get_gemini_client()
    prompt = build_quiz_prompt(grade=grade, topic=topic, language=language)

    try:
        response = client.models.generate_content(
            model=gemini_service._model_name,
            contents=prompt.strip(),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=QuizResponse,
            ),
        )
        raw_response = getattr(response, "text", None)
        if not raw_response:
            raise QuizResponseParseError("Gemini returned an empty response.")
    except Exception as exc:
        if isinstance(exc, QuizResponseParseError):
            raise
        from app.services.gemini_service import _map_sdk_error
        raise _map_sdk_error(exc) from exc

    try:
        payload = loads(raw_response)
    except JSONDecodeError as exc:
        raise QuizResponseParseError("Gemini returned invalid JSON for the quiz response.") from exc

    try:
        return QuizResponse.model_validate(payload)
    except ValidationError as exc:
        raise QuizResponseParseError(
            f"Gemini returned JSON, but the quiz response format was invalid: {exc}"
        ) from exc
