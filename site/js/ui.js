/* Shared pieces for the grown-ups area: the picture picker, printing, and small helpers. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var $ = function (id) { return document.getElementById(id); };

  CM.ui = {};

  /* ---------- picture picker ----------
     Opens under `anchor`. Sources: activities, the child's theme, all themes, symbols, My pictures.
     cb(ref) is called with a picture reference (see CM.ref in js/library.js). */
  var open = null;
  CM.ui.closePicker = function () { if (open) { open.remove(); open = null; } };
  CM.ui.pickRef = function (anchor, cb, opts) {
    opts = opts || {};
    CM.ui.closePicker();
    var box = document.createElement("div"); box.className = "picker"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Choose a picture");
    anchor.insertAdjacentElement("afterend", box); open = box;
    var src = opts.start || "act", symGroup = opts.group || "core", themeKey = CM.store.S().theme, q = "";
    var sources = [["act", "Activities"], ["theme", "Theme pictures"], ["sym", "Symbols"], ["mine", "My pictures"]];
    function list() {
      var out = [];
      if (src === "act") CM.ACTIVITIES.forEach(function (a, i) { out.push("a:" + i); });
      if (src === "theme") CM.THEMES[themeKey].items.forEach(function (it, i) { out.push("t:" + themeKey + ":" + i); });
      if (src === "sym") Object.keys(CM.SYMBOLS || {}).forEach(function (id) { if (q ? (CM.SYMBOLS[id][0] + " " + CM.SYMBOLS[id][1]).toLowerCase().indexOf(q) >= 0 : CM.SYMBOLS[id][2] === symGroup) out.push("s:" + id); });
      if (src === "mine") CM.lib.items().forEach(function (it) { out.push("i:" + it.id); });
      return out;
    }
    function render() {
      var extra = "";
      if (src === "theme") extra = '<div class="chips">' + Object.keys(CM.THEMES).map(function (k) { return '<button type="button" class="chip" data-th="' + k + '" aria-pressed="' + (k === themeKey) + '">' + CM.THEMES[k].items[0][0] + " " + esc(CM.THEMES[k].label) + "</button>"; }).join("") + "</div>";
      if (src === "sym") extra = '<div class="inline-field"><input type="search" id="pkSearch" placeholder="Search symbols" aria-label="Search symbols" value="' + esc(q) + '"></div>' +
        (q ? "" : '<div class="chips">' + (CM.SYMBOL_GROUPS || []).map(function (g) { return '<button type="button" class="chip" data-sg="' + g + '" aria-pressed="' + (g === symGroup) + '">' + esc({ core: "Core words", quick: "Yes, no, break", feelings: "Feelings", daily: "Daily life", places: "Places and travel", people: "People and pets" }[g] || g) + "</button>"; }).join("") + "</div>");
      var items = list();
      box.innerHTML = '<div class="row" style="justify-content:space-between"><b>Choose a picture</b><button type="button" class="small-btn" data-close>Close</button></div>' +
        '<div class="chips">' + sources.map(function (s) { return '<button type="button" class="chip" data-src="' + s[0] + '" aria-pressed="' + (s[0] === src) + '">' + s[1] + "</button>"; }).join("") + "</div>" + extra +
        '<div class="pk-grid">' + (items.length ? items.map(function (r) { var x = CM.ref(r); return '<button type="button" class="pk" data-r="' + esc(r) + '"><span class="pk-pic">' + x.html + '</span><span class="pk-name">' + esc(x.en || "") + "</span></button>"; }).join("")
          : '<p class="note">' + (src === "mine" ? "No pictures of your own yet. Add them on the Pictures tab." : "Nothing here.") + "</p>") + "</div>" +
        (CM.SYMBOLS ? '<p class="note small">Symbols: Mulberry Symbols by Steve Lee, CC BY-SA 4.0.</p>' : "");
      box.querySelector("[data-close]").onclick = CM.ui.closePicker;
      box.querySelectorAll("[data-src]").forEach(function (b) { b.onclick = function () { src = b.dataset.src; render(); }; });
      box.querySelectorAll("[data-th]").forEach(function (b) { b.onclick = function () { themeKey = b.dataset.th; render(); }; });
      box.querySelectorAll("[data-sg]").forEach(function (b) { b.onclick = function () { symGroup = b.dataset.sg; render(); }; });
      var se = box.querySelector("#pkSearch"); if (se) { se.oninput = function () { q = se.value.trim().toLowerCase(); var pos = se.selectionStart; render(); var n = box.querySelector("#pkSearch"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} }; }
      box.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { var r = b.dataset.r; CM.ui.closePicker(); cb(r); }; });
    }
    render();
    var first = box.querySelector("[data-src]"); if (first) first.focus();
  };

  /* ---------- printing ----------
     Fills a print-only area and opens the browser's print dialog (choose "Save as PDF" for a file). */
  CM.ui.print = function (html, title) {
    var area = $("printArea");
    if (!area) { area = document.createElement("div"); area.id = "printArea"; document.body.appendChild(area); }
    area.innerHTML = (title ? '<h1 class="pr-title">' + esc(title) + "</h1>" : "") + html + '<p class="pr-foot">Calm Match · calmmatch.com' + (/sym\b|symbols\//.test(html) ? " · Symbols: Mulberry Symbols by Steve Lee, CC BY-SA 4.0" : "") + "</p>";
    document.body.classList.add("printing");
    var done = function () { document.body.classList.remove("printing"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    // Give pictures a moment to load before the dialog opens.
    setTimeout(function () { try { window.print(); } catch (e) {} setTimeout(done, 1000); }, 300);
  };

  // A row of chips for small numbered choices in the grown-ups area.
  CM.ui.chips = function (el, entries, current, onPick) {
    el.innerHTML = entries.map(function (e) { return '<button type="button" class="chip" aria-pressed="' + (String(e[0]) === String(current)) + '" data-v="' + esc(e[0]) + '">' + e[1] + "</button>"; }).join("");
    el.querySelectorAll(".chip").forEach(function (b) { b.onclick = function () { onPick(b.dataset.v); }; });
  };

  // Tap twice to confirm something that can't be undone.
  CM.ui.twoTap = function (btn, idle, sure, fn) {
    var armed = false; btn.textContent = idle;
    btn.onclick = function () {
      if (armed) { armed = false; fn(); return; }
      armed = true; btn.textContent = sure;
      setTimeout(function () { if (armed) { armed = false; btn.textContent = idle; } }, 4000);
    };
  };
})();
