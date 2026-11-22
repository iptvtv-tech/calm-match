#!/usr/bin/env python3
"""Free printables for calmmatch.com/talk-cards, made by the app's own Talk cards code (site/js/cards.js), so the
PDFs look exactly like what a grown-up prints from Grown-ups > Make > Talk cards.

    python3 tools/printables.py

Writes, for English, Irish and both languages:
    site/printables/i-want-card-<english|gaeilge|english-and-irish>.pdf   (A4, three pages)
        1. a full-page "I want" card
        2. a sheet of three "I want ___" sentence strips (Large)
        3. six Large picture cards that fit the strips' box: water, apple, biscuit, ball, bubbles, hug
and the picture on the Talk cards page:
    site/img/i-want-strip-sample.webp   (a strip with the apple card on its box)

Run it again after changing the cards' pictures, words (including the Irish, once checked) or print styles.
Needs Playwright with Chromium, and Pillow. Nothing is sent anywhere: the site is served from site/ on a local port.
"""
import os, subprocess, sys, tempfile, time
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
OUT = os.path.join(SITE, "printables")
PORT = 8771
LANGS = [("en", "english", "I want cards (English)"), ("ga", "gaeilge", "Cártaí Ba mhaith liom (Gaeilge)"),
         ("both", "english-and-irish", "I want cards (English and Irish)")]
PICTURES = ["water", "apple", "biscuit", "ball", "bubbles", "hug"]   # each reads well after "I want" and "Ba mhaith liom"

BUILD = """([words, pictures]) => {
  const k = CM.lib.kid();
  const base = { edges: "colour", words, starters: true, sentences: false, strips: true, pages: ["food", "drink", "play", "calm"], skip: [] };
  const page = Object.assign({}, base, { size: "page" }), large = Object.assign({}, base, { size: "large" });
  const all = CM.cards.list(k, page);
  const want = all.filter(c => c.en === "I want");
  const pics = pictures.map(en => all.find(c => c.en === en));
  if (want.length !== 1 || pics.some(c => !c)) throw new Error("card missing: " + JSON.stringify(pictures));
  window.__printed = 0;
  CM.ui.print(CM.cards.sheets(want, page) + CM.cards.stripSheet(large, true) + CM.cards.sheets(pics, large, " pc-newpage"));
}"""

srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "-d", SITE], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errs = []
try:
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 1000, "height": 1000}, device_scale_factor=2, service_workers="block")
        pg = ctx.new_page(); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.add_init_script("window.print = function () { window.__printed = 1; };")
        pg.goto("http://localhost:%d/play.html" % PORT); pg.wait_for_timeout(800)
        pg.evaluate("() => { const db = CM.store.db(); db.app.setupDone = true; CM.store.persist(); localStorage.setItem('cm-notice', '1'); }")
        pg.reload(); pg.wait_for_timeout(800)
        for words, slug, title in LANGS:
            pg.emulate_media(media="screen")
            pg.evaluate(BUILD, [words, PICTURES])
            pg.wait_for_function("window.__printed === 1", timeout=10000)   # CM.ui.print waits until every picture has loaded
            pg.evaluate("t => { document.title = t + ' · Calm Match'; }", title)
            pg.emulate_media(media="print")
            path = os.path.join(OUT, "i-want-card-%s.pdf" % slug)
            pg.pdf(path=path, format="A4", print_background=True, margin={"top": "10mm", "bottom": "10mm", "left": "10mm", "right": "10mm"})
            print("printables/%s %d KB" % (os.path.basename(path), os.path.getsize(path) // 1024))
            pg.evaluate("document.body.classList.remove('printing')")

        # The picture for the Talk cards page: an English-and-Irish strip with the apple card laid on its box.
        pg.emulate_media(media="print")
        pg.evaluate("""() => {
          const k = CM.lib.kid(), o = { edges: "colour", words: "both", starters: true, sentences: false, strips: true, pages: ["food"], skip: [], size: "large" };
          const apple = CM.cards.list(k, o).find(c => c.en === "apple");
          const a = document.getElementById("printArea");
          document.body.classList.add("printing");   // the print area only shows while printing, so measure after this
          a.innerHTML = '<div id="sample" style="position:relative;display:inline-block;padding:6mm;background:#fff">' + CM.cards.stripSheet(o, false) + "</div>";
          a.querySelectorAll(".pc-scell").forEach((c, i) => { if (i) c.remove(); });
          const sheet = a.querySelector(".pc-sheet"); sheet.style.border = "0";
          a.querySelector(".pc-scell").style.border = "0";
          const slot = a.querySelector(".pc-slot").getBoundingClientRect(), box = a.querySelector("#sample").getBoundingClientRect();
          const card = document.createElement("div");
          card.innerHTML = CM.cards.sheets([apple], o);
          const cell = card.querySelector(".pc-cell"); cell.style.border = "0";
          const c = card.querySelector(".pc"); c.style.position = "absolute";
          c.style.left = (slot.left - box.left - 6) + "px"; c.style.top = (slot.top - box.top - 12) + "px";
          c.style.transform = "rotate(2deg)"; c.style.filter = "drop-shadow(0 3px 4px rgb(0 0 0 / .18))";
          c.querySelector(".pc-sheet").style.border = "0";
          a.querySelector("#sample").appendChild(c);
        }""")
        pg.wait_for_timeout(1200)
        tmp = os.path.join(tempfile.mkdtemp(), "strip.png")
        pg.locator("#sample").screenshot(path=tmp)
        im = Image.open(tmp).convert("RGB")
        if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
        dest = os.path.join(SITE, "img", "i-want-strip-sample.webp")
        im.save(dest, "WEBP", quality=84, method=6)
        print("img/i-want-strip-sample.webp %dx%d %d KB" % (im.width, im.height, os.path.getsize(dest) // 1024))
        ctx.close(); b.close()
finally:
    srv.terminate()
if errs: sys.exit("errors in the page: %r" % errs)
