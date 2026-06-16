-- Optional migration for existing Supabase waitlist tables
alter table public.waitlist add column if not exists plan_tier text default 'free';
alter table public.waitlist add column if not exists promo_code text;
alter table public.waitlist add column if not exists discount_percent int;
alter table public.waitlist add column if not exists founding_credit boolean default false;
alter table public.waitlist add column if not exists due_monthly_usd numeric(10, 2);
