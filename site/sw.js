/* Offline support. Bump VERSION whenever you deploy changed files so devices pick them up. */
var VERSION = "cm-2026-10-26-7";
var CORE = [
  "./", "index.html", "play.html", "privacy.html", "cookies.html", "terms.html", "accessibility.html", "support.html", "privacy-kids.html", "summary.html",
  "css/base.css", "css/app.css", "css/home.css", "css/support.css", "css/kids.css", "css/summary.css",
  "js/config.js", "js/common.js", "js/speech.js", "js/emma.js", "js/engine.js", "js/i18n.js", "js/store.js", "js/media.js", "js/photos.js", "js/symbols.js", "js/library.js", "js/cloud.js",
  "js/alphabet.js", "js/alphabet-tab.js",
  "js/ui.js", "js/voice.js", "js/games.js", "js/rewards.js", "js/stories.js", "js/talk.js", "js/classroom.js", "js/backup.js", "js/tools.js", "js/touch.js", "js/app.js", "js/summary.js", "js/childbar.js", "js/setup.js", "js/grown-ga.js",
  "credits.html",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png"
];

// Sing along (singalong/): pages, songs and pictures, so songs play offline. Add new song pictures here.
var SINGALONG = [
  "singalong/", "singalong/index.html", "singalong/player.html", "singalong/songs.js",
  "singalong/shared.js", "singalong/audio-engine.js", "singalong/player.js", "singalong/picker.js",
  "singalong/images/are-you-sleeping.svg", "singalong/images/baa-baa.svg", "singalong/images/happy-birthday.svg", "singalong/images/hickory-dickory.svg",
  "singalong/images/hot-cross-buns.svg", "singalong/images/incy-wincy.svg", "singalong/images/jack-and-jill.svg", "singalong/images/jingle-bells.svg",
  "singalong/images/london-bridge.svg", "singalong/images/mary-lamb.svg", "singalong/images/old-macdonald.svg", "singalong/images/rain-rain.svg",
  "singalong/images/humpty-dumpty.svg", "singalong/images/ring-a-roses.svg", "singalong/images/head-shoulders.svg", "singalong/images/bingo.svg",
  "singalong/images/mulberry-bush.svg", "singalong/images/hush-little-baby.svg", "singalong/images/lavenders-blue.svg",
  "singalong/images/row-boat.svg", "singalong/images/this-old-man.svg", "singalong/images/twinkle.svg", "singalong/images/yankee-doodle.svg"
];

// Alphabet book (alphabet/). Pictures are emoji, so only the page and its script are needed.
var ALPHABET = ["alphabet/", "alphabet/index.html", "alphabet/book.js"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // Symbols for the talk board and schedules, listed by tools/build-symbols.py.
    var syms = fetch("symbols/index.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    // Emma's recordings (tools/audio/build.py). "core" (the Alphabet book and the games) is saved now; the rest
    // (Talk board, stories, schedules, timers) is saved the first time it plays, which keeps the first visit light.
    var clips = fetch("audio/manifest.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
    return Promise.all([syms, clips]).then(function (x) {
      return CORE.concat(SINGALONG, ALPHABET, ["audio/manifest.json"], x[0].map(function (id) { return "symbols/" + id + ".svg"; }), (x[1].core || x[1].files || []).map(function (f) { return "audio/" + f; }));
    });
  }).then(function (all) {
    return caches.open(VERSION).then(function (c) {
    // Add one by one so a single missing file (or a redirect) doesn't break install.
    return Promise.all(all.map(function (u) {
      return fetch(u, { cache: "no-cache" }).then(function (r) { if (r.ok && !r.redirected) return c.put(u, r); }).catch(function () {});
    }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // never touch Supabase or other sites
  if (url.pathname.indexOf("/account") !== -1) return;                  // always fresh, never cached

  // Pages: network first, fall back to cache when offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (r) {
      if (r.ok && !r.redirected && r.type === "basic") { var copy = r.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return r;
    }).catch(function () {
      var alt = url.pathname.replace(/\/$/, "/index") + (/\.html$/.test(url.pathname) ? "" : ".html");
      return caches.match(req, { ignoreSearch: true })
        .then(function (hit) { return hit || caches.match(alt); })
        .then(function (hit) { return hit || caches.match("play.html"); });
    }));
    return;
  }
  // Recordings: Safari asks for sound in byte ranges and won't play a whole file in reply, so answer ranges from the cache.
  if (url.pathname.indexOf("/audio/") !== -1 && req.headers.get("range")) {
    var whole = url.origin + url.pathname;
    e.respondWith(caches.match(whole, { ignoreSearch: true }).then(function (hit) {
      // Not saved yet: fetch the whole file once, save it, then answer the range from it.
      if (!hit) return fetch(whole).then(function (r) {
        if (!r.ok || r.type !== "basic") return fetch(req);
        var copy = r.clone(); return caches.open(VERSION).then(function (c) { return c.put(whole, copy); }).then(function () { return r; });
      }).catch(function () { return fetch(req); });
      return hit;
    }).then(function (hit) {
      if (!hit || hit.status === 206 || !hit.arrayBuffer) return hit;
      return hit.arrayBuffer().then(function (buf) {
        var m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range")) || [], size = buf.byteLength;
        var start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
        if (!m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }
        if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
        return new Response(buf.slice(start, end + 1), { status: 206, headers: {
          "Content-Type": hit.headers.get("Content-Type") || "audio/mpeg", "Content-Length": String(end - start + 1),
          "Content-Range": "bytes " + start + "-" + end + "/" + size, "Accept-Ranges": "bytes" } });
      });
    }));
    return;
  }
  // Files: serve from cache straight away, refresh in the background.
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (r) {
      if (r.ok && r.type === "basic") { var copy = r.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return r;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
