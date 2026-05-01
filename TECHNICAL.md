# Larder — Technical Documentation
### Architecture decisions, stack, and build log

---

## Stack

| Layer | Technology | Version | Reason |
|-------|-----------|---------|--------|
| Mobile | React Native (Expo) | — | Cross-platform iOS + Android, native camera |
| Web | Next.js | 16.2.4 | App Router, deploys to Vercel in one click |
| Backend | FastAPI (Python) | latest | Async, fast, Python AI ecosystem |
| Database | Supabase (Postgres) | managed | Managed DB + auth + storage, free tier |
| AI / Vision | Claude claude-sonnet-4-6 | latest | Vision API: receipt parsing + normalization in one call |
| Hosting (backend) | Railway | — | Simple container deploy, free tier |
| Hosting (web) | Vercel | — | Zero-config Next.js deploy |
| CI/CD + Cron | GitHub Actions | — | Auto-deploy on push + nightly depletion job |
| Payments | Stripe | — | V2 — not in scope yet |

---

## Repo Structure (actual, as of Day 2)

```
pantry-poc/                        ← root (will rename to larder/)
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app + CORS
│   │   ├── db.py                  # Supabase client init
│   │   ├── api/
│   │   │   ├── receipts.py        # POST /receipts
│   │   │   └── pantry.py          # GET /pantry, GET /pantry/expiring, PATCH /pantry/{id}/consumed
│   │   └── services/
│   │       ├── vision.py          # Claude Vision receipt parser
│   │       └── pantry_state.py    # ingest_items, get_pantry, get_expiring, mark_consumed
│   ├── .env                       # secrets (gitignored)
│   └── requirements.txt
├── web/
│   ├── app/
│   │   ├── layout.tsx             # Fonts (DM Serif Display + Inter) + AppShell wrapper
│   │   ├── AppShell.tsx           # Sidebar (desktop) + bottom nav (mobile)
│   │   ├── globals.css            # Tailwind v4 design tokens (@theme inline)
│   │   ├── page.tsx               # Pantry dashboard
│   │   └── scan/
│   │       └── page.tsx           # Receipt upload + results
│   ├── .env.local                 # NEXT_PUBLIC_API_URL (gitignored)
│   └── package.json
├── poc.py                         # Original proof-of-concept script (keep for reference)
├── receipts/                      # Receipt photos for POC testing
├── pantry.json                    # POC pantry state (gitignored)
├── .gitignore
├── STORY.md
└── TECHNICAL.md
```

---

## Database Schema (live in Supabase)

> Note: Foreign key to `auth.users` removed for V1 (no auth yet). `user_id` is a plain UUID.

```sql
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    store_name TEXT,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(10,2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pantry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    canonical_name TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC,
    unit TEXT,
    price NUMERIC(10,2),
    purchased_at TIMESTAMP WITH TIME ZONE,
    est_expiry TIMESTAMP WITH TIME ZONE,
    shelf_life_days INTEGER,
    status TEXT DEFAULT 'active',   -- active | consumed_inferred | consumed_manual | expired
    consumed_at TIMESTAMP WITH TIME ZONE,
    source_receipt_id UUID REFERENCES receipts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pantry_user_status ON pantry_items(user_id, status);
CREATE INDEX idx_pantry_expiry ON pantry_items(est_expiry) WHERE status = 'active';
```

---

## API Endpoints (live)

```
POST   /receipts                   Upload receipt image → Claude Vision → Supabase
GET    /pantry                     List all active pantry items for DEV_USER_ID
GET    /pantry/expiring?days=3     Items expiring within N days (includes already expired)
PATCH  /pantry/{id}/consumed       Mark item as manually consumed → removes from pantry view
GET    /health                     Health check
```

**DEV_USER_ID** = `00000000-0000-0000-0000-000000000001` (hardcoded for V1 single-user)

---

## Receipt Processing Pipeline

```
1. Web/Mobile sends image file to POST /receipts
2. FastAPI reads image bytes, base64-encodes them
3. Single Claude Vision API call (claude-sonnet-4-6):
   - Reads the receipt image
   - Extracts + normalizes all items in one shot
   - Returns JSON array: [{canonical_name, category, quantity, unit, shelf_life_days, price}]
4. Re-purchase inference:
   - For each new item, check if same canonical_name exists as 'active'
   - If yes → mark old entry as 'consumed_inferred'
5. Insert new pantry_items rows: est_expiry = now + shelf_life_days
6. Return {receipt_id, items_found, items} to client
```

---

## Claude Vision Prompt

```
You are a grocery-receipt parser. Look at this receipt image and extract every 
purchased food/household item.

Ignore: store name, totals, tax, subtotals, tender, change, cashier, loyalty 
points, coupons, non-food fees.

For each item return:
- canonical_name: lowercase common name ("blueberries", not "BLUBRY PNT 6OZ")
- category: one of [produce, dairy, meat, seafood, bakery, pantry, frozen, 
  beverage, snack, household, other]
- quantity: number (default 1 if unclear)
- unit: "oz" | "lb" | "g" | "kg" | "ct" | "pack" | "bottle" | "can" | "each"
- shelf_life_days: realistic days until spoilage
- price: number if visible, else null

Return ONLY a JSON array. No prose. No markdown fences.
```

**Cost:** ~1–2 cents per receipt (image tokens + output tokens on claude-sonnet-4-6).

---

## Depletion Model

| Signal | How it works | Status |
|--------|-------------|--------|
| Re-purchase inference | Buying item X again → old X marked `consumed_inferred` | ✅ Live |
| Manual "used" | User clicks "Used" button → `consumed_manual` | ✅ Live |
| Shelf life decay | `est_expiry = purchased_at + shelf_life_days` | ✅ Live |
| Nightly cron | Flag items past `est_expiry` as `expired` | 🔜 GitHub Actions |

---

## Frontend Design System (Tailwind v4)

Design tokens defined in `globals.css` via `@theme inline`:

```css
--color-brand:        #92400e;   /* amber-brown — primary */
--color-brand-light:  #d97706;   /* hover states */
--color-brand-xlight: #fef3c7;   /* active pill backgrounds */
--color-surface:      #fffbf5;   /* warm off-white page bg */
--color-card:         #ffffff;   /* card surfaces */
--color-card-warm:    #fef9f0;   /* item row hover bg */
--color-border:       #e8d5b7;   /* warm tan dividers */
--color-text-primary: #1c1410;
--color-text-muted:   #78716c;
--color-text-faint:   #a8a29e;
--color-urgent-bg:    #fef2f2;   /* red tint */
--color-urgent-text:  #991b1b;
--color-warn-bg:      #fffbeb;   /* amber tint */
--color-warn-text:    #92400e;
--color-safe-bg:      #f0fdf4;   /* green tint */
--color-safe-text:    #166534;
--font-display:       DM Serif Display
--font-sans:          Inter
```

**Layout:** Desktop sidebar + mobile bottom nav via `AppShell.tsx` (client component, uses `usePathname`).

---

## Expiry Freshness Bar Logic

Each pantry item shows a thin colored bar representing how fresh it is:

```
width = clamp(0, daysLeft / shelf_life_days * 100, 100)%

color:
  daysLeft <= 2  → red    (bg-red-400)
  daysLeft <= 5  → amber  (bg-amber-400)
  otherwise      → green  (bg-emerald-400)

special case:
  daysLeft < 0  → full red bar (expired)
```

`daysLeft` uses `Math.floor` (not `Math.ceil`) so items expiring today show "Today" not "1d left".

---

## Environment Variables

```bash
# backend/.env (gitignored)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://hvkkaggvlpbmkgyyxcaa.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# web/.env.local (gitignored)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# Web
cd web
npm install
npm run dev   # → http://localhost:3000
```

---

## GitHub Actions (planned)

### nightly.yml — flag expired items
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
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

### deploy.yml — auto-deploy backend on push
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

## Build Log

### Day 1 — POC
- Built `poc.py`: receipt photo → Claude Vision → terminal pantry output
- Dropped Tesseract, used Claude Vision directly (better accuracy, cheaper setup)
- Tested on real Instacart receipt, 4 items extracted correctly
- Cost: ~$0.02 for the test

### Day 2 — Real App
- Created GitHub repo `Chinmay1220/Larder`
- Set up Supabase project, ran schema SQL
- Built FastAPI backend with 4 endpoints
- Ported POC vision pipeline into `services/vision.py`
- Scaffolded Next.js 16 web app with Tailwind v4
- Built pantry dashboard + scan page
- Full UI redesign: warm earthy palette, DM Serif Display font, sidebar + bottom nav
- Added "Used" button on each item row
- Fixed: expiry calculation (floor not ceil), expired items in alert strip, full red bar for expired items
- Added `.gitignore` to protect secrets

### Known Issues (open)
| Issue | Priority |
|-------|----------|
| No auth — single hardcoded user | V2 |
| No way to edit/delete a wrong item | V2 |
| CORS open to all origins | Fix before deploy |
| No file size limit on uploads | Fix before deploy |
| Quantity doesn't decrement on use | V2 |

---

## Next Steps (Day 3)

- [ ] Commit + push all Day 2 work to GitHub
- [ ] Deploy backend to Railway
- [ ] Deploy web to Vercel
- [ ] Build React Native mobile app (Expo)
- [ ] Wire mobile camera → backend → pantry view
