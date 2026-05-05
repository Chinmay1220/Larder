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

## What's Next

- React Native mobile app (Expo) with native camera
- Wire mobile camera → Render backend → pantry view
- Email receipt reading (Gmail sync)
