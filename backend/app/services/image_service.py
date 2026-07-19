from json import JSONDecodeError, loads
from google.genai import types
from app.services.gemini_service import get_gemini_client, _map_sdk_error, GeminiServiceError
from app.services.tutor_service import generate_tutor_explanation, TutorResponseParseError

class ImageResponseParseError(Exception):
    """Raised when Gemini returns invalid JSON for image analysis."""


def analyze_image(
    image_bytes: bytes,
    mime_type: str,
    grade: str,
    subject: str,
    language: str,
) -> dict:
    """
    Accepts an uploaded image, sends it to Gemini Vision to detect the educational question/concept,
    and then generates a teaching response using the existing tutor prompt and schema validation.
    """
    client = get_gemini_client()
    
    # 1. Ask Gemini Vision to extract the question/text/concept from the image
    detection_prompt = (
        "Identify and extract the exact educational question, problem, text, or main concept depicted in this image. "
        "Respond with only the extracted text/question, without any prefix, formatting, code block, or explanation. "
        "If there are no explicit words or text in the image, describe the educational concept or question that the image represents."
    )
    
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    
    try:
        from app.services.gemini_service import _model_name
        model = _model_name
    except ImportError:
        model = "gemini-2.0-flash"
        
    try:
        response = client.models.generate_content(
            model=model,
            contents=[detection_prompt, image_part],
        )
        detected_question = getattr(response, "text", None)
        if not detected_question or not detected_question.strip():
            detected_question = "Explain the educational concept depicted in the image."
        else:
            detected_question = detected_question.strip()
    except Exception as exc:
        raise _map_sdk_error(exc) from exc
        
    # 2. Use the existing tutor prompt logic to generate the structured response
    try:
        tutor_res = generate_tutor_explanation(
            grade=grade,
            subject=subject,
            language=language,
            question=detected_question,
        )
        return tutor_res.model_dump()
    except TutorResponseParseError as exc:
        raise ImageResponseParseError("Gemini returned invalid JSON for the image response.") from exc

