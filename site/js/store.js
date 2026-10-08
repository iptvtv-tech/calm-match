/* Device storage. Child profiles live here. Names never leave this device. */
(function () {
  "use strict";
  var CM = window.CM;
  var KEY = "calm-match-data";

  CM.DEFAULTS = {
    theme: "vehicles", sound: true, speech: false, rate: 0.85, calm: false, contrast: false, big: false, keys: false,
    adaptive: true, blocks: 3, turns: 4, mode: "engine",
    games: { match: true, sort: true, seq: true, count: true, pairs: true, feel: true },
    lang: "en",              // "en" or "ga": language of the games
    errorless: false,        // errorless start: new skills begin with the answer highlighted, then help fades
    stickerSet: "theme",     // theme | stars | hearts | shapes | none
    celebrate: "gentle",     // cheerful | gentle | calm
    photos: false,           // show photos instead of emoji, where photos exist for the theme
    board: { first: 1, then: 0, minutes: 0 }
  };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var freshSkills = function () { var o = {}; CM.SKILLS.forEach(function (s) { o[s.id] = { p: CM.PRIOR, turns: 0, lvl: 0, struggle: false, prompt: 2, promptRun: 0 }; }); return o; };
  var newId = function () { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  function newProfile(name, avatar, settings) {
    return { name: name, avatar: avatar, settings: settings ? clone(settings) : clone(CM.DEFAULTS), skills: freshSkills(), history: [], stickers: [], updatedAt: new Date().toISOString(), cloudId: null };
  }

  var DB = null;
  try { DB = JSON.parse(CM.safeGet(KEY) || "null"); } catch (e) { DB = null; }
  if (!DB || !DB.profiles || !Object.keys(DB.profiles).length) {
    var id = newId();
    DB = { v: 3, active: id, profiles: {}, app: { gate: "hold" } };
    DB.profiles[id] = newProfile("Player 1", "🙂");
  }
  if (!DB.app) DB.app = { gate: "hold" };
  if (!DB.profiles[DB.active]) DB.active = Object.keys(DB.profiles)[0];
  // Fill in anything added in later versions.
  Object.keys(DB.profiles).forEach(function (k) {
    var p = DB.profiles[k], fresh = freshSkills();
    p.settings = Object.assign(clone(CM.DEFAULTS), p.settings || {});
    p.settings.games = Object.assign(clone(CM.DEFAULTS.games), p.settings.games || {});
    Object.keys(p.skills || {}).forEach(function (id) {
      var st = p.skills[id];
      if (st.prompt == null) { st.prompt = st.turns ? 0 : 2; st.promptRun = 0; }
    });
    p.skills = Object.assign(fresh, p.skills || {});
    p.settings.board = Object.assign(clone(CM.DEFAULTS.board), p.settings.board || {});
    p.history = p.history || []; p.stickers = p.stickers || [];
  });

  var listeners = [];
  CM.store = {
    db: function () { return DB; },
    P: function () { return DB.profiles[DB.active]; },
    S: function () { return DB.profiles[DB.active].settings; },
    activeId: function () { return DB.active; },
    setActive: function (id) { if (DB.profiles[id]) { DB.active = id; persist(); } },
    list: function () { return Object.keys(DB.profiles).map(function (id) { return { id: id, p: DB.profiles[id] }; }); },
    newProfile: newProfile,
    freshSkills: freshSkills,
    add: function (name, avatar, settings) { var id = newId(); DB.profiles[id] = newProfile(name, avatar, settings); DB.active = id; this.save(id); return id; },
    remove: function (id) { var p = DB.profiles[id]; delete DB.profiles[id]; if (DB.active === id) DB.active = Object.keys(DB.profiles)[0]; persist(); return p; },
    // Mark a profile as changed (for sync) and write to the device.
    save: function (id) {
      var p = DB.profiles[id || DB.active];
      if (p) p.updatedAt = new Date().toISOString();
      persist();
      listeners.forEach(function (fn) { try { fn(id || DB.active); } catch (e) {} });
    },
    persist: function () { persist(); },
    onSave: function (fn) { listeners.push(fn); },
    exportAll: function () { return clone(DB); },
    wipeDevice: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
  function persist() { CM.safeSet(KEY, JSON.stringify(DB)); }
  persist();
})();
