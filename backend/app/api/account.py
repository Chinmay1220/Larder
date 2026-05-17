import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from app.auth import get_user_id
from app.db import supabase
from app.limiter import limiter

router = APIRouter()
log = logging.getLogger(__name__)


@router.delete("/account")
@limiter.limit("3/hour")
def delete_account(request: Request, user_id: str = Depends(get_user_id)):
    """
    Delete a user's account and all their data.
    - Removes all pantry_items rows
    - Removes all receipts rows
    - Deletes the auth user from Supabase

    This is irreversible. Rate-limited to 3 attempts per hour per IP.
    """
    try:
        supabase.table("pantry_items").delete().eq("user_id", user_id).execute()
        supabase.table("receipts").delete().eq("user_id", user_id).execute()
        supabase.auth.admin.delete_user(user_id)
        log.info("account_deleted user_id=%s", user_id)
    except Exception:
        # Log full exception server-side; never leak it to the client
        log.exception("account_deletion_failed user_id=%s", user_id)
        raise HTTPException(500, "Account deletion failed. Please try again later.")

    return {"ok": True}
