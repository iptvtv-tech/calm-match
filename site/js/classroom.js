/* Classroom mode: one shared tablet for a small class. Each child taps their own avatar to start,
   and the teacher sees the whole class in the grown-ups area. Everything stays on this tablet. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc, t = function (k, v) { return CM.t(k, v); };
  var DAY = 864e5;
  function stats(p) {
    var now = Date.now(), week = p.history.filter(function (r) { return now - r.at < 7 * DAY; });
    var enabled = CM.SKILLS.filter(function (s) { return p.settings.games[s.game]; });
    var st = function (s) { return p.skills[s.id] || { p: 0, turns: 0 }; };
    var learned = enabled.filter(function (s) { return st(s).p >= CM.MASTER; });
    var working = enabled.filter(function (s) { return st(s).turns && st(s).p < CM.MASTER; }).sort(function (a, b) { return st(b).turns - st(a).turns; }).slice(0, 2);
    var indep = 0, first = 0; week.forEach(function (r) { indep += r.turns - (r.prompted || 0); first += r.first; });
    return { week: week.length, mins: week.reduce(function (a, r) { return a + (r.mins || 0); }, 0), last: p.history[0] ? p.history[0].at : null,
      learned: learned.length, of: enabled.length, working: working.map(function (s) { return s.name; }), rate: indep ? first / indep : null };
  }
  var fmt = function (at) { return at ? new Date(at).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }) : "Not yet"; };

  CM.classroom = {
    on: function () { return !!CM.store.db().app.classroom; },
    set: function (v) { CM.store.db().app.classroom = !!v; CM.store.persist(); },

    // "Who is playing?" for the child. onChosen runs after the active child changes.
    picker: function (stage, say, onChosen) {
      var list = CM.store.list().filter(function (x) { return !x.p.example; });
      stage.innerHTML = '<h1 class="say">' + esc(t("whoPlaying")) + '</h1><div class="who-grid" role="group" aria-label="' + esc(t("whoPlaying")) + '">' +
        list.map(function (x) { return '<button type="button" class="who-btn" data-id="' + esc(x.id) + '"><span class="who-av" aria-hidden="true">' + esc(x.p.avatar) + "</span><b>" + esc(x.p.name) + "</b></button>"; }).join("") + "</div>";
      say(t("whoPlaying"));
      stage.querySelectorAll("[data-id]").forEach(function (b) { b.onclick = function () { CM.store.setActive(b.dataset.id); onChosen(); }; });
    },

    renderOverview: function (box) {
      var list = CM.store.list().filter(function (x) { return !x.p.example; });
      var rows = list.map(function (x) {
        var s = stats(x.p);
        return "<tr><td>" + esc(x.p.avatar + " " + x.p.name) + "</td><td>" + s.week + (s.week ? " (" + s.mins + " min)" : "") + "</td><td>" + fmt(s.last) + "</td><td>" + (s.rate === null ? "–" : CM.pct(s.rate)) + "</td><td>" + s.learned + " of " + s.of + "</td><td>" + esc(s.working.join(", ") || "–") + "</td></tr>";
      }).join("");
      box.innerHTML = '<div class="tablewrap"><table><thead><tr><th>Child</th><th>Sessions this week</th><th>Last played</th><th>Right first time this week</th><th>Skills learned</th><th>Working on</th></tr></thead><tbody>' +
        (rows || '<tr><td colspan="6" class="note">No children yet.</td></tr>') + '</tbody></table></div><div class="row start"><button class="small-btn" type="button" id="classPrint">Print class summary</button></div>';
      box.querySelector("#classPrint").onclick = function () {
        CM.ui.print('<p class="note">Made on ' + new Date().toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }) + ' on this device. Results from calm practice games; not an assessment.</p>' + box.querySelector(".tablewrap").innerHTML, "Class summary");
      };
    }
  };
})();
