# NOTES — FreeLLMAPI integration

Vigilante's intel pipeline used to call Anthropic directly with a paid
`ANTHROPIC_API_KEY`. It now routes through
[FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi), a self-hosted
OpenAI/Anthropic-compatible proxy that aggregates the free tiers of ~28
providers behind one endpoint — so the app runs on free-tier capacity instead
of burning paid credits.

## How it works

FreeLLMAPI speaks the Anthropic Messages API at `/v1/messages`, which is
exactly where `@anthropic-ai/sdk` posts. So the SDK stayed; only its base URL
and auth changed. No prompt, no response parsing, and no token-usage accounting
was rewritten.

All LLM traffic now goes through one client: **`src/lib/agent/llm-client.ts`**.

```
src/lib/agent/llm-client.ts   ← single configured Anthropic client
        ├── src/lib/agent/llm.ts          detectSignals / generateBrief / generateOnboardingBrief
        └── src/app/api/ask/route.ts      /api/ask
```

### Backend selection

`llmBackend()` picks a backend from the environment:

| Env | Backend | Behaviour |
|---|---|---|
| `ANTHROPIC_AUTH_TOKEN` set | `freellmapi` | Bearer auth against `ANTHROPIC_BASE_URL`, `apiKey` forced to `null` |
| `ANTHROPIC_API_KEY` set (and no auth token) | `anthropic` | Direct paid Anthropic |
| neither | `none` | AI features off; pipeline degrades to template briefs |

### ⚠️ Never set both keys

The Anthropic SDK's `authHeaders()` prefers `x-api-key` over the Bearer token
whenever `apiKey` is non-null. If `ANTHROPIC_API_KEY` is set alongside
`ANTHROPIC_AUTH_TOKEN`, the SDK silently sends the wrong header and every
FreeLLMAPI request fails. `llm-client.ts` passes `apiKey: null` in proxy mode
to make that impossible, but keep the env clean anyway.

## Setup

```bash
# 1. FreeLLMAPI
git clone https://github.com/tashfeenahmed/freellmapi && cd freellmapi
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # → ENCRYPTION_KEY in .env
docker compose up -d          # or: npm install && npm run build && npm start -w server

# 2. Open http://localhost:3001 → Keys page
#    Add free-tier provider keys (Google Gemini, Groq, Cerebras, Mistral, OpenRouter, ...)
#    Copy the unified key (freellmapi-...) from the Keys page header

# 3. Vigilante
ANTHROPIC_BASE_URL=http://localhost:3001
ANTHROPIC_AUTH_TOKEN=freellmapi-your-unified-key
```

**Adding at least one provider key is required.** With zero keys, FreeLLMAPI
authenticates fine but every completion returns
`429 All models exhausted: N routes checked (N no usable key configured)`.

### Ports

Vigilante dev now runs on **3002** (`next dev -p 3002`) because FreeLLMAPI's
dashboard and API own **3001**.

## Model selection

Models resolve through `AGENT_CONFIG.models` (`src/lib/agent/config.ts`):

- On FreeLLMAPI, all three stages default to **`auto`** — its router picks the
  best healthy free model per request.
- On Anthropic direct, they default to the pinned Claude IDs.
- Override any stage with `AGENT_DETECT_MODEL` / `AGENT_BRIEF_MODEL` /
  `AGENT_ASK_MODEL` (e.g. `gemini-2.5-flash`).

`calculateCost()` returns **0** for `auto` and `freellmapi/*` models, so
free-tier runs don't accrue fake spend and trip per-analysis budget caps.

## Bugs fixed along the way

1. **`HAIKU_MODEL` was `claude-haiku-3-5-20241022`** — not a real model ID (the
   correct one is `claude-3-5-haiku-20241022`). Every `detectSignals()` call
   would have 404'd against real Anthropic. Fixed in `pricing.ts`.

2. **Empty env vars blanked every model ID.** `config.ts` used `??`, which only
   falls back on `undefined` — but `.env.example` ships `AGENT_DETECT_MODEL=`,
   an empty string, which passed straight through. `/api/health` was reporting
   `"models":{"detect":"","brief":"","ask":""}`. Now uses `||` via `envModel()`.

3. **`generateBrief()` ignored its `analysisModel` argument** and always used
   Sonnet, making the per-analysis model column decorative. Now resolved by
   `resolveBriefModel()`, which maps UI aliases (`claude-sonnet`) to real IDs.

4. **Gemini hard-threw** `"Gemini brief generation is Phase 2"`. Through
   FreeLLMAPI it's just another upstream provider, so it resolves normally; on
   Anthropic direct it falls back to the configured brief model instead of 404ing.

5. **`company-run.ts` hardcoded `costUsd += 0.01`** per brief instead of using
   real token usage. Now calls `calculateCost()` with the returned usage.

## Step 3 — pipeline quality

### Brief generation

6. **Briefs arrived as truncated JSON.** `max_tokens: 600` was tuned for Sonnet;
   free-tier models are chattier and ran out mid-object, so `parseBriefJson()`
   failed and the fallback dumped the raw fragment into the user-visible body
   (`{"title": "Stripe Competitive Intelligence Baseline...", "body": "`).
   Raised to 1600 (1024 for change briefs) and added `salvageBriefFields()`,
   which reconstructs `title`/`body` from partial JSON instead of leaking it.

### Intel extraction (`intel-extract.ts`)

The extractor ran raw regex over full page text, so navigation chrome and
marketing copy scored as competitive intel. On stripe.com it produced 20
highlights, most of them junk. Now 9, with the figures actually correct.

- **Boilerplate rejection** — a nav bar containing the word "Revenue" was
  surfacing as a financial highlight reading *"Revenue Products Solutions
  Developers Resources Pricing Guide me Sign in Start now Contact sales"*.
  `looksLikeProse()` rejects spans by shape: known chrome phrases, too few
  function words, runs of ≥5 capitalised words, or >55% capitalisation.
- **Sentence-boundary matching** — patterns used to match against a ±20/+80
  character window around each keyword, which sliced through sentences and
  yielded fragments like *"revenue officer June 22, 2026 Product Stripe
  equips…"*. The text is now split into sentences once and patterns match whole
  sentences.
- **Numeric evidence required** for `financial` / `valuation` / `leverage` /
  `transaction`. Vendor copy reuses the vocabulary constantly — *"Increase
  revenue with selective retries powered by machine learning"* is not a
  financial disclosure. Narrative categories are exempt.
- **Truncated amounts dropped** — a cut-off window turned `$1.2 billion` into
  `$1`, which was then displayed as the amount.
- **New `pricing` category** — unit prices (`$0.01 per 1,000 units`,
  `$20 per user per month`) were being filed as corporate financials. They are
  real intel for this product, just not financials. Bare sub-$1,000 amounts
  with no pricing context are dropped as stripped-out unit prices.

Representative output after the change:

> `$1.4 trillion` — Businesses on Stripe generated $1.4 trillion in total
> payment volume in 2024, up 38% from the prior year
> `$100M` — Gamma expands to $100M ARR and 70 million users with Stripe

### The three agents — now actually wired (`src/lib/agent/agents.ts`)

The three monitoring agents existed only as marketing copy in the local
pipeline. `company-run.ts` hashed page text and guessed a category from
keywords in the URL, so a competitor repricing and a footer tweak were
indistinguishable once the hashes differed — every change read
`"PRICING change — stripe.com/pricing"` / `"Content updated on monitored page"`.
`detectSignals()` (the LLM diff) only ran in the Supabase path (`run.ts`),
which the local store never touches.

`agents.ts` adds a registry — **Pricing**, **Filings**, **Hiring**, plus a
general fallback — where each agent claims URLs it owns and contributes a
domain-specific brief to the diff prompt. `company-run.ts` now routes every
real diff to its owning agent.

Design points:

- **Baselines are skipped.** Nothing to compare on a first scan, and it would
  burn free-tier quota on every source during onboarding.
- **Failure is non-fatal.** `analyzePageChange()` returns `null` instead of
  throwing when a provider throttles, so one rate-limited page can't abort a
  scan. The heuristic result stands.
- **Severity has a floor.** The model rated a 33% price rise `low`; it may now
  raise severity but not push a `pricing`/`promo` change below `high`.
- **Real cost accounting** via `calculateCost()` on returned usage — $0 on
  free-tier models.

Verified with a controlled test: the stored Linear baseline was edited so that
exactly one tier moved (Business `$12`, live `$16`; Basic unchanged at `$10`).
The Pricing Agent returned exactly one signal —

> `[pricing/high] Business tier price increased from $12 to $16 per user/month`
> The Business plan's monthly price per user rose from $12 to $16 (billed yearly).

— and did **not** fabricate a parallel Basic-tier change. Hiring Agent output
from the same run:

> `Added Recruiting & HR Operations Specialist role` — A new People-function
> position (North America) was added, signaling a push to scale talent
> acquisition. Overall headcount up by one role.

### /preview and live data

`/preview` was never mock-only — it renders the same `VigilApp`/`useVigil` as
`/app`, which fetches `/api/companies` and falls back to fixtures only when the
store is empty. Onboarding a company flips the whole page live. Two real
problems surfaced once it was running on live data:

7. **"LIVE TICKERS" was fabricated and unconditional.** `useVigil` returned the
   `STOCKS` fixture with no `hasLive` branch, so a panel titled *LIVE* reported
   invented prices and invented events (`NVDA $124.50 · insider buy Jun 12 ·
   $2.1M block`) beside genuinely scraped intel. No market data provider is
   wired into the pipeline at all. The fixture is now demo-state only; when live
   the panel reads `NOT CONFIGURED` and explains that public-company signals
   arrive via SEC EDGAR instead.

8. **339 React duplicate-key errors** on the live page. Lists were keyed on
   composites that are unique in the fixtures but repeat in scraped data —
   `${person}-${date}` collapsed to `—-Jul 23`, `${category}-${title}` to
   `SEC filing-FORM 4`, and EDGAR returns the same filing URL more than once.
   React silently drops or duplicates rows on non-unique keys, so the counts on
   screen could not be trusted. Index-suffixed across `OverviewView`,
   `InsightsView`, `DocumentsView`, `NewsletterView`, `SidebarDocuments`;
   console is clean on reload.

### Change detection — confirmed working

A second scan of stripe.com diffed against stored baselines and found real
changes (`pricing update on stripe.com/pricing`, newsletter updates on
`/blog` and `/newsroom`). First scan stores baselines only; diffs need a
second pass, which is by design.

## Deployment

Live at **https://vigilante-eight.vercel.app** (Vercel project `vigilante`,
deployed from the CLI — the GitHub auto-connect failed because the Vercel
account has no GitHub login connection).

Deploying surfaced four more issues:

9. **The local store cannot write on Vercel.** `store.ts` persists to
   `process.cwd()/.data/vigil`, and serverless filesystems are read-only
   outside `/tmp`. The runtime now serves `src/lib/company/seed.json` — a
   committed snapshot of a real stripe.com + linear.app scan — and write
   attempts raise `ReadOnlyStoreError`, which the API returns as a 503 with an
   explanation instead of an unhandled 500. Note the errno: Vercel reports
   **ENOENT** for `mkdir /var/task/.data`, not the expected EROFS.

10. **Middleware 500'd every `/auth` and `/app` request.** `middleware.ts` passed
    `process.env.NEXT_PUBLIC_SUPABASE_URL!` with a non-null assertion; with no
    Supabase configured, `createServerClient` threw on every matched route.
    Missing config is now treated as "no session" so the routes still render.

11. **`vercel.json` declared an hourly cron** (`0 * * * *`). Hobby plans allow
    daily crons only, so this would have failed the deployment — and the cron
    writes to storage, which is read-only in production. Removed; restore it
    alongside a real database.

12. **`.data/` was uploaded despite being gitignored,** shadowing the seed with
    whatever was on disk (a stale duplicate company reached the first deploy).
    Added `.vercelignore` — Vercel's CLI upload does not apply `.gitignore` here.

### What the deployed site does and doesn't do

Works: launch site, pricing, waitlist, legal pages, and `/preview` showing the
real agent output (`Business tier price increased from $12 to $16 per
user/month — Pricing Agent`), real EDGAR filings, and hiring signals.

Does not work: adding targets, running scans, and `/api/ask`. Those need a
writable database and an LLM endpoint reachable from Vercel. `features.ai` is
false in production by design — no keys left this machine.

## Known-broken, not addressed

- ~~`src/services/CircuitBreaker.ts` / `AuditService.ts`~~ — deleted. They were
  untyped JS in `.ts` files, imported nowhere, and produced 24 `tsc` errors that
  broke `next build`. Typecheck and build are now clean.
- The Settings UI "OPENAI KEY" / "SUPABASE KEY" rows are demo props wired to
  nothing (`SettingsView.tsx`, `SettingsPageView.tsx`).
- Extraction still lets some of Stripe's own customer-story marketing through
  ("Read the story…"). Regex is at diminishing returns here; an LLM extraction
  pass over the scraped text would fix the remaining cases properly.
- `features.search` is off without `SERPER_API_KEY`; discovery falls back to
  heuristics.
