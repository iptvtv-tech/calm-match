/* Private Irish review page: ticks and corrections are saved through /review/api (handled by the site's Worker,
   behind Cloudflare Access), keyed by the signed-in email. Data comes from data.js (tools/review-page.js). */
(function () {
  "use strict";
  var DATA = window.REVIEW_DATA || { site: [], songs: [] };
  var state = {}, filter = "all", open = { site: {}, songs: {} }, canSave = true;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function allItems() { return DATA.site.concat(DATA.songs).flatMap(function (s) { return s.items.filter(function (i) { return !i.heading; }); }); }
  function st(id) { return state[id] || {}; }
  function checked(i) { var s = st(i.id); return s.ok || (s.note || "").trim(); }
  function visible(i) { var s = st(i.id); if (filter === "todo") return !checked(i); if (filter === "noted") return !!(s.note || "").trim(); return true; }

  function renderSections(rootId, sections) {
    var root = $(rootId);
    root.innerHTML = sections.map(function (sec, si) {
      var items = sec.items.filter(function (i) { return !i.heading; });
      var done = items.filter(checked).length;
      var shown = sec.items.filter(function (i) { return i.heading || visible(i); });
      if (!shown.some(function (i) { return !i.heading; })) return "";
      var isOpen = open[rootId][si] !== false;
      return '<section class="card"><div class="sec-head" data-si="' + si + '" role="button" tabindex="0" aria-expanded="' + isOpen + '"><h2>' + esc(sec.title) + '</h2><span class="' + (done === items.length ? 'done' : '') + '">' + done + ' / ' + items.length + '</span></div>' +
        (isOpen ? (sec.intro && sec.intro.length ? '<p class="intro">' + esc(sec.intro.join(" ")) + '</p>' : '') +
          (sec.meaning ? '<p class="meaning">Meaning: ' + esc(sec.meaning) + '</p>' : '') +
          (sec.check ? '<p class="pc">Please check: ' + esc(sec.check.join(" ")) + '</p>' : '') +
          '<div class="rows">' + shown.map(function (i) {
            if (i.heading) return '<div class="row subhead">' + esc(i.heading) + '</div>';
            var s = st(i.id), noted = !!(s.note || "").trim();
            return '<div class="row ' + (s.ok ? 'done ' : '') + (noted ? 'noted' : 'collapsed') + '" data-id="' + i.id + '">' +
              (i.question ? '<div class="en" style="grid-column:1/-1;color:var(--ink)">' + esc(i.en) + '</div>' :
                '<div class="en">' + esc(i.en) + '</div><div class="ga">' + esc(i.ga) + (i.syl ? '<span class="syl">' + esc(i.syl) + ' syl</span>' : '') + '</div>') +
              (i.question ? '' : '<button class="ok" type="button" aria-pressed="' + (s.ok ? 'true' : 'false') + '" aria-label="OK: ' + esc(i.ga) + '">' + (s.ok ? '✓ OK' : 'OK') + '</button>') +
              '<textarea class="note" id="n-' + i.id + '" rows="1" placeholder="' + (i.question ? 'Your answer' : 'Correction or question') + '">' + esc(s.note || '') + '</textarea>' +
              (i.question || noted ? '' : '<div class="fix"><button type="button" class="fixbtn">Correct this</button></div>') + '</div>';
          }).join("") + '</div>' : '') + '</section>';
    }).join("") || '<p class="intro">Nothing in this view.</p>';
  }
  function render() {
    var items = allItems(), done = items.filter(checked).length;
    $("bar").style.width = items.length ? Math.round(done / items.length * 100) + "%" : "0%";
    $("count").textContent = done + " of " + items.length + " checked";
    var el = document.activeElement, focused = el && el.id, sel = el && el.selectionStart;
    renderSections("site", DATA.site); renderSections("songs", DATA.songs);
    if (focused) { var f = $(focused); if (f) { f.focus(); try { if (sel != null) f.setSelectionRange(sel, sel); } catch (e) {} } }
  }

  var timers = {};
  function save(id, patch) {
    var cur = Object.assign({}, st(id), patch); state[id] = cur;
    if (!canSave) return;
    $("status").textContent = "Saving…";
    fetch("api", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id, ok: !!cur.ok, note: cur.note || "" }) })
      .then(function (r) { return r.ok ? r.json() : r.json().then(function (j) { throw j; }); })
      .then(function (j) { if (j.saved) state[id] = j.saved; $("status").textContent = "Saved."; })
      .catch(function (e) { $("status").textContent = (e && e.error) || "Couldn't save just now. Tap again to retry."; });
  }

  $("app").addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList.contains("tab")) { document.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", x === t); }); $("site").classList.toggle("hidden-sec", t.dataset.v !== "site"); $("songs").classList.toggle("hidden-sec", t.dataset.v !== "songs"); return; }
    if (t.classList.contains("chip")) { filter = t.dataset.f; document.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === t); }); render(); return; }
    var row = t.closest(".row");
    if (t.classList.contains("ok") && row) { var on = t.getAttribute("aria-pressed") !== "true"; save(row.dataset.id, { ok: on }); render(); return; }
    if (t.classList.contains("fixbtn") && row) { row.classList.remove("collapsed"); t.closest(".fix").hidden = true; row.querySelector(".note").focus(); return; }
    var head = t.closest(".sec-head");
    if (head) { var rootId = head.closest("#site, #songs").id, si = head.dataset.si; open[rootId][si] = open[rootId][si] === false; render(); }
  });
  $("app").addEventListener("keydown", function (e) { var head = e.target.closest && e.target.closest(".sec-head"); if (head && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); head.click(); } });
  $("app").addEventListener("input", function (e) {
    var t = e.target; if (!t.classList.contains("note")) return; var row = t.closest(".row"), id = row.dataset.id;
    row.classList.toggle("noted", !!t.value.trim());
    clearTimeout(timers[id]); timers[id] = setTimeout(function () { save(id, { note: t.value }); render(); }, 900);
  });

  function corrections() {
    var out = ["# Gaeilge check — corrections (" + new Date().toISOString().slice(0, 10) + ")", ""];
    [["Site words", DATA.site], ["Song lyrics", DATA.songs]].forEach(function (pair) {
      out.push("## " + pair[0], "");
      pair[1].forEach(function (sec) {
        var rows = sec.items.filter(function (i) { return !i.heading && (st(i.id).note || "").trim(); }); if (!rows.length) return;
        out.push("### " + sec.title, "");
        rows.forEach(function (i) { var s = st(i.id); out.push("- **" + (i.ga || i.en) + "**" + (i.ga ? " (EN: " + i.en + ")" : "") + " → " + s.note.trim() + (s.by ? "  _(" + s.by + ")_" : "")); });
        out.push("");
      });
    });
    out.push("_" + allItems().filter(function (i) { return !checked(i); }).length + " items not yet looked at._");
    return out.join("\n");
  }
  $("copyBtn").addEventListener("click", function () {
    var txt = corrections();
    navigator.clipboard.writeText(txt).then(function () { $("copyMsg").textContent = "Copied."; }, function () { var ta = document.createElement("textarea"); ta.value = txt; ta.style.width = "100%"; ta.rows = 12; $("copyBtn").parentNode.appendChild(ta); ta.select(); $("copyMsg").textContent = "Copy the text below."; });
  });

  render();
  fetch("api").then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); }).then(function (res) {
    if (!res.ok) { canSave = false; $("status").textContent = res.j.error || "Saving isn't available."; $("me").textContent = "nobody"; return; }
    state = res.j.items || {}; $("me").textContent = res.j.me || "you"; $("status").textContent = "Ticks and corrections save automatically."; render();
  }).catch(function () { canSave = false; $("status").textContent = "Couldn't reach the saving service. Ticks won't be kept."; $("me").textContent = "unknown"; });
})();
