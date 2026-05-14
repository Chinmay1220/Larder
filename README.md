# 🧺 Larder

**An AI-powered pantry tracker.** Snap a grocery receipt, and Claude AI extracts every item into a smart pantry view that tracks expiry dates and helps reduce food waste.

A full-stack application — Next.js 16 + React 19 frontend, FastAPI backend, Supabase auth/database, deployed across Vercel and Render.

---

## 🔗 Live links

| | URL |
|---|---|
| 🏠 **Marketing site** | https://larder-website.vercel.app |
| 📱 **Web app** | https://larder-theta.vercel.app |
| 📖 **Docs** | https://larder-website.vercel.app/docs |
| 🔒 **Privacy policy** | https://larder-website.vercel.app/privacy |
| ⚙️ **Backend API** | https://larder.onrender.com |
| ❤️ **Health check** | https://larder.onrender.com/health |
| 💻 **Source** | https://github.com/Chinmay1220/Larder |

---

## ✨ Features

### Core
- 📸 **Receipt scanning** — upload photo, PDF, Excel, Word, CSV, or TXT; Claude AI extracts every item with name, quantity, unit, category, price, and estimated shelf life
- 🥦 **Smart pantry** — items auto-grouped by category with color-coded freshness bars
- ⏰ **Expiry tracking** — three-tier urgency system (red / amber / green) + dedicated `/expiring` page grouped into Expired / Today / Next 3 days
- 🔔 **Live sidebar badge** — fetches expiring count on every route change
- ➕ **Manual add** — for items without a receipt
- 🔍 **Search & sort** — real-time text search + Expiry / Name / Recent sort
- ✏️ **Item details modal** — click any item to see purchase date, days since added, shelf life, and full metadata
- 📉 **Decrement & consume** — track partial usage or mark fully used in one tap; uses Postgres atomic updates

### Auth & account
- 🔑 Email/password sign up & sign in via Supabase (ES256 JWTs with HS256 dev fallback)
- 🔄 Password reset flow with secure email link + `PASSWORD_RECOVERY` event handling
- ⚙️ Settings page — profile, change password, sign out
- 🗑️ Account deletion — type-email-to-confirm; cascades deletion of pantry, receipts, and auth user (GDPR-compliant)
- 📄 Public privacy policy page

### Marketing site
- Animated hero with two product preview cards
- Scroll-triggered fade/slide animations (IntersectionObserver)
- `requestAnimationFrame`-based count-up stats
- CSS `@keyframes` marquee ticker strip
- Tabbed feature showcase, FAQ accordion, auto-rotating testimonials

---

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| **Backend** | FastAPI, Pydantic v2, Uvicorn |
| **Database & auth** | Supabase (PostgreSQL, Row-Level Security, JWT) |
| **AI** | Anthropic Claude (`claude-sonnet`) — vision + structured extraction |
| **File processing** | Pillow (images), python-docx (Word), openpyxl (Excel), pdf parsing |
| **Rate limiting** | slowapi |
| **Hosting** | Vercel (frontend × 2), Render (Python backend) |
| **CI/CD** | GitHub Actions — ruff lint, Next.js typecheck, auto-merge on green |

---

## 🏗️ Architecture

```
┌────────────────────┐       ┌────────────────────┐
│  Marketing site    │       │   Web app          │
│  larder-website    │       │   larder-theta     │
│  (Next.js / SSG)   │       │   (Next.js / CSR)  │
└────────────────────┘       └─────────┬──────────┘
                                       │ JWT (ES256)
                                       ▼
                             ┌────────────────────┐
                             │   FastAPI backend  │
                             │   larder.onrender  │
                             │                    │
                             │  ┌──────────────┐  │
                             │  │  /receipts   │──┼──▶ Anthropic Claude
                             │  │  /pantry     │  │
                             │  │  /account    │  │
                             │  └──────┬───────┘  │
                             └─────────┼──────────┘
                                       ▼
                             ┌────────────────────┐
                             │   Supabase         │
                             │   • auth.users     │
                             │   • pantry_items   │
                             │   • receipts       │
                             └────────────────────┘
```

### Notable design decisions

- **Two separate Next.js apps** — marketing site (statically generated, SEO-friendly) is fully independent from the web app (client-rendered, auth-gated). They share no code but use the same warm-earthy design tokens.
- **JWT verification with key rotation support** — backend verifies Supabase JWTs using JWKS endpoint for ES256 keys, falls back to HS256 shared secret for older tokens. Handles Supabase's mid-2024 key format migration.
- **Soft delete on pantry items** — every item has a `status` field (`active`, `consumed_manual`, `consumed_inferred`, `expired`, `deleted`) for full audit history. Re-purchase inference auto-marks duplicate active items as `consumed_inferred` when a new receipt adds the same canonical name.
- **CORS with regex allowlist** — backend allows `*.vercel.app` so preview deployments work without redeploying the backend.
- **Atomic quantity decrement** — the `/decrement` endpoint reads and updates quantity in one round-trip, marking the item consumed if it drops below 1.
- **Optimistic UI throughout** — every action (mark used, decrement, edit, delete) updates local state immediately and only rolls back on API failure.

---

## 📁 Repository structure

```
pantry-poc/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # Route handlers (receipts, pantry, account)
│   │   ├── services/       # Business logic (vision, pantry_state)
│   │   ├── auth.py         # JWT verification (ES256 + HS256 fallback)
│   │   ├── db.py           # Supabase client
│   │   ├── limiter.py      # Rate limiter config
│   │   └── main.py         # FastAPI app + CORS + lifespan
│   ├── scripts/
│   │   └── nightly_expiry.py
│   └── requirements.txt
│
├── web/                    # Next.js consumer app (auth-gated)
│   ├── app/
│   │   ├── page.tsx        # Pantry dashboard
│   │   ├── scan/           # Receipt upload page
│   │   ├── login/  signup/  forgot-password/  reset-password/
│   │   ├── settings/       # Profile, password, account deletion
│   │   ├── expiring/       # Items expiring within 3 days
│   │   └── AppShell.tsx    # Sidebar + mobile nav wrapper
│   └── lib/supabase.ts
│
├── website/                # Next.js marketing site
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── docs/
│   │   └── privacy/
│   └── components/         # Nav, Footer, animated sections, FAQ, etc.
│
├── render.yaml             # Render deployment config
├── .github/workflows/      # CI: lint, build, auto-merge
└── README.md
```

---

## 🚀 Local development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Required env vars** (`backend/.env`):
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service role key>
ANTHROPIC_API_KEY=<key from console.anthropic.com>
FRONTEND_URL=http://localhost:3000
DEV_MODE=true
```

### Web app

```bash
cd web && npm install && npm run dev
```

**Required env vars** (`web/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Marketing site

```bash
cd website && npm install && npm run dev
```

---

## 🔑 API reference

All authenticated endpoints expect `Authorization: Bearer <Supabase JWT>`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/receipts` | Upload a receipt; returns extracted items |
| `GET` | `/pantry` | List all active items |
| `GET` | `/pantry/expiring?days=3` | Items expiring within N days |
| `POST` | `/pantry` | Manually add an item |
| `PATCH` | `/pantry/{id}` | Edit an item |
| `PATCH` | `/pantry/{id}/consumed` | Mark fully used |
| `PATCH` | `/pantry/{id}/decrement` | Atomic quantity −1 |
| `DELETE` | `/pantry/{id}` | Soft delete |
| `DELETE` | `/account` | Hard delete account + cascade |
| `GET` | `/health` | Liveness probe |

---

## 🗄️ Database schema

### `pantry_items`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users` |
| `canonical_name` | text | lowercased on insert |
| `category` | text | enum-checked at API layer |
| `quantity` | numeric | |
| `unit` | text | |
| `price` | numeric | nullable |
| `purchased_at` | timestamptz | |
| `est_expiry` | timestamptz | indexed |
| `consumed_at` | timestamptz | nullable |
| `shelf_life_days` | int | Claude estimate |
| `source_receipt_id` | uuid | nullable, FK → `receipts` |
| `status` | text | `active`, `consumed_manual`, `consumed_inferred`, `expired`, `deleted` |

### `receipts`
| Column | Type |
|---|---|
| `id` | uuid (PK) |
| `user_id` | uuid (FK → auth.users) |
| `uploaded_at` | timestamptz |
| `item_count` | int |

---

## 🚢 Deployment

- **Marketing site** — Vercel project `larder-website`, deploys from `main`
- **Web app** — Vercel project `larder-theta`, deploys from `main`
- **Backend** — Render service `larder`, deploys from `main`

A merge to `main` triggers all three deploys via webhook.

---

## 📄 License

MIT — built by [Chinmay Sawant](https://github.com/Chinmay1220).
