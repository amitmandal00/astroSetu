-- Harden AI Astrology tables by enabling RLS and denying direct access
-- Date: 2026-02-12
-- Purpose: Prevent anon/public PostgREST queries from reading or writing sensitive data.

-- Step 1: enable row-level security on each table (no-op if not yet created)
alter table if exists public.ai_astrology_orders enable row level security;
alter table if exists public.ai_astrology_reports enable row level security;
alter table if exists public.ai_astrology_subscriptions enable row level security;
alter table if exists public.ai_astrology_runtime_flags enable row level security;
alter table if exists public.ai_input_sessions enable row level security;

-- Step 2: drop stale deny policies and recreate them to cover all commands
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ai_astrology_orders'
  ) then
    drop policy if exists "No direct access" on public.ai_astrology_orders;
    create policy "No direct access" on public.ai_astrology_orders
      for all
      using (false)
      with check (false);
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ai_astrology_reports'
  ) then
    drop policy if exists "No direct access" on public.ai_astrology_reports;
    create policy "No direct access" on public.ai_astrology_reports
      for all
      using (false)
      with check (false);
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ai_astrology_subscriptions'
  ) then
    drop policy if exists "No direct access" on public.ai_astrology_subscriptions;
    create policy "No direct access" on public.ai_astrology_subscriptions
      for all
      using (false)
      with check (false);
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ai_astrology_runtime_flags'
  ) then
    drop policy if exists "No direct access" on public.ai_astrology_runtime_flags;
    create policy "No direct access" on public.ai_astrology_runtime_flags
      for all
      using (false)
      with check (false);
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ai_input_sessions'
  ) then
    drop policy if exists "No direct access" on public.ai_input_sessions;
    create policy "No direct access" on public.ai_input_sessions
      for all
      using (false)
      with check (false);
  end if;
end
$$ language plpgsql;

