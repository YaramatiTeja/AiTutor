def build_tutor_prompt(grade, subject, language, question, previous_explanation=None, follow_up=False):
    """Build a prompt for Gemini to answer like a government school teacher for rural students."""

    grade_text = str(grade).strip()
    subject_text = str(subject).strip()
    
    lang_map = {
        "en": "English",
        "te": "Telugu",
        "hi": "Hindi"
    }
    raw_lang = str(language).strip().lower()
    language_text = lang_map.get(raw_lang, str(language).strip())
    
    question_text = str(question).strip()
    previous_explanation_text = str(previous_explanation).strip() if previous_explanation else ''

    follow_up_instructions = ''

    if follow_up:
        follow_up_instructions = (
            f"\nFollow-up Instructions:\n"
            f"Explain the same concept again in a new way.\n"
            f"Use even simpler words and shorter steps.\n"
            f"Use another real-life example.\n"
            f"Avoid repeating the previous explanation.\n"
            f"If previous explanation is provided, use it only as context and do not repeat it. Previous explanation: {previous_explanation_text}.\n"
        )
    elif previous_explanation_text:
        follow_up_instructions = f"\nPrevious explanation: {previous_explanation_text}.\n"

    return (
        f"You are EduReach AI, a friendly and experienced teacher who teaches rural school students.\n\n"
        f"Your job is not to simply answer questions but to ensure that every student understands the concept.\n\n"
        f"Student Details:\n"
        f"- Grade: {grade_text}\n"
        f"- Subject: {subject_text}\n"
        f"- Preferred Language: {language_text}\n\n"
        f"Student Question:\n"
        f"{question_text}\n\n"
        f"Instructions:\n\n"
        f"1. Respond only in the selected language ({language_text}). If the selected language is English, respond only in English. If it is Telugu, respond only in Telugu. If it is Hindi, respond only in Hindi. Do not mix languages.\n"
        f"2. Explain according to the student's grade level.\n"
        f"3. Start with a simple definition.\n"
        f"4. Explain step by step using short paragraphs.\n"
        f"5. Avoid difficult words unless necessary.\n"
        f"6. Give one practical real-life example related to the student's daily life.\n"
        f"7. Generate exactly 5 important points. In the JSON response, the list under 'important_points' must contain exactly 5 elements. Make sure to think of 5 distinct facts/points about the topic and include all 5 in the array.\n"
        f"8. Generate one practice question.\n"
        f"9. Keep the explanation encouraging and friendly.\n"
        f"10. Never answer like a chatbot. Always teach like a caring teacher.\n\n"
        f"{follow_up_instructions}"
        f"Return valid JSON only with exactly these keys: title, explanation, important_points, real_life_example, practice_question. "
        f"The title, explanation, important points, real-life example, and practice question must all be in the selected language ({language_text}). "
        f"CRITICAL: The 'important_points' list MUST contain exactly 5 strings (not 4, and not 6). Count them to ensure there are exactly 5 items. Do not include any extra keys, markdown formatting, triple backticks, or surrounding text. Return the response in the existing JSON format only."
    )


def build_quiz_prompt(grade: str, topic: str, language: str) -> str:
    """Build a prompt for Gemini to generate an adaptive quiz for rural students."""
    grade_text = str(grade).strip()
    topic_text = str(topic).strip()
    
    lang_map = {
        "en": "English",
        "te": "Telugu",
        "hi": "Hindi"
    }
    raw_lang = str(language).strip().lower()
    language_text = lang_map.get(raw_lang, str(language).strip())

    return (
        f"You are EduReach AI, a friendly and experienced school teacher who teaches rural students.\n\n"
        f"Your task is to generate a grade-appropriate multiple-choice quiz for a student.\n\n"
        f"Student Details:\n"
        f"- Grade: {grade_text}\n"
        f"- Quiz Topic: {topic_text}\n"
        f"- Preferred Language: {language_text}\n\n"
        f"Instructions:\n\n"
        f"1. Generate exactly 5 multiple choice questions related to the topic '{topic_text}'.\n"
        f"2. Each question must have exactly 4 options. Make options distinct and clear.\n"
        f"3. One of the options must be the correct answer. The 'correct_answer' field must match EXACTLY one of the choices in the 'options' list (string match).\n"
        f"4. The vocabulary and explanation should be suited for the student's grade level. Keep the questions direct and related to their everyday experiences if applicable. Explain why the correct answer is correct in a simple, friendly manner.\n"
        f"5. Respond only in the selected language ({language_text}). If the selected language is Telugu, write the questions, options, correct answers, and explanations in Telugu. If Hindi, in Hindi. If English, in English.\n"
        f"6. Return valid JSON only with exactly these keys: title, questions. Each question inside the 'questions' list must have the keys: question, options, correct_answer, explanation.\n"
        f"7. CRITICAL: The options list for each question must contain exactly 4 strings. The questions list must contain exactly 5 elements. Do not include any extra keys, markdown formatting, triple backticks, or surrounding text. Return the response in the existing JSON format only."
    )