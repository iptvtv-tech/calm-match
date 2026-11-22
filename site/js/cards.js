/* Talk cards: picture cards to print and cut out (Grown-ups › Make › Talk cards).
   Starter cards ("I want", "I need" …) go next to a picture card on a sentence strip; whole-sentence cards
   ("I need a break") say it all on one card; picture cards come from the Talk board's pages, so a child sees
   the same picture on the screen and on paper. A grown-up can add their own sentence cards.
   The cards are made on this device and printed by the browser. Own sentence cards and the print choices are
   kept with the Talk board in the device library (js/library.js); nothing is sent anywhere.
   The Irish needs checking by a fluent speaker (tools/irish-review.js lists it). "…" in Irish marks where the
   word goes when Irish puts it in the middle ("Teastaíonn sos uaim"). */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var $ = function (id) { return document.getElementById(id); };

  // [id, English, Irish, symbol for the action, true = red "not" line over it]. Each also shows the "I" symbol.
  var STARTERS = [
    ["want", "I want", "Ba mhaith liom", "want"],
    ["dontwant", "I don't want", "Níor mhaith liom", "want", true],
    ["need", "I need", "Teastaíonn … uaim", "need"],
    ["love", "I love", "Is breá liom", "love"],
    ["like", "I like", "Is maith liom", "like"],
    ["dontlike", "I don't like", "Ní maith liom", "like", true],
    ["feel", "I feel", "Tá mé …", "feel"],
    ["see", "I see", "Feicim", "look"]
  ];
  // [id, English, Irish, symbol]
  var SENTENCES = [
    ["toilet", "I need the toilet", "Tá orm dul go dtí an leithreas", "toilet"],
    ["break", "I need a break", "Teastaíonn sos uaim", "break"],
    ["help", "Help me, please", "Cabhraigh liom, le do thoil", "help"],
    ["drink", "I want a drink", "Ba mhaith liom deoch", "drink"],
    ["hungry", "I'm hungry", "Tá ocras orm", "hungry"],
    ["tired", "I'm tired", "Tá mé tuirseach", "tired"],
    ["sad", "I feel sad", "Tá mé brónach", "sad"],
    ["happy", "I feel happy", "Tá mé sásta", "happy"],
    ["hug", "I want a hug", "Ba mhaith liom barróg", "hug"],
    ["loveyou", "I love you", "Is breá liom thú", "love"],
    ["loud", "It's too loud", "Tá sé róghlórach", "loud"],
    ["hurts", "It hurts", "Tá pian orm", "hurt"],
    ["outside", "I want to go outside", "Ba mhaith liom dul amach", "outside"],
    ["more", "More, please", "Tuilleadh, le do thoil", "more"],
    ["done", "All done", "Críochnaithe", "finished"],
    ["stop", "Stop", "Stop", "stop"]
  ];
  var SIZES = [["large", "Large", 6], ["medium", "Medium", 12], ["keyring", "Keyring", 20]];
  var MAX_OWN = 24;

  // Edge colours follow the usual communication-board colours (a softened Fitzgerald Key):
  // act = action words (green), thing = things and places (orange), people (yellow),
  // feel = feelings and describing words (blue), say = whole sentences and chat (pink).
  var GROUP_KIND = { quick: "say", social: "say", feelings: "feel", describe: "feel", people: "people" };
  var CORE_KIND = { i: "people", you: "people", he: "people", she: "people", it: "people",
    want: "act", like: "act", love: "act", need: "act", help: "act", stop: "act", go: "act", look: "act", get: "act",
    make: "act", put: "act", open: "act", turn: "act", "do": "act", can: "act" };
  function kindOf(r) {
    var m = /^s:([a-z0-9]+)$/.exec(r), s = m && CM.SYMBOLS && CM.SYMBOLS[m[1]];
    if (!s) return "thing";
    if (s[2] === "core") return CORE_KIND[m[1]] || "feel";
    return GROUP_KIND[s[2]] || "thing";
  }

  // Picture-card pages: the Talk board's own pages, in the board's order.
  function pages(k) {
    // Page names in the child's language, as in the Talk tab's "Ready-made pages" list.
    var t = function (key) { return CM.t(key); }, out = [["mine", t("tpMine"), k.talk.choices]];
    CM.talk.WANT.concat(CM.talk.WORDS).forEach(function (p) {
      if (p[0] === "mine") return;
      if (p[0] === "core") { out.push(["core", t("tpCore"), CM.talk.CORE.map(function (id) { return "s:" + id; })]); return; }
      out.push([p[0], t(p[1]), p[2].map(function (id) { return "s:" + id; })]);
    });
    out.push(["words", t("myWords"), k.talk.words]);
    return out;
  }

  function opts(k) {
    var o = k.talk.print = k.talk.print && typeof k.talk.print === "object" ? k.talk.print : {};
    if (typeof o.starters !== "boolean") o.starters = true;
    if (typeof o.sentences !== "boolean") o.sentences = true;
    o.pages = Array.isArray(o.pages) ? o.pages : [];
    o.skip = Array.isArray(o.skip) ? o.skip : [];
    if (!SIZES.some(function (s) { return s[0] === o.size; })) o.size = "medium";
    if (o.edges !== "plain") o.edges = "colour";
    if (["en", "ga", "both"].indexOf(o.words) < 0) o.words = CM.lang();
    return o;
  }

  function sym(id, not) { return '<span class="pc-ov">' + CM.symHtml(id) + (not ? CM.symHtml("not") : "") + "</span>"; }
  function list(k, o) {
    var out = [];
    if (o.starters) STARTERS.forEach(function (s) {
      if (o.skip.indexOf("st:" + s[0]) < 0) out.push({ kind: "act", pics: [sym("i"), sym(s[3], s[4])], en: s[1], ga: s[2] });
    });
    if (o.sentences) {
      SENTENCES.forEach(function (s) { if (o.skip.indexOf("se:" + s[0]) < 0) out.push({ kind: "say", pics: [sym(s[3])], en: s[1], ga: s[2] }); });
      k.talk.cards.forEach(function (c) { if (c && c.r) out.push({ kind: "say", pics: [CM.ref(c.r).html], en: String(c.en || ""), ga: String(c.ga || "") }); });
    }
    pages(k).forEach(function (p) {
      if (o.pages.indexOf(p[0]) < 0) return;
      p[2].forEach(function (r) { var x = CM.ref(r); out.push({ kind: kindOf(r), pics: [x.html], en: x.en, ga: x.ga }); });
    });
    return out;
  }

  function words(c, mode) {
    var en = c.en || "", ga = c.ga || "";
    if (mode === "ga") return ga ? '<b class="pc-w" lang="ga">' + esc(ga) + "</b>" : en ? '<b class="pc-w">' + esc(en) + "</b>" : "";
    return (en ? '<b class="pc-w">' + esc(en) + "</b>" : "") + (mode === "both" && ga && ga !== en ? '<span class="pc-ga" lang="ga">' + esc(ga) + "</span>" : "");
  }
  function cardHtml(c, o) {
    return '<div class="pc-cell"><div class="pc-card k-' + c.kind + '">' + (o.size === "keyring" ? '<i class="pc-hole" aria-hidden="true"></i>' : "") +
      '<div class="pc-pics' + (c.pics.length > 1 ? " two" : "") + '">' + c.pics.join("") + "</div>" + words(c, o.words) + "</div></div>";
  }
  function per(o) { return SIZES.filter(function (s) { return s[0] === o.size; })[0][2]; }
  function sheets(cards, o) {
    var n = per(o), html = "";
    for (var i = 0; i < cards.length; i += n) html += '<div class="pc-sheet">' + cards.slice(i, i + n).map(function (c) { return cardHtml(c, o); }).join("") + "</div>";
    return wrap(o) + html + "</div>";
  }
  function wrap(o, extra) { return '<div class="pc pc-' + o.size + " pc-" + o.edges + (o.words === "both" ? " pc-both" : "") + (extra || "") + '">'; }

  // Start loading every picture the chosen cards use while the grown-up is still choosing, so Print can open the
  // print window straight away (CM.ui.print also waits for any that are still loading).
  var loaded = {}, keep = [];
  function preload(cards) {
    cards.forEach(function (c) {
      c.pics.join("").replace(/src="([^"]+)"/g, function (m, u) {
        u = u.replace(/&amp;/g, "&");
        if (!loaded[u]) { loaded[u] = 1; var im = new Image(); im.src = u; keep.push(im); }
        return m;
      });
    });
  }

  /* ---------- grown-ups: Talk cards tab ---------- */
  function renderTab(box, helpers) {
    var k = CM.lib.kid(), o = opts(k), pg = pages(k), cards = list(k, o), sheetsN = Math.ceil(cards.length / per(o));
    preload(cards);
    var check = function (attr, val, on, label, n) {
      return '<label class="check"><input type="checkbox" ' + attr + '="' + esc(val) + '"' + (on ? " checked" : "") + "> " + esc(label) + (n != null ? " <small>(" + n + ")</small>" : "") + "</label>";
    };
    var own = k.talk.cards;
    own.forEach(function (c) { c.en = String(c.en || ""); c.ga = String(c.ga || ""); });
    box.innerHTML =
      '<div><h3>Talk cards</h3><p class="note">Picture cards to print and cut out, with the same pictures as the Talk board. Put a starter card like "I want" next to a picture card, or use a whole-sentence card like "I need a break". Keep them on the fridge, in a folder or on a keyring.</p></div>' +
      '<div><h3>Which cards</h3><div class="tk-hide">' + check("data-set", "starters", o.starters, "Starter cards", STARTERS.length) + check("data-set", "sentences", o.sentences, "Whole sentences", SENTENCES.length + own.length) + "</div>" +
        '<details class="pc-choose"><summary>Choose which starters and sentences</summary><div class="tk-hide">' +
          STARTERS.map(function (s) { return check("data-skip", "st:" + s[0], o.skip.indexOf("st:" + s[0]) < 0, s[1]); }).join("") + "</div><div class=\"tk-hide\">" +
          SENTENCES.map(function (s) { return check("data-skip", "se:" + s[0], o.skip.indexOf("se:" + s[0]) < 0, s[1]); }).join("") + "</div></details>" +
        '<p class="note">Picture cards from the Talk board:</p><div class="tk-hide">' +
          pg.map(function (p) { return check("data-page", p[0], o.pages.indexOf(p[0]) >= 0, p[1], p[2].length); }).join("") + "</div></div>" +
      '<div><h3>How they look</h3>' +
        '<p class="pc-lbl">Size</p><div class="chips" id="pcSize"></div>' +
        '<p class="pc-lbl">Edges</p><div class="chips" id="pcEdges"></div>' +
        '<p class="pc-lbl">Words</p><div class="chips" id="pcWords"></div>' +
        '<p class="note">Colour edges use the usual communication-board colours: green for action words, orange for things and places, yellow for people, blue for feelings and describing words, pink for whole sentences.</p>' +
        '<div class="pc-preview" role="group" aria-label="Preview of the first cards">' + (cards.length ? wrap(o, " pc-screen") + cards.slice(0, 4).map(function (c) { return cardHtml(c, o); }).join("") + "</div>" : '<p class="note">No cards chosen yet.</p>') + "</div>" +
        '<div class="row start"><button class="small-btn primary" type="button" id="pcPrint"' + (cards.length ? "" : " disabled") + '>Print cards</button><span class="note" id="pcCount">Cards: ' + cards.length + " · Sheets: " + sheetsN + "</span></div>" +
        '<p class="note">Cut along the dashed lines. Choose "Save as PDF" in the print window for a file. Laminating makes them last.</p></div>' +
      '<div><h3>My sentence cards</h3><p class="note">Your own whole-sentence cards, for example "I want to go to Granny\'s" with a photo of her house. Up to ' + MAX_OWN + '. They print with the whole sentences and are kept on this device.</p>' +
        '<ul class="mp-list">' + (own.length ? own.map(function (c, i) {
          return '<li class="mp"><span class="mp-pic">' + CM.ref(c.r).html + '</span><div class="mp-body">' +
            '<label class="field">Words<input type="text" maxlength="60" data-cen="' + i + '" value="' + esc(c.en) + '" placeholder="For example, I want to go to Granny\'s"></label>' +
            '<label class="field">In Irish (optional)<input type="text" maxlength="60" data-cga="' + i + '" value="' + esc(c.ga) + '"></label>' +
            '<div class="row start"><button type="button" class="small-btn" data-cpic="' + i + '">Change picture</button><button type="button" class="small-btn danger" data-cdel="' + i + '">Delete</button></div></div></li>';
        }).join("") : '<li class="note">None yet.</li>') + "</ul>" +
        '<button class="small-btn" type="button" id="pcAdd"' + (own.length >= MAX_OWN ? " disabled" : "") + ">Add a sentence card</button></div>";

    var save = function () { CM.lib.save(); };
    var again = function (focusSel) { renderTab(box, helpers); var f = focusSel && box.querySelector(focusSel); if (f) f.focus(); };
    CM.ui.chips($("pcSize"), SIZES.map(function (s) { return [s[0], s[1] + " (" + s[2] + " a sheet)"]; }), o.size, function (v) { o.size = v; save(); again('#pcSize [data-v="' + v + '"]'); });
    CM.ui.chips($("pcEdges"), [["colour", "Colour"], ["plain", "Black and white"]], o.edges, function (v) { o.edges = v; save(); again('#pcEdges [data-v="' + v + '"]'); });
    CM.ui.chips($("pcWords"), [["en", "English"], ["ga", "Gaeilge"], ["both", "Both"]], o.words, function (v) { o.words = v; save(); again('#pcWords [data-v="' + v + '"]'); });
    box.querySelectorAll("[data-set]").forEach(function (c) { c.onchange = function () { o[c.dataset.set] = c.checked; save(); again('[data-set="' + c.dataset.set + '"]'); }; });
    box.querySelectorAll("[data-skip]").forEach(function (c) {
      c.onchange = function () { var id = c.dataset.skip, i = o.skip.indexOf(id); if (c.checked && i >= 0) o.skip.splice(i, 1); if (!c.checked && i < 0) o.skip.push(id); save(); again('[data-skip="' + id + '"]'); };
    });
    var det = box.querySelector(".pc-choose"); if (det && box.__pcOpen) det.open = true;
    if (det) det.ontoggle = function () { box.__pcOpen = det.open; };
    box.querySelectorAll("[data-page]").forEach(function (c) {
      c.onchange = function () { var id = c.dataset.page, i = o.pages.indexOf(id); if (c.checked && i < 0) o.pages.push(id); if (!c.checked && i >= 0) o.pages.splice(i, 1); save(); again('[data-page="' + id + '"]'); };
    });
    $("pcPrint").onclick = function () { var c = list(k, o); if (c.length) CM.ui.print(sheets(c, o)); };
    $("pcAdd").onclick = function () {
      CM.ui.pickRef($("pcAdd"), function (r) { if (own.length < MAX_OWN) own.push({ r: r, en: "", ga: "" }); save(); again('[data-cen="' + (own.length - 1) + '"]'); });
    };
    // Typing only saves (no redraw), so moving to the next box keeps the cursor where the grown-up put it.
    box.querySelectorAll("[data-cen]").forEach(function (inp) { inp.onchange = function () { own[+inp.dataset.cen].en = inp.value.trim().slice(0, 60); save(); }; });
    box.querySelectorAll("[data-cga]").forEach(function (inp) { inp.onchange = function () { own[+inp.dataset.cga].ga = inp.value.trim().slice(0, 60); save(); }; });
    box.querySelectorAll("[data-cpic]").forEach(function (b) { b.onclick = function () { var i = +b.dataset.cpic; CM.ui.pickRef(b, function (r) { own[i].r = r; save(); again('[data-cpic="' + i + '"]'); }); }; });
    box.querySelectorAll("[data-cdel]").forEach(function (b) { b.onclick = function () { own.splice(+b.dataset.cdel, 1); save(); again("#pcAdd"); }; });
  }

  CM.cards = { STARTERS: STARTERS, SENTENCES: SENTENCES, renderTab: renderTab, list: list, sheets: sheets, opts: opts };
})();
