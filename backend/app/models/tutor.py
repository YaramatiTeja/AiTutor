from pydantic import BaseModel, Field


class TutorRequest(BaseModel):
    grade: str = Field(..., min_length=1, max_length=50)
    subject: str = Field(..., min_length=1, max_length=100)
    language: str = Field(..., min_length=1, max_length=50)
    question: str = Field(..., min_length=1, max_length=2000)
    previous_explanation: str | None = Field(default=None, max_length=5000)
    follow_up: bool = False


class TutorResponse(BaseModel):
    title: str
    explanation: str
    important_points: list[str]
    real_life_example: str
    practice_question: str
