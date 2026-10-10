# Class sync with teacher accounts: plan (not built)

Status: prepared, not switched on. Classroom mode on one shared tablet and the backup file already
cover small classes without any of the work below. Build this only if schools ask for it.

## What it would do
- A teacher signs in (Supabase Auth, with two-factor required) and creates a class.
- Each pupil is a short code (for example "Fox 3"), never a name. Nicknames stay on each tablet.
- Tablets in the class sync progress to the class, so the teacher sees one class overview.

## Why it isn't on yet
For pupils' data held for a school, the school is the data controller and Calm Match is its processor.
That needs, before any school uses it:
1. A data processing agreement (GDPR Article 28) that each school signs, with a list of sub-processors
   (Supabase, Cloudflare, Brevo).
2. An update to the DPIA in the data protection pack: new data subjects (pupils via schools), new
   access (teachers), retention when a class ends, and the inference risk for special classes.
3. Updated privacy notice for schools, and a school-facing page for parents.
4. A legal review by the solicitor (checklist item law2).

## Technical outline (when needed)
- Tables: `classes (id, owner_id, name, created_at)`, `class_members (class_id, pupil_code, progress jsonb, updated_at)`,
  `class_teachers (class_id, user_id, role)`. Row level security: teachers see only their classes.
- Size limits like `child_settings` (progress up to 60 KB per pupil) and a cap of 12 pupils per class.
- Retention: pg_cron job deletes classes 30 days after the teacher closes them, and inactive classes after 12 months
  with a warning email (same pattern as `supabase/03-inactive-account-cleanup.sql`).
- The tablet joins a class with a one-time join code shown on the teacher's screen; no pupil accounts.
- Nothing in the device library (stories, photos, recordings) syncs. Only skills and session results.
