/* Emma voice check: lists every recording from manifest.json so the owner can listen and flag ones to remake. */
(function () {
  "use strict";
  var KEY = "cm-emma-flags", flags = {};
  try { flags = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { flags = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(flags)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var audio = null, queue = [], playingLi = null;

  function stop() { queue = []; if (audio) { audio.pause(); audio = null; } if (playingLi) playingLi.classList.remove("playing"); playingLi = null; }
  function play(li) {
    if (audio) audio.pause();
    if (playingLi) playingLi.classList.remove("playing");
    playingLi = li; li.classList.add("playing");
    audio = new Audio(li.dataset.src);
    audio.onended = function () { li.classList.remove("playing"); var n = queue.shift(); if (n) setTimeout(function () { play(n); }, 500); };
    audio.play().catch(function () {});
    li.scrollIntoView({ block: "nearest" });
  }
  function label(path) {
    var m = path.match(/^en\/say\/([a-z])-(.+)\.mp3$/);
    if (m) return /^x-/.test(path.split("/").pop()) ? m[2].replace(/-/g, " ") + " ends with x" : m[1].toUpperCase() + " for " + m[2].replace(/-/g, " ");
    m = path.match(/\/(letters|words|phrases)\/(.+)\.mp3$/);
    if (m) return m[1] === "letters" ? m[2].toUpperCase() : m[2].replace(/-/g, " ");
    return path;
  }

  fetch("manifest.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (m) {
    var lib = (m.lib && m.lib.en) || {}, core = {}, groups = { say: [], letters: [], words: [], phrases: [], core: [], later: [] };
    (m.core || []).forEach(function (p) { core[p] = 1; });
    (m.files || []).forEach(function (p) {
      if (p.indexOf("/lib/") > 0) return; // listed below, by phrase
      var g = p.indexOf("/say/") > 0 ? "say" : p.indexOf("/letters/") > 0 ? "letters" : p.indexOf("/words/") > 0 ? "words" : "phrases";
      if (p.indexOf("en/") === 0) groups[g].push({ text: label(p), path: p });
    });
    Object.keys(lib).forEach(function (k) {
      var p = lib[k]; if (p.indexOf("/lib/") < 0) return;
      groups[core[p] ? "core" : "later"].push({ text: k, path: p });
    });
    var names = { say: "Alphabet book cards (A for apple…)", letters: "Letters on their own", words: "Alphabet words on their own (also used in games)",
      phrases: "Other alphabet phrases", core: "Games: instructions, praise, picture names", later: "Talk board, stories, schedules, timers, numbers" };
    $("groups").innerHTML = Object.keys(names).filter(function (g) { return groups[g].length; }).map(function (g) {
      var items = groups[g].sort(function (a, b) { return a.text.localeCompare(b.text); });
      return '<details' + (g === "say" ? " open" : "") + ' data-g="' + g + '"><summary>' + esc(names[g]) + ' <span class="n">(' + items.length + ")</span></summary>" +
        '<div class="row"><button type="button" data-all="' + g + '">▶ Play all</button></div><ul>' + items.map(function (it) {
          return '<li data-src="' + esc(it.path) + '" data-text="' + esc(it.text) + '"' + (flags[it.path] ? ' class="flag"' : "") + '><button type="button" class="play" aria-label="Play ' + esc(it.text) + '">▶</button>' +
            '<span class="t">' + esc(it.text) + '</span><label class="f"><input type="checkbox"' + (flags[it.path] ? " checked" : "") + "> Sounds wrong</label></li>";
        }).join("") + "</ul></details>";
    }).join("");
    update();
  }).catch(function () { $("groups").innerHTML = "<p>Couldn't load the list of recordings.</p>"; });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.classList.contains("play")) { queue = []; play(b.closest("li")); }
    else if (b.dataset.all) { stop(); queue = [].slice.call(document.querySelectorAll('details[data-g="' + b.dataset.all + '"] li')).filter(function (li) { return !li.hidden; }); var f = queue.shift(); if (f) play(f); }
  });
  document.addEventListener("change", function (e) {
    var cb = e.target; if (cb.type !== "checkbox") return;
    var li = cb.closest("li"), p = li.dataset.src;
    if (cb.checked) flags[p] = li.dataset.text; else delete flags[p];
    li.classList.toggle("flag", cb.checked); save(); update();
  });
  $("stop").onclick = stop;
  $("q").oninput = function () {
    var q = this.value.trim().toLowerCase();
    document.querySelectorAll("li[data-text]").forEach(function (li) { li.hidden = q && li.dataset.text.toLowerCase().indexOf(q) < 0; });
    if (q) document.querySelectorAll("details").forEach(function (d) { d.open = true; });
  };
  function update() {
    var list = Object.keys(flags).map(function (p) { return flags[p] + "  (" + p + ")"; });
    $("out").value = list.length ? "Emma recordings that sound wrong:\n" + list.join("\n") : "";
    $("count").textContent = list.length ? list.length + " ticked" : "";
  }
  $("copy").onclick = function () {
    update(); var t = $("out").value || "Nothing ticked yet.";
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { $("copy").textContent = "Copied ✓"; setTimeout(function () { $("copy").textContent = "Copy ticked list"; }, 1500); })
      .catch(function () { $("out").select(); });
  };
})();
