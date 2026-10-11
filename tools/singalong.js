#!/usr/bin/env node
/*
 * Calm Match — Sing Along helper.
 *
 *   node tools/singalong.js check    Check every song: syllables fit the notes, in
 *                                    both languages; images exist; ids are unique.
 *   node tools/singalong.js review   Print a Markdown sheet of every song's Irish
 *                                    words beside the English, for a native speaker
 *                                    to check (saved as docs/singalong-irish-lyrics.md).
 *
 * Uses the same parsing code as the site (site/singalong/shared.js).
 */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var dir = path.join(__dirname, '..', 'site', 'singalong');
var sandbox = { window: {}, console: { warn: function () {} } };
sandbox.window.console = sandbox.console;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, 'songs.js'), 'utf8'), sandbox);
vm.runInContext('var location = { search: "" }; var URLSearchParams = function () { return { get: function () { return null; } }; };', sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, 'shared.js'), 'utf8').replace(/window\.SA = /, 'window.SA = '), sandbox);
var SA = sandbox.window.SA;
var songs = sandbox.window.CALM_SONGS;

var mode = process.argv[2] || 'check';

if (mode === 'check') {
  var bad = 0, ids = {};
  var sw = fs.readFileSync(path.join(dir, '..', 'sw.js'), 'utf8');
  songs.forEach(function (s) {
    var b = SA.build(s), msgs = b.problems.slice();
    if (ids[s.id]) msgs.push('duplicate id');
    ids[s.id] = true;
    ['en', 'ga'].forEach(function (l) {
      if (!s.lyrics[l]) msgs.push('no ' + l + ' lyrics');
      var img = SA.pick(s.image, l);
      if (!fs.existsSync(path.join(dir, 'images', img)) && msgs.indexOf('missing image ' + img) < 0) msgs.push('missing image ' + img);
      var swMsg = 'add "singalong/images/' + img + '" to SINGALONG in site/sw.js (offline)';
      if (sw.indexOf('"singalong/images/' + img + '"') < 0 && msgs.indexOf(swMsg) < 0) msgs.push(swMsg);
      if (!s.title || !s.title[l]) msgs.push('no ' + l + ' title');
      if (!s.alt || !s.alt[l]) msgs.push('no ' + l + ' alt text');
    });
    if (['calm', 'lively'].indexOf(s.energy) < 0) msgs.push('energy must be calm or lively');
    s.notes.forEach(function (n, i) {
      if (!(n[1] > 0)) msgs.push('note ' + i + ' has no length');
      if (n[0] !== 'rest' && !/^[A-G](#|b)?\d$/.test(n[0])) msgs.push('note ' + i + ' "' + n[0] + '" is not a note name');
    });
    var secs = 0;
    s.notes.forEach(function (n) { secs += n[1] * 60 / s.bpm; });
    var line = (msgs.length ? 'PROBLEM ' : 'ok      ') + s.id + '  (' + s.notes.length + ' notes x ' + b.verses +
      ' verse' + (b.verses > 1 ? 's' : '') + ', ' + Math.round(secs * b.verses) + 's)';
    console.log(line + (msgs.length ? '\n         ' + msgs.join('\n         ') : ''));
    if (msgs.length) bad++;
  });
  console.log('\n' + songs.length + ' songs, ' + bad + ' with problems.');
  process.exit(bad ? 1 : 0);
}

if (mode === 'review') {
  var out = [];
  out.push('# Sing along: Irish lyrics for review', '');
  out.push('Every Irish lyric in the sing-along library, beside the English song whose tune it shares. ' +
    'The Irish words were written for Calm Match to fit each melody syllable for syllable, so a change ' +
    'should keep the same number of syllables per line (or tell the developer, who can adjust the tune).', '');
  out.push('Generated from `site/singalong/songs.js` by `node tools/singalong.js review`. Edit the song file, not this page.', '');
  songs.forEach(function (s, i) {
    var clean = function (lines) {
      return lines.map(function (l) {
        return l.split(/\s+/).filter(function (w) { return w !== '_'; }).map(function (w) {
          return w.split('|').filter(function (p) { return p !== '_'; }).join('');
        }).join(' ');
      });
    };
    var count = function (line) { return SA.parse([line]).syl.length; };
    out.push('## ' + (i + 1) + '. ' + s.title.ga + ' (' + s.title.en + ')', '');
    out.push('| English | Gaeilge | Syllables |', '|---|---|---|');
    var en = clean(s.lyrics.en), ga = clean(s.lyrics.ga), n = Math.max(en.length, ga.length);
    for (var j = 0; j < n; j++) {
      var c1 = s.lyrics.en[j] ? count(s.lyrics.en[j]) : '', c2 = s.lyrics.ga[j] ? count(s.lyrics.ga[j]) : '';
      out.push('| ' + (en[j] || '') + ' | ' + (ga[j] || '') + ' | ' + c1 + (c1 !== c2 ? ' / ' + c2 : '') + ' |');
    }
    out.push('');
    var src = fs.readFileSync(path.join(dir, 'songs.js'), 'utf8');
    var at = src.indexOf("id: '" + s.id + "'");
    var block = at >= 0 ? src.slice(at, src.indexOf('\n  }', at)) : '';
    var gaAt = block.indexOf('ga: [');
    var notes = [];
    if (gaAt > 0) {
      var before = block.slice(0, gaAt).split('\n');
      before.pop();   // the indentation in front of "ga: ["
      for (var k = before.length - 1; k >= 0 && /^\s*\/\//.test(before[k]); k--) notes.unshift(before[k].replace(/^\s*\/\/\s?/, ''));
    }
    if (notes.length) out.push('Meaning: ' + notes.join(' '), '');
  });
  process.stdout.write(out.join('\n') + '\n');
}
