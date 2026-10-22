/*
 * Calm Match — Alphabet book. One letter at a time, with pictures of things that start with it.
 * Tapping a picture says the letter and the word. Nothing plays on its own.
 * Reads (never writes) the active child's settings. The family's own words and photos come from
 * the device library and the device file store; they are added in the grown-ups area of Play.
 */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var STORE_KEY = "calm-match-data", VOICE_KEY = "cm-alpha-voice";
  function $(id) { return document.getElementById(id); }

  // UI words. The Irish ones need checking by an Irish speaker, like the word lists.
  var UI = {
    en: { title: "Alphabet", lede: "Pick a letter. Tap a picture to hear its word.", letters: "Letters", back: "Back", next: "Next",
      voiceOn: "🔊 Read aloud: on", voiceOff: "🔈 Read aloud: off", end: "ends with {l}", endSay: "{w}. {w} ends with {l}.",
      noVoice: "This device has no Irish voice, so words aren't read aloud in Irish.",
      grown: "Grown-ups: you can add your own words and photos, like your child's dog or their favourite cup. Open <a href=\"../play.html\">Play</a>, then the Grown-ups area, then the Alphabet tab. Photos stay on this device.",
      letterOf: "Letter {l}", word: "{w}" },
    ga: { title: "Aibítir", lede: "Roghnaigh litir. Brúigh ar phictiúr chun an focal a chloisteáil.", letters: "Litreacha", back: "Siar", next: "Ar aghaidh",
      voiceOn: "🔊 Léigh os ard: ar siúl", voiceOff: "🔈 Léigh os ard: múchta", end: "", endSay: "{w}.",
      noVoice: "Níl guth Gaeilge ar an ngléas seo, mar sin ní léitear na focail os ard as Gaeilge.",
      grown: "Daoine fásta: is féidir libh bhur bhfocail agus bhur ngrianghraif féin a chur leis. Oscail <a href=\"../play.html\">Súgradh</a>, ansin an chuid do dhaoine fásta, ansin an cluaisín Aibítir. Fanann grianghraif ar an ngléas seo.",
      letterOf: "Litir {l}", word: "{w}" }
  };
  var fill = function (s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); };

  /* ---------- the child's settings (read only) ---------- */
  function settings() {
    try { var db = JSON.parse(CM.safeGet(STORE_KEY) || "null"), p = db && db.profiles && db.profiles[db.active]; return (p && p.settings) || {}; }
    catch (e) { return {}; }
  }
  var S = settings();
  if (S.contrast) document.body.setAttribute("data-contrast", "high");
  if (S.calm) document.body.setAttribute("data-calm", "on");
  if (S.big) document.body.setAttribute("data-big", "on");

  var q = new URLSearchParams(location.search);
  var lang = ["en", "ga"].indexOf(q.get("lang")) >= 0 ? q.get("lang") : (S.lang === "ga" ? "ga" : "en");
  var letter = (q.get("letter") || "").toUpperCase();
  if (!CM.alpha.hasLetter(lang, letter)) letter = "A";
  var voiceOn = CM.safeGet(VOICE_KEY) !== "off";

  /* ---------- speech: on-device voices only, as in the games ---------- */
  var voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if ("speechSynthesis" in window) { loadVoices(); try { speechSynthesis.onvoiceschanged = function () { loadVoices(); renderVoice(); }; } catch (e) {} }
  function localVoice(re) {
    var list = voices.filter(function (v) { return v.localService !== false && re.test(v.lang); });
    return list.find(function (v) { return /enhanced|premium|natural|neural/i.test(v.name); }) || list[0] || null;
  }
  function voiceFor(l) { return l === "ga" ? localVoice(/^ga/i) : (localVoice(/^en-(IE|GB)/i) || localVoice(/^en/i)); }
  var playing = null;
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} if (playing) { try { playing.pause(); } catch (e) {} playing = null; } }
  // Say short phrases one after another, slowly, like "clear speech" in the games.
  function say(parts) {
    if (!("speechSynthesis" in window)) return;
    var v = voiceFor(lang);
    if (lang === "ga" && !v) return; // an English voice would mispronounce Irish
    var rate = Math.min(1, Math.max(0.5, +S.rate || 0.75)) * 0.92;
    try {
      speechSynthesis.cancel();
      parts.forEach(function (p) {
        var u = new SpeechSynthesisUtterance(p); u.rate = rate; u.pitch = 1; u.lang = lang === "ga" ? "ga-IE" : "en-IE"; if (v) u.voice = v;
        speechSynthesis.speak(u);
      });
    } catch (e) {}
  }
  function speakWord(e) {
    if (!voiceOn) return;
    hush();
    // A grown-up's own recording of this word plays instead of the device voice.
    var rk = CM.alpha.recKey(e);
    if (CM.media.has(rk)) { try { playing = new Audio(CM.media.url(rk)); playing.play().catch(function () {}); return; } catch (x) {} }
    var t = UI[lang];
    say(e.end ? [fill(t.endSay, { w: e.word, l: e.letter.toLowerCase() })] : [e.letter, e.word]);
  }

  /* ---------- drawing ---------- */
  function render(focusPicker) {
    var t = UI[lang], letters = CM.alpha.letters(lang), i = letters.indexOf(letter);
    document.documentElement.lang = lang;
    document.title = t.title + " · Calm Match";
    $("h1").textContent = t.title;
    $("lede").textContent = t.lede;
    $("lettersNav").setAttribute("aria-label", t.letters);
    var lb = document.querySelectorAll("#langSeg button");
    for (var k = 0; k < lb.length; k++) lb[k].setAttribute("aria-pressed", String(lb[k].getAttribute("data-lang") === lang));

    $("letters").innerHTML = letters.map(function (L) {
      return '<li><button type="button" data-l="' + L + '" aria-label="' + esc(fill(t.letterOf, { l: L })) + '"' + (L === letter ? ' aria-current="true"' : "") + ">" + L + "</button></li>";
    }).join("");
    if (focusPicker) { var fb = document.querySelector('#letters [data-l="' + letter + '"]'); if (fb) fb.focus(); }

    $("big").innerHTML = '<span aria-hidden="true">' + letter + '<span class="lo">' + letter.toLowerCase() + "</span></span>" +
      '<span class="vh">' + esc(fill(t.letterOf, { l: letter })) + "</span>";
    var prev = letters[i - 1], next = letters[i + 1];
    $("prev").disabled = !prev; $("next").disabled = !next;
    $("prevTxt").textContent = prev ? t.back + " · " + prev : t.back;
    $("nextTxt").textContent = next ? next + " · " + t.next : t.next;
    $("prev").setAttribute("aria-label", prev ? t.back + ": " + fill(t.letterOf, { l: prev }) : t.back);
    $("next").setAttribute("aria-label", next ? t.next + ": " + fill(t.letterOf, { l: next }) : t.next);

    var words = CM.alpha.words(lang, letter);
    $("words").innerHTML = words.map(function (e, n) {
      return '<li><button type="button" class="ab-card" data-n="' + n + '" aria-label="' + esc(e.word) + '">' +
        '<span class="ab-pic" aria-hidden="true">' + CM.alpha.picHtml(e) + "</span>" +
        '<span class="ab-word" aria-hidden="true">' + CM.alpha.markWord(e) + "</span>" +
        (e.end && t.end ? '<span class="ab-tag" aria-hidden="true">' + esc(fill(t.end, { l: e.letter.toLowerCase() })) + "</span>" : "") +
        "</button></li>";
    }).join("");
    $("words").onclick = function (ev) {
      var b = ev.target.closest(".ab-card"); if (!b) return;
      document.querySelectorAll(".ab-card.said").forEach(function (x) { x.classList.remove("said"); });
      b.classList.add("said");
      speakWord(words[+b.dataset.n]);
    };
    $("grownNote").innerHTML = t.grown;
    renderVoice();
    try { history.replaceState(null, "", "?letter=" + letter + "&lang=" + lang); } catch (e) {}
  }
  function renderVoice() {
    var t = UI[lang];
    $("voice").textContent = voiceOn ? t.voiceOn : t.voiceOff;
    $("voice").setAttribute("aria-pressed", String(voiceOn));
    var missing = lang === "ga" && !voiceFor("ga");
    $("voiceNote").hidden = !(voiceOn && missing);
    $("voiceNote").textContent = t.noVoice;
  }
  function go(L, focusPicker) { if (!CM.alpha.hasLetter(lang, L) || L === letter) return; hush(); letter = L; render(focusPicker); }
  function step(d) { var ls = CM.alpha.letters(lang), i = ls.indexOf(letter) + d; if (ls[i]) go(ls[i]); }

  /* ---------- controls ---------- */
  $("letters").addEventListener("click", function (e) { var b = e.target.closest("button[data-l]"); if (b) go(b.dataset.l, true); });
  $("prev").addEventListener("click", function () { step(-1); });
  $("next").addEventListener("click", function () { step(1); });
  $("voice").addEventListener("click", function () { voiceOn = !voiceOn; CM.safeSet(VOICE_KEY, voiceOn ? "on" : "off"); if (!voiceOn) hush(); renderVoice(); });
  $("langSeg").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-lang]"); if (!b || b.dataset.lang === lang) return;
    hush(); lang = b.dataset.lang;
    if (!CM.alpha.hasLetter(lang, letter)) letter = "A"; // J, K, Q, V, W, X, Y, Z have no Irish page
    render();
  });
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName)) return;
    if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
    else if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
  });
  // If a photo can't be shown, show the emoji instead.
  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG" && el.dataset && el.dataset.fb) el.replaceWith(document.createTextNode(el.dataset.fb));
  }, true);
  window.addEventListener("pagehide", hush);
  try { $("year").textContent = new Date().getFullYear(); } catch (e) {}

  render();
  // Family photos load from the device a moment later.
  CM.media.ready.then(function () { render(); });
})();
