/* The device library: own pictures, stories and how-tos, schedules, talk boards and token rewards.
   Kept on this device only (never synced to an account), because it can hold family photos and words
   parents type in. Pictures and recordings themselves live in js/media.js. */
(function () {
  "use strict";
  var CM = window.CM, KEY = "calm-match-library";
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var L = null;
  try { L = JSON.parse(CM.safeGet(KEY) || "null"); } catch (e) { L = null; }
  if (!L || typeof L !== "object") L = {};
  L.v = 1; L.items = L.items || {}; L.stories = L.stories || {}; L.kids = L.kids || {};

  var MAX_STEPS = 20, MAX_SCHED = 12;
  function persist() { if (!CM.safeSet(KEY, JSON.stringify(L))) throw new Error("This device is out of space."); }

  function kid(id) {
    id = id || CM.store.activeId();
    var k = L.kids[id] || (L.kids[id] = {});
    k.schedules = Array.isArray(k.schedules) ? k.schedules : [];
    k.talk = k.talk || {};
    k.talk.choices = Array.isArray(k.talk.choices) ? k.talk.choices : ["a:10", "a:5", "a:13", "a:0"];
    k.talk.words = Array.isArray(k.talk.words) ? k.talk.words : [];
    k.reward = k.reward || "a:10";
    k.tokens = Math.max(0, Math.floor(+k.tokens) || 0);
    // Earlier versions kept one schedule in the child's settings (activity numbers only): move it here once.
    var p = CM.store.db().profiles[id];
    if (p && p.settings && Array.isArray(p.settings.schedule) && p.settings.schedule.length && !k.movedOld) {
      k.schedules.unshift({ id: CM.uid("s"), name: "My day", days: [], steps: p.settings.schedule.map(function (i) { return { r: "a:" + i }; }) });
      k.movedOld = true; p.settings.schedule = [];
    }
    if (!k.schedules.length) k.schedules.push({ id: CM.uid("s"), name: "My day", days: [], steps: [] });
    k.schedules.forEach(function (s) { s.steps = (s.steps || []).slice(0, MAX_STEPS); s.days = s.days || []; });
    if (!k.schedules.some(function (s) { return s.id === k.sched; })) k.sched = k.schedules[0].id;
    return k;
  }

  CM.lib = {
    MAX_STEPS: MAX_STEPS, MAX_SCHED: MAX_SCHED,
    data: function () { return L; },
    save: persist,
    kid: kid,
    forget: function (id) { delete L.kids[id]; persist(); },
    replace: function (data) { L = data && typeof data === "object" ? data : {}; L.v = 1; L.items = L.items || {}; L.stories = L.stories || {}; L.kids = L.kids || {}; persist(); },
    wipe: function () { L = { v: 1, items: {}, stories: {}, kids: {} }; try { localStorage.removeItem(KEY); } catch (e) {} },

    /* own pictures ("My pictures"): a word or two, with a photo, a symbol or an emoji */
    items: function () { return Object.keys(L.items).map(function (id) { return Object.assign({ id: id }, L.items[id]); }); },
    addItem: function (it) { var id = CM.uid("i"); L.items[id] = { en: String(it.en || "").slice(0, 40), ga: String(it.ga || "").slice(0, 40), sym: it.sym || null, emoji: it.emoji || null, img: it.img || null }; persist(); return id; },
    updateItem: function (id, it) { if (!L.items[id]) return; Object.assign(L.items[id], it); persist(); },
    removeItem: function (id) { var it = L.items[id]; if (!it) return; if (it.img) CM.media.del(it.img); delete L.items[id]; persist(); },

    /* schedules */
    schedules: function () { return kid().schedules; },
    activeSchedule: function () { var k = kid(); return k.schedules.find(function (s) { return s.id === k.sched; }) || k.schedules[0]; },
    // The schedule set for today's weekday, if any; otherwise the one picked in the grown-ups area.
    todaySchedule: function () {
      var d = new Date().getDay(), k = kid();
      return k.schedules.find(function (s) { return s.days.indexOf(d) >= 0 && s.steps.length; }) || this.activeSchedule();
    },
    setActive: function (id) { kid().sched = id; persist(); },
    addSchedule: function (name) { var k = kid(); if (k.schedules.length >= MAX_SCHED) return null; var s = { id: CM.uid("s"), name: (name || "Schedule").slice(0, 30), days: [], steps: [] }; k.schedules.push(s); k.sched = s.id; persist(); return s; },
    removeSchedule: function (id) { var k = kid(); k.schedules = k.schedules.filter(function (s) { return s.id !== id; }); persist(); kid(); persist(); },

    /* stories and how-tos: { title, kind: "story" | "howto", lang, pages: [{ pic, text, video }] } */
    stories: function (kind) { return Object.keys(L.stories).map(function (id) { return Object.assign({ id: id }, L.stories[id]); }).filter(function (s) { return !kind || s.kind === kind; }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); }); },
    story: function (id) { return L.stories[id] ? Object.assign({ id: id }, L.stories[id]) : null; },
    saveStory: function (st) {
      var id = st.id || CM.uid("st"), copy = clone(st); delete copy.id; copy.at = Date.now();
      copy.pages = (copy.pages || []).slice(0, 30).map(function (p) { return { pic: p.pic || "", text: String(p.text || "").slice(0, 300), textGa: String(p.textGa || "").slice(0, 300), video: p.video || null }; });
      copy.title = String(copy.title || "My story").slice(0, 60);
      copy.titleGa = String(copy.titleGa || "").slice(0, 60);
      L.stories[id] = copy; persist(); return id;
    },
    removeStory: function (id) {
      var st = L.stories[id]; if (!st) return;
      (st.pages || []).forEach(function (p) { if (p.video) CM.media.del(p.video); if (/^m:/.test(p.pic || "")) CM.media.del(p.pic.slice(2)); });
      delete L.stories[id];
      Object.keys(L.kids).forEach(function (k) { (L.kids[k].schedules || []).forEach(function (s) { s.steps.forEach(function (x) { if (x.howto === id) delete x.howto; }); }); });
      persist();
    }
  };

  /* ---------- picture references ----------
     A short string names any picture the app can show:
       a:<n>          an activity (CM.ACTIVITIES)
       t:<theme>:<n>  a theme picture (uses the family's photo when photo mode is on)
       s:<id>         a symbol (site/symbols)
       i:<id>         one of "My pictures"
       e:<emoji>      a plain emoji
       m:<key>        a photo saved in the media store (stories) */
  // Small moving pictures for how-tos. They stay still in calm mode.
  var ANIM = { rub: '<span class="a1">🙌</span><span class="a2">💦</span>', brush: '<span class="a1">🪥</span><span class="a2">😁</span>', drip: '<span class="a1">🚰</span><span class="a2">💧</span>', soap: '<span class="a1">🧼</span><span class="a2">🙌</span>' };
  function emojiHtml(e) { return '<span class="emo" aria-hidden="true">' + CM.esc(e) + "</span>"; }
  function img(src, fb) { return '<img class="ph" src="' + CM.esc(src) + '" alt=""' + (fb ? ' data-fb="' + CM.esc(fb) + '"' : "") + ">"; }
  CM.symHtml = function (id) { return CM.SYMBOLS && CM.SYMBOLS[id] ? '<img class="sym" src="symbols/' + id + '.svg" alt="">' : ""; };
  CM.ref = function (r) {
    r = String(r || ""); var m, out = { html: emojiHtml("❔"), en: "", ga: "" };
    if ((m = r.match(/^a:(\d+)$/)) && CM.ACTIVITIES[+m[1]]) { var a = CM.ACTIVITIES[+m[1]]; out = { html: emojiHtml(a[0]), en: a[1], ga: a[2] }; }
    else if ((m = r.match(/^t:([a-z]+):(\d+)$/)) && CM.THEMES[m[1]] && CM.THEMES[m[1]].items[+m[2]]) { var it = CM.THEMES[m[1]].items[+m[2]], ph = CM.pic(it, m[1]); out = { html: ph.charAt(0) === "<" ? ph : emojiHtml(ph), en: it[1], ga: it[2] }; }
    else if ((m = r.match(/^s:([a-z0-9]+)$/)) && CM.SYMBOLS && CM.SYMBOLS[m[1]]) { var s = CM.SYMBOLS[m[1]]; out = { html: CM.symHtml(m[1]), en: s[0], ga: s[1] }; }
    else if ((m = r.match(/^i:(\w+)$/)) && L.items[m[1]]) {
      var c = L.items[m[1]], src = c.img && CM.media.url(c.img);
      out = { html: src ? img(src, c.emoji || "🖼️") : c.sym ? CM.symHtml(c.sym) : emojiHtml(c.emoji || "🖼️"), en: c.en, ga: c.ga || c.en };
    }
    else if ((m = r.match(/^e:(.+)$/))) out = { html: emojiHtml(m[1]), en: "", ga: "" };
    else if ((m = r.match(/^x:([a-z]+)$/)) && ANIM[m[1]]) out = { html: '<span class="anim anim-' + m[1] + '" aria-hidden="true">' + ANIM[m[1]] + "</span>", en: "", ga: "" };
    else if ((m = r.match(/^m:(.+)$/)) && CM.media.has(m[1])) out = { html: img(CM.media.url(m[1]), "🖼️"), en: "", ga: "" };
    out.name = CM.lang && CM.lang() === "ga" ? (out.ga || out.en) : out.en;
    return out;
  };
  CM.refName = function (r) { return CM.ref(r).name; };
})();
