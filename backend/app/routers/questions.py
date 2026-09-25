import json
import re
import time
from google import genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import GEMINI_API_KEY
from app.supabase_client import supabase
from app.access import ensure_user_access

client = genai.Client(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/questions", tags=["questions"])

#TEST_USER_ID = "YOUR_REAL_PROFILE_UUID"


class GenerateRequest(BaseModel):
    textbook_id: str
    topic: str
    num_questions: int
    difficulty: str
    bloom_level: str


PROMPT_TEMPLATE = """You are an expert exam question setter and subject teacher.

Generate {num_questions} multiple-choice questions strictly based on
the following textbook content.

Do not use outside knowledge.

TOPIC: {topic}
DIFFICULTY: {difficulty}
BLOOM'S TAXONOMY LEVEL: {bloom_level}

TEXTBOOK CONTENT:
\"\"\"
{textbook_text}
\"\"\"

RULES:
1. Each question must have exactly 4 options: A, B, C, D.
2. Only one option must be correct.
3. Distractors must be plausible.
4. Assign difficulty as Easy, Medium, or Hard.
5. Assign Bloom level as Remember, Understand, Apply, Analyze, or Evaluate.
6. Give a short explanation.
7. Do not invent facts.
8. Return ONLY valid JSON.

OUTPUT FORMAT:
[
  {{
    "question": "string",
    "options": {{
      "A": "string",
      "B": "string",
      "C": "string",
      "D": "string"
    }},
    "correct_answer": "A",
    "explanation": "string",
    "topic": "string",
    "difficulty": "Easy",
    "bloom_level": "Remember"
  }}
]
"""

VALID_DIFFICULTIES = {"Easy", "Medium", "Hard"}
VALID_BLOOM_LEVELS = {"Remember", "Understand", "Apply", "Analyze", "Evaluate"}
VALID_ANSWER_KEYS = {"A", "B", "C", "D"}


def clean_json_response(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


@router.post("/generate")
def generate_questions(req: GenerateRequest):

    # 1. Get textbook from Supabase
    try:
        textbook_result = (
            supabase
            .table("textbooks")
            .select("id, user_id, title, extracted_text")
            .eq("id", req.textbook_id)
            .single()
            .execute()
        )

        textbook = textbook_result.data

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Textbook not found: {str(e)}"
        )

    if not textbook:
        raise HTTPException(
            status_code=404,
            detail="Textbook not found"
        )

    ensure_user_access(textbook["user_id"])

    textbook_text = textbook["extracted_text"]

    # 2. Create Gemini prompt
    prompt = PROMPT_TEMPLATE.format(
        num_questions=req.num_questions,
        topic=req.topic,
        difficulty=req.difficulty,
        bloom_level=req.bloom_level,
        textbook_text=textbook_text
    )

    # 3. Generate questions using Gemini with retry/backoff for temporary 503s
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=prompt,
            )
            text = response.text
            break
        except Exception as e:
            if "503" in str(e) and attempt < 2:
                time.sleep(2 ** attempt)
                continue
            raise HTTPException(
                status_code=503,
                detail=f"Gemini temporarily unavailable. Please try again. Error: {str(e)}"
            )

    try:
        cleaned = clean_json_response(text)
        generated_questions = json.loads(cleaned)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned invalid JSON. Try again."
        )

    # 4. Save questions
    rows_to_insert = []

    for q in generated_questions:

        payload = {
            "question": q.get("question"),
            "options": q.get("options"),
            "correct_answer": q.get("correct_answer"),
            "explanation": q.get("explanation", ""),
            "topic": q.get("topic", req.topic),
            "difficulty": q.get("difficulty"),
            "bloom_level": q.get("bloom_level"),
        }
        is_valid, _ = validate_question_payload(payload)

        rows_to_insert.append({
            "textbook_id": req.textbook_id,
            "user_id": textbook["user_id"],
            "topic": q.get("topic", req.topic),
            "question": q["question"],
            "option_a": q["options"]["A"],
            "option_b": q["options"]["B"],
            "option_c": q["options"]["C"],
            "option_d": q["options"]["D"],
            "correct_answer": q["correct_answer"],
            "explanation": q.get("explanation", ""),
            "difficulty": q["difficulty"],
            "bloom_level": q["bloom_level"],
            "validation": "Approved" if is_valid else "Rejected"
        })

    try:

        result = (
            supabase
            .table("questions")
            .insert(rows_to_insert)
            .execute()
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save questions: {str(e)}"
        )

    return {
        "message": "Questions generated successfully",
        "questions": result.data
    }


def validate_question_payload(question: dict) -> tuple[bool, list[str]]:
    errors: list[str] = []

    if not isinstance(question, dict):
        return False, ["Question payload is not an object."]

    question_text = str(question.get("question", "")).strip()
    if not question_text:
        errors.append("Question text is empty.")

    options = question.get("options")
    if not isinstance(options, dict):
        errors.append("Options must be an object with A, B, C, D keys.")
        return False, errors

    normalized_values = {}
    for key in ["A", "B", "C", "D"]:
        value = str(options.get(key, "")).strip()
        normalized_values[key] = value
        if not value:
            errors.append(f"Option {key} is empty.")

    if len({v for v in normalized_values.values() if v}) != 4:
        errors.append("Options A, B, C, and D must all be unique and non-empty.")

    correct_answer = str(question.get("correct_answer", "")).strip()
    if correct_answer not in VALID_ANSWER_KEYS:
        errors.append("Correct answer must be one of: A, B, C, D.")
    elif not normalized_values.get(correct_answer):
        errors.append("Correct answer does not match a populated option.")

    explanation = str(question.get("explanation", "")).strip()
    if not explanation:
        errors.append("Explanation is required.")

    difficulty = str(question.get("difficulty", "")).strip()
    if difficulty not in VALID_DIFFICULTIES:
        errors.append(f"Difficulty must be one of: {sorted(VALID_DIFFICULTIES)}.")

    bloom_level = str(question.get("bloom_level", "")).strip()
    if bloom_level not in VALID_BLOOM_LEVELS:
        errors.append(f"Bloom level must be one of: {sorted(VALID_BLOOM_LEVELS)}.")

    topic = str(question.get("topic", "")).strip()
    if not topic:
        errors.append("Topic is required.")

    return len(errors) == 0, errors


@router.post("/validate/{question_id}")
def validate_question(question_id: str):
    try:
        result = (
            supabase
            .table("questions")
            .select("*")
            .eq("id", question_id)
            .single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=404, detail=f"Question not found: {str(exc)}")

    question = result.data
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    payload = {
        "question": question.get("question"),
        "options": {
            "A": question.get("option_a"),
            "B": question.get("option_b"),
            "C": question.get("option_c"),
            "D": question.get("option_d"),
        },
        "correct_answer": question.get("correct_answer"),
        "explanation": question.get("explanation"),
        "difficulty": question.get("difficulty"),
        "bloom_level": question.get("bloom_level"),
        "topic": question.get("topic"),
    }

    is_valid, errors = validate_question_payload(payload)
    next_status = "Approved" if is_valid else "Rejected"

    try:
        supabase.table("questions").update({"validation": next_status}).eq("id", question_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update validation status: {str(exc)}")

    return {
        "question_id": question_id,
        "valid": is_valid,
        "status": next_status,
        "errors": errors,
    }


@router.post("/validate-pending")
def validate_pending_questions():
    try:
        result = (
            supabase
            .table("questions")
            .select("*")
            .eq("validation", "Pending")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load pending questions: {str(exc)}")

    questions = result.data or []
    validated = []

    for question in questions:
        payload = {
            "question": question.get("question"),
            "options": {
                "A": question.get("option_a"),
                "B": question.get("option_b"),
                "C": question.get("option_c"),
                "D": question.get("option_d"),
            },
            "correct_answer": question.get("correct_answer"),
            "explanation": question.get("explanation"),
            "difficulty": question.get("difficulty"),
            "bloom_level": question.get("bloom_level"),
            "topic": question.get("topic"),
        }

        is_valid, errors = validate_question_payload(payload)
        status = "Approved" if is_valid else "Rejected"

        try:
            supabase.table("questions").update({"validation": status}).eq("id", question["id"]).execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to update validation status: {str(exc)}")

        validated.append({
            "question_id": question["id"],
            "valid": is_valid,
            "status": status,
            "errors": errors,
        })

    return {
        "validated": validated,
        "total_pending": len(questions),
        "total_valid": sum(1 for item in validated if item["valid"]),
        "total_rejected": sum(1 for item in validated if not item["valid"]),
    }


@router.get("/bank/{user_id}")
async def get_question_bank(user_id: str):
    ensure_user_access(user_id)
    try:
        result = (
            supabase.table("questions")
            .select("*")
            .eq("user_id", user_id)
            .eq("validation", "Approved")
            .execute()
        )

        return {
            "message": "Approved question bank retrieved successfully",
            "count": len(result.data),
            "questions": result.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch question bank: {str(e)}",
        )