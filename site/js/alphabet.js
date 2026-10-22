/* The alphabet: words for each letter, in English and in Irish, plus a family's own words and photos.
   Used by the Alphabet book (alphabet/), the Alphabet tab in the grown-ups area and the Letters game.

   Each language has its own word list. A translation would land on the wrong letter (apple / úll),
   so the Irish words are chosen for the Irish alphabet, not translated from the English ones.

   Words are picked by their FIRST SOUND, not only their spelling, because that is how children learn letters:
   - no silent letters (knife, write) and no two-letter sounds at the start (cheese, shoe, thumb, whale);
   - hard C and G only (cat, goat), never soft (circle, giraffe);
   - Irish: the plain dictionary form (bó, not an bhó), and broad S and T (solas, traein), because a slender
     S or T sounds like "sh" or "ch" (sicín, tíogar).
   An item is [emoji, word] or [emoji, word, "end"]: "end" means the letter is at the end (fox, box), for X.
   Emoji are all Unicode 13 or older so they show on older tablets.

   Family words and photos stay on this device (js/media.js and the device library, js/library.js),
   and are included in the backup file. They are never uploaded. */
(function () {
  "use strict";
  var CM = (window.CM = window.CM || {});
  // The Alphabet book page doesn't load common.js, so it gets these small helpers here.
  CM.safeGet = CM.safeGet || function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  CM.safeSet = CM.safeSet || function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  CM.esc = CM.esc || function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  var WORDS = {
    en: {
      A: [["🍎", "apple"], ["🐜", "ant"], ["🐊", "alligator"], ["🚑", "ambulance"], ["👩‍🚀", "astronaut"]],
      B: [["🐝", "bee"], ["🎈", "balloon"], ["🍌", "banana"], ["🚌", "bus"], ["🐻", "bear"]],
      C: [["🐱", "cat"], ["🚗", "car"], ["🥕", "carrot"], ["🐄", "cow"], ["🎂", "cake"]],
      D: [["🐶", "dog"], ["🦆", "duck"], ["🥁", "drum"], ["🚪", "door"], ["🐬", "dolphin"]],
      E: [["🥚", "egg"], ["🐘", "elephant"], ["🧝", "elf"], ["✉️", "envelope"]],
      F: [["🐸", "frog"], ["🐟", "fish"], ["🦊", "fox"], ["🌸", "flower"], ["🍴", "fork"]],
      G: [["🐐", "goat"], ["🎸", "guitar"], ["🦍", "gorilla"], ["🍇", "grapes"], ["🎁", "gift"]],
      H: [["🐴", "horse"], ["🏠", "house"], ["🎩", "hat"], ["🦔", "hedgehog"], ["🐹", "hamster"]],
      I: [["🦎", "iguana"], ["🦗", "insect"], ["🍦", "ice cream"]],
      J: [["🧃", "juice"], ["👖", "jeans"], ["🧥", "jacket"], ["🧩", "jigsaw"]],
      K: [["🪁", "kite"], ["🔑", "key"], ["🦘", "kangaroo"], ["🐨", "koala"], ["🤴", "king"]],
      L: [["🦁", "lion"], ["🍋", "lemon"], ["🍃", "leaf"], ["🐞", "ladybird"], ["💡", "light"]],
      M: [["🐒", "monkey"], ["🌙", "moon"], ["🥛", "milk"], ["🐭", "mouse"], ["🍄", "mushroom"]],
      N: [["👃", "nose"], ["🥜", "nuts"], ["🥅", "net"], ["9️⃣", "nine"]],
      O: [["🐙", "octopus"], ["🍊", "orange"], ["🦦", "otter"], ["🫒", "olive"]],
      P: [["🐷", "pig"], ["🍕", "pizza"], ["🐧", "penguin"], ["🍐", "pear"], ["✏️", "pencil"]],
      Q: [["👸", "queen"], ["❓", "question"], ["🤫", "quiet"]],
      R: [["🐰", "rabbit"], ["🌈", "rainbow"], ["🚀", "rocket"], ["🤖", "robot"], ["💍", "ring"]],
      S: [["☀️", "sun"], ["🐍", "snake"], ["🧦", "socks"], ["⭐", "star"], ["🦭", "seal"]],
      T: [["🐯", "tiger"], ["🚂", "train"], ["🍅", "tomato"], ["🐢", "turtle"], ["🦷", "tooth"]],
      U: [["☂️", "umbrella"], ["⬆️", "up"], ["🦄", "unicorn"]],
      V: [["🚐", "van"], ["🎻", "violin"], ["🌋", "volcano"], ["🥦", "vegetables"]],
      W: [["🍉", "watermelon"], ["⌚", "watch"], ["🪟", "window"], ["🪱", "worm"], ["🌊", "wave"]],
      X: [["🦊", "fox", "end"], ["📦", "box", "end"], ["6️⃣", "six", "end"]],
      Y: [["🪀", "yo-yo"], ["💛", "yellow"], ["⛵", "yacht"], ["🥱", "yawn"]],
      Z: [["🦓", "zebra"], ["0️⃣", "zero"], ["🤐", "zip"]]
    },
    // NEEDS CHECKING by an Irish speaker before it goes live (like the sing-along lyrics).
    // The Irish alphabet has 18 letters. Fadas count as the plain letter (úll is on the U page).
    ga: {
      A: [["🍞", "arán"], ["👼", "aingeal"], ["🐊", "ailigéadar"], ["🏞️", "abhainn"]],
      B: [["🐄", "bó"], ["⛵", "bád"], ["🍌", "banana"], ["🎈", "balún"], ["🚌", "bus"]],
      C: [["🐱", "cat"], ["🚗", "carr"], ["🧀", "cáis"], ["🐴", "capall"], ["☕", "cupán"]],
      D: [["🚪", "doras"], ["🐬", "deilf"], ["🥁", "druma"], ["🦕", "díneasár"]],
      E: [["🐘", "eilifint"], ["✈️", "eitleán"], ["🪁", "eitleog"], ["🐦", "éan"]],
      F: [["🐸", "frog"], ["🪟", "fuinneog"], ["💍", "fáinne"], ["🦷", "fiacail"]],
      G: [["🐐", "gabhar"], ["🌙", "gealach"], ["🎸", "giotár"], ["👗", "gúna"], ["☀️", "grian"]],
      H: [["🎩", "hata"], ["🚁", "héileacaptar"], ["🍔", "hamburgar"]],
      I: [["🐟", "iasc"], ["🌭", "ispín"], ["🧈", "im"], ["🦅", "iolar"]],
      L: [["🦁", "leon"], ["🛏️", "leaba"], ["🦆", "lacha"], ["✋", "lámh"], ["📖", "leabhar"]],
      M: [["🐶", "madra"], ["🐖", "muc"], ["🐒", "moncaí"], ["👜", "mála"], ["🍬", "milseán"]],
      N: [["🐍", "nathair"], ["9️⃣", "naoi"], ["🌼", "nóinín"], ["📰", "nuachtán"]],
      O: [["🍊", "oráiste"], ["🐙", "ochtapas"], ["🚑", "otharcharr"], ["🏥", "ospidéal"]],
      P: [["🐧", "piongain"], ["🍕", "píotsa"], ["🍐", "piorra"], ["🐛", "péist"]],
      R: [["🚲", "rothar"], ["🚀", "roicéad"], ["🦭", "rón"], ["⭐", "réalta"]],
      S: [["💡", "solas"], ["🧦", "stocaí"], ["🎷", "sacsafón"], ["🍓", "sú talún"]],
      T: [["🚂", "traein"], ["🚜", "tarracóir"], ["🐢", "turtar"], ["🛋️", "tolg"]],
      U: [["🍎", "úll"], ["🥚", "ubh"], ["💧", "uisce"], ["🦉", "ulchabhán"]]
    }
  };
  var LETTERS = { en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), ga: "ABCDEFGHILMNOPRSTU".split("") };
  var MAX_OWN = 8;

  // "Úll" -> "ull": no fadas, lower case, dashes for anything else. Used in file keys.
  function slug(w) { return String(w).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"; }
  // The letter a word starts with, without its fada: "úll" -> "U". Null if it doesn't start with a letter.
  function firstLetter(w) {
    var c = String(w || "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
    return /[A-Z]/.test(c) ? c : null;
  }
  // Words whose first sound isn't the usual sound of their first letter. Used to tidy the theme words
  // the Letters game borrows (cheese, shoes, giraffe), and checked for family words.
  function clearStart(w, lang) {
    var s = String(w || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (/\s/.test(s.trim())) return false;
    if (lang === "ga") return !/^([bcdfgmpst]h|[st][eiéí]|s[nlr][eiéí])/.test(s) && !/^(n-|t-|h-)/.test(s);
    return !/^(ch|sh|th|wh|ph|kn|wr|gn|ps|c[eiy]|g[eiy])/.test(s);
  }

  // The family's words and hidden words live in the device library under "alpha".
  function store() {
    var L = CM.lib ? CM.lib.data() : { alpha: {} };
    var a = L.alpha || (L.alpha = {});
    a.own = a.own || {}; a.hide = a.hide || {};
    ["en", "ga"].forEach(function (l) { a.own[l] = a.own[l] || {}; a.hide[l] = Array.isArray(a.hide[l]) ? a.hide[l] : []; });
    return a;
  }
  function save() { if (CM.lib) CM.lib.save(); }

  function presetEntry(lang, L, it) {
    var s = slug(it[1]);
    return { kind: "preset", lang: lang, letter: L, id: "p:" + L + ":" + s, emoji: it[0], word: it[1], end: it[2] === "end",
      photoKey: "photo/alpha-" + lang + "/" + L + "-" + s, recRef: "al:" + L + ":" + s };
  }
  function ownEntry(lang, L, o) {
    return { kind: "own", lang: lang, letter: L, id: "o:" + o.id, ownId: o.id, emoji: o.emoji || "", word: o.w, end: false,
      photoKey: o.img || null, recRef: "al:" + L + ":o-" + o.id };
  }

  CM.alpha = {
    MAX_OWN: MAX_OWN,
    WORDS: WORDS,
    slug: slug,
    firstLetter: firstLetter,
    clearStart: clearStart,
    letters: function (lang) { return LETTERS[lang === "ga" ? "ga" : "en"].slice(); },
    hasLetter: function (lang, L) { return LETTERS[lang === "ga" ? "ga" : "en"].indexOf(L) >= 0; },

    // Every word for a letter: the ready-made ones first, then the family's own.
    // opts.hidden: also include words a grown-up has hidden.
    words: function (lang, L, opts) {
      lang = lang === "ga" ? "ga" : "en";
      var a = store(), hide = a.hide[lang], out = [];
      (WORDS[lang][L] || []).forEach(function (it) {
        var e = presetEntry(lang, L, it); e.hidden = hide.indexOf(e.id) >= 0;
        if (!e.hidden || (opts && opts.hidden)) out.push(e);
      });
      (a.own[lang][L] || []).forEach(function (o) { out.push(ownEntry(lang, L, o)); });
      return out;
    },
    // Every word in a language, for the Letters game. Only words that start with their letter.
    all: function (lang) {
      var self = this, out = [];
      LETTERS[lang === "ga" ? "ga" : "en"].forEach(function (L) {
        self.words(lang, L).forEach(function (e) { if (!e.end && firstLetter(e.word) === L) out.push(e); });
      });
      return out;
    },
    // Ready-made words a grown-up has hidden, in lower case. The Letters game skips these in theme words too.
    hiddenWords: function (lang) {
      lang = lang === "ga" ? "ga" : "en";
      var hide = store().hide[lang], out = [];
      Object.keys(WORDS[lang]).forEach(function (L) { WORDS[lang][L].forEach(function (it) { if (hide.indexOf("p:" + L + ":" + slug(it[1])) >= 0) out.push(String(it[1]).toLowerCase()); }); });
      return out;
    },
    ownCount: function (lang, L) { return (store().own[lang === "ga" ? "ga" : "en"][L] || []).length; },

    photo: function (e) { return e.photoKey && CM.media && CM.media.has(e.photoKey) ? CM.media.url(e.photoKey) : null; },
    // The picture for a word: the family's photo if there is one, otherwise the emoji.
    picHtml: function (e) {
      var src = this.photo(e);
      if (src) return '<img class="ph" src="' + src + '" alt=""' + (e.emoji ? ' data-fb="' + CM.esc(e.emoji) + '"' : "") + ">";
      return e.emoji ? CM.esc(e.emoji) : '<span aria-hidden="true">🖼️</span>';
    },
    // "bee" with the first letter marked, for the book: <b>b</b>ee. "fox" for X marks the x at the end.
    markWord: function (e) {
      var w = String(e.word), esc = CM.esc;
      if (e.end) { var i = w.toLowerCase().lastIndexOf(e.letter.toLowerCase()); return i < 0 ? esc(w) : esc(w.slice(0, i)) + '<b class="lt">' + esc(w.charAt(i)) + "</b>" + esc(w.slice(i + 1)); }
      return '<b class="lt">' + esc(w.charAt(0)) + "</b>" + esc(w.slice(1));
    },

    /* ---------- grown-ups: photos and own words ---------- */
    // Put a photo on any word (ready-made or own). Resolves when saved.
    setPhoto: function (e, file) {
      if (e.kind === "own") {
        var key = "alpha/" + e.ownId;
        return CM.shrinkImage(file, 320).then(function (d) { return CM.media.put(key, d); }).then(function () {
          var o = findOwn(e); if (o) { o.img = key; save(); } CM.media.keep(); return true;
        });
      }
      return CM.shrinkImage(file, 320).then(function (d) { return CM.media.put(e.photoKey, d); }).then(function () { CM.media.keep(); return true; });
    },
    removePhoto: function (e) {
      if (!e.photoKey) return Promise.resolve();
      if (e.kind === "own") { var o = findOwn(e); if (o) { o.img = null; save(); } }
      return CM.media.del(e.photoKey);
    },
    setHidden: function (e, hidden) {
      if (e.kind !== "preset") return;
      var list = store().hide[e.lang], i = list.indexOf(e.id);
      if (hidden && i < 0) list.push(e.id);
      if (!hidden && i >= 0) list.splice(i, 1);
      save();
    },
    // Check a family word before saving. Returns null if it's fine, or { msg, letter } where letter is the
    // page it belongs on (if this alphabet has one).
    check: function (lang, L, word) {
      var w = String(word || "").trim();
      if (!w) return { msg: "Type a word first." };
      if (/^(the|an|a)\s/i.test(w)) return { msg: "Use the word on its own, without \"the\", \"a\" or \"an\"." };
      var f = firstLetter(w);
      if (!f) return { msg: "Start the word with a letter." };
      if (f !== L) {
        var here = LETTERS[lang].indexOf(f) >= 0;
        return { msg: "\"" + w + "\" starts with " + f + ", so it belongs on the " + f + " page." + (here ? "" : " The Irish alphabet has no " + f + " page."), letter: here ? f : null };
      }
      if (this.ownCount(lang, L) >= MAX_OWN) return { msg: "There are already " + MAX_OWN + " of your own words for " + L + ". Delete one to add another." };
      return null;
    },
    // Add a family word with an optional photo. Resolves with the new entry.
    addOwn: function (lang, L, word, file) {
      var a = store(), list = a.own[lang][L] = a.own[lang][L] || [];
      var o = { id: CM.uid("al"), w: String(word).trim().slice(0, 30), img: null };
      list.push(o); save();
      var e = ownEntry(lang, L, o);
      return file ? this.setPhoto(e, file).then(function () { return ownEntry(lang, L, o); }) : Promise.resolve(e);
    },
    removeOwn: function (e) {
      var a = store(), list = a.own[e.lang][e.letter] || [];
      a.own[e.lang][e.letter] = list.filter(function (o) { return o.id !== e.ownId; });
      save();
      var jobs = [];
      if (e.photoKey) jobs.push(CM.media.del(e.photoKey));
      ["en", "ga"].forEach(function (l) { var k = "voice/" + l + "/" + e.recRef; if (CM.media.has(k)) jobs.push(CM.media.del(k)); });
      return Promise.all(jobs);
    },
    // The media key of a grown-up's recording of this word (same scheme as js/voice.js).
    recKey: function (e) { return "voice/" + e.lang + "/" + e.recRef; }
  };
  function findOwn(e) { return (store().own[e.lang][e.letter] || []).find(function (o) { return o.id === e.ownId; }); }
})();
