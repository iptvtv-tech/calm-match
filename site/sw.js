/* Offline support. Bump VERSION whenever you deploy changed files so devices pick them up. */
var VERSION = "cm-2026-10-10-8";
var CORE = [
  "./", "index.html", "play.html", "privacy.html", "cookies.html", "terms.html", "accessibility.html", "support.html", "privacy-kids.html",
  "css/base.css", "css/app.css", "css/home.css", "css/support.css", "css/kids.css",
  "js/config.js", "js/common.js", "js/engine.js", "js/i18n.js", "js/store.js", "js/photos.js", "js/cloud.js", "js/tools.js", "js/app.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // Add one by one so a single missing file (or a redirect) doesn't break install.
    return Promise.all(CORE.map(function (u) {
      return fetch(u, { cache: "no-cache" }).then(function (r) { if (r.ok && !r.redirected) return c.put(u, r); }).catch(function () {});
    }));
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
  // Files: serve from cache straight away, refresh in the background.
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (r) {
      if (r.ok && r.type === "basic") { var copy = r.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return r;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
