/* The play page: games, visual schedule, breaks, and the grown-ups area. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var $ = function (id) { return document.getElementById(id); };
  var P = function () { return CM.store.P(); }, S = function () { return CM.store.S(); };
  var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var pick1 = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var theme = function () { return CM.theme(); };
  var stage;

  /* ================= senses ================= */
  function applySenses() {
    var s = S(), b = document.body.dataset;
    b.calm = s.calm ? "on" : "off"; b.contrast = s.contrast ? "high" : "normal"; b.big = s.big ? "on" : "off"; b.keys = s.keys ? "on" : "off";
  }
  var actx = null;
  function tones(freqs, gap) {
    if (!S().sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (gap || 0.16);
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.65);
      });
    } catch (e) {}
  }
  var chime = function () { tones([523.25, 659.25]); };
  var fanfare = function () { tones([523.25, 659.25, 783.99], 0.2); };
  function say(text) {
    if (!S().speech || !("speechSynthesis" in window)) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.rate = S().rate; u.lang = "en-IE"; speechSynthesis.speak(u); } catch (e) {}
  }
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} }

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
  var session = null, blk = null, cur = null, locked = false, pendingAdvance = null, screenFn = null, lastTarget = null, lastCount = 0, pairsTimer = null;
  function clearTimers() { clearTimeout(pendingAdvance); clearTimeout(pairsTimer); pendingAdvance = null; pairsTimer = null; }

  function renderSched() {
    var plan = session ? session.plan : CM.planSession().plan;
    var html = plan.map(function (g, i) {
      var st = !session ? "later" : i < session.i ? "done" : i === session.i ? "now" : "later";
      return (i ? '<span class="then" aria-hidden="true">then</span>' : "") +
        '<span class="step ' + st + '"' + (st === "now" ? ' aria-current="step"' : "") + '><span class="ic" aria-hidden="true">' + CM.gameIcon(g) + "</span>" + CM.GAMES[g].label +
        (st === "done" ? ' <span class="tick" aria-label="done">✓</span>' : "") + "</span>";
    }).join("");
    var endNow = session && session.i >= plan.length;
    $("sched").innerHTML = html + '<span class="then" aria-hidden="true">then</span><span class="step ' + (endNow ? "now" : "later") + '"><span class="ic" aria-hidden="true">🏁</span>All done</span>';
  }
  function renderWho() { var p = P(); $("who").innerHTML = '<b aria-hidden="true">' + p.avatar + "</b>" + esc(p.name); }
  function show(fn) { screenFn = fn; fn(); }

  /* ---------- screens ---------- */
  function startScreen() {
    clearTimers(); session = null; blk = null; cur = null;
    $("progress").hidden = true; $("breakBtn").hidden = true;
    var plan = CM.planSession().plan; renderSched(); renderWho();
    stage.innerHTML =
      '<p class="label">Today, ' + esc(P().name) + "</p>" +
      '<h1 class="say">' + plan.length + " games, then all done</h1>" +
      '<p class="sub">' + plan.map(function (g) { return CM.GAMES[g].label; }).join(", then ") + ". You can tap Break any time.</p>" +
      '<button class="big-btn" id="startBtn" type="button">Start</button>';
    $("startBtn").onclick = startSession;
  }
  function startSession() {
    var r = CM.planSession();
    session = { plan: r.plan, i: 0, start: Date.now(), breaks: 0, stickers: [], blocks: [], unlocks: [] };
    log("Session start", P().name + ", theme " + theme().label);
    r.reasons.forEach(function (x, i) { log("Plan step " + (i + 1), x); });
    $("breakBtn").hidden = false;
    show(blockIntro);
    say("Today: " + r.plan.map(function (g) { return CM.GAMES[g].label; }).join(", then ") + ". Then all done.");
  }
  function blockIntro() {
    var g = session.plan[session.i];
    renderSched(); $("progress").hidden = true;
    stage.innerHTML =
      '<p class="label">Now</p><div class="bigicon" aria-hidden="true">' + CM.gameIcon(g) + "</div>" +
      '<h1 class="say">' + CM.GAMES[g].label + "</h1>" +
      '<p class="sub">' + CM.GAMES[g].does + "</p>" +
      '<button class="big-btn" id="goBtn" type="button">Go</button>';
    $("goBtn").onclick = startBlock;
    say("Now: " + CM.GAMES[g].label + ". " + CM.GAMES[g].does);
  }
  function startBlock() {
    var g = session.plan[session.i];
    var pick = CM.pickSkill(g, true), skill = pick[0];
    log(CM.GAMES[g].label + " starts", pick[1]);
    var st = P().skills[skill.id];
    var turns = g === "pairs" ? Math.max(2, Math.ceil(S().turns / 2)) : S().turns;
    blk = { game: g, skill: skill, t: 0, turns: turns, lvl: Math.min(st.lvl, CM.LV[g].length - 1), okRun: 0, firstTry: 0, hints: 0,
      lockedBefore: CM.SKILLS.filter(function (s) { return !CM.unlocked(s); }).map(function (s) { return s.id; }) };
    if (g === "sort") setupSort();
    log("Difficulty", CM.lvDesc(g, blk.lvl, skill));
    nextTurn();
  }
  function nextTurn() {
    pendingAdvance = null;
    if (blk.t >= blk.turns) return finishBlock();
    var g = blk.game;
    cur = g === "match" ? genMatch() : g === "sort" ? genSort() : g === "seq" ? genSeq() : g === "count" ? genCount() : genPairs();
    cur.first = true; cur.misses = 0; cur.hint = false; cur.lowered = false;
    if (cur.kind === "pairs" && cur.peek > 0) startPeek();
    show(renderTurn);
    say(cur.speak);
  }
  function renderTurn() {
    if (cur.kind === "pairs") return renderPairs();
    locked = false; renderSched();
    stage.innerHTML =
      '<h1 class="say">' + cur.title + "</h1><div>" + cur.show + "</div>" +
      '<div class="options" role="group" aria-label="Choose an answer">' +
      cur.opts.map(function (o, i) {
        return '<button type="button" class="opt ' + (o.cls || "") + (cur.hint && o.correct ? " hint" : "") + '" data-i="' + i + '" aria-label="' + esc(o.label) + '"><span class="kn" aria-hidden="true">' + (i + 1) + "</span>" + o.html + "</button>";
      }).join("") + "</div>" +
      '<p class="feedback" id="fb">' + (cur.hint ? "Look for the dashed outline." : "") + "</p>" + againBtn();
    stage.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { choose(+b.dataset.i, b); }; });
    bindAgain(); renderDots();
  }
  function againBtn() { return S().speech ? '<button class="again" id="againBtn" type="button">Say it again</button>' : ""; }
  function bindAgain() { var a = $("againBtn"); if (a) a.onclick = function () { say(cur.speak); }; }
  function renderDots() {
    $("progress").hidden = false;
    var d = ""; for (var i = 0; i < blk.turns; i++) d += '<span class="dot ' + (i < blk.t ? "done" : "") + '"></span>';
    $("dots").innerHTML = d;
    var left = blk.turns - blk.t, nextG = session.plan[session.i + 1], then = nextG ? CM.GAMES[nextG].label : "all done";
    $("next").textContent = left <= 0 ? "Finished. Next: " + then + "." : left === 1 ? "This is the last one. Then " + then + "." : left + " more, then " + then + ".";
  }

  /* ---------- game: match ---------- */
  function freshTarget(items) { var t; do { t = pick1(items); } while (lastTarget && items.length > 1 && t[0] === lastTarget); lastTarget = t[0]; return t; }
  function genMatch() {
    var items = theme().items, n = CM.LV.match[blk.lvl], t = freshTarget(items);
    var others = shuffle(items.filter(function (i) { return i[0] !== t[0]; })).slice(0, n - 1);
    return {
      title: "Find the same one",
      show: '<p class="label">Find this</p><div class="target" role="img" aria-label="' + esc(t[1]) + '">' + t[0] + "</div>",
      opts: shuffle([t].concat(others)).map(function (o) { return { html: o[0], label: o[1], correct: o[0] === t[0] }; }),
      speak: "Find the " + t[1], praise: "Yes! The " + t[1] + "."
    };
  }

  /* ---------- game: sort ---------- */
  function setupSort() {
    var mode = blk.skill.mode, items = theme().items, T = blk.turns, nb = mode === "size" ? 2 : CM.LV.sort[blk.lvl], baskets = [], queue = [], i;
    if (mode === "picture") {
      var picks = shuffle(items.slice()).slice(0, nb);
      baskets = picks.map(function (p) { return { key: p[0], icon: p[0], name: p[1], got: [] }; });
      for (i = 0; i < T; i++) { var p = picks[i % nb]; queue.push({ emoji: p[0], name: p[1], key: p[0] }); }
    } else if (mode === "size") {
      var e = pick1(items);
      baskets = [{ key: "big", icon: '<span class="sz-big">' + e[0] + "</span>", name: "Big", got: [] }, { key: "small", icon: '<span class="sz-small">' + e[0] + "</span>", name: "Small", got: [] }];
      for (i = 0; i < T; i++) { var k = i % 2 ? "small" : "big"; queue.push({ emoji: e[0], name: k + " " + e[1], base: e[1], key: k, size: k }); }
    } else {
      var me = S().theme === "colours" ? "vehicles" : S().theme;
      var keys = [me].concat(shuffle(Object.keys(CM.THEMES).filter(function (k) { return k !== me && k !== "colours"; }))).slice(0, nb);
      baskets = keys.map(function (k) { return { key: k, icon: CM.THEMES[k].items[0][0], name: CM.THEMES[k].label, got: [] }; });
      for (i = 0; i < T; i++) { var kk = keys[i % nb], it = pick1(CM.THEMES[kk].items.slice(1)); queue.push({ emoji: it[0], name: it[1], key: kk }); }
    }
    blk.baskets = baskets; blk.queue = shuffle(queue);
  }
  function genSort() {
    var item = blk.queue[blk.t], mode = blk.skill.mode;
    return {
      title: mode === "size" ? "Big or small?" : mode === "kind" ? "Which group?" : "Put it with the same one",
      show: '<p class="label">Where does it go?</p><div class="target" role="img" aria-label="' + esc(item.name) + '"><span class="' + (item.size ? "sz-" + item.size : "") + '">' + item.emoji + "</span></div>",
      opts: blk.baskets.map(function (b) {
        return { cls: "basket", label: b.name + " basket", correct: b.key === item.key, basket: b,
          html: '<span class="bicon" aria-hidden="true">' + b.icon + '</span><span class="bname">' + esc(b.name) + '</span><span class="bgot" aria-hidden="true">' + b.got.join("") + "</span>" };
      }),
      speak: mode === "size" ? "Is this " + item.base + " big or small?" : mode === "kind" ? "Which group does the " + item.name + " go in?" : "Put the " + item.name + " with the same picture",
      praise: mode === "size" ? "Yes! A " + item.name + "." : "Yes! The " + item.name + " goes there.",
      onRight: function (o) { o.basket.got.push(item.emoji); }
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
      title: "What comes next?",
      show: '<div class="seqrow" role="img" aria-label="' + esc(row.map(function (r) { return r[1]; }).join(", ")) + ', then what?">' + row.map(function (r) { return "<span>" + r[0] + "</span>"; }).join("") + '<span class="slot" id="slot">?</span></div>',
      opts: opts.map(function (o) { return { html: o[0], label: o[1], correct: o[0] === ans[0] }; }),
      speak: row.map(function (r) { return r[1]; }).join(", ") + ". What comes next?", praise: "Yes! The " + ans[1] + " comes next.",
      onRight: function () { var s = $("slot"); if (s) { s.textContent = ans[0]; s.classList.add("filled"); } }
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
    for (var i = 0; i < n; i++) cells += "<span>" + e[0] + "</span>";
    return {
      title: "How many?",
      show: '<div class="countbox c' + cols + '" role="img" aria-label="Some ' + esc(e[1]) + ' pictures">' + cells + "</div>",
      opts: opts.map(function (v) { return { html: String(v), label: String(v), correct: v === n, cls: "num" }; }),
      speak: "Count the " + e[1] + " pictures. How many?", praise: "Yes! " + n + "."
    };
  }

  /* ---------- game: pairs ---------- */
  function genPairs() {
    var n = blk.skill.n, picks = shuffle(theme().items.slice()).slice(0, n);
    var cards = shuffle(picks.concat(picks).map(function (p) { return { e: p[0], name: p[1], found: false }; }));
    return { kind: "pairs", n: n, cards: cards, open: [], mism: 0, busy: false, peek: CM.LV.pairs[blk.lvl], peeking: false,
      title: "Find the pairs", speak: "Find the pairs. Tap a card, then another card." };
  }
  function startPeek() {
    cur.peeking = true;
    pairsTimer = setTimeout(function () { cur.peeking = false; renderPairsGrid(); var s = $("pairsSub"); if (s) s.textContent = "Tap a card, then tap another."; }, cur.peek * 1000);
  }
  function renderPairs() {
    locked = false; renderSched();
    var cols = cur.n === 2 ? 2 : cur.n === 3 ? 3 : 4;
    stage.innerHTML = '<h1 class="say">' + cur.title + "</h1>" +
      '<p class="sub" id="pairsSub">' + (cur.peeking ? "Look carefully. The cards will turn over." : "Tap a card, then tap another.") + "</p>" +
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
      return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (dis ? " disabled" : "") + ' aria-label="' + (showFace ? esc(c.name) : "Card " + (i + 1) + ", face down") + '"><span class="kn" aria-hidden="true">' + (i + 1) + "</span>" + (showFace ? c.e : "?") + "</button>";
    }).join("");
    g.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { tapCard(+b.dataset.i); }; });
  }
  function tapCard(i) {
    if (cur.busy || cur.peeking || locked) return;
    var c = cur.cards[i]; if (c.found || cur.open.indexOf(i) >= 0) return;
    var fb = $("fb");
    cur.open.push(i);
    if (cur.open.length === 1) { renderPairsGrid(); fb.className = "feedback"; fb.textContent = ""; say(c.name); return; }
    var A = cur.cards[cur.open[0]], B = cur.cards[cur.open[1]];
    if (A.e === B.e) {
      A.found = B.found = true; cur.open = []; chime();
      fb.className = "feedback ok"; fb.textContent = "A pair! Two " + A.name + " cards."; say("A pair! Two " + A.name + " cards.");
      renderPairsGrid();
      if (cur.cards.every(function (x) { return x.found; })) pairsComplete();
    } else {
      cur.mism++; cur.busy = true; renderPairsGrid();
      fb.className = "feedback"; fb.textContent = "Not the same. They will turn back over."; say("Not the same");
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
    var fb = $("fb"); fb.className = "feedback ok"; fb.textContent = "All pairs found!"; fanfare(); say("All pairs found!");
    blk.t++; renderDots();
    pendingAdvance = setTimeout(nextTurn, S().calm ? 2000 : 1700);
  }

  /* ---------- answering ---------- */
  function choose(i, btn) {
    if (locked || btn.disabled || !cur) return;
    var o = cur.opts[i], fb = $("fb"), nOpts = cur.opts.length, maxL = CM.LV[blk.game].length - 1;
    if (o.correct) {
      locked = true; btn.classList.remove("hint"); btn.classList.add("right");
      if (cur.first) { CM.bkt(blk.skill, true, nOpts); blk.firstTry++; blk.okRun++; } else blk.okRun = 0;
      if (cur.onRight) cur.onRight(o);
      if (o.basket) { var gg = btn.querySelector(".bgot"); if (gg) gg.textContent = o.basket.got.join(""); }
      fb.className = "feedback ok"; fb.textContent = cur.praise; chime(); say(cur.praise);
      if (S().adaptive && blk.okRun >= 3 && blk.lvl < maxL) {
        blk.lvl++; blk.okRun = 0;
        log("3 right first time in a row", blk.game === "sort" ? "more baskets next time Sort is played" : CM.lvDesc(blk.game, blk.lvl) + " from the next turn");
      }
      blk.t++; renderDots();
      pendingAdvance = setTimeout(nextTurn, S().calm ? 1700 : 1400);
    } else {
      btn.disabled = true;
      if (cur.first) { CM.bkt(blk.skill, false, nOpts); cur.first = false; }
      blk.okRun = 0; cur.misses++;
      fb.className = "feedback"; fb.textContent = "Not that one. Look again."; say("Look again");
      if (cur.misses >= 2 && !cur.hint) {
        cur.hint = true; blk.hints++;
        stage.querySelectorAll(".opt").forEach(function (b) { if (cur.opts[+b.dataset.i].correct) b.classList.add("hint"); });
        fb.textContent = "Look for the dashed outline.";
        log("2 misses on one turn", "dashed outline on the right answer");
        if (S().adaptive && blk.lvl > 0 && !cur.lowered) {
          cur.lowered = true; blk.lvl--;
          log("2 misses on one turn", blk.game === "sort" ? "fewer baskets next time Sort is played" : CM.lvDesc(blk.game, blk.lvl) + " from the next turn");
        }
      }
    }
  }

  function finishBlock() {
    var st = P().skills[blk.skill.id], rate = blk.firstTry / blk.turns;
    st.turns += blk.turns; st.lvl = blk.lvl;
    if (rate < 0.5 && S().adaptive) { st.struggle = true; log(blk.skill.name + ": " + CM.pct(rate) + " right first time", "flagged, next time the engine steps back"); }
    else if (rate >= 0.75) st.struggle = false;
    log(CM.GAMES[blk.game].label + " finished", blk.skill.name + " now " + CM.pct(st.p) + " sure");
    var opened = blk.lockedBefore.filter(function (id) { return CM.unlocked(CM.SK[id]); }).map(function (id) { return CM.SK[id]; })
      .filter(function (s) { return S().games[s.game]; });
    opened.forEach(function (s) { log("Unlocked", s.name + " is now open"); });
    session.lastUnlocks = opened;
    session.blocks.push({ skill: blk.skill.id, turns: blk.turns, first: blk.firstTry, hints: blk.hints });
    var sticker = pick1(theme().items)[0];
    session.stickers.push(sticker); P().stickers = P().stickers.concat([sticker]).slice(-80);
    session.lastSticker = sticker; session.lastGame = blk.game;
    CM.store.save();
    session.i++;
    fanfare();
    show(blockDoneScreen);
  }
  function blockDoneScreen() {
    renderSched(); $("progress").hidden = true;
    var nextG = session.plan[session.i], gl = CM.GAMES[session.lastGame].label;
    var unl = (session.lastUnlocks || []).map(function (s) { return '<p class="unlock">Something new is open: ' + esc(s.name) + "</p>"; }).join("");
    stage.innerHTML =
      '<p class="label">' + gl + " finished</p>" +
      '<h1 class="say">You earned a sticker</h1><div class="stickers"><span>' + session.lastSticker + "</span></div>" + unl +
      '<p class="sub">' + (nextG ? "Next: " + CM.GAMES[nextG].label + "." : "That was the last game.") + "</p>" +
      '<button class="big-btn" id="contBtn" type="button">' + (nextG ? "Next" : "Finish") + "</button>";
    say(gl + " finished. You earned a sticker. " + (nextG ? "Next: " + CM.GAMES[nextG].label : "That was the last game."));
    $("contBtn").onclick = function () { nextG ? show(blockIntro) : show(sessionEnd); };
  }
  function sessionEnd() {
    var b = session.blocks, turns = 0, first = 0, hints = 0;
    b.forEach(function (x) { turns += x.turns; first += x.first; hints += x.hints; });
    P().history.unshift({ at: Date.now(), blocks: b, turns: turns, first: first, hints: hints, breaks: session.breaks, mins: Math.max(1, Math.round((Date.now() - session.start) / 60000)), theme: S().theme });
    P().history = P().history.slice(0, 60); CM.store.save();
    log("Session end", first + " of " + turns + " right first time, " + hints + " hints, " + session.breaks + " breaks");
    var stickers = session.stickers; session = null; blk = null; cur = null;
    $("breakBtn").hidden = true; $("progress").hidden = true; renderSched();
    stage.innerHTML =
      '<p class="label">All done</p><h1 class="say">Great work, ' + esc(P().name) + "</h1>" +
      '<div class="stickers">' + stickers.map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</div>" +
      '<p class="sub">You played ' + b.length + " games. Your sticker book has " + P().stickers.length + " stickers.</p>" +
      '<div class="row"><button class="big-btn" id="againBtn2" type="button">Play again</button><button class="ghost-btn" id="restBtn" type="button">Stop for now</button></div>';
    say("All done. Great work.");
    $("againBtn2").onclick = startScreen;
    $("restBtn").onclick = function () {
      stage.innerHTML = '<h1 class="say">See you next time</h1><p class="sub">Come back whenever you are ready.</p><button class="ghost-btn" id="backBtn" type="button">Back to start</button>';
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
    stage.innerHTML = '<p class="label">Break</p><div class="breath" aria-hidden="true"></div><h1 class="say">Breathe in. Breathe out.</h1>' +
      '<p class="sub">Take as long as you need. Your game will wait.</p><button class="big-btn" id="readyBtn" type="button">I\'m ready</button>';
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
    var opts = shuffle([ans, ans + 1, ans - 1, ans + 10].filter(function (v, i, arr) { return arr.indexOf(v) === i; }));
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
  function gateLabel() { $("grownTxt").textContent = CM.store.db().app.gate === "hold" ? "Grown-ups: hold" : "Grown-ups"; }
  function openPanel() { $("gate").hidden = true; $("panel").hidden = false; $("grownBtn").hidden = true; renderPanel(); $("closePanel").focus(); }
  function closePanel() { $("panel").hidden = true; $("grownBtn").hidden = false; applySenses(); if (!session) startScreen(); else { renderSched(); renderWho(); } }

  function renderPanel() {
    document.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", t.dataset.tab === tab); });
    document.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== tab; });
    ({ child: renderChild, settings: renderSettings, skills: renderSkills, history: renderHistory, engine: renderLog, account: renderAccount }[tab] || renderSkills)();
  }

  /* ---------- child tab ---------- */
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
      return '<button type="button" class="chip" aria-pressed="' + (x.id === CM.store.activeId()) + '" data-id="' + x.id + '">' + x.p.avatar + " " + esc(x.p.name) + (x.p.example ? ' <span class="ex">example</span>' : "") + "</button>";
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
      CM.store.wipeDevice(); location.reload();
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
      var set = function (k, v) { Object.assign(p.skills[k], v); };
      set("same", { p: 0.97, turns: 32, lvl: 3 }); set("sortPic", { p: 0.92, turns: 16, lvl: 1 }); set("sortSize", { p: 0.66, turns: 8, lvl: 0 });
      set("seqAB", { p: 0.81, turns: 12, lvl: 1 }); set("seqAAB", { p: 0.34, turns: 4, lvl: 0, struggle: true });
      set("count3", { p: 0.93, turns: 12, lvl: 2 }); set("count5", { p: 0.52, turns: 8, lvl: 1 }); set("pairs2", { p: 0.71, turns: 4, lvl: 1 });
      var day = 864e5, now = Date.now();
      p.history = [
        { at: now - day, blocks: [{ skill: "same", turns: 4, first: 4, hints: 0 }, { skill: "seqAAB", turns: 4, first: 1, hints: 2 }, { skill: "count5", turns: 4, first: 3, hints: 0 }], turns: 12, first: 8, hints: 2, breaks: 1, mins: 9, theme: "vehicles" },
        { at: now - 3 * day, blocks: [{ skill: "count3", turns: 4, first: 4, hints: 0 }, { skill: "pairs2", turns: 2, first: 1, hints: 1 }, { skill: "sortSize", turns: 4, first: 3, hints: 0 }], turns: 10, first: 8, hints: 1, breaks: 0, mins: 8, theme: "vehicles" },
        { at: now - 5 * day, blocks: [{ skill: "sortPic", turns: 4, first: 4, hints: 0 }, { skill: "seqAB", turns: 4, first: 3, hints: 0 }, { skill: "same", turns: 4, first: 4, hints: 0 }], turns: 12, first: 11, hints: 0, breaks: 0, mins: 7, theme: "animals" },
        { at: now - 8 * day, blocks: [{ skill: "same", turns: 4, first: 3, hints: 0 }, { skill: "sortPic", turns: 4, first: 2, hints: 1 }, { skill: "seqAB", turns: 4, first: 2, hints: 1 }], turns: 12, first: 7, hints: 2, breaks: 2, mins: 12, theme: "animals" }
      ];
      p.stickers = ["🚂", "🚌", "🚁", "🐶", "🚜", "🚒", "⛵", "🚗", "🐸", "🐢"];
      CM.store.persist(); applySenses(); renderWho(); tab = "skills"; renderPanel();
      log("Example child added", "Sam, with four past sessions. Never synced to an account.");
    };
  }

  /* ---------- settings tab ---------- */
  function chipGroup(el, entries, current, onPick, rerender) {
    el.innerHTML = entries.map(function (e) { return '<button type="button" class="chip" aria-pressed="' + (String(e[0]) === String(current)) + '" data-v="' + e[0] + '">' + e[1] + "</button>"; }).join("");
    el.querySelectorAll(".chip").forEach(function (b) { b.onclick = function () { onPick(b.dataset.v); CM.store.save(); (rerender || renderSettings)(); }; });
  }
  function renderSettings() {
    var s = S();
    chipGroup($("themeChips"), Object.keys(CM.THEMES).map(function (k) { return [k, CM.THEMES[k].items[0][0] + " " + CM.THEMES[k].label]; }), s.theme, function (v) { s.theme = v; log("Theme changed", CM.THEMES[v].label + " from the next turn"); });
    chipGroup($("rateChips"), [[0.7, "Voice: slow"], [0.85, "Voice: gentle"], [1, "Voice: normal"]], s.rate, function (v) { s.rate = +v; say("This is how I will sound"); });
    chipGroup($("blockChips"), [[2, "2"], [3, "3"], [4, "4"]], s.blocks, function (v) { s.blocks = +v; });
    chipGroup($("turnChips"), [[3, "3"], [4, "4"], [6, "6"]], s.turns, function (v) { s.turns = +v; });
    chipGroup($("modeChips"), [["engine", "Engine picks"], ["fixed", "Same order every time"]], s.mode, function (v) { s.mode = v; });
    var app = CM.store.db().app;
    chipGroup($("gateChips"), [["hold", "Press and hold"], ["sum", "Answer a sum"]], app.gate, function (v) { app.gate = v; CM.store.persist(); gateLabel(); });
    ["sound", "speech", "calm", "contrast", "big", "keys", "adaptive"].forEach(function (k) {
      var c = $("s-" + k); c.checked = !!s[k];
      c.onchange = function () { s[k] = c.checked; CM.store.save(); applySenses(); if (k === "speech" && c.checked) say("Read aloud is on"); };
    });
    CM.GAME_ORDER.forEach(function (g) {
      var c = $("g-" + g); c.checked = !!s.games[g];
      c.onchange = function () { s.games[g] = c.checked; if (!CM.GAME_ORDER.some(function (x) { return s.games[x]; })) { s.games[g] = true; c.checked = true; } CM.store.save(); };
    });
  }

  /* ---------- skills tab ---------- */
  function renderSkills() {
    var node = function (s) {
      var st = P().skills[s.id], status = CM.status(s), p = st.p, off = !S().games[s.game];
      var lbl = { locked: "Not open yet", ready: "Ready", learning: "Learning", mastered: "Learned" }[status];
      return '<div class="node ' + status + '"><div class="nh"><b>' + esc(s.name) + "</b><span>" + (st.struggle ? '<span class="pill step">Step back next</span> ' : "") +
        '<span class="pill ' + status + '">' + (off ? "Game off" : lbl) + "</span></span></div>" +
        '<div class="bar" role="img" aria-label="' + CM.pct(p) + ' sure"><i style="width:' + Math.round(p * 100) + '%"></i><span class="mk" style="left:60%"></span><span class="mk" style="left:90%"></span></div>' +
        '<div class="nmeta">' + CM.pct(p) + " sure · " + st.turns + " turns · " + CM.lvShort(s.game, st.lvl) + "</div></div>";
    };
    var col = function (g, title) {
      return '<div class="track"><h4>' + title + "</h4>" + CM.SKILLS.filter(function (s) { return s.game === g; }).map(node).join('<div class="arrow" aria-hidden="true">↓</div>') + "</div>";
    };
    $("smap").innerHTML = '<div class="track" style="max-width:380px;margin:0 auto;width:100%"><h4>Start here</h4>' + node(CM.SK.same) + "</div>" +
      '<div class="arrow" aria-hidden="true">↓ opens all four tracks ↓</div><div class="tracks">' + col("sort", "Sorting") + col("seq", "Patterns") + col("count", "Counting") + col("pairs", "Pairs") + "</div>";
    var r = CM.planSession();
    $("planPreview").innerHTML = r.plan.map(function (g, i) {
      var k = CM.pickSkill(g, false);
      return "<li><b>" + CM.GAMES[g].label + "</b>: " + esc(r.reasons[i] || r.reasons[0]) + '. <span class="note">Skill: ' + esc(k[0].name) + ". " + esc(k[1]) + ".</span></li>";
    }).join("");
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
        var v = r.turns ? r.first / r.turns : 0, cx = x0 + (i + 0.5) * (x1 - x0) / last.length, top = y1 - (y1 - y0) * v;
        svg += '<rect class="b" x="' + (cx - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + Math.max(1, y1 - top) + '" rx="4"><title>' + CM.pct(v) + "</title></rect>";
        svg += '<text x="' + cx + '" y="' + (y1 + 16) + '" text-anchor="middle">' + new Date(r.at).toLocaleDateString([], { day: "numeric", month: "short" }) + "</text>";
      });
    } else svg += '<text x="' + ((x0 + x1) / 2) + '" y="' + ((y0 + y1) / 2) + '" text-anchor="middle">No sessions yet</text>';
    svg += '<text x="' + x0 + '" y="' + (H - 4) + '">Oldest</text><text x="' + x1 + '" y="' + (H - 4) + '" text-anchor="end">Newest</text></svg>';
    $("histChart").innerHTML = svg;
    $("histBody").innerHTML = h.length ? h.map(function (r) {
      var d = new Date(r.at);
      return "<tr><td>" + d.toLocaleDateString([], { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</td><td>" +
        r.blocks.map(function (b) { return esc(CM.SK[b.skill] ? CM.SK[b.skill].name : b.skill) + ' <span class="note">' + b.first + "/" + b.turns + "</span>"; }).join("<br>") +
        "</td><td>" + r.first + " of " + r.turns + " (" + CM.pct(r.turns ? r.first / r.turns : 0) + ")</td><td>" + r.hints + "</td><td>" + r.breaks + "</td><td>" + r.mins + "</td></tr>";
    }).join("") : '<tr><td colspan="6" class="note">No sessions yet for ' + esc(P().name) + ". Finish a session, or add the example child on the Child tab.</td></tr>";
  }
  function exportData() {
    var p = P();
    return JSON.stringify({ exported: new Date().toISOString(), child: p.name, avatar: p.avatar, settings: p.settings, skills: p.skills, history: p.history, stickers: p.stickers }, null, 2);
  }
  function bindHistoryStatic() {
    $("downloadBtn").onclick = function () {
      var blob = new Blob([exportData()], { type: "application/json" }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "calm-match-" + P().name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".json";
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
    $("copyBtn").onclick = function () {
      var data = exportData(), area = $("copyArea");
      var fallback = function () { area.hidden = false; area.value = data; area.select(); $("copyMsg").textContent = "Select all and copy from the box."; };
      try { navigator.clipboard.writeText(data).then(function () { $("copyMsg").textContent = "Copied."; }, fallback); } catch (e) { fallback(); }
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
        '<p class="note">Synced for each child: avatar and settings' + (a && a.sync_progress ? ", plus skill progress" : "") + ". Nicknames stay on this device. The example child is never synced.</p>" +
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
    applySenses(); setupGate(); gateLabel(); bindChildStatic(); bindHistoryStatic();
    $("breakBtn").onclick = takeBreak;
    $("closePanel").onclick = closePanel;
    document.querySelectorAll(".tab").forEach(function (t) { t.onclick = function () { tab = t.dataset.tab; renderPanel(); }; });
    startScreen();
    if (CM.cloud && CM.cloud.enabled) {
      CM.cloud.onChange(function (ev) {
        if (!$("panel").hidden && tab === "account") renderAccount();
        if (ev.type === "synced" && !session) { applySenses(); renderWho(); if ($("panel").hidden) startScreen(); }
      });
      CM.cloud.init();
    }
  });
})();
