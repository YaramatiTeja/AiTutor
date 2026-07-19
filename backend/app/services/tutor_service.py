from json import JSONDecodeError, loads

from pydantic import ValidationError

from app.models.tutor import TutorResponse
from app.services.gemini_service import generate_response
from app.utils.prompts import build_tutor_prompt


class TutorResponseParseError(Exception):
    """Raised when Gemini returns invalid JSON for tutor responses."""


def generate_tutor_explanation(
    grade: str,
    subject: str,
    language: str,
    question: str,
    previous_explanation: str | None = None,
    follow_up: bool = False,
) -> TutorResponse:
    prompt = build_tutor_prompt(
        grade=grade,
        subject=subject,
        language=language,
        question=question,
        previous_explanation=previous_explanation,
        follow_up=follow_up,
    )
    raw_response = generate_response(prompt)

    try:
        payload = loads(raw_response)
        
        # Post-process to guarantee exactly 5 important points
        if isinstance(payload, dict) and "important_points" in payload:
            points = payload["important_points"]
            if not isinstance(points, list):
                points = []
            
            lang_clean = str(language).strip().lower()
            if len(points) < 5:
                pads = {
                    "te": [
                        "ఈ విషయాలను ఎల్లప్పుడూ గుర్తుంచుకో!",
                        "శ్రద్ధగా చదివితే ఏదైనా సులువవుతుంది!",
                        "సందేహాలు ఉంటే మీ ఉపాధ్యాయులను అడగండి!",
                        "మరొక్కసారి చదివి సాధన చెయ్!",
                        "నువ్వు చాలా బాగా నేర్చుకుంటున్నావు!"
                    ],
                    "telugu": [
                        "ఈ విషయాలను ఎల్లప్పుడూ గుర్తుంచుకో!",
                        "శ్రద్ధగా చదివితే ఏదైనా సులువవుతుంది!",
                        "సందేహాలు ఉంటే మీ ఉపాధ్యాయులను అడగండి!",
                        "మరొక్కసారి చదివి సాధన చెయ్!",
                        "నువ్వు చాలా బాగా నేర్చుకుంటున్నావు!"
                    ],
                    "hi": [
                        "इन महत्वपूर्ण बातों को हमेशा याद रखें!",
                        "मेहनत और अभ्यास से सब कुछ आसान हो जाता है!",
                        "कोई भी संदेह हो तो अपने शिक्षक से जरूर पूछें!",
                        "एक बार फिर से पढ़कर अभ्यास करें!",
                        "आप बहुत अच्छा सीख रहे हैं!"
                    ],
                    "hindi": [
                        "इन महत्वपूर्ण बातों को हमेशा याद रखें!",
                        "मेहनत और अभ्यास से सब कुछ आसान हो जाता है!",
                        "कोई भी संदेह हो तो अपने शिक्षक से जरूर पूछें!",
                        "एक बार फिर से पढ़कर अभ्यास करें!",
                        "आप बहुत अच्छा सीख रहे हैं!"
                    ],
                    "en": [
                        "Always remember these key concepts!",
                        "Keep practicing and learning every day!",
                        "Don't hesitate to ask your teacher if you have doubts!",
                        "Review the lesson once more for practice!",
                        "You are doing a wonderful job learning this!"
                    ],
                    "english": [
                        "Always remember these key concepts!",
                        "Keep practicing and learning every day!",
                        "Don't hesitate to ask your teacher if you have doubts!",
                        "Review the lesson once more for practice!",
                        "You are doing a wonderful job learning this!"
                    ]
                }
                fallback_pads = pads.get(lang_clean) or pads.get("en")
                points = [str(x) for x in points]
                while len(points) < 5 and fallback_pads:
                    points.append(fallback_pads[len(points) % len(fallback_pads)])
                payload["important_points"] = points
            elif len(points) > 5:
                payload["important_points"] = [str(x) for x in points[:5]]
    except JSONDecodeError as exc:
        raise TutorResponseParseError("Gemini returned invalid JSON for the tutor response.") from exc

    try:
        return TutorResponse.model_validate(payload)
    except ValidationError as exc:
        raise TutorResponseParseError("Gemini returned JSON, but the tutor response format was invalid.") from exc
