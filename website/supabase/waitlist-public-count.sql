-- Public waitlist count for launch site (GitHub Pages + anon client)
-- Run after waitlist.sql

create or replace function public.waitlist_public_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from public.waitlist;
$$;

revoke all on function public.waitlist_public_count() from public;
grant execute on function public.waitlist_public_count() to anon, authenticated;
