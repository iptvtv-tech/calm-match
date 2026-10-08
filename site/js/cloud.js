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
    }).catch(function () { return loadScript(C.supabaseCdn); });
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
        if (user && user.id !== was && event !== "PASSWORD_RECOVERY") setTimeout(syncAll, 0);
      });
      return client.auth.getSession();
    }).then(function (r) {
      user = r && r.data && r.data.session ? r.data.session.user : null;
      if (user) syncAll(); else setState("signed-out");
      return user;
    }).catch(function (e) { setState("error", friendly(e)); return null; });
    return initP;
  }

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

  function syncAll(force) {
    if (!user || !client) return Promise.resolve();
    setState("syncing");
    return getAccount().then(function () {
      return wrap(client.from("child_settings").select("id, avatar, settings, progress, updated_at").order("updated_at"));
    }).then(function (rows) {
      applying = true;
      var db = CM.store.db(), byCloud = {}, n = Object.keys(db.profiles).length;
      Object.keys(db.profiles).forEach(function (id) {
        var p = db.profiles[id];
        if (p.cloudId && p.cloudOwner && p.cloudOwner !== user.id) { p.cloudId = null; p.cloudOwner = null; } // belongs to another account
        if (p.cloudId) byCloud[p.cloudId] = id;
      });
      var remoteIds = {};
      // A brand-new, untouched profile on this device adopts an existing child instead of becoming an extra one.
      var pristine = Object.keys(db.profiles).filter(function (id) {
        var p = db.profiles[id];
        return !p.cloudId && !p.example && !p.history.length && Object.keys(p.skills).every(function (k) { return !p.skills[k].turns; });
      });
      rows.forEach(function (r) {
        remoteIds[r.id] = true;
        var lid = byCloud[r.id], p;
        if (!lid && pristine.length) {
          lid = pristine.shift(); p = db.profiles[lid];
          p.cloudId = r.id; p.cloudOwner = user.id; p.updatedAt = "1970-01-01T00:00:00Z";
        }
        if (!lid) {
          n++;
          lid = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          p = CM.store.newProfile("Child " + n, r.avatar || "🙂", null);
          p.cloudId = r.id; p.cloudOwner = user.id; p.updatedAt = "1970-01-01T00:00:00Z";
          db.profiles[lid] = p;
        }
        p = db.profiles[lid];
        if (new Date(r.updated_at) > new Date(p.updatedAt || 0)) {
          p.avatar = r.avatar || p.avatar;
          p.settings = Object.assign(JSON.parse(JSON.stringify(CM.DEFAULTS)), r.settings || {});
          p.settings.games = Object.assign(JSON.parse(JSON.stringify(CM.DEFAULTS.games)), (r.settings || {}).games || {});
          if (r.progress && acct.sync_progress) {
            p.skills = Object.assign(CM.store.freshSkills(), r.progress.skills || {});
            if (Array.isArray(r.progress.history) && r.progress.history.length >= p.history.length) p.history = r.progress.history;
          }
          p.updatedAt = r.updated_at;
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
      .catch(function (e) { applying = false; setState("error", friendly(e)); });
  }

  function deleteRemoteChild(p) {
    if (!user || !client || !p || !p.cloudId || p.cloudOwner !== user.id) return Promise.resolve();
    return wrap(client.from("child_settings").delete().eq("id", p.cloudId));
  }

  // Push the changed profile a moment after each local save.
  CM.store.onSave(function (id) {
    if (applying || !user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      setState("syncing");
      pushProfile(id).then(function () { setState("synced"); }).catch(function (e) { setState("error", friendly(e)); });
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
    setSyncProgress: setSyncProgress,
    deleteRemoteChild: deleteRemoteChild,
    signUp: function (email, password) { need(); return wrap(client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: basePath() + "account.html" } })); },
    signIn: function (email, password) { need(); return wrap(client.auth.signInWithPassword({ email: email, password: password })); },
    magicLink: function (email) { need(); return wrap(client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: basePath() + "account.html", shouldCreateUser: false } })); },
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
