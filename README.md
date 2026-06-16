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

**GitHub Pages** (auto-deploys from `YC_Vigilante-Website` branch) — add repo secrets:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The static site signs up directly via Supabase (anon insert + `waitlist_public_count` RPC).

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

- First **100** waitlist signups → **$10/mo credit for 6 months**  
- Code **`VIGILANTE`** → **50% off** (apply on pricing section)

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
