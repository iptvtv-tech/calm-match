-- Calm Match: Supabase schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- Data minimisation by design:
--   * No table has a column for a child's name, age, date of birth, diagnosis or notes.
--   * child_settings holds an avatar emoji, game/sensory settings, and progress ONLY if the parent opts in.
--   * Every row belongs to one parent account and Row Level Security means nobody else can read it.
--   * Deleting the account deletes every row (on delete cascade).

-- 1. Account-level settings (one row per parent)
create table if not exists public.account_settings (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  sync_progress boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- 2. Per-child settings (no names)
create table if not exists public.child_settings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  avatar     text not null default '🙂' check (char_length(avatar) <= 16),
  settings   jsonb not null default '{}'::jsonb check (octet_length(settings::text) <= 4000),
  progress   jsonb check (progress is null or octet_length(progress::text) <= 60000),
  updated_at timestamptz not null default now()
);
create index if not exists child_settings_user_id_idx on public.child_settings (user_id);

-- Stop abuse: at most 12 children per account.
create or replace function public.limit_children()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.child_settings where user_id = new.user_id) >= 12 then
    raise exception 'Too many children on this account (maximum 12).';
  end if;
  return new;
end;
$$;
drop trigger if exists limit_children on public.child_settings;
create trigger limit_children before insert on public.child_settings
  for each row execute function public.limit_children();

-- 3. Row Level Security: each parent can only see and change their own rows.
alter table public.account_settings enable row level security;
alter table public.child_settings  enable row level security;

drop policy if exists "own account settings: select" on public.account_settings;
drop policy if exists "own account settings: insert" on public.account_settings;
drop policy if exists "own account settings: update" on public.account_settings;
drop policy if exists "own account settings: delete" on public.account_settings;
create policy "own account settings: select" on public.account_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "own account settings: insert" on public.account_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own account settings: update" on public.account_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own account settings: delete" on public.account_settings for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own children: select" on public.child_settings;
drop policy if exists "own children: insert" on public.child_settings;
drop policy if exists "own children: update" on public.child_settings;
drop policy if exists "own children: delete" on public.child_settings;
create policy "own children: select" on public.child_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "own children: insert" on public.child_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own children: update" on public.child_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own children: delete" on public.child_settings for delete to authenticated using ((select auth.uid()) = user_id);

-- Signed-out visitors get no access at all.
revoke all on public.account_settings from anon;
revoke all on public.child_settings  from anon;
grant select, insert, update, delete on public.account_settings to authenticated;
grant select, insert, update, delete on public.child_settings  to authenticated;

-- 4. "Delete my account" (right to erasure). Runs with elevated rights but only ever deletes the caller.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();   -- cascades to account_settings and child_settings
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 5. Optional housekeeping (run by hand, or schedule with pg_cron):
-- delete accounts with no sign-in for 24 months, as promised in the privacy policy.
-- Email people a warning a few weeks before you run it.
--
--   delete from auth.users
--   where coalesce(last_sign_in_at, created_at) < now() - interval '24 months';
