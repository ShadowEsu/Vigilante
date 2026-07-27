# Vigilante — Production Deployment (live scanning on Vercel)

This describes how the deployed site runs **real** company scans instead of the
old read-only saved-preview mode.

## Why it used to be read-only

Every read/write went through `src/lib/company/store.ts`, which persisted JSON
files under `.data/vigil` on the **local filesystem**. Vercel's serverless
filesystem is read-only outside `/tmp`, so the first write (`mkdir .data`) threw
`EROFS`/`ENOENT`. The store caught that, set a `readOnly` flag, threw
`ReadOnlyStoreError`, and the API returned `503 { readOnly: true }` → the
terminal showed *"This deployment is read-only — it serves a saved scan."*

`src/lib/agent/config.ts` already declared a `VIGILANTE_STORAGE=supabase` mode,
but **no Supabase storage backend was ever implemented** — so the app had no way
to persist anywhere except the (unwritable) disk.

## The fix

- `store.ts` is now a **dispatcher**. With `VIGILANTE_STORAGE=supabase` it routes
  every read/write to Postgres (`store-supabase.ts`); otherwise it uses the
  filesystem store (`store-fs.ts`, unchanged, for local dev).
- New migration `supabase/migrations/003_vigilante_intel.sql` creates the
  `vigil_*` tables. RLS is on with no policies, so only the server's service-role
  key can touch them — the browser never does.
- User-supplied URL fetching is now SSRF-hardened (`src/lib/security/ssrf.ts`).
- Scan routes pin the Node runtime + `maxDuration`, and each scan is bounded to
  `AGENT_MAX_SCAN_SOURCES` sources so it fits the function time budget.

No frontend redesign — `/preview` already called the real API; fixing the store
makes the whole flow work.

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

| Variable | Required | What it does | Where to get it |
|---|---|---|---|
| `VIGILANTE_STORAGE` | ✅ | Set to `supabase` to use Postgres persistence. | literal value `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL. | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Browser/auth key (safe to expose). | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only key the scan store writes with. **Never expose.** | Supabase → Project Settings → API → `service_role` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your deployed URL, e.g. `https://vigilante-eight.vercel.app` | your Vercel domain |
| `ANTHROPIC_API_KEY` | recommended | LLM briefs + change analysis. Without it, scans still run and save; briefs fall back to heuristic summaries of the real page text. | https://console.anthropic.com |
| `SERPER_API_KEY` | recommended | Better source discovery (Google results). Without it, discovery uses fallback URL probing. | https://serper.dev |

Do **not** set `ANTHROPIC_AUTH_TOKEN`/`ANTHROPIC_BASE_URL` (FreeLLMAPI) on Vercel —
that proxy only runs locally.

## Supabase setup

1. Use an existing project or create one at https://supabase.com.
2. Apply the migration (SQL Editor → paste the file → Run):
   `supabase/migrations/003_vigilante_intel.sql`
   Or with the CLI: `supabase db push` (after `supabase link`).
3. Copy the URL, anon key, and service_role key into Vercel env vars above.

The migration is idempotent (`create table if not exists`) and non-destructive —
it does not touch the existing auth/waitlist tables from `001`/`002`.

## Deploy steps

1. Merge this branch to the `Vigilante` (production) branch.
2. Set the env vars above in Vercel (Production scope).
3. Redeploy (Vercel auto-deploys on push, or trigger from the dashboard).
4. Open `/preview` and run the demo sequence below.

## Vercel settings

- Framework: Next.js (auto). Region `iad1` (already in `vercel.json`).
- `maxDuration` is set to 60s in the scan routes (safe on all plans). If large
  scans time out, enable **Fluid Compute** and/or upgrade to Pro, then raise
  `maxDuration` in the three routes under `src/app/api/companies/`.

## YC demo sequence (on the live site)

1. Open `/preview` → click **+ TARGET** → type `linear.app`.
2. Discovery lists real Linear sources (pricing/careers/blog/...).
3. Confirm → backend creates the target and runs the first scan.
4. First scan reports **BASELINE** (N sources captured, 0 changes).
5. `linear` appears in the Targets sidebar; Overview/Brief/Documents populate.
6. **Refresh the page** — Linear and its scan are still there (Postgres).
7. Click **SCAN NOW** → a second real scan runs and diffs against the baseline.
8. Click **REDISCOVER** → source discovery re-runs and persists.

## Known limitations

- Scans run synchronously inside one request (bounded to 12 sources). This is the
  simplest production-safe design; for very large targets, refactor to an async
  job (Supabase-backed job row + polling) — the store already persists scan state.
- Without `SERPER_API_KEY`, discovery falls back to probing common paths, so a few
  discovered URLs may be lower quality.
- SEC/EDGAR name-matching can surface filings for similarly-named public entities;
  it's advisory.
- The committed `seed.json` (Stripe/Linear) only backs the **local** filesystem
  fallback; the production Supabase DB starts empty and fills from real scans.
