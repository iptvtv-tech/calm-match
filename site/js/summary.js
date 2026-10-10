/* Printable progress summary. Built on this device from the saved progress; nothing is sent anywhere. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var $ = function (id) { return document.getElementById(id); };
  var DAY = 864e5;
  var STATUS = { locked: "Not open yet", ready: "Ready to try", learning: "Learning", mastered: "Learned" };
  var GAME_NAME = {}; Object.keys(CM.GAMES).forEach(function (g) { GAME_NAME[g] = CM.GAMES[g].label; });

  function fmtDate(t, long) { return new Date(t).toLocaleDateString("en-IE", long ? { day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "short" }); }

  function render() {
    var db = CM.store.db(), id = $("sumChild").value || db.active;
    db.active = id; // in memory only: the games keep their own choice of child
    var P = CM.store.P(), S = P.settings, days = +$("sumPeriod").value, now = Date.now();
    var hist = P.history.filter(function (r) { return !days || now - r.at < days * DAY; });
    var showName = $("sumName").checked;

    $("sumWho").textContent = showName ? ": " + P.name : "";
    $("sumAvatar").textContent = P.avatar || "";
    var from = hist.length ? hist[hist.length - 1].at : null, to = hist.length ? hist[0].at : null;
    $("sumMeta").textContent = (days ? "Last " + (days === 30 ? "30 days" : "3 months") : "All time") +
      (from ? " · sessions from " + fmtDate(from, true) + " to " + fmtDate(to, true) : " · no sessions in this period");
    $("sumMade").textContent = "Made on " + fmtDate(now, true) + " on this device";

    // At a glance
    var t = { sessions: hist.length, mins: 0, turns: 0, helped: 0, first: 0, hints: 0, breaks: 0, days: {} };
    hist.forEach(function (r) {
      t.mins += +r.mins || 0; t.turns += +r.turns || 0; t.helped += +r.prompted || 0; t.first += +r.first || 0;
      t.hints += +r.hints || 0; t.breaks += +r.breaks || 0; t.days[new Date(r.at).toDateString()] = 1;
    });
    var indep = t.turns - t.helped, rate = indep ? t.first / indep : null;
    var tile = function (label, big, small) { return '<div class="sum-tile"><span class="l">' + label + '</span><span class="v">' + big + '</span><span class="s">' + esc(small) + "</span></div>"; };
    $("sumTiles").innerHTML =
      tile("Sessions", String(t.sessions), Object.keys(t.days).length + " different days") +
      tile("Time playing", t.mins + " min", t.sessions ? "About " + Math.round(t.mins / t.sessions) + " min a session" : "–") +
      tile("Right first time", rate === null ? "–" : CM.pct(rate), indep + " turns without help") +
      tile("Help and breaks", String(t.helped + t.hints), t.helped + " helped turns, " + t.hints + " hints, " + t.breaks + " breaks");

    // Chart: right first time per session, oldest to newest (up to the last 20)
    var last = hist.slice(0, 20).reverse(), W = 640, H = 170, x0 = 40, x1 = W - 8, y0 = 12, y1 = 130;
    var svg = '<svg class="sum-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Right first time for the last ' + last.length + ' sessions">';
    [0, 0.5, 1].forEach(function (v) { var y = y1 - (y1 - y0) * v; svg += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '" class="g"/><text x="' + (x0 - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + v * 100 + "%</text>"; });
    if (last.length) {
      var step = (x1 - x0) / last.length, bw = Math.min(28, step - 6);
      last.forEach(function (r, i) {
        var n = (+r.turns || 0) - (+r.prompted || 0), v = n ? (+r.first || 0) / n : 0, cx = x0 + (i + 0.5) * step, top = y1 - (y1 - y0) * v;
        svg += '<rect class="b" x="' + (cx - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + Math.max(1, y1 - top) + '" rx="3"><title>' + fmtDate(r.at) + ": " + CM.pct(v) + "</title></rect>";
        if (last.length <= 12 || i % 2 === 0) svg += '<text x="' + cx + '" y="' + (y1 + 15) + '" text-anchor="middle">' + fmtDate(r.at) + "</text>";
      });
    } else svg += '<text x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle">No sessions in this period</text>';
    svg += "</svg>";
    $("sumChart").innerHTML = svg;

    // Skills: per skill in this period
    var per = {};
    hist.forEach(function (r) {
      (r.blocks || []).forEach(function (b) {
        var k = per[b.skill] || (per[b.skill] = { turns: 0, helped: 0, first: 0, last: 0 });
        k.turns += +b.turns || 0; k.helped += +b.prompted || 0; k.first += +b.first || 0; k.last = Math.max(k.last, r.at);
      });
    });
    var lastEver = {};
    P.history.forEach(function (r) { (r.blocks || []).forEach(function (b) { lastEver[b.skill] = Math.max(lastEver[b.skill] || 0, r.at); }); });
    var rows = CM.SKILLS.filter(function (s) { return S.games[s.game]; }).map(function (s) {
      var st = P.skills[s.id], status = CM.status(s), k = per[s.id];
      var period = k ? (k.first + " of " + (k.turns - k.helped) + " right first time" + (k.helped ? ", " + k.helped + " with help" : "")) : "–";
      return "<tr class=\"st-" + status + "\"><td>" + GAME_NAME[s.game] + "</td><td>" + esc(s.name) + '</td><td><span class="sum-pill ' + status + '">' + STATUS[status] + "</span></td><td>" +
        (status === "locked" ? "–" : CM.pct(st.p)) + "</td><td>" + period + "</td><td>" + (lastEver[s.id] ? fmtDate(lastEver[s.id]) : "–") + "</td></tr>";
    });
    $("sumSkills").innerHTML = rows.join("");

    // Plain words
    var enabled = CM.SKILLS.filter(function (s) { return S.games[s.game]; });
    var by = function (x) { return enabled.filter(function (s) { return CM.status(s) === x; }); };
    var words = [];
    var learnedNow = by("mastered");
    if (learnedNow.length) words.push("<b>Learned:</b> " + esc(learnedNow.map(function (s) { return s.name; }).join(", ")) + ".");
    var working = by("learning").sort(function (a, b) { return CM.pp(b) - CM.pp(a); });
    if (working.length) words.push("<b>Working on:</b> " + esc(working.map(function (s) { return s.name + " (" + CM.pct(CM.pp(s)) + " sure)"; }).join(", ")) + ".");
    var hard = enabled.filter(function (s) { return P.skills[s.id].struggle; });
    if (hard.length) words.push("<b>Found harder last time:</b> " + esc(hard.map(function (s) { return s.name; }).join(", ")) + ". The games step back to the skill before it next time.");
    var helped = S.errorless ? enabled.filter(function (s) { var st = P.skills[s.id]; return st.turns && st.prompt > 0; }) : [];
    if (helped.length) words.push("<b>Still with help:</b> " + esc(helped.map(function (s) { return s.name; }).join(", ")) + ".");
    if (t.breaks) words.push("<b>Breaks:</b> took " + t.breaks + " break" + (t.breaks === 1 ? "" : "s") + " during sessions, which is encouraged.");
    if (!words.length) words.push("No games played yet in this period.");
    $("sumWords").innerHTML = words.map(function (w) { return "<li>" + w + "</li>"; }).join("");

    // Settings
    var on = function (b) { return b ? "on" : "off"; };
    var theme = CM.THEMES[S.theme] || CM.THEMES.vehicles;
    var games = CM.GAME_ORDER.filter(function (g) { return S.games[g]; }).map(function (g) { return GAME_NAME[g]; });
    $("sumSettings").innerHTML = [
      ["Games", games.join(", ")],
      ["Theme", theme.label + (S.photos ? " (with family photos)" : "")],
      ["Language", S.lang === "ga" ? "Irish (Gaeilge)" : "English"],
      ["Errorless start", on(S.errorless)],
      ["Auto-adjust difficulty", on(S.adaptive)],
      ["Session", S.blocks + " games of " + S.turns + " turns"],
      ["Sound / read aloud", on(S.sound) + " / " + on(S.speech)],
      ["Calm mode, high contrast, big pictures", [on(S.calm), on(S.contrast), on(S.big)].join(", ")],
      ["More feelings", on(S.moreFeelings)]
    ].map(function (r) { return "<li><span>" + r[0] + "</span><b>" + esc(r[1]) + "</b></li>"; }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var db = CM.store.db();
    $("sumChild").innerHTML = CM.store.list().map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === db.active ? " selected" : "") + ">" + esc((x.p.avatar || "") + " " + x.p.name) + "</option>"; }).join("");
    ["sumChild", "sumPeriod", "sumName"].forEach(function (k) { $(k).onchange = render; });
    $("sumPrint").onclick = function () { window.print(); };
    render();
  });
})();
