# Shared API contract (web, Android, iOS)

## Enums

```
TARGET_TYPES = company | person | ticker
ANALYSIS_STATUS = live | paused
SIGNAL_SEVERITY = low | med | high
SIGNAL_TYPES = pricing | promo | hiring | site | market | expansion | person
INTEGRATION_PROVIDER = slack | webhook | discord
WEBHOOK_STATUS = pending | delivered | failed
```

## Auth

```
MOBILE_DEEP_LINK = vigil://auth/callback
API_AUTH = Bearer {supabase_access_token}
CRON_AUTH = Bearer {CRON_SECRET}
```

## Core endpoints

```
GET  /api/health
GET  /api/status
GET  /api/pipeline
POST /api/analyses/{id}/run     (auth required)
GET  /api/cron/run              (CRON_SECRET)
POST /api/integrations/slack
POST /api/waitlist
POST /api/promo
POST /api/ask
```

## Webhook events

```
EVENT_TYPES =
  brief.created
  signals.detected
  analysis.completed
  company.scrape.completed

HEADER_SIGNATURE = X-Vigilante-Signature   (HMAC-SHA256 hex, optional)
PIPELINE_VERSION = vigilante-intel-v1
```

## Pipeline stages

```
discover → fetch → diff → extract → brief → persist → notify
```

Full integration guide: `docs/api/README.md`
