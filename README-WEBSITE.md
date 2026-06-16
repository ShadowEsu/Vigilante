# YC Vigilante — Website

**Live site:** https://shadowesu.github.io/Vigilante/

Launch site and waitlist for **Vigilante** competitive intelligence.

This branch is for the **marketing site** (`/`), waitlist, pricing, and interactive terminal demo. The full product app lives on the `Vigilante` branch (same codebase — deploy either or both from one Vercel project).

## What's on this site

| Route | What |
|-------|------|
| `/` | YC-style launch page — hero, terminal demo, pricing, waitlist |
| `/preview` | Full product demo (no auth) |
| `/auth` | Magic-link sign-in |

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Live waitlist setup

**Required for production** — run once in Supabase SQL Editor (in order):

```
website/supabase/waitlist.sql
website/supabase/waitlist-public-count.sql
```

**GitHub Pages** (auto-deploys from `YC_Vigilante-Website` branch) — repo secrets already set:

- `NEXT_PUBLIC_SUPABASE_URL` → `https://lshqzxgzehgmzgeilvmy.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → from Supabase dashboard

View signups: [Supabase Table Editor → waitlist](https://supabase.com/dashboard/project/lshqzxgzehgmzgeilvmy/editor)

**Vercel** (full app + API routes) — environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

Test signup:

```bash
curl -X POST $SITE/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","plan_tier":"growth","promo_code":"VIGILANTE"}'
```

Expected: `{ "ok": true, "quote": { ... } }`

Without Supabase, signups save to `.data/waitlist.json` **local dev only**.

## Promo

- **3 AI agents · $10/mo** — the core plan for competitor analysis  
- Code **`VIGILANTE`** → **50% off** ($5/mo for 3 AI agents)  
- First **100** waitlist signups → **$10/mo credit × 6 months** on top

## Deploy

**GitHub Pages (website):** push to `YC_Vigilante-Website` — workflow builds static export to https://shadowesu.github.io/Vigilante/

```bash
npm run build:github-pages   # local test (runs prepare → build → restore scripts)
```

**Vercel (full app):**

```bash
npx vercel --prod
```

Point your domain at the Vercel project. Waitlist on Vercel uses `/api/waitlist` once Supabase env vars are set.

## Files

```
src/website/           LaunchPage, WaitlistForm, PricingSection, ProductShowcase
src/app/api/waitlist   POST/GET signup API
src/app/api/promo      Promo validation
website/supabase/      SQL schema
```

Full app docs → switch to the **`Vigilante`** branch.
