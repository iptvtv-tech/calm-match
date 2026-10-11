/* Talk board: an "I want" choice board, 36 core words and the child's own words, with a sentence strip.
   A simple practice board, not a replacement for a full communication app.
   Buttons never move once placed, because children learn a board by where things are.
   Nothing tapped is saved or sent anywhere. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc, t = function (k, v) { return CM.t(k, v); };
  var $ = function (id) { return document.getElementById(id); };
  // Core words in a fixed 6 x 6 order (the Universal Core words from Project Core).
  var CORE = ["i", "want", "like", "not", "more", "help", "you", "go", "look", "get", "make", "stop", "he", "she", "it", "put", "open", "turn",
    "do", "can", "good", "same", "different", "finished", "in", "on", "up", "here", "that", "all", "what", "where", "who", "when", "why", "some"];
  var QUICK = ["help", "break", "more", "stop", "finished", "yes", "no"];
  // Ready-made pages. Each keeps a fixed order so a child can learn where things are.
  // "mine" (the grown-up's own choices) and "core" are built in; the rest can be hidden by a grown-up.
  var WANT = [
    ["mine", "tpMine"],
    ["food", "tpFood", ["apple", "banana", "grapes", "strawberry", "yogurt", "cheese", "toast", "cereal", "sandwich", "pasta", "pizza", "chips", "crisps", "biscuit", "icecream", "chocolate"]],
    ["drink", "tpDrink", ["water", "milk", "orangejuice", "applejuice", "squash", "hotchocolate"]],
    ["play", "tpPlay", ["ball", "bubbles", "blocks", "teddy", "toycar", "puzzle", "crayons", "playdough", "paint", "book", "music", "tv", "game", "trampoline", "swing", "slide"]],
    ["places", "tpPlaces", ["outside", "park", "garden", "home", "shop", "beach", "swim", "car", "bus", "school", "toilet", "bedtime"]],
    ["calm", "tpCalm", ["hug", "break", "quiet", "blanket", "headphones", "squeeze", "tickle", "rock", "music", "lightsoff", "bath", "sleep"]]
  ];
  var WORDS = [
    ["core", "tpCore"],
    ["chat", "tpChat", ["hello", "goodbye", "please", "thankyou", "sorry", "yes", "no", "myturn", "yourturn", "wait", "again", "come"]],
    ["feel", "tpFeel", ["feel", "happy", "sad", "angry", "worried", "scared", "excited", "surprised", "tired", "hungry", "thirsty", "hurt"]],
    ["body", "tpBody", ["hurt", "head", "ear", "eyes", "mouth", "teeth", "tummy", "arm", "leg", "feet", "plaster", "toilet"]],
    ["describe", "tpDescribe", ["big", "little", "hot", "cold", "wet", "dirty", "broken", "loud", "quiet", "down", "out", "off"]],
    ["people", "tpPeople", ["mum", "dad", "brother", "sister", "baby", "granny", "grandad", "friend", "teacher", "doctor", "dog", "cat"]]
  ];
  var strip = [], tab = "want", page = { want: "mine", words: "core" }, h = null;
  function shown(list) { var hide = CM.lib.kid().talk.hide || []; return list.filter(function (p) { return p.length < 3 || hide.indexOf(p[0]) < 0; }); }
  function pageRow(which, list) {
    if (list.length < 2) return "";
    return '<div class="chips tk-pages" role="group" aria-label="' + esc(t(which === "want" ? "iWant" : "words")) + '">' + list.map(function (p) {
      return '<button type="button" class="chip" data-pg="' + p[0] + '" aria-pressed="' + (page[which] === p[0]) + '">' + esc(t(p[1])) + "</button>";
    }).join("") + "</div>";
  }

  function say(r, text) { if (CM.voice && CM.voice.play(r)) return; h.say(text); }
  function cell(r, extra) { var x = CM.ref(r); return '<button type="button" class="tk' + (extra || "") + '" data-r="' + esc(r) + '"><span class="tk-pic">' + x.html + '</span><span class="tk-word">' + esc(x.name) + "</span></button>"; }

  function render() {
    var k = CM.lib.kid(), box = $("talk");
    var grid = "", wl = shown(WANT), dl = shown(WORDS);
    if (!wl.some(function (p) { return p[0] === page.want; })) page.want = "mine";
    if (!dl.some(function (p) { return p[0] === page.words; })) page.words = "core";
    if (tab === "want") {
      var wp = wl.filter(function (p) { return p[0] === page.want; })[0];
      grid = pageRow("want", wl) + '<div class="tk-grid ' + (page.want === "mine" ? "want" : "ready") + '">' + (page.want === "mine" ? (k.talk.choices.length ? k.talk.choices.map(function (r) { return cell(r, " big"); }).join("") : '<p class="note">' + esc(t("talkEmptyWant")) + "</p>") : wp[2].map(function (id) { return cell("s:" + id); }).join("")) + "</div>" +
        '<div class="tk-grid quick">' + QUICK.map(function (id) { return cell("s:" + id); }).join("") + "</div>";
    }
    if (tab === "words") {
      var dp = dl.filter(function (p) { return p[0] === page.words; })[0];
      grid = pageRow("words", dl) + (page.words === "core" ? '<div class="tk-grid core">' + CORE.map(function (id) { return cell("s:" + id); }).join("") + "</div>" :
        '<div class="tk-grid ready">' + dp[2].map(function (id) { return cell("s:" + id); }).join("") + "</div>");
    }
    if (tab === "mine") grid = '<div class="tk-grid mine">' + (k.talk.words.length ? k.talk.words.map(function (r) { return cell(r); }).join("") : '<p class="note">' + esc(t("talkEmptyWords")) + "</p>") + "</div>";
    box.innerHTML =
      '<div class="tk-top"><div class="tk-strip" aria-live="polite" aria-label="' + esc(t("sayIt")) + '">' + strip.map(function (r) { return '<span class="tk-s">' + CM.ref(r.r).html + "<b>" + esc(r.text) + "</b></span>"; }).join("") + "</div>" +
      '<div class="tk-acts"><button type="button" class="small-btn primary" id="tkSay">🔊 ' + esc(t("sayIt")) + '</button><button type="button" class="small-btn" id="tkBack" aria-label="' + esc(t("tkBack")) + '">⌫<span class="tk-bk"> ' + esc(t("tkBackShort")) + '</span></button><button type="button" class="small-btn" id="tkClear">' + esc(t("clear")) + '</button><button type="button" class="small-btn" id="tkClose">' + esc(t("close")) + "</button></div></div>" +
      '<div class="tabs tk-tabs" role="tablist">' + [["want", t("iWant")], ["words", t("words")], ["mine", t("myWords")]].map(function (x) { return '<button class="tab" role="tab" type="button" data-tt="' + x[0] + '" aria-selected="' + (x[0] === tab) + '">' + esc(x[1]) + "</button>"; }).join("") + "</div>" + grid;
    box.querySelectorAll("[data-tt]").forEach(function (b) { b.onclick = function () { tab = b.dataset.tt; render(); var f = box.querySelector('[data-tt="' + tab + '"]'); if (f) f.focus(); }; });
    box.querySelectorAll("[data-pg]").forEach(function (b) { b.onclick = function () { page[tab] = b.dataset.pg; render(); var f = box.querySelector('[data-pg="' + page[tab] + '"]'); if (f) f.focus(); }; });
    box.querySelectorAll("[data-r]").forEach(function (b) {
      b.onclick = function () {
        var r = b.dataset.r, x = CM.ref(r);
        if (tab === "want" && !b.closest(".quick")) {
          strip = [{ r: "s:want", text: t("iWant") }, { r: r, text: x.name }];
          say(r, t("sayIWant", { x: x.name }));
        } else {
          if (strip.length >= 8) strip.shift();
          strip.push({ r: r, text: x.name }); say(r, x.name);
        }
        render();
        var again = box.querySelector('[data-r="' + CM.esc(r) + '"]'); if (again) again.focus();
      };
    });
    $("tkSay").onclick = function () { if (strip.length) h.say(strip.map(function (s) { return s.text; }).join(" ")); };
    $("tkBack").onclick = function () { if (strip.length) { strip.pop(); render(); $("tkBack").focus(); } };
    $("tkClear").onclick = function () { strip = []; render(); };
    $("tkClose").onclick = function () { CM.talk.close(); };
  }

  CM.talk = {
    CORE: CORE, QUICK: QUICK, WANT: WANT, WORDS: WORDS,
    init: function (helpers) { h = helpers; },
    open: function () { var box = $("talk"); box.hidden = false; document.body.classList.add("talking"); $("stage").hidden = true; strip = []; render(); var f = box.querySelector(".tab[aria-selected=true]"); if (f) f.focus(); },
    close: function () { $("talk").hidden = true; document.body.classList.remove("talking"); $("stage").hidden = false; var b = $("talkBtn"); if (b) b.focus(); },
    isOpen: function () { var b = $("talk"); return b && !b.hidden; },

    /* ---------- grown-ups: Talk tab ---------- */
    renderTab: function (box, helpers) {
      var k = CM.lib.kid(), S = CM.store.S();
      var row = function (r, list, i) {
        var x = CM.ref(r);
        return '<li><span class="se-e">' + x.html + '</span><span class="se-name">' + esc(x.name) + "</span>" +
          (CM.voice ? CM.voice.button(CM.voice.refKey(r)) : "") +
          '<button type="button" class="se-btn" data-mv="-1" data-l="' + list + '" data-k="' + i + '" aria-label="Move ' + esc(x.name) + ' earlier"' + (i ? "" : " disabled") + ">↑</button>" +
          '<button type="button" class="se-btn" data-mv="1" data-l="' + list + '" data-k="' + i + '" aria-label="Move ' + esc(x.name) + ' later">↓</button>' +
          '<button type="button" class="se-btn" data-rm="' + i + '" data-l="' + list + '" aria-label="Remove ' + esc(x.name) + '">✕</button></li>';
      };
      box.innerHTML =
        '<div><h3>Talk board</h3><p class="note">A simple board your child can tap to say what they want, or to build short sentences. It works offline and nothing tapped is saved or sent. It is a practice board: a child who relies on a communication aid should use the system their speech and language therapist sets up.</p>' +
        '<label class="toggle" style="border:0"><input type="checkbox" id="talkOn"' + (S.talk ? " checked" : "") + '><span>Show the Talk button to ' + esc(CM.store.P().name) + "<small>A 💬 Talk button appears at the top of the games, the schedule and the stories.</small></span></label>" +
        '<div class="row start"><button class="small-btn primary" type="button" id="talkTry">Open the board</button><button class="small-btn" type="button" id="talkPrint">Print the boards</button></div></div>' +
        '<div><h3>"I want" choices</h3><p class="note">Up to 12 big buttons. A tap says "I want …". Help, break, more, stop, finished, yes and no are always there.</p><ol class="sched-edit" id="wantList">' + k.talk.choices.map(function (r, i) { return row(r, "choices", i); }).join("") + '</ol><button class="small-btn" type="button" id="wantAdd"' + (k.talk.choices.length >= 12 ? " disabled" : "") + ">Add a choice</button></div>" +
        '<div><h3>My words</h3><p class="note">Up to 24 extra words for the third page: people, places, favourite things. Use the Pictures tab to add your own photos and words.</p><ol class="sched-edit" id="wordList">' + k.talk.words.map(function (r, i) { return row(r, "words", i); }).join("") + '</ol><button class="small-btn" type="button" id="wordAdd"' + (k.talk.words.length >= 24 ? " disabled" : "") + ">Add a word</button></div>" +
        '<div><h3>Ready-made pages</h3><p class="note">Extra pages of pictures your child can switch between. Each page always keeps the same order. Untick any your child doesn\'t need yet: fewer pages can be easier to start with.</p><div class="tk-hide">' +
          WANT.concat(WORDS).filter(function (p) { return p.length > 2; }).map(function (p) { return '<label class="check"><input type="checkbox" data-hide="' + p[0] + '"' + ((k.talk.hide || []).indexOf(p[0]) < 0 ? " checked" : "") + "> " + esc(CM.t(p[1])) + " <small>(" + p[2].length + ")</small></label>"; }).join("") + "</div></div>" +
        '<div><h3>Core words</h3><p class="note">36 words that are useful all day, in the same place every time, based on the Universal Core words from Project Core. Symbols: Mulberry Symbols by Steve Lee, CC BY-SA 4.0. The Irish words need checking by a fluent speaker.</p></div>';
      $("talkOn").onchange = function () { S.talk = $("talkOn").checked; CM.store.save(); helpers.refresh(); };
      $("talkTry").onclick = function () { helpers.showChild(function () { CM.talk.open(); }); };
      $("talkPrint").onclick = function () { printBoards(); };
      $("wantAdd").onclick = function () { CM.ui.pickRef($("wantAdd"), function (r) { if (k.talk.choices.length < 12) k.talk.choices.push(r); CM.lib.save(); CM.talk.renderTab(box, helpers); }); };
      $("wordAdd").onclick = function () { CM.ui.pickRef($("wordAdd"), function (r) { if (k.talk.words.length < 24) k.talk.words.push(r); CM.lib.save(); CM.talk.renderTab(box, helpers); }, { start: "mine" }); };
      box.querySelectorAll("[data-mv]").forEach(function (b) { b.onclick = function () { var L = k.talk[b.dataset.l], i = +b.dataset.k, j = i + +b.dataset.mv; if (j < 0 || j >= L.length) return; var x = L[i]; L[i] = L[j]; L[j] = x; CM.lib.save(); CM.talk.renderTab(box, helpers); }; });
      box.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { k.talk[b.dataset.l].splice(+b.dataset.rm, 1); CM.lib.save(); CM.talk.renderTab(box, helpers); }; });
      box.querySelectorAll("[data-hide]").forEach(function (c) { c.onchange = function () { var hd = k.talk.hide = k.talk.hide || [], id = c.dataset.hide, i = hd.indexOf(id); if (c.checked && i >= 0) hd.splice(i, 1); if (!c.checked && i < 0) hd.push(id); CM.lib.save(); }; });
      if (CM.voice) CM.voice.bind(box);
    }
  };

  function printBoards() {
    var k = CM.lib.kid(), card = function (r) { var x = CM.ref(r); return '<div class="pr-card"><div class="pr-pic">' + x.html + "</div><b>" + esc(x.name) + "</b></div>"; };
    var html = '<h2>' + esc(t("words")) + '</h2><div class="pr-grid six">' + CORE.map(function (id) { return card("s:" + id); }).join("") + "</div>" +
      '<div class="pr-break"></div><h2>' + esc(t("iWant")) + '</h2><div class="pr-grid four">' + k.talk.choices.concat(QUICK.map(function (id) { return "s:" + id; })).map(card).join("") + "</div>" +
      shown(WANT).concat(shown(WORDS)).filter(function (p) { return p.length > 2; }).map(function (p) { return '<div class="pr-break"></div><h2>' + esc(t(p[1])) + '</h2><div class="pr-grid four">' + p[2].map(function (id) { return card("s:" + id); }).join("") + "</div>"; }).join("") +
      (k.talk.words.length ? '<div class="pr-break"></div><h2>' + esc(t("myWords")) + '</h2><div class="pr-grid four">' + k.talk.words.map(card).join("") + "</div>" : "");
    CM.ui.print(html, "Talk board · " + CM.store.P().name);
  }
})();
