#!/usr/bin/env node
/* Lists every piece of English that Emma needs to record, by running the site's own code.

   The site speaks sentences made from fixed phrases (site/js/i18n.js) with gaps filled in: a picture name,
   a game name, a number, a letter. Recording every filled-in sentence would need thousands of clips, so Emma
   records the fixed parts and the fill-ins separately, and site/js/emma.js joins them at speaking time
   ("Find the" + "dog"). This script lists both, using emma.js's own splitting, then checks that sample
   sentences can all be put together from the list.

   node tools/audio/harvest.js            writes tools/audio/phrases-en.json and prints a summary
   Each entry: { key, text, group, path }. group "core" is saved for offline use straight away (alphabet and
   games); "later" is saved the first time it's played (Talk board, stories, schedules, timers). */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "../..");
const SITE = path.join(ROOT, "site");
const E = require(path.join(SITE, "js/emma.js"));

// Load the site's word lists the way the browser does, with a stand-in window.
global.window = global;
global.CM = window.CM = { esc: (s) => String(s), safeGet: () => null, safeSet: () => true };
global.document = { getElementById: () => null, addEventListener() {}, querySelectorAll: () => [] };
for (const f of ["js/engine.js", "js/i18n.js", "js/symbols.js", "js/games.js", "js/talk.js", "js/stories.js", "js/alphabet.js"])
  eval(fs.readFileSync(path.join(SITE, f), "utf8"));
CM.store = { S: () => ({ lang: "en" }) };

const entries = new Map();           // key -> entry
function add(text, group, opts) {
  for (const raw of String(text).split(/[.!?:;,…]+|\s[–—-]\s/)) {
    const key = E.norm(raw);
    if (!key || /\{/.test(raw)) continue;
    const prev = entries.get(key);
    if (prev) { if (group === "core") prev.group = "core"; continue; }
    entries.set(key, Object.assign({ key, text: raw.trim(), group }, opts || {}));
  }
}
function addTemplate(tpl, group) {
  // Split at punctuation, then at each {gap}: the parts between gaps are the fixed pieces.
  for (const chunk of String(tpl).split(/[.!?:;,…]+|\s[–—-]\s/))
    for (const part of chunk.split(/\{[a-z]+\}/i)) add(part, group);
}

/* ---------- what the site says ---------- */
const en = CM.STRINGS.en;
for (const k of Object.keys(en)) addTemplate(en[k], "core");

const fill = { name: [], game: [], next: [], n: [], s: [], l: [], x: [], reward: [], skill: [], list: [], does: [], old: [], new: [], m: [] };
// Picture names in the themes, and the theme group names
for (const k of Object.keys(CM.THEMES)) { const th = CM.THEMES[k]; th.items.forEach((it) => { add(it[1], "core"); fill.name.push(it[1]); }); add(th.group.en, "core"); }
// Feelings
CM.FEELINGS.forEach((f) => { add(f.en, "core"); add(f.q.en, "core"); fill.name.push(f.en); });
// Other game words
const GW = CM.GAME_WORDS;
GW.TOGETHER.forEach((p) => p.forEach((x) => { add(x[1], "core"); fill.name.push(x[1]); }));
GW.WHY.forEach((w) => add(w.en, "core"));
GW.WHERE.forEach((w) => { add(w.en, "core"); add(w.sayEn, "core"); });
CM.SEQUENCES.forEach((s) => { add(s.en, "core"); s.steps.forEach((x) => add(x[1], "core")); });
// Game names and what they do
for (const g of Object.keys(CM.GAMES)) { add(CM.GAMES[g].label, "core"); add(CM.GAMES[g].does, "core"); fill.game.push(CM.GAMES[g].label); fill.next.push(CM.GAMES[g].label); }
CM.SKILLS.forEach((s) => { add(s.name, "later"); fill.skill.push(s.name); });
// Numbers: 0-20 with the games, 21-100 later (sticker counts, minutes)
for (let i = 0; i <= 100; i++) { add(String(i), i <= 20 ? "core" : "later", { say: numberWord(i) }); fill.n.push(String(i)); fill.s.push(String(i)); fill.m.push(String(i)); }
// Letters A-Z: the Alphabet book's letter recordings
for (const L of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") { entries.set(L.toLowerCase(), { key: L.toLowerCase(), text: L, group: "core", path: "en/letters/" + L.toLowerCase() + ".mp3", shared: true }); fill.l.push(L); }
// Alphabet words: the Alphabet book's word recordings (also used in the Letters game)
for (const L of Object.keys(CM.alpha.WORDS.en)) CM.alpha.WORDS.en[L].forEach((it) => {
  const key = E.norm(it[1]);
  if (!entries.has(key)) entries.set(key, { key, text: it[1], group: "core", path: "en/words/" + CM.alpha.slug(it[1]) + ".mp3", shared: true });
  else { const e = entries.get(key); e.path = "en/words/" + CM.alpha.slug(it[1]) + ".mp3"; e.shared = true; e.group = "core"; }
  fill.name.push(it[1]);
});
// Talk board symbols, schedule activities, starter stories: saved when first used
for (const id of Object.keys(CM.SYMBOLS)) { add(CM.SYMBOLS[id][0], "later"); fill.x.push(CM.SYMBOLS[id][0]); fill.reward.push(CM.SYMBOLS[id][0]); fill.old.push(CM.SYMBOLS[id][0]); fill.new.push(CM.SYMBOLS[id][0]); }
CM.ACTIVITIES.forEach((a) => { add(a[1], "later"); fill.x.push(a[1]); fill.reward.push(a[1]); fill.old.push(a[1]); fill.new.push(a[1]); });
CM.STORY_TEMPLATES.forEach((st) => { add(st.title, "later"); st.pages.forEach((p) => add(p[1], "later")); });
// Said by the grown-ups' settings when read-aloud or clear speech is switched on (written in site/js/app.js)
["Read aloud is on", "This is how I will sound. Find the dog."].forEach((x) => add(x, "core"));
fill.does = Object.keys(CM.GAMES).map((g) => CM.GAMES[g].does);
fill.list = [Object.keys(CM.GAMES).slice(0, 3).map((g) => CM.GAMES[g].label).join(", then ")];
fill.next.push(en.allDoneLower);
// Letters game praise ("B, bee") and the pairs of Goes together ("socks, shoes") are just names joined by commas.

function numberWord(n) {
  const a = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const t = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return a[n]; if (n === 100) return "one hundred";
  return t[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
}

/* ---------- whole sentence parts ----------
   A filled-in part ("find the" + "train") said from two recordings sounds stitched: a gap, then the last word
   said on its own as if it were a whole sentence. So every filled-in part the games and tools can say gets its
   own recording too ("find the train"), made in one go. They are marked whole: site/js/emma.js plays them when
   it can and falls back to the pieces (always saved for offline use) if one hasn't been saved on the device yet. */
const theme = [...new Set(Object.values(CM.THEMES).flatMap((t) => t.items.map((i) => i[1])))];
const abc = [...new Set(Object.values(CM.alpha.WORDS.en).flatMap((l) => l.map((i) => i[1])))];
const together = [...new Set(GW.TOGETHER.flatMap((p) => p.map((x) => x[1])))];
const games = Object.keys(CM.GAMES).map((g) => CM.GAMES[g].label);
const talk = [...new Set(fill.x)];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const WHOLE = [
  // [template key, slot, values]
  ["sayFind", "name", theme], ["sayBigSmall", "name", theme], ["sayGroup", "name", theme],
  ["saySortPic", "name", theme], ["sayCount", "name", theme], ["aPair", "name", theme], ["sayFindShadow", "name", theme],
  ["praiseGentleThe", "name", theme.map((n) => n.toLowerCase())], ["goesWith", "name", together], ["sayFirstLetter", "name", abc],
  ["sayNow", "game", games], ["finished", "game", games], ["lastOne", "next", games], ["nMore", "next", games],
  ["gamesThenDone", "n", range(1, 6)], ["played", "n", range(1, 6)], ["playedCalm", "n", range(1, 6)], ["faceDown", "n", range(1, 20)],
  ["nMore", "n", range(1, 10)], ["tokensLeft", "n", range(1, 10)], ["findGroup", "n", range(1, 10)], ["nPictures", "n", range(1, 10)],
  ["sizeN", "n", range(1, 6)], ["minutesLeftSay", "n", range(1, 60)],
  ["played", "s", range(1, 100)], ["traceLetter", "l", fill.l], ["sayIWant", "x", talk], ["tokensLeft", "reward", talk]
];
const say = (t) => t.replace(/\b\d+\b/g, (d) => numberWord(+d));
let wholeCount = 0;
function addWhole(text) {
  const key = E.norm(text);
  if (!key) return;
  const prev = entries.get(key);
  if (prev) return; // already a recording (one word, or a fixed phrase)
  entries.set(key, { key, text, group: "later", whole: true, say: /\d/.test(text) ? say(text) : undefined }); wholeCount++;
}
for (const [k, slot, values] of WHOLE) {
  const tpl = en[k]; if (!tpl) throw new Error("no phrase " + k);
  for (const chunk of tpl.split(/[.!?:;,…]+|\s[–—-]\s/)) {
    if (chunk.indexOf("{" + slot + "}") < 0 || !chunk.replace(/\{[a-z]+\}/gi, "").trim()) continue;
    if (/\{(?!slot)[a-z]+\}/i.test(chunk.split("{" + slot + "}").join(""))) continue; // two different gaps: pieces only
    for (const v of values) addWhole(chunk.split("{" + slot + "}").join(String(v)).trim());
  }
}
// "First {list}": the plan for the day starts with the first game's name.
games.forEach((g) => addWhole("First " + g));
// Step n of m on schedules
for (let m = 2; m <= 20; m++) for (let n = 1; n <= m; n++) addWhole("Step " + n + " of " + m);

/* ---------- file names ---------- */
for (const e of entries.values()) {
  if (e.path) continue;
  const slug = e.key.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "x";
  e.path = "en/lib/" + slug + "-" + crypto.createHash("sha1").update(e.key).digest("hex").slice(0, 6) + ".mp3";
}

/* ---------- check: can sample sentences be put together? ---------- */
const has = (k) => entries.has(k);
let tried = 0, failed = [];
const pick = (arr, i) => arr.length ? arr[i % arr.length] : "x";
for (const k of Object.keys(en)) {
  const tpl = en[k], slots = (tpl.match(/\{([a-z]+)\}/gi) || []).map((s) => s.slice(1, -1));
  const tries = slots.length ? 40 : 1;
  for (let i = 0; i < tries; i++) {
    let s = tpl; slots.forEach((sl, j) => { s = s.split("{" + sl + "}").join(pick(fill[sl] || fill.name, i * 7 + j * 13)); });
    tried++;
    if (!E.plan(s, has, "Sam")) failed.push(k + ': "' + s + '"');
  }
}
// Letters game praise and Goes together praise
["B, bee", "socks, shoes", "S, star"].forEach((n) => { tried++; if (!E.plan(en.praiseGentle.split("{name}").join(n), has)) failed.push("praise: " + n); });

const list = [...entries.values()].sort((a, b) => a.key.localeCompare(b.key));
fs.writeFileSync(path.join(__dirname, "phrases-en.json"), JSON.stringify(list, null, 0).replace(/},{/g, "},\n{") + "\n");
const core = list.filter((e) => e.group === "core"), later = list.filter((e) => e.group === "later");
console.log("pieces: %d (core %d, later %d, whole sentence parts %d); new recordings needed: %d", list.length, core.length, later.length, wholeCount, list.filter((e) => !e.shared).length);
console.log("sample sentences checked: %d, can't be put together: %d", tried, failed.length);
failed.slice(0, 40).forEach((f) => console.log("  " + f));
