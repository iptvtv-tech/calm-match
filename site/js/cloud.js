/* Optional parent accounts with Supabase.
   What can leave the device: the parent's email (for sign-in), and per child only an avatar emoji,
   game and sensory settings, and (only if the parent switches it on) skill progress.
   Child nicknames never leave the device. Nothing loads from Supabase unless config.js has keys. */
(function () {
  "use strict";
  var CM = window.CM, C = CM.cfg || {};
  var enabled = !!(C.supabaseUrl && C.supabaseAnonKey);
  var client = null, user = null, acct = null, initP = null, applying = false, pushTimer = null;
  var listeners = [];
  var state = { state: enabled ? "signed-out" : "off", at: null, error: null };

  function emit(ev) { listeners.forEach(function (fn) { try { fn(ev || {}); } catch (e) {} }); }
  function setState(s, err) { state = { state: s, at: s === "synced" ? new Date() : state.at, error: err || null }; emit({ type: "status" }); }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.async = true;
      s.onload = res; s.onerror = function () { s.remove(); rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadLib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return loadScript("vendor/supabase.js").then(function () {
      if (!(window.supabase && window.supabase.createClient)) throw new Error("no lib");
    }).catch(function (e) { if (C.supabaseCdn) return loadScript(C.supabaseCdn); throw e; });
  }
  function basePath() { return location.origin + location.pathname.replace(/[^/]*$/, ""); }

  function friendly(err) {
    var m = (err && (err.message || err.error_description || String(err))) || "Something went wrong.";
    if (/Invalid login credentials/i.test(m)) return "That email and password don't match. Check them, or reset your password.";
    if (/Email not confirmed/i.test(m)) return "Please confirm your email first. Check your inbox for the link.";
    if (/already registered|already been registered/i.test(m)) return "There's already an account with that email. Try signing in.";
    if (/Password should be|password.*characters/i.test(m)) return "Please use a password of at least 8 characters.";
    if (/rate limit|too many/i.test(m)) return "Too many tries. Please wait a few minutes and try again.";
    if (/Failed to fetch|NetworkError|load /i.test(m)) return "Couldn't reach the account service. Check your internet connection.";
    return m;
  }

  function init() {
    if (!enabled) return Promise.resolve(null);
    if (initP) return initP;
    initP = loadLib().then(function () {
      client = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      client.auth.onAuthStateChange(function (event, session) {
        var was = user && user.id;
        user = session ? session.user : null;
        if (!user) { acct = null; setState("signed-out"); }
        emit({ type: "auth", event: event });
        if (user && user.id !== was && event === "SIGNED_IN") setTimeout(syncAll, 0);
      });
      return client.auth.getSession();
    }).then(function (r) {
      user = r && r.data && r.data.session ? r.data.session.user : null;
      if (!user) { setState("signed-out"); return null; }
      return validate().then(function (u) { if (u) syncAll(); return u; });
    }).catch(function (e) { setState("error", friendly(e)); return null; });
    return initP;
  }

  // Every sync and upload runs one at a time. Without this, two syncs started together
  // (e.g. page load + sign-in event) could both upload the same child and create a duplicate.
  var chain = Promise.resolve();
  function serial(fn) { var p = chain.then(fn, fn); chain = p.catch(function () {}); return p; }

  // Ask the server whether this sign-in is still valid. A deleted account, or one signed out
  // everywhere, is signed out here too, so no stale account details stay on screen.
  var lastCheck = 0;
  function validate() {
    if (!client || !user) return Promise.resolve(user);
    lastCheck = Date.now();
    return client.auth.getUser().then(function (r) {
      var e = r && r.error;
      if (e) {
        var st = e.status || 0, m = String(e.message || "") + " " + String(e.code || "");
        if (st === 401 || st === 403 || st === 404 || /not.?found|does not exist|invalid|expired|session/i.test(m)) {
          return signedOutRemotely();
        }
        return user; // offline or a temporary problem: keep the session for now
      }
      if (r.data && r.data.user) user = r.data.user;
      return user;
    }).catch(function () { return user; });
  }
  function signedOutRemotely() {
    var gone = user && user.id, db = CM.store.db();
    Object.keys(db.profiles).forEach(function (id) { var p = db.profiles[id]; if (p.cloudOwner === gone) { p.cloudId = null; p.cloudOwner = null; } });
    CM.store.persist();
    user = null; acct = null;
    return client.auth.signOut({ scope: "local" }).catch(function () {}).then(function () {
      setState("signed-out");
      emit({ type: "gone", message: "You've been signed out because this account no longer exists or was signed out elsewhere. Games and progress on this device are still here." });
      return null;
    });
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && user && Date.now() - lastCheck > 60000) validate();
  });

  function need() { if (!client) throw new Error("Accounts aren't available right now."); }
  function wrap(p) { return p.then(function (r) { if (r && r.error) throw r.error; return r ? r.data : null; }); }

  /* ---------- account settings ---------- */
  function getAccount() {
    need();
    return wrap(client.from("account_settings").select("sync_progress, updated_at").maybeSingle()).then(function (row) {
      if (row) { acct = row; return row; }
      return wrap(client.from("account_settings").upsert({ user_id: user.id, sync_progress: false }).select("sync_progress, updated_at").single()).then(function (r) { acct = r; return r; });
    });
  }
  function setSyncProgress(on) {
    need();
    return wrap(client.from("account_settings").upsert({ user_id: user.id, sync_progress: !!on, updated_at: new Date().toISOString() }).select("sync_progress, updated_at").single())
      .then(function (r) {
        acct = r;
        if (!on) return wrap(client.from("child_settings").update({ progress: null }).eq("user_id", user.id));
      }).then(function () { return syncAll(true); });
  }

  /* ---------- children ---------- */
  function rowFor(p) {
    return {
      avatar: p.avatar, settings: p.settings,
      progress: acct && acct.sync_progress ? { skills: p.skills, history: p.history.slice(0, 30), stickers: p.stickers.length } : null,
      updated_at: p.updatedAt || new Date().toISOString()
    };
  }
  function syncable(p) { return !p.example; }

  // Data from the account is checked before use: short plain avatar, numbers that are numbers.
  var num = function (v, max) { v = +v; return isFinite(v) && v >= 0 ? Math.min(v, max) : 0; };
  function cleanAvatar(a) { a = String(a || ""); return a && a.length <= 16 && !/[<>&"'`=\s]/.test(a) ? a : "🙂"; }
  function cleanSkills(s) {
    var out = {};
    Object.keys(s || {}).forEach(function (k) {
      if (!CM.SK[k]) return; var v = s[k] || {};
      out[k] = { p: Math.min(0.995, num(v.p, 1)), turns: num(v.turns, 1e6), lvl: Math.floor(num(v.lvl, 10)), struggle: !!v.struggle, prompt: Math.floor(num(v.prompt, 2)), promptRun: Math.floor(num(v.promptRun, 10)) };
    });
    return out;
  }
  function cleanHistory(h) {
    return (Array.isArray(h) ? h : []).slice(0, 60).map(function (r) {
      return { at: num(r.at, 4e12), turns: num(r.turns, 1000), first: num(r.first, 1000), hints: num(r.hints, 1000), prompted: num(r.prompted, 1000), breaks: num(r.breaks, 1000), mins: num(r.mins, 1000),
        theme: CM.THEMES[r.theme] ? r.theme : "vehicles", lang: r.lang === "ga" ? "ga" : "en",
        blocks: (Array.isArray(r.blocks) ? r.blocks : []).slice(0, 10).filter(function (b) { return b && CM.SK[b.skill]; })
          .map(function (b) { return { skill: b.skill, turns: num(b.turns, 100), first: num(b.first, 100), hints: num(b.hints, 100), prompted: num(b.prompted, 100) }; }) };
    }).filter(function (r) { return r.at > 0; });
  }

  function pushProfile(id) {
    var db = CM.store.db(), p = db.profiles[id];
    if (!user || !p || !syncable(p)) return Promise.resolve();
    var row = rowFor(p);
    var q = p.cloudId && p.cloudOwner === user.id
      ? client.from("child_settings").update(row).eq("id", p.cloudId).select("id").maybeSingle()
      : client.from("child_settings").insert(Object.assign({ user_id: user.id }, row)).select("id").single();
    return wrap(q).then(function (r) {
      if (!r && p.cloudId) { p.cloudId = null; return pushProfile(id); } // row was deleted elsewhere: recreate
      if (r && r.id) { p.cloudId = r.id; p.cloudOwner = user.id; CM.store.persist(); }
    });
  }

  function syncAll(force) { return serial(function () { return doSync(force); }); }
  function doSync(force) {
    if (!user || !client) return Promise.resolve();
    setState("syncing");
    return validate().then(function (u) {
      if (!u) throw { skip: true };
      return getAccount();
    }).then(function () {
      return wrap(client.from("child_settings").select("id, avatar, settings, progress, updated_at").order("updated_at"));
    }).then(function (rows) {
      applying = true;
      var db = CM.store.db(), byCloud = {};
      var nextName = function () {
        var used = {}; Object.keys(db.profiles).forEach(function (k) { var m = /^Child (\d+)$/.exec(db.profiles[k].name); if (m) used[m[1]] = 1; });
        for (var i = 1; ; i++) if (!used[i]) return "Child " + i;
      };
      Object.keys(db.profiles).forEach(function (id) {
        var p = db.profiles[id];
        if (p.cloudId && p.cloudOwner && p.cloudOwner !== user.id) { p.cloudId = null; p.cloudOwner = null; } // belongs to another account
        if (p.cloudId) byCloud[p.cloudId] = id;
      });
      var remoteIds = {};
      // Children on this device that aren't linked to the account yet are matched to the account's
      // children instead of being uploaded as extra ones. Untouched profiles are always matched.
      // When this device is joining the account for the first time, every unlinked child is matched
      // in order (most families have one child per device), and progress from both sides is combined.
      var firstLink = !Object.keys(db.profiles).some(function (id) { return db.profiles[id].cloudOwner === user.id; });
      var isPristine = function (p) { return !p.history.length && Object.keys(p.skills).every(function (k) { return !p.skills[k].turns; }); };
      var unlinked = Object.keys(db.profiles).filter(function (id) { var p = db.profiles[id]; return !p.cloudId && !p.example; });
      var adoptable = unlinked.filter(function (id) { return isPristine(db.profiles[id]); })
        .concat(firstLink ? unlinked.filter(function (id) { return !isPristine(db.profiles[id]); }) : []);
      var merged = {};
      rows.forEach(function (r) {
        remoteIds[r.id] = true;
        var lid = byCloud[r.id], p;
        if (!lid && adoptable.length) {
          lid = adoptable.shift(); p = db.profiles[lid];
          if (!isPristine(p)) merged[lid] = true;
          p.cloudId = r.id; p.cloudOwner = user.id; p.updatedAt = "1970-01-01T00:00:00Z";
        }
        if (!lid) {
          lid = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          p = CM.store.newProfile(nextName(), cleanAvatar(r.avatar), null);
          p.cloudId = r.id; p.cloudOwner = user.id; p.updatedAt = "1970-01-01T00:00:00Z";
          db.profiles[lid] = p;
        }
        p = db.profiles[lid];
        if (new Date(r.updated_at) > new Date(p.updatedAt || 0)) {
          p.avatar = cleanAvatar(r.avatar || p.avatar);
          p.settings = Object.assign(JSON.parse(JSON.stringify(CM.DEFAULTS)), r.settings || {});
          p.settings.games = Object.assign(JSON.parse(JSON.stringify(CM.DEFAULTS.games)), (r.settings || {}).games || {});
          CM.tidySettings(p.settings);
          if (r.progress && acct.sync_progress) {
            var rs = cleanSkills(r.progress.skills), rh = cleanHistory(r.progress.history);
            if (merged[lid]) {
              // Combine: for each skill keep whichever side has played it more; join the session histories.
              Object.keys(rs).forEach(function (k) { if (!p.skills[k] || (rs[k].turns || 0) > (p.skills[k].turns || 0)) p.skills[k] = rs[k]; });
              var seen = {}; p.history = p.history.concat(rh).filter(function (h) { if (seen[h.at]) return false; seen[h.at] = 1; return true; })
                .sort(function (a, b) { return b.at - a.at; }).slice(0, 60);
            } else {
              p.skills = Object.assign(CM.store.freshSkills(), rs);
              if (rh.length >= p.history.length) p.history = rh;
            }
          }
          p.updatedAt = merged[lid] ? new Date().toISOString() : r.updated_at;
        }
      });
      // A profile linked to a row that no longer exists gets re-uploaded.
      Object.keys(db.profiles).forEach(function (id) { var p = db.profiles[id]; if (p.cloudId && p.cloudOwner === user.id && !remoteIds[p.cloudId]) p.cloudId = null; });
      CM.store.persist();
      applying = false;
      var pushes = Object.keys(db.profiles).filter(function (id) {
        var p = db.profiles[id];
        if (!syncable(p)) return false;
        var r = rows.find(function (x) { return x.id === p.cloudId; });
        return force || !p.cloudId || !r || new Date(p.updatedAt) > new Date(r.updated_at);
      });
      return Promise.all(pushes.map(pushProfile));
    }).then(function () { setState("synced"); emit({ type: "synced" }); })
      .catch(function (e) { applying = false; if (e && e.skip) return; setState("error", friendly(e)); });
  }

  function deleteRemoteChild(p) {
    if (!user || !client || !p || !p.cloudId || p.cloudOwner !== user.id) return Promise.resolve();
    return serial(function () { return wrap(client.from("child_settings").delete().eq("id", p.cloudId)); });
  }

  // Push the changed profile a moment after each local save.
  CM.store.onSave(function (id) {
    if (applying || !user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      setState("syncing");
      serial(function () { return pushProfile(id); }).then(function () { setState("synced"); }).catch(function (e) { setState("error", friendly(e)); });
    }, 1500);
  });

  CM.cloud = {
    enabled: enabled,
    init: init,
    user: function () { return user; },
    account: function () { return acct; },
    status: function () { return state; },
    onChange: function (fn) { listeners.push(fn); },
    friendly: friendly,
    syncAll: syncAll,
    validate: validate,
    setSyncProgress: setSyncProgress,
    deleteRemoteChild: deleteRemoteChild,
    signUp: function (email, password) { need(); return wrap(client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: basePath() + "account.html" } })); },
    signIn: function (email, password) { need(); return wrap(client.auth.signInWithPassword({ email: email, password: password })); },
    magicLink: function (email) { need(); return wrap(client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: basePath() + "account.html", shouldCreateUser: false } })); },
    resendConfirmation: function (email) { need(); return wrap(client.auth.resend({ type: "signup", email: email, options: { emailRedirectTo: basePath() + "account.html" } })); },
    resetPassword: function (email) { need(); return wrap(client.auth.resetPasswordForEmail(email, { redirectTo: basePath() + "account.html#reset" })); },
    updatePassword: function (pw) { need(); return wrap(client.auth.updateUser({ password: pw })); },
    updateEmail: function (email) { need(); return wrap(client.auth.updateUser({ email: email }, { emailRedirectTo: basePath() + "account.html" })); },
    signOut: function () { need(); return client.auth.signOut(); },
    // Everything stored about this account, for the "what we store" view and data export.
    fetchMine: function () {
      need();
      return Promise.all([
        wrap(client.from("account_settings").select("*").maybeSingle()),
        wrap(client.from("child_settings").select("*").order("updated_at"))
      ]).then(function (r) {
        return { account: { id: user.id, email: user.email, created_at: user.created_at, last_sign_in_at: user.last_sign_in_at }, account_settings: r[0], child_settings: r[1] };
      });
    },
    deleteAccount: function () {
      need();
      return wrap(client.rpc("delete_my_account")).then(function () {
        var db = CM.store.db();
        Object.keys(db.profiles).forEach(function (id) { db.profiles[id].cloudId = null; db.profiles[id].cloudOwner = null; });
        CM.store.persist();
        return client.auth.signOut({ scope: "local" });
      });
    }
  };
})();
