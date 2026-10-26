#!/usr/bin/env node
/* Builds docs/irish-review.md: every piece of Irish on the site beside its English, in one document for a
   fluent Irish speaker to check. Reads the site's own code, so it stays current.

       node tools/irish-review.js

   Sections: child-facing phrases, games, themes, feelings and game words, routines, Alphabet book, Talk board,
   schedule activities, first-time setup, Grown-ups area, Sing along, numbers, and the questions we have.
   Corrections go back into the source files named in each section; after that run
   node tools/audio/harvest.js --lang ga and node tools/irish-review.js again. */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), SITE = path.join(ROOT, "site");
const read = (p) => fs.readFileSync(path.join(SITE, p), "utf8");

// Load the shared word lists the way harvest.js does.
global.window = global;
global.CM = window.CM = { esc: (s) => String(s), safeGet: () => null, safeSet: () => true };
global.document = { getElementById: () => null, addEventListener() {}, querySelectorAll: () => [] };
for (const f of ["js/engine.js", "js/i18n.js", "js/symbols.js", "js/games.js", "js/talk.js", "js/stories.js", "js/alphabet.js"]) eval(read(f));

// Pull an object literal out of a file by its opening text ("var T = {"), matching braces.
function literal(src, opener) {
  const i = src.indexOf(opener); if (i < 0) throw new Error("not found: " + opener);
  let j = src.indexOf("{", i), depth = 0, inStr = null;
  for (let k = j; k < src.length; k++) {
    const c = src[k], prev = src[k - 1];
    if (inStr) { if (c === inStr && prev !== "\\") inStr = null; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "/" && src[k + 1] === "/") { k = src.indexOf("\n", k); continue; }
    if (c === "/" && src[k + 1] === "*") { k = src.indexOf("*/", k) + 1; continue; }
    if (c === "{") depth++;
    if (c === "}") { depth--; if (!depth) return eval("(" + src.slice(j, k + 1) + ")"); }
  }
  throw new Error("unbalanced: " + opener);
}
function array(src, opener) {
  const i = src.indexOf(opener); if (i < 0) throw new Error("not found: " + opener);
  let j = src.indexOf("[", i), depth = 0, inStr = null, inRe = false;
  for (let k = j; k < src.length; k++) {
    const c = src[k], prev = src[k - 1];
    if (inStr) { if (c === inStr && prev !== "\\") inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "[") depth++;
    if (c === "]") { depth--; if (!depth) return src.slice(j, k + 1); }
  }
  throw new Error("unbalanced: " + opener);
}

const esc = (s) => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");
let out = [];
const h = (t) => out.push("", "## " + t, "");
const p = (t) => out.push(t, "");
function table(rows, head) {
  head = head || ["English", "Irish", "OK? / correction"];
  out.push("| " + head.join(" | ") + " |", "|" + head.map(() => "---").join("|") + "|");
  for (const r of rows) out.push("| " + r.map(esc).join(" | ") + (r.length < head.length ? " |" : "") + " |");
  out.push("");
}
let total = 0;
const count = (rows) => { total += rows.length; return rows; };

/* ---------- header ---------- */
const today = new Date().toISOString().slice(0, 10);
out.push("# Calm Match — Irish (Gaeilge) review sheet", "", "_Made " + today + " by `node tools/irish-review.js`. Everything Irish on the site, beside its English._", "");
p("**For the checker.** Calm Match is a free site of calm learning games for neurodivergent children (about 3 to 9), used by a child with a parent or teacher. " +
  "The Irish was written by the site's maker, who is not a fluent speaker, and is read aloud to children, so natural, simple, spoken Irish matters more than literal translation. " +
  "Short is good: these show on buttons and cards. Please write a correction in the last column, or just mark ✓. " +
  "Where a word sits in a gap like `{name}` or `{n}`, the site fills it in (a picture name, a number), so please say if the words around the gap need to change with it (for example a number before a noun). " +
  "If something should simply not be said in Irish the way it is in English, say so.");
p("**Dialect.** One consistent dialect across the site, your own. Please tell us which, so it can be credited and so the voice recordings (later) match.");

/* ---------- 1 child-facing phrases ---------- */
h("1. Phrases the games say and show (site/js/i18n.js)");
p("Spoken aloud to the child and shown on the screen. `{name}` = a picture or word, `{game}`/`{next}` = a game name, `{n}`/`{m}`/`{s}` = a number, `{l}` = a letter, `{x}`/`{reward}` = a Talk board word or activity, `{list}` = game names joined by \"then\", `{does}` = a game's one-line description.");
{
  const en = CM.STRINGS.en, ga = CM.STRINGS.ga;
  table(count(Object.keys(en).map((k) => [en[k], ga[k], ""])));
}

/* ---------- 2 games ---------- */
h("2. Games: names and what they do (site/js/engine.js `CM.GAMES`)");
table(count(Object.keys(CM.GAMES).map((g) => [CM.GAMES[g].label + " — " + CM.GAMES[g].does, CM.GAMES[g].ga + " — " + CM.GAMES[g].doesGa, ""])));

/* ---------- 3 themes ---------- */
h("3. Picture names by theme (site/js/engine.js `CM.THEMES`)");
p("Said on their own (\"traein\") and inside sentences (\"Aimsigh an traein\"). If a name needs an article or a mutation inside the sentences in section 1, please say which.");
for (const k of Object.keys(CM.THEMES)) {
  const th = CM.THEMES[k];
  out.push("**" + th.group.en + " / " + th.group.ga + "**", "");
  table(count(th.items.map((it) => [it[0] + " " + it[1], it[2], ""])));
}

/* ---------- 4 feelings and game words ---------- */
h("4. Feelings, \"Why?\" scenes and \"Where?\" words (site/js/engine.js, site/js/games.js)");
table(count(CM.FEELINGS.map((f) => [f.en + " — " + f.q.en, f.ga + " — " + f.q.ga, ""])));
const GW = CM.GAME_WORDS;
out.push("Goes together pairs:", "");
table(count(GW.TOGETHER.map((pr) => [pr[0][1] + " + " + pr[1][1], pr[0][2] + " + " + pr[1][2], ""])));
out.push("How do they feel? scenes:", "");
table(count(GW.WHY.map((w) => [w.e + " " + w.en, w.ga, ""])));
out.push("Where is it? (word, then the sentence said):", "");
table(count(GW.WHERE.map((w) => [w.en + " — " + w.sayEn, w.ga + " — " + w.sayGa, ""])));

/* ---------- 5 routines ---------- */
h("5. Steps in order: routines and their steps (site/js/engine.js `CM.SEQUENCES`)");
for (const s of CM.SEQUENCES) {
  out.push("**" + s.en + " / " + s.ga + "**", "");
  table(count(s.steps.map((x) => [x[0] + " " + x[1], x[2], ""])));
}

/* ---------- 6 alphabet ---------- */
h("6. Alphabet book (site/js/alphabet.js, site/alphabet/book.js, site/js/speech.js)");
p("Irish has " + CM.alpha.letters("ga").length + " letters here: " + CM.alpha.letters("ga").join(" ") + ". Each card shows a picture and its word; tapping it says the letter, a pause, then the word (\"B … bó\"). " +
  "Words were chosen for their first **sound**. Please check each word is natural, correctly spelled with its fadas, and starts with that letter's sound.");
for (const L of CM.alpha.letters("ga")) {
  const words = CM.alpha.WORDS.ga[L] || [];
  out.push("**" + L + "** — " + (words.map((w) => w[0] + " " + w[1]).join(" · ") || "(no words yet)"), "");
}
out.push("");
table(count(CM.alpha.letters("ga").map((L) => [L, (CM.alpha.WORDS.ga[L] || []).map((w) => w[1]).join(", "), ""])), ["Letter", "Irish words", "OK? / correction"]);
const UI = literal(read("alphabet/book.js"), "var UI = {");
out.push("Words on the Alphabet book's screens:", "");
table(count(Object.keys(UI.en).map((k) => [UI.en[k], UI.ga[k] == null ? "— (not used in Irish: no X)" : UI.ga[k], ""])));
const help = literal(read("js/speech.js"), "help: {");
out.push("The note shown when a device has no Irish voice:", "");
table(count([[help.en, help.ga, ""]]));

/* ---------- 7 talk board ---------- */
h("7. Talk board words (site/js/symbols.js, made by tools/build-symbols.py)");
p("A child taps these to say \"I want …\" or to build a short sentence. Corrections go in `tools/build-symbols.py` (the Irish column), then run it again.");
table(count(Object.keys(CM.SYMBOLS).map((id) => [CM.SYMBOLS[id][0], CM.SYMBOLS[id][1], ""])));

/* ---------- 8 activities ---------- */
h("8. Schedule activities (site/js/i18n.js `CM.ACTIVITIES`)");
p("Used on visual schedules, the First/Then board and the token board (\"3 more, then {reward}\").");
table(count(CM.ACTIVITIES.map((a) => [a[0] + " " + a[1], a[2], ""])));

/* ---------- 9 setup ---------- */
h("9. First-time setup screens (site/js/setup.js)");
const T = literal(read("js/setup.js"), "var T = {");
table(count(Object.keys(T.en).map((k) => [T.en[k], T.ga[k], ""])));

/* ---------- 10 grown-ups ---------- */
h("10. Grown-ups area (site/js/grown-ga.js)");
p("Shown to parents and teachers when they switch the Grown-ups area to Gaeilge. Written, not spoken. Game and picture names inside it stay as in sections 2 and 3.");
const gaSrc = read("js/grown-ga.js");
const GAdict = literal(gaSrc, "var GA = {");
table(count(Object.keys(GAdict).map((k) => [k, GAdict[k], ""])));
out.push("Patterns with a number in them:", "");
table(count(array(gaSrc, "var PATTERNS = [").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("[/")).map((l) => { const m = l.match(/^\[\/(.*)\/,\s*"(.*)"\]/); return m ? [m[1].replace(/\\d\+/g, "{n}").replace(/[\^$()]/g, "").replace(/\\\?/g, "?"), m[2].replace(/\$\d/g, "{n}"), ""] : null; }).filter(Boolean)));
out.push("Child mode header on the Sing along and Alphabet pages (site/js/childbar.js):", "");
table(count([["Home", "Abhaile", ""]]));

/* ---------- 11 sing along ---------- */
h("11. Sing along (site/singalong/songs.js, site/singalong/shared.js)");
p("The song lyrics have their own sheet, `docs/singalong-irish-lyrics.md`, with syllable counts so the words stay on the tune: please check them there, singing along at calmmatch.com/singalong/ with GA chosen. The lines we were least sure of: Old MacDonald (\"feirm\" as two syllables, \"gog\", \"le hoinc oinc\"); Baa Baa Black Sheep (\"Tá, tá, tá mo mhála lán!\"); This Old Man (\"le cnig cnag is patapat\", \"rith sé abhaile go beo\"); Row Row Row Your Boat (\"Seol\", \"lúcháireach\"); Yankee Doodle (\"Dúdlí Beag\", \"seinm\" as two syllables); Are You Sleeping (\"Id' chodladh fós?\"); Jack and Jill (\"Seán is Síle\", \"le torann mór\").");
const songsSrc = read("singalong/songs.js");
const titles = [...songsSrc.matchAll(/title:\s*\{\s*en:\s*'([^']*)',\s*ga:\s*'([^']*)'\s*\}/g)].map((m) => [m[1], m[2], ""]);
out.push("Song titles:", "");
table(count(titles));
const alts = [...songsSrc.matchAll(/alt:\s*\{\s*en:\s*'([^']*)',\s*ga:\s*'([^']*)'\s*\}/g)].map((m) => [m[1], m[2], ""]);
out.push("Picture descriptions (read by screen readers):", "");
table(count(alts));
const SS = literal(read("singalong/shared.js"), "en: {");
const SG = literal(read("singalong/shared.js").slice(read("singalong/shared.js").indexOf("ga: {")), "ga: {");
out.push("Words on the Sing along screens:", "");
table(count(Object.keys(SS).map((k) => [SS[k], SG[k], ""])));

/* ---------- 12 numbers ---------- */
h("12. Numbers");
p("Emma will say numbers on their own (counting: \"a haon, a dó, a trí\" — please confirm the forms below) and **inside phrases** where the noun follows the number. For the phrases, please write out how each should be said for 1, 2, 3 … 10 (and the pattern for 11–20 and tens), e.g. \"nóiméad amháin fágtha / dhá nóiméad fágtha / trí nóiméad fágtha\". The recordings will follow what you write.");
const ga = CM.STRINGS.ga;
const numTpl = Object.keys(ga).filter((k) => /\{(n|m|s)\}/.test(ga[k])).map((k) => [CM.STRINGS.en[k], ga[k], ""]);
table(count(numTpl), ["English", "Irish (as written)", "How to say it with 1, 2, 3 … (please write out)"]);
const cnt = ["a náid", "a haon", "a dó", "a trí", "a ceathair", "a cúig", "a sé", "a seacht", "a hocht", "a naoi", "a deich", "a haon déag", "a dó dhéag", "a trí déag", "a ceathair déag", "a cúig déag", "a sé déag", "a seacht déag", "a hocht déag", "a naoi déag", "fiche"];
table(count(cnt.map((w, i) => [String(i), w, ""])), ["Number", "Counting form used", "OK? / correction"]);

/* ---------- 13 questions ---------- */
h("13. Questions for you");
out.push(
  "1. **Alphabet cards.** English cards say \"A, for apple\" in one go. Irish cards currently say the letter, a pause, then the word (\"B … bó\"). Would \"B mar bhó\" be natural for a small child, and if so, which letters mutate the word after \"mar\"? Or is letter-then-word better?",
  "2. **Letter names.** How should each of the 18 letters be named aloud for a child (á, bé, cé … or the English names)?",
  "3. **Praise.** English says \"Yes! That's the train.\" Irish says \"Maith thú! traein.\" Should there be an article (\"an traein\") or a different shape?",
  "4. **Numbers before nouns** — see section 12.",
  "5. **Names.** When the child's name is added to a phrase (\"Inniu, {name}\"), the recording of the name is in the parent's own voice. Is there anything about the words around the name that should change (vocative \"a Sheáin\" can't be done, since the name is a recording)?",
  "6. **The Grown-ups area** — any phrase that is grammatically fine but would read oddly to a parent or teacher.",
  "7. **Your name for the credits page**, and the dialect to name there.",
  ""
);

p("_" + total + " items in this sheet._");
fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/irish-review.md"), out.join("\n"));
console.log("docs/irish-review.md: %d items", total);
