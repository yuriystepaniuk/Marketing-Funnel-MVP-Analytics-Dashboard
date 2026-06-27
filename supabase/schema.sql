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

-- Add quiz_cta_click to allowed step values
alter table public.events drop constraint if exists events_step_check;
alter table public.events add constraint events_step_check
  check (step in ('quiz_start', 'quiz_cta_click', 'email_view', 'email_submit', 'paywall_view', 'buy_click', 'product_view', 'product_ping', 'product_exit'));

-- Funnel counts: cohort-based
-- quiz_start uses session_id (user_id is null), buy_click uses user_id — different keys for same person.
-- We bridge: find session_ids from quiz_start window → then find all user_ids from those sessions.
create or replace function get_funnel_counts(p_source text default null, p_from timestamptz default null)
returns json language sql security definer as $$
  with quiz_sessions as (
    select distinct session_id
    from public.events
    where step = 'quiz_start'
      and (p_source is null or source = p_source)
      and (p_from is null or created_at >= p_from)
  ),
  session_users as (
    select distinct e.user_id::text as key
    from public.events e
    inner join quiz_sessions qs on e.session_id = qs.session_id
    where e.user_id is not null
  ),
  starter_keys as (
    select session_id as key from quiz_sessions
    union all
    select key from session_users
  )
  select coalesce(json_object_agg(step, cnt), '{}'::json) from (
    select e.step, count(distinct coalesce(e.user_id::text, e.session_id)) as cnt
    from public.events e
    where coalesce(e.user_id::text, e.session_id) in (select key from starter_keys)
    group by e.step
  ) t;
$$;

-- Source breakdown: first-touch source per session, grouped by (source, step)
create or replace function get_source_breakdown(p_from timestamptz default null)
returns json language sql security definer as $$
  with first_source as (
    select distinct on (coalesce(user_id::text, session_id))
      coalesce(user_id::text, session_id) as key,
      source
    from public.events
    where p_from is null or created_at >= p_from
    order by coalesce(user_id::text, session_id), created_at
  ),
  counts as (
    select
      fs.source,
      e.step,
      count(distinct coalesce(e.user_id::text, e.session_id)) as cnt
    from public.events e
    join first_source fs on coalesce(e.user_id::text, e.session_id) = fs.key
    where p_from is null or e.created_at >= p_from
    group by fs.source, e.step
  )
  select coalesce(json_object_agg(source, steps), '{}'::json) from (
    select source, json_object_agg(step, cnt) as steps
    from counts
    group by source
  ) t;
$$;

-- Daily/hourly funnel counts per step (for trend chart)
create or replace function get_funnel_by_day(p_days_back int default 30, p_source text default null, p_from timestamptz default null, p_group_by text default 'day')
returns json language sql security definer as $$
  select coalesce(json_agg(row_to_json(t) order by t.day, t.step), '[]'::json) from (
    select
      case
        when p_group_by = 'hour' then to_char(date_trunc('hour', created_at), 'YYYY-MM-DD HH24:MI')
        else to_char(date_trunc('day', created_at), 'YYYY-MM-DD')
      end as day,
      step,
      count(distinct coalesce(user_id::text, session_id)) as cnt
    from public.events
    where (
      case when p_from is not null
        then created_at >= p_from
        else created_at >= now() - (p_days_back || ' days')::interval
      end
    )
    and (p_source is null or source = p_source)
    group by 1, step
  ) t;
$$;

-- Time-to-convert stats: first event → buy_click per converting session
create or replace function get_funnel_time_stats(p_source text default null, p_from timestamptz default null)
returns json language sql security definer as $$
  with converter_times as (
    select
      coalesce(user_id::text, session_id) as key,
      min(created_at) as first_event,
      max(case when step = 'buy_click' then created_at end) as buy_time
    from public.events
    where (p_source is null or source = p_source)
      and (p_from is null or created_at >= p_from)
    group by coalesce(user_id::text, session_id)
    having max(case when step = 'buy_click' then created_at end) is not null
       and min(created_at) < max(case when step = 'buy_click' then created_at end)
  ),
  durations as (
    select extract(epoch from (buy_time - first_event)) / 60.0 as minutes
    from converter_times
  )
  select case when count(*) = 0 then null else json_build_object(
    'avg_minutes',    round(avg(minutes)::numeric, 1),
    'median_minutes', round(percentile_cont(0.5) within group (order by minutes)::numeric, 1),
    'min_minutes',    round(min(minutes)::numeric, 1),
    'max_minutes',    round(max(minutes)::numeric, 1),
    'total_converters', count(*)
  ) end
  from durations;
$$;
