import os
from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "EduReach AI Backend"
    app_version: str = "0.1.0"
    cors_allow_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    gemini_api_key: str | None = None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    origins = os.getenv("CORS_ALLOW_ORIGINS")
    allow_origins = [origin.strip() for origin in origins.split(",") if origin.strip()] if origins else [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    return Settings(
        app_name=os.getenv("APP_NAME", "EduReach AI Backend"),
        app_version=os.getenv("APP_VERSION", "0.1.0"),
        cors_allow_origins=allow_origins,
        gemini_api_key=(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or None),
    )
