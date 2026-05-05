import os
import jwt
from fastapi import Header, HTTPException

DEV_USER_ID = "00000000-0000-0000-0000-000000000001"
_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")


def get_user_id(authorization: str = Header(default="")) -> str:
    # No secret configured → local dev fallback
    if not _JWT_SECRET:
        return DEV_USER_ID

    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization header required. Please sign in.")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            _JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid session token.")
