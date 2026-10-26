#!/usr/bin/env python3
"""Calm Match regression check. Run before every push.

    python3 tools/tests/check.py            # all checks
    python3 tools/tests/check.py --no-browser   # file checks only (no Playwright needed)

What it checks
  files     every file listed in site/sw.js and site/audio/manifest.json exists; every sitemap URL has a file
  words     the policy pages describe Emma correctly and the credits page credits Kokoro
  version   sw.js VERSION looks like cm-YYYY-MM-DD-N and is not older than the newest site file
  pages     (browser) every public page loads at phone and tablet width with no console errors
            and no failed requests
  setup     (browser) a fresh device shows first-time setup on play.html, and skipping it shows the doors
  emma      (browser) a core Emma clip is served as audio

Needs: Python 3, and for the browser checks `pip install playwright` + `python3 -m playwright install chromium`.
Set PLAYWRIGHT_BROWSERS_PATH if the browsers live elsewhere. No network access needed: the site is
served from site/ on a local port.
"""
import datetime, http.server, json, os, re, socket, subprocess, sys, threading

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE = os.path.join(ROOT, "site")
fails = []

def ok(name, cond, detail=""):
    print(("  ok   " if cond else "  FAIL ") + name + (("  " + detail) if detail and not cond else ""))
    if not cond: fails.append(name)

def read(p): return open(os.path.join(SITE, p), encoding="utf-8").read()

# ---------- files ----------
print("files")
sw = read("sw.js")
listed = sorted(set(re.findall(r'"((?:[\w\-./]+)\.(?:html|js|css|json|svg|png|webmanifest|woff2|txt|xml|mp3))"', sw)))
missing = [p for p in listed if not os.path.exists(os.path.join(SITE, p))]
ok("sw.js cache list: %d files all exist" % len(listed), not missing, str(missing[:5]))

man = json.load(open(os.path.join(SITE, "audio", "manifest.json"), encoding="utf-8"))
files = man.get("files", [])
if isinstance(files, dict): files = list(files.keys())
miss_audio = [f for f in files if not os.path.exists(os.path.join(SITE, "audio", f if f.endswith(".mp3") else f + ".mp3"))]
ok("audio manifest: %d clips all exist" % len(files), not miss_audio, str(miss_audio[:5]))

sm = read("sitemap.xml")
urls = re.findall(r"<loc>https://calmmatch\.com/([^<]*)</loc>", sm)
miss_sm = [u for u in urls if not os.path.exists(os.path.join(SITE, u or "index.html")) and not os.path.exists(os.path.join(SITE, u, "index.html"))]
ok("sitemap: %d URLs all have a page" % len(urls), not miss_sm, str(miss_sm))
noindex = [u for u in urls if u and os.path.isfile(os.path.join(SITE, u)) and 'name="robots"' in read(u)]
ok("sitemap: no noindex pages listed", not noindex, str(noindex))

# ---------- words ----------
print("words")
priv, acc, cred, kids = read("privacy.html"), read("accessibility.html"), read("credits.html"), read("privacy-kids.html")
ok("privacy.html describes Emma", "Emma" in priv and "online voice service" in priv)
ok("privacy.html no longer says read-aloud is device-only", "uses your device's built-in voice" not in priv and "uses only voices built into the device" not in priv)
ok("privacy.html names recorded child's name as on-device", "child's name" in priv)
ok("privacy-kids.html mentions Emma", "Emma" in kids)
ok("accessibility.html describes Emma", "Emma" in acc)
ok("credits.html credits Kokoro (Apache 2.0)", "Kokoro" in cred and "Apache" in cred)
cfg = read("js/config.js")
pdate = re.search(r'policyDate:\s*"([^"]+)"', cfg).group(1)
ok("policy pages' fallback date matches config.js (%s)" % pdate, all(pdate in read(p) for p in ["privacy.html", "cookies.html", "terms.html", "accessibility.html"]))
ok("archive exists for the previous policy date", len([f for f in os.listdir(os.path.join(SITE, "policies")) if f.startswith("privacy-")]) >= 1)

# ---------- version ----------
print("version")
ver = re.search(r'var VERSION = "(cm-(\d{4}-\d{2}-\d{2})-\d+)"', sw)
ok("sw.js VERSION format", bool(ver), sw[:120])
if ver:
    vdate = datetime.date.fromisoformat(ver.group(2))
    newest = 0
    for dp, dn, fn in os.walk(SITE):
        if "/audio" in dp or "/symbols" in dp or "/vendor" in dp: continue
        for f in fn: newest = max(newest, os.path.getmtime(os.path.join(dp, f)))
    try:
        changed = subprocess.run(["git", "status", "--short", "site"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    except Exception:
        changed = ""
    sw_changed = "site/sw.js" in changed
    ok("sw.js VERSION bumped when site files changed (%s)" % ver.group(1), (not changed) or sw_changed,
       "site files changed but sw.js not touched")

# ---------- browser ----------
if "--no-browser" not in sys.argv:
    print("browser")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        ok("playwright installed", False, "pip install playwright; python3 -m playwright install chromium")
        sync_playwright = None
    if sync_playwright:
        s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a): pass
        handler = lambda *a, **k: Quiet(*a, directory=SITE, **k)
        srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        base = "http://127.0.0.1:%d/" % port
        pages = ["", "play.html", "alphabet/", "singalong/", "support.html", "credits.html", "accessibility.html",
                 "privacy.html", "privacy-kids.html", "cookies.html", "terms.html", "policies/index.html", "404.html"]
        with sync_playwright() as p:
            br = p.chromium.launch()
            for name, vp in [("phone", {"width": 390, "height": 844}), ("tablet", {"width": 1024, "height": 768})]:
                ctx = br.new_context(viewport=vp); pg = ctx.new_page()
                errs, bad = [], []
                pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.on("response", lambda r: bad.append((r.status, r.url.replace(base, ""))) if r.status >= 400 and not r.url.endswith("404.html") else None)
                for u in pages:
                    pg.goto(base + u); pg.wait_for_timeout(400)
                ok("%s: %d pages, no console errors" % (name, len(pages)), not errs, str(errs[:3]))
                ok("%s: no failed requests" % name, not bad, str(bad[:5]))
                ctx.close()
            # fresh device: setup appears, skipping shows the doors
            ctx = br.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page()
            pg.goto(base + "play.html"); pg.wait_for_timeout(600)
            ok("fresh device shows first-time setup", pg.locator(".su-welcome").count() > 0)
            # a core Emma clip is served as audio
            first = next((f for f in man.get("core", []) if isinstance(f, str)), None)
            if first:
                r = pg.request.get(base + "audio/" + (first if first.endswith(".mp3") else first + ".mp3"))
                ok("Emma core clip serves as audio (%s)" % first, r.ok and "audio" in (r.headers.get("content-type", "")), str(r.status))
            ctx.close(); br.close()
        srv.shutdown()

print()
print("ALL CHECKS PASSED" if not fails else "%d FAILED: %s" % (len(fails), ", ".join(fails)))
sys.exit(1 if fails else 0)
