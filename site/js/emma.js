/* Emma: the site's built-in voice. Short recordings made once with an open text-to-speech voice
   (tools/audio/build.py) and stored on the site, so everything the site says sounds the same on every
   device, works offline and sends nothing anywhere.

   How a sentence is spoken (js/app.js say()):
   1. Split it at punctuation into short phrases, then each phrase into as few recorded pieces as possible:
      "Find the dog" -> "find the" + "dog". The site's own code lists every piece (tools/audio/harvest.js),
      using these same functions, so the pieces always match.
   2. If every piece has a recording, play them in order. If any piece is missing (words a grown-up typed,
      for example), Emma says nothing and the device's voice says the whole sentence instead, so the two
      voices are never mixed inside one sentence.
   3. The child's own name: a grown-up can record it (Children tab). Until then Emma leaves it out
      ("Great work!" instead of "Great work, Sam").

   This file also runs in node (tools/audio/harvest.js), so it must not touch the page when loaded. */
(function (root) {
  "use strict";
  var E = {};
  var CHILD = "__child__";

  // The form recordings are looked up by: lower case, no punctuation, single spaces. Fadas are kept.
  E.norm = function (s) {
    return String(s == null ? "" : s).normalize("NFC").toLowerCase().replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9áéíóú' -]+/g, " ").replace(/\s+-\s+/g, " ").replace(/\s+/g, " ").trim();
  };
  // Phrases, split at sentence and clause punctuation.
  E.chunks = function (text) {
    return String(text == null ? "" : text).split(/[.!?:;,…]+|\s[–—-]\s/).map(function (s) { return E.norm(s); }).filter(Boolean);
  };
  // The fewest recorded pieces that make up a phrase, or null. has(key) says whether a piece exists.
  E.segment = function (phrase, has) {
    var w = phrase.split(" "), n = w.length, best = [0], from = [0];
    for (var i = 1; i <= n; i++) {
      best[i] = Infinity;
      for (var j = Math.max(0, i - 12); j < i; j++) {
        if (best[j] === Infinity) continue;
        var key = w.slice(j, i).join(" ");
        if (has(key) && best[j] + 1 < best[i]) { best[i] = best[j] + 1; from[i] = j; }
      }
    }
    if (best[n] === Infinity) return null;
    var out = [];
    for (var k = n; k > 0; k = from[k]) out.unshift(w.slice(from[k], k).join(" "));
    return out;
  };
  // Whole plan for a sentence: a list of phrases, each a list of piece keys. Null if any piece is missing.
  E.plan = function (text, has, childName) {
    var nameKey = childName ? E.norm(childName) : "";
    var phrases = [];
    var chunks = E.chunks(text);
    for (var c = 0; c < chunks.length; c++) {
      var ch = chunks[c];
      if (nameKey && (" " + ch + " ").indexOf(" " + nameKey + " ") >= 0) ch = (" " + ch + " ").split(" " + nameKey + " ").join(" " + CHILD + " ").trim();
      var seg = E.segment(ch, function (k) { return k === CHILD || has(k); });
      if (!seg) return null;
      phrases.push(seg);
    }
    return phrases.length ? phrases : null;
  };
  E.CHILD = CHILD;

  if (typeof module !== "undefined" && module.exports) { module.exports = E; return; }

  /* ---------- in the browser ---------- */
  var CM = root.CM = root.CM || {};
  var lib = {}, base = "", ready = null, playing = null;

  // Read the list of recordings once. base is the path to the site root ("" or "../").
  E.load = function (b) {
    if (ready) return ready;
    base = b || "";
    ready = fetch(base + "audio/manifest.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (m) { lib = m.lib || {}; return lib; });
    return ready;
  };
  E.has = function (lang) { return !!(lib[lang] && Object.keys(lib[lang]).length); };
  function url(lang, key) { var p = lib[lang] && lib[lang][key]; return p ? base + "audio/" + p : null; }

  // Speed: the grown-ups' voice speed setting (0.6 very slow ... 1 normal; 0.75 is the default) slows or
  // speeds the recordings without changing their pitch. Kept between 80% and 125%, where they still sound natural.
  E.rate = function (r) { r = +r || 0.75; return Math.max(0.8, Math.min(1.25, r / 0.75)); };

  // Say a sentence with Emma. opts: { lang, rate, clear, childName, childClip }.
  // Returns true if Emma is saying it, false if she can't (then the caller uses the device's voice).
  E.say = function (text, opts) {
    opts = opts || {};
    var lang = opts.lang === "ga" ? "ga" : "en", L = lib[lang];
    if (!L) return false;
    var plan = E.plan(text, function (k) { return !!L[k]; }, opts.childName);
    if (!plan) return false;
    var list = [], gapPhrase = opts.clear === false ? 120 : 260, gapPiece = 60;
    plan.forEach(function (ph, i) {
      ph.forEach(function (k, j) {
        var u = k === CHILD ? opts.childClip || null : url(lang, k);
        if (u) list.push({ url: u, gap: j === ph.length - 1 ? (i === plan.length - 1 ? 0 : gapPhrase) : gapPiece });
      });
    });
    if (!list.length) return true; // only the child's name, and it isn't recorded: say nothing
    E.stop();
    var rate = E.rate(opts.rate), i = 0, stopped = false, timer = null, cur = null;
    function next() {
      if (stopped || i >= list.length) return;
      var it = list[i++];
      cur = new Audio(it.url); cur.volume = 0.9;
      try { cur.preservesPitch = cur.mozPreservesPitch = cur.webkitPreservesPitch = true; } catch (e) {}
      cur.playbackRate = rate;
      cur.onended = function () { timer = setTimeout(next, it.gap / rate); };
      cur.onerror = function () { timer = setTimeout(next, 0); };
      var p = cur.play(); if (p && p.catch) p.catch(function (e) { if (!e || e.name !== "AbortError") timer = setTimeout(next, 0); });
    }
    playing = { stop: function () { stopped = true; clearTimeout(timer); if (cur) { try { cur.pause(); } catch (e) {} } } };
    next();
    return true;
  };
  E.stop = function () { if (playing) { playing.stop(); playing = null; } };

  CM.emma = E;
})(typeof window !== "undefined" ? window : this);
