from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel

from app.services.image_service import analyze_image, ImageResponseParseError
from app.services.gemini_service import (
    GeminiAuthenticationError,
    GeminiGenerationError,
    GeminiNotConfiguredError,
    GeminiServiceError,
)

router = APIRouter(prefix="/api/image", tags=["Image"])


class ImageAnalysisResponse(BaseModel):
    title: str
    explanation: str
    important_points: list[str]
    real_life_example: str
    practice_question: str


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def handle_analyze_image(
    image: UploadFile = File(...),
    grade: str = Form(...),
    subject: str = Form(...),
    language: str = Form(...)
) -> ImageAnalysisResponse:
    try:
        image_bytes = await image.read()
        mime_type = image.content_type or "image/png"
        
        payload = analyze_image(
            image_bytes=image_bytes,
            mime_type=mime_type,
            grade=grade,
            subject=subject,
            language=language,
        )
        return ImageAnalysisResponse.model_validate(payload)
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
    except (GeminiGenerationError, ImageResponseParseError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
