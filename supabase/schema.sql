-- HuyVo Portfolio V0.9.1 — Real CMS / Supabase Admin
-- Run this in Supabase SQL Editor before saving from /admin.

create table if not exists public.portfolio_profiles (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_profiles enable row level security;

drop policy if exists "portfolio_profiles_public_read" on public.portfolio_profiles;
create policy "portfolio_profiles_public_read"
  on public.portfolio_profiles
  for select
  using (true);

-- No insert/update policy is created for anon users.
-- Writes are performed only through the Next.js API route using SUPABASE_SERVICE_ROLE_KEY.
