/*
 * Calm Match — Sing Along player
 * Loads one song (player.html?song=<id>), shows its illustration and lyrics,
 * and highlights each word as the melody reaches it.
 */
(function () {
  'use strict';

  var SA = window.SA, UI = SA.UI;
  function $(id) { return document.getElementById(id); }

  SA.applySettings();

  var params = new URLSearchParams(location.search);
  var songs = window.CALM_SONGS || [];
  var wanted = params.get('song');
  var song = songs.filter(function (s) { return s.id === wanted; })[0] || (wanted ? null : songs[0]);
  var lang = SA.readLang();

  if (!song) {
    $('main').innerHTML = '<p class="missing">' + UI[lang].missing + '</p>';
    $('title').textContent = '';
    return;
  }

  var built = SA.build(song);
  var parsed = built.parsed;
  var linesPerVerse = {};   // lang -> how many lyric lines make one verse
  SA.LANGS.forEach(function (l) {
    if (parsed[l]) linesPerVerse[l] = parsed[l].lines.length / built.verses;
  });
  if (!parsed[lang]) lang = 'en';

  var engine = new SingAlongEngine({
    bpm: song.bpm,
    onNote: onNote,
    onEnd: onEnd,
    onStateChange: renderState
  });
  engine.load(built.notes);

  var cur = -1;        // note sounding now (-1 = idle)
  var shownLine = -1;

  function onNote(i) {
    cur = i;
    var s = parsed[lang].syl[i];
    if (!s) return;
    if (s.line !== shownLine) showLine(s.line);
    mark(i);
  }

  function onEnd() {
    cur = -1;
    setTimeout(function () {
      if (engine.state === 'stopped' && cur === -1) { showLine(0); mark(-1); }
    }, 1500);
  }

  // ---- rendering ----
  function fillLine(el, li) {
    el.textContent = '';
    var words = parsed[lang].lines[li];
    if (!words) return;
    words.forEach(function (w, wi) {
      if (wi) el.appendChild(document.createTextNode(' '));
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w.text;
      el.appendChild(span);
    });
  }

  function showLine(li) {
    shownLine = li;
    var total = parsed[lang].lines.length;
    fillLine($('lineNow'), li);
    var next = li + 1 < total ? li + 1 : (engine.loop ? 0 : -1);
    if (next >= 0) fillLine($('lineNext'), next); else $('lineNext').textContent = '';
    var per = linesPerVerse[lang];
    $('verse').textContent = built.verses > 1 && per ? UI[lang].verse + ' ' + (Math.floor(li / per) + 1) + ' / ' + built.verses : '';
  }

  function mark(i) {
    var s = i >= 0 ? parsed[lang].syl[i] : null;
    var spans = $('lineNow').querySelectorAll('.w');
    for (var wi = 0; wi < spans.length; wi++) {
      spans[wi].classList.toggle('on', !!s && wi === s.word);
      spans[wi].classList.toggle('sung', !!s && wi < s.word);
    }
  }

  function applyLanguage() {
    var t = UI[lang];
    document.documentElement.lang = lang;
    $('title').textContent = SA.pick(song.title, lang);
    document.title = SA.pick(song.title, lang) + ' · Calm Match';
    var art = $('art'), src = 'images/' + SA.pick(song.image, lang);
    if (art.getAttribute('src') !== src) art.setAttribute('src', src);
    art.alt = SA.pick(song.alt, lang);
    var back = $('back');
    back.setAttribute('aria-label', t.back);
    back.setAttribute('href', './?lang=' + lang);
    $('restart').setAttribute('aria-label', t.restart);
    $('loop').setAttribute('aria-label', t.loop);
    $('speedLabel').textContent = t.speed;
    $('slower').textContent = t.slower;
    $('faster').textContent = t.faster;
    var btns = document.querySelectorAll('.lang button');
    for (var b = 0; b < btns.length; b++) {
      btns[b].setAttribute('aria-pressed', String(btns[b].getAttribute('data-lang') === lang));
    }
    renderState();
  }

  function renderState() {
    var playing = engine.state === 'playing';
    $('play').classList.toggle('is-playing', playing);
    $('play').setAttribute('aria-label', playing ? UI[lang].pause : UI[lang].play);
  }

  function setLang(l) {
    if (!parsed[l] || l === lang) return;
    lang = l;
    applyLanguage();
    // Same melody, same syllable count: keep playing and show the same spot.
    var s = cur >= 0 ? parsed[lang].syl[cur] : null;
    showLine(s ? s.line : 0);
    mark(cur);
  }

  // ---- controls ----
  $('play').addEventListener('click', function () { engine.toggle(); });

  $('restart').addEventListener('click', function () {
    cur = -1;
    showLine(0);
    mark(-1);
    engine.restart();
  });

  $('loop').addEventListener('click', function () {
    var on = !engine.loop;
    engine.setLoop(on);
    this.setAttribute('aria-pressed', String(on));
    if (shownLine >= 0) { showLine(shownLine); mark(cur); }   // refresh the "next line" preview
  });

  $('tempo').addEventListener('input', function () {
    var pct = +this.value;
    engine.setTempo(song.bpm * pct / 100);
    this.setAttribute('aria-valuetext', pct + '%');
  });

  var langBtns = document.querySelectorAll('.lang button');
  for (var i = 0; i < langBtns.length; i++) {
    langBtns[i].addEventListener('click', function () { setLang(this.getAttribute('data-lang')); });
  }

  // Follow the Grown-ups language setting if it changes in another tab.
  window.addEventListener('storage', function (e) {
    if (e.key !== SA.STORE_KEY) return;
    var l = SA.storedLang(e.newValue || 'null');
    if (l) setLang(l);
  });

  // Pause when the tab is hidden, so music never carries on unseen.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) engine.pause();
  });

  // Space bar plays/pauses when no control has focus.
  document.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.code === 'Space') && e.target === document.body) {
      e.preventDefault();
      engine.toggle();
    }
  });

  // Load both languages' illustrations now, so switching makes no request mid-song.
  SA.LANGS.forEach(function (l) { new Image().src = 'images/' + SA.pick(song.image, l); });

  applyLanguage();
  showLine(0);
})();
