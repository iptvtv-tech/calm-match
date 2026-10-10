# Calm Match

Calm, predictable learning games designed with neurodivergent children in mind: Match, Sort, Patterns, Count, Pairs and Feelings, themed with trains & vehicles, animals, farm, sea creatures, music, space, dinosaurs, colours or the family's own photos. Games work in English or Irish (Gaeilge). Includes a visual timer, a First/Then board and a visual schedule (up to 8 steps). A rule-based engine adjusts difficulty, opens new skills as earlier ones are learned, and explains every decision to parents.

Plain HTML, CSS and JavaScript. No build step, no framework, no tracking.

## What's in the folder

```
site/                  ← deploy this folder (Cloudflare Pages "build output directory")
  index.html           home page for parents
  play.html            the games and the Grown-ups area
  account.html         optional parent account (Supabase)
  privacy.html cookies.html terms.html accessibility.html support.html 404.html
  css/                 base.css (shared), app.css (games), home.css
  js/config.js         ← YOUR SETTINGS: name, email, Supabase keys, donate link
  js/common.js         cookie notice, settings fill-in, offline support
  js/engine.js         themes, feelings, skill map, knowledge tracing, session planner
  js/i18n.js           child-facing words in English and Irish; First/Then activities
  js/photos.js         photo mode (parents' own photos, kept on the device; optional photo pack)
  js/tools.js          visual timer and First/Then board
  js/store.js          on-device storage of children's profiles
  js/cloud.js          optional Supabase sign-in and sync
  js/app.js            the games and Grown-ups area
  js/account.js        account page
  sw.js                offline support (bump VERSION on each deploy)
  _headers             security headers for Cloudflare Pages
  manifest.webmanifest, icons/, robots.txt
  photos/README.txt    optional built-in photo pack and licensing rules
  fonts/README.txt     optional self-hosted fonts
  vendor/supabase.js    the Supabase sign-in library (self-hosted; not in the zips, keep your copy)
supabase/schema.sql    database tables, privacy rules and delete-account function
supabase/02-account-deletion-email.sql   confirmation email when a parent deletes their account
supabase/03-inactive-account-cleanup.sql monthly job: warn after 23 months unused, delete after 24
supabase/email-templates/                sign-up, sign-in, reset and change-email templates
```

## Run it on your computer

From the `site` folder: `python3 -m http.server 8000`, then open http://localhost:8000/play.html.
(Opening the files directly with file:// works for the games, but not offline mode or accounts.)

## Deploy to Cloudflare Pages

1. Put this whole folder in a GitHub repository.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → choose the repo.
3. Framework preset **None**, build command **empty**, build output directory **`site`**.
4. Deploy. Every push to the main branch redeploys automatically.

When you change files, bump `VERSION` at the top of `site/sw.js` so devices that saved the site for offline use pick up the change.

## Settings (`site/js/config.js`)

| Setting | What it does |
|---|---|
| `ownerName`, `contactEmail` | Shown in the privacy policy, terms and footer |
| `privacyEmail` | Address for data requests (access, deletion, corrections), shown on the privacy, cookie, terms and account pages |
| `siteUrl` | Your live address, no trailing slash |
| `policyDate` | "Last updated" date on the policy pages |
| `supabaseUrl`, `supabaseAnonKey` | Turn on parent accounts. Leave blank for device-only mode |
| `supabaseRegion` | Shown in the privacy policy. Match your project's region |
| `donateUrl` | Ko-fi / Buy Me a Coffee / Stripe Payment Link. Blank hides the button |
| `photoPacks` | Themes that have a built-in photo pack in `site/photos/`, e.g. `["vehicles"]` |

Everything in config.js is public. Never put the Supabase **service_role** key there.

## Parent accounts (Supabase)

1. Create a project in **West EU (Ireland)**.
2. SQL Editor → run `supabase/schema.sql`.
3. Optional but recommended: run `supabase/02-account-deletion-email.sql` (instructions inside) so parents get an email when they delete their account.
4. Recommended: run `supabase/03-inactive-account-cleanup.sql`, enable the pg_cron extension, then schedule it (instructions inside). The privacy policy promises this 24-month clean-up.
5. Authentication → URL Configuration: set the Site URL to your address and add `https://YOUR-SITE/account.html` to Redirect URLs (for both the pages.dev address and any custom domain).
6. Authentication → Emails: set up custom SMTP before launch (the built-in sender is for testing only).
7. Project Settings → API: copy the Project URL and the anon/publishable key into config.js.

Don't switch on CAPTCHA in Supabase yet: the sign-up form doesn't send a CAPTCHA token, so sign-ups would fail.

### What is stored where

| Data | On the device | In Supabase (only with an account) |
|---|---|---|
| Child nickname | Yes | **Never** |
| Avatar emoji, theme, sensory and game settings | Yes | Yes (`child_settings.avatar`, `.settings`) |
| Skill scores and recent session results | Yes | Only if the parent turns on progress backup (`child_settings.progress`) |
| Parent email and password | No | Supabase Auth (password hashed) |
| Photos added in photo mode | Yes (`calm-match-photos`) | **Never** |
| Age, diagnosis, health information | **Never collected** | **Never collected** |

Row Level Security means each account can only read and change its own rows. `delete_my_account()` deletes the account and, through cascades, every row it owns. The schema was tested against Postgres with a mock of Supabase's auth set-up: cross-account reads and writes are refused, signed-out access is refused, and deletion removes everything.

## How the engine works

- **Skill map:** 16 skills. "Same picture" opens five tracks: Sorting (picture → big and small → group), Patterns (A B → A A B → A B C), Counting (to 3 → 5 → 8), Pairs (2 → 3 → 4 pairs) and Feelings (same face → name the feeling → same feeling, new face).
- **Errorless start (optional):** each skill has a help level: answer highlighted with others greyed out → outline on the answer → no help. Two right answers drop one level; two misses bring the outline back. Helped answers don't update the knowledge estimate and are reported separately.
- **Knowledge tracing:** each first attempt updates a Bayesian Knowledge Tracing estimate (prior 0.15, learn 0.2, slip 0.1, guess = 1 / number of choices). A skill opens at 60% and counts as learned at 90%.
- **Inside a game:** 3 right first time in a row adds a choice. 2 misses on one turn shows a dashed outline on the right answer and removes a choice. In Pairs, good boards shorten the starting peek.
- **Between sessions:** a game where fewer than half the turns were right first time is flagged. Next time the engine practises the skill before it.
- **Session plan:** start with the strongest game, then flagged or new games, and finish on something familiar. The plan is fixed once a session starts. Parents can choose "Same order every time" instead.

Content (themes, feelings, games, skills, difficulty ladders) is in `js/engine.js`. To add a theme, add an entry to `CM.THEMES` with 8 `[emoji, English name, Irish name]` items. Child-facing words are in `js/i18n.js`.

## Irish (Gaeilge)

All child-facing game text, picture names, feelings and the First/Then board are translated. The grown-ups area and the site pages stay in English. **Have a fluent Irish speaker check `js/i18n.js` and the Irish names in `js/engine.js` before launch.** Browsers rarely include an Irish voice, so read-aloud stays silent in Irish unless the device has one.

## History export

Grown-ups → History → *Download spreadsheet (CSV)* gives one row per game played (date, game, skill, turns, helped turns, right first time, hints, breaks, minutes, theme, language). It opens in Excel, Google Sheets or Numbers. It includes the child's nickname, so check before sending it on.

## Keeping old policy versions

Before you change the privacy policy, children's privacy page, cookie policy or terms, run:

```
python3 tools/archive-policies.py
```

It saves the current versions in `site/policies/` (dated with `policyDate` from config.js) and rebuilds the "Previous versions" page, which the policy pages link to. Then edit the policy, update `policyDate`, bump `VERSION` in `site/sw.js` and deploy. Running it twice on the same date is safe.

## Adding content

- **Themes:** add an entry to `CM.THEMES` in `js/engine.js` with 8 `[emoji, English, Irish]` items. Give creature themes `family: "creatures"` so the Sort game never asks children to separate, say, farm animals from animals.
- **Feelings:** `CM.FEELINGS` in `js/engine.js`. Ones marked `extra: true` only appear when "More feelings" is switched on.
- **Activities** for the First/Then board and visual schedule: `CM.ACTIVITIES` in `js/i18n.js`. Always add new ones at the end; saved boards refer to them by position.
- New Irish words (Farm, Sea creatures, Music, the four extra feelings and the new activities) should be checked by a fluent speaker.
