from fastapi import APIRouter, HTTPException

from app.supabase_client import supabase
from app.access import ensure_user_access

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/topic/{user_id}")
async def topic_analytics(user_id: str):
    ensure_user_access(user_id)
    try:
        result = (
            supabase.table("topic_performance")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        return {
            "message": "Topic performance retrieved successfully",
            "data": result.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get topic analytics: {str(e)}",
        )


@router.get("/bloom/{user_id}")
async def bloom_analytics(user_id: str):
    ensure_user_access(user_id)
    try:
        result = (
            supabase.table("bloom_performance")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        return {
            "message": "Bloom performance retrieved successfully",
            "data": result.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Bloom analytics: {str(e)}",
        )


@router.get("/difficulty/{user_id}")
async def difficulty_analytics(user_id: str):
    ensure_user_access(user_id)
    try:
        result = (
            supabase.table("difficulty_performance")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        return {
            "message": "Difficulty performance retrieved successfully",
            "data": result.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get difficulty analytics: {str(e)}",
        )


@router.get("/weak-topics/{user_id}")
async def weak_topics(user_id: str):
    ensure_user_access(user_id)
    try:
        result = (
            supabase.table("topic_performance")
            .select("*")
            .eq("user_id", user_id)
            .lt("accuracy_pct", 50)
            .order("accuracy_pct", desc=False)
            .execute()
        )

        return {
            "message": "Weak topics retrieved successfully",
            "data": result.data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get weak topics: {str(e)}",
        )
