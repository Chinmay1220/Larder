from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends
from PIL import Image
import io
from app.db import supabase
from app.limiter import limiter
from app.auth import get_user_id
from app.services.vision import parse_receipt
from app.services.pantry_state import ingest_items
from datetime import datetime, timezone

router = APIRouter()

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
TEXT_TYPES  = {
    "text/plain", "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_TYPES = IMAGE_TYPES | TEXT_TYPES | {"application/pdf"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/receipts")
@limiter.limit("10/minute")
async def upload_receipt(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_user_id),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Unsupported file type. Please upload a JPEG, PNG, WebP, GIF, PDF, Excel, Word, CSV, or TXT file.")

    file_bytes = await file.read(MAX_BYTES + 1)
    if len(file_bytes) > MAX_BYTES:
        raise HTTPException(413, "File is too large. Please use a file under 10 MB.")

    if file.content_type == "application/pdf":
        if not file_bytes.startswith(b"%PDF"):
            raise HTTPException(400, "File is not a valid PDF.")
    elif file.content_type in IMAGE_TYPES:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify()
        except Exception:
            raise HTTPException(400, "File is not a valid image.")

    receipt = supabase.table("receipts").insert({
        "user_id": user_id,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    receipt_id = receipt.data[0]["id"]

    items = parse_receipt(file_bytes, file.content_type)
    if not items:
        raise HTTPException(422, "No items found. Make sure the file contains a grocery receipt.")

    ingest_items(user_id, items, receipt_id)

    return {"receipt_id": receipt_id, "items_found": len(items), "items": items}
