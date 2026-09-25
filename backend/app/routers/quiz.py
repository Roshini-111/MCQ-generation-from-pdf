import random
from collections import defaultdict
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.supabase_client import supabase
from app.access import ensure_user_access

router = APIRouter(prefix="/quiz", tags=["quiz"])


def build_attempt_analysis(attempt_id: str) -> dict:
    answer_result = (
        supabase.table("answers")
        .select("question_id, is_correct")
        .eq("attempt_id", attempt_id)
        .execute()
    )

    grouped = {
        "topic": defaultdict(lambda: [0, 0]),
        "difficulty": defaultdict(lambda: [0, 0]),
        "bloom": defaultdict(lambda: [0, 0]),
    }

    for answer in answer_result.data or []:
        question_result = (
            supabase.table("questions")
            .select("topic, difficulty, bloom_level")
            .eq("id", answer["question_id"])
            .single()
            .execute()
        )
        question = question_result.data
        if not question:
            continue

        is_correct = answer.get("is_correct") is True
        for key, value in (
            ("topic", question.get("topic") or "General"),
            ("difficulty", question.get("difficulty") or "Unknown"),
            ("bloom", question.get("bloom_level") or "Unknown"),
        ):
            grouped[key][value][0] += 1
            grouped[key][value][1] += int(is_correct)

    def performance(data: dict) -> list[dict]:
        return [
            {
                "name": name,
                "topic": name,
                "difficulty": name,
                "level": name,
                "correct": values[1],
                "total": values[0],
                "percentage": round((values[1] / values[0]) * 100, 2) if values[0] else 0,
            }
            for name, values in data.items()
        ]

    topic_performance = performance(grouped["topic"])
    recommendations = [
        f"Review {item['topic']} again; your score was {item['percentage']}%."
        for item in topic_performance
        if item["percentage"] < 70
    ]
    if not recommendations:
        recommendations = [
            "No performance data is available because all questions in this quiz were skipped."
        ] if not topic_performance else [
            "Good progress. Try a harder adaptive quiz to keep improving."
        ]

    return {
        "topic_performance": topic_performance,
        "difficulty_performance": performance(grouped["difficulty"]),
        "bloom_performance": performance(grouped["bloom"]),
        "recommendations": recommendations,
    }


class StartQuizRequest(BaseModel):
    user_id: str
    textbook_id: str | None = None
    num_questions: int = 5
    difficulty: str = "Mixed"


class AnswerItem(BaseModel):
    question_id: str
    answer: str


class SubmitQuizRequest(BaseModel):
    user_id: str
    attempt_id: str
    answers: List[AnswerItem]


@router.post("/start")
async def start_quiz(req: StartQuizRequest):
    ensure_user_access(req.user_id)
    try:
        # Get only approved questions
        query = (
            supabase.table("questions")
            .select("*")
            .eq("user_id", req.user_id)
            .eq("validation", "Approved")
        )

        if req.difficulty != "Mixed":
            query = query.eq("difficulty", req.difficulty)

        if req.textbook_id:
            query = query.eq("textbook_id", req.textbook_id)

        result = query.execute()
        questions = result.data

        if not questions:
            if req.textbook_id:
                detail = "No approved questions are available for this material yet. Generate and approve questions first."
            else:
                detail = "No approved questions are available for this user yet. Generate and approve questions first."
            raise HTTPException(
                status_code=404,
                detail=detail,
            )

        # Randomize questions
        random.shuffle(questions)
        questions = questions[: req.num_questions]

        if len(questions) < req.num_questions:
            raise HTTPException(
                status_code=400,
                detail=f"Only {len(questions)} approved questions are available",
            )

        # Create quiz
        quiz_result = (
            supabase.table("quizzes")
            .insert({
                "user_id": req.user_id,
                "title": "Adaptive Quiz",
                "is_adaptive": True,
            })
            .execute()
        )

        quiz = quiz_result.data[0]
        quiz_id = quiz["id"]

        quiz_questions = []
        for index, question in enumerate(questions):
            quiz_questions.append({
                "quiz_id": quiz_id,
                "question_id": question["id"],
                "position": index + 1,
            })

        supabase.table("quiz_questions").insert(quiz_questions).execute()

        attempt_result = (
            supabase.table("quiz_attempts")
            .insert({
                "quiz_id": quiz_id,
                "user_id": req.user_id,
                "total_questions": len(questions),
            })
            .execute()
        )

        attempt = attempt_result.data[0]

        safe_questions = []
        for question in questions:
            safe_questions.append({
                "id": question["id"],
                "question": question["question"],
                "option_a": question["option_a"],
                "option_b": question["option_b"],
                "option_c": question["option_c"],
                "option_d": question["option_d"],
                "topic": question["topic"],
                "difficulty": question["difficulty"],
                "bloom_level": question["bloom_level"],
            })

        return {
            "message": "Quiz started successfully",
            "quiz_id": quiz_id,
            "attempt_id": attempt["id"],
            "total_questions": len(safe_questions),
            "questions": safe_questions,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start quiz: {str(e)}",
        )


@router.post("/submit")
async def submit_quiz(req: SubmitQuizRequest):
    ensure_user_access(req.user_id)
    try:
        attempt_result = (
            supabase.table("quiz_attempts")
            .select("*")
            .eq("id", req.attempt_id)
            .eq("user_id", req.user_id)
            .single()
            .execute()
        )

        attempt = attempt_result.data
        if not attempt:
            raise HTTPException(
                status_code=404,
                detail="Quiz attempt not found",
            )

        correct = 0
        wrong = 0
        answer_records = []

        for item in req.answers:
            question_result = (
                supabase.table("questions")
                .select("correct_answer")
                .eq("id", item.question_id)
                .single()
                .execute()
            )

            question = question_result.data
            if not question:
                continue

            selected = item.answer.upper()
            correct_answer = question["correct_answer"]
            is_correct = selected == correct_answer

            if is_correct:
                correct += 1
            else:
                wrong += 1

            answer_records.append({
                "attempt_id": req.attempt_id,
                "question_id": item.question_id,
                "selected_answer": selected,
                "is_correct": is_correct,
            })

        if answer_records:
            supabase.table("answers").insert(answer_records).execute()

        total = len(req.answers)
        score = round((correct / total) * 100, 2) if total else 0

        if score < 40:
            next_difficulty = "Easy"
        elif score <= 70:
            next_difficulty = "Medium"
        else:
            next_difficulty = "Hard"

        supabase.table("quiz_attempts").update({
            "score": score,
            "total_questions": total,
            "completed_at": "now()",
        }).eq("id", req.attempt_id).execute()

        return {
            "message": "Quiz submitted successfully",
            "attempt_id": req.attempt_id,
            "score": score,
            "correct": correct,
            "wrong": wrong,
            "total_questions": total,
            "next_difficulty": next_difficulty,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit quiz: {str(e)}",
        )

@router.get("/results/{attempt_id}")
async def get_quiz_results(attempt_id: str):
    try:
        attempt_result = (
            supabase.table("quiz_attempts")
            .select("*")
            .eq("id", attempt_id)
            .single()
            .execute()
        )

        attempt = attempt_result.data
        if not attempt:
            raise HTTPException(
                status_code=404,
                detail="Quiz attempt not found",
            )

        answers_result = (
            supabase.table("answers")
            .select("*")
            .eq("attempt_id", attempt_id)
            .execute()
        )

        answers = answers_result.data or []
        correct = sum(1 for answer in answers if answer.get("is_correct") is True)
        wrong = sum(1 for answer in answers if answer.get("is_correct") is False)
        total = len(answers)

        accuracy = round((correct / total) * 100, 2) if total > 0 else 0

        return {
            "message": "Quiz results retrieved successfully",
            "attempt_id": attempt_id,
            "score": attempt.get("score"),
            "total_questions": attempt.get("total_questions"),
            "answered": total,
            "correct": correct,
            "wrong": wrong,
            "accuracy": accuracy,
            "started_at": attempt.get("started_at"),
            "completed_at": attempt.get("completed_at"),
            "answers": answers,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get quiz results: {str(e)}",
        )


@router.get("/results/user/{user_id}")
async def get_user_quiz_results(user_id: str):
    ensure_user_access(user_id)
    try:
        attempts_result = (
            supabase.table("quiz_attempts")
            .select("*")
            .eq("user_id", user_id)
            .not_.is_("completed_at", "null")
            .order("completed_at", desc=True)
            .execute()
        )

        history = []
        for attempt in attempts_result.data or []:
            answers_result = (
                supabase.table("answers")
                .select("is_correct")
                .eq("attempt_id", attempt["id"])
                .execute()
            )
            answers = answers_result.data or []
            correct = sum(1 for answer in answers if answer.get("is_correct") is True)
            wrong = sum(1 for answer in answers if answer.get("is_correct") is False)
            answered = len(answers)

            history.append({
                "attempt_id": attempt["id"],
                "score": attempt.get("score") or 0,
                "correct": correct,
                "wrong": wrong,
                "skipped": max((attempt.get("total_questions") or 0) - answered, 0),
                "total_questions": attempt.get("total_questions") or 0,
                "started_at": attempt.get("started_at"),
                "completed_at": attempt.get("completed_at"),
                **build_attempt_analysis(attempt["id"]),
            })

        return {"results": history}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get quiz history: {str(e)}",
        )