from fastapi import APIRouter, UploadFile, File, HTTPException
from app.db import supabase
from app.services.vision import parse_receipt
from app.services.pantry_state import ingest_items
from datetime import datetime, timezone

router = APIRouter()

# Hardcoded user for V1 (single user — you)
DEV_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.post("/receipts")
async def upload_receipt(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(400, "Only JPEG and PNG receipts supported")

    image_bytes = await file.read()
    media_type = file.content_type

    # Store receipt record
    receipt = supabase.table("receipts").insert({
        "user_id": DEV_USER_ID,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    receipt_id = receipt.data[0]["id"]

    # Parse receipt via Claude Vision
    items = parse_receipt(image_bytes, media_type)
    if not items:
        raise HTTPException(422, "Could not extract items from receipt")

    # Update pantry state
    ingest_items(DEV_USER_ID, items, receipt_id)

    return {"receipt_id": receipt_id, "items_found": len(items), "items": items}
