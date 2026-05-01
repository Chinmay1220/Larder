from datetime import datetime, timedelta, timezone
from app.db import supabase


def ingest_items(user_id: str, items: list[dict], receipt_id: str):
    now = datetime.now(timezone.utc)

    for item in items:
        canonical = item.get("canonical_name", "").lower().strip()
        if not canonical:
            continue

        # Re-purchase inference: mark previous active entry as consumed
        supabase.table("pantry_items").update({
            "status": "consumed_inferred",
            "consumed_at": now.isoformat(),
        }).eq("user_id", user_id).eq("canonical_name", canonical).eq("status", "active").execute()

        shelf_life = item.get("shelf_life_days") or 14
        est_expiry = now + timedelta(days=shelf_life)

        supabase.table("pantry_items").insert({
            "user_id": user_id,
            "canonical_name": canonical,
            "category": item.get("category", "other"),
            "quantity": item.get("quantity", 1),
            "unit": item.get("unit", "each"),
            "price": item.get("price"),
            "purchased_at": now.isoformat(),
            "est_expiry": est_expiry.isoformat(),
            "shelf_life_days": shelf_life,
            "source_receipt_id": receipt_id,
            "status": "active",
        }).execute()


def get_pantry(user_id: str) -> list[dict]:
    res = supabase.table("pantry_items") \
        .select("*") \
        .eq("user_id", user_id) \
        .in_("status", ["active", "expired"]) \
        .order("est_expiry") \
        .execute()
    return res.data


def get_expiring(user_id: str, days: int = 3) -> list[dict]:
    cutoff = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
    res = supabase.table("pantry_items") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("status", "active") \
        .lte("est_expiry", cutoff) \
        .order("est_expiry") \
        .execute()
    return res.data


def mark_consumed(user_id: str, item_id: str) -> bool:
    res = supabase.table("pantry_items").update({
        "status": "consumed_manual",
        "consumed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", item_id).eq("user_id", user_id).in_("status", ["active", "expired"]).execute()
    return len(res.data) > 0
