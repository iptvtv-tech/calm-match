/* Backup file: everything Calm Match keeps on this device, in one file the parent saves themselves.
   Used to move to a new tablet, or to take a child's set-up between home and school.
   The file never goes anywhere by itself. */
(function () {
  "use strict";
  var CM = window.CM, KIND = "calm-match-backup";

  function blobToData(b) {
    return new Promise(function (resolve) { var r = new FileReader(); r.onload = function () { resolve(r.result); }; r.onerror = function () { resolve(null); }; r.readAsDataURL(b); });
  }
  function dataToBlob(s) {
    var m = String(s).match(/^data:([^,]*?)(;base64)?,([\s\S]*)$/); if (!m) return null;
    var bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]), a = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return new Blob([a], { type: m[1] || "application/octet-stream" });
  }

  CM.backup = {
    // onlyId: a child's id to save just that child (their schedules and board come too; pictures, stories and recordings are shared).
    make: function (onlyId) {
      var db = CM.store.exportAll(), lib = JSON.parse(JSON.stringify(CM.lib.data()));
      if (onlyId) {
        var p = db.profiles[onlyId]; db.profiles = {}; db.profiles[onlyId] = p; db.active = onlyId;
        var k = lib.kids[onlyId]; lib.kids = {}; if (k) lib.kids[onlyId] = k;
      }
      var media = {}, keys = CM.media.keys();
      return Promise.all(keys.map(function (k) {
        var v = CM.media.get(k);
        if (typeof v === "string") { media[k] = v; return null; }
        return blobToData(v).then(function (d) { if (d) media[k] = { blob: d }; });
      })).then(function () {
        var out = { kind: KIND, v: 1, saved: new Date().toISOString(), children: Object.keys(db.profiles).length, db: db, lib: lib, media: media };
        return new Blob([JSON.stringify(out)], { type: "application/json" });
      });
    },
    read: function (file) {
      return new Promise(function (resolve, reject) {
        if (!file) return reject(new Error("Choose a backup file first."));
        if (file.size > 400 * 1024 * 1024) return reject(new Error("That file is too big to be a Calm Match backup."));
        var r = new FileReader();
        r.onload = function () {
          var o; try { o = JSON.parse(r.result); } catch (e) { return reject(new Error("That isn't a Calm Match backup file.")); }
          if (!o || o.kind !== KIND || !o.db || !o.db.profiles) return reject(new Error("That isn't a Calm Match backup file."));
          resolve(o);
        };
        r.onerror = function () { reject(new Error("That file couldn't be read.")); };
        r.readAsText(file);
      });
    },
    summary: function (o) {
      return Object.keys(o.db.profiles).map(function (id) { var p = o.db.profiles[id] || {}; return (p.avatar || "") + " " + (p.name || "Child"); }).join(", ");
    },
    // mode "add": add the file's children alongside the ones here. mode "replace": the device becomes the file.
    apply: function (o, mode) {
      var cur = CM.store.exportAll(), lib = CM.lib.data(), inLib = o.lib || {}, idMap = {};
      var profiles = {};
      Object.keys(o.db.profiles).forEach(function (id) {
        var p = o.db.profiles[id]; if (!p || typeof p !== "object") return;
        p.cloudId = null; // a child from a file is never tied to someone else's account rows
        var nid = mode === "add" && cur.profiles[id] ? "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) : id;
        idMap[id] = nid; profiles[nid] = p;
      });
      if (!Object.keys(profiles).length) return Promise.reject(new Error("There are no children in that file."));
      var db, newLib;
      if (mode === "replace") {
        db = { v: 3, active: idMap[o.db.active] || Object.keys(profiles)[0], profiles: profiles, app: o.db.app || cur.app };
        newLib = { items: inLib.items || {}, stories: inLib.stories || {}, kids: {} };
        Object.keys(inLib.kids || {}).forEach(function (id) { if (idMap[id]) newLib.kids[idMap[id]] = inLib.kids[id]; });
      } else {
        db = cur; Object.keys(profiles).forEach(function (id) { db.profiles[id] = profiles[id]; });
        newLib = JSON.parse(JSON.stringify(lib));
        ["items", "stories"].forEach(function (k) { Object.keys(inLib[k] || {}).forEach(function (id) { if (!newLib[k][id]) newLib[k][id] = inLib[k][id]; }); });
        Object.keys(inLib.kids || {}).forEach(function (id) { if (idMap[id]) newLib.kids[idMap[id]] = inLib.kids[id]; });
      }
      var media = o.media || {}, start = mode === "replace" ? CM.media.clear() : Promise.resolve();
      return start.then(function () {
        return Promise.all(Object.keys(media).map(function (k) {
          if (mode === "add" && CM.media.has(k)) return null;
          var v = media[k]; v = typeof v === "string" ? v : v && v.blob ? dataToBlob(v.blob) : null;
          return v ? CM.media.put(k, v) : null;
        }));
      }).then(function () {
        if (!CM.safeSet("calm-match-data", JSON.stringify(db))) throw new Error("This device is out of space.");
        CM.lib.replace(newLib);
        return Object.keys(profiles).length;
      });
    },
    download: function (blob, name) {
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
  };
})();
