from fastapi import APIRouter, Query, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.pantry_state import get_pantry, get_expiring, mark_consumed, update_item, delete_item, decrement_item
from app.api.receipts import DEV_USER_ID

router = APIRouter()


class ItemUpdate(BaseModel):
    canonical_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    est_expiry: Optional[str] = None


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


@router.patch("/pantry/{item_id}/decrement")
def decrement(item_id: str, x_user_id: str = Header(default=DEV_USER_ID)):
    result = decrement_item(x_user_id, item_id)
    if result is None:
        raise HTTPException(404, "Item not found")
    return result


@router.patch("/pantry/{item_id}")
def update(item_id: str, body: ItemUpdate, x_user_id: str = Header(default=DEV_USER_ID)):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields to update")
    updated = update_item(x_user_id, item_id, fields)
    if not updated:
        raise HTTPException(404, "Item not found")
    return updated


@router.delete("/pantry/{item_id}")
def delete(item_id: str, x_user_id: str = Header(default=DEV_USER_ID)):
    deleted = delete_item(x_user_id, item_id)
    if not deleted:
        raise HTTPException(404, "Item not found")
    return {"ok": True}
