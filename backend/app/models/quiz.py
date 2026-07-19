from pydantic import BaseModel, Field

class QuizRequest(BaseModel):
    grade: str = Field(..., min_length=1, max_length=50)
    topic: str = Field(..., min_length=1, max_length=500)
    language: str = Field(default="en", min_length=1, max_length=50)

class QuizQuestion(BaseModel):
    question: str = Field(..., min_length=1)
    options: list[str] = Field(..., min_length=4, max_length=4)
    correct_answer: str = Field(..., min_length=1)
    explanation: str = Field(..., min_length=1)

class QuizResponse(BaseModel):
    title: str = Field(..., min_length=1)
    questions: list[QuizQuestion] = Field(..., min_length=5, max_length=5)
