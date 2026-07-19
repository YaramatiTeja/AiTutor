from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.gemini_service import (
    GeminiAuthenticationError,
    GeminiGenerationError,
    GeminiNotConfiguredError,
    GeminiServiceError,
    generate_response,
)

router = APIRouter(tags=["Test"])

from app.api.image import router as image_router
router.include_router(image_router)

TEST_PROMPT = "Say Hello from EduReach AI"


class TestAiResponse(BaseModel):
    prompt: str
    response: str


@router.get("/test-ai", response_model=TestAiResponse)
def test_ai() -> TestAiResponse:
    try:
        response = generate_response(TEST_PROMPT)
        return TestAiResponse(prompt=TEST_PROMPT, response=response)
    except GeminiNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except GeminiAuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
    except GeminiGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
