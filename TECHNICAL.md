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
| Hosting (backend) | Render | — | Persistent server — no serverless timeout. Claude Vision needs 5-15s |
| Hosting (web app) | Vercel | — | larder-theta.vercel.app |
| Hosting (marketing site) | Vercel | — | larder-website.vercel.app |
| CI/CD + Cron | GitHub Actions | — | Auto-deploy on push + nightly depletion job |
| Payments | Stripe | — | V2 — not in scope yet |

---

## Repo Structure (as of Day 10)

```
pantry-poc/                        ← root (will rename to larder/)
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app + CORS + startup env check
│   │   ├── auth.py                # JWT verification via PyJWT (get_user_id dependency)
│   │   ├── limiter.py             # slowapi rate limiter instance
│   │   ├── db.py                  # Supabase client init
│   │   ├── api/
│   │   │   ├── receipts.py        # POST /receipts (rate-limited, file validation)
│   │   │   └── pantry.py          # GET/PATCH/DELETE pantry endpoints + ItemUpdate validation
│   │   └── services/
│   │       ├── vision.py          # Claude Vision: 3-path dispatch (image/PDF/text)
│   │       └── pantry_state.py    # ingest_items, get/update/delete/decrement items
│   ├── scripts/
│   │   └── expire_items.py        # Nightly expiry cron script
│   ├── .env                       # secrets (gitignored)
│   └── requirements.txt
├── web/                           # Product app — deployed to larder-theta.vercel.app
│   ├── app/
│   │   ├── layout.tsx             # Fonts (DM Serif Display + Inter) + AppShell wrapper
│   │   ├── AppShell.tsx           # Sidebar (desktop) + bottom nav (mobile)
│   │   ├── globals.css            # Tailwind v4 design tokens (@theme inline)
│   │   ├── page.tsx               # Pantry dashboard (auth, edit, delete, quantity)
│   │   ├── scan/page.tsx          # Receipt upload (all file types, JWT auth)
│   │   ├── login/page.tsx         # Email + password login
│   │   └── signup/page.tsx        # Signup + email confirmation handling
│   ├── lib/supabase.ts            # Browser Supabase client
│   ├── next.config.ts             # Security headers (HSTS, CSP, X-Frame-Options)
│   ├── .env.local                 # NEXT_PUBLIC_* vars (gitignored)
│   └── package.json
├── website/                       # Marketing site — deployed as separate Vercel project
│   ├── app/
│   │   ├── layout.tsx             # Same fonts + metadata
│   │   ├── globals.css            # Same Tailwind v4 design tokens
│   │   ├── page.tsx               # Landing page (Hero, How it works, Features, Pricing, Why)
│   │   └── docs/page.tsx          # Docs + FAQ (fully static)
│   ├── components/
│   │   ├── Nav.tsx                # Sticky nav: logo + links + "Open app →" CTA
│   │   └── Footer.tsx             # App, Docs, GitHub links + copyright
│   ├── next.config.ts             # Same security headers
│   └── package.json
├── .github/workflows/
│   ├── ci.yml                     # backend-lint + frontend-build + website-build + auto-merge
│   ├── expire.yml                 # Nightly expiry cron (2am EST)
│   └── keepalive.yml              # Ping /health every 14 min (prevent Render cold start)
├── poc.py                         # Original proof-of-concept script
├── render.yaml                    # Render deployment config for backend
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
GET    /pantry                     List active + expired pantry items (X-User-Id header)
GET    /pantry/expiring?days=3     Items expiring within N days
PATCH  /pantry/{id}/consumed       Mark item as fully used → removes from pantry view
PATCH  /pantry/{id}/decrement      Subtract 1 unit; removes item when quantity reaches 0
PATCH  /pantry/{id}                Update fields: canonical_name, category, quantity, unit, est_expiry
DELETE /pantry/{id}                Soft delete (status → "deleted")
GET    /health                     Health check
```

**DEV_USER_ID** = `00000000-0000-0000-0000-000000000001` (fallback when no X-User-Id header)

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

## Live URLs

| Service | URL |
|---------|-----|
| Backend (Render) | https://larder.onrender.com |
| Web app (Vercel) | https://larder-theta.vercel.app |
| Health check | https://larder.onrender.com/health |

---

## Environment Variables

```bash
# backend/.env (gitignored) — also set in Render dashboard
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://hvkkaggvlpbmkgyyxcaa.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
FRONTEND_URL=https://larder-theta.vercel.app

# web/.env.local (gitignored) — also set in Vercel dashboard
NEXT_PUBLIC_API_URL=https://larder.onrender.com
```

> Note: `NEXT_PUBLIC_API_URL` must be set BEFORE the Vercel build — it gets baked into the JS bundle at build time.

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

### deploy.yml — auto-deploy backend on push (via Render webhook)
Render auto-deploys from GitHub pushes to `main` — no GitHub Action needed for this.

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

### Day 5 — Auth + Item Management
- Added Supabase Auth (email + password)
- New pages: `/login` and `/signup` (styled to match app, no nav)
- `AppShell.tsx`: session check on mount → redirect to `/login` if unauthenticated; logout button in sidebar + mobile nav; user email shown in sidebar
- `web/lib/supabase.ts`: browser Supabase client singleton
- Backend: all endpoints now read `X-User-Id` header (falls back to DEV_USER_ID for backward compat)
- Frontend: all API calls pass `X-User-Id` from active Supabase session
- New env vars required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Day 5 (continued) — Edit, Delete, Quantity
- `PATCH /pantry/{id}` — update any subset of fields (name, category, quantity, unit, est_expiry)
- `DELETE /pantry/{id}` — soft delete (status → "deleted"); item hidden from pantry, history kept
- `PATCH /pantry/{id}/decrement` — subtract 1 from quantity; if qty ≤ 1, marks consumed_manual
- `pantry_state.py`: added `update_item`, `delete_item`, `decrement_item`
- Frontend `page.tsx`: edit modal (pre-filled form, PATCH on save), delete button (single click), quantity controls (`[ − ] qty unit [ Used ]` per row)

### Day 4 — CI/CD Pipeline
- Added `.github/workflows/ci.yml`: runs on every PR targeting `main`
  - Job 1: `ruff check backend/app backend/scripts` — Python linter
  - Job 2: `npm ci && npm run build` in `web/` — TypeScript + Next.js build
  - Job 3: `gh pr merge --auto --squash` — auto-merges when both pass
- Added `.github/workflows/nightly.yml`: runs at 2am EST daily
  - Flags `active` items past `est_expiry` as `expired` in Supabase
  - Uses `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` from GitHub repo secrets
- Branch protection on `main`: require PR + require CI checks to pass
- `GET /pantry` updated to return `active` AND `expired` items (expired stay visible)
- `PATCH /pantry/{id}/consumed` updated to work on expired items too
- Repo made public to unlock GitHub free-tier auto-merge

### Day 3 — Production Deploy
- Deployed backend to **Render** at `https://larder.onrender.com`
  - Chose Render over Vercel serverless: Claude Vision takes 5-15s, Vercel free tier times out at 10s
  - `render.yaml` committed — Render reads it directly for build + start commands
  - CORS locked: `localhost:3000` + `FRONTEND_URL` env var (Vercel URL)
- Deployed web app to **Vercel** at `https://larder-theta.vercel.app`
  - Root directory set to `web/` — Vercel only sees the Next.js app
  - `NEXT_PUBLIC_API_URL=https://larder.onrender.com` set in Vercel dashboard
  - Redeploy needed after env var set (env vars baked into JS bundle at build time)
- Fixed Supabase schema: removed FK to `auth.users` (no auth in V1), used plain UUID

### Day 6 — Polish & Reliability
- `keepalive.yml`: GitHub Actions cron every 14 min pings `/health` to prevent Render free-tier sleep
- Backend `receipts.py`: 10 MB file size guard (HTTP 413); friendlier error messages throughout
- Frontend `scan/page.tsx`: client-side 10 MB check before upload; JSON error parsing (shows `detail` field, not raw JSON)
- Frontend `page.tsx`: Toast component — brief pill notification after edit / delete / decrement / mark-used
- Frontend `signup/page.tsx`: handles email confirmation — shows "Check your email" screen when `data.session` is null after signUp

### Day 7 — File Types + Security Hardening
- `backend/app/limiter.py`: shared `slowapi` Limiter instance (key: remote IP)
- `backend/app/main.py`: registered limiter + exception handler; CORS locked to specific methods (`GET POST PATCH DELETE`) and headers (`Content-Type X-User-Id Authorization`)
- `backend/app/api/receipts.py`: `@limiter.limit("10/minute")`; `file.read(MAX+1)` pattern to cap memory; Pillow `img.verify()` for images; `%PDF` magic bytes check for PDFs; accept `application/pdf`
- `backend/app/services/vision.py`: PDF uses `{"type":"document"}` content block; images use `{"type":"image"}` — different Claude API paths
- `backend/requirements.txt`: added `Pillow`, `slowapi`
- `web/app/scan/page.tsx`: `isPdf` state; PDF shows filename+icon preview instead of `<img>`; file input accepts `application/pdf`
- `web/next.config.ts`: security headers on all routes — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

### Day 8 — JWT Auth
- `backend/app/auth.py`: `get_user_id()` FastAPI dependency — reads `Authorization: Bearer <token>`, verifies with PyJWT + `SUPABASE_JWT_SECRET`, returns `sub` claim (user UUID); falls back to DEV_USER_ID if secret not configured (local dev)
- `backend/app/api/receipts.py` + `pantry.py`: replaced `Header(default=DEV_USER_ID)` with `Depends(get_user_id)` on all endpoints
- `backend/requirements.txt`: added `PyJWT`
- Frontend `page.tsx` + `scan/page.tsx`: send `Authorization: Bearer <session.access_token>` instead of `X-User-Id`
- New env var required: `SUPABASE_JWT_SECRET` (Supabase dashboard → Settings → API → JWT Secret) — must be set in Render dashboard

### Day 9 — Security Polish
- `backend/app/auth.py`: DEV_MODE explicit flag — fallback to DEV_USER_ID only when `DEV_MODE=true` env var is set; otherwise returns HTTP 500 with clear message
- `backend/app/main.py`: lifespan startup check — raises `RuntimeError` if `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, or `ANTHROPIC_API_KEY` are missing; server won't start
- `backend/app/main.py`: removed `X-User-Id` from CORS allowed headers (no longer needed)
- `backend/app/api/pantry.py`: `ItemUpdate` now validates — `quantity > 0`, `category` from whitelist, `est_expiry` as ISO date, `canonical_name` stripped + length limited
- `web/next.config.ts`: added `Strict-Transport-Security` header (HSTS, 1-year max-age)
- `backend/.env`: added `DEV_MODE=true` for local development

### Day 11 — Notion-Inspired Sidebar
- `web/app/AppShell.tsx`: full rewrite — compact `NavItem` component with optional `badge` prop, `SectionLabel` heading component, workspace header with 🧺 mark + tagline, user initials avatar built from `user.email.slice(0,2).toUpperCase()`, sign-out at the bottom
- All sidebar icons are inline SVG (no emoji): home, scan, alert, settings, logout
- Mobile bottom nav rewritten with the same SVG icons + 3-tab layout

### Day 12 — UI Polish
- `web/app/page.tsx`: `StatCard` replaced with `StatStrip` — 4 stats in a single bordered card, `grid grid-cols-2 md:grid-cols-4` with explicit borders between cells, colored icon squares (brand-xlight default, red-50 when urgent)
- Item rows: `py-3` → `py-3.5`, freshness bar `h-1` → `h-2` with `bg-stone-200` track, expiry badge moved next to name with `ml-auto` actions group
- Category headers: brand-colored 0.5px tall accent bar (`w-0.5 h-3.5 rounded-full bg-(--color-brand) opacity-60`) + item count rendered as a pill badge
- Alert strip ⚠️ emoji → triangle SVG
- `web/app/scan/page.tsx`: progress step icons all SVG; ⚠️ error icon, 📸 camera, 📄 doc icons all swapped
- Inline SVG icon constants defined at top of `page.tsx`: IconBox, IconClock, IconGrid, IconDollar, IconPencil, IconTrash, IconCamera

### Day 13 — Manual Add + Search + Sort
- `backend/app/api/pantry.py`: `ItemCreate` Pydantic model with the same validators as `ItemUpdate` (category enum, ISO date, length limits). New `POST /pantry` route placed before `PATCH /pantry/{item_id}` to avoid path conflict
- `backend/app/services/pantry_state.py`: `create_item(user_id, data)` — runs re-purchase inference like `ingest_items`, computes `shelf_life_days` from delta to `est_expiry`, inserts row, returns `data[0]`
- `web/app/page.tsx`: new `AddItemModal` component (name + qty/unit + category + expiry date input). Wired to a "+ Add item" button in the pantry header
- Search: `searchQuery` state, inline search bar between stat strip and alert strip with magnifying-glass SVG prefix + × clear button. `displayItems` derived from `items` filtered by `canonical_name.toLowerCase().includes(query)`. Stats still use the full `items` list so totals stay accurate.
- Sort: `sortBy: "expiry" | "name" | "recent"` state, dropdown with three options, items re-sorted before grouping by category. Default expiry, stable sort within groups.

### Day 14 — Auth Hardening + Privacy + Settings + Expiring page
- `web/app/forgot-password/page.tsx`: email input → `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })` → confirmation card
- `web/app/reset-password/page.tsx`: listens for `PASSWORD_RECOVERY` event via `onAuthStateChange`, validates session presence with `hasSession` state. Three render states: invalid-link card, success card (redirects to /login after 2s `setTimeout`), and the new-password form. Calls `supabase.auth.updateUser({ password })`.
- `web/app/login/page.tsx`: "Forgot?" link beside password label
- `web/app/AppShell.tsx`: `AUTH_ROUTES` extended to include `/forgot-password` and `/reset-password` so they bypass the auth gate
- `web/app/settings/page.tsx`: profile section with email, initials avatar (`bg-(--color-brand-xlight)`), member-since date from `user.created_at`. Change-password form with current/new/confirm inputs + show/hide toggle. Sign out + Delete account links at the bottom.
- `web/app/expiring/page.tsx`: fetches from `GET /pantry/expiring?days=3`, groups items into "Expired" (daysLeft < 0), "Today" (= 0), "Next 3 days" (1-3). Uses the same item row JSX as the pantry page.
- `web/app/AppShell.tsx`: `expiringCount` state, `useEffect` re-fetches on `pathname` change, renders a red pill badge on the "Expiring soon" NavItem when count > 0
- `backend/app/api/account.py`: `DELETE /account` endpoint — wipes `pantry_items` + `receipts` rows for `user_id`, calls `supabase.auth.admin.delete_user(user_id)`. Wrapped in try/except with server-side logging. Rate-limited to `3/hour`.
- `backend/app/main.py`: registered `account.router`
- `web/app/AppShell.tsx`: `DeleteAccountModal` component — requires the user to type their email to enable the delete button, calls `DELETE /account`, signs out + redirects to /login on success
- `web/app/signup/page.tsx`: Privacy Policy text now links to `https://larder-website.vercel.app/privacy`
- `website/app/privacy/page.tsx`: new static page with the full data policy
- `website/components/Footer.tsx`: Privacy link added

### Day 15 — Security Audit
- `backend/app/main.py`: removed `allow_origin_regex=r"https://.*\.vercel\.app"`; added `_is_production()` helper that checks for `RENDER` env or `larder.*` in `FRONTEND_URL`; lifespan now raises if `DEV_MODE=true` in production
- `backend/app/api/account.py`: error response sanitized (`raise HTTPException(500, "Account deletion failed. Please try again later.")`), full traceback logged server-side via `logging.exception`. Decorated with `@limiter.limit("3/hour")`. Function now takes `request: Request` (required by slowapi).
- `backend/app/api/pantry.py`: every endpoint decorated with `@limiter.limit(...)` — `GET /pantry` 120/min, `GET /pantry/expiring` 60/min, `PATCH /pantry/{id}/consumed` 60/min, `PATCH /pantry/{id}/decrement` 60/min, `POST /pantry` 30/min, `PATCH /pantry/{id}` 60/min, `DELETE /pantry/{id}` 30/min. All endpoints now take `request: Request`.
- `backend/app/api/receipts.py`: `_matches_magic(file_bytes, content_type)` verifies leading bytes against expected magic for JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), GIF (`GIF87a`/`GIF89a`), WebP (`RIFF…WEBP`), PDF (`%PDF`), Office files (`PK\x03\x04` for openxml, `D0 CF 11 E0` for legacy). Image dimensions checked after `Image.open` against `MAX_IMAGE_PIXELS = 50_000_000`.
- `backend/app/auth.py`: `jwt.decode` now passes `issuer=f"{SUPABASE_URL}/auth/v1"` and `options={"require": ["exp","sub","aud","iss"]}` on both ES256 and HS256 paths
- `backend/app/services/vision.py`: openpyxl + python-docx parsing wrapped in try/except with `logging.exception`. `MODEL` now reads `CLAUDE_MODEL` env var with `claude-sonnet-4-6` default.
- `backend/app/services/pantry_state.py`: `_clamp_shelf_life(raw) -> [1, 365]`, `_clamp_quantity(raw) -> [0.01, 9999]`, `_safe_category(raw)` falls back to `"other"` if not in `VALID_CATEGORIES`. Applied in `ingest_items` insert. `canonical_name` and `unit` length-limited.
- `web/next.config.ts` and `website/next.config.ts`: new `Content-Security-Policy` header — `default-src 'self'`, `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (Next.js requires these), `style-src 'self' 'unsafe-inline'` (Tailwind), `img-src 'self' data: blob: https:`, `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://larder.onrender.com http://localhost:8000`, `frame-ancestors 'none'`, `object-src 'none'`
- `backend/requirements.txt`: every package pinned to exact version (fastapi==0.124.2, anthropic==0.96.0, supabase==2.29.0, etc.)
- `web/package.json` + `website/package.json`: removed all `^` ranges, exact versions only
- `.github/workflows/ci.yml` + `nightly.yml`: `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`, `actions/setup-python@0b93645e9fea7318ecaed2b359559ac225c90a2b # v5.3.0`, `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0`. Node version standardized to `'22'` in both build jobs.

### Day 15 (cont.) — Portfolio README
- `README.md`: full rewrite for portfolio showcase — opening pitch sentence, shields.io tech badges, "What this project demonstrates" mapping table, screenshots section referencing `docs/screenshots/*.png`, architecture ASCII diagram, "Notable design decisions" prose section, dedicated "AI / LLM integration" section (vision-based parsing, JSON schema, prompt engineering, multi-modal, cost-aware, server-side only), tech stack table, repo structure tree, local dev setup, API reference table, database schema tables, deployment notes
- `docs/screenshots/`: scaffold folder with its own README explaining what each PNG should show and how to capture them

### Environment variables (production)
| Var | Where set | Notes |
|---|---|---|
| `SUPABASE_URL` | Render + Vercel (`NEXT_PUBLIC_SUPABASE_URL`) | both backend and frontend need it |
| `SUPABASE_SERVICE_KEY` | Render only | service-role JWT, never expose to client |
| `SUPABASE_ANON_KEY` | Vercel (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) | safe to expose |
| `SUPABASE_JWT_SECRET` | Render only | HS256 fallback secret (legacy) |
| `ANTHROPIC_API_KEY` | Render only | Claude API |
| `FRONTEND_URL` | Render | comma-separated: `https://larder-theta.vercel.app,https://larder-website.vercel.app` |
| `CLAUDE_MODEL` | Render | optional, defaults to `claude-sonnet-4-6` |
| `DEV_MODE` | local only (`backend/.env`) | must be `false` or unset in prod — server refuses to boot otherwise |
| `NEXT_PUBLIC_API_URL` | Vercel (web app) | `https://larder.onrender.com` |

### Supabase URL configuration
- Site URL: `https://larder-theta.vercel.app`
- Redirect URLs: `https://larder-theta.vercel.app/**` (wildcard required so the password reset link with path `/reset-password` works)

---

## Next Steps

- [ ] Capture the 5 screenshots referenced in `README.md` (see `docs/screenshots/README.md`)
- [ ] Recipe Suggestions feature — `POST /recipes` endpoint that takes expiring items, calls Claude with structured prompt, returns 3-5 recipe ideas
- [ ] PWA manifest (`web/public/manifest.json`) + service worker so the app installs to home screen
- [ ] Direct camera capture on mobile — `<input type="file" accept="image/*" capture="environment">` on the scan page
- [ ] Shopping list — new `shopping_items` table + `/shopping` page + "Add to list" button on each pantry row
- [ ] Vercel Analytics in both apps (free tier, no cookie banner needed)
- [ ] Build React Native mobile app (Expo)

---

## End-of-Day 15 — Production state

**Backend deploy (Render — `larder.onrender.com`)**
- Branch: `main`, auto-deploy on push
- Runtime: Python 3.11, uvicorn, single web service
- Env vars set: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `ANTHROPIC_API_KEY`, `FRONTEND_URL=https://larder-theta.vercel.app,https://larder-website.vercel.app`
- Plan: free (spins down after 15 min idle; `keepalive.yml` pings every 14 min)
- All 10 endpoints rate-limited via slowapi (IP-keyed)

**Frontend deploys (Vercel — 2 projects)**
- `larder-theta` (web app) — `web/` directory, branch `main`
- `larder-website` (marketing site) — `website/` directory, branch `main`
- Both ship CSP + HSTS + X-Frame-Options DENY + X-Content-Type-Options nosniff + Referrer-Policy strict-origin-when-cross-origin + Permissions-Policy locking camera/mic/geolocation

**Supabase (`auth.users`, `pantry_items`, `receipts`)**
- Site URL: `https://larder-theta.vercel.app`
- Redirect URL allowlist: `https://larder-theta.vercel.app/**`
- ES256 JWT signing keys (with HS256 fallback for legacy tokens in `auth.py`)
- 2 confirmed users as of end-of-day

**CI/CD (`.github/workflows/`)**
- `ci.yml` — backend ruff lint + 2 Next.js builds, auto-merge with retry loop on green
- `nightly.yml` — daily cron at 6 UTC for expiry flagging
- `keepalive.yml` — 14-min cron pinging `/health`
- All Actions pinned to commit SHAs

**Repo state**
- Main branch protected, requires both CI checks before merge
- Latest commit: `a277717` (STORY/TECHNICAL catchup + screenshots scaffold)
- Tip-of-main builds clean: `npm run build` passes for web and website, ruff passes for backend
- Outstanding work: capture 5 screenshots into `docs/screenshots/`
