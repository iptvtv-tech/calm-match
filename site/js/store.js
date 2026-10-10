/* Device storage. Child profiles live here. Names never leave this device. */
(function () {
  "use strict";
  var CM = window.CM;
  var KEY = "calm-match-data";

  CM.DEFAULTS = {
    theme: "vehicles", sound: true, speech: false, rate: 0.85, calm: false, contrast: false, big: false, keys: false,
    adaptive: true, blocks: 3, turns: 4, mode: "engine",
    games: { match: true, sort: true, seq: true, count: true, pairs: true, feel: true, find: true, shadow: true, odd: true, num: true, shapes: true,
      together: true, missing: true, puzzle: true, letters: true, order: true },
    lang: "en",              // "en" or "ga": language of the games
    errorless: false,        // errorless start: new skills begin with the answer highlighted, then help fades
    stickerSet: "theme",     // theme | stars | hearts | shapes | none
    celebrate: "gentle",     // cheerful | gentle | calm
    photos: false,           // show photos instead of emoji, where photos exist for the theme
    board: { first: 1, then: 0, minutes: 0 },
    moreFeelings: false,     // add calm, silly, worried and loving to the Feelings game
    schedule: [],            // older versions kept the visual schedule here; it now lives in the device library (js/library.js)
    tokens: 0,               // token board: 0 = off, or how many tokens earn the reward (3, 5 or 10)
    tokenIcon: "star",       // star | theme
    breakMin: 0,             // break timer in minutes (0 = no timer)
    breakEvery: 0,           // offer a break after every N games (0 = only when asked)
    talk: false,             // show the Talk button to the child
    timerSound: "end",       // timers (schedule steps, First/Then, visual timer, breaks): off | end | warn (1 minute left + end) | minute (every minute + end)
    touchMode: "instant",    // instant | hold | release: how a touch chooses an answer (js/touch.js)
    holdMs: 800,             // hold mode: how long a finger rests before the answer is chosen
    cooldownMs: 500          // ignore further taps for this long after an answer (stops double taps)
  };
  // Games added after a child was set up start switched off, so a familiar routine doesn't change by surprise.
  CM.NEW_GAMES = ["find", "shadow", "odd", "num", "shapes", "together", "missing", "puzzle", "letters", "order"];
  // Keep settings within what the app can show (also used for settings that come back from an account).
  CM.tidySettings = function (st) {
    var n = (CM.ACTIVITIES || []).length || 1, ok = function (v) { v = Math.floor(+v); return isFinite(v) && v >= 0 && v < n ? v : null; };
    st.board = Object.assign(clone(CM.DEFAULTS.board), st.board || {});
    st.board.first = ok(st.board.first) == null ? 1 : ok(st.board.first);
    st.board.then = ok(st.board.then) == null ? 0 : ok(st.board.then);
    st.board.minutes = Math.min(60, Math.max(0, Math.floor(+st.board.minutes) || 0));
    st.schedule = (Array.isArray(st.schedule) ? st.schedule : []).map(ok).filter(function (v) { return v != null; }).slice(0, 8);
    st.moreFeelings = !!st.moreFeelings;
    st.tokens = [0, 3, 5, 10].indexOf(+st.tokens) >= 0 ? +st.tokens : 0;
    st.tokenIcon = st.tokenIcon === "theme" ? "theme" : "star";
    st.breakMin = [0, 1, 2, 3, 5].indexOf(+st.breakMin) >= 0 ? +st.breakMin : 0;
    st.breakEvery = [0, 1, 2, 3].indexOf(+st.breakEvery) >= 0 ? +st.breakEvery : 0;
    st.talk = !!st.talk;
    if (["off", "end", "warn", "minute"].indexOf(st.timerSound) < 0) st.timerSound = "end";
    if (["instant", "hold", "release"].indexOf(st.touchMode) < 0) st.touchMode = "instant";
    st.holdMs = Math.min(3000, Math.max(300, Math.round(+st.holdMs) || 800));
    st.cooldownMs = Math.min(2000, Math.max(0, Math.round(+st.cooldownMs)));
    if (!isFinite(st.cooldownMs)) st.cooldownMs = 500;
    if (!CM.THEMES || !CM.THEMES[st.theme]) st.theme = "vehicles";
    return st;
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
    DB.profiles[id] = newProfile("Child 1", "🙂");
  }
  if (!DB.app) DB.app = { gate: "hold" };
  if (!DB.profiles[DB.active]) DB.active = Object.keys(DB.profiles)[0];
  // Fill in anything added in later versions.
  Object.keys(DB.profiles).forEach(function (k) {
    var p = DB.profiles[k], fresh = freshSkills();
    var hadGames = p.settings && p.settings.games;
    p.settings = Object.assign(clone(CM.DEFAULTS), p.settings || {});
    if (hadGames) CM.NEW_GAMES.forEach(function (g) { if (!(g in hadGames)) { hadGames[g] = false; p.newGamesOff = true; } });
    p.settings.games = Object.assign(clone(CM.DEFAULTS.games), p.settings.games || {});
    Object.keys(p.skills || {}).forEach(function (id) {
      var st = p.skills[id];
      if (st.prompt == null) { st.prompt = st.turns ? 0 : 2; st.promptRun = 0; }
    });
    p.skills = Object.assign(fresh, p.skills || {});
    CM.tidySettings(p.settings);
    p.history = p.history || []; p.stickers = (p.stickers || []).slice(-200);
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
    wipeDevice: function () { try { localStorage.removeItem(KEY); } catch (e) {} if (CM.lib) CM.lib.wipe(); if (CM.media) return CM.media.clear(); return Promise.resolve(); }
  };
  function persist() { CM.safeSet(KEY, JSON.stringify(DB)); }
  persist();
})();
