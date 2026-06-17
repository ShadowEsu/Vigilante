# Vigilante API — Integration Guide

Base URL: `NEXT_PUBLIC_SITE_URL` (e.g. `https://vigilant.app` or `http://localhost:3000`)

All JSON responses use `{ ok: true, ... }` or `{ ok: false, error, code }`.

## Discovery

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Liveness + pipeline metadata |
| GET | `/api/status` | None | Feature flags, models, storage |
| GET | `/api/pipeline` | None | Pipeline stages + config snapshot |

## Competitive intel

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/analyses/{id}/run` | Bearer or cookie | Run Supabase-backed analysis |
| POST | `/api/companies` | None* | Onboard company (local demo store) |
| POST | `/api/companies/{id}/run` | None* | Full company scrape + brief |
| POST | `/api/ask` | None | Q&A over context (Anthropic) |

\* Company routes use local filesystem storage in dev; add auth before production.

## Cron (scheduled analyses)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cron/run` | `Authorization: Bearer {CRON_SECRET}` or `x-cron-secret` | Run due analyses (`next_run_at <= now`) |

Set `CRON_SECRET` in Vercel env. Vercel Cron is configured in `vercel.json` (hourly).

## Integrations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/integrations/slack` | None | Test a Slack incoming webhook URL |

### Server-side webhooks (env)

When a brief is created, Vigilante emits events to:

- `WEBHOOK_URL` — generic JSON POST with optional `X-Vigilante-Signature` (HMAC-SHA256 of body using `WEBHOOK_SIGNING_SECRET`)
- `VIGILANTE_SLACK_WEBHOOK_URL` — Slack incoming webhook for `brief.created` events

Event types: `brief.created`, `signals.detected`, `analysis.completed`, `company.scrape.completed`.

Example payload:

```json
{
  "id": "evt_abc123",
  "type": "brief.created",
  "created_at": "2026-06-14T12:00:00.000Z",
  "pipeline_version": "vigilante-intel-v1",
  "data": {
    "target": "Acme Corp",
    "title": "Pricing page update",
    "body": "...",
    "source": "analysis",
    "analysis_id": "uuid",
    "signal_count": 3,
    "url": "https://vigilant.app/app"
  }
}
```

## Waitlist & promo

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/waitlist` | Join waitlist |
| GET | `/api/waitlist` | Waitlist count |
| POST | `/api/promo` | Validate promo code |

## Mobile parity

See `shared/API.md` for enum constants shared with Android/iOS clients.

## Environment

Copy `.env.example` → `.env.local`. Minimum for AI runs:

- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (auth analyses)
- `CRON_SECRET` (scheduled runs)
- `WEBHOOK_URL` / `VIGILANTE_SLACK_WEBHOOK_URL` (alerts)
