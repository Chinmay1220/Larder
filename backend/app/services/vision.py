import base64
import json
import re

from anthropic import Anthropic

client = Anthropic()
MODEL = "claude-sonnet-4-6"

PROMPT = """You are a grocery-receipt parser. Look at this receipt image and extract every purchased food/household item.

Ignore: store name, totals, tax, subtotals, tender, change, cashier, loyalty points, coupons, non-food fees.

For each item return:
- canonical_name: lowercase common name ("blueberries", not "BLUBRY PNT 6OZ")
- category: one of [produce, dairy, meat, seafood, bakery, pantry, frozen, beverage, snack, household, other]
- quantity: number (default 1 if unclear)
- unit: "oz" | "lb" | "g" | "kg" | "ct" | "pack" | "bottle" | "can" | "each"
- shelf_life_days: realistic days until spoilage
- price: number if visible, else null

Return ONLY a JSON array. No prose. No markdown fences."""


def _strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_receipt(file_bytes: bytes, media_type: str = "image/jpeg") -> list[dict]:
    file_data = base64.standard_b64encode(file_bytes).decode("utf-8")

    if media_type == "application/pdf":
        file_block = {
            "type": "document",
            "source": {"type": "base64", "media_type": "application/pdf", "data": file_data},
        }
    else:
        file_block = {
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": file_data},
        }

    resp = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": [file_block, {"type": "text", "text": PROMPT}],
        }],
    )

    raw = resp.content[0].text
    cleaned = _strip_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return []
