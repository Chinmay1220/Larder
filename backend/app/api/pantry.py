from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.auth import get_user_id
from app.services.pantry_state import get_pantry, get_expiring, mark_consumed, update_item, delete_item, decrement_item

router = APIRouter()


class ItemUpdate(BaseModel):
    canonical_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    est_expiry: Optional[str] = None


@router.get("/pantry")
def pantry(user_id: str = Depends(get_user_id)):
    return get_pantry(user_id)


@router.get("/pantry/expiring")
def expiring(
    days: int = Query(default=3, ge=1, le=30),
    user_id: str = Depends(get_user_id),
):
    return get_expiring(user_id, days)


@router.patch("/pantry/{item_id}/consumed")
def consume(item_id: str, user_id: str = Depends(get_user_id)):
    updated = mark_consumed(user_id, item_id)
    if not updated:
        raise HTTPException(404, "Item not found")
    return {"ok": True}


@router.patch("/pantry/{item_id}/decrement")
def decrement(item_id: str, user_id: str = Depends(get_user_id)):
    result = decrement_item(user_id, item_id)
    if result is None:
        raise HTTPException(404, "Item not found")
    return result


@router.patch("/pantry/{item_id}")
def update(item_id: str, body: ItemUpdate, user_id: str = Depends(get_user_id)):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields to update")
    updated = update_item(user_id, item_id, fields)
    if not updated:
        raise HTTPException(404, "Item not found")
    return updated


@router.delete("/pantry/{item_id}")
def delete(item_id: str, user_id: str = Depends(get_user_id)):
    deleted = delete_item(user_id, item_id)
    if not deleted:
        raise HTTPException(404, "Item not found")
    return {"ok": True}
