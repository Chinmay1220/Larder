# Pantry App — The Story So Far
### A non-technical log of how this product is being built

---

## The Idea (Day 0)

The problem is simple: you go grocery shopping and buy blueberries. You get home and realize you already had blueberries. The old ones go bad. Money wasted, food wasted.

This happens because the grocery store knows what you bought — but your fridge doesn't. Nobody has connected those two things well.

The app we're building fixes this. It watches what you buy, remembers what you have, and warns you before you shop again.

---

## What We're Building

A smart pantry tracker that:
- Reads your grocery receipts (photo, email, or online order)
- Builds a live inventory of what's in your kitchen
- Tells you what's about to expire
- Warns you before you shop: "you already have blueberries"

Available as both a **mobile app** (iPhone + Android) and a **website**.

---

## Why This Can Be Big

The average American household throws away about $1,500 worth of food every year. If this app saves someone even $300/year, they'll gladly pay $5/month for it.

Once enough people use it, the data becomes incredibly valuable — big food brands pay millions to understand what people actually buy, eat, and waste. That's the second business on top of the first.

---

## The Decisions We Made

**What version 1 does:**
- You take a photo of your grocery receipt
- The app reads it and updates your pantry
- You get a warning before you shop about what you already have

**What version 1 does NOT do** (saved for later):
- Gmail or email reading
- Instacart / online order sync
- Voice input
- Household sharing with roommates / family
- Meal suggestions
- Payments

**How you'll eventually be able to add items:**
1. Photo of receipt (v1 — done)
2. Automatic email receipt reading (v2)
3. Instacart / online grocery sync (v2)
4. Voice: "I just bought milk" (v3)
5. Weekly fridge camera scan (v3)

---

## Day 1 — Proof of Concept

**What we built:** A single Python script that proves the core idea works.

**How it works:**
1. Drop a receipt photo into a folder
2. Run the script
3. It reads the receipt using AI
4. It prints your pantry and what's about to expire

**What we tested it on:** A real Instacart receipt (Plums, Gold Potatoes, Golden Pineapple, Paper Towels — $37.57 total).

**What the app correctly figured out:**
- Golden Pineapple expires April 29
- Plums expire May 6
- Gold Potatoes last until May 22
- Paper Towels are a household item, not food
- Pre-shop alert: "you already have potatoes, pineapple, plums"

**Verdict: The core idea works.** The AI can read a receipt and turn it into a smart pantry list.

---

## The Tools We're Using

| Tool | What it does in plain English |
|------|-------------------------------|
| **Supabase** | Our database — stores your pantry, receipts, and account info |
| **FastAPI** | The brain of the app — handles all the logic |
| **React Native** | The mobile app (works on iPhone and Android) |
| **Next.js** | The website version |
| **Vercel** | Hosts the website (free) |
| **GitHub** | Stores all our code |
| **GitHub Actions** | Runs automatic tasks (like checking for expired items every night) |
| **Claude AI (Anthropic)** | Reads receipt photos and understands what was bought |
| **Stripe** | Payments — added later when we have real users |

---

## What's Next (Day 2)

Start building the real app:
1. Set up the database (Supabase)
2. Build the backend (FastAPI)
3. Build the mobile app camera screen (React Native)
4. Build the website (Next.js)
5. Connect everything together

---

## The Bigger Vision

Single user (you) → Households → Thousands of users → Data product sold to food brands → Unicorn

The path is clear. We're on step 1.
