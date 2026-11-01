import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from file_reader import read_file

# Robust .env loading from Backend/.env or current working directory
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = None
if api_key:
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print("Warning: Failed to initialize Gemini Client:", e)

# Models prioritized by performance and availability
MODELS_POOL = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest"
]


def _clean_json_text(text: str) -> str:
    """Strip markdown code fence blocks if Gemini wraps JSON."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _call_gemini(prompt: str) -> str:
    """Execute Gemini request with automatic fallback across the model pool."""
    if not client:
        raise ValueError("Gemini API key is not configured. Please set GEMINI_API_KEY in Backend/.env.")

    last_error = None
    for model_name in MODELS_POOL:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as err:
            last_error = err
            print(f"Model {model_name} error: {err}. Trying next available model...")

    if last_error:
        raise last_error
    return ""


def ask_ai(question: str, language: str = "en") -> str:
    """AI Tutor chat explanation in the requested UI language."""
    language_names = {"en": "English", "hi": "Hindi", "pa": "Punjabi"}
    response_language = language_names.get(language, "English")
    prompt = f"""
You are Vidya Verse, an intelligent, empathetic AI tutor for college and BCA students.

Explain the following topic or answer the question in a simple, structured, and easy-to-understand way.

Guidelines:
1. Write the complete answer in {response_language}. Keep technical terms, code, and standard computer-science keywords in English when that is clearer; explain them in {response_language}.
2. Structure with clear sections, bullet points, and short readable paragraphs.
3. If code or examples are helpful, format them clearly.
4. Keep the tone encouraging, educational, and focused on helping the student succeed in their exams and concepts.

Question:
{question}
"""

    try:
        return _call_gemini(prompt)
    except Exception as e:
        print("Gemini ask_ai error:", repr(e))
        fallback = {
            "en": "I'm having trouble connecting right now. Please verify your internet connection or try again in a few moments.",
            "hi": "अभी कनेक्शन में समस्या आ रही है। कृपया इंटरनेट कनेक्शन जाँचें या कुछ देर बाद फिर कोशिश करें।",
            "pa": "ਇਸ ਵੇਲੇ ਕਨੈਕਸ਼ਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ ਜਾਂ ਕੁਝ ਦੇਰ ਬਾਅਦ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
        }
        return fallback.get(language, fallback["en"])


def analyze_document(filepath: str, language: str = "en") -> str:
    """Analyze an uploaded PDF, DOCX, or text file."""
    text = read_file(filepath)
    if not text or len(text.strip()) < 30:
        return "The document does not contain enough extractable text to analyze."

    # Prevent exceeding reasonable token limits
    text_snippet = text[:18000]

    language_names = {"en": "English", "hi": "Hindi", "pa": "Punjabi"}
    response_language = language_names.get(language, "English")
    prompt = f"""
You are Vidya Verse, an expert academic document analyzer.
Write all explanatory text in {response_language}; preserve original technical terms and code where appropriate.

Analyze the following study material thoroughly and provide a structured, student-friendly breakdown with:

## 1. Executive Summary
(A concise, high-level overview of the material)

## 2. Key Concepts & Important Points
(Bullet points highlighting core exam-relevant ideas)

## 3. Important Definitions & Terminology
(Clear definitions of crucial terms introduced in the text)

## 4. Exam & Revision Tips
(Key questions likely to be asked, common pitfalls, and study advice)

Study Material:
{text_snippet}
"""

    try:
        return _call_gemini(prompt)
    except Exception as e:
        print("Gemini analyze_document error:", repr(e))
        return f"Document analysis encountered an error: {str(e)}"


def generate_quiz(filepath: str) -> list:
    """Generate 10 multiple-choice questions from a study document."""
    text = read_file(filepath)
    if not text or len(text.strip()) < 60:
        raise ValueError("Could not extract enough text from the study file to generate a quiz.")

    text_snippet = text[:20000]

    prompt = f"""
You are Vidya Verse, an academic quiz generator.

Generate a comprehensive 10-question multiple-choice quiz based ONLY on the study material below.

Rules:
1. Every question must have exactly 4 choices (index 0, 1, 2, 3).
2. The correct answer MUST be an integer index (0, 1, 2, or 3).
3. Exactly 10 questions covering diverse concepts from the document.
4. Output MUST be ONLY valid JSON matching the format below, with NO markdown code fences and no conversational text.

Format:
[
  {{
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0
  }}
]

Study Material:
{text_snippet}
"""

    try:
        raw_output = _call_gemini(prompt)
        cleaned = _clean_json_text(raw_output)
        quiz = json.loads(cleaned)

        if not isinstance(quiz, list):
            raise ValueError("Expected a list of questions.")

        validated = []
        for i, q in enumerate(quiz):
            if "question" in q and "options" in q and "answer" in q:
                if len(q["options"]) == 4 and q["answer"] in [0, 1, 2, 3]:
                    validated.append({
                        "question": str(q["question"]),
                        "options": [str(opt) for opt in q["options"]],
                        "answer": int(q["answer"])
                    })

        if len(validated) >= 3:
            return validated
        raise ValueError("Insufficient valid questions generated from response.")

    except Exception as e:
        print("QUIZ GENERATION ERROR:", repr(e))
        raise


def generate_study_plan(filepath: str, language: str = "en") -> dict:
    """Generate a daily study plan based on topics in a document."""
    text = read_file(filepath)
    text_snippet = text[:15000]

    language_names = {"en": "English", "hi": "Hindi", "pa": "Punjabi"}
    response_language = language_names.get(language, "English")
    prompt = f"""
You are Vidya Verse, an AI academic study planner.
Write the plan title, task topics, duration labels, and priorities in {response_language}.

Read the student's study material and create an actionable, structured daily study plan.

Rules:
1. Create 4 to 6 study tasks based specifically on the topics in the text.
2. Study durations should be between 20 and 60 minutes.
3. Prioritize high-importance and challenging topics.
4. Return ONLY valid JSON with no markdown formatting.

Format:
{{
  "title": "Personalized Study Plan",
  "tasks": [
    {{
      "topic": "Topic Name",
      "duration": "30 minutes",
      "priority": "High"
    }}
  ]
}}

Study Material:
{text_snippet}
"""

    try:
        raw_output = _call_gemini(prompt)
        cleaned = _clean_json_text(raw_output)
        return json.loads(cleaned)

    except Exception as e:
        print("Study Plan Generation Error:", repr(e))
        return {
            "title": "Today's Study Plan",
            "tasks": [
                {"topic": "Review Introduction & Core Definitions", "duration": "30 minutes", "priority": "High"},
                {"topic": "Deep Dive into Key Concepts", "duration": "45 minutes", "priority": "Medium"},
                {"topic": "Practice Summary & Exam Questions", "duration": "25 minutes", "priority": "High"}
            ]
        }