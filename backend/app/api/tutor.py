from fastapi import APIRouter, HTTPException, status

from app.models.tutor import TutorRequest, TutorResponse
from app.services.gemini_service import GeminiGenerationError, GeminiNotConfiguredError, GeminiServiceError
from app.services.tutor_service import TutorResponseParseError, generate_tutor_explanation

router = APIRouter(prefix="/tutor", tags=["Tutor"])


@router.post("", response_model=TutorResponse)
def create_tutor_response(payload: TutorRequest) -> TutorResponse:
    try:
        response = generate_tutor_explanation(
            grade=payload.grade,
            subject=payload.subject,
            language=payload.language,
            question=payload.question,
            previous_explanation=payload.previous_explanation,
            follow_up=payload.follow_up,
        )
        return response
    except GeminiNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except GeminiGenerationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except TutorResponseParseError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except GeminiServiceError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
