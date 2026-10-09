Calm Match email templates for Supabase
========================================
Supabase → Authentication → Emails → Templates. For each template, paste the subject below,
then paste the whole contents of the matching .html file into the message body (Source / HTML).

Template in Supabase      Subject line                          File
------------------------  ------------------------------------  ----------------------
Confirm signup            Confirm your email for Calm Match     1-confirm-signup.html
Magic Link                Your Calm Match sign-in link          2-magic-link.html
Reset Password            Reset your Calm Match password        3-reset-password.html
Change Email Address      Confirm your new Calm Match email     4-change-email.html

Leave "Invite user" and "Reauthentication" as they are: the site doesn't use them.
The {{ .ConfirmationURL }}, {{ .Email }} and {{ .NewEmail }} parts are filled in by Supabase. Don't change them.
Send yourself a test of each one (sign up, magic link, reset, change email) and check it on your phone.

Account deletion email
----------------------
Supabase has no built-in "account deleted" email, so the database sends it through Brevo.
Set it up once with supabase/02-account-deletion-email.sql (instructions at the top of that file):
  A. Supabase → Database → Extensions → enable pg_net
  B. Brevo → SMTP & API → API Keys → Generate a new API key (starts xkeysib-). This is different from the SMTP key.
     In Supabase → SQL Editor run, on its own:
       select vault.create_secret('xkeysib-YOUR-KEY', 'brevo_api_key', 'Brevo key for Calm Match account emails');
  C. Run the whole of 02-account-deletion-email.sql.
To check it: delete a test account, then look in Brevo → Transactional → Logs.
