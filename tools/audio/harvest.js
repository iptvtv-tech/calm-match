#!/usr/bin/env node
/* Lists every piece of English or Irish that Emma needs to record, by running the site's own code.

   The site speaks sentences made from fixed phrases (site/js/i18n.js) with gaps filled in: a picture name,
   a game name, a number, a letter. Recording every filled-in sentence would need thousands of clips, so Emma
   records the fixed parts and the fill-ins separately, and site/js/emma.js joins them at speaking time
   ("Find the" + "dog"). This script lists both, using emma.js's own splitting, then checks that sample
   sentences can all be put together from the list.

   node tools/audio/harvest.js              writes tools/audio/phrases-en.json and prints a summary
   node tools/audio/harvest.js --lang ga    the same for Irish (phrases-ga.json): the list a fluent speaker
                                            or ABAIR records from. Irish has no skill names, starter stories
                                            or settings messages yet (those are English only on the site).
   Each entry: { key, text, group, path }. group "core" is saved for offline use straight away (alphabet and
   games); "later" is saved the first time it's played (Talk board, stories, schedules, timers). */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "../..");
const SITE = path.join(ROOT, "site");
const E = require(path.join(SITE, "js/emma.js"));
const LANG = process.argv.includes("--lang") ? process.argv[process.argv.indexOf("--lang") + 1] : "en";
if (LANG !== "en" && LANG !== "ga") throw new Error("--lang en or ga");
const GA = LANG === "ga";

// Load the site's word lists the way the browser does, with a stand-in window.
global.window = global;
global.CM = window.CM = { esc: (s) => String(s), safeGet: () => null, safeSet: () => true };
global.document = { getElementById: () => null, addEventListener() {}, querySelectorAll: () => [] };
for (const f of ["js/engine.js", "js/i18n.js", "js/symbols.js", "js/games.js", "js/talk.js", "js/stories.js", "js/alphabet.js"])
  eval(fs.readFileSync(path.join(SITE, f), "utf8"));
CM.store = { S: () => ({ lang: LANG }) };

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
const en = CM.STRINGS[LANG];         // the fixed phrases in this language (named "en" from the English-only days)
const T = (it) => GA ? it[2] : it[1];              // theme, pair and sequence items: [emoji, english, irish]
const W = (o) => GA ? o.ga : o.en;                 // objects with en/ga
for (const k of Object.keys(en)) addTemplate(en[k], "core");

const fill = { name: [], game: [], next: [], n: [], s: [], l: [], x: [], reward: [], skill: [], list: [], does: [], old: [], new: [], m: [] };
// Picture names in the themes, and the theme group names
for (const k of Object.keys(CM.THEMES)) { const th = CM.THEMES[k]; th.items.forEach((it) => { add(T(it), "core"); fill.name.push(T(it)); }); add(W(th.group), "core"); }
// Feelings
CM.FEELINGS.forEach((f) => { add(W(f), "core"); add(W(f.q), "core"); fill.name.push(W(f)); });
// Other game words
const GW = CM.GAME_WORDS;
GW.TOGETHER.forEach((p) => p.forEach((x) => { add(T(x), "core"); fill.name.push(T(x)); }));
GW.WHY.forEach((w) => add(W(w), "core"));
GW.WHERE.forEach((w) => { add(W(w), "core"); add(GA ? w.sayGa : w.sayEn, "core"); });
CM.SEQUENCES.forEach((s) => { add(W(s), "core"); s.steps.forEach((x) => add(T(x), "core")); });
// Game names and what they do
for (const g of Object.keys(CM.GAMES)) { const G = CM.GAMES[g], label = GA ? G.ga : G.label; add(label, "core"); add(GA ? G.doesGa : G.does, "core"); fill.game.push(label); fill.next.push(label); }
// Skill names are English only (shown in the Grown-ups area; the Irish area keeps them in English for now)
if (!GA) CM.SKILLS.forEach((s) => { add(s.name, "later"); fill.skill.push(s.name); });
// Numbers: 0-20 with the games, 21-100 later (sticker counts, minutes)
for (let i = 0; i <= 100; i++) { add(String(i), i <= 20 ? "core" : "later", { say: numberWord(i) }); fill.n.push(String(i)); fill.s.push(String(i)); fill.m.push(String(i)); }
// Letters: the Alphabet book's letter recordings (18 letters in Irish)
for (const L of CM.alpha.letters(LANG)) { entries.set(L.toLowerCase(), { key: L.toLowerCase(), text: L, group: "core", path: LANG + "/letters/" + L.toLowerCase() + ".mp3", shared: true }); fill.l.push(L); }
// Alphabet words: the Alphabet book's word recordings (also used in the Letters game)
for (const L of Object.keys(CM.alpha.WORDS[LANG])) CM.alpha.WORDS[LANG][L].forEach((it) => {
  const key = E.norm(it[1]);
  if (!entries.has(key)) entries.set(key, { key, text: it[1], group: "core", path: LANG + "/words/" + CM.alpha.slug(it[1]) + ".mp3", shared: true });
  else { const e = entries.get(key); e.path = LANG + "/words/" + CM.alpha.slug(it[1]) + ".mp3"; e.shared = true; e.group = "core"; }
  fill.name.push(it[1]);
});
// Talk board symbols, schedule activities, starter stories: saved when first used
const sym = (s) => GA ? s[1] : s[0];
for (const id of Object.keys(CM.SYMBOLS)) { add(sym(CM.SYMBOLS[id]), "later"); fill.x.push(sym(CM.SYMBOLS[id])); fill.reward.push(sym(CM.SYMBOLS[id])); fill.old.push(sym(CM.SYMBOLS[id])); fill.new.push(sym(CM.SYMBOLS[id])); }
CM.ACTIVITIES.forEach((a) => { add(T(a), "later"); fill.x.push(T(a)); fill.reward.push(T(a)); fill.old.push(T(a)); fill.new.push(T(a)); });
// Starter stories and the settings messages (site/js/app.js) are English only
if (!GA) {
  CM.STORY_TEMPLATES.forEach((st) => { add(st.title, "later"); st.pages.forEach((p) => add(p[1], "later")); });
  ["Read aloud is on", "This is how I will sound. Find the dog."].forEach((x) => add(x, "core"));
}
fill.does = Object.keys(CM.GAMES).map((g) => GA ? CM.GAMES[g].doesGa : CM.GAMES[g].does);
fill.list = [Object.keys(CM.GAMES).slice(0, 3).map((g) => GA ? CM.GAMES[g].ga : CM.GAMES[g].label).join(", " + en.then + " ")];
fill.next.push(en.allDoneLower);
if (!fill.skill.length) fill.skill = fill.game;
// Letters game praise ("B, bee") and the pairs of Goes together ("socks, shoes") are just names joined by commas.

function numberWord(n) {
  if (GA) {
    // Counting numbers ("a haon, a dó"), the form used for amounts on their own
    const a = ["a náid", "a haon", "a dó", "a trí", "a ceathair", "a cúig", "a sé", "a seacht", "a hocht", "a naoi", "a deich",
      "a haon déag", "a dó dhéag", "a trí déag", "a ceathair déag", "a cúig déag", "a sé déag", "a seacht déag", "a hocht déag", "a naoi déag"];
    const t = ["", "", "fiche", "tríocha", "daichead", "caoga", "seasca", "seachtó", "ochtó", "nócha"];
    if (n < 20) return a[n]; if (n === 100) return "céad";
    return t[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  }
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
const theme = [...new Set(Object.values(CM.THEMES).flatMap((t) => t.items.map(T)))];
const abc = [...new Set(Object.values(CM.alpha.WORDS[LANG]).flatMap((l) => l.map((i) => i[1])))];
const together = [...new Set(GW.TOGETHER.flatMap((p) => p.map(T)))];
const games = Object.keys(CM.GAMES).map((g) => GA ? CM.GAMES[g].ga : CM.GAMES[g].label);
const talk = [...new Set(fill.x)];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const WHOLE = [
  // [template key, slot, values]
  ["sayFind", "name", theme], ["sayBigSmall", "name", theme], ["sayGroup", "name", theme],
  ["saySortPic", "name", theme], ["sayCount", "name", theme], ["aPair", "name", theme], ["sayFindShadow", "name", theme],
  ["praiseGentleThe", "name", GA ? theme : theme.map((n) => n.toLowerCase())], ["goesWith", "name", together], ["sayFirstLetter", "name", abc],
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
  // Irish: a number before a noun changes form ("dhá nóiméad", not "a dó nóiméad"), so the spoken form of a whole
  // phrase is left for the fluent speaker (see docs/irish-review.md); only bare numbers get a counting form.
  entries.set(key, { key, text, group: "later", whole: true, say: /\d/.test(text) && !GA ? say(text) : undefined }); wholeCount++;
}
for (const [k, slot, values] of WHOLE) {
  const tpl = en[k]; if (!tpl) throw new Error("no phrase " + k);
  for (const chunk of tpl.split(/[.!?:;,…]+|\s[–—-]\s/)) {
    if (chunk.indexOf("{" + slot + "}") < 0 || !chunk.replace(/\{[a-z]+\}/gi, "").trim()) continue;
    if (/\{(?!slot)[a-z]+\}/i.test(chunk.split("{" + slot + "}").join(""))) continue; // two different gaps: pieces only
    for (const v of values) addWhole(chunk.split("{" + slot + "}").join(String(v)).trim());
  }
}
// "First {list}" / "Inniu: {list}": the plan for the day starts with the first game's name.
{ const chunk = en.sayToday.split(/[.!?;…]+/).find((c) => c.indexOf("{list}") >= 0) || "First {list}"; games.forEach((g) => addWhole(chunk.split("{list}").join(g).trim())); }
// Goes together praise: "Socks and shoes go together", in either order (the game shows either one first).
GW.TOGETHER.forEach((p) => { addWhole(en.goTogether.replace("{a}", T(p[0])).replace("{b}", T(p[1]))); addWhole(en.goTogether.replace("{a}", T(p[1])).replace("{b}", T(p[0]))); });
// Step n of m on schedules
for (let m = 2; m <= 20; m++) for (let n = 1; n <= m; n++) addWhole(en.stepNofM.replace("{n}", n).replace("{m}", m));

/* ---------- file names ---------- */
for (const e of entries.values()) {
  if (e.path) continue;
  const slug = e.key.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "x";
  e.path = LANG + "/lib/" + slug + "-" + crypto.createHash("sha1").update(e.key).digest("hex").slice(0, 6) + ".mp3";
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
(GA ? ["B, bó", "stocaí, bróga", "S, sú talún"] : ["B, bee", "socks, shoes", "S, star"]).forEach((n) => { tried++; if (!E.plan(en.praiseGentle.split("{name}").join(n), has)) failed.push("praise: " + n); });

const list = [...entries.values()].sort((a, b) => a.key.localeCompare(b.key));
fs.writeFileSync(path.join(__dirname, "phrases-" + LANG + ".json"), JSON.stringify(list, null, 0).replace(/},{/g, "},\n{") + "\n");
const core = list.filter((e) => e.group === "core"), later = list.filter((e) => e.group === "later");
console.log("%s pieces: %d (core %d, later %d, whole sentence parts %d); new recordings needed: %d", LANG, list.length, core.length, later.length, wholeCount, list.filter((e) => !e.shared).length);
console.log("sample sentences checked: %d, can't be put together: %d", tried, failed.length);
failed.slice(0, 40).forEach((f) => console.log("  " + f));
