#!/usr/bin/env python3
"""Keep old versions of Calm Match's policy pages.

Run this BEFORE you change a policy page:

    python3 tools/archive-policies.py

It copies the current privacy, children's privacy, cookies and terms pages into
site/policies/<page>-<date>.html, dated with policyDate from site/js/config.js, and rebuilds
site/policies/index.html (the "Previous versions" page). Then edit the policy, change policyDate
in config.js, and deploy as usual.

- An archive that already exists for that page and date is left alone, so running it twice is safe.
- Archived copies are frozen: the date, names and emails are written in as they were, and the
  page no longer fills them in from config.js.
- Archived pages carry a banner pointing to the current version and are hidden from search engines.
"""
import datetime, html, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
OUT = os.path.join(ROOT, "policies")
PAGES = [("privacy", "Privacy policy"), ("privacy-kids", "Privacy for children"),
         ("cookies", "Cookie policy"), ("terms", "Terms of use")]


def policy_date():
    cfg = open(os.path.join(ROOT, "js", "config.js"), encoding="utf-8").read()
    m = re.search(r'policyDate:\s*"([^"]+)"', cfg)
    if not m:
        sys.exit("Couldn't find policyDate in site/js/config.js")
    text = m.group(1)
    return text, datetime.datetime.strptime(text, "%d %B %Y").date()


def relink(page):
    """Point relative links and files one folder up, since archives live in site/policies/."""
    def fix(m):
        attr, q, url = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(https?:|mailto:|tel:|data:|#|/|\.\./)", url):
            return m.group(0)
        return f"{attr}={q}../{url}{q}"
    return re.sub(r'\b(href|src)=(["\'])([^"\']*)\2', fix, page)


def freeze(page):
    """Keep the text as it was: stop config.js and the year script from rewriting it."""
    page = re.sub(r'\sdata-cfg="[^"]*"', "", page)
    page = page.replace('<span id="year">', "<span>")
    return page


def archive(slug, label, date_text, date):
    src = os.path.join(ROOT, slug + ".html")
    dest = os.path.join(OUT, f"{slug}-{date.isoformat()}.html")
    if not os.path.exists(src):
        return None
    if os.path.exists(dest):
        print(f"  kept     policies/{os.path.basename(dest)} (already archived)")
        return dest
    page = open(src, encoding="utf-8").read()
    page = freeze(relink(page))
    page = page.replace("<head>", '<head>\n<meta name="robots" content="noindex">', 1)
    page = re.sub(r"<title>(.*?)</title>", lambda m: f"<title>{m.group(1)} (version of {html.escape(date_text)})</title>", page, count=1)
    banner = (f'<div class="msg info" role="note" style="margin:0 0 20px"><b>This is a saved copy</b> of the {html.escape(label.lower())} '
              f'dated {html.escape(date_text)}. It may have changed since. <a href="../{slug}.html">Read the current version</a> · '
              f'<a href="index.html">All previous versions</a></div>')
    page = re.sub(r'(<main[^>]*>(?:\s*<article[^>]*>)?)', lambda m: m.group(1) + "\n" + banner, page, count=1)
    open(dest, "w", encoding="utf-8").write(page)
    print(f"  archived policies/{os.path.basename(dest)}")
    return dest


def build_index():
    rows = {}
    for f in sorted(os.listdir(OUT), reverse=True):
        m = re.match(r"^(privacy-kids|privacy|cookies|terms)-(\d{4}-\d{2}-\d{2})\.html$", f)
        if m:
            rows.setdefault(m.group(1), []).append((m.group(2), f))
    parts = []
    for slug, label in PAGES:
        items = rows.get(slug, [])
        if not items:
            continue
        lis = "".join(
            f'<li><a href="{f}">{datetime.date.fromisoformat(d).strftime("%-d %B %Y")}</a></li>' for d, f in items)
        parts.append(f'<h2>{label}</h2>\n<p><a href="../{slug}.html">Current version</a></p>\n<ul>{lis}</ul>')
    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Previous policy versions · Calm Match</title>
<meta name="description" content="Earlier versions of Calm Match's privacy policy, children's privacy page, cookie policy and terms.">
<meta name="theme-color" content="#356b64">
<link rel="icon" href="../icons/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../css/base.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <a class="brand" href="../index.html"><i></i>Calm Match</a>
  <nav class="site-nav" aria-label="Main"><a href="../index.html">About</a><a href="../support.html">Support</a><a class="cta" href="../play.html">Play</a></nav>
</header>
<main id="main" class="page"><article class="prose">
<h1>Previous policy versions</h1>
<p>When we change a policy, we keep the version it replaced here, dated from when it took effect. The dates on each page show when it was last updated.</p>
{chr(10).join(parts)}
</article></main>
<footer class="site-foot"><nav aria-label="Legal"><a href="../privacy.html">Privacy</a><a href="../cookies.html">Cookies</a><a href="../terms.html">Terms</a></nav></footer>
</body>
</html>
"""
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page)
    print("  rebuilt  policies/index.html")


def main():
    date_text, date = policy_date()
    os.makedirs(OUT, exist_ok=True)
    print(f"Archiving policies dated {date_text}:")
    for slug, label in PAGES:
        archive(slug, label, date_text, date)
    build_index()
    print("Done. Now edit the policy, change policyDate in site/js/config.js, bump VERSION in site/sw.js and deploy.")


if __name__ == "__main__":
    main()
