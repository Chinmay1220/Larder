from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_user_id
from app.db import supabase

router = APIRouter()


@router.delete("/account")
def delete_account(user_id: str = Depends(get_user_id)):
    """
    Delete a user's account and all their data.
    - Removes all pantry_items rows
    - Removes all receipts rows
    - Deletes the auth user from Supabase

    This is irreversible.
    """
    try:
        # Delete pantry data
        supabase.table("pantry_items").delete().eq("user_id", user_id).execute()
        supabase.table("receipts").delete().eq("user_id", user_id).execute()

        # Delete the auth user (requires service role key)
        supabase.auth.admin.delete_user(user_id)
    except Exception as e:
        raise HTTPException(500, f"Failed to delete account: {e}")

    return {"ok": True}
