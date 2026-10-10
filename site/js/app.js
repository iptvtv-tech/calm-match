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
  function startScreen() {
    clearTimers(); CM.tools.stop(); session = null; blk = null; cur = null;
    $("progress").hidden = true; $("breakBtn").hidden = true;
    var plan = CM.planSession().plan; renderSched(); renderWho();
    stage.innerHTML =
      '<p class="label">' + esc(t("today", { name: P().name })) + "</p>" +
      '<h1 class="say">' + esc(t("gamesThenDone", { n: plan.length })) + "</h1>" +
      '<p class="sub">' + esc(plan.map(CM.gameName).join(", " + t("then") + " ")) + ". " + esc(t("tapBreak")) + "</p>" +
      '<button class="big-btn" id="startBtn" type="button">' + esc(t("start")) + "</button>";
    $("startBtn").onclick = startSession;
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
  function nextTurn() {
    pendingAdvance = null;
    if (blk.t >= blk.turns) return finishBlock();
    var g = blk.game;
    cur = g === "match" ? genMatch() : g === "sort" ? genSort() : g === "seq" ? genSeq() : g === "count" ? genCount() : g === "feel" ? genFeel() : genPairs();
    cur.first = true; cur.misses = 0; cur.hint = false; cur.lowered = false;
    cur.prompt = cur.kind === "pairs" || !S().errorless ? 0 : P().skills[blk.skill.id].prompt || 0;
    if (cur.kind === "pairs" && cur.peek > 0) startPeek();
    show(renderTurn);
    say(cur.speak);
  }
  function renderTurn() {
    if (cur.kind === "pairs") return renderPairs();
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
    } else {
      var me = S().theme === "colours" ? "vehicles" : S().theme;
      var keys = [me].concat(shuffle(Object.keys(CM.THEMES).filter(function (k) { return k !== me && k !== "colours"; }))).slice(0, nb);
      baskets = keys.map(function (k) { return { key: k, icon: pic(CM.THEMES[k].items[0], k), group: k, got: [] }; });
      for (i = 0; i < T; i++) { var kk = keys[i % nb], it = pick1(CM.THEMES[kk].items.slice(1)); queue.push({ item: it, key: kk, html: pic(it, kk) }); }
    }
    blk.baskets = baskets; blk.queue = shuffle(queue);
  }
  function basketName(b) { return b.nameKey ? t(b.nameKey) : b.group ? CM.groupName(b.group) : CM.cap(CM.nm(b.item)); }
  function genSort() {
    var q = blk.queue[blk.t], mode = blk.skill.mode, nm = CM.nm(q.item);
    return {
      title: mode === "size" ? t("bigOrSmall") : mode === "kind" ? t("whichGroup") : t("putSame"),
      show: '<p class="label">' + esc(t("whereGo")) + '</p><div class="target" role="img" aria-label="' + esc(nm) + '"><span class="' + (q.size ? "sz-" + q.size : "") + '">' + q.html + "</span></div>",
      opts: blk.baskets.map(function (b) {
        return { cls: "basket", label: basketName(b), correct: b.key === q.key, basket: b,
          html: '<span class="bicon" aria-hidden="true">' + b.icon + '</span><span class="bname">' + esc(basketName(b)) + '</span><span class="bgot" aria-hidden="true">' + b.got.join("") + "</span>" };
      }),
      speak: mode === "size" ? t("sayBigSmall", { name: nm }) : mode === "kind" ? t("sayGroup", { name: nm }) : t("saySortPic", { name: nm }),
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
    var mode = blk.skill.mode, n = CM.LV.feel[blk.lvl], F = CM.FEELINGS;
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
    if (sticker) { session.stickers.push(sticker); P().stickers = P().stickers.concat([sticker]).slice(-80); }
    session.lastSticker = sticker; session.lastGame = blk.game;
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
    $("contBtn").onclick = function () { nextG ? show(blockIntro) : show(sessionEnd); };
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
    stage.innerHTML = '<p class="label">' + esc(t("breakLabel")) + '</p><div class="breath" aria-hidden="true"></div><h1 class="say">' + esc(t("breathe")) + "</h1>" +
      '<p class="sub">' + esc(t("takeTime")) + '</p><button class="big-btn" id="readyBtn" type="button">' + esc(t("ready")) + "</button>";
    $("readyBtn").onclick = function () {
      $("breakBtn").hidden = false; var f = resumeFn; resumeFn = null;
      if (f === nextTurn) return nextTurn();
      if (f === renderTurn) {
        if (cur && cur.kind === "pairs") { cur.open = []; cur.busy = false; cur.peeking = false; }
        show(renderTurn); return say(cur.speak);
      }
      show(f);
    };
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
  function openPanel() { $("gate").hidden = true; $("panel").hidden = false; $("grownBtn").hidden = true; renderPanel(); $("closePanel").focus(); }
  function closePanel() {
    $("panel").hidden = true; $("grownBtn").hidden = false; applySenses();
    if (CM.tools.active()) return;
    if (!session) startScreen(); else { renderSched(); renderWho(); }
  }
  function renderPanel() {
    document.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", x.dataset.tab === tab); });
    document.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== tab; });
    ({ child: renderChild, settings: renderSettings, skills: renderProgress, history: renderHistory, engine: renderLog, account: renderAccount, tools: renderTools }[tab] || renderProgress)();
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
    twoTap($("resetBtn"), "reset", "Tap again to reset", "Reset this child's progress", function () {
      var p = P(); p.skills = CM.store.freshSkills(); p.history = []; p.stickers = []; CM.store.save(); log("Progress reset", p.name); renderChild();
    });
    twoTap($("deleteBtn"), "del", "Tap again to remove " + P().name, "Remove this child", function () {
      if (session || CM.store.list().length < 2) return;
      var gone = CM.store.remove(CM.store.activeId());
      if (CM.cloud && CM.cloud.user()) CM.cloud.deleteRemoteChild(gone).catch(function () {});
      applySenses(); renderWho(); renderChild();
    });
    twoTap($("wipeBtn"), "wipe", "Tap again to delete everything", "Delete everything on this device", function () {
      CM.store.wipeDevice(); CM.photos.removeAll(); location.reload();
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
    chipGroup($("rateChips"), [[0.7, "Voice: slow"], [0.85, "Voice: gentle"], [1, "Voice: normal"]], s.rate, function (v) { s.rate = +v; say("This is how I will sound"); });
    chipGroup($("blockChips"), [[2, "2"], [3, "3"], [4, "4"]], s.blocks, function (v) { s.blocks = +v; });
    chipGroup($("turnChips"), [[3, "3"], [4, "4"], [6, "6"]], s.turns, function (v) { s.turns = +v; });
    chipGroup($("modeChips"), [["engine", "Engine picks"], ["fixed", "Same order every time"]], s.mode, function (v) { s.mode = v; });
    chipGroup($("stickerChips"), [["theme", CM.theme().items[0][0] + " Theme pictures"], ["stars", "⭐ Stars"], ["hearts", "💚 Hearts"], ["shapes", "🔷 Shapes"], ["none", "No stickers"]], s.stickerSet, function (v) { s.stickerSet = v; });
    chipGroup($("celebrateChips"), [["cheerful", "Cheerful"], ["gentle", "Gentle"], ["calm", "Very calm"]], s.celebrate, function (v) { s.celebrate = v; chime(); });
    var app = CM.store.db().app;
    chipGroup($("gateChips"), [["hold", "Press and hold"], ["sum", "Answer a sum"]], app.gate, function (v) { app.gate = v; CM.store.persist(); gateLabel(); });
    ["sound", "speech", "calm", "contrast", "big", "keys", "adaptive", "errorless", "photos"].forEach(function (k) {
      var c = $("s-" + k); c.checked = !!s[k];
      c.onchange = function () {
        s[k] = c.checked; CM.store.save(); applySenses();
        if (k === "speech" && c.checked) say("Read aloud is on");
        if (k === "errorless") log("Errorless start", c.checked ? "on: new skills begin with the answer highlighted" : "off");
        if (k === "photos") renderPhotos();
      };
    });
    CM.GAME_ORDER.forEach(function (g) {
      var c = $("g-" + g); c.checked = !!s.games[g];
      c.onchange = function () { s.games[g] = c.checked; if (!CM.GAME_ORDER.some(function (x) { return s.games[x]; })) { s.games[g] = true; c.checked = true; } CM.store.save(); };
    });
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
    var tm = CM.store.db().app.timerMin || 5;
    chipGroup($("timerChips"), [[1, "1 min"], [2, "2 min"], [3, "3 min"], [5, "5 min"], [10, "10 min"], [15, "15 min"], [20, "20 min"]], tm, function (v) { CM.store.db().app.timerMin = +v; CM.store.persist(); }, renderTools);
    $("toolsMsg").textContent = session ? "A game session is running. Finish it, or the board and timer will replace it." : "";
  }
  function bindToolsStatic() {
    $("showBoardBtn").onclick = function () { session = null; $("panel").hidden = true; $("grownBtn").hidden = false; CM.tools.board(S().board); };
    $("startTimerBtn").onclick = function () { session = null; $("panel").hidden = true; $("grownBtn").hidden = false; CM.tools.timer(CM.store.db().app.timerMin || 5); };
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
    if (!$("panel").hidden || !$("gate").hidden || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var n = parseInt(e.key, 10); if (!n) return;
    var b = stage.querySelector('.opt[data-i="' + (n - 1) + '"]'); if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });

  /* ================= boot ================= */
  document.addEventListener("DOMContentLoaded", function () {
    stage = $("stage");
    CM.tools.init({
      stage: stage, say: say, tones: function (f, g) { tones(f, g); },
      enter: function () { clearTimers(); session = null; $("sched").hidden = true; $("progress").hidden = true; $("breakBtn").hidden = true; },
      exit: function () { startScreen(); }
    });
    applySenses(); setupGate(); gateLabel(); bindChildStatic(); bindHistoryStatic(); bindToolsStatic();
    $("breakBtn").onclick = takeBreak;
    $("closePanel").onclick = closePanel;
    document.querySelectorAll(".tab").forEach(function (x) { x.onclick = function () { tab = x.dataset.tab; renderPanel(); }; });
    startScreen();
    if (CM.cloud && CM.cloud.enabled) {
      CM.cloud.onChange(function (ev) {
        if (!$("panel").hidden && tab === "account") renderAccount();
        if (ev.type === "synced" && !session && !CM.tools.active()) { applySenses(); renderWho(); if ($("panel").hidden) startScreen(); }
      });
      CM.cloud.init();
    }
  });
})();
