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
MAX_IMAGE_PIXELS = 50_000_000  # 50 megapixels — guards against decompression bombs

# File magic bytes — content type alone is client-supplied and untrusted.
IMAGE_MAGIC = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png":  [b"\x89PNG\r\n\x1a\n"],
    "image/gif":  [b"GIF87a", b"GIF89a"],
    "image/webp": [b"RIFF"],  # additional "WEBP" check below
}
OFFICE_MAGIC = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [b"PK\x03\x04"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [b"PK\x03\x04"],
    "application/vnd.ms-excel": [b"\xd0\xcf\x11\xe0", b"PK\x03\x04"],
    "application/msword": [b"\xd0\xcf\x11\xe0", b"PK\x03\x04"],
}


def _matches_magic(file_bytes: bytes, content_type: str) -> bool:
    """Verify the file's leading bytes match its claimed content type."""
    if content_type == "application/pdf":
        return file_bytes.startswith(b"%PDF")
    if content_type in IMAGE_MAGIC:
        if not any(file_bytes.startswith(m) for m in IMAGE_MAGIC[content_type]):
            return False
        # WebP: after RIFF + 4 size bytes, expect "WEBP"
        if content_type == "image/webp":
            return len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP"
        return True
    if content_type in OFFICE_MAGIC:
        return any(file_bytes.startswith(m) for m in OFFICE_MAGIC[content_type])
    # Plain text / CSV — no magic bytes, accept as-is
    if content_type in {"text/plain", "text/csv"}:
        return True
    return False


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

    # Verify magic bytes — never trust client-supplied Content-Type alone
    if not _matches_magic(file_bytes, file.content_type):
        raise HTTPException(400, "File contents do not match the declared type.")

    if file.content_type in IMAGE_TYPES:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify()
            # Re-open after verify (verify exhausts the stream) to check dimensions
            img2 = Image.open(io.BytesIO(file_bytes))
            w, h = img2.size
            if w * h > MAX_IMAGE_PIXELS:
                raise HTTPException(413, "Image dimensions are too large.")
        except HTTPException:
            raise
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
