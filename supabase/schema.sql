-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  anonymous_id text,
  created_at timestamptz not null default now(),
  first_touch_source text,
  first_touch_utm_campaign text,
  first_touch_utm_medium text
);

-- Events table (one row per funnel step per session)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id text not null,
  anonymous_id text,
  step text not null check (step in ('quiz_start', 'email_view', 'paywall_view', 'buy_click')),
  source text not null default 'direct',
  utm_campaign text,
  utm_medium text,
  utm_content text,
  utm_term text,
  created_at timestamptz not null default now()
);

-- Indexes for dashboard queries
create index if not exists events_step_idx on public.events(step);
create index if not exists events_source_idx on public.events(source);
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_anonymous_id_idx on public.events(anonymous_id);
create index if not exists users_anonymous_id_idx on public.users(anonymous_id);
create index if not exists events_created_at_idx on public.events(created_at);

-- RLS: enable but allow all for MVP (anon key access)
alter table public.users enable row level security;
alter table public.events enable row level security;

drop policy if exists "allow_all_users" on public.users;
drop policy if exists "allow_all_events" on public.events;

create policy "allow_all_users" on public.users for all using (true) with check (true);
create policy "allow_all_events" on public.events for all using (true) with check (true);
