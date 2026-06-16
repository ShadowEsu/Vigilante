-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- Waitlist for Vigilante launch site

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  role text,
  source text default 'launch',
  plan_tier text default 'free',
  promo_code text,
  discount_percent int,
  founding_credit boolean default false,
  due_monthly_usd numeric(10, 2),
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

alter table public.waitlist enable row level security;

-- Allow anonymous inserts from the launch form (anon key only)
create policy "waitlist_public_insert"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- No public reads — use service role in dashboard only
create policy "waitlist_no_public_select"
  on public.waitlist
  for select
  to anon, authenticated
  using (false);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
