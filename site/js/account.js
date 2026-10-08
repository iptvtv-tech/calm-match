/* Account page: sign in, sign up, reset, sync options, export, delete. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var $ = function (id) { return document.getElementById(id); };
  var recovering = /#reset/.test(location.hash);

  function msg(text, kind) { $("acctMsg").innerHTML = text ? '<div class="msg ' + (kind || "info") + '">' + esc(text) + "</div>" : ""; }
  function busy(form, on) { form.querySelectorAll("button,input").forEach(function (x) { x.disabled = on; }); }
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  function showForm(name) {
    document.querySelectorAll("[data-form]").forEach(function (t) { t.setAttribute("aria-selected", t.dataset.form === name); });
    ["signin", "signup", "link", "forgot"].forEach(function (f) { $("f-" + f).hidden = f !== name; });
    msg("");
  }

  function render() {
    var u = CM.cloud.user();
    $("loading").hidden = true;
    $("resetPw").hidden = !(recovering && u);
    $("signedOut").hidden = !!u;
    $("signedIn").hidden = !u || recovering;
    if (u && !recovering) {
      $("meEmail").textContent = u.email;
      var st = CM.cloud.status();
      $("syncState").textContent = st.state === "synced" ? "Settings synced." : st.state === "syncing" ? "Syncing…" : st.state === "error" ? "Sync problem: " + st.error : "";
      var a = CM.cloud.account(); $("syncProgress").checked = !!(a && a.sync_progress);
      renderStored();
    }
  }

  var storedTimer = null;
  function renderStored() {
    clearTimeout(storedTimer);
    storedTimer = setTimeout(function () {
      CM.cloud.fetchMine().then(function (d) {
        var rows = d.child_settings || [];
        $("storedView").innerHTML = '<table><thead><tr><th>Child</th><th>Avatar</th><th>Settings</th><th>Progress backup</th><th>Last change</th></tr></thead><tbody>' +
          (rows.length ? rows.map(function (r, i) {
            var s = r.settings || {}, on = Object.keys(s.games || {}).filter(function (g) { return s.games[g]; }).map(function (g) { return CM.GAMES[g] ? CM.GAMES[g].label : g; });
            return "<tr><td>Child " + (i + 1) + '<br><span class="meta">name not stored</span></td><td style="font-size:24px">' + esc(r.avatar) + "</td><td>" +
              esc((CM.THEMES[s.theme] || {}).label || s.theme || "") + " theme; games: " + esc(on.join(", ")) + "</td><td>" + (r.progress ? "Yes" : "No") + "</td><td>" +
              new Date(r.updated_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) + "</td></tr>";
          }).join("") : '<tr><td colspan="5" class="meta">Nothing yet. Children appear here after you play on a signed-in device.</td></tr>') + "</tbody></table>";
      }).catch(function (e) { $("storedView").innerHTML = '<p class="msg err">' + esc(CM.cloud.friendly(e)) + "</p>"; });
    }, 300);
  }

  function bind() {
    document.querySelectorAll("[data-form]").forEach(function (t) { t.onclick = function () { showForm(t.dataset.form); }; });

    $("f-signin").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, em = $("si-email").value.trim(), pw = $("si-pw").value;
      if (!emailOk(em) || !pw) return msg("Enter your email and password.", "err");
      busy(f, true); msg("Signing in…");
      CM.cloud.signIn(em, pw).then(function () { msg("Signed in. Your children's settings are syncing.", "ok"); render(); })
        .catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };
    $("f-signup").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, em = $("su-email").value.trim(), pw = $("su-pw").value;
      if (!emailOk(em)) return msg("Enter a valid email address.", "err");
      if (pw.length < 8) return msg("Please use a password of at least 8 characters.", "err");
      if (!$("su-adult").checked) return msg("Accounts are for adults. Please confirm you are 18 or over.", "err");
      if (!$("su-policy").checked) return msg("Please confirm you have read the privacy policy and terms.", "err");
      busy(f, true); msg("Creating your account…");
      CM.cloud.signUp(em, pw).then(function (d) {
        if (d && d.session) { msg("Account created and signed in.", "ok"); render(); }
        else msg("Nearly done. Check your email for a link to confirm your address, then sign in.", "ok");
      }).catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };
    $("f-link").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, em = $("ml-email").value.trim();
      if (!emailOk(em)) return msg("Enter a valid email address.", "err");
      busy(f, true);
      CM.cloud.magicLink(em).then(function () { msg("If there's an account for " + em + ", a sign-in link is on its way.", "ok"); })
        .catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };
    $("f-forgot").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, em = $("fp-email").value.trim();
      if (!emailOk(em)) return msg("Enter a valid email address.", "err");
      busy(f, true);
      CM.cloud.resetPassword(em).then(function () { msg("If there's an account for " + em + ", a reset link is on its way.", "ok"); })
        .catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };
    $("f-newpw").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, pw = $("np-pw").value;
      if (pw.length < 8) return msg("Please use a password of at least 8 characters.", "err");
      busy(f, true);
      CM.cloud.updatePassword(pw).then(function () {
        recovering = false; history.replaceState(null, "", location.pathname); msg("Password saved.", "ok"); render();
      }).catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };

    $("signOutBtn").onclick = function () { CM.cloud.signOut().then(function () { msg("Signed out. Games and progress stay on this device.", "ok"); render(); }); };
    $("syncNowBtn").onclick = function () { CM.cloud.syncAll(true).then(render); render(); };
    $("syncProgress").onchange = function (e) {
      var on = e.target.checked; e.target.disabled = true;
      CM.cloud.setSyncProgress(on).then(function () { msg(on ? "Progress backup is on." : "Progress backup is off, and backed-up progress was deleted.", "ok"); })
        .catch(function (err) { e.target.checked = !on; msg(CM.cloud.friendly(err), "err"); })
        .then(function () { e.target.disabled = false; render(); });
    };
    $("exportBtn").onclick = function () {
      CM.cloud.fetchMine().then(function (d) {
        d.this_device = CM.store.exportAll(); d.exported_at = new Date().toISOString();
        var blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }), a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "calm-match-my-data.json";
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      }).catch(function (err) { msg(CM.cloud.friendly(err), "err"); });
    };
    $("f-email").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, em = $("ce-email").value.trim();
      if (!emailOk(em)) return msg("Enter a valid email address.", "err");
      busy(f, true);
      CM.cloud.updateEmail(em).then(function () { msg("Check both your old and new inboxes for confirmation links.", "ok"); })
        .catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };
    $("f-pw").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, pw = $("cp-pw").value;
      if (pw.length < 8) return msg("Please use a password of at least 8 characters.", "err");
      busy(f, true);
      CM.cloud.updatePassword(pw).then(function () { $("cp-pw").value = ""; msg("Password changed.", "ok"); })
        .catch(function (err) { msg(CM.cloud.friendly(err), "err"); }).then(function () { busy(f, false); });
    };
    $("delConfirm").oninput = function (e) { $("deleteAcct").disabled = e.target.value.trim() !== "DELETE"; };
    $("deleteAcct").onclick = function () {
      $("deleteAcct").disabled = true; msg("Deleting your account…");
      CM.cloud.deleteAccount().then(function () { $("delConfirm").value = ""; msg("Your account and everything stored with it have been deleted.", "ok"); render(); })
        .catch(function (err) { msg(CM.cloud.friendly(err), "err"); $("deleteAcct").disabled = false; });
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!CM.cloud.enabled) return;
    bind();
    CM.cloud.onChange(function (ev) {
      if (ev.type === "auth" && ev.event === "PASSWORD_RECOVERY") recovering = true;
      render();
    });
    CM.cloud.init().then(function () {
      render();
      if (CM.cloud.status().state === "error") msg(CM.cloud.status().error, "err");
    });
  });
})();
