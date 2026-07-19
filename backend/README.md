# EduReach AI Backend

Clean FastAPI backend for EduReach AI.

## Structure

- `app/api/` - API routes and future routers
- `app/services/` - business logic services
- `app/utils/` - shared utilities and settings
- `app/models/` - request and response models
- `app/main.py` - FastAPI application entrypoint

## Installed stack

- FastAPI
- Uvicorn
- python-dotenv
- google-generativeai

## Gemini service

- `app/services/gemini_service.py` initializes Gemini once at startup
- `generate_response(prompt)` returns only the generated text
- no API routes are added yet

## Current endpoint

- `GET /`

Response:

```json
{
  "message": "EduReach AI Backend Running"
}
```

## Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```