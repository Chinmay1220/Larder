# Pantry App — Technical Documentation
### Architecture decisions, stack, and build log

---

## Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Mobile | React Native (Expo) | Cross-platform (iOS + Android), native camera access |
| Web | Next.js 14 (App Router) | React-based, deploys to Vercel in one click |
| Backend | FastAPI (Python) | Async, fast, Python ecosystem for AI/data work |
| Database | Supabase (Postgres) | Managed Postgres + auth + storage + real-time, free tier |
| AI / Vision | Claude claude-sonnet-4-6 (Anthropic) | Vision API for receipt parsing + item normalization |
| Hosting (backend) | Railway or Fly.io | Simple container deploy, free tier |
| Hosting (web) | Vercel | Zero-config Next.js deploy |
| CI/CD + Cron | GitHub Actions | Auto-deploy on push + nightly depletion job |
| Payments | Stripe | V2 — not in scope for V1 |

---

## Monorepo Structure

```
pantry-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── receipts.py        # POST /receipts
│   │   │   ├── pantry.py          # GET /pantry, GET /pantry/expiring
│   │   │   └── alerts.py
│   │   ├── services/
│   │   │   ├── vision.py          # Claude Vision receipt parser
│   │   │   ├── normalizer.py      # raw → structured item
│   │   │   ├── pantry_state.py    # depletion + re-purchase logic
│   │   │   └── alerts.py
│   │   ├── models/
│   │   │   ├── receipt.py
│   │   │   └── pantry_item.py
│   │   └── db.py                  # Supabase client
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── mobile/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Pantry screen
│   │   │   ├── camera.tsx         # Receipt scan screen
│   │   │   └── expiring.tsx       # Expiring soon screen
│   │   └── _layout.tsx
│   ├── components/
│   ├── api/client.ts              # API calls to backend
│   └── package.json
├── web/
│   ├── app/
│   │   ├── page.tsx               # Pantry dashboard
│   │   ├── scan/page.tsx          # Upload receipt
│   │   └── expiring/page.tsx
│   ├── components/
│   └── package.json
├── .github/
│   └── workflows/
│       ├── deploy.yml             # Auto-deploy backend on push
│       └── nightly.yml            # Nightly depletion cron
├── poc.py                         # Original POC script (keep for reference)
├── STORY.md
└── TECHNICAL.md
```

---

## Database Schema (Supabase / Postgres)

```sql
-- Users (managed by Supabase Auth)
-- supabase auth.users table is auto-created

-- Every receipt uploaded
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(10,2),
    image_url TEXT,           -- Supabase Storage URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live pantry state
CREATE TABLE pantry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    canonical_name TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC,
    unit TEXT,
    price NUMERIC(10,2),
    purchased_at TIMESTAMP WITH TIME ZONE,
    est_expiry TIMESTAMP WITH TIME ZONE,
    shelf_life_days INTEGER,
    status TEXT DEFAULT 'active',   -- active | consumed_inferred | expired | consumed_manual
    consumed_at TIMESTAMP WITH TIME ZONE,
    source_receipt_id UUID REFERENCES receipts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pantry_user_status ON pantry_items(user_id, status);
CREATE INDEX idx_pantry_expiry ON pantry_items(est_expiry) WHERE status = 'active';
```

---

## API Endpoints

```
POST   /receipts              Upload receipt image → triggers Vision pipeline
GET    /pantry                List active pantry items for current user
GET    /pantry/expiring       Items expiring in next N days (default 3)
PATCH  /pantry/{id}/consumed  Mark item as manually consumed
GET    /alerts/pre-shop       Summary of what user already has (for pre-shop alert)
```

---

## Receipt Processing Pipeline

```
1. Mobile/Web uploads image to Supabase Storage
2. POST /receipts called with image URL
3. FastAPI downloads image, encodes to base64
4. Single Claude Vision API call:
   - Reads receipt image
   - Extracts + normalizes items in one shot
   - Returns JSON array of structured items
5. Re-purchase inference:
   - For each new item, check if same canonical_name exists with status='active'
   - If yes → mark old as 'consumed_inferred'
6. Insert new pantry_items rows with est_expiry = purchased_at + shelf_life_days
7. Return extracted items to client
```

---

## Claude Vision Prompt (current)

```
You are a grocery-receipt parser. Look at this receipt image and extract 
every purchased food/household item.

Ignore: store name, totals, tax, subtotals, tender, change, cashier, 
loyalty points, coupons, non-food fees.

For each item return:
- canonical_name: lowercase common name ("blueberries", not "BLUBRY PNT 6OZ")
- category: one of [produce, dairy, meat, seafood, bakery, pantry, frozen, 
  beverage, snack, household, other]
- quantity: number (default 1 if unclear)
- unit: "oz"|"lb"|"g"|"kg"|"ct"|"pack"|"bottle"|"can"|"each"
- shelf_life_days: realistic days until spoilage
- price: number if visible, else null

Return ONLY a JSON array. No prose. No markdown fences.
```

---

## Depletion Model

| Signal | How it works |
|--------|-------------|
| Re-purchase inference | If item X is bought again, previous X marked `consumed_inferred` |
| Shelf life decay | `est_expiry = purchased_at + shelf_life_days` (set at ingest time) |
| Manual consumed | User taps "used it up" button → status = `consumed_manual` |
| Nightly cron | Items past `est_expiry` flagged as `expired` |

---

## GitHub Actions Workflows

### nightly.yml (depletion cron)
```yaml
on:
  schedule:
    - cron: '0 6 * * *'   # 2am EST daily
jobs:
  depletion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r backend/requirements.txt
      - run: python backend/scripts/nightly_depletion.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

### deploy.yml (auto-deploy backend)
```yaml
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Environment Variables

```
# Backend
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Mobile / Web
EXPO_PUBLIC_API_URL=https://your-backend.railway.app
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## POC Results (Day 1)

**Receipt tested:** Instacart order — Plums 3lb, Gold Potatoes 10lb, Golden Pineapple, Kirkland Paper Towels 12-roll. Total $37.57.

**Output:**
```
ACTIVE PANTRY (4 items)
golden pineapple     1each    produce    exp 2026-04-29
plums                3lb      produce    exp 2026-05-06
gold potatoes        10lb     produce    exp 2026-05-22
kirkland paper towels 12 rolls 1pack    household  exp 2036-04-19

PRE-SHOP ALERT:
  household: kirkland signature paper towels 2-ply 12 rolls
  produce: gold potatoes, golden pineapple, plums
```

**Verdict:** Core pipeline validated. Vision API correctly extracted all items, ignored totals/tax/fees, assigned realistic shelf lives, and categorized household vs food items.

---

## Day 2 Plan

- [ ] Create GitHub repo, push existing POC
- [ ] Set up Supabase project (database + storage + auth)
- [ ] Scaffold FastAPI backend with `/receipts` endpoint
- [ ] Port POC vision pipeline into `services/vision.py`
- [ ] Set up Expo React Native project with camera screen
- [ ] Scaffold Next.js web project
- [ ] Connect mobile → backend → Supabase end to end
