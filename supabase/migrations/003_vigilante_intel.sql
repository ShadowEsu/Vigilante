-- Vigilante live-scan persistence (production storage backend).
--
-- These tables back src/lib/company/store-supabase.ts, which the app selects
-- when VIGILANTE_STORAGE=supabase. They replace the local-filesystem JSON store
-- (.data/vigil) that cannot be written on Vercel's read-only filesystem.
--
-- All access is server-side via the service-role key (see src/lib/supabase/
-- admin.ts). RLS is enabled with NO policies, so the anon/browser key can read
-- nothing here; only the service role (which bypasses RLS) can touch these rows.
--
-- The `vigil_` prefix avoids colliding with the auth-scoped `snapshots`,
-- `signals`, and `briefs` tables from 001_vigil_schema.sql.

create table if not exists public.vigil_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  input text not null default '',
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'scanning' check (status in ('live', 'paused', 'scanning')),
  spend_usd numeric not null default 0,
  budget_usd numeric not null default 5,
  pages_indexed int not null default 0,
  last_scraped_at timestamptz,
  created_at timestamptz not null default now()
);

-- One row per domain — onboarding the same domain twice reuses the target.
create unique index if not exists vigil_companies_domain_key
  on public.vigil_companies (lower(domain));

create table if not exists public.vigil_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  title text not null,
  doc_type text not null,
  category text not null default '',
  url text not null,
  excerpt text not null default '',
  scraped_at timestamptz not null default now()
);
create index if not exists vigil_documents_company_idx
  on public.vigil_documents (company_id, scraped_at desc);
create unique index if not exists vigil_documents_unique
  on public.vigil_documents (company_id, url, doc_type);

create table if not exists public.vigil_insider_moves (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  person text not null default '',
  role text not null default '',
  move_type text not null default '',
  note text not null default '',
  date text not null default '',
  source_url text,
  scraped_at timestamptz not null default now()
);
create index if not exists vigil_insider_company_idx
  on public.vigil_insider_moves (company_id, scraped_at desc);

create table if not exists public.vigil_newsletters (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  name text not null default '',
  subject text not null default '',
  url text not null default '',
  excerpt text not null default '',
  changes jsonb not null default '[]'::jsonb,
  received text not null default '',
  scraped_at timestamptz not null default now()
);
create index if not exists vigil_newsletters_company_idx
  on public.vigil_newsletters (company_id, scraped_at desc);

create table if not exists public.vigil_intel_highlights (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  category text not null,
  title text not null,
  detail text not null,
  amount text,
  source_url text not null default '',
  source_label text not null default '',
  scraped_at timestamptz not null default now()
);
create index if not exists vigil_intel_company_idx
  on public.vigil_intel_highlights (company_id, scraped_at desc);

create table if not exists public.vigil_briefs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  title text not null,
  body text not null,
  confidence numeric not null default 0,
  sources int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists vigil_briefs_company_idx
  on public.vigil_briefs (company_id, created_at desc);

create table if not exists public.vigil_scan_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  date text not null default '',
  time text not null default '',
  watch text not null default '',
  findings int not null default 0,
  ms text not null default '',
  cost text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists vigil_scan_log_company_idx
  on public.vigil_scan_log (company_id, created_at desc);

create table if not exists public.vigil_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  source_url text not null,
  content_hash text not null,
  raw_text text not null,
  fetched_at timestamptz not null default now()
);
create index if not exists vigil_snapshots_lookup_idx
  on public.vigil_snapshots (company_id, source_url, fetched_at desc);

create table if not exists public.vigil_changes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.vigil_companies (id) on delete cascade,
  source_url text not null,
  source_label text not null default '',
  change_type text not null,
  title text not null,
  summary text not null default '',
  bullets jsonb not null default '[]'::jsonb,
  severity text not null default 'low' check (severity in ('low', 'med', 'high')),
  is_baseline boolean not null default false,
  hash_before text,
  hash_after text not null default '',
  detected_at timestamptz not null default now()
);
create index if not exists vigil_changes_company_idx
  on public.vigil_changes (company_id, detected_at desc);

-- Lock every table down: RLS on, no policies → anon/browser key sees nothing.
-- The server uses the service role, which bypasses RLS.
alter table public.vigil_companies enable row level security;
alter table public.vigil_documents enable row level security;
alter table public.vigil_insider_moves enable row level security;
alter table public.vigil_newsletters enable row level security;
alter table public.vigil_intel_highlights enable row level security;
alter table public.vigil_briefs enable row level security;
alter table public.vigil_scan_log enable row level security;
alter table public.vigil_snapshots enable row level security;
alter table public.vigil_changes enable row level security;
