/*
 * Calm Match — Sing Along: shared helpers for the song picker and the player.
 * Reads (never writes) the active child's settings from the games' own storage.
 */
(function () {
  'use strict';

  var STORE_KEY = 'calm-match-data';   // see js/store.js
  var LANGS = ['en', 'ga'];
  var SA = window.SA = { LANGS: LANGS, STORE_KEY: STORE_KEY };

  SA.UI = {
    en: {
      singAlong: 'Sing along', lede: 'Pick a song. The words light up as the tune plays, so your child can sing along at their own pace.',
      all: 'All', calm: 'Calm', lively: 'Lively', songs: 'Songs', none: 'No songs here yet.',
      play: 'Play', pause: 'Pause', restart: 'Start again', loop: 'Repeat',
      speed: 'Speed', slower: 'Slower', faster: 'Faster', back: 'All songs',
      missing: 'Song not found.', lang: 'Language', verse: 'Verse'
    },
    ga: {
      singAlong: 'Canaimis le chéile', lede: 'Roghnaigh amhrán. Lasann na focail de réir mar a sheinntear an fonn, ionas gur féidir le do pháiste canadh ar a luas féin.',
      all: 'Gach ceann', calm: 'Ciúin', lively: 'Bríomhar', songs: 'Amhráin', none: 'Níl amhráin anseo fós.',
      play: 'Seinn', pause: 'Sos', restart: 'Tosaigh arís', loop: 'Arís is arís',
      speed: 'Luas', slower: 'Níos moille', faster: 'Níos tapúla', back: 'Na hamhráin go léir',
      missing: 'Níor aimsíodh an t-amhrán.', lang: 'Teanga', verse: 'Véarsa'
    }
  };

  // The active child's settings, or null (no profile yet, or storage blocked).
  SA.settings = function (raw) {
    try {
      var db = JSON.parse(raw != null ? raw : localStorage.getItem(STORE_KEY) || 'null');
      var prof = db && db.profiles && db.profiles[db.active];
      return (prof && prof.settings) || null;
    } catch (e) { return null; }
  };

  SA.storedLang = function (raw) {
    var s = SA.settings(raw);
    return s && LANGS.indexOf(s.lang) > -1 ? s.lang : null;
  };

  // ?lang= in the address wins (links between the picker and the player carry it),
  // then the child's games language, then English.
  SA.readLang = function () {
    var p = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(p) > -1) return p;
    return SA.storedLang() || 'en';
  };

  // Follow the child's sensory settings: high contrast, calm (no motion), bigger buttons.
  SA.applySettings = function () {
    var s = SA.settings() || {};
    if (s.contrast) document.body.setAttribute('data-contrast', 'high');
    if (s.calm) document.body.setAttribute('data-calm', 'on');
    if (s.big) document.body.setAttribute('data-big', 'on');
  };

  SA.pick = function (v, lang) {
    if (v == null) return '';
    return typeof v === 'string' ? v : (v[lang] || v.en);
  };

  /*
   * Lyrics: one string per line. Split words into syllables with "|"; each
   * syllable takes the next note. A "_" (on its own, or as a syllable) holds
   * the previous word over one more note and shows nothing.
   * Returns { lines: [[{text}]], syl: [{line, word}] }.
   */
  SA.parse = function (lines) {
    var syl = [], model = [];
    (lines || []).forEach(function (line, li) {
      var words = [];
      line.split(/\s+/).filter(Boolean).forEach(function (token) {
        var parts = token.split('|');
        var text = parts.filter(function (p) { return p !== '_'; }).join('');
        if (text) words.push({ text: text });
        parts.forEach(function (p) {
          var wi = p === '_' ? -1 : words.length - 1;
          if (wi < 0) {   // hold: belongs to the last word sung
            var last = syl[syl.length - 1];
            syl.push(last ? { line: last.line, word: last.word } : { line: li, word: 0 });
          } else {
            syl.push({ line: li, word: wi });
          }
        });
      });
      model.push(words);
    });
    return { lines: model, syl: syl };
  };

  // A song's notes, repeated once per verse. Verses = syllables ÷ notes in one verse.
  SA.build = function (song) {
    var parsed = {}, verses = 0, problems = [];
    LANGS.forEach(function (l) {
      if (!song.lyrics || !song.lyrics[l]) return;
      var p = parsed[l] = SA.parse(song.lyrics[l]);
      var v = p.syl.length / song.notes.length;
      if (v !== Math.floor(v) || v < 1) {
        problems.push(l + ': ' + p.syl.length + ' syllables for ' + song.notes.length + ' notes per verse');
      } else if (verses && v !== verses) {
        problems.push(l + ': ' + v + ' verses, other language has ' + verses);
      } else {
        verses = v;
      }
    });
    verses = verses || 1;
    var notes = [];
    for (var i = 0; i < verses; i++) notes = notes.concat(song.notes);
    if (problems.length && window.console) console.warn('[Sing Along] "' + song.id + '": ' + problems.join('; '));
    return { parsed: parsed, notes: notes, verses: verses, problems: problems };
  };
})();
