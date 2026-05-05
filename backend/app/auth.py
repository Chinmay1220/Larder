import os
import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException

DEV_USER_ID = "00000000-0000-0000-0000-000000000001"
_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
_DEV_MODE = os.environ.get("DEV_MODE", "").lower() == "true"
_SUPABASE_URL = os.environ.get("SUPABASE_URL", "")

_jwks_client: "PyJWKClient | None" = None


def _get_jwks_client() -> "PyJWKClient | None":
    global _jwks_client
    if _jwks_client is None and _SUPABASE_URL:
        _jwks_client = PyJWKClient(
            f"{_SUPABASE_URL}/auth/v1/.well-known/jwks.json",
            cache_keys=True,
        )
    return _jwks_client


def get_user_id(authorization: str = Header(default="")) -> str:
    if not _JWT_SECRET and not _SUPABASE_URL:
        if _DEV_MODE:
            return DEV_USER_ID
        raise HTTPException(
            500,
            "Server misconfigured: SUPABASE_JWT_SECRET not set. "
            "Set DEV_MODE=true for local development.",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization header required. Please sign in.")

    token = authorization.split(" ", 1)[1]

    # Try ES256 via JWKS first (Supabase default since 2025)
    client = _get_jwks_client()
    if client:
        try:
            signing_key = client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
            )
            return payload["sub"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Session expired. Please sign in again.")
        except Exception:
            pass  # fall through to HS256 legacy path

    # Fallback: HS256 with legacy shared secret
    if _JWT_SECRET:
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

    raise HTTPException(401, "Invalid session token.")
