# Larder — The Story So Far
### A non-technical log of how this product is being built

---

## The Idea (Day 0)

The problem is simple: you go grocery shopping and buy blueberries. You get home and realize you already had blueberries. The old ones go bad. Money wasted, food wasted.

This happens because the grocery store knows what you bought — but your fridge doesn't. Nobody has connected those two things well.

The app we're building fixes this. It watches what you buy, remembers what you have, and warns you before you shop again.

---

## What We're Building

A smart pantry tracker called **Larder** (a larder is an old English word for a food storage room — fitting) that:
- Reads your grocery receipts via photo
- Builds a live inventory of what's in your kitchen
- Shows what's about to expire with a visual freshness bar
- Warns you before you shop: "you already have blueberries"
- Lets you mark items as used when you finish them

Available as both a **mobile app** (iPhone + Android) and a **website**.

---

## Why This Can Be Big

The average American household throws away about $1,500 worth of food every year. If this app saves someone even $300/year, they'll gladly pay $5/month for it.

Once enough people use it, the data becomes incredibly valuable — big food brands pay millions to understand what people actually buy, eat, and waste. That's the second business on top of the first.

**The path:** Single user (you) → Households → Thousands of users → Data product sold to food brands → Unicorn.

---

## The Decisions We Made

**What version 1 does:**
- Take a photo of your grocery receipt
- AI reads it and updates your pantry automatically
- See what's expiring with color-coded urgency bars
- Get warned when something is about to go bad
- Mark items as "used" when you finish them

**What version 1 does NOT do** (saved for later):
- Gmail or email receipt reading
- Instacart / online order sync
- Voice input
- Household sharing with roommates / family
- Meal suggestions
- Payments / subscriptions

**How you'll eventually be able to add items:**
1. Photo of receipt (v1 — ✅ done)
2. Automatic email receipt reading (v2)
3. Instacart / online grocery sync (v2)
4. Voice: "I just bought milk" (v3)
5. Weekly fridge camera scan (v3)

---

## Day 1 — Proof of Concept

**What we built:** A single Python script (`poc.py`) that proves the core idea works.

**How it works:**
1. Drop a receipt photo into a folder
2. Run the script
3. Claude AI reads the receipt image directly (no Tesseract OCR needed)
4. Prints your pantry and what's about to expire

**What we tested it on:** A real Instacart receipt (Plums, Gold Potatoes, Golden Pineapple, Paper Towels — $37.57 total).

**What the app correctly figured out:**
- Golden Pineapple expires in 5 days
- Plums expire in 5 days
- Gold Potatoes last 30 days
- Paper Towels are a household item, not food (shelf life 10 years)
- Pre-shop alert showed all items correctly

**Verdict: The core idea works.** The AI can read a receipt and turn it into a smart pantry list. Cost: ~1-2 cents per receipt.

---

## Day 2 — Building the Real App

**What we shipped:**

### GitHub
- Created repo: `github.com/Chinmay1220/Larder`
- All code pushed and version controlled

### Database (Supabase)
- Live Postgres database running in the cloud
- Two tables: `receipts` (every scan logged) and `pantry_items` (live pantry state)
- Data persists between sessions — not just a local file anymore

### Backend API (FastAPI)
- Real server running at `localhost:8000`
- `/receipts` — upload a receipt photo, get items back
- `/pantry` — see everything in your pantry
- `/pantry/expiring` — see what's going bad soon
- `/pantry/{id}/consumed` — mark an item as used

**Tested end-to-end:** Uploaded the real Instacart receipt → Claude Vision extracted 4 items → all 4 stored in Supabase → `/pantry` returned them correctly.

### Website (Next.js)
A full web app at `localhost:3000` with:

**Pantry Dashboard:**
- 4 stat cards: Total Items, Expiring Soon, Categories, Est. Value
- Red alert strip when items are expiring or already expired (shows up to 4 names, then "+X more")
- Category filter pills to narrow down the list
- Each item row has a color-coded freshness bar (green → amber → red as it ages)
- **"Used" button** appears on hover — click it to instantly remove the item from your pantry
- Skeleton loading state while data fetches
- Error message if backend is unreachable

**Scan Page:**
- 3-step progress indicator (Upload → Reading → Done)
- Drag-and-drop receipt upload with visual feedback
- Preview of your receipt image before processing
- Step-by-step feedback while Claude reads the receipt
- Results panel showing every extracted item with price
- "Scan another" and "View Pantry" buttons after success

**Layout:**
- Desktop: left sidebar with logo and navigation
- Mobile: bottom tab bar + floating 📸 scan button

### Bug fixes applied on Day 2:
- Expiry calculation fixed: items expiring today now correctly show "Today" not "1d left"
- Expired items now included in the alert strip (not just upcoming ones)
- Expired items show a full red freshness bar instead of empty
- `.gitignore` added — API keys won't accidentally get pushed to GitHub

---

## The Tools We're Using

| Tool | What it does in plain English |
|------|-------------------------------|
| **Supabase** | Our database — stores your pantry, receipts, and account info |
| **FastAPI** | The backend brain — handles all the logic between UI and database |
| **Next.js** | The website version |
| **React Native** | The mobile app — coming next |
| **Render** | Hosts the backend API as a persistent server (no timeouts) |
| **Vercel** | Hosts the website — free, zero-config |
| **GitHub** | Stores all our code at github.com/Chinmay1220/Larder |
| **GitHub Actions** | Will run automatic tasks (nightly expiry checks, auto-deploy) |
| **Claude AI (Anthropic)** | Reads receipt photos and understands what was bought |
| **Stripe** | Payments — added when we have real users |

---

## Day 3 — Going Live

**What we shipped:**

### Backend: Live on Render
- Deployed the FastAPI backend at **https://larder.onrender.com**
- Why Render instead of Railway: persistent server (no 10-second timeout like Vercel serverless). Claude Vision takes 5-15 seconds per receipt — serverless would always time out.
- `render.yaml` committed to repo — Render auto-reads it to know how to build and start the server
- CORS locked to specific origins: `localhost:3000` + the Vercel URL

### Web App: Live on Vercel
- Deployed the Next.js web app at **https://larder-theta.vercel.app**
- Set `NEXT_PUBLIC_API_URL=https://larder.onrender.com` in Vercel dashboard
- Root directory set to `web/` so Vercel only deploys the frontend, not the backend

### Architecture in production
```
Your phone → larder-theta.vercel.app (Vercel)
                    ↓ API calls
           larder.onrender.com (Render)
                    ↓ Claude Vision + DB
     Anthropic API + Supabase Postgres
```

---

## Issues Known & Fixed

| Issue | Status |
|-------|--------|
| No way to mark items as used | ✅ Fixed — "Used" button on hover |
| Expired items missing from alert | ✅ Fixed |
| "1d left" shown for items expiring today | ✅ Fixed |
| API keys could leak to GitHub | ✅ Fixed — .gitignore added |
| CORS open to all origins | ✅ Fixed — locked to Vercel URL + localhost |
| Backend timing out on Vercel (10s serverless limit) | ✅ Fixed — moved backend to Render |
| No auth / multi-user support | 🔜 V2 |
| No quantity tracking | 🔜 V2 |
| No edit/delete for wrong items | 🔜 V2 |
| No file size limit on uploads | 🔜 V2 |

---

## Day 4 — CI/CD Pipeline + Proper Git Workflow

**What we shipped:**

### Professional Git workflow
- Switched from committing directly to `main` to a branch → PR → merge flow
- Every change now lives on a feature branch, gets reviewed as a PR, then merges
- Branch protection on `main`: direct pushes blocked, PRs required

### CI Pipeline (GitHub Actions)
- Every PR now automatically runs two checks:
  - **Backend lint** — `ruff` checks Python code for errors
  - **Frontend build** — Next.js full TypeScript build to catch type errors
- If both pass → PR **auto-merges** automatically (no manual click needed)
- If either fails → merge is blocked

### Nightly expiry cron (live)
- Runs every night at 2am EST on GitHub's servers
- Flags any `active` pantry items past their `est_expiry` as `expired` in Supabase
- Expired items stay visible in the pantry (red badge) — they only disappear when you click "Used"
- Tested manually via Actions tab — ran in 24 seconds, all green

### UX decision: keep expired items visible
- Previously expired items would disappear from the pantry
- Changed to keep them visible with a red "Expired" badge
- Items only leave the pantry when YOU remove them, never automatically
- "Used" button now works on expired items too

### Repo made public
- Switched from private to public repo to unlock GitHub's free auto-merge feature
- All secrets are in `.env` files (gitignored), nothing sensitive in the code

---

## Issues Known & Fixed

| Issue | Status |
|-------|--------|
| No way to mark items as used | ✅ Fixed — "Used" button on hover |
| Expired items missing from alert | ✅ Fixed |
| "1d left" shown for items expiring today | ✅ Fixed |
| API keys could leak to GitHub | ✅ Fixed — .gitignore added |
| CORS open to all origins | ✅ Fixed — locked to Vercel URL + localhost |
| Backend timing out on Vercel (10s serverless limit) | ✅ Fixed — moved backend to Render |
| Expired items disappearing from pantry | ✅ Fixed — now stay visible with red badge |
| No CI — broken code could merge | ✅ Fixed — CI pipeline blocks bad PRs |
| No auth / multi-user support | 🔜 V2 |
| No quantity tracking | 🔜 V2 |
| No edit/delete for wrong items | 🔜 V2 |
| No file size limit on uploads | 🔜 V2 |
| Debug API URL shown in error message | 🔜 Clean up |

---

## Day 5 — Auth + Item Controls

**What we shipped:**

### Auth (Supabase)
- Added email + password login and signup pages (`/login`, `/signup`)
- The app now redirects you to `/login` if you're not signed in
- Logout button in the nav — your email shows in the sidebar on desktop
- Each user's pantry is completely separate — your data is yours

### Edit items
- Hover any pantry item → ✏️ button appears
- Click it → a modal opens with the item's details pre-filled
- Change the name, quantity, unit, or category → Save → list updates instantly

### Delete items
- Hover any pantry item → 🗑 button appears
- Click it → item is removed immediately (soft delete in the database — history is kept)

### Quantity tracking
- Every item row now shows a **[ − ]** button on the left
- Click **−** to use one unit: "3 each" becomes "2 each"
- When quantity hits 1 and you click **−**, the item is fully removed (same as "Used")
- **Used** button still removes everything at once

### How it all fits together
```
Before:  [ Blueberries ]  [ Expired ]  [ Used ]
After:   [ Blueberries ]  [ Expired ]  [ ✏️ ] [ 🗑 ]
         [ − ] 2 pints [ ——bar—— ] [ Used ]
```

---

## Day 6 — Polish & Reliability

**What we fixed:**

### No more 30-second loading on first open
- Added a keep-alive ping that hits the backend every 14 minutes
- Render was putting the server to sleep after 15 minutes of no traffic — that caused the long "Loading…" hang
- Now the server stays warm and the pantry loads instantly

### Friendlier error messages
- Before: `{"detail":"Could not extract items from receipt"}` — raw JSON shown to user
- After: plain English like "No items found. Make sure the photo shows a grocery receipt clearly."
- All error messages across the app now read like they were written for a human

### File size limit
- Uploads are now capped at 10 MB on both the frontend and backend
- Before: no limit — a large photo could silently fail or time out

### Action feedback (toast notifications)
- Editing, deleting, decrementing, and marking as used now all show a brief confirmation pill
- Before: actions happened silently with no visual confirmation

### Email confirmation on signup
- Signup now handles the email confirmation flow properly
- If Supabase requires email verification, users see a "Check your email" screen instead of being redirected to a blank pantry

---

## Day 7 — File Types + Security Hardening

**What we shipped:**

### All receipt formats now supported
| Format | Works? |
|--------|--------|
| JPEG photo | ✅ |
| PNG screenshot | ✅ |
| WebP (from Google Images, web) | ✅ |
| GIF | ✅ |
| PDF (email receipts, digital receipts) | ✅ NEW |

PDFs needed a different code path — Claude reads them as a document rather than an image. Everything else is automatic.

### Security hardening
- **Rate limiting** — receipt uploads are now capped at 10 per minute per IP. Prevents someone from spamming the API and running up the Anthropic bill.
- **Real file validation** — we now actually open image files with Pillow to confirm they're real images, not just check the label. A fake `.jpg` that's actually a zip file gets rejected properly.
- **Smarter memory handling** — large file uploads no longer load fully into memory before being rejected. We stop reading after 10 MB.
- **CORS locked down** — backend now only allows the specific HTTP methods and headers the app actually uses.
- **Security headers** — frontend now sends `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` headers on every page.

---

## Day 8 — JWT Authentication (User ID Spoofing Fixed)

**The problem we fixed:**
Before this, the frontend sent a header `X-User-Id: <uuid>` and the backend just trusted it. Anyone could change that header to another user's UUID in DevTools and read or delete their pantry. A serious flaw for a multi-user app.

**How it works now:**
- Frontend sends `Authorization: Bearer <token>` — the actual Supabase session token
- Backend verifies the token using the Supabase JWT secret
- The real user ID is extracted from inside the verified token — no header the client can fake
- If the token is missing, expired, or tampered with → 401 Unauthorized
- Local development still works without a JWT secret (falls back to dev user)

**What this means:**
User A literally cannot see or touch User B's pantry, even if they know User B's UUID.

---

## Day 9 — Security Polish

Four small but important security improvements:

- **DEV_MODE flag** — local dev now requires `DEV_MODE=true` explicitly. If `SUPABASE_JWT_SECRET` is missing in production without this flag, the server returns a 500 instead of silently bypassing auth.
- **HSTS header** — browsers are now told to always use HTTPS for this domain, even on first visit. Prevents downgrade attacks.
- **Input validation** — item edits now validate: quantity must be > 0, category must be from the known list, expiry must be a real date, name can't be blank or over 200 chars.
- **Startup env check** — the server now refuses to start if `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, or `ANTHROPIC_API_KEY` are missing, instead of crashing silently at first request.

---

---

## Day 10 — Marketing Website

**What we shipped:**

### Standalone marketing site in `website/`
- New Next.js app at `website/` (sibling to `web/` and `backend/`) — completely separate from the product app
- Deploys as its own Vercel project (separate URL)
- Same design tokens as the app: DM Serif Display + Inter fonts, warm earthy color palette
- Purely static — no backend, no auth, no API calls. Builds to flat HTML files.

### Pages

**Landing page (`/`)**:
- **Hero** — big DM Serif headline, subhead, two CTAs: "Get started free →" (links to app) and "See how it works ↓" (smooth scrolls)
- **How it works** — three numbered steps: Snap receipt → Pantry updates → Shop smarter
- **Features** — six-card grid: AI reading, freshness bars, expiry alerts, item controls, privacy, free tier
- **Pricing** — Free (highlighted, live) vs Pro (dimmed, coming soon at $5/month)
- **Why it matters** — "$1,500 wasted per year" stat + two testimonials + final CTA

**Docs page (`/docs`)**:
- Left sidebar with anchor navigation (desktop), stacked sections (mobile)
- Quick start, Scanning receipts, Pantry management, Expiry alerts, FAQ (8 questions with `<details>`/`<summary>` accordion)
- Full supported formats table, freshness bar color key, step-by-step guides

### CI updated
- Added a third CI job: `website-build` — runs `npm ci + npm run build` in `website/` on every PR
- Auto-merge now requires all three jobs green (backend-lint + frontend-build + website-build)

### Deploy
- Deployed as a separate Vercel project at **https://larder-website.vercel.app**
- Root Directory set to `website` — no env vars needed (fully static)

---

## Day 11 — Notion-Inspired Sidebar

**The problem:** The app's left sidebar was a basic vertical list with emoji icons. It looked like a school project, not a real product.

**What we shipped:**
- Brand-new `AppShell` layout with a compact Notion-style sidebar — small SVG icons, tight spacing, subtle active state on the current page
- "Quick access" section heading separates frequent destinations from primary nav
- Workspace header at the top with a 🧺 mark and the "Your kitchen's memory" tagline
- User avatar (initials from email) at the bottom plus a Sign Out button styled as a quiet text link
- Mobile bottom nav now uses the same SVG icons, no more emoji

Result: the app finally **looks** like a real product instead of a side project.

---

## Day 12 — UI Polish Pass

A focused round of visual cleanup across every screen:

- **Stat cards** on the pantry page were 4 boxy tiles taking up half the screen. Replaced with a single compact "stat strip" — 4 stats with small icon squares in one tidy row (2-column on mobile, 4-column on desktop). Frees up the page.
- **Item rows** got a thicker freshness bar (twice as visible) and slightly more breathing room. The expiry badge now sits right next to the item name instead of being lost on the far right.
- **Category section headers** got a subtle brand-colored accent bar on the left and the item count is now a small pill badge instead of plain text.
- Every emoji button in the app (✏️ 🗑 📸 ⚠️) was swapped for a proper SVG icon. Hover states added.
- Scan-receipt page got the same treatment — SVG icons everywhere, cleaner header, better progress steps.

Result: the app feels designed, not just functional.

---

## Day 13 — Manual Add + Search + Sort

The pantry was getting hard to scan with 15+ items, and the only way to add items was scanning a receipt — both blockers for real use.

**What we shipped:**
- **"+ Add item" button** in the pantry header. Opens a modal with name, quantity, unit, category, and expiry date fields. Defaults expiry to today + 14 days. Posts to a new `POST /pantry` backend endpoint.
- **Search bar** between the stat strip and the item list. Filters items in real time as you type. Shows result count and an × to clear. Stats and the expiry alert strip stay accurate to the full list regardless of what's searched.
- **Sort dropdown** — Expiry / Name / Recently added. Persists for the session.

Result: users without receipts (farmers market, gifts, existing pantry) can finally use the app, and the list scales past 50 items without becoming a wall of text.

---

## Day 14 — Auth Hardening + Privacy

We added the things every "real" product needs and a portfolio reviewer would expect to see.

**Password reset:**
- `/forgot-password` page — enter email, calls `supabase.auth.resetPasswordForEmail`, shows a "check your inbox" confirmation
- `/reset-password` page — detects Supabase's `PASSWORD_RECOVERY` session from the email link, shows new-password + confirm fields with a show/hide toggle, redirects to login on success
- "Forgot?" link added beside the password label on the login page

**Settings page (`/settings`):**
- Profile section with email + initials avatar + member-since date
- Change-password form (current → new → confirm)
- "Sign out" button
- "Delete account" link surfaces the same type-your-email-to-confirm modal we built in Day 13.5

**Account deletion (built earlier in the day):**
- New `DELETE /account` endpoint that cascades: wipes pantry items, wipes receipts, deletes the Supabase auth user — irreversible
- Sidebar bottom got a small red "Delete account" link that opens a confirmation modal requiring the user to type their email

**Privacy policy:**
- New `/privacy` page on the marketing site, full data policy: what we collect, how it's stored, vendors (Supabase, Anthropic, Render, Vercel), user rights (access, correction, deletion, export), cookies, children, contact
- Linked from the marketing site footer and the signup form's terms text

**Expiring soon page (`/expiring`):**
- The sidebar link that previously pointed to `/` (broken behavior) now points to its own page
- Items grouped into three sections: Expired / Today / Next 3 days
- Sidebar shows a live red badge with the count of items expiring within 3 days
- The badge re-fetches on every navigation so it stays accurate after marking items used

---

## Day 15 — Security Audit + Catch-Up Documentation

Before showing the project to anyone, we ran a full security review across backend, frontend, and infrastructure. Found and fixed 12 issues in one commit.

**Backend hardening:**
- CORS allowlist no longer uses a `.*\.vercel\.app` regex — any random Vercel deployment could previously have called the API with credentials. Now explicit: only the two production URLs plus localhost.
- Server refuses to boot with `DEV_MODE=true` if it detects a production environment (Render env var or `vercel.app` in `FRONTEND_URL`). Prevents the auth-bypass disaster mode.
- Account deletion errors no longer leak stack traces to clients — logged server-side only.
- Every pantry endpoint now has a rate limit (reads 60-120/min, writes 30/min, account deletion 3/hour).
- Receipt uploads now verify file magic bytes — won't accept a malicious ZIP claiming to be a JPEG.
- Decompression-bomb guard: images over 50 megapixels are rejected before Pillow tries to decode them.
- JWT validation now checks the `iss` claim and requires `exp/sub/aud/iss` to be present.
- Office file parsing (.docx, .xlsx) wrapped in try/except — corrupt files can't crash the worker.
- Values from Claude are now clamped — shelf life [1, 365] days, quantity [0.01, 9999], category against an enum allowlist. Defense in depth against an LLM returning garbage.

**Frontend hardening:**
- Both Next.js apps now send a strict `Content-Security-Policy` header. `default-src 'self'`, `frame-ancestors 'none'`, explicit `connect-src` allowlist for Supabase and the backend.

**Supply chain:**
- Every Python and npm dependency pinned to an exact version. No more `^` caret ranges.
- GitHub Actions pinned to commit SHAs instead of floating `@v4` tags. Supply-chain attack surface closed.
- CI standardized on Node 22 (was inconsistently 20 vs 24).

**Documentation:**
- README completely rewritten as a portfolio piece — tech stack badges, "What this demonstrates" table mapping skill areas to evidence, architecture diagram, notable design decisions, API reference, database schema, deployment topology, dedicated AI/LLM integration section. Screenshots scaffold added under `docs/screenshots/`.
- Profile README upgrade discussed (skillicons.dev for tech logos, featured project card).

Result: the app is now safe to share publicly and the GitHub repo tells the full engineering story in one page.

---

## What's Next

- Recipe Suggestions (Claude takes your expiring items and suggests recipes)
- PWA manifest + direct camera access on mobile
- Shopping list — flag items for repurchase
- React Native mobile app (Expo) with native camera
- Email notifications when items are about to expire
