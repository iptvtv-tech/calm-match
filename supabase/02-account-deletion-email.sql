-- Calm Match: send a confirmation email when a parent deletes their account.
-- Run this once in Supabase → SQL Editor, AFTER schema.sql. Safe to run again.
--
-- Before running, do steps A and B (see README.txt next to this file):
--   A. Database → Extensions → enable "pg_net" (lets the database send web requests).
--   B. Store your Brevo API key in the Vault by running, on its own (replace the key):
--        select vault.create_secret('xkeysib-YOUR-BREVO-API-KEY', 'brevo_api_key', 'Brevo key for Calm Match account emails');
--      Never paste the key anywhere else, and never put it in the website files.
--
-- How it works: when delete_my_account() runs, it queues one email through Brevo's API,
-- then deletes the account. The email is only actually sent if the deletion succeeds.
-- If the key or pg_net is missing, or Brevo is down, the account is still deleted;
-- the email is simply skipped.

create extension if not exists pg_net with schema extensions;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  addr text;
  api_key text;
  when_text text := to_char(now() at time zone 'Europe/Dublin', 'FMDD FMMonth YYYY "at" HH24:MI');
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  select email into addr from auth.users where id = uid;

  -- Confirmation email (best effort: never blocks the deletion)
  begin
    select decrypted_secret into api_key from vault.decrypted_secrets where name = 'brevo_api_key' limit 1;
    if addr is not null and api_key is not null then
      perform net.http_post(
        url := 'https://api.brevo.com/v3/smtp/email',
        headers := jsonb_build_object('api-key', api_key, 'content-type', 'application/json', 'accept', 'application/json'),
        body := jsonb_build_object(
          'sender', jsonb_build_object('name', 'Calm Match', 'email', 'hello@calmmatch.com'),
          'replyTo', jsonb_build_object('email', 'privacy@calmmatch.com'),
          'to', jsonb_build_array(jsonb_build_object('email', addr)),
          'subject', 'Your Calm Match account has been deleted',
          'textContent',
            'Your Calm Match parent account has been deleted (' || when_text || ').' || chr(10) || chr(10) ||
            'We have deleted your sign-in details, your account settings, and the settings and any progress backup for each child.' || chr(10) || chr(10) ||
            'Games, nicknames, progress and photos saved on your devices were never sent to us, so they are still on those devices. You can remove them in the Grown-ups area: Children, then Delete everything on this device.' || chr(10) || chr(10) ||
            'If you did not delete your account, please reply to this email or write to privacy@calmmatch.com straight away.' || chr(10) || chr(10) ||
            'Thank you for using Calm Match.' || chr(10) || 'https://calmmatch.com',
          'htmlContent',
            $html$<div style="margin:0;padding:24px 12px;background:#eef3f1;font-family:Verdana,Arial,sans-serif;color:#1f2d2b">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #cfdcd8;border-radius:16px;padding:28px 24px">
    <p style="margin:0 0 18px;font-size:18px;font-weight:bold;color:#3f7c74">&#9679; Calm Match</p>
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3">Your account has been deleted</h1>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.55">Your Calm Match parent account was deleted on $html$ || when_text || $html$.</p>
    <p style="margin:0 0 6px;font-size:16px;line-height:1.55"><b>What we deleted</b></p>
    <ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.55">
      <li>Your sign-in details (email address and password)</li>
      <li>Your account settings</li>
      <li>Each child's avatar, settings and any progress backup</li>
    </ul>
    <p style="margin:0 0 6px;font-size:16px;line-height:1.55"><b>What is still on your devices</b></p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.55">Games, nicknames, progress and photos saved on your phone, tablet or computer were never sent to us, so they are still there. To remove them, open the Grown-ups area, then <i>Children</i>, then <i>Delete everything on this device</i>.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.55;background:#f6ead2;border-radius:10px;padding:10px 12px"><b>Didn't do this?</b> Reply to this email or write to privacy@calmmatch.com straight away.</p>
    <p style="margin:0;font-size:15px;line-height:1.55">Thank you for using Calm Match. You're always welcome back, with or without an account.</p>
  </div>
  <p style="max-width:520px;margin:14px auto 0;font-size:12px;color:#566864;text-align:center">Calm Match &middot; <a href="https://calmmatch.com" style="color:#566864">calmmatch.com</a><br>This is a one-off service message. We won't email you again.</p>
</div>$html$
        )
      );
    end if;
  exception when others then
    raise warning 'Calm Match: deletion email not sent: %', sqlerrm;
  end;

  -- Deleting the user also deletes their sessions, account_settings and child_settings rows.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
