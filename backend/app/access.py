import os

from fastapi import HTTPException

DEMO_USER_ID = os.getenv("APP_USER_ID", "23285917-fe1a-471d-9d6b-b1ec51abd271")


def ensure_user_access(user_id: str) -> str:
    if user_id != DEMO_USER_ID:
        raise HTTPException(status_code=403, detail="You do not have permission to access this user data")
    return user_id