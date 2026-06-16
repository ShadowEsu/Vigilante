-- Vigil Phase 1 schema + RLS

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_type text not null check (target_type in ('company', 'person', 'ticker')),
  target text not null,
  sources jsonb not null default '[]'::jsonb,
  cadence_minutes int not null default 1440,
  model text not null default 'claude-sonnet',
  budget_cap_usd numeric not null default 10,
  spend_usd numeric not null default 0,
  status text not null default 'live' check (status in ('live', 'paused')),
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.snapshots (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  source_url text not null,
  content_hash text not null,
  raw_text text not null,
  fetched_at timestamptz not null default now()
);

create index snapshots_analysis_source_idx on public.snapshots (analysis_id, source_url, fetched_at desc);

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  type text not null,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('low', 'med', 'high')),
  source_url text not null,
  created_at timestamptz not null default now()
);

create index signals_analysis_created_idx on public.signals (analysis_id, created_at desc);

create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index briefs_analysis_created_idx on public.briefs (analysis_id, created_at desc);

create table public.usage (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_usd numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.snapshots enable row level security;
alter table public.signals enable row level security;
alter table public.briefs enable row level security;
alter table public.usage enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

create policy "Users can view own snapshots"
  on public.snapshots for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = snapshots.analysis_id and a.user_id = auth.uid()
    )
  );

create policy "Users can view own signals"
  on public.signals for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = signals.analysis_id and a.user_id = auth.uid()
    )
  );

create policy "Users can view own briefs"
  on public.briefs for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = briefs.analysis_id and a.user_id = auth.uid()
    )
  );

create policy "Users can view own usage"
  on public.usage for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = usage.analysis_id and a.user_id = auth.uid()
    )
  );

-- Service role bypasses RLS for agent run loop writes
