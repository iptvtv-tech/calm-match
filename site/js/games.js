/* The newer games. Each one makes a turn the play page knows how to show:
   - most return { title, show, opts: [{ html, label, correct }], speak, praiseName }, like Match;
   - "tap" turns ask for pictures in order (steps, small to big);
   - "trace" turns draw a letter with a finger;
   - a turn with `pre` shows something to remember first (What's missing?). */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  var pick1 = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var t = function (k, v) { return CM.t(k, v); };
  var L = function (o) { return CM.lang() === "ga" ? o.ga || o.en : o.en; }; // { en, ga } in the game language
  var nmx = function (x) { return CM.lang() === "ga" && x[2] ? x[2] : x[1]; }; // [emoji, en, ga]
  var last = {};
  // A random item, not the same as last time for this game.
  function fresh(key, list, id) { var x, n = 0; do { x = pick1(list); n++; } while (list.length > 1 && last[key] === id(x) && n < 20); last[key] = id(x); return x; }
  var pic = function (it, tk) { return CM.pic(it, tk); };
  var emo = function (e) { return '<span class="emo">' + esc(e) + "</span>"; };

  /* ---------- content ---------- */
  var TOGETHER = [
    [["🧦", "socks", "stocaí"], ["👟", "shoes", "bróga"]], [["🪥", "toothbrush", "scuab fiacla"], ["🦷", "tooth", "fiacail"]],
    [["🔑", "key", "eochair"], ["🚪", "door", "doras"]], [["☂️", "umbrella", "scáth fearthainne"], ["🌧️", "rain", "báisteach"]],
    [["🥣", "bowl", "babhla"], ["🥄", "spoon", "spúnóg"]], [["✏️", "pencil", "peann luaidhe"], ["📄", "paper", "páipéar"]],
    [["🐝", "bee", "beach"], ["🌻", "flower", "bláth"]], [["🐶", "dog", "madra"], ["🦴", "bone", "cnámh"]],
    [["🐔", "hen", "cearc"], ["🥚", "egg", "ubh"]], [["⚽", "ball", "liathróid"], ["🥅", "goal", "cúl"]],
    [["🧤", "gloves", "lámhainní"], ["❄️", "snow", "sneachta"]], [["🍪", "biscuit", "briosca"], ["🥛", "milk", "bainne"]],
    [["🐰", "rabbit", "coinín"], ["🥕", "carrot", "cairéad"]], [["🐒", "monkey", "moncaí"], ["🍌", "banana", "banana"]],
    [["🖌️", "paintbrush", "scuab phéinte"], ["🎨", "paints", "péinteanna"]], [["🧸", "teddy", "teidí"], ["🛏️", "bed", "leaba"]]
  ];
  // Steps that always happen in this order. Shorter games use the first steps.
  CM.SEQUENCES = [
    { id: "wash", en: "Washing hands", ga: "Lámha a ní", steps: [["🚰", "turn on the tap", "cas air an sconna"], ["🧼", "soap", "gallúnach"], ["🙌", "rub your hands", "cuimil do lámha"], ["🧻", "dry your hands", "triomaigh do lámha"]] },
    { id: "egg", en: "Egg to hen", ga: "Ó ubh go cearc", steps: [["🥚", "egg", "ubh"], ["🐣", "hatching", "ag teacht amach"], ["🐥", "chick", "sicín"], ["🐔", "hen", "cearc"]] },
    { id: "plant", en: "A seed grows", ga: "Fásann síol", steps: [["🌰", "seed", "síol"], ["🌱", "shoot", "péacán"], ["🌿", "plant", "planda"], ["🌻", "flower", "bláth"]] },
    { id: "day", en: "My day", ga: "Mo lá", steps: [["🌅", "morning", "maidin"], ["☀️", "daytime", "lá"], ["🌇", "evening", "tráthnóna"], ["🌙", "night", "oíche"]] },
    { id: "snow", en: "Snowman", ga: "Fear sneachta", steps: [["❄️", "snow falls", "titeann sneachta"], ["⛄", "make a snowman", "déan fear sneachta"], ["☀️", "the sun comes out", "tagann an ghrian amach"], ["💧", "it melts", "leánn sé"]] },
    { id: "teeth", en: "Brushing teeth", ga: "Fiacla a scuabadh", steps: [["🪥", "toothpaste on the brush", "taos fiacla ar an scuab"], ["😁", "brush your teeth", "scuab do chuid fiacla"], ["🚰", "rinse", "sruthlaigh"]] },
    { id: "sandwich", en: "Making a sandwich", ga: "Ceapaire a dhéanamh", steps: [["🍞", "bread", "arán"], ["🧈", "butter", "im"], ["🥪", "sandwich", "ceapaire"]] },
    { id: "bug", en: "Caterpillar", ga: "Bolb", steps: [["🥚", "egg", "ubh"], ["🐛", "caterpillar", "bolb"], ["🦋", "butterfly", "féileacán"]] }
  ];
  var WHY = [
    { e: "🍦⬇️", en: "The ice cream fell on the ground.", ga: "Thit an t-uachtar reoite ar an talamh.", f: "sad" },
    { e: "🎁", en: "It's a present for you!", ga: "Seo bronntanas duit!", f: "happy" },
    { e: "⛈️🌙", en: "A loud storm in the night.", ga: "Stoirm ard san oíche.", f: "scared" },
    { e: "🧱💥", en: "Someone knocked over the tower.", ga: "Leag duine éigin an túr.", f: "angry" },
    { e: "🛏️🌙", en: "It's very late. Time for bed.", ga: "Tá sé an-déanach. Am luí.", f: "sleepy" },
    { e: "🎉", en: "Surprise! A party!", ga: "Ionadh! Cóisir!", f: "surprised" },
    { e: "🎈💨", en: "The balloon flew away.", ga: "D'imigh an balún.", f: "sad" },
    { e: "🐕🔊", en: "A big dog is barking.", ga: "Tá madra mór ag tafann.", f: "scared" },
    { e: "🏖️☀️", en: "A day at the beach.", ga: "Lá ag an trá.", f: "happy" },
    { e: "🧩❌", en: "The puzzle piece won't fit.", ga: "Ní théann an píosa isteach.", f: "angry" }
  ];
  var WHERE = [
    { id: "in", en: "in", ga: "sa bhosca", sayEn: "Find the ball in the box", sayGa: "Aimsigh an liathróid sa bhosca" },
    { id: "on", en: "on", ga: "ar an mbosca", sayEn: "Find the ball on the box", sayGa: "Aimsigh an liathróid ar an mbosca" },
    { id: "under", en: "under", ga: "faoin mbosca", sayEn: "Find the ball under the box", sayGa: "Aimsigh an liathróid faoin mbosca" },
    { id: "next", en: "next to", ga: "in aice leis an mbosca", sayEn: "Find the ball next to the box", sayGa: "Aimsigh an liathróid in aice leis an mbosca" }
  ];
  var LETTERS_EN = "ABCDEFGHIJKLMNOPRSTUW".split(""), LETTERS_GA = "ABCDEFGHILMNOPRSTU".split(""); // the Irish alphabet has 18 letters
  var LETTERS = LETTERS_EN;
  var TRACE = ["L", "T", "I", "O", "C", "U", "V", "H", "E", "A", "S", "M"];

  /* ---------- small pictures ---------- */
  function group(n, e, cols) {
    var cells = ""; for (var i = 0; i < n; i++) cells += "<span>" + e + "</span>";
    return '<span class="mini c' + (cols || (n <= 3 ? n : n === 4 ? 2 : 3)) + '">' + cells + "</span>";
  }
  function shadowOf(e) { return '<span class="shadowpic" aria-hidden="true">' + esc(e) + "</span>"; }
  function scene(pos) {
    return '<span class="where w-' + pos + '" aria-hidden="true"><span class="wbox"></span><span class="wball">⚽</span></span>';
  }
  // One piece of a picture cut into 2 (left/right) or 4 (quarters).
  function piece(html, n, k) {
    var w = 0.5, h = n === 2 ? 1 : 0.5, x = n === 2 ? k : k % 2, y = n === 2 ? 0 : Math.floor(k / 2);
    return '<span class="pzp" style="--w:' + w + ";--h:" + h + ";--x:" + (x * w) + ";--y:" + (y * h) + '"><span class="pzi">' + html + "</span></span>";
  }
  function letterFirst(name) {
    var c = String(name).normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
    return /[A-Z]/.test(c) ? c : null;
  }

  /* ---------- the games ---------- */
  CM.GEN = {
    find: function (c) {
      var mode = c.skill.mode, n = c.n;
      if (mode === "where") {
        var tw = fresh("where", WHERE.slice(0, c.lvl >= 2 ? 4 : 3), function (x) { return x.id; });
        var others = shuffle(WHERE.filter(function (w) { return w !== tw; })).slice(0, n - 1);
        var say = CM.lang() === "ga" ? tw.sayGa : tw.sayEn;
        return { title: say, show: '<div class="target word" role="img" aria-label="' + esc(L(tw)) + '">' + esc(CM.lang() === "ga" ? tw.ga : tw.en) + "</div>",
          opts: shuffle([tw].concat(others)).map(function (w) { return { html: scene(w.id), label: L(w), correct: w === tw, cls: "sceneopt" }; }),
          speak: say, praiseName: CM.lang() === "ga" ? tw.ga : tw.en };
      }
      var tk = mode === "body" ? "body" : c.themeKey, items = CM.THEMES[tk].items;
      var tg = fresh("find" + tk, items, function (x) { return x[0]; });
      var rest = shuffle(items.filter(function (i) { return i !== tg; })).slice(0, n - 1);
      return { title: t("sayFind", { name: nmx(tg) }),
        show: '<div class="target word" role="img" aria-label="' + esc(nmx(tg)) + '"><span aria-hidden="true">🔊</span> ' + esc(nmx(tg)) + "</div>",
        opts: shuffle([tg].concat(rest)).map(function (o) { return { html: pic(o, tk), label: nmx(o), correct: o === tg }; }),
        speak: t("sayFind", { name: nmx(tg) }), praiseName: nmx(tg) };
    },

    shadow: function (c) {
      var items = c.theme.items, n = c.n, tg = fresh("shadow", items, function (x) { return x[0]; });
      var rest = shuffle(items.filter(function (i) { return i !== tg; })).slice(0, n - 1);
      var toPic = c.skill.mode === "toPic";
      return { title: toPic ? t("whoseShadow") : t("findShadow"),
        show: '<p class="label">' + esc(toPic ? t("thisShadow") : t("findThis")) + '</p><div class="target" role="img" aria-label="' + esc(toPic ? t("aShadow") : nmx(tg)) + '">' + (toPic ? shadowOf(tg[0]) : emo(tg[0])) + "</div>",
        opts: shuffle([tg].concat(rest)).map(function (o) { return { html: toPic ? emo(o[0]) : shadowOf(o[0]), label: toPic ? nmx(o) : t("shadowOfN", { n: nmx(o) }), correct: o === tg }; }),
        speak: toPic ? t("whoseShadow") : t("sayFindShadow", { name: nmx(tg) }), praiseName: nmx(tg) };
    },

    odd: function (c) {
      var n = c.lvl >= 1 || c.skill.mode === "group" ? 4 : 3, items = c.theme.items, list, odd;
      if (c.skill.mode === "pic") {
        var two = shuffle(items.slice()).slice(0, 2); odd = two[1];
        list = []; for (var i = 0; i < n - 1; i++) list.push({ it: two[0], tk: c.themeKey, odd: false });
      } else {
        var fam = function (k) { return CM.THEMES[k].family || k; }, me = c.themeKey;
        var others = Object.keys(CM.THEMES).filter(function (k) { return fam(k) !== fam(me) && !CM.THEMES[k].noKind && k !== "body"; });
        var ok = pick1(others); odd = pick1(CM.THEMES[ok].items);
        list = shuffle(items.slice()).slice(0, n - 1).map(function (it) { return { it: it, tk: me, odd: false }; });
        list.oddTheme = ok;
      }
      var all = shuffle(list.concat([{ it: odd, tk: list.oddTheme || c.themeKey, odd: true }]));
      return { title: t("findOdd"), show: "",
        opts: all.map(function (o) { return { html: pic(o.it, o.tk), label: nmx(o.it), correct: o.odd }; }),
        speak: t("sayOdd"), praiseName: nmx(odd) };
    },

    together: function (c) {
      var pr = fresh("together", TOGETHER, function (x) { return x[0][0]; }), flip = Math.random() < 0.5;
      var a = flip ? pr[1] : pr[0], b = flip ? pr[0] : pr[1];
      var rest = shuffle(TOGETHER.filter(function (p) { return p !== pr; })).slice(0, c.n - 1).map(function (p) { return p[Math.random() < 0.5 ? 0 : 1]; });
      return { title: t("goesWith", { name: nmx(a) }),
        show: '<p class="label">' + esc(t("whatGoesWith")) + '</p><div class="target" role="img" aria-label="' + esc(nmx(a)) + '">' + emo(a[0]) + "</div>",
        opts: shuffle([b].concat(rest)).map(function (o) { return { html: emo(o[0]), label: nmx(o), correct: o === b }; }),
        speak: t("goesWith", { name: nmx(a) }), praiseName: nmx(a) + ", " + nmx(b) };
    },

    num: function (c) {
      var e = pick1(c.theme.items), p = pic(e);
      if (c.skill.mode === "more") {
        var a = 1 + Math.floor(Math.random() * 5), b; do { b = 1 + Math.floor(Math.random() * 5); } while (b === a);
        return { title: t("whichMore"), show: "",
          opts: [a, b].map(function (v) { return { html: group(v, p), label: t("nPictures", { n: v }), correct: v === Math.max(a, b), cls: "grpopt" }; }),
          speak: t("whichMore"), praiseName: String(Math.max(a, b)) };
      }
      var max = c.skill.max, n = fresh("num" + max, [1, 2, 3, 4, 5].slice(0, max), String), pool = [];
      for (var v = 1; v <= max; v++) if (v !== n) pool.push(v);
      var opts = shuffle([n].concat(shuffle(pool).slice(0, c.n - 1)));
      return { title: t("findGroup", { n: n }), show: '<div class="target word bignum" role="img" aria-label="' + n + '">' + n + "</div>",
        opts: opts.map(function (v) { return { html: group(v, p), label: t("nPictures", { n: v }), correct: v === n, cls: "grpopt" }; }),
        speak: t("findGroup", { n: n }), praiseName: String(n) };
    },

    shapes: function (c) {
      var sh = CM.THEMES.shapes.items;
      if (c.skill.mode === "size") {
        var e = pick1(c.theme.items), k = c.lvl >= 1 ? 4 : 3, sizes = [0.45, 0.65, 0.85, 1.05].slice(0, k);
        var cards = sizes.map(function (z, i) { return { html: '<span class="sz" style="font-size:' + z + 'em">' + pic(e) + "</span>", label: t("sizeN", { n: i + 1 }), rank: i }; });
        return { kind: "tap", title: t("smallToBig"), speak: t("saySmallToBig"), cards: shuffle(cards), n: k, slotLabel: function (i) { return i === 0 ? t("smallest") : i === k - 1 ? t("biggest") : ""; } };
      }
      var tg = fresh("shape", sh, function (x) { return x[0]; }), rest = shuffle(sh.filter(function (s) { return s !== tg; })).slice(0, c.n - 1);
      return { title: t("sayFind", { name: nmx(tg) }), show: '<div class="target word" role="img" aria-label="' + esc(nmx(tg)) + '">' + esc(nmx(tg)) + "</div>",
        opts: shuffle([tg].concat(rest)).map(function (o) { return { html: emo(o[0]), label: nmx(o), correct: o === tg }; }),
        speak: t("sayFind", { name: nmx(tg) }), praiseName: nmx(tg) };
    },

    missing: function (c) {
      var n = c.skill.n, items = shuffle(c.theme.items.slice()), row = items.slice(0, n), gone = pick1(row);
      var spare = items.slice(n), opts = shuffle([gone].concat(shuffle(spare).slice(0, c.n - 1)));
      var rowHtml = function (hide) { return '<div class="seqrow">' + row.map(function (r) { return r === gone && hide ? '<span class="slot">?</span>' : "<span>" + pic(r) + "</span>"; }).join("") + "</div>"; };
      return { title: t("whatMissing"), pre: { html: '<h1 class="say">' + esc(t("remember")) + "</h1>" + rowHtml(false), ms: 2500 + n * 700, speak: t("remember") },
        show: rowHtml(true), opts: opts.map(function (o) { return { html: pic(o), label: nmx(o), correct: o === gone }; }),
        speak: t("whatMissing"), praiseName: nmx(gone) };
    },

    puzzle: function (c) {
      var n = c.skill.n, items = c.theme.items, tg = fresh("puzzle", items, function (x) { return x[0]; }), k = Math.floor(Math.random() * n);
      var tp = pic(tg), whole = "";
      for (var i = 0; i < n; i++) whole += i === k ? '<span class="pzp pzgap" style="--w:0.5;--h:' + (n === 2 ? 1 : 0.5) + '"></span>' : piece(tp, n, i);
      var rest = shuffle(items.filter(function (x) { return x !== tg; })).slice(0, c.n - 1);
      return { title: t("finishPicture"), show: '<div class="pz n' + n + '" role="img" aria-label="' + esc(nmx(tg)) + '">' + whole + "</div>",
        opts: shuffle([tg].concat(rest)).map(function (o) { return { html: '<span class="pz pzopt">' + piece(pic(o), n, k) + "</span>", label: t("pieceOf", { n: nmx(o) }), correct: o === tg }; }),
        speak: t("finishPicture"), praiseName: nmx(tg) };
    },

    letters: function (c) {
      var mode = c.skill.mode; LETTERS = CM.lang() === "ga" ? LETTERS_GA : LETTERS_EN;
      if (mode === "trace") { var tl = fresh("trace", TRACE, String); return { kind: "trace", letter: tl, title: t("traceLetter", { l: tl }), speak: t("traceLetter", { l: tl }) }; }
      if (mode === "first") {
        var pool = [];
        Object.keys(CM.THEMES).forEach(function (k) { if (CM.THEMES[k].noKind) return; CM.THEMES[k].items.forEach(function (it) { var nm = nmx(it); if (!/\s/.test(nm) && letterFirst(nm)) pool.push({ it: it, tk: k, l: letterFirst(nm) }); }); });
        var tg = fresh("first", pool, function (x) { return x.it[0]; });
        var ls = shuffle(LETTERS.filter(function (l) { return l !== tg.l; })).slice(0, c.n - 1);
        return { title: t("firstLetter"), show: '<div class="target" role="img" aria-label="' + esc(nmx(tg.it)) + '">' + pic(tg.it, tg.tk) + '</div><p class="sub">' + esc(nmx(tg.it)) + "</p>",
          opts: shuffle([tg.l].concat(ls)).map(function (l) { return { html: '<span class="letter">' + l + "</span>", label: l, correct: l === tg.l }; }),
          speak: t("sayFirstLetter", { name: nmx(tg.it) }), praiseName: tg.l + ", " + nmx(tg.it) };
      }
      var L1 = fresh("letter", LETTERS, String), lo = shuffle(LETTERS.filter(function (l) { return l !== L1; })).slice(0, c.n - 1);
      var lower = mode === "case";
      return { title: lower ? t("findSmallLetter") : t("findSame"),
        show: '<p class="label">' + esc(t("findThis")) + '</p><div class="target word letter" role="img" aria-label="' + L1 + '">' + L1 + "</div>",
        opts: shuffle([L1].concat(lo)).map(function (l) { var s = lower ? l.toLowerCase() : l; return { html: '<span class="letter">' + s + "</span>", label: s, correct: l === L1 }; }),
        speak: lower ? t("findSmallLetter") : t("findSame"), praiseName: L1 + (lower ? ", " + L1.toLowerCase() : "") };
    },

    order: function (c) {
      var n = c.skill.n, seqs = CM.SEQUENCES.filter(function (s) { return s.steps.length >= n; }), sq = fresh("order" + n, seqs, function (x) { return x.id; });
      var start = Math.floor(Math.random() * (sq.steps.length - n + 1)), steps = sq.steps.slice(start, start + n);
      var cards = steps.map(function (st, i) { return { html: emo(st[0]), label: nmx(st), rank: i }; });
      return { kind: "tap", title: L(sq), speak: L(sq) + ". " + t("sayOrder"), cards: shuffle(cards), n: n, slotLabel: function (i) { return i === 0 ? t("first") : i === n - 1 ? t("lastWord") : t("thenWord"); } };
    },

    // Feelings: "How do they feel?" uses little scenes. The other three kinds stay in the play page.
    feelWhy: function (c) {
      var core = CM.FEELINGS.filter(function (f) { return !f.extra; }), sc = fresh("why", WHY, function (x) { return x.e; });
      var target = core.find(function (f) { return f.id === sc.f; }), others = shuffle(core.filter(function (f) { return f !== target; })).slice(0, c.n - 1);
      return { title: t("howFeel"), show: '<div class="target scene" aria-hidden="true">' + esc(sc.e) + '</div><p class="sub sceneline">' + esc(L(sc)) + "</p>",
        opts: shuffle([target].concat(others)).map(function (f) { return { html: f.faces[0], label: CM.feelWord(f), correct: f === target, cls: "faceopt" }; }),
        speak: L(sc) + " " + t("howFeel"), praiseName: CM.feelWord(target) };
    }
  };
  CM.GEN_SHUFFLE = shuffle;
})();
