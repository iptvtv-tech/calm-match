"""Pictures for the Talk cards, visual schedules and schools pages (site/img/), taken from the real app,
so the pages show exactly what a child or grown-up sees. Run again after changing how schedules, talk cards
or "Who is playing?" look:  python3 tools/page-pictures.py
Needs Playwright with Chromium, and Pillow. The children's nicknames are made up."""
import subprocess, time, sys, os, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
site = os.path.join(ROOT, "site")
dest = os.path.join(site, "img")
out = tempfile.mkdtemp()
os.makedirs(dest, exist_ok=True)
PORT = 8766
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "-d", site], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
BASE = "http://localhost:%d/" % PORT

KIDS = [["Ava", "🦊"], ["Cian", "🚀"], ["Ella", "🌻"], ["Oisín", "🐢"], ["Sam", "🦖"], ["Zara", "🐬"]]

SETUP = """(kids) => {
  const db = CM.store.db();
  db.app.setupDone = true; db.app.gate = "sum"; localStorage.setItem("cm-notice", JSON.stringify({ v: 1, at: "2026-11-22" }));
  const first = Object.keys(db.profiles)[0];
  db.profiles[first].name = kids[0][0]; db.profiles[first].avatar = kids[0][1];
  kids.slice(1).forEach(k => CM.store.add(k[0], k[1]));
  db.active = first;
  CM.store.persist();
}"""

errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()

        # 1. Visual schedule, child view, third step is "Now"
        ctx = b.new_context(viewport={"width": 1000, "height": 600}, device_scale_factor=2, service_workers="block")
        pg = ctx.new_page(); pg.on("console", lambda m: errs.append(("sched", m.text)) if m.type == "error" else None)
        pg.goto(BASE + "play.html"); pg.wait_for_timeout(800)
        pg.evaluate(SETUP, KIDS[:1]); pg.reload(); pg.wait_for_timeout(900)
        pg.evaluate("""() => CM.tools.schedule({ name: "Morning", steps: [
          { r: "s:getup" }, { r: "s:breakfast" }, { r: "s:getdressed", min: 5 }, { r: "s:brushteeth" },
          { r: "s:trainers" }, { r: "s:coat" }, { r: "s:school" } ] })""")
        pg.wait_for_timeout(500)
        pg.click("#scDone"); pg.wait_for_timeout(900); pg.click("#scDone"); pg.wait_for_timeout(1500)
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(out, "schedule.png"), full_page=True)
        ctx.close()

        # 2. Talk cards: six cards from a Medium sheet, English and Irish, colour edges, as they print
        ctx = b.new_context(viewport={"width": 900, "height": 900}, device_scale_factor=2, service_workers="block")
        pg = ctx.new_page(); pg.on("console", lambda m: errs.append(("cards", m.text)) if m.type == "error" else None)
        pg.goto(BASE + "play.html"); pg.wait_for_timeout(800)
        pg.evaluate(SETUP, KIDS[:1]); pg.reload(); pg.wait_for_timeout(900)
        pg.emulate_media(media="print")
        pg.evaluate("""() => {
          const k = CM.lib.kid();
          const o = { size: "medium", edges: "colour", words: "both", starters: true, sentences: true, pages: ["food"], skip: [] };
          const all = CM.cards.list(k, o), by = en => all.find(c => c.en === en);
          const pick = ["I want", "apple", "I don't want", "I need a break", "Help me, please", "It's too loud"].map(by);
          let pa = document.getElementById("printArea");
          if (!pa) { pa = document.createElement("div"); pa.id = "printArea"; document.body.appendChild(pa); }
          pa.innerHTML = CM.cards.sheets(pick, o);
          document.body.classList.add("printing");
        }""")
        pg.wait_for_timeout(1200)
        pg.locator("#printArea .pc-sheet").first.screenshot(path=os.path.join(out, "talk-cards.png"))
        ctx.close()

        # 3. Classroom mode: "Who is playing?"
        ctx = b.new_context(viewport={"width": 1000, "height": 470}, device_scale_factor=2, service_workers="block")
        pg = ctx.new_page(); pg.on("console", lambda m: errs.append(("class", m.text)) if m.type == "error" else None)
        pg.goto(BASE + "play.html"); pg.wait_for_timeout(800)
        pg.evaluate(SETUP, KIDS); pg.evaluate("() => CM.classroom.set(true)")
        pg.reload(); pg.wait_for_timeout(1200)
        pg.screenshot(path=os.path.join(out, "classroom.png"))
        ctx.close()
        b.close()
finally:
    srv.terminate()
if errs: sys.exit("errors in the page: %r" % errs)

# Trim the empty sides, then save small WebP files: [name, crop box in the 2x screenshot, width on the page x2]
for src, name, box in [("schedule", "visual-schedule-sample", (160, 0, 1840, 1580)),
                       ("talk-cards", "talk-cards-sample", None),
                       ("classroom", "classroom-who-is-playing", (160, 0, 1840, 920))]:
    im = Image.open(os.path.join(out, src + ".png")).convert("RGB")
    if box: im = im.crop(box)
    if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    im.save(os.path.join(dest, name + ".webp"), "WEBP", quality=82, method=6)
    print("img/%s.webp %dx%d %d KB" % (name, im.width, im.height, os.path.getsize(os.path.join(dest, name + ".webp")) // 1024))
