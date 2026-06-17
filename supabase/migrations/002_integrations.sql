-- User integrations + outbound webhook delivery log (Phase 2)

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('slack', 'webhook', 'discord')),
  config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index integrations_user_idx on public.integrations (user_id);

create table public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index webhook_deliveries_user_created_idx
  on public.webhook_deliveries (user_id, created_at desc);

alter table public.integrations enable row level security;
alter table public.webhook_deliveries enable row level security;

create policy "Users manage own integrations"
  on public.integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users view own webhook deliveries"
  on public.webhook_deliveries for select
  using (auth.uid() = user_id);
