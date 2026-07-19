from fastapi import APIRouter, HTTPException, status
from app.models.quiz import QuizRequest, QuizResponse
from app.services.gemini_service import GeminiGenerationError, GeminiNotConfiguredError, GeminiServiceError
from app.services.quiz_service import QuizResponseParseError, generate_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("", response_model=QuizResponse)
def create_quiz_response(payload: QuizRequest) -> QuizResponse:
    """Generate a quiz using Gemini response based on topic, grade, and language."""
    try:
        return generate_quiz(
            topic=payload.topic,
            grade=payload.grade,
            language=payload.language,
        )
    except GeminiNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except GeminiGenerationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except QuizResponseParseError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except GeminiServiceError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
