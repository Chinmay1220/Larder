import os
from datetime import datetime, timezone
from supabase import create_client

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_KEY"]
supabase = create_client(url, key)

now = datetime.now(timezone.utc)

res = supabase.table("pantry_items").update({
    "status": "expired",
}).eq("status", "active").lte("est_expiry", now.isoformat()).execute()

count = len(res.data)
print(f"[{now.date()}] Flagged {count} item(s) as expired.")
