"""
Invisible Pantry POC
--------------------
Drop grocery receipt photos into ./receipts/, run this script, get:
  - normalized pantry state (pantry.json)
  - terminal alerts: what's expiring, what you already have
Flow: Claude Vision (OCR + normalize in one call) -> pantry dict -> print.
"""

import base64
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from anthropic import Anthropic

ROOT = Path(__file__).parent
RECEIPTS_DIR = ROOT / "receipts"
PANTRY_FILE = ROOT / "pantry.json"
PROCESSED_FILE = ROOT / "processed.json"

MODEL = "claude-sonnet-4-6"

VISION_PROMPT = """You are a grocery-receipt parser. Look at this receipt image and extract every purchased food/household item.

Ignore: store name, totals, tax, subtotals, tender, change, cashier, loyalty points, coupons, non-food fees.

For each item return:
- canonical_name: lowercase common name ("blueberries", not "BLUBRY PNT 6OZ")
- category: one of [produce, dairy, meat, seafood, bakery, pantry, frozen, beverage, snack, household, other]
- quantity: number (default 1 if unclear)
- unit: "oz" | "lb" | "g" | "kg" | "ct" | "pack" | "bottle" | "can" | "each" (best guess)
- shelf_life_days: realistic days until spoilage. Examples: berries 7, leafy greens 5, milk 10, eggs 28, yogurt 14, chicken 3, frozen 90, canned 365, bread 7, apples 21, bananas 5, onions 30.
- price: number if visible, else null

Return ONLY a JSON array. No prose. No markdown fences. Just [{...}, {...}]."""


def load_json(path: Path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


def strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_receipt_image(client: Anthropic, image_path: Path) -> list[dict]:
    suffix = image_path.suffix.lower()
    media_type = "image/jpeg" if suffix in {".jpg", ".jpeg"} else "image/png"

    image_data = base64.standard_b64encode(image_path.read_bytes()).decode("utf-8")

    resp = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": image_data},
                },
                {"type": "text", "text": VISION_PROMPT},
            ],
        }],
    )
    raw = resp.content[0].text
    cleaned = strip_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"  [!] couldn't parse Claude output as JSON: {e}")
        print(f"  raw output: {raw[:300]}")
        return []


def ingest_receipt(client: Anthropic, image_path: Path, pantry: list, processed: list):
    receipt_id = image_path.name
    if receipt_id in processed:
        print(f"[skip] {receipt_id} already processed")
        return

    print(f"[read] {receipt_id}")
    items = parse_receipt_image(client, image_path)
    print(f"  found {len(items)} items")

    purchased_at = datetime.fromtimestamp(image_path.stat().st_mtime, tz=timezone.utc)

    for item in items:
        canonical = item.get("canonical_name", "").lower().strip()
        if not canonical:
            continue

        # Re-purchase inference: buying the same thing again => old one consumed.
        for existing in pantry:
            if existing["canonical_name"] == canonical and existing["status"] == "active":
                existing["status"] = "consumed_inferred"
                existing["consumed_at"] = purchased_at.isoformat()

        shelf_life = item.get("shelf_life_days") or 14
        est_expiry = purchased_at + timedelta(days=shelf_life)

        pantry.append({
            "canonical_name": canonical,
            "category": item.get("category", "other"),
            "quantity": item.get("quantity", 1),
            "unit": item.get("unit", "each"),
            "price": item.get("price"),
            "purchased_at": purchased_at.isoformat(),
            "est_expiry": est_expiry.isoformat(),
            "shelf_life_days": shelf_life,
            "source_receipt": receipt_id,
            "status": "active",
        })

    processed.append(receipt_id)


def print_pantry(pantry: list):
    active = [i for i in pantry if i["status"] == "active"]
    active.sort(key=lambda x: x["est_expiry"])

    print("\n" + "=" * 60)
    print(f"ACTIVE PANTRY ({len(active)} items)")
    print("=" * 60)

    now = datetime.now(timezone.utc)
    for item in active:
        expiry = datetime.fromisoformat(item["est_expiry"])
        days_left = (expiry - now).days
        flag = ""
        if days_left < 0:
            flag = "  [EXPIRED]"
        elif days_left <= 2:
            flag = f"  [!!! {days_left}d left]"
        elif days_left <= 5:
            flag = f"  [expiring in {days_left}d]"
        print(f"  {item['canonical_name']:<25} {item['quantity']}{item['unit']:<6} "
              f"{item['category']:<10} exp {expiry.date()}{flag}")


def print_shop_alerts(pantry: list):
    active = [i for i in pantry if i["status"] == "active"]
    now = datetime.now(timezone.utc)

    print("\n" + "=" * 60)
    print("PRE-SHOP ALERT — you already have:")
    print("=" * 60)

    by_category = {}
    for item in active:
        expiry = datetime.fromisoformat(item["est_expiry"])
        if expiry < now:
            continue
        by_category.setdefault(item["category"], []).append(item["canonical_name"])

    for cat, names in sorted(by_category.items()):
        unique = sorted(set(names))
        print(f"  {cat}: {', '.join(unique)}")


def main():
    if not RECEIPTS_DIR.exists():
        RECEIPTS_DIR.mkdir(parents=True)
        print(f"created {RECEIPTS_DIR}. drop receipt photos in it and re-run.")
        return

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[!] set ANTHROPIC_API_KEY env var first")
        sys.exit(1)

    pantry = load_json(PANTRY_FILE, [])
    processed = load_json(PROCESSED_FILE, [])

    images = sorted(
        p for p in RECEIPTS_DIR.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
    )
    if not images:
        print(f"no receipt images found in {RECEIPTS_DIR}")
        print("drop some .jpg or .png receipt photos in there and re-run.")
    else:
        client = Anthropic()
        for img in images:
            ingest_receipt(client, img, pantry, processed)

    save_json(PANTRY_FILE, pantry)
    save_json(PROCESSED_FILE, processed)

    print_pantry(pantry)
    print_shop_alerts(pantry)


if __name__ == "__main__":
    main()
