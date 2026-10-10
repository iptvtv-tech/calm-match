-- Calm Match: delete accounts nobody has used for 24 months, after a warning email.
-- This is what the privacy policy promises. Run once in Supabase → SQL Editor, AFTER 02-account-deletion-email.sql
-- (it uses the same Brevo key in the Vault and the pg_net extension).
--
-- Then turn on the monthly schedule:
--   1. Database → Extensions → enable "pg_cron".
--   2. Run, on its own:
--        select cron.schedule('calm-match-retention', '0 3 1 * *', $$select public.run_retention()$$);
--      (03:00 UTC on the 1st of every month.)
--   To check what it did: select * from cron.job_run_details order by start_time desc limit 5;
--   To run it by hand:     select public.run_retention();
--
-- Rules:
--   * "Last used" = the latest of: sign-in, session refresh, or any settings/progress change.
--   * After 23 months unused: one warning email, saying the account will be deleted in 30 days unless they sign in.
--   * After 24 months unused AND at least 30 days after the warning: the account is deleted (same as "Delete my account").
--   * If an email can't be sent (no key, no address, Brevo down), the account is NOT deleted. No warning, no deletion.
--   * Signing in again cancels the warning.

create table if not exists public.retention_notices (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  warned_at timestamptz not null default now()
);
alter table public.retention_notices enable row level security;   -- no policies: the website can never read or change it
revoke all on public.retention_notices from anon, authenticated;
-- An explicit "nobody" policy: same effect as no policy, but documents the intent and clears the Security Advisor note.
drop policy if exists "no website access" on public.retention_notices;
create policy "no website access" on public.retention_notices for all to anon, authenticated using (false) with check (false);

create or replace function public.account_last_used(uid uuid)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    (select coalesce(last_sign_in_at, created_at) from auth.users where id = uid),
    (select max(updated_at) from auth.sessions where user_id = uid),
    (select max(updated_at) from public.child_settings where user_id = uid),
    (select updated_at from public.account_settings where user_id = uid)
  );
$$;
revoke all on function public.account_last_used(uuid) from public, anon, authenticated;

create or replace function public.run_retention()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  api_key text;
  warned int := 0;
  deleted int := 0;
  deadline text := to_char((now() + interval '30 days') at time zone 'Europe/Dublin', 'FMDD FMMonth YYYY');
begin
  begin
    select decrypted_secret into api_key from vault.decrypted_secrets where name = 'brevo_api_key' limit 1;
  exception when others then api_key := null;
  end;

  -- People who came back: cancel their warning.
  delete from public.retention_notices n
  where public.account_last_used(n.user_id) > n.warned_at;

  -- Warn accounts unused for 23 months.
  for r in
    select u.id, u.email from auth.users u
    where public.account_last_used(u.id) < now() - interval '23 months'
      and not exists (select 1 from public.retention_notices n where n.user_id = u.id)
  loop
    if api_key is null or r.email is null then continue; end if;
    begin
      perform net.http_post(
        url := 'https://api.brevo.com/v3/smtp/email',
        headers := jsonb_build_object('api-key', api_key, 'content-type', 'application/json', 'accept', 'application/json'),
        body := jsonb_build_object(
          'sender', jsonb_build_object('name', 'Calm Match', 'email', 'hello@calmmatch.com'),
          'replyTo', jsonb_build_object('email', 'privacy@calmmatch.com'),
          'to', jsonb_build_array(jsonb_build_object('email', r.email)),
          'subject', 'Your Calm Match account will be deleted on ' || deadline,
          'textContent',
            'Hello,' || chr(10) || chr(10) ||
            'Your Calm Match parent account has not been used for nearly two years. To protect your privacy, we delete accounts that are not being used.' || chr(10) || chr(10) ||
            'If you want to keep it, just sign in at https://calmmatch.com/account.html before ' || deadline || '. Nothing else is needed.' || chr(10) || chr(10) ||
            'If you do nothing, we will delete the account and everything stored with it on or after ' || deadline || '. Games and progress saved on your devices are not affected.' || chr(10) || chr(10) ||
            'Questions: privacy@calmmatch.com' || chr(10) || 'Calm Match - https://calmmatch.com',
          'htmlContent',
            $html$<div style="margin:0;padding:24px 12px;background:#eef3f1;font-family:Verdana,Arial,sans-serif;color:#1f2d2b">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #cfdcd8;border-radius:16px;padding:28px 24px">
    <p style="margin:0 0 18px;font-size:18px;font-weight:bold;color:#3f7c74">&#9679; Calm Match</p>
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3">Do you still want your account?</h1>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.55">Your Calm Match parent account hasn't been used for nearly two years. To protect your privacy, we delete accounts that aren't being used.</p>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.55"><b>To keep it, just sign in before $html$ || deadline || $html$.</b> Nothing else is needed.</p>
    <p style="margin:24px 0"><a href="https://calmmatch.com/account.html" style="display:inline-block;background:#3f7c74;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 24px;border-radius:12px">Sign in to keep my account</a></p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.55">If you do nothing, we'll delete the account and everything stored with it on or after $html$ || deadline || $html$. Games and progress saved on your devices aren't affected.</p>
    <p style="margin:0;font-size:13px;color:#566864">Questions? Reply to this email or write to privacy@calmmatch.com.</p>
  </div>
</div>$html$
        )
      );
      insert into public.retention_notices (user_id) values (r.id) on conflict (user_id) do nothing;
      warned := warned + 1;
    exception when others then
      raise warning 'Calm Match retention: warning email not sent to %: %', r.id, sqlerrm;
    end;
  end loop;

  -- Delete accounts unused for 24 months that were warned at least 30 days ago.
  for r in
    select u.id from auth.users u
    join public.retention_notices n on n.user_id = u.id
    where public.account_last_used(u.id) < now() - interval '24 months'
      and n.warned_at < now() - interval '30 days'
  loop
    delete from auth.users where id = r.id;   -- also deletes their settings, progress and sessions
    deleted := deleted + 1;
  end loop;

  return format('Calm Match retention: warned %s, deleted %s', warned, deleted);
end;
$$;
revoke all on function public.run_retention() from public, anon, authenticated;
