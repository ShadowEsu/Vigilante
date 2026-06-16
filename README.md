# Vigilante

[![Website](https://img.shields.io/badge/website-live-4ADE80?style=for-the-badge)](https://shadowesu.github.io/Vigilante/)
[![Demo](https://img.shields.io/badge/demo-try%20now-6E9BE6?style=for-the-badge)](https://shadowesu.github.io/Vigilante/preview)
[![Waitlist](https://img.shields.io/badge/waitlist-join-000?style=for-the-badge)](https://shadowesu.github.io/Vigilante/#waitlist)

**[Vigilante](https://shadowesu.github.io/Vigilante/)** — AI competitive intelligence. Three agents monitor competitor pricing, SEC filings, and hiring pages. Daily diffs and sourced briefs from **$10/mo**.

> **Link to us:** [Press kit](https://shadowesu.github.io/Vigilante/press) · [Tool comparison](https://shadowesu.github.io/Vigilante/resources/competitive-intelligence-tools) · [CI guide](https://shadowesu.github.io/Vigilante/competitive-intelligence)

Competitive intelligence monitoring — watch competitor pricing, filings, careers, and product pages. Daily diffs, sourced briefs, SEC EDGAR.

**Live site:** [vigilante.app launch](https://shadowesu.github.io/Vigilante/) · full product demo at [`/preview`](https://shadowesu.github.io/Vigilante/preview)

## Branches

| Branch | Purpose |
|--------|---------|
| **`Vigilante`** | Full application — intel engine, `/preview` app, APIs, mobile-ready backend |
| **`YC_Vigilante-Website`** | Launch site focus — waitlist, pricing, YC-style marketing page |

Both branches share the same Next.js codebase; pick the branch that matches what you're deploying or reviewing.

## Live preview (GitHub Pages)

**https://shadowesu.github.io/Vigilante/**

Deployed automatically from the `YC_Vigilante-Website` branch via GitHub Actions.

### Waitlist on GitHub Pages

1. Run `website/supabase/waitlist.sql` and `website/supabase/waitlist-public-count.sql` in Supabase  
2. Add GitHub repo **Secrets** → Settings → Secrets → Actions:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Re-run the **Deploy website to GitHub Pages** workflow (or push to `YC_Vigilante-Website`)

Signups write directly to Supabase from the browser (no server API on static hosting).

## Quick start

```bash
npm install
cp .env.example .env.local   # add Supabase keys for live waitlist
npm run dev
```

- http://localhost:3000 — launch site + interactive terminal demo  
- http://localhost:3000/preview — full Vigilante app  
- http://localhost:3000/auth — magic-link sign-in  

## Waitlist (production)

The waitlist **must use Supabase in production** (Vercel/serverless has no persistent local disk).

### 1. Create Supabase project

1. [supabase.com](https://supabase.com) → New project  
2. SQL Editor → run [`website/supabase/waitlist.sql`](website/supabase/waitlist.sql)  
3. If the table already exists, run [`website/supabase/waitlist-migration-billing.sql`](website/supabase/waitlist-migration-billing.sql)

### 2. Environment variables

Set on Vercel (or `.env.local` for dev):

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (prod) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (prod) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (prod) | Server-side waitlist inserts |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL |

**Do not** use placeholder values in production — the API falls back to local `.data/waitlist.json` only for local dev.

### 3. API

- `GET /api/waitlist` → `{ count }`  
- `POST /api/waitlist` → `{ email, company?, role?, plan_tier?, promo_code? }`  
- `GET /api/promo` → founding slots + promo hints  
- `POST /api/promo` → validate code (e.g. `VIGILANTE` = 50% off)

### 4. Verify

```bash
curl -X POST https://your-domain.vercel.app/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"you@company.com","plan_tier":"free"}'
```

## Deploy (Vercel)

```bash
npx vercel
```

Add env vars in Vercel → Settings → Environment Variables, then redeploy.

## Stack

- **Next.js 14** — App Router  
- **Supabase** — auth, waitlist, data  
- **Anthropic / Serper** — intel pipeline (optional for demo)  

## Structure

```
src/website/     Launch page, waitlist, pricing, terminal demo
src/vigil/       Product UI (/preview)
src/app/api/     waitlist, promo, companies, intel APIs
website/         Supabase SQL + launch docs
```

## Promo & pricing

- **First 100 signups:** $10/mo credit × 6 months (auto-applied)  
- **Code `VIGILANTE`:** 50% off monthly plan  
- Plans: Free (2 agents) · $10/mo (3–5) · $20/mo (6+) · Custom  

## License

MIT — see repository license.
