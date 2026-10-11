/*
 * Calm Match — Sing Along player
 * Loads one song (player.html?song=<id>), shows its illustration and lyrics,
 * and highlights each word as the melody reaches it.
 */
(function () {
  'use strict';

  // Calm Match keeps each child's settings in one record (js/store.js). The games'
  // language is profiles[active].settings.lang, set in the Grown-ups area.
  var STORE_KEY = 'calm-match-data';
  var LANGS = ['en', 'ga'];

  var UI = {
    en: { play: 'Play', pause: 'Pause', restart: 'Start again', loop: 'Repeat',
          speed: 'Speed', slower: 'Slower', faster: 'Faster', back: 'Back to the games',
          missing: 'Song not found.' },
    ga: { play: 'Seinn', pause: 'Sos', restart: 'Tosaigh arís', loop: 'Arís is arís',
          speed: 'Luas', slower: 'Níos moille', faster: 'Níos tapúla', back: 'Ar ais chuig na cluichí',
          missing: 'Níor aimsíodh an t-amhrán.' }
  };

  function $(id) { return document.getElementById(id); }

  var params = new URLSearchParams(location.search);
  var songs = window.CALM_SONGS || [];
  var wanted = params.get('song');
  var song = songs.filter(function (s) { return s.id === wanted; })[0] || (wanted ? null : songs[0]);

  var lang = readLang();
  if (!song) {
    $('main').innerHTML = '<p class="missing">' + UI[lang].missing + '</p>';
    $('title').textContent = '';
    return;
  }

  // ---- lyrics: split "Twin|kle twin|kle" into words and syllables ----
  var parsed = {};
  LANGS.forEach(function (l) {
    if (!song.lyrics[l]) return;
    parsed[l] = parseLyrics(song.lyrics[l]);
    if (parsed[l].syl.length !== song.notes.length) {
      console.warn('[Sing Along] "' + song.id + '" (' + l + ') has ' + parsed[l].syl.length +
        ' syllables but ' + song.notes.length + ' notes — the highlight will drift.');
    }
  });
  if (!parsed[lang]) lang = 'en';

  function parseLyrics(lines) {
    var syl = [];
    var model = lines.map(function (line, li) {
      return line.split(/\s+/).filter(Boolean).map(function (word, wi) {
        var parts = word.split('|');
        parts.forEach(function () { syl.push({ line: li, word: wi }); });
        return { text: parts.join('') };
      });
    });
    return { lines: model, syl: syl };
  }

  // ---- engine ----
  var engine = new SingAlongEngine({
    bpm: song.bpm,
    onNote: onNote,
    onEnd: onEnd,
    onStateChange: renderState
  });
  engine.load(song.notes);

  var cur = -1;        // index of the note sounding now (-1 = idle)
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
  }

  function mark(i) {
    var s = i >= 0 ? parsed[lang].syl[i] : null;
    var spans = $('lineNow').querySelectorAll('.w');
    for (var wi = 0; wi < spans.length; wi++) {
      spans[wi].classList.toggle('on', !!s && wi === s.word);
      spans[wi].classList.toggle('sung', !!s && wi < s.word);
    }
  }

  function pick(v) { return typeof v === 'string' ? v : (v[lang] || v.en); }

  function applyLanguage() {
    var t = UI[lang];
    document.documentElement.lang = lang;
    $('title').textContent = pick(song.title);
    document.title = pick(song.title) + ' · Calm Match';
    var art = $('art'), src = 'images/' + pick(song.image);
    if (art.getAttribute('src') !== src) art.setAttribute('src', src);
    art.alt = song.alt ? pick(song.alt) : '';
    $('back').setAttribute('aria-label', t.back);
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
    // Same melody, same syllable count: keep playing and re-show the current spot.
    var s = cur >= 0 ? parsed[lang].syl[cur] : null;
    showLine(s ? s.line : 0);
    mark(cur);
  }

  function readLang() {
    var p = params.get('lang');
    if (LANGS.indexOf(p) > -1) return p;
    return storedLang() || 'en';
  }

  // Read-only: the player never writes to the child's profile.
  function storedLang(raw) {
    try {
      var db = JSON.parse(raw != null ? raw : localStorage.getItem(STORE_KEY) || 'null');
      var prof = db && db.profiles && db.profiles[db.active];
      var l = prof && prof.settings && prof.settings.lang;
      return LANGS.indexOf(l) > -1 ? l : null;
    } catch (e) { return null; }   // storage blocked or unreadable: fall back to English
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
    if (shownLine >= 0) { showLine(shownLine); mark(cur); }   // refresh "next line" preview
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
    if (e.key !== STORE_KEY) return;
    var l = storedLang(e.newValue || 'null');
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

  // Preload both languages' illustrations so switching makes no request mid-song.
  LANGS.forEach(function (l) {
    var img = typeof song.image === 'string' ? song.image : song.image[l];
    if (img) new Image().src = 'images/' + img;
  });

  applyLanguage();
  showLine(0);
})();
