from fastapi import APIRouter, Query, HTTPException, Header
from app.services.pantry_state import get_pantry, get_expiring, mark_consumed
from app.api.receipts import DEV_USER_ID

router = APIRouter()


@router.get("/pantry")
def pantry(x_user_id: str = Header(default=DEV_USER_ID)):
    return get_pantry(x_user_id)


@router.get("/pantry/expiring")
def expiring(
    days: int = Query(default=3, ge=1, le=30),
    x_user_id: str = Header(default=DEV_USER_ID),
):
    return get_expiring(x_user_id, days)


@router.patch("/pantry/{item_id}/consumed")
def consume(item_id: str, x_user_id: str = Header(default=DEV_USER_ID)):
    updated = mark_consumed(x_user_id, item_id)
    if not updated:
        raise HTTPException(404, "Item not found")
    return {"ok": True}
