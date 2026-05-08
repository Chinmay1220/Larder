from datetime import datetime
from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from app.auth import get_user_id
from app.services.pantry_state import get_pantry, get_expiring, mark_consumed, update_item, delete_item, decrement_item, create_item

router = APIRouter()

VALID_CATEGORIES = {
    "produce", "dairy", "meat", "seafood", "bakery",
    "pantry", "frozen", "beverage", "snack", "household", "other",
}
VALID_UNITS = {"oz", "lb", "g", "kg", "ct", "pack", "bottle", "can", "each", "ml", "l", "item"}


class ItemCreate(BaseModel):
    canonical_name: str = Field(..., min_length=1, max_length=200)
    category: str = "other"
    quantity: float = Field(default=1, gt=0, le=9999)
    unit: str = Field(default="each", max_length=50)
    est_expiry: str  # ISO date string, required

    @field_validator("canonical_name")
    @classmethod
    def strip_name(cls, v): return v.strip().lower()

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return v

    @field_validator("est_expiry")
    @classmethod
    def validate_expiry(cls, v):
        try:
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("Must be a valid ISO date string")
        return v


class ItemUpdate(BaseModel):
    canonical_name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0, le=9999)
    unit: Optional[str] = Field(None, max_length=50)
    est_expiry: Optional[str] = None

    @field_validator("canonical_name")
    @classmethod
    def strip_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(f"Must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return v

    @field_validator("est_expiry")
    @classmethod
    def validate_expiry(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            try:
                datetime.fromisoformat(v.replace("Z", "+00:00"))
            except ValueError:
                raise ValueError("Must be a valid ISO date string (e.g. 2026-05-10T00:00:00Z)")
        return v


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


@router.post("/pantry", status_code=201)
def create(body: ItemCreate, user_id: str = Depends(get_user_id)):
    item = create_item(user_id, body.model_dump())
    return item


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
