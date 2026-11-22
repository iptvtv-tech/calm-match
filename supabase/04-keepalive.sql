-- Calm Match: stop Supabase pausing the free project when parent accounts are quiet for a week.
-- Supabase pauses Free plan projects with too little database activity over 7 days. While paused, nobody can
-- sign in, sync or delete their account (which the privacy policy promises they can do at any time).
--
-- The site's Cloudflare Worker (worker/keepalive.js) calls public.keepalive() every 3 days. It writes one
-- timestamp to a one-row table. No visitor data, nothing about any parent or child, and nothing on the website changes.
--
-- Run once in Supabase → SQL Editor. To check it is working:  select * from public.keepalive;
-- ("at" should never be more than 3 days old.)

create table if not exists public.keepalive (
  id int primary key default 1 check (id = 1),   -- only ever one row
  at timestamptz not null default now()
);
alter table public.keepalive enable row level security;   -- no policies: the website can never read or change it directly
revoke all on public.keepalive from anon, authenticated;
drop policy if exists "no website access" on public.keepalive;
create policy "no website access" on public.keepalive for all to anon, authenticated using (false) with check (false);

-- The only thing the Worker can do: set that one timestamp to now. Takes no input, returns the time it wrote.
create or replace function public.keepalive() returns timestamptz
language sql volatile security definer set search_path = public as $$
  insert into public.keepalive (id, at) values (1, now())
  on conflict (id) do update set at = excluded.at
  returning at;
$$;
revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon;

-- Let the API see the new function straight away.
notify pgrst, 'reload schema';
