/*
 * Calm Match — Sing Along song picker. Lists every song in songs.js.
 */
(function () {
  'use strict';

  var SA = window.SA, UI = SA.UI;
  var songs = window.CALM_SONGS || [];
  var lang = SA.readLang();
  var filter = 'all';
  function $(id) { return document.getElementById(id); }

  SA.applySettings();
  try { $('year').textContent = new Date().getFullYear(); } catch (e) {}

  function render() {
    var t = UI[lang];
    document.documentElement.lang = lang;
    document.title = t.singAlong + ' · Calm Match';
    $('h1').textContent = t.singAlong;
    $('lede').textContent = t.lede;
    $('filterSeg').setAttribute('aria-label', t.songs);
    setPressed('#langSeg button', 'data-lang', lang);
    setPressed('#filterSeg button', 'data-f', filter);
    var fb = document.querySelectorAll('#filterSeg button');
    for (var i = 0; i < fb.length; i++) fb[i].textContent = t[fb[i].getAttribute('data-f')];

    var grid = $('grid');
    grid.textContent = '';
    var shown = songs.filter(function (s) { return filter === 'all' || s.energy === filter; });
    shown.forEach(function (s) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'card';
      a.href = 'player.html?song=' + encodeURIComponent(s.id) + '&lang=' + lang;
      var img = document.createElement('img');
      img.src = 'images/' + SA.pick(s.image, lang);
      img.alt = '';
      img.width = 400; img.height = 300;
      img.loading = 'lazy';
      var meta = document.createElement('span');
      meta.className = 'meta';
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = SA.pick(s.title, lang);
      var tag = document.createElement('span');
      tag.className = 'tag ' + s.energy;
      tag.textContent = t[s.energy] || '';
      meta.appendChild(name);
      meta.appendChild(tag);
      a.appendChild(img);
      a.appendChild(meta);
      li.appendChild(a);
      grid.appendChild(li);
    });
    $('empty').hidden = shown.length > 0;
    $('empty').textContent = t.none;
  }

  function setPressed(sel, attr, val) {
    var b = document.querySelectorAll(sel);
    for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', String(b[i].getAttribute(attr) === val));
  }

  $('langSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { lang = b.getAttribute('data-lang'); render(); }
  });
  $('filterSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { filter = b.getAttribute('data-f'); render(); }
  });
  window.addEventListener('storage', function (e) {
    if (e.key !== SA.STORE_KEY) return;
    var l = SA.storedLang(e.newValue || 'null');
    if (l && l !== lang) { lang = l; render(); }
  });

  render();
})();
