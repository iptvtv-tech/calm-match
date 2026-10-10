/* Device file store for pictures, recordings and videos (IndexedDB). Nothing here is ever uploaded.
   Small pictures are kept as text (data: URLs); recordings and videos as Blobs.
   Everything is read into memory at start, so pages can show pictures straight away.
   If the browser blocks IndexedDB (some private windows), files are kept in memory for this visit only. */
(function () {
  "use strict";
  var CM = window.CM, DBN = "calm-match-media", STORE = "files";
  var mem = {}, urls = {}, idb = null, ok = false;

  function open() {
    return new Promise(function (resolve) {
      if (!("indexedDB" in window)) return resolve(null);
      var req;
      try { req = indexedDB.open(DBN, 1); } catch (e) { return resolve(null); }
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
      req.onblocked = function () { resolve(null); };
    });
  }
  function tx(mode) { return idb.transaction(STORE, mode).objectStore(STORE); }
  function done(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }

  CM.media = {
    // Resolves once every file is in memory. Always resolves, even without IndexedDB.
    ready: open().then(function (d) {
      idb = d; ok = !!d;
      if (!d) return;
      return new Promise(function (resolve) {
        try {
          var cur = tx("readonly").openCursor();
          cur.onsuccess = function () { var c = cur.result; if (c) { mem[c.key] = c.value; c.continue(); } else resolve(); };
          cur.onerror = function () { resolve(); };
        } catch (e) { resolve(); }
      });
    }),
    saved: function () { return ok; },
    has: function (k) { return mem[k] != null; },
    get: function (k) { return mem[k] == null ? null : mem[k]; },
    // A URL an <img>, <audio> or <video> can use: data: URL text as it is, Blobs as a blob: URL.
    url: function (k) {
      var v = mem[k];
      if (v == null) return null;
      if (typeof v === "string") return v;
      if (!urls[k]) urls[k] = URL.createObjectURL(v);
      return urls[k];
    },
    keys: function (prefix) { return Object.keys(mem).filter(function (k) { return !prefix || k.indexOf(prefix) === 0; }); },
    put: function (k, v) {
      var before = mem[k];
      mem[k] = v; if (urls[k]) { URL.revokeObjectURL(urls[k]); delete urls[k]; }
      if (!idb) return Promise.resolve(false);
      return done(tx("readwrite").put(v, k)).then(function () { return true; }, function (e) {
        if (before == null) delete mem[k]; else mem[k] = before;
        throw new Error(e && e.name === "QuotaExceededError" ? "This device is out of space. Remove some photos, recordings or videos first." : "Couldn't save on this device.");
      });
    },
    del: function (k) {
      delete mem[k]; if (urls[k]) { URL.revokeObjectURL(urls[k]); delete urls[k]; }
      if (!idb) return Promise.resolve();
      return done(tx("readwrite").delete(k)).catch(function () {});
    },
    delPrefix: function (prefix) { return Promise.all(this.keys(prefix).map(this.del.bind(this))); },
    clear: function () {
      Object.keys(urls).forEach(function (k) { URL.revokeObjectURL(urls[k]); });
      mem = {}; urls = {};
      if (!idb) return Promise.resolve();
      return done(tx("readwrite").clear()).catch(function () {});
    },
    // Bytes used by Calm Match files (roughly), and what the browser says is free.
    usage: function () {
      var n = 0; Object.keys(mem).forEach(function (k) { var v = mem[k]; n += typeof v === "string" ? v.length : (v && v.size) || 0; });
      var est = navigator.storage && navigator.storage.estimate ? navigator.storage.estimate().catch(function () { return {}; }) : Promise.resolve({});
      return est.then(function (e) { return { used: n, quota: e.quota || 0, total: e.usage || 0 }; });
    },
    // Ask the browser not to clear these files when space runs low. Harmless if refused.
    keep: function () {
      try { if (navigator.storage && navigator.storage.persist) return navigator.storage.persist().catch(function () { return false; }); } catch (e) {}
      return Promise.resolve(false);
    }
  };

  // Shrink a chosen picture to a square JPEG (data: URL). Used for photos, schedule steps, stories and talk words.
  CM.shrinkImage = function (file, size, square) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("Please choose a photo file."));
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(w, h), c = document.createElement("canvas"), sx = 0, sy = 0, sw = w, sh = h;
        if (square !== false) { sx = (w - s) / 2; sy = (h - s) / 2; sw = sh = s; c.width = c.height = Math.min(size, s); }
        else { var k = Math.min(1, size / Math.max(w, h)); c.width = Math.round(w * k); c.height = Math.round(h * k); }
        c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file couldn't be opened as a photo.")); };
      img.src = url;
    });
  };
  CM.uid = function (p) { return (p || "x") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
})();
