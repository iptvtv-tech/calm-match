/* The play page: games, visual schedule, breaks, tools and the grown-ups area. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc, t = CM.t;
  var $ = function (id) { return document.getElementById(id); };
  var P = function () { return CM.store.P(); }, S = function () { return CM.store.S(); };
  var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  var pick1 = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var theme = function () { return CM.theme(); };
  var pic = function (item, tk) { return CM.pic(item, tk); };
  var stage;

  /* ================= senses ================= */
  function applySenses() {
    var s = S(), b = document.body.dataset;
    b.calm = s.calm ? "on" : "off"; b.contrast = s.contrast ? "high" : "normal"; b.big = s.big ? "on" : "off"; b.keys = s.keys ? "on" : "off";
    document.documentElement.lang = s.lang === "ga" ? "ga" : "en";
    $("breakBtn").textContent = t("breakLabel");
    if (CM.touch) CM.touch.apply();
    $("talkTxt").textContent = t("talk");
    $("talkBtn").hidden = !s.talk;
    if (CM.rewards) CM.rewards.renderStrip();
  }
  var actx = null;
  function tones(freqs, gap, vol) {
    if (!S().sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), at = actx.currentTime + i * (gap || 0.16);
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol || 0.12, at + 0.03); g.gain.exponentialRampToValueAtTime(0.001, at + 0.6);
        o.connect(g).connect(actx.destination); o.start(at); o.stop(at + 0.65);
      });
    } catch (e) {}
  }
  function chime() {
    var c = S().celebrate;
    if (c === "calm") tones([523.25], 0, 0.05);
    else if (c === "cheerful") tones([523.25, 659.25, 783.99], 0.12, 0.13);
    else tones([523.25, 659.25]);
  }
  function fanfare() {
    var c = S().celebrate;
    if (c === "cheerful") tones([523.25, 659.25, 783.99, 1046.5], 0.18, 0.13);
    else if (c === "gentle") tones([523.25, 659.25, 783.99], 0.2);
  }
  var voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if ("speechSynthesis" in window) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {} }
  // Only on-device voices: some browsers offer online voices that send the spoken text to a cloud service.
  function localVoice(re) { return voices.find(function (v) { return v.localService !== false && re.test(v.lang); }) || null; }
  CM.irishVoice = function () { return localVoice(/^ga/i); };
  function say(text) {
    if (!S().speech || !("speechSynthesis" in window)) return;
    var ga = CM.lang() === "ga", v = ga ? CM.irishVoice() : (localVoice(/^en-(IE|GB)/i) || localVoice(/^en/i));
    if (ga && !v) return; // no Irish voice on this device: an English voice would mispronounce Irish
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.rate = S().rate; u.lang = ga ? "ga-IE" : "en-IE"; if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {}
  }
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} }
  function praise(name) {
    var k = { cheerful: "praiseCheer", gentle: "praiseGentle", calm: "praiseCalm" }[S().celebrate] || "praiseGentle";
    return name != null && name !== "" ? t(k, { name: CM.cap(name) }) : t(k + "Plain");
  }
  var STICKERS = { stars: ["⭐", "🌟", "✨", "💫", "🌠"], hearts: ["💚", "💙", "💜", "🧡", "💛", "❤️"], shapes: ["🔷", "🔶", "🟢", "🟣", "🔺", "🟦"] };
  function newSticker() {
    var set = S().stickerSet;
    if (set === "none") return null;
    if (STICKERS[set]) return pick1(STICKERS[set]);
    return pick1(theme().items)[0];
  }

  /* ================= engine log ================= */
  var LOG = [];
  function log(rule, result) {
    LOG.unshift({ t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), rule: rule, result: result });
    if (LOG.length > 200) LOG.pop();
    if (!$("panel").hidden && tab === "engine") renderLog();
  }
  function renderLog() {
    $("log").innerHTML = LOG.length ? LOG.map(function (l) { return "<li><time>" + l.t + "</time><b>" + esc(l.rule) + "</b> → " + esc(l.result) + "</li>"; }).join("")
      : "<li>Nothing yet. Start a session to see each rule as it fires.</li>";
  }

  /* ================= session state ================= */
  var session = null, blk = null, cur = null, locked = false, pendingAdvance = null, screenFn = null, lastTarget = null, lastCount = 0, lastFeel = null, pairsTimer = null;
  function clearTimers() { clearTimeout(pendingAdvance); clearTimeout(pairsTimer); pendingAdvance = null; pairsTimer = null; }

  function renderSched() {
    var plan = session ? session.plan : CM.planSession().plan;
    var html = plan.map(function (g, i) {
      var st = !session ? "later" : i < session.i ? "done" : i === session.i ? "now" : "later";
      return (i ? '<span class="then" aria-hidden="true">' + esc(t("then")) + "</span>" : "") +
        '<span class="step ' + st + '"' + (st === "now" ? ' aria-current="step"' : "") + '><span class="ic" aria-hidden="true">' + CM.gameIcon(g) + "</span>" + esc(CM.gameName(g)) +
        (st === "done" ? ' <span class="tick" aria-label="done">✓</span>' : "") + "</span>";
    }).join("");
    var endNow = session && session.i >= plan.length;
    $("sched").hidden = false;
    $("sched").innerHTML = html + '<span class="then" aria-hidden="true">' + esc(t("then")) + '</span><span class="step ' + (endNow ? "now" : "later") + '"><span class="ic" aria-hidden="true">🏁</span>' + esc(t("allDone")) + "</span>";
  }
  function renderWho() { var p = P(); $("who").innerHTML = '<b aria-hidden="true">' + esc(p.avatar) + "</b>" + esc(p.name); }
  function show(fn) { screenFn = fn; fn(); }

  /* ---------- screens ---------- */
  var chosen = false; // classroom mode: has a child picked themselves on this visit?
  function startScreen() {
    clearTimers(); CM.tools.stop(); CM.rewards.stop(); session = null; blk = null; cur = null;
    document.body.classList.remove("dim");
    $("progress").hidden = true; $("breakBtn").hidden = true;
    if (CM.classroom.on() && !chosen && CM.store.list().length > 1) {
      $("sched").hidden = true; $("tokens").hidden = true; $("who").innerHTML = "";
      return CM.classroom.picker(stage, say, function () { chosen = true; applySenses(); startScreen(); });
    }
    applySenses();
    var plan = CM.planSession().plan; renderSched(); renderWho();
    var hasStories = CM.lib.stories().length > 0;
    stage.innerHTML =
      '<p class="label">' + esc(t("today", { name: P().name })) + "</p>" +
      '<h1 class="say">' + esc(t("gamesThenDone", { n: plan.length })) + "</h1>" +
      '<p class="sub">' + esc(plan.map(CM.gameName).join(", " + t("then") + " ")) + ". " + esc(t("tapBreak")) + "</p>" +
      '<button class="big-btn" id="startBtn" type="button">' + esc(t("start")) + "</button>" +
      '<div class="row extras">' +
        '<button class="ghost-btn" id="stickBtn" type="button"><span aria-hidden="true">⭐</span> ' + esc(t("myStickers")) + "</button>" +
        (hasStories ? '<button class="ghost-btn" id="storiesBtn" type="button"><span aria-hidden="true">📖</span> ' + esc(t("myStories")) + "</button>" : "") +
        '<button class="ghost-btn" id="calmBtn" type="button"><span aria-hidden="true">🌙</span> ' + esc(t("calmCorner")) + "</button>" +
        (CM.classroom.on() && CM.store.list().length > 1 ? '<button class="ghost-btn" id="whoBtn" type="button">' + esc(t("whoPlaying")) + "</button>" : "") +
      "</div>";
    $("startBtn").onclick = startSession;
    $("stickBtn").onclick = function () { CM.tools.helpers().enter(); CM.rewards.stickerBook(function () { CM.tools.helpers().exit(); }); };
    if ($("storiesBtn")) $("storiesBtn").onclick = function () { CM.stories.shelf(); };
    $("calmBtn").onclick = function () { CM.tools.helpers().enter(); CM.rewards.breakScreen({ label: t("calmCorner"), title: t("calmCorner"), onClose: function () { CM.tools.helpers().exit(); } }); };
    if ($("whoBtn")) $("whoBtn").onclick = function () { chosen = false; startScreen(); };
  }
  function startSession() {
    var r = CM.planSession();
    session = { plan: r.plan, i: 0, start: Date.now(), breaks: 0, stickers: [], blocks: [] };
    log("Session start", P().name + ", theme " + theme().label + (S().lang === "ga" ? ", in Irish" : "") + (S().errorless ? ", errorless start on" : ""));
    r.reasons.forEach(function (x, i) { log("Plan step " + (i + 1), x); });
    $("breakBtn").hidden = false;
    show(blockIntro);
    say(t("sayToday", { list: r.plan.map(CM.gameName).join(", " + t("then") + " ") }));
  }
  function blockIntro() {
    var g = session.plan[session.i];
    renderSched(); $("progress").hidden = true;
    stage.innerHTML =
      '<p class="label">' + esc(t("now")) + '</p><div class="bigicon" aria-hidden="true">' + CM.gameIcon(g) + "</div>" +
      '<h1 class="say">' + esc(CM.gameName(g)) + "</h1>" +
      '<p class="sub">' + esc(CM.gameDoes(g)) + "</p>" +
      '<button class="big-btn" id="goBtn" type="button">' + esc(t("go")) + "</button>";
    $("goBtn").onclick = startBlock;
    say(t("sayNow", { game: CM.gameName(g), does: CM.gameDoes(g) }));
  }
  function startBlock() {
    var g = session.plan[session.i];
    var pick = CM.pickSkill(g, true), skill = pick[0];
    log(CM.GAMES[g].label + " starts", pick[1]);
    var st = P().skills[skill.id];
    var turns = g === "pairs" ? Math.max(2, Math.ceil(S().turns / 2)) : S().turns;
    blk = { game: g, skill: skill, t: 0, turns: turns, lvl: Math.min(st.lvl, CM.LV[g].length - 1), okRun: 0, firstTry: 0, hints: 0, prompted: 0,
      lockedBefore: CM.SKILLS.filter(function (s) { return !CM.unlocked(s); }).map(function (s) { return s.id; }) };
    if (g === "sort") setupSort();
    log("Difficulty", CM.lvDesc(g, blk.lvl, skill) + (S().errorless && g !== "pairs" ? "; help: " + CM.PROMPT_NAMES[st.prompt] : ""));
    nextTurn();
  }
  function genCtx() { return { skill: blk.skill, lvl: blk.lvl, n: CM.LV[blk.game][Math.min(blk.lvl, CM.LV[blk.game].length - 1)], theme: theme(), themeKey: S().theme }; }
  function nextTurn() {
    pendingAdvance = null;
    if (blk.t >= blk.turns) return finishBlock();
    var g = blk.game;
    cur = g === "match" ? genMatch() : g === "sort" ? genSort() : g === "seq" ? genSeq() : g === "count" ? genCount() : g === "feel" ? genFeel() : g === "pairs" ? genPairs()
      : CM.GEN[g](genCtx());
    cur.first = true; cur.misses = 0; cur.hint = false; cur.lowered = false;
    cur.prompt = cur.kind || !S().errorless ? 0 : P().skills[blk.skill.id].prompt || 0;
    if (cur.kind === "pairs" && cur.peek > 0) startPeek();
    show(renderTurn);
    say(cur.speak);
  }
  function renderTurn() {
    if (cur.kind === "pairs") return renderPairs();
    if (cur.kind === "tap") return renderTap();
    if (cur.kind === "trace") return renderTrace();
    if (cur.pre && !cur.preDone) return renderPre();
    locked = false; renderSched();
    var fbText = cur.prompt === 2 ? t("lookHighlight") : (cur.prompt === 1 || cur.hint) ? t("lookOutline") : "";
    stage.innerHTML =
      '<h1 class="say">' + esc(cur.title) + "</h1><div>" + cur.show + "</div>" +
      '<div class="options" role="group" aria-label="Choose an answer">' +
      cur.opts.map(function (o, i) {
        var cls = "opt " + (o.cls || "");
        var dis = false;
        if (cur.prompt === 2) { if (o.correct) cls += " prompt"; else { cls += " dimmed"; dis = true; } }
        else if ((cur.prompt === 1 || cur.hint) && o.correct) cls += " hint";
        return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (dis ? " disabled" : "") + ' aria-label="' + esc(o.label) + '"><span class="kn" aria-hidden="true">' + (i + 1) + "</span>" + o.html + "</button>";
      }).join("") + "</div>" +
      '<p class="feedback" id="fb">' + esc(fbText) + "</p>" + againBtn();
    stage.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { choose(+b.dataset.i, b); }; });
    bindAgain(); renderDots();
  }
  function againBtn() { return S().speech && !(CM.lang() === "ga" && !CM.irishVoice()) ? '<button class="again" id="againBtn" type="button">' + esc(t("sayAgain")) + "</button>" : ""; }
  function bindAgain() { var a = $("againBtn"); if (a) a.onclick = function () { say(cur.speak); }; }
  function renderDots() {
    $("progress").hidden = false;
    var d = ""; for (var i = 0; i < blk.turns; i++) d += '<span class="dot ' + (i < blk.t ? "done" : "") + '"></span>';
    $("dots").innerHTML = d;
    var left = blk.turns - blk.t, nextG = session.plan[session.i + 1], then = nextG ? CM.gameName(nextG) : t("allDoneLower");
    $("next").textContent = left <= 0 ? t("finishedNext", { next: then }) : left === 1 ? t("lastOne", { next: then }) : t("nMore", { n: left, next: then });
  }

  /* ---------- game: match ---------- */
  function freshTarget(items) { var x; do { x = pick1(items); } while (lastTarget && items.length > 1 && x[0] === lastTarget); lastTarget = x[0]; return x; }
  function genMatch() {
    var items = theme().items, n = CM.LV.match[blk.lvl], tg = freshTarget(items);
    var others = shuffle(items.filter(function (i) { return i[0] !== tg[0]; })).slice(0, n - 1);
    return {
      title: t("findSame"),
      show: '<p class="label">' + esc(t("findThis")) + '</p><div class="target" role="img" aria-label="' + esc(CM.nm(tg)) + '">' + pic(tg) + "</div>",
      opts: shuffle([tg].concat(others)).map(function (o) { return { html: pic(o), label: CM.nm(o), correct: o[0] === tg[0] }; }),
      speak: t("sayFind", { name: CM.nm(tg) }), praiseName: CM.nm(tg)
    };
  }

  /* ---------- game: sort ---------- */
  function setupSort() {
    var mode = blk.skill.mode, items = theme().items, T = blk.turns, nb = mode === "size" ? 2 : CM.LV.sort[blk.lvl], baskets = [], queue = [], i;
    if (mode === "picture") {
      var picks = shuffle(items.slice()).slice(0, nb);
      baskets = picks.map(function (p) { return { key: p[0], icon: pic(p), item: p, got: [] }; });
      for (i = 0; i < T; i++) { var p = picks[i % nb]; queue.push({ item: p, key: p[0], html: pic(p) }); }
    } else if (mode === "size") {
      var e = pick1(items);
      baskets = [{ key: "big", icon: '<span class="sz-big">' + pic(e) + "</span>", nameKey: "big", got: [] }, { key: "small", icon: '<span class="sz-small">' + pic(e) + "</span>", nameKey: "small", got: [] }];
      for (i = 0; i < T; i++) { var k = i % 2 ? "small" : "big"; queue.push({ item: e, key: k, size: k, html: pic(e) }); }
    } else if (mode === "colour" || mode === "shape") {
      var sets = (mode === "colour" ? SORT_COLOURS : SORT_SHAPES).slice(0, Math.max(2, nb));
      baskets = sets.map(function (c) { return { key: c.key, icon: c.icon, lbl: c, got: [] }; });
      for (i = 0; i < T; i++) { var cs = sets[i % sets.length], ce = pick1(cs.items); queue.push({ item: [ce, cs.en, cs.ga], key: cs.key, html: ce }); }
    } else {
      var me = CM.THEMES[S().theme].noKind ? "vehicles" : S().theme;
      var fam = function (k) { return CM.THEMES[k].family || k; }, keys = [me], fams = [fam(me)];
      shuffle(Object.keys(CM.THEMES).filter(function (k) { return k !== me && !CM.THEMES[k].noKind; })).forEach(function (k) {
        if (keys.length < nb && fams.indexOf(fam(k)) < 0) { keys.push(k); fams.push(fam(k)); }
      });
      baskets = keys.map(function (k) { return { key: k, icon: pic(CM.THEMES[k].items[0], k), group: k, got: [] }; });
      for (i = 0; i < T; i++) { var kk = keys[i % nb], it = pick1(CM.THEMES[kk].items.slice(1)); queue.push({ item: it, key: kk, html: pic(it, kk) }); }
    }
    blk.baskets = baskets; blk.queue = shuffle(queue);
  }
  function basketName(b) { return b.lbl ? (CM.lang() === "ga" ? b.lbl.ga : b.lbl.en) : b.nameKey ? t(b.nameKey) : b.group ? CM.groupName(b.group) : CM.cap(CM.nm(b.item)); }
  var SORT_COLOURS = [
    { key: "red", en: "Red", ga: "Dearg", icon: "🔴", items: ["🔴", "🟥", "❤️", "🍎", "🍓"] }, { key: "green", en: "Green", ga: "Glas", icon: "🟢", items: ["🟢", "🟩", "💚", "🥦", "🍏"] },
    { key: "blue", en: "Blue", ga: "Gorm", icon: "🔵", items: ["🔵", "🟦", "💙", "👖", "🧢"] }, { key: "yellow", en: "Yellow", ga: "Buí", icon: "🟡", items: ["🟡", "🟨", "💛", "🍌", "🌻"] }];
  var SORT_SHAPES = [
    { key: "circle", en: "Circles", ga: "Ciorcail", icon: "⚪", items: ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠"] }, { key: "square", en: "Squares", ga: "Cearnóga", icon: "⬜", items: ["🟥", "🟩", "🟦", "🟨", "🟪", "🟧"] },
    { key: "heart", en: "Hearts", ga: "Croíthe", icon: "🤍", items: ["❤️", "💚", "💙", "💛", "💜", "🧡"] }];
  function genSort() {
    var q = blk.queue[blk.t], mode = blk.skill.mode, nm = CM.nm(q.item);
    return {
      title: mode === "size" ? t("bigOrSmall") : mode === "kind" || mode === "colour" || mode === "shape" ? t("whichGroup") : t("putSame"),
      show: '<p class="label">' + esc(t("whereGo")) + '</p><div class="target" role="img" aria-label="' + esc(nm) + '"><span class="' + (q.size ? "sz-" + q.size : "") + '">' + q.html + "</span></div>",
      opts: blk.baskets.map(function (b) {
        return { cls: "basket", label: basketName(b), correct: b.key === q.key, basket: b,
          html: '<span class="bicon" aria-hidden="true">' + b.icon + '</span><span class="bname">' + esc(basketName(b)) + '</span><span class="bgot" aria-hidden="true">' + b.got.join("") + "</span>" };
      }),
      speak: mode === "size" ? t("sayBigSmall", { name: nm }) : mode === "kind" ? t("sayGroup", { name: nm }) : mode === "colour" || mode === "shape" ? t("whichGroup") : t("saySortPic", { name: nm }),
      praiseName: mode === "size" ? t(q.size) : nm,
      onRight: function (o) { o.basket.got.push(q.html); }
    };
  }

  /* ---------- game: patterns ---------- */
  function genSeq() {
    var pat = blk.skill.pattern, letters = [], items = theme().items;
    pat.split("").forEach(function (l) { if (letters.indexOf(l) < 0) letters.push(l); });
    var chosen = shuffle(items.slice()).slice(0, letters.length), map = {};
    letters.forEach(function (l, i) { map[l] = chosen[i]; });
    var L = pat.length, shown = L * 2 + Math.floor(Math.random() * L), row = [];
    for (var i = 0; i < shown; i++) row.push(map[pat[i % L]]);
    var ans = map[pat[shown % L]], n = CM.LV.seq[blk.lvl];
    var distract = chosen.filter(function (c) { return c[0] !== ans[0]; }).concat(shuffle(items.filter(function (x) { return chosen.indexOf(x) < 0; })));
    var opts = shuffle([ans].concat(distract.slice(0, n - 1)));
    return {
      title: t("whatNext"),
      show: '<div class="seqrow" role="img" aria-label="' + esc(row.map(CM.nm).join(", ")) + ', ?">' + row.map(function (r) { return "<span>" + pic(r) + "</span>"; }).join("") + '<span class="slot" id="slot">?</span></div>',
      opts: opts.map(function (o) { return { html: pic(o), label: CM.nm(o), correct: o[0] === ans[0] }; }),
      speak: row.map(CM.nm).join(", ") + ". " + t("sayWhatNext"), praiseName: CM.nm(ans),
      onRight: function () { var s = $("slot"); if (s) { s.innerHTML = pic(ans); s.classList.add("filled"); } }
    };
  }

  /* ---------- game: count ---------- */
  function genCount() {
    var max = blk.skill.max, e = pick1(theme().items), n;
    do { n = 1 + Math.floor(Math.random() * max); } while (n === lastCount && max > 1);
    lastCount = n;
    var k = CM.LV.count[blk.lvl], top = max + 1, pool = [];
    for (var d = 1; pool.length < k - 1 && d <= top; d++) {
      if (n - d >= 1) pool.push(n - d);
      if (pool.length < k - 1 && n + d <= top) pool.push(n + d);
    }
    var opts = [n].concat(pool).sort(function (a, b) { return a - b; });
    var cols = n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : 4, cells = "";
    for (var i = 0; i < n; i++) cells += "<span>" + pic(e) + "</span>";
    return {
      title: t("howMany"),
      show: '<div class="countbox c' + cols + '" role="img" aria-label="' + esc(CM.nm(e)) + '">' + cells + "</div>",
      opts: opts.map(function (v) { return { html: String(v), label: String(v), correct: v === n, cls: "num" }; }),
      speak: t("sayCount", { name: CM.nm(e) }), praiseName: String(n)
    };
  }

  /* ---------- game: feelings ---------- */
  function genFeel() {
    if (blk.skill.mode === "why") return CM.GEN.feelWhy(genCtx());
    var mode = blk.skill.mode, n = CM.LV.feel[blk.lvl], F = CM.feelings();
    var pool = mode === "other" ? F.filter(function (f) { return f.faces.length > 1; }) : F;
    var target; do { target = pick1(pool); } while (lastFeel && pool.length > 1 && target.id === lastFeel);
    lastFeel = target.id;
    var others = shuffle(F.filter(function (f) { return f.id !== target.id; })).slice(0, n - 1);
    var otherFaces = others.map(function (f) { return { face: pick1(f.faces), f: f, correct: false }; });
    var word = CM.feelWord(target), shown, correctFace, title;
    if (mode === "same") {
      correctFace = pick1(target.faces); title = t("feelSame");
      shown = '<p class="label">' + esc(t("findThis")) + '</p><div class="target face" role="img" aria-label="' + esc(word) + '">' + correctFace + "</div>";
    } else if (mode === "name") {
      correctFace = pick1(target.faces); title = CM.feelQ(target);
      shown = '<div class="target word" role="img" aria-label="' + esc(word) + '">' + esc(word) + "</div>";
    } else {
      var two = shuffle(target.faces.slice()).slice(0, 2); correctFace = two[1]; title = t("feelOther");
      shown = '<p class="label">' + esc(t("feelOtherShort")) + '</p><div class="target face" role="img" aria-label="' + esc(word) + '">' + two[0] + "</div>";
    }
    var opts = shuffle([{ face: correctFace, f: target, correct: true }].concat(otherFaces));
    return {
      title: title, show: shown,
      opts: opts.map(function (o) { return { html: o.face, label: CM.feelWord(o.f), correct: o.correct, cls: "faceopt" }; }),
      speak: mode === "name" ? CM.feelQ(target) : title, praiseName: word
    };
  }

  /* ---------- game: pairs ---------- */
  function genPairs() {
    var n = blk.skill.n, picks = shuffle(theme().items.slice()).slice(0, n);
    var cards = shuffle(picks.concat(picks).map(function (p) { return { item: p, e: p[0], found: false }; }));
    return { kind: "pairs", n: n, cards: cards, open: [], mism: 0, busy: false, peek: CM.LV.pairs[blk.lvl], peeking: false,
      title: t("findPairs"), speak: t("sayPairs") };
  }
  function startPeek() {
    cur.peeking = true;
    pairsTimer = setTimeout(function () { cur.peeking = false; renderPairsGrid(); var s = $("pairsSub"); if (s) s.textContent = t("tapCard"); }, cur.peek * 1000);
  }
  function renderPairs() {
    locked = false; renderSched();
    var cols = cur.n === 2 ? 2 : cur.n === 3 ? 3 : 4;
    stage.innerHTML = '<h1 class="say">' + esc(cur.title) + "</h1>" +
      '<p class="sub" id="pairsSub">' + esc(cur.peeking ? t("peekNote") : t("tapCard")) + "</p>" +
      '<div class="pairs cols' + cols + '" id="pairsGrid" role="group" aria-label="Cards"></div><p class="feedback" id="fb"></p>' + againBtn();
    renderPairsGrid(); bindAgain(); renderDots();
  }
  function partnerHint(i) {
    if (!cur.hint || cur.open.length !== 1 || i === cur.open[0]) return false;
    var c = cur.cards[i]; return !c.found && c.e === cur.cards[cur.open[0]].e;
  }
  function renderPairsGrid() {
    var g = $("pairsGrid"); if (!g) return;
    g.innerHTML = cur.cards.map(function (c, i) {
      var open = cur.open.indexOf(i) >= 0, showFace = c.found || open || cur.peeking;
      var cls = "opt" + (showFace ? "" : " back") + (c.found ? " found" : "") + (open ? " open" : "") + (partnerHint(i) ? " hint" : "");
      var dis = c.found || cur.peeking || cur.busy;
      return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (dis ? " disabled" : "") + ' aria-label="' + esc(showFace ? CM.nm(c.item) : t("faceDown", { n: i + 1 })) + '"><span class="kn" aria-hidden="true">' + (i + 1) + "</span>" + (showFace ? pic(c.item) : "?") + "</button>";
    }).join("");
    g.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { tapCard(+b.dataset.i); }; });
  }
  function tapCard(i) {
    if (cur.busy || cur.peeking || locked) return;
    var c = cur.cards[i]; if (c.found || cur.open.indexOf(i) >= 0) return;
    var fb = $("fb");
    cur.open.push(i);
    if (cur.open.length === 1) { renderPairsGrid(); fb.className = "feedback"; fb.textContent = ""; say(CM.nm(c.item)); return; }
    var A = cur.cards[cur.open[0]], B = cur.cards[cur.open[1]];
    if (A.e === B.e) {
      A.found = B.found = true; cur.open = []; chime();
      var msg = t("aPair", { name: CM.cap(CM.nm(A.item)) });
      fb.className = "feedback ok"; fb.textContent = msg; say(msg);
      renderPairsGrid();
      if (cur.cards.every(function (x) { return x.found; })) pairsComplete();
    } else {
      cur.mism++; cur.busy = true; renderPairsGrid();
      fb.className = "feedback"; fb.textContent = t("notSame"); say(t("notSame"));
      if (cur.mism >= cur.n + 1 && !cur.hint) { cur.hint = true; blk.hints++; log("Several misses on one board", "when a card is turned, its partner gets a dashed outline"); }
      pairsTimer = setTimeout(function () { cur.open = []; cur.busy = false; renderPairsGrid(); }, 1300);
    }
  }
  function pairsComplete() {
    locked = true;
    var good = cur.mism <= cur.n, maxL = CM.LV.pairs.length - 1;
    CM.bkt(blk.skill, good, 3);
    if (good) { blk.firstTry++; blk.okRun++; } else blk.okRun = 0;
    if (S().adaptive && blk.okRun >= 2 && blk.lvl < maxL) { blk.lvl++; blk.okRun = 0; log("2 boards done with few misses", CM.lvDesc("pairs", blk.lvl)); }
    if (S().adaptive && cur.mism > cur.n * 2 && blk.lvl > 0) { blk.lvl--; log("Many misses on a board", CM.lvDesc("pairs", blk.lvl)); }
    var fb = $("fb"); fb.className = "feedback ok"; fb.textContent = t("allPairs"); fanfare(); say(t("allPairs"));
    blk.t++; renderDots();
    pendingAdvance = setTimeout(nextTurn, S().calm ? 2000 : 1700);
  }

  /* ---------- remember first (What's missing?) ---------- */
  function renderPre() {
    locked = true; renderSched(); renderDots();
    stage.innerHTML = cur.pre.html + '<p class="sub">' + esc(t("remember")) + "</p>";
    say(cur.pre.speak);
    pairsTimer = setTimeout(function () { pairsTimer = null; cur.preDone = true; show(renderTurn); say(cur.speak); }, S().calm ? cur.pre.ms + 1000 : cur.pre.ms);
  }

  /* ---------- tap in order (steps, small to big) ---------- */
  function renderTap() {
    locked = false; renderSched();
    cur.next = cur.next || 0;
    var slots = ""; for (var i = 0; i < cur.n; i++) {
      var placed = cur.cards.find(function (c) { return c.rank === i && c.placed; });
      slots += '<span class="tslot' + (placed ? " filled" : "") + '"><span class="tn">' + (i + 1) + "</span>" + (placed ? placed.html : "") + '<span class="tl">' + esc(cur.slotLabel(i) || "") + "</span></span>";
    }
    stage.innerHTML = '<h1 class="say">' + esc(cur.title) + '</h1><div class="tslots" aria-hidden="true">' + slots + "</div>" +
      '<div class="options" role="group" aria-label="' + esc(t("sayOrder")) + '">' + cur.cards.map(function (c, k) {
        return '<button type="button" class="opt' + (c.placed ? " used" : "") + (cur.hint && c.rank === cur.next ? " hint" : "") + '" data-i="' + k + '"' + (c.placed ? " disabled" : "") + ' aria-label="' + esc(c.label) + '"><span class="kn" aria-hidden="true">' + (k + 1) + "</span>" + c.html + "</button>";
      }).join("") + '</div><p class="feedback" id="fb"></p>' + againBtn();
    stage.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { tapPick(+b.dataset.i, b); }; });
    bindAgain(); renderDots();
  }
  function tapPick(k, btn) {
    if (locked || btn.disabled) return;
    var c = cur.cards[k], fb = $("fb");
    if (c.rank === cur.next) {
      c.placed = true; cur.next++; chime(); say(c.label);
      if (cur.next >= cur.n) { locked = true; renderTap(); return customComplete(cur.misses === 0, $("fb")); }
      renderTap();
    } else {
      cur.misses++; fb.className = "feedback"; fb.textContent = t("notYet"); say(t("lookAgain"));
      if (cur.misses >= 2 && !cur.hint) { cur.hint = true; blk.hints++; log("2 misses on one turn", "dashed outline on the next picture"); renderTap(); $("fb").textContent = t("lookOutline"); }
    }
  }

  /* ---------- trace a letter ---------- */
  function renderTrace() {
    locked = false; renderSched();
    stage.innerHTML = '<h1 class="say">' + esc(cur.title) + '</h1><p class="sub">' + esc(t("traceHint")) + "</p>" +
      '<div class="tracebox"><canvas id="traceCv" width="300" height="300" aria-label="' + esc(cur.title) + '" role="img"></canvas></div>' +
      '<div class="row"><button class="small-btn" type="button" id="traceClear">' + esc(t("traceAgain")) + "</button></div>" +
      '<p class="feedback" id="fb"></p>' + againBtn();
    var cv = $("traceCv"), g = cv.getContext("2d"), W = cv.width, H = cv.height;
    var guide = document.createElement("canvas"); guide.width = W; guide.height = H;
    var gg = guide.getContext("2d"); gg.font = "bold 240px Arial, sans-serif"; gg.textAlign = "center"; gg.textBaseline = "middle"; gg.fillStyle = "#000"; gg.fillText(cur.letter, W / 2, H / 2 + 10);
    var gd = gg.getImageData(0, 0, W, H).data, need = 0; for (var i = 3; i < gd.length; i += 4) if (gd[i] > 128) need++;
    var ink = document.createElement("canvas"); ink.width = W; ink.height = H; var ig = ink.getContext("2d");
    ig.lineWidth = 34; ig.lineCap = ig.lineJoin = "round"; ig.strokeStyle = "#000";
    var drawing = false, lastPt = null, done = false;
    function paint() {
      g.clearRect(0, 0, W, H);
      g.globalAlpha = 0.22; g.drawImage(guide, 0, 0); g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over"; g.drawImage(ink, 0, 0);
    }
    function check() {
      var id = ig.getImageData(0, 0, W, H).data, hit = 0, stray = 0;
      for (var j = 3; j < id.length; j += 4) { if (id[j] > 128) { if (gd[j] > 128) hit++; else stray++; } }
      return { cover: hit / need, stray: stray / Math.max(1, hit + stray) };
    }
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    cv.addEventListener("pointerdown", function (e) { if (done) return; drawing = true; lastPt = pt(e); cv.setPointerCapture(e.pointerId); ig.beginPath(); ig.moveTo(lastPt.x, lastPt.y); ig.lineTo(lastPt.x + 0.1, lastPt.y); ig.stroke(); paint(); e.preventDefault(); });
    cv.addEventListener("pointermove", function (e) { if (!drawing) return; var q = pt(e); ig.beginPath(); ig.moveTo(lastPt.x, lastPt.y); ig.lineTo(q.x, q.y); ig.stroke(); lastPt = q; paint(); });
    var up = function () {
      if (!drawing) return; drawing = false;
      var r = check();
      if (r.cover >= 0.7) { done = true; locked = true; customComplete(r.stray < 0.45 && cur.misses === 0, $("fb")); }
    };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    $("traceClear").onclick = function () { if (done) return; ig.clearRect(0, 0, W, H); cur.misses++; paint(); };
    paint(); bindAgain(); renderDots();
    // Keyboard and switch users can't trace: they can mark it done, which counts as practice, not as learned.
    if (S().keys) { var k = document.createElement("button"); k.className = "small-btn"; k.type = "button"; k.textContent = t("firstDone"); k.onclick = function () { if (done) return; done = true; locked = true; cur.misses++; customComplete(false, $("fb")); }; stage.querySelector(".row").appendChild(k); }
  }

  // End of a tap or trace turn: one learning step for the engine, then on to the next turn.
  function customComplete(good, fb) {
    var maxL = CM.LV[blk.game].length - 1;
    CM.bkt(blk.skill, good, 3);
    if (good) { blk.firstTry++; blk.okRun++; } else blk.okRun = 0;
    if (S().adaptive && blk.okRun >= 3 && blk.lvl < maxL) { blk.lvl++; blk.okRun = 0; log("3 right first time in a row", CM.lvDesc(blk.game, blk.lvl, blk.skill)); }
    var msg = praise(cur.praiseName);
    if (fb) { fb.className = "feedback ok"; fb.textContent = msg; }
    chime(); say(msg); blk.t++; renderDots();
    pendingAdvance = setTimeout(nextTurn, S().calm ? 1900 : 1600);
  }

  /* ---------- answering, with errorless prompt fading ---------- */
  function choose(i, btn) {
    if (locked || btn.disabled || !cur) return;
    var o = cur.opts[i], fb = $("fb"), nOpts = cur.opts.length, maxL = CM.LV[blk.game].length - 1, st = P().skills[blk.skill.id];
    if (o.correct) {
      locked = true; btn.classList.remove("hint", "prompt"); btn.classList.add("right");
      if (cur.prompt > 0 && cur.first) {
        // A helped answer: good practice, but not evidence the skill is learned yet.
        blk.prompted++; st.promptRun = (st.promptRun || 0) + 1;
        if (st.promptRun >= 2) {
          st.prompt = Math.max(0, cur.prompt - 1); st.promptRun = 0;
          log("2 right with help", "help fades to: " + CM.PROMPT_NAMES[st.prompt]);
        }
      } else if (cur.first) { CM.bkt(blk.skill, true, nOpts); blk.firstTry++; blk.okRun++; }
      else blk.okRun = 0;
      if (cur.onRight) cur.onRight(o);
      if (o.basket) { var gg = btn.querySelector(".bgot"); if (gg) gg.innerHTML = o.basket.got.join(""); }
      var msg = praise(cur.praiseName);
      fb.className = "feedback ok"; fb.textContent = msg; chime(); say(msg);
      if (S().adaptive && blk.okRun >= 3 && blk.lvl < maxL) {
        blk.lvl++; blk.okRun = 0;
        log("3 right first time in a row", blk.game === "sort" ? "more baskets next time Sort is played" : CM.lvDesc(blk.game, blk.lvl) + " from the next turn");
      }
      blk.t++; renderDots();
      pendingAdvance = setTimeout(nextTurn, S().calm ? 1700 : 1400);
    } else {
      btn.disabled = true;
      if (cur.first) { if (!cur.prompt) CM.bkt(blk.skill, false, nOpts); cur.first = false; }
      if (cur.prompt) st.promptRun = 0;
      blk.okRun = 0; cur.misses++;
      fb.className = "feedback"; fb.textContent = t("notThat"); say(t("lookAgain"));
      if (cur.misses >= 2 && !cur.hint) {
        cur.hint = true; blk.hints++;
        stage.querySelectorAll(".opt").forEach(function (b) { if (cur.opts[+b.dataset.i].correct) b.classList.add("hint"); });
        fb.textContent = t("lookOutline");
        log("2 misses on one turn", "dashed outline on the right answer");
        if (S().errorless && st.prompt < 1) { st.prompt = 1; st.promptRun = 0; log("Errorless start", "help comes back: outline on the answer"); }
        if (S().adaptive && blk.lvl > 0 && !cur.lowered) {
          cur.lowered = true; blk.lvl--;
          log("2 misses on one turn", blk.game === "sort" ? "fewer baskets next time Sort is played" : CM.lvDesc(blk.game, blk.lvl) + " from the next turn");
        }
      }
    }
  }

  function finishBlock() {
    var st = P().skills[blk.skill.id], indep = blk.turns - blk.prompted, rate = indep > 0 ? blk.firstTry / indep : null;
    st.turns += blk.turns; st.lvl = blk.lvl;
    if (rate !== null && indep >= 2 && rate < 0.5 && S().adaptive) { st.struggle = true; log(blk.skill.name + ": " + CM.pct(rate) + " right first time", "flagged, next time the engine steps back"); }
    else if (rate !== null && rate >= 0.75) st.struggle = false;
    log(CM.GAMES[blk.game].label + " finished", blk.skill.name + " now " + CM.pct(st.p) + " sure" + (blk.prompted ? ", " + blk.prompted + " turns with help" : ""));
    var opened = blk.lockedBefore.filter(function (id) { return CM.unlocked(CM.SK[id]); }).map(function (id) { return CM.SK[id]; })
      .filter(function (s) { return S().games[s.game]; });
    opened.forEach(function (s) { log("Unlocked", s.name + " is now open"); });
    session.lastUnlocks = opened;
    session.blocks.push({ skill: blk.skill.id, turns: blk.turns, first: blk.firstTry, hints: blk.hints, prompted: blk.prompted });
    var sticker = newSticker();
    if (sticker) { session.stickers.push(sticker); P().stickers = P().stickers.concat([sticker]).slice(-200); }
    session.lastSticker = sticker; session.lastGame = blk.game;
    if (CM.rewards.earn("game")) session.rewardDue = true;
    CM.store.save();
    session.i++;
    fanfare();
    show(blockDoneScreen);
  }
  function blockDoneScreen() {
    renderSched(); $("progress").hidden = true;
    var nextG = session.plan[session.i], gl = CM.gameName(session.lastGame), calm = S().celebrate === "calm", st = session.lastSticker;
    var unl = (session.lastUnlocks || []).map(function (s) { return '<p class="unlock">' + esc(t("somethingNew", { skill: s.name })) + "</p>"; }).join("");
    stage.innerHTML =
      '<p class="label">' + esc(t("finished", { game: gl })) + "</p>" +
      '<h1 class="say">' + esc(st && !calm ? t("stickerTitle") : t("calmDone")) + "</h1>" +
      (st ? '<div class="stickers' + (calm ? " quiet" : "") + '"><span>' + st + "</span></div>" : "") + unl +
      '<p class="sub">' + esc(nextG ? t("nextIs", { game: CM.gameName(nextG) }) : t("lastGame")) + "</p>" +
      '<button class="big-btn" id="contBtn" type="button">' + esc(nextG ? t("next") : t("finish")) + "</button>";
    say(t("finished", { game: gl }) + ". " + (nextG ? t("nextIs", { game: CM.gameName(nextG) }) : t("lastGame")));
    $("contBtn").onclick = function () {
      var go = function () { nextG ? show(blockIntro) : show(sessionEnd); };
      var maybeBreak = function () {
        if (nextG && S().breakEvery && session.i % S().breakEvery === 0) {
          session.breaks++; log("Break", "offered after " + session.i + " games (setting)"); $("breakBtn").hidden = true;
          return CM.rewards.breakScreen({ title: t("breakTime"), timer: S().breakMin, onReady: function () { $("breakBtn").hidden = false; go(); } });
        }
        go();
      };
      if (session.rewardDue) { session.rewardDue = false; return CM.rewards.rewardScreen(maybeBreak); }
      maybeBreak();
    };
  }
  function sessionEnd() {
    var b = session.blocks, turns = 0, first = 0, hints = 0, prompted = 0;
    b.forEach(function (x) { turns += x.turns; first += x.first; hints += x.hints; prompted += x.prompted || 0; });
    P().history.unshift({ at: Date.now(), blocks: b, turns: turns, first: first, hints: hints, prompted: prompted, breaks: session.breaks, mins: Math.max(1, Math.round((Date.now() - session.start) / 60000)), theme: S().theme, lang: S().lang });
    P().history = P().history.slice(0, 60); CM.store.save();
    log("Session end", first + " of " + turns + " right first time, " + hints + " hints, " + prompted + " helped, " + session.breaks + " breaks");
    var stickers = session.stickers, calm = S().celebrate === "calm"; session = null; blk = null; cur = null;
    $("breakBtn").hidden = true; $("progress").hidden = true; renderSched();
    stage.innerHTML =
      '<p class="label">' + esc(t("allDone")) + '</p><h1 class="say">' + esc(calm ? t("calmWell", { name: P().name }) : t("greatWork", { name: P().name })) + "</h1>" +
      (stickers.length ? '<div class="stickers' + (calm ? " quiet" : "") + '">' + stickers.map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</div>" : "") +
      '<p class="sub">' + esc(stickers.length ? t("played", { n: b.length, s: P().stickers.length }) : t("playedCalm", { n: b.length })) + "</p>" +
      '<div class="row"><button class="big-btn" id="againBtn2" type="button">' + esc(t("playAgain")) + '</button><button class="ghost-btn" id="restBtn" type="button">' + esc(t("stopNow")) + "</button></div>";
    say(calm ? t("sayDoneCalm") : t("sayDone"));
    $("againBtn2").onclick = startScreen;
    if (CM.classroom.on() && CM.store.list().length > 1) { $("restBtn").textContent = t("whoPlaying"); $("restBtn").onclick = function () { chosen = false; startScreen(); }; return; }
    $("restBtn").onclick = function () {
      stage.innerHTML = '<h1 class="say">' + esc(t("seeYou")) + '</h1><p class="sub">' + esc(t("comeBack")) + '</p><button class="ghost-btn" id="backBtn" type="button">' + esc(t("backStart")) + "</button>";
      $("backBtn").onclick = startScreen;
    };
  }

  /* ---------- break ---------- */
  var resumeFn = null;
  function takeBreak() {
    if (!session) return;
    if (pendingAdvance) { clearTimeout(pendingAdvance); pendingAdvance = null; resumeFn = nextTurn; } else resumeFn = screenFn;
    if (pairsTimer) { clearTimeout(pairsTimer); pairsTimer = null; }
    session.breaks++; log("Break", "child asked for a break"); hush();
    $("breakBtn").hidden = true; $("progress").hidden = true;
    CM.rewards.breakScreen({ timer: S().breakMin, onReady: function () {
      $("breakBtn").hidden = false; var f = resumeFn; resumeFn = null;
      if (f === nextTurn) return nextTurn();
      if (f === renderTurn) {
        if (cur && cur.kind === "pairs") { cur.open = []; cur.busy = false; cur.peeking = false; }
        show(renderTurn); return say(cur.speak);
      }
      show(f);
    } });
  }

  /* ================= grown-ups gate ================= */
  var tab = "skills";
  function gateLabel() { $("grownTxt").textContent = CM.store.db().app.gate === "hold" ? "Grown-ups: hold" : "Grown-ups"; }
  function setupGate() {
    var btn = $("grownBtn"), fill = $("grownFill"), start = 0, raf = 0, HOLD = 1500;
    var step = function () { var p = Math.min(1, (performance.now() - start) / HOLD); fill.style.transform = "scaleX(" + p + ")"; if (p >= 1) { stop(); openPanel(); } else raf = requestAnimationFrame(step); };
    var stop = function () { cancelAnimationFrame(raf); fill.style.transform = "scaleX(0)"; };
    btn.addEventListener("pointerdown", function (e) { if (CM.store.db().app.gate !== "hold") return; e.preventDefault(); start = performance.now(); raf = requestAnimationFrame(step); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { btn.addEventListener(ev, stop); });
    btn.addEventListener("click", function () { if (CM.store.db().app.gate === "sum") showSumGate(); });
    btn.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && CM.store.db().app.gate === "hold") { e.preventDefault(); showSumGate(); } });
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }
  function showSumGate() {
    var a = 6 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7), ans = a + b;
    var opts = shuffle([ans, ans + 1, ans - 1, ans + 10]);
    var g = $("gate"); g.hidden = false;
    g.innerHTML = '<h2>For grown-ups</h2><p class="note">What is ' + a + " plus " + b + "?</p>" +
      '<div class="sums">' + opts.map(function (v) { return '<button type="button" data-v="' + v + '">' + v + "</button>"; }).join("") + "</div>" +
      '<p class="note" id="gateMsg"></p><button class="small-btn" type="button" id="gateCancel">Cancel</button>';
    g.querySelectorAll(".sums button").forEach(function (x) {
      x.onclick = function () { if (+x.dataset.v === ans) { g.hidden = true; openPanel(); } else { $("gateMsg").textContent = "Not quite. Ask a grown-up to help."; } };
    });
    $("gateCancel").onclick = function () { g.hidden = true; };
    g.querySelector(".sums button").focus();
  }
  function openPanel() { $("gate").hidden = true; $("panel").hidden = false; document.body.classList.add("grownups"); $("grownBtn").hidden = true; renderPanel(); $("closePanel").focus(); }
  function closePanel() {
    document.body.classList.remove("grownups");
    $("panel").hidden = true; $("grownBtn").hidden = false; applySenses();
    if (CM.tools.active()) return;
    if (!session) startScreen(); else { renderSched(); renderWho(); }
  }
  function renderPanel() {
    document.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", x.dataset.tab === tab); });
    document.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== tab; });
    CM.ui.closePicker();
    ({ child: renderChild, settings: renderSettings, skills: renderProgress, history: renderHistory, engine: renderLog, account: renderAccount, tools: renderTools,
       talk: function () { CM.talk.renderTab($("talkBox"), panelHelpers); }, stories: function () { CM.stories.renderTab($("storyBox"), panelHelpers); }, pictures: renderPictures }[tab] || renderProgress)();
  }

  /* ---------- children tab ---------- */
  var AVATARS = ["🙂", "🦊", "🐻", "🐼", "🐯", "🐨", "🦉", "🐳", "🐙", "🦄"];
  var newAvatar = AVATARS[1], confirmState = {};
  function twoTap(btn, key, label, idle, fn) {
    btn.textContent = confirmState[key] ? label : idle;
    btn.onclick = function () {
      if (confirmState[key]) { confirmState[key] = false; fn(); return; }
      confirmState[key] = true; btn.textContent = label;
      setTimeout(function () { if (confirmState[key]) { confirmState[key] = false; btn.textContent = idle; } }, 4000);
    };
  }
  function renderChild() {
    var list = CM.store.list();
    $("profileChips").innerHTML = list.map(function (x) {
      return '<button type="button" class="chip" aria-pressed="' + (x.id === CM.store.activeId()) + '" data-id="' + esc(x.id) + '">' + esc(x.p.avatar) + " " + esc(x.p.name) + (x.p.example ? ' <span class="ex">example</span>' : "") + "</button>";
    }).join("");
    $("profileChips").querySelectorAll(".chip").forEach(function (c) {
      c.onclick = function () {
        if (session) { $("childMsg").textContent = "Finish or leave the current session before switching."; return; }
        CM.store.setActive(c.dataset.id); applySenses(); renderWho(); renderChild(); log("Player changed", P().name);
      };
    });
    $("renameInput").value = P().name;
    $("avatarChips").innerHTML = AVATARS.map(function (a) { return '<button type="button" class="chip" aria-pressed="' + (a === newAvatar) + '" data-a="' + a + '" aria-label="Avatar ' + a + '">' + a + "</button>"; }).join("");
    $("avatarChips").querySelectorAll(".chip").forEach(function (c) { c.onclick = function () { newAvatar = c.dataset.a; renderChild(); }; });
    $("stickerBook").innerHTML = P().stickers.length ? P().stickers.map(function (s) { return "<span>" + s + "</span>"; }).join("") : '<p class="note">No stickers yet. One is earned for each game finished.</p>';
    $("deleteBtn").disabled = list.length < 2;
    $("classOn").checked = CM.classroom.on();
    $("classOn").onchange = function () { CM.classroom.set($("classOn").checked); chosen = true; log("Classroom mode", $("classOn").checked ? "on: children pick their avatar to start" : "off"); renderChild(); };
    if (CM.classroom.on()) CM.classroom.renderOverview($("classBox")); else $("classBox").innerHTML = "";
    twoTap($("resetBtn"), "reset", "Tap again to reset", "Reset this child's progress", function () {
      var p = P(); p.skills = CM.store.freshSkills(); p.history = []; p.stickers = []; CM.store.save(); log("Progress reset", p.name); renderChild();
    });
    twoTap($("deleteBtn"), "del", "Tap again to remove " + P().name, "Remove this child", function () {
      if (session || CM.store.list().length < 2) return;
      var goneId = CM.store.activeId(), gone = CM.store.remove(goneId); try { CM.lib.forget(goneId); } catch (e) {}
      if (CM.cloud && CM.cloud.user()) CM.cloud.deleteRemoteChild(gone).catch(function () {});
      applySenses(); renderWho(); renderChild();
    });
    twoTap($("wipeBtn"), "wipe", "Tap again to delete everything", "Delete everything on this device", function () {
      CM.store.wipeDevice().then(function () { location.reload(); });
    });
  }
  function bindChildStatic() {
    $("renameBtn").onclick = function () { var v = $("renameInput").value.trim().slice(0, 20); if (v) { P().name = v; CM.store.persist(); renderWho(); renderChild(); } };
    $("addBtn").onclick = function () {
      var v = $("newName").value.trim().slice(0, 20); if (!v) { $("childMsg").textContent = "Type a nickname first."; return; }
      if (session) { $("childMsg").textContent = "Finish or leave the current session first."; return; }
      CM.store.add(v, newAvatar, S()); $("newName").value = ""; $("childMsg").textContent = "Added " + v + ". Settings copied from the previous player.";
      applySenses(); renderWho(); renderChild(); log("Child added", v);
    };
    $("exampleBtn").onclick = function () {
      if (session) return;
      var id = CM.store.add("Sam", "🦊", null), p = CM.store.db().profiles[id]; p.example = true;
      var set = function (k, v) { Object.assign(p.skills[k], { prompt: 0 }, v); };
      set("same", { p: 0.97, turns: 32, lvl: 3 }); set("sortPic", { p: 0.92, turns: 16, lvl: 1 }); set("sortSize", { p: 0.66, turns: 8, lvl: 0 });
      set("seqAB", { p: 0.81, turns: 12, lvl: 1 }); set("seqAAB", { p: 0.34, turns: 4, lvl: 0, struggle: true });
      set("count3", { p: 0.93, turns: 12, lvl: 2 }); set("count5", { p: 0.52, turns: 8, lvl: 1 }); set("pairs2", { p: 0.71, turns: 4, lvl: 1 });
      set("feelSame", { p: 0.88, turns: 8, lvl: 1 }); set("feelName", { p: 0.31, turns: 4, lvl: 0, prompt: 1 });
      var day = 864e5, now = Date.now();
      p.history = [
        { at: now - day, blocks: [{ skill: "same", turns: 4, first: 4, hints: 0, prompted: 0 }, { skill: "feelName", turns: 4, first: 1, hints: 1, prompted: 2 }, { skill: "count5", turns: 4, first: 3, hints: 0, prompted: 0 }], turns: 12, first: 8, hints: 1, prompted: 2, breaks: 1, mins: 9, theme: "vehicles", lang: "en" },
        { at: now - 2 * day, blocks: [{ skill: "count3", turns: 4, first: 4, hints: 0, prompted: 0 }, { skill: "seqAAB", turns: 4, first: 1, hints: 2, prompted: 0 }, { skill: "sortSize", turns: 4, first: 3, hints: 0, prompted: 0 }], turns: 12, first: 8, hints: 2, prompted: 0, breaks: 0, mins: 8, theme: "vehicles", lang: "en" },
        { at: now - 4 * day, blocks: [{ skill: "feelSame", turns: 4, first: 3, hints: 0, prompted: 1 }, { skill: "pairs2", turns: 2, first: 1, hints: 1, prompted: 0 }, { skill: "same", turns: 4, first: 4, hints: 0, prompted: 0 }], turns: 10, first: 8, hints: 1, prompted: 1, breaks: 0, mins: 8, theme: "animals", lang: "ga" },
        { at: now - 6 * day, blocks: [{ skill: "sortPic", turns: 4, first: 4, hints: 0, prompted: 0 }, { skill: "seqAB", turns: 4, first: 3, hints: 0, prompted: 0 }, { skill: "same", turns: 4, first: 4, hints: 0, prompted: 0 }], turns: 12, first: 11, hints: 0, prompted: 0, breaks: 0, mins: 7, theme: "animals", lang: "en" },
        { at: now - 9 * day, blocks: [{ skill: "same", turns: 4, first: 3, hints: 0, prompted: 0 }, { skill: "sortPic", turns: 4, first: 2, hints: 1, prompted: 0 }, { skill: "seqAB", turns: 4, first: 2, hints: 1, prompted: 0 }], turns: 12, first: 7, hints: 2, prompted: 0, breaks: 2, mins: 12, theme: "vehicles", lang: "en" }
      ];
      p.stickers = ["🚂", "🚌", "🚁", "⭐", "🚜", "🚒", "⛵", "🌟", "🐸", "🐢"];
      p.settings.theme = "vehicles"; p.settings.errorless = true;
      CM.store.persist(); applySenses(); renderWho(); tab = "skills"; renderPanel();
      log("Example child added", "Sam, with five past sessions. Never synced to an account.");
    };
  }

  /* ---------- settings tab ---------- */
  function chipGroup(el, entries, current, onPick, rerender) {
    el.innerHTML = entries.map(function (e) { return '<button type="button" class="chip" aria-pressed="' + (String(e[0]) === String(current)) + '" data-v="' + e[0] + '">' + e[1] + "</button>"; }).join("");
    el.querySelectorAll(".chip").forEach(function (b) { b.onclick = function () { onPick(b.dataset.v); CM.store.save(); (rerender || renderSettings)(); }; });
  }
  function renderSettings() {
    var s = S();
    chipGroup($("langChips"), [["en", "English"], ["ga", "Gaeilge"]], s.lang, function (v) { s.lang = v; applySenses(); log("Language", v === "ga" ? "games in Irish" : "games in English"); });
    var voiceNote = $("langNote");
    voiceNote.textContent = s.lang === "ga" ? (CM.irishVoice() ? "An Irish voice was found on this device, so read-aloud works in Irish." : "No Irish voice was found on this device, so read-aloud stays silent in Gaeilge rather than mispronounce words. Everything else is in Irish.") : "";
    chipGroup($("themeChips"), Object.keys(CM.THEMES).map(function (k) { return [k, CM.THEMES[k].items[0][0] + " " + CM.THEMES[k].label]; }), s.theme, function (v) { s.theme = v; log("Theme changed", CM.THEMES[v].label + " from the next turn"); });
    chipGroup($("touchChips"), [["instant", "Tap"], ["hold", "Hold to choose"], ["release", "Slide and lift"]], s.touchMode, function (v) {
      s.touchMode = v; CM.touch.apply();
      log("Touch style", v === "hold" ? "hold to choose (" + (s.holdMs / 1000) + " s)" : v === "release" ? "slide and lift" : "tap: chosen the moment a finger lands");
    });
    $("touchNote").textContent = CM.touch.describe(s.touchMode);
    $("holdRow").hidden = s.touchMode !== "hold";
    chipGroup($("holdChips"), CM.HOLD_CHOICES.map(function (ms) { return [ms, (ms / 1000) + " s"]; }), s.holdMs, function (v) { s.holdMs = +v; });
    chipGroup($("cooldownChips"), CM.COOLDOWN_CHOICES.map(function (ms) { return [ms, ms ? (ms / 1000) + " s" : "Off"]; }), s.cooldownMs, function (v) { s.cooldownMs = +v; });
    var tryBtn = $("touchTry"), tryN = 0;
    $("touchTryMsg").textContent = "";
    tryBtn.onclick = function () { tryN++; chime(); $("touchTryMsg").textContent = tryN === 1 ? "Chosen! That's how it will feel in the games." : "Chosen " + tryN + " times."; };
    chipGroup($("rateChips"), [[0.7, "Voice: slow"], [0.85, "Voice: gentle"], [1, "Voice: normal"]], s.rate, function (v) { s.rate = +v; say("This is how I will sound"); });
    chipGroup($("blockChips"), [[2, "2"], [3, "3"], [4, "4"]], s.blocks, function (v) { s.blocks = +v; });
    chipGroup($("turnChips"), [[3, "3"], [4, "4"], [6, "6"]], s.turns, function (v) { s.turns = +v; });
    chipGroup($("modeChips"), [["engine", "Engine picks"], ["fixed", "Same order every time"]], s.mode, function (v) { s.mode = v; });
    chipGroup($("stickerChips"), [["theme", CM.theme().items[0][0] + " Theme pictures"], ["stars", "⭐ Stars"], ["hearts", "💚 Hearts"], ["shapes", "🔷 Shapes"], ["none", "No stickers"]], s.stickerSet, function (v) { s.stickerSet = v; });
    chipGroup($("celebrateChips"), [["cheerful", "Cheerful"], ["gentle", "Gentle"], ["calm", "Very calm"]], s.celebrate, function (v) { s.celebrate = v; chime(); });
    var app = CM.store.db().app;
    chipGroup($("gateChips"), [["hold", "Press and hold"], ["sum", "Answer a sum"]], app.gate, function (v) { app.gate = v; CM.store.persist(); gateLabel(); });
    ["sound", "speech", "calm", "contrast", "big", "keys", "adaptive", "errorless", "photos", "moreFeelings"].forEach(function (k) {
      var c = $("s-" + k); c.checked = !!s[k];
      c.onchange = function () {
        s[k] = c.checked; CM.store.save(); applySenses();
        if (k === "speech" && c.checked) say("Read aloud is on");
        if (k === "errorless") log("Errorless start", c.checked ? "on: new skills begin with the answer highlighted" : "off");
        if (k === "photos") renderPhotos();
        if (k === "moreFeelings") log("More feelings", c.checked ? "on: calm, silly, worried and loving join the Feelings game" : "off: the six main feelings");
      };
    });
    $("gameToggles").innerHTML = CM.GAME_CATS.map(function (c) {
      return '<p style="margin:12px 0 4px"><b>' + esc(c[1]) + '</b></p><div class="grid2">' + CM.GAME_ORDER.filter(function (g) { return CM.GAMES[g].cat === c[0]; }).map(function (g) {
        return '<label class="toggle"><input type="checkbox" id="g-' + g + '"><span>' + esc(CM.GAMES[g].label) + "<small>" + esc(CM.GAMES[g].does) + "</small></span></label>";
      }).join("") + "</div>";
    }).join("");
    var nn = $("newGamesNote");
    nn.hidden = !P().newGamesOff;
    nn.innerHTML = 'New games have been added. They start switched off for ' + esc(P().name) + ' so the usual routine doesn\'t change. Switch on the ones you\'d like. <button type="button" class="small-btn" id="allGamesOn">Switch them all on</button>';
    if ($("allGamesOn")) $("allGamesOn").onclick = function () { CM.NEW_GAMES.forEach(function (g) { s.games[g] = true; }); delete P().newGamesOff; CM.store.save(); renderSettings(); };
    CM.GAME_ORDER.forEach(function (g) {
      var c = $("g-" + g); c.checked = !!s.games[g];
      c.onchange = function () { s.games[g] = c.checked; if (!CM.GAME_ORDER.some(function (x) { return s.games[x]; })) { s.games[g] = true; c.checked = true; } CM.store.save(); };
    });
    chipGroup($("tokenChips"), [[0, "Off"], [3, "3 tokens"], [5, "5 tokens"], [10, "10 tokens"]], s.tokens, function (v) { s.tokens = +v; applySenses(); log("Token board", +v ? v + " tokens for the reward" : "off"); });
    chipGroup($("tokenIconChips"), [["star", "⭐ Stars"], ["theme", CM.theme().items[0][0] + " Theme picture"]], s.tokenIcon, function (v) { s.tokenIcon = v; applySenses(); });
    var rw = CM.ref(CM.lib.kid().reward);
    $("rewardNow").innerHTML = 'Reward: <span class="se-e">' + rw.html + "</span> <b>" + esc(rw.name) + "</b> ";
    $("rewardPick").onclick = function () { CM.ui.pickRef($("rewardPickBox"), function (r) { CM.lib.kid().reward = r; CM.lib.save(); applySenses(); renderSettings(); }); };
    chipGroup($("breakMinChips"), [[0, "No timer"], [1, "1 min"], [2, "2 min"], [3, "3 min"], [5, "5 min"]], s.breakMin, function (v) { s.breakMin = +v; });
    chipGroup($("breakEveryChips"), [[0, "Only when asked"], [1, "After every game"], [2, "After every 2 games"], [3, "After every 3 games"]], s.breakEvery, function (v) { s.breakEvery = +v; });
    renderPhotos();
  }
  function renderPhotos() {
    var s = S(), tk = s.theme, th = CM.THEMES[tk];
    $("photoThemeName").textContent = th.label;
    $("photoSlots").innerHTML = th.items.map(function (it, i) {
      var own = CM.photos.own(tk, it), pack = CM.photos.pack(tk, it);
      return '<div class="pslot"><div class="pthumb">' + (own ? '<img src="' + own + '" alt="">' : pack ? '<img src="' + pack + '" alt="" data-fb="' + it[0] + '">' : it[0]) + "</div>" +
        '<span class="pname">' + esc(it[1]) + "</span>" +
        '<label class="small-btn pbtn">' + (own ? "Change" : "Add photo") + '<input type="file" accept="image/*" data-i="' + i + '" class="visually-hidden"></label>' +
        (own ? '<button type="button" class="small-btn danger pbtn" data-rm="' + i + '">Remove</button>' : "") + "</div>";
    }).join("");
    $("photoSlots").querySelectorAll("input[type=file]").forEach(function (inp) {
      inp.onchange = function () {
        var it = th.items[+inp.dataset.i], f = inp.files && inp.files[0]; if (!f) return;
        $("photoMsg").textContent = "Saving…";
        CM.photos.add(tk, it, f).then(function () {
          $("photoMsg").textContent = "Saved a photo for " + it[1] + "."; log("Photo added", th.label + ": " + it[1]);
          if (!s.photos) { s.photos = true; $("s-photos").checked = true; CM.store.save(); }
          renderPhotos();
        }).catch(function (e) { $("photoMsg").textContent = e.message; });
      };
    });
    $("photoSlots").querySelectorAll("[data-rm]").forEach(function (b) {
      b.onclick = function () { CM.photos.remove(tk, th.items[+b.dataset.rm]); renderPhotos(); };
    });
    $("photoCount").textContent = CM.photos.count(tk) + " of " + th.items.length + " pictures have a photo. Pictures without one stay as emoji.";
  }

  /* ---------- progress tab (graphical) ---------- */
  var selectedNode = null;
  var STATUS_LABEL = { locked: "Not open yet", ready: "Ready to try", learning: "Learning", mastered: "Learned" };
  function lastPractised(id) {
    var h = P().history.find(function (r) { return r.blocks.some(function (b) { return b.skill === id; }); });
    return h ? new Date(h.at).toLocaleDateString([], { day: "numeric", month: "short" }) : "never";
  }
  function ring(s, small) {
    var st = P().skills[s.id], status = CM.status(s), p = Math.round(st.p * 100), off = !S().games[s.game];
    var inner = status === "mastered" ? "✓" : status === "locked" ? "🔒" : p + "%";
    return '<button type="button" class="node2 ' + status + (off ? " off" : "") + (selectedNode === s.id ? " sel" : "") + '" data-node="' + s.id + '" aria-label="' + esc(s.name + ": " + STATUS_LABEL[status] + ", " + p + "% sure") + '">' +
      '<span class="ring" style="--p:' + p + '"><span>' + inner + "</span></span>" + (st.struggle ? '<span class="flag" aria-hidden="true">↩</span>' : "") +
      '<span class="nlabel">' + esc(s.name) + "</span></button>";
  }
  function renderProgress() {
    var h = P().history, now = Date.now(), week = h.filter(function (r) { return now - r.at < 7 * 864e5; });
    var mins = week.reduce(function (a, r) { return a + r.mins; }, 0);
    var recent = h.slice(0, 5), prev = h.slice(5, 10);
    var rate = function (rows) { var tt = 0, f = 0; rows.forEach(function (r) { tt += r.turns - (r.prompted || 0); f += r.first; }); return tt ? f / tt : null; };
    var rNow = rate(recent), rPrev = rate(prev);
    var enabled = CM.SKILLS.filter(function (s) { return S().games[s.game]; });
    var learned = enabled.filter(function (s) { return CM.status(s) === "mastered"; });
    var trend = rNow !== null && rPrev !== null ? (rNow > rPrev + 0.04 ? "Up from " + CM.pct(rPrev) : rNow < rPrev - 0.04 ? "Down from " + CM.pct(rPrev) : "Steady") : recent.length ? "Last " + recent.length + " sessions" : "No sessions yet";
    $("progSummary").innerHTML =
      tile("Sessions this week", String(week.length), week.length ? mins + " minutes in total" : "None yet") +
      tile("Right first time", rNow === null ? "–" : CM.pct(rNow), trend) +
      '<div class="tile"><span class="tl">Skills learned</span><div class="tile-ring"><span class="ring big" style="--p:' + Math.round(learned.length / Math.max(1, enabled.length) * 100) + '"><span>' + learned.length + "/" + enabled.length + "</span></span></div></div>" +
      tile("Stickers", String(P().stickers.length), "In the sticker book");

    var by = function (status) { return enabled.filter(function (s) { return CM.status(s) === status; }); };
    var working = by("learning").sort(function (a, b) { return CM.pp(b) - CM.pp(a); });
    var stepBack = enabled.filter(function (s) { return P().skills[s.id].struggle; });
    var helped = S().errorless ? enabled.filter(function (s) { var st = P().skills[s.id]; return st.turns && st.prompt > 0; }) : [];
    var lines = [];
    if (learned.length) lines.push(['ok', "Learned", learned.map(function (s) { return s.name; }).join(", ")]);
    if (working.length) lines.push(['learning', "Working on", working.map(function (s) { return s.name + " (" + CM.pct(CM.pp(s)) + ")"; }).join(", ")]);
    if (stepBack.length) lines.push(['step', "A bit hard last time", stepBack.map(function (s) { return s.name; }).join(", ") + ". The engine will practise the skill before it next time."]);
    if (helped.length) lines.push(['help', "Still with help", helped.map(function (s) { return s.name + " (" + CM.PROMPT_NAMES[P().skills[s.id].prompt] + ")"; }).join(", ")]);
    if (by("ready").length) lines.push(['ready', "Ready to try", by("ready").map(function (s) { return s.name; }).join(", ")]);
    $("progWords").innerHTML = lines.length ? lines.map(function (l) { return '<li class="pw ' + l[0] + '"><b>' + l[1] + "</b><span>" + esc(l[2]) + "</span></li>"; }).join("")
      : '<li class="pw"><span>Play a session to see progress here.</span></li>';

    var trackRow = function (tr) {
      var skills = CM.SKILLS.filter(function (s) { return s.game === tr.game; });
      return '<div class="trow' + (S().games[tr.game] ? "" : " off") + '"><div class="tname"><span aria-hidden="true">' + CM.gameIcon(tr.game) + "</span>" + tr.title + '</div><div class="tnodes">' + skills.map(function (s) { return ring(s); }).join('<span class="tline" aria-hidden="true"></span>') + "</div></div>";
    };
    $("progMap").innerHTML = '<div class="trow root"><div class="tname"><span aria-hidden="true">' + CM.gameIcon("match") + '</span>Start here</div><div class="tnodes">' + ring(CM.SK.same) + "</div></div>" + CM.TRACKS.map(trackRow).join("");
    $("progMap").querySelectorAll("[data-node]").forEach(function (b) { b.onclick = function () { selectedNode = b.dataset.node; renderProgress(); }; });
    renderNodeDetail();

    var r = CM.planSession();
    $("planPreview").innerHTML = r.plan.map(function (g, i) {
      var k = CM.pickSkill(g, false);
      return '<li class="pcard"><span class="pic" aria-hidden="true">' + CM.gameIcon(g) + '</span><div><b>' + (i + 1) + ". " + CM.GAMES[g].label + ": " + esc(k[0].name) + '</b><span class="note">' + esc(r.reasons[i] || r.reasons[0]) + ". " + esc(k[1]) + ".</span></div></li>";
    }).join("");
  }
  function tile(label, big, small) { return '<div class="tile"><span class="tl">' + label + '</span><span class="tv">' + big + '</span><span class="ts">' + esc(small) + "</span></div>"; }
  function renderNodeDetail() {
    var el = $("nodeDetail");
    if (!selectedNode) { el.innerHTML = '<p class="note">Tap a circle to see the details for that skill.</p>'; return; }
    var s = CM.SK[selectedNode], st = P().skills[s.id], status = CM.status(s);
    var pre = s.pre.map(function (id) { return CM.SK[id].name; }).join(", ");
    el.innerHTML = '<div class="ndetail"><h4>' + esc(s.name) + ' <span class="pill ' + status + '">' + STATUS_LABEL[status] + "</span></h4>" +
      '<div class="bar" role="img" aria-label="' + CM.pct(st.p) + ' sure"><i style="width:' + Math.round(st.p * 100) + '%"></i><span class="mk" style="left:60%"></span><span class="mk" style="left:90%"></span></div>' +
      '<dl class="dl"><dt>How sure</dt><dd>' + CM.pct(st.p) + " (opens next skill at 60%, learned at 90%)</dd><dt>Turns played</dt><dd>" + st.turns + "</dd><dt>Difficulty now</dt><dd>" + CM.lvShort(s.game, st.lvl) + "</dd>" +
      (S().errorless && s.game !== "pairs" ? "<dt>Help</dt><dd>" + CM.PROMPT_NAMES[st.prompt || 0] + "</dd>" : "") +
      "<dt>Last practised</dt><dd>" + lastPractised(s.id) + "</dd>" + (pre ? "<dt>Opens after</dt><dd>" + esc(pre) + "</dd>" : "") +
      (st.struggle ? "<dt>Next time</dt><dd>Steps back to practise the skill before it</dd>" : "") + "</dl></div>";
  }

  /* ---------- history tab ---------- */
  function renderHistory() {
    var h = P().history;
    var last = h.slice(0, 12).reverse(), W = 560, H = 170, x0 = 44, x1 = W - 10, y0 = 14, y1 = 130;
    var svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Right first time, last ' + last.length + ' sessions">';
    [0, 0.5, 1].forEach(function (v) { var y = y1 - (y1 - y0) * v; svg += '<line class="g" x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '"/><text x="' + (x0 - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + v * 100 + "%</text>"; });
    if (last.length) {
      var bw = Math.min(36, (x1 - x0) / last.length - 8);
      last.forEach(function (r, i) {
        var indep = r.turns - (r.prompted || 0), v = indep ? r.first / indep : 0, cx = x0 + (i + 0.5) * (x1 - x0) / last.length, top = y1 - (y1 - y0) * v;
        svg += '<rect class="b" x="' + (cx - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + Math.max(1, y1 - top) + '" rx="4"><title>' + CM.pct(v) + "</title></rect>";
        svg += '<text x="' + cx + '" y="' + (y1 + 16) + '" text-anchor="middle">' + new Date(r.at).toLocaleDateString([], { day: "numeric", month: "short" }) + "</text>";
      });
    } else svg += '<text x="' + ((x0 + x1) / 2) + '" y="' + ((y0 + y1) / 2) + '" text-anchor="middle">No sessions yet</text>';
    svg += '<text x="' + x0 + '" y="' + (H - 4) + '">Oldest</text><text x="' + x1 + '" y="' + (H - 4) + '" text-anchor="end">Newest</text></svg>';
    $("histChart").innerHTML = svg;
    $("histBody").innerHTML = h.length ? h.map(function (r) {
      var d = new Date(r.at), indep = r.turns - (r.prompted || 0);
      return "<tr><td>" + d.toLocaleDateString([], { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</td><td>" +
        r.blocks.map(function (b) { return esc(CM.SK[b.skill] ? CM.SK[b.skill].name : b.skill) +  ' <span class="note">' + (+b.first || 0) + "/" + ((+b.turns || 0) - (+b.prompted || 0)) + (b.prompted ? ", " + (+b.prompted || 0) + " helped" : "") + "</span>"; }).join("<br>") +
        "</td><td>" + (+r.first || 0) + " of " + indep + " (" + CM.pct(indep ? r.first / indep : 0) + ")</td><td>" + (+r.prompted || 0) + "</td><td>" + (+r.hints || 0) + "</td><td>" + (+r.breaks || 0) + "</td><td>" + (+r.mins || 0) + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="note">No sessions yet for ' + esc(P().name) + ". Finish a session, or add the example child on the Children tab.</td></tr>";
  }
  function exportJSON() {
    var p = P();
    return JSON.stringify({ exported: new Date().toISOString(), child: p.name, avatar: p.avatar, settings: p.settings, skills: p.skills, history: p.history, stickers: p.stickers }, null, 2);
  }
  // One row per game played, ready for Excel, Google Sheets or Numbers.
  function exportCSV() {
    // Quote for CSV, and stop text that starts with = + - @ being run as a spreadsheet formula.
    var q = function (v) {
      if (typeof v === "number") return String(v);
      v = v == null ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
      return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var rows = [["Date", "Time", "Child", "Game", "Skill", "Turns", "Turns with errorless help", "Independent turns", "Right first time", "Right first time %", "Hints", "Session breaks", "Session minutes", "Theme", "Language"]];
    P().history.slice().reverse().forEach(function (r) {
      var d = new Date(r.at), date = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      var time = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      r.blocks.forEach(function (b) {
        var sk = CM.SK[b.skill], indep = b.turns - (b.prompted || 0);
        rows.push([date, time, P().name, sk ? CM.GAMES[sk.game].label : "", sk ? sk.name : b.skill, b.turns, b.prompted || 0, indep, b.first, indep ? Math.round(b.first / indep * 100) : "", b.hints, r.breaks, r.mins, (CM.THEMES[r.theme] || {}).label || r.theme, r.lang === "ga" ? "Irish" : "English"]);
      });
    });
    return "﻿" + rows.map(function (r) { return r.map(q).join(","); }).join("\r\n") + "\r\n";
  }
  function download(name, data, type) {
    var blob = new Blob([data], { type: type }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function fileBase() { return "calm-match-" + P().name.replace(/[^a-z0-9]+/gi, "-").toLowerCase(); }
  function bindHistoryStatic() {
    $("csvBtn").onclick = function () { download(fileBase() + "-history.csv", exportCSV(), "text/csv;charset=utf-8"); $("copyMsg").textContent = "Downloaded. Opens in Excel, Google Sheets or Numbers."; };
    $("downloadBtn").onclick = function () { download(fileBase() + ".json", exportJSON(), "application/json"); };
    $("copyBtn").onclick = function () {
      var data = exportCSV().replace(/^﻿/, ""), area = $("copyArea");
      var fallback = function () { area.hidden = false; area.value = data; area.select(); $("copyMsg").textContent = "Select all and copy from the box."; };
      try { navigator.clipboard.writeText(data).then(function () { $("copyMsg").textContent = "Copied. Paste into a spreadsheet or an email."; }, fallback); } catch (e) { fallback(); }
    };
  }

  /* ---------- tools tab ---------- */
  function renderTools() {
    var b = S().board;
    var grid = function (el, current, key) {
      el.innerHTML = CM.ACTIVITIES.map(function (a, i) { return '<button type="button" class="chip act" aria-pressed="' + (i === current) + '" data-i="' + i + '"><span aria-hidden="true">' + a[0] + "</span> " + esc(a[1]) + "</button>"; }).join("");
      el.querySelectorAll(".chip").forEach(function (c) { c.onclick = function () { b[key] = +c.dataset.i; CM.store.save(); renderTools(); }; });
    };
    grid($("firstChips"), b.first, "first"); grid($("thenChips"), b.then, "then");
    chipGroup($("boardTimerChips"), [[0, "No timer"], [1, "1 min"], [2, "2 min"], [5, "5 min"], [10, "10 min"], [15, "15 min"]], b.minutes, function (v) { b.minutes = +v; }, renderTools);
    $("boardPreview").innerHTML = '<span aria-hidden="true">' + CM.ACTIVITIES[b.first][0] + "</span> " + esc(CM.ACTIVITIES[b.first][1]) + ' <span class="note">then</span> <span aria-hidden="true">' + CM.ACTIVITIES[b.then][0] + "</span> " + esc(CM.ACTIVITIES[b.then][1]) + (b.minutes ? ' <span class="note">· ' + b.minutes + " min timer</span>" : "");
    renderSchedEditor();
    var tm = CM.store.db().app.timerMin || 5;
    chipGroup($("timerChips"), [[1, "1 min"], [2, "2 min"], [3, "3 min"], [5, "5 min"], [10, "10 min"], [15, "15 min"], [20, "20 min"]], tm, function (v) { CM.store.db().app.timerMin = +v; CM.store.persist(); }, renderTools);
    $("toolsMsg").textContent = session ? "A game session is running. Finish it, or the board and timer will replace it." : "";
  }
  function bindToolsStatic() {
    $("showBoardBtn").onclick = function () { showChild(function () { CM.tools.board(S().board); }); };
    $("startTimerBtn").onclick = function () { showChild(function () { CM.tools.timer(CM.store.db().app.timerMin || 5); }); };
  }
  // Close the grown-ups area and show something full-size to the child.
  function showChild(fn) { session = null; clearTimers(); $("panel").hidden = true; $("grownBtn").hidden = false; applySenses(); fn(); }
  var panelHelpers = { showChild: showChild, refresh: function () { applySenses(); renderPanel(); } };

  /* ---------- schedules (in the Schedules & timer tab) ---------- */
  var DAYS = [[1, "Mon"], [2, "Tue"], [3, "Wed"], [4, "Thu"], [5, "Fri"], [6, "Sat"], [0, "Sun"]];
  function renderSchedEditor() {
    var box = $("schedBox"), list = CM.lib.schedules(), sc = CM.lib.activeSchedule(), steps = sc.steps, max = CM.lib.MAX_STEPS;
    var howtos = CM.lib.stories("howto"), storyList = CM.lib.stories("story"), anyStories = howtos.length + storyList.length > 0;
    box.innerHTML = '<h3>Visual schedules</h3><p class="note">Up to ' + max + ' steps in order. Your child sees every step with "Now" and "Next" marked, and taps Done to move on. Keep several schedules (morning, school, bedtime) and set the days each one is for.</p>' +
      '<div class="chips" id="schedPick">' + list.map(function (x) { return '<button type="button" class="chip" data-s="' + esc(x.id) + '" aria-pressed="' + (x.id === sc.id) + '">' + esc(x.name) + " (" + x.steps.length + ")</button>"; }).join("") +
        (list.length < CM.lib.MAX_SCHED ? '<button type="button" class="chip" id="schedNew">+ New schedule</button>' : "") + "</div>" +
      '<div class="inline-field" style="margin-top:10px"><input type="text" id="schedName" maxlength="30" aria-label="Schedule name" value="' + esc(sc.name) + '"><button class="small-btn" type="button" id="schedRename">Rename</button></div>' +
      '<p style="margin:10px 0 4px"><b>Days</b> <span class="note">(optional: on these days, "Show today\'s schedule" picks this one)</span></p><div class="chips" id="schedDays">' +
        DAYS.map(function (d) { return '<button type="button" class="chip" data-d="' + d[0] + '" aria-pressed="' + (sc.days.indexOf(d[0]) >= 0) + '">' + d[1] + "</button>"; }).join("") + "</div>" +
      '<ol class="sched-edit" id="schedList">' + (steps.length ? steps.map(function (st, k) {
        var x = CM.ref(st.r);
        return '<li class="se-step"><span class="se-n">' + (k + 1) + '</span><span class="se-e">' + x.html + '</span><span class="se-name">' + esc(CM.cap(x.name)) + "</span>" +
          '<select data-min="' + k + '" aria-label="Timer for ' + esc(x.name) + '">' + [0, 1, 2, 5, 10, 15, 20, 30].map(function (m) { return '<option value="' + m + '"' + ((st.min || 0) === m ? " selected" : "") + ">" + (m ? m + " min timer" : "No timer") + "</option>"; }).join("") + "</select>" +
          (anyStories ? '<select data-how="' + k + '" aria-label="How-to or story for ' + esc(x.name) + '"><option value="">No how-to or story</option>' +
            (howtos.length ? '<optgroup label="How-tos">' + howtos.map(function (hw) { return '<option value="' + esc(hw.id) + '"' + (st.howto === hw.id ? " selected" : "") + ">Show me how: " + esc(hw.title) + "</option>"; }).join("") + "</optgroup>" : "") +
            (storyList.length ? '<optgroup label="Stories">' + storyList.map(function (sy) { return '<option value="' + esc(sy.id) + '"' + (st.howto === sy.id ? " selected" : "") + ">Read: " + esc(sy.title) + "</option>"; }).join("") + "</optgroup>" : "") + "</select>" : "") +
          (CM.voice ? CM.voice.button(CM.voice.refKey(st.r)) : "") +
          '<button type="button" class="se-btn" data-mv="-1" data-k="' + k + '" aria-label="Move ' + esc(x.name) + ' earlier"' + (k === 0 ? " disabled" : "") + ">↑</button>" +
          '<button type="button" class="se-btn" data-mv="1" data-k="' + k + '" aria-label="Move ' + esc(x.name) + ' later"' + (k === steps.length - 1 ? " disabled" : "") + ">↓</button>" +
          '<button type="button" class="se-btn" data-rm="' + k + '" aria-label="Remove ' + esc(x.name) + '">✕</button></li>';
      }).join("") : '<li class="note se-empty">No steps yet. Add some below.</li>') + "</ol>" +
      '<p style="margin:12px 0 4px"><b>Add a step</b></p><div class="chips" id="schedAdd">' + CM.ACTIVITIES.map(function (a, i) { return '<button type="button" class="chip act" data-i="' + i + '"' + (steps.length >= max ? " disabled" : "") + '><span aria-hidden="true">' + a[0] + "</span> " + esc(a[1]) + "</button>"; }).join("") + "</div>" +
      '<div class="row start" style="margin-top:8px"><button class="small-btn" type="button" id="schedMore"' + (steps.length >= max ? " disabled" : "") + '>More pictures: symbols, themes, my pictures</button></div><div id="schedPickBox"></div>' +
      '<div class="row start" style="margin-top:14px"><button class="small-btn primary" type="button" id="showSchedBtn"' + (steps.length ? "" : " disabled") + '>Show this schedule</button>' +
        '<button class="small-btn" type="button" id="todaySchedBtn">Show today\'s schedule</button>' +
        '<button class="small-btn" type="button" id="printSchedBtn"' + (steps.length ? "" : " disabled") + '>Print as cards</button>' +
        '<button class="small-btn" type="button" id="clearSchedBtn"' + (steps.length ? "" : " disabled") + '>Clear all steps</button>' +
        (list.length > 1 ? '<button class="small-btn danger" type="button" id="delSchedBtn">Delete this schedule</button>' : "") + "</div>";
    var save = function () { try { CM.lib.save(); } catch (e) { $("toolsMsg").textContent = e.message; } renderSchedEditor(); };
    box.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { CM.lib.setActive(b.dataset.s); renderSchedEditor(); }; });
    if ($("schedNew")) $("schedNew").onclick = function () { CM.lib.addSchedule("Schedule " + (list.length + 1)); renderSchedEditor(); $("schedName").focus(); $("schedName").select(); };
    $("schedRename").onclick = function () { var v = $("schedName").value.trim(); if (v) { sc.name = v.slice(0, 30); save(); } };
    box.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { var d = +b.dataset.d, i = sc.days.indexOf(d); if (i >= 0) sc.days.splice(i, 1); else sc.days.push(d); save(); }; });
    box.querySelectorAll("[data-min]").forEach(function (sel) { sel.onchange = function () { steps[+sel.dataset.min].min = +sel.value; CM.lib.save(); }; });
    box.querySelectorAll("[data-how]").forEach(function (sel) { sel.onchange = function () { var st = steps[+sel.dataset.how]; if (sel.value) st.howto = sel.value; else delete st.howto; CM.lib.save(); }; });
    box.querySelectorAll("[data-mv]").forEach(function (b) { b.onclick = function () {
      var k = +b.dataset.k, j = k + +b.dataset.mv; if (j < 0 || j >= steps.length) return;
      var x = steps[k]; steps[k] = steps[j]; steps[j] = x; save();
      var again = $("schedList").querySelectorAll("li")[j]; if (again) { var f = again.querySelector('[data-mv="' + b.dataset.mv + '"]:not([disabled])') || again.querySelector("button"); if (f) f.focus(); }
    }; });
    box.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { steps.splice(+b.dataset.rm, 1); save(); }; });
    box.querySelectorAll("#schedAdd .chip").forEach(function (c) { c.onclick = function () { if (steps.length >= max) return; steps.push({ r: "a:" + c.dataset.i }); save(); }; });
    $("schedMore").onclick = function () { CM.ui.pickRef($("schedPickBox"), function (r) { if (steps.length < max) steps.push({ r: r }); save(); }, { start: "sym", group: "daily" }); };
    $("showSchedBtn").onclick = function () { if (!steps.length) return; showChild(function () { CM.tools.schedule(sc); }); };
    $("todaySchedBtn").onclick = function () { var ts = CM.lib.todaySchedule(); if (!ts.steps.length) { $("toolsMsg").textContent = "That schedule has no steps yet."; return; } showChild(function () { CM.tools.schedule(ts); }); };
    $("printSchedBtn").onclick = function () {
      CM.ui.print('<div class="pr-grid four">' + steps.map(function (st, k) { var x = CM.ref(st.r); return '<div class="pr-card"><span class="pr-n">' + (k + 1) + '</span><div class="pr-pic">' + x.html + "</div><b>" + esc(x.name) + "</b></div>"; }).join("") + "</div>", sc.name);
    };
    $("clearSchedBtn").onclick = function () { steps.length = 0; save(); };
    if ($("delSchedBtn")) CM.ui.twoTap($("delSchedBtn"), "Delete this schedule", "Tap again to delete", function () { CM.lib.removeSchedule(sc.id); renderSchedEditor(); });
    if (CM.voice) CM.voice.bind(box);
  }

  /* ---------- pictures tab: My pictures ---------- */
  function renderPictures() {
    var box = $("picBox"), items = CM.lib.items();
    box.innerHTML = '<div><h3>My pictures</h3><p class="note">Your own pictures with a word or two: your child\'s school, their teacher, the swimming pool, a favourite snack. Use them in schedules, the Talk board and stories. Photos are shrunk and kept on this device only.</p>' +
      '<ul class="mp-list">' + (items.length ? items.map(function (it) {
        return '<li class="mp"><span class="mp-pic">' + CM.ref("i:" + it.id).html + '</span><div class="mp-body"><label class="field">Words<input type="text" maxlength="40" data-en="' + esc(it.id) + '" value="' + esc(it.en) + '"></label>' +
          '<label class="field">In Irish (optional)<input type="text" maxlength="40" data-ga="' + esc(it.id) + '" value="' + esc(it.ga || "") + '"></label>' +
          '<div class="row start"><label class="small-btn pbtn">' + (it.img ? "Change photo" : "Add photo") + '<input type="file" accept="image/*" data-ph="' + esc(it.id) + '" class="visually-hidden"></label>' +
          '<button type="button" class="small-btn" data-sym="' + esc(it.id) + '">Use a symbol</button>' + (CM.voice ? CM.voice.button(CM.voice.refKey("i:" + it.id)) : "") +
          '<button type="button" class="small-btn danger" data-del="' + esc(it.id) + '">Delete</button></div><div id="mpPick' + esc(it.id) + '"></div></div></li>';
      }).join("") : '<li class="note">None yet.</li>') + "</ul>" +
      '<h3 style="margin-top:14px">Add a picture</h3><div class="inline-field"><input type="text" id="mpNew" maxlength="40" placeholder="Words, for example Swimming pool" aria-label="Words for the new picture"><button class="small-btn primary" type="button" id="mpAdd">Add</button></div>' +
      '<p class="note">Then add a photo or choose a symbol for it. Please don\'t use photos that show a child\'s full name or school uniform crest.</p><p class="note" id="mpMsg" aria-live="polite"></p></div>' +
      '<div><h3>Recorded voices</h3><p class="note">' + (CM.voice && CM.voice.canRecord ? "Use the 🎙 Record buttons next to schedule steps, talk words, story pages and your pictures to record a word in your own voice (up to 8 seconds). It then plays instead of the device\'s voice, in the language the games are set to. Recordings stay on this device. The microphone is only on while you record." : "This browser can't record sound, so recorded voices aren't available here.") + "</p></div>" +
      '<div><h3>Space used on this device</h3><p class="note" id="mpSpace">Checking…</p></div>';
    $("mpAdd").onclick = function () { var v = $("mpNew").value.trim(); if (!v) { $("mpMsg").textContent = "Type the words first."; return; } try { CM.lib.addItem({ en: v, emoji: "🖼️" }); } catch (e) { $("mpMsg").textContent = e.message; return; } renderPictures(); };
    box.querySelectorAll("[data-en]").forEach(function (inp) { inp.onchange = function () { CM.lib.updateItem(inp.dataset.en, { en: inp.value.trim().slice(0, 40) }); }; });
    box.querySelectorAll("[data-ga]").forEach(function (inp) { inp.onchange = function () { CM.lib.updateItem(inp.dataset.ga, { ga: inp.value.trim().slice(0, 40) }); }; });
    box.querySelectorAll("[data-ph]").forEach(function (inp) { inp.onchange = function () {
      var id = inp.dataset.ph, f = inp.files && inp.files[0]; if (!f) return;
      $("mpMsg").textContent = "Saving…";
      CM.shrinkImage(f, 320).then(function (d) { var key = "item/" + id; return CM.media.put(key, d).then(function () { CM.lib.updateItem(id, { img: key, sym: null }); CM.media.keep(); renderPictures(); $("mpMsg").textContent = "Saved."; }); })
        .catch(function (e) { $("mpMsg").textContent = e.message; });
    }; });
    box.querySelectorAll("[data-sym]").forEach(function (b) { b.onclick = function () { var id = b.dataset.sym; CM.ui.pickRef($("mpPick" + id), function (r) {
      var m = r.match(/^s:(.+)$/); if (!m) { var x = CM.ref(r), e = (x.html.match(/class="emo"[^>]*>([^<]+)</) || [])[1]; if (e) CM.lib.updateItem(id, { emoji: e, sym: null }); }
      else CM.lib.updateItem(id, { sym: m[1] });
      var it = CM.lib.data().items[id]; if (it.img) { CM.media.del(it.img); CM.lib.updateItem(id, { img: null }); }
      renderPictures();
    }, { start: "sym" }); }; });
    box.querySelectorAll("[data-del]").forEach(function (b) { CM.ui.twoTap(b, "Delete", "Tap again to delete", function () { CM.lib.removeItem(b.dataset.del); renderPictures(); }); });
    if (CM.voice) CM.voice.bind(box);
    CM.media.usage().then(function (u) {
      var mb = function (n) { return (n / 1048576).toFixed(1) + " MB"; };
      $("mpSpace").textContent = "Pictures, recordings and videos: " + mb(u.used) + "." + (u.quota ? " The browser allows this site about " + mb(u.quota) + "." : "") + (CM.media.saved() ? "" : " This browser isn't keeping files between visits (often a private window), so photos and recordings will be lost when it closes.");
    });
  }

  /* ---------- backup file (Children tab) ---------- */
  function bindBackup() {
    var name = function (who) { var d = new Date(); return "calm-match-" + who + "-" + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + ".json"; };
    $("bkAll").onclick = function () { $("bkMsg").textContent = "Making the file…"; CM.backup.make().then(function (b) { CM.backup.download(b, name("backup")); $("bkMsg").textContent = "Saved. Keep it somewhere private."; }); };
    $("bkOne").onclick = function () { $("bkMsg").textContent = "Making the file…"; CM.backup.make(CM.store.activeId()).then(function (b) { CM.backup.download(b, name(P().name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "child")); $("bkMsg").textContent = "Saved. Open it on the other device with \"Open a backup file\"."; }); };
    $("bkFile").onchange = function () {
      var f = $("bkFile").files && $("bkFile").files[0]; $("bkFile").value = "";
      if (!f) return;
      if (session) { $("bkMsg").textContent = "Finish or leave the current session first."; return; }
      CM.backup.read(f).then(function (o) {
        $("bkChoice").innerHTML = '<p class="note">This file has: <b>' + esc(CM.backup.summary(o)) + "</b> (saved " + esc(new Date(o.saved).toLocaleDateString()) + ").</p>" +
          '<div class="row start"><button class="small-btn primary" type="button" id="bkAdd">Add these children</button><button class="small-btn danger" type="button" id="bkReplace">Replace everything on this device</button><button class="small-btn" type="button" id="bkCancel">Cancel</button></div>';
        var apply = function (mode) { $("bkMsg").textContent = "Opening…"; CM.backup.apply(o, mode).then(function (n) { $("bkMsg").textContent = "Done: " + n + " child" + (n === 1 ? "" : "ren") + ". Reloading…"; setTimeout(function () { location.reload(); }, 600); }, function (e) { $("bkMsg").textContent = e.message; }); };
        $("bkAdd").onclick = function () { apply("add"); };
        CM.ui.twoTap($("bkReplace"), "Replace everything on this device", "Tap again: this deletes what is here now", function () { apply("replace"); });
        $("bkCancel").onclick = function () { $("bkChoice").innerHTML = ""; $("bkMsg").textContent = ""; };
      }, function (e) { $("bkMsg").textContent = e.message; });
    };
  }

  /* ---------- account tab ---------- */
  function renderAccount() {
    var box = $("acctBox");
    if (!CM.cloud || !CM.cloud.enabled) {
      box.innerHTML = '<p class="note">Accounts aren\'t switched on for this site, so everything stays on this device. That works fine on its own.</p>';
      return;
    }
    var u = CM.cloud.user(), st = CM.cloud.status(), a = CM.cloud.account();
    var label = { "signed-out": "Not signed in", syncing: "Syncing…", synced: "Synced" + (st.at ? " at " + st.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""), error: "Sync problem: " + (st.error || ""), off: "Off" }[st.state] || st.state;
    box.innerHTML = u
      ? '<div class="statusline"><span class="dotstat ' + (st.state === "synced" ? "on" : "") + '"></span><span>Signed in as <b>' + esc(u.email) + "</b>. " + esc(label) + "</span></div>" +
        '<p class="note">Synced for each child: avatar and settings' + (a && a.sync_progress ? ", plus skill progress" : "") + ". Nicknames and photos stay on this device. The example child is never synced.</p>" +
        '<div class="row start"><button class="small-btn" type="button" id="syncNow">Sync now</button><a class="small-btn" href="account.html">Account settings</a></div>'
      : '<div class="statusline"><span class="dotstat"></span><span>Not signed in. Everything stays on this device.</span></div>' +
        '<p class="note">An account lets you keep each child\'s settings on more than one device. It is optional.</p>' +
        '<div class="row start"><a class="small-btn primary" href="account.html">Sign in or create an account</a></div>';
    var sn = $("syncNow"); if (sn) sn.onclick = function () { CM.cloud.syncAll(true).then(renderAccount); renderAccount(); };
  }

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (!$("panel").hidden || !$("gate").hidden || CM.talk.isOpen() || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var n = parseInt(e.key, 10); if (!n) return;
    var b = stage.querySelector('.opt[data-i="' + (n - 1) + '"]'); if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });

  /* ================= boot ================= */
  document.addEventListener("DOMContentLoaded", function () {
    stage = $("stage");
    CM.tools.init({
      stage: stage, say: say, tones: function (f, g, v) { tones(f, g, v); },
      enter: function () { clearTimers(); session = null; $("sched").hidden = true; $("progress").hidden = true; $("breakBtn").hidden = true; },
      exit: function () { startScreen(); }
    });
    var H = CM.tools.helpers(); CM.rewards.init(H); CM.stories.init(H); CM.talk.init(H);
    applySenses(); setupGate(); gateLabel(); bindChildStatic(); bindHistoryStatic(); bindToolsStatic(); bindBackup();
    $("breakBtn").onclick = takeBreak;
    $("talkBtn").onclick = function () { if (CM.talk.isOpen()) CM.talk.close(); else CM.talk.open(); };
    $("closePanel").onclick = closePanel;
    document.querySelectorAll(".tab").forEach(function (x) { x.onclick = function () { tab = x.dataset.tab; renderPanel(); }; });
    stage.innerHTML = "";
    CM.media.ready.then(function () { if (!session && !CM.tools.active()) startScreen(); });
    if (CM.cloud && CM.cloud.enabled) {
      CM.cloud.onChange(function (ev) {
        if (!$("panel").hidden && tab === "account") renderAccount();
        if (ev.type === "synced" && !session && !CM.tools.active()) { applySenses(); renderWho(); if ($("panel").hidden) startScreen(); }
      });
      CM.cloud.init();
    }
  });
})();
