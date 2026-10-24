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
   3. The child's own name: a grown-up can record it (Children and device > Children). Until then Emma leaves it out
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
  var SPLIT = /[.!?:;,…]+|\s[–—-]\s/;
  E.chunks = function (text) {
    return String(text == null ? "" : text).split(SPLIT).map(function (s) { return E.norm(s); }).filter(Boolean);
  };
  // For each phrase, whether a full stop (true) or a comma-like pause (false) follows it. Same order as chunks.
  E.ends = function (text) {
    var out = [], re = new RegExp(SPLIT.source, "g"), str = String(text == null ? "" : text), last = 0, m;
    function push(piece, sep) { if (E.norm(piece)) out.push(/[.!?…]/.test(sep || ".")); }
    while ((m = re.exec(str))) { push(str.slice(last, m.index), m[0]); last = m.index + m[0].length; if (!m[0].length) re.lastIndex++; }
    push(str.slice(last), ".");
    return out;
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
  var lib = {}, whole = {}, base = "", ready = null, playing = null;

  // Read the list of recordings once. base is the path to the site root ("" or "../").
  E.load = function (b) {
    if (ready) return ready;
    base = b || "";
    ready = fetch(base + "audio/manifest.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (m) {
        lib = m.lib || {};
        Object.keys(m.whole || {}).forEach(function (l) { whole[l] = {}; m.whole[l].forEach(function (k) { whole[l][k] = true; }); });
        return lib;
      });
    return ready;
  };
  E.has = function (lang) { return !!(lib[lang] && Object.keys(lib[lang]).length); };
  function url(lang, key) { var p = lib[lang] && lib[lang][key]; return p ? base + "audio/" + p : null; }

  // Speed: the grown-ups' voice speed setting (0.66 slower, 0.75 normal, 0.84 faster) slows or speeds the
  // recordings without changing their pitch: 88%, 100% (the Alphabet book's pace) or 112%.
  E.rate = function (r) { r = +r || 0.75; return Math.max(0.85, Math.min(1.15, r / 0.75)); };

  // Say a sentence with Emma. opts: { lang, rate, clear, childName, childClip }.
  // Returns true if Emma is saying it, false if she can't (then the caller uses the device's voice).
  E.say = function (text, opts) {
    opts = opts || {};
    var lang = opts.lang === "ga" ? "ga" : "en", L = lib[lang];
    if (!L) return false;
    var plan = E.plan(text, function (k) { return !!L[k]; }, opts.childName);
    if (!plan) return false;
    // Pauses: between sentences, at commas, and (only when a sentence had to be built from pieces) between pieces.
    var clear = opts.clear !== false, gapStop = clear ? 450 : 250, gapComma = clear ? 220 : 140, gapPiece = 60;
    var ends = E.ends(text), W = whole[lang] || {};
    var pieceOf = function (k) { return E.segment(k, function (x) { return !!L[x] && !W[x]; }); };
    var list = [];
    plan.forEach(function (ph, i) {
      var last = i === plan.length - 1, gap = last ? 0 : ends[i] === false ? gapComma : gapStop;
      ph.forEach(function (k, j) {
        var u = k === CHILD ? opts.childClip || null : url(lang, k);
        if (!u) return;
        // A whole-sentence recording is saved on the device the first time it plays. If it can't load (offline
        // before then), the same words are said from the smaller pieces that are always saved.
        var fb = W[k] ? (pieceOf(k) || []).map(function (x) { return url(lang, x); }).filter(Boolean) : null;
        list.push({ url: u, gap: j === ph.length - 1 ? gap : gapPiece, fb: fb && fb.length ? fb : null });
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
      // Each clip moves on exactly once, whichever of these happens first.
      var moved = false, move = function (wait, useFb) {
        if (moved) return; moved = true;
        if (useFb && it.fb) list.splice.apply(list, [i, 0].concat(it.fb.map(function (u, n) { return { url: u, gap: n === it.fb.length - 1 ? it.gap : gapPiece }; })));
        timer = setTimeout(next, wait);
      };
      cur.onended = function () { move(it.gap / rate, false); };
      cur.onerror = function () { move(0, true); };
      var p = cur.play(); if (p && p.catch) p.catch(function (e) { if (!e || e.name !== "AbortError") move(0, !e || e.name === "NotSupportedError"); });
    }
    playing = { stop: function () { stopped = true; clearTimeout(timer); if (cur) { try { cur.pause(); } catch (e) {} } } };
    next();
    return true;
  };
  E.stop = function () { if (playing) { playing.stop(); playing = null; } };

  CM.emma = E;
})(typeof window !== "undefined" ? window : this);
