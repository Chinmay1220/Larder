from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.db import supabase
from app.services.vision import parse_receipt
from app.services.pantry_state import ingest_items
from datetime import datetime, timezone

router = APIRouter()

DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.post("/receipts")
async def upload_receipt(
    file: UploadFile = File(...),
    x_user_id: str = Header(default=DEV_USER_ID),
):
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(400, "Only JPEG and PNG receipts supported")

    image_bytes = await file.read()
    media_type = file.content_type

    receipt = supabase.table("receipts").insert({
        "user_id": x_user_id,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    receipt_id = receipt.data[0]["id"]

    items = parse_receipt(image_bytes, media_type)
    if not items:
        raise HTTPException(422, "Could not extract items from receipt")

    ingest_items(x_user_id, items, receipt_id)

    return {"receipt_id": receipt_id, "items_found": len(items), "items": items}
