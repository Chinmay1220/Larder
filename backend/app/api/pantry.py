from fastapi import APIRouter, Query, HTTPException
from app.services.pantry_state import get_pantry, get_expiring, mark_consumed
from app.api.receipts import DEV_USER_ID
from datetime import datetime, timezone

router = APIRouter()


@router.get("/pantry")
def pantry():
    return get_pantry(DEV_USER_ID)


@router.get("/pantry/expiring")
def expiring(days: int = Query(default=3, ge=1, le=30)):
    return get_expiring(DEV_USER_ID, days)


@router.patch("/pantry/{item_id}/consumed")
def consume(item_id: str):
    updated = mark_consumed(DEV_USER_ID, item_id)
    if not updated:
        raise HTTPException(404, "Item not found")
    return {"ok": True}
