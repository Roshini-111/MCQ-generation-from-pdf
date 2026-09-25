import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai

from app.supabase_client import supabase
from app.access import ensure_user_access

router = APIRouter(prefix="/test-solver", tags=["test-solver"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)


class TestSolverRequest(BaseModel):
    user_id: str
    input_text: str
    answer_style: str = "Detailed"


@router.post("/solve")
async def solve_test(req: TestSolverRequest):
    ensure_user_access(req.user_id)
    try:
        allowed_styles = ["Short", "Detailed", "Exam", "Point-wise"]

        if req.answer_style not in allowed_styles:
            raise HTTPException(
                status_code=400,
                detail="Invalid answer style",
            )

        prompt = f"""
You are an AI academic test solver.

Answer the following question(s) accurately.

Answer style: {req.answer_style}

Instructions:
- Understand each question carefully.
- Provide the correct answer.
- Give an explanation.
- Do not invent information.
- If the question is unclear, mention that it is unclear.
- If multiple questions are provided, answer them separately.

Question(s):

{req.input_text}
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )

        output_text = response.text

        result = (
            supabase.table("test_solver_runs")
            .insert({
                "user_id": req.user_id,
                "input_text": req.input_text,
                "answer_style": req.answer_style,
                "output_text": output_text,
            })
            .execute()
        )

        return {
            "message": "Test solved successfully",
            "answer_style": req.answer_style,
            "answer": output_text,
            "run_id": result.data[0]["id"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to solve test: {str(e)}",
        )


@router.get("/history/{user_id}")
async def solver_history(user_id: str):
    ensure_user_access(user_id)
    try:
        result = (
            supabase.table("test_solver_runs")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Test solver history retrieved successfully",
            "count": len(result.data),
            "data": result.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get solver history: {str(e)}",
        )
