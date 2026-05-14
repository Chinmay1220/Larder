# 🧺 Larder

**Your kitchen's memory.** An AI-powered pantry tracker that reads your grocery receipts, tracks expiry dates, and helps you stop wasting food.

The average US household wastes about **$1,500 of food every year**. Larder helps you fix that — snap a receipt, and Claude AI extracts every item into a smart pantry view that warns you before things expire.

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
| 💻 **GitHub** | https://github.com/Chinmay1220/Larder |

---

## ✨ Features

### Core
- 📸 **Receipt scanning** — upload a photo, PDF, Excel, Word, CSV, or TXT receipt; Claude AI extracts every item with name, quantity, unit, category, and price
- 🥦 **Smart pantry** — items auto-grouped by category (produce, dairy, meat, etc.) with freshness bars showing remaining shelf life
- ⏰ **Expiry tracking** — color-coded badges (red / amber / green) plus a dedicated **Expiring soon** page grouped into Expired / Today / Next 3 days
- 🔔 **Sidebar badge** — live count of items expiring within 3 days
- ➕ **Manual add** — for items without a receipt (farmers market, gifts, existing pantry)
- 🔍 **Search & sort** — real-time search + sort by Expiry / Name / Recently added
- ✏️ **Edit & details** — click any item to see purchase date, days since added, shelf life, and full details
- 📉 **Decrement & "Used"** — track partial consumption (`−` button) or mark an item fully used in one tap

### Account
- 🔑 **Auth** — email/password sign up + sign in (Supabase, ES256 JWTs)
- 🔄 **Password reset** — forgot-password flow with secure email reset link
- ⚙️ **Settings** — profile, change password, sign out
- 🗑️ **Account deletion** — type-email-to-confirm; permanently deletes account, pantry, and all receipts (GDPR-friendly)

### Marketing site
- 🎬 **Animated landing page** — Headspace-inspired hero, two-card product preview, ticker strip, tabbed features
- 📊 **Animated counter stats** — count-up to "$1,500 saved per year"
- 💬 **Auto-rotating testimonials**
- ❓ **FAQ accordion**

---

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| **Frontend (app & marketing)** | Next.js 16 App Router, React 19, TypeScript, Tailwind v4 |
| **Backend** | FastAPI, Pydantic v2, Uvicorn |
| **Database & Auth** | Supabase (PostgreSQL + ES256 JWT) |
| **AI** | Anthropic Claude (`claude-sonnet`) for receipt parsing |
| **Image/PDF processing** | Pillow, python-docx, openpyxl |
| **Hosting — frontend** | Vercel (web app + marketing site, separate deployments) |
| **Hosting — backend** | Render (Python web service, free tier) |
| **Rate limiting** | slowapi |

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
│   │   └── nightly_expiry.py  # Cron job for expiry notifications
│   └── requirements.txt
│
├── web/                    # Next.js consumer app (auth-gated)
│   ├── app/
│   │   ├── page.tsx        # Pantry dashboard
│   │   ├── scan/           # Receipt upload page
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── settings/
│   │   ├── expiring/       # Items expiring within 3 days
│   │   └── AppShell.tsx    # Sidebar + mobile nav wrapper
│   └── lib/
│       └── supabase.ts
│
├── website/                # Next.js marketing site
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── docs/
│   │   └── privacy/        # Privacy policy
│   └── components/
│       ├── Nav.tsx
│       ├── Footer.tsx
│       ├── TabbedFeatures.tsx
│       ├── FaqAccordion.tsx
│       ├── CounterStats.tsx
│       ├── TestimonialRotator.tsx
│       ├── EmailSubscribe.tsx
│       └── AnimatedSection.tsx
│
├── render.yaml             # Render deployment config
├── STORY.md                # Product narrative
├── TECHNICAL.md            # Technical deep-dive
└── README.md               # You are here
```

---

## 🚀 Local development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # then fill in the values below
uvicorn app.main:app --reload --port 8000
```

**Required env vars** (`backend/.env`):
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service role key from Supabase dashboard>
ANTHROPIC_API_KEY=<key from console.anthropic.com>
FRONTEND_URL=http://localhost:3000   # optional, comma-separated for multiple
DEV_MODE=true                        # allows HS256 JWT fallback in dev
```

### Web app

```bash
cd web
npm install
cp .env.local.example .env.local     # then fill in the values below
npm run dev
```

**Required env vars** (`web/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open http://localhost:3000.

### Marketing site

```bash
cd website
npm install
npm run dev
```

Open http://localhost:3001 (or whichever port Next assigns).

---

## 🔑 API endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/receipts` | Upload a receipt; returns extracted items |
| `GET` | `/pantry` | List all active items for the user |
| `GET` | `/pantry/expiring?days=3` | Items expiring within N days |
| `POST` | `/pantry` | Manually add an item |
| `PATCH` | `/pantry/{id}` | Edit an item |
| `PATCH` | `/pantry/{id}/consumed` | Mark fully used |
| `PATCH` | `/pantry/{id}/decrement` | Decrement quantity by 1 |
| `DELETE` | `/pantry/{id}` | Soft-delete an item |
| `DELETE` | `/account` | Hard-delete user, pantry, and receipts |
| `GET` | `/health` | Liveness probe |

All authenticated endpoints expect a Supabase JWT via `Authorization: Bearer <token>`.

---

## 🗄️ Database schema

Two tables in Supabase (PostgreSQL):

### `pantry_items`
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `canonical_name` (text, lowercase)
- `category` (text — one of: produce, dairy, meat, seafood, bakery, pantry, frozen, beverage, snack, household, other)
- `quantity` (numeric)
- `unit` (text)
- `price` (numeric, nullable)
- `purchased_at`, `est_expiry`, `consumed_at` (timestamptz)
- `shelf_life_days` (int)
- `source_receipt_id` (uuid, nullable)
- `status` (text — `active`, `consumed_inferred`, `consumed_manual`, `expired`, `deleted`)

### `receipts`
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `uploaded_at` (timestamptz)
- `item_count` (int)

---

## 🚢 Deployment

- **Marketing site** — Vercel project `larder-website`, deploys from `main`
- **Web app** — Vercel project `larder-theta`, deploys from `main`
- **Backend** — Render service `Larder`, deploys from `main` automatically

A merge to `main` triggers all three deploys.

### Supabase URL configuration

For password reset emails to work, set in **Authentication → URL Configuration**:
- **Site URL**: `https://larder-theta.vercel.app`
- **Redirect URLs**: `https://larder-theta.vercel.app/**`

---

## 🛣️ Roadmap

- [ ] Shopping list — flag low/expiring items for repurchase
- [ ] PWA manifest + direct camera access for mobile
- [ ] Recipe suggestions powered by Claude using expiring items
- [ ] Data export (JSON download)
- [ ] Multi-user / shared household pantry
- [ ] Email notifications for expiring items
- [ ] Barcode scanning
- [ ] B2B mid-market product for small cafes & restaurants

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

Built by [Chinmay Sawant](https://github.com/Chinmay1220).
