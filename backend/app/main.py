from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.test_ai import router as test_ai_router
from app.api.tutor import router as tutor_router
from app.api.image import router as image_router
from app.api.quiz import router as quiz_router
from app.services.gemini_service import initialize_gemini
from app.utils.settings import get_settings

load_dotenv()

settings = get_settings()

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(tutor_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(test_ai_router)
app.include_router(image_router)


@app.on_event("startup")
def startup_event() -> None:
    initialize_gemini(settings.gemini_api_key)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "EduReach AI Backend Running"}
