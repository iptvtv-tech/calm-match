/* The adaptive engine: content, skill map, knowledge tracing and session planning. No network access. */
(function () {
  "use strict";
  var CM = window.CM;

  CM.THEMES = {
    vehicles: { label: "Trains & vehicles", items: [["🚂","train"],["🚌","bus"],["🚗","car"],["🚲","bike"],["🚁","helicopter"],["🚜","tractor"],["⛵","boat"],["🚒","fire engine"]] },
    animals:  { label: "Animals", items: [["🐶","dog"],["🐱","cat"],["🐰","rabbit"],["🐸","frog"],["🐢","turtle"],["🐘","elephant"],["🦁","lion"],["🐧","penguin"]] },
    space:    { label: "Space", items: [["🚀","rocket"],["🌙","moon"],["⭐","star"],["🪐","planet"],["☀️","sun"],["🛸","spaceship"],["🌍","Earth"],["👩‍🚀","astronaut"]] },
    dinos:    { label: "Dinosaurs", items: [["🦕","long-neck dinosaur"],["🦖","T-rex"],["🥚","egg"],["🌋","volcano"],["🌴","palm tree"],["🦴","bone"],["🐊","crocodile"],["🦎","lizard"]] },
    colours:  { label: "Colours", items: [["🔴","red"],["🟢","green"],["🔵","blue"],["🟡","yellow"],["🟣","purple"],["🟠","orange"],["⚫","black"],["🟤","brown"]] }
  };

  CM.GAMES = {
    match: { label: "Match",    does: "Find the picture that is the same." },
    sort:  { label: "Sort",     does: "Put each picture in the right basket." },
    seq:   { label: "Patterns", does: "Look at the line of pictures. Find what comes next." },
    count: { label: "Count",    does: "Count the pictures. Tap the number." },
    pairs: { label: "Pairs",    does: "Turn over two cards. Find the ones that are the same." }
  };
  CM.GAME_ORDER = ["match", "sort", "seq", "count", "pairs"];

  // The skill map. Each skill opens when every skill in `pre` is at least READY.
  CM.SKILLS = [
    { id: "same",     game: "match", name: "Same picture",       pre: [] },
    { id: "sortPic",  game: "sort",  name: "Sort by picture",    pre: ["same"], mode: "picture" },
    { id: "sortSize", game: "sort",  name: "Sort big and small", pre: ["sortPic"], mode: "size" },
    { id: "sortKind", game: "sort",  name: "Sort by group",      pre: ["sortSize"], mode: "kind" },
    { id: "seqAB",    game: "seq",   name: "Pattern A B",        pre: ["same"], pattern: "AB" },
    { id: "seqAAB",   game: "seq",   name: "Pattern A A B",      pre: ["seqAB"], pattern: "AAB" },
    { id: "seqABC",   game: "seq",   name: "Pattern A B C",      pre: ["seqAAB"], pattern: "ABC" },
    { id: "count3",   game: "count", name: "Count to 3",         pre: ["same"], max: 3 },
    { id: "count5",   game: "count", name: "Count to 5",         pre: ["count3"], max: 5 },
    { id: "count8",   game: "count", name: "Count to 8",         pre: ["count5"], max: 8 },
    { id: "pairs2",   game: "pairs", name: "Pairs: 2 pairs",     pre: ["same"], n: 2 },
    { id: "pairs3",   game: "pairs", name: "Pairs: 3 pairs",     pre: ["pairs2"], n: 3 },
    { id: "pairs4",   game: "pairs", name: "Pairs: 4 pairs",     pre: ["pairs3"], n: 4 }
  ];
  CM.SK = {}; CM.SKILLS.forEach(function (s) { CM.SK[s.id] = s; });

  // Difficulty ladders inside a game. Index 0 is easiest.
  CM.LV = { match: [2, 3, 4, 6], sort: [2, 3], seq: [2, 3, 4], count: [2, 3, 4], pairs: [3, 1.5, 0] };
  CM.lvDesc = function (game, i, skill) {
    var v = CM.LV[game][Math.min(i, CM.LV[game].length - 1)];
    if (game === "match") return v + " pictures to choose from";
    if (game === "sort") return (skill && skill.mode === "size" ? 2 : v) + " baskets";
    if (game === "pairs") return v ? "cards shown for " + v + " seconds first" : "no peek at the start";
    return v + " answers to choose from";
  };
  CM.lvShort = function (game, i) {
    var v = CM.LV[game][Math.min(i, CM.LV[game].length - 1)];
    if (game === "sort") return v + " baskets";
    if (game === "pairs") return v ? v + "s peek" : "no peek";
    return v + " choices";
  };

  CM.READY = 0.6; CM.MASTER = 0.9; CM.PRIOR = 0.15;
  var P_TRANSIT = 0.2, P_SLIP = 0.1;

  CM.gameIcon = function (g) {
    var it = CM.theme().items;
    return { match: it[0][0] + it[0][0], sort: "🧺", seq: it[0][0] + it[1][0] + it[0][0], count: "1 2 3", pairs: "❔" + it[2][0] }[g];
  };
  CM.theme = function () { return CM.THEMES[CM.store.S().theme] || CM.THEMES.vehicles; };

  var skillState = function (s) { return CM.store.P().skills[s.id]; };
  CM.pp = function (s) { return skillState(s).p; };
  CM.unlocked = function (s) {
    var S = CM.store.S();
    return s.pre.every(function (q) { var pre = CM.SK[q]; return !S.games[pre.game] || CM.pp(pre) >= CM.READY; });
  };
  CM.status = function (s) {
    var st = skillState(s);
    if (!CM.unlocked(s)) return "locked";
    if (st.p >= CM.MASTER) return "mastered";
    return st.turns ? "learning" : "ready";
  };

  // Bayesian Knowledge Tracing: update the chance a skill is learned after one first attempt.
  CM.bkt = function (s, correct, nOpts) {
    var st = skillState(s), g = Math.min(0.5, 1 / Math.max(2, nOpts)), p = st.p;
    var post = correct ? p * (1 - P_SLIP) / (p * (1 - P_SLIP) + (1 - p) * g)
                       : p * P_SLIP / (p * P_SLIP + (1 - p) * (1 - g));
    st.p = Math.min(0.995, post + (1 - post) * P_TRANSIT);
  };

  // Which skill to practise inside a game, with a plain-English reason.
  CM.pickSkill = function (game, commit) {
    var list = CM.SKILLS.filter(function (s) { return s.game === game; });
    var strug = list.find(function (s) { return skillState(s).struggle && CM.unlocked(s); });
    if (strug) {
      var pre = strug.pre.map(function (id) { return CM.SK[id]; }).find(function (p) { return p.game === game; });
      if (pre) { if (commit) skillState(strug).struggle = false; return [pre, "Step back: " + strug.name + " was hard last time, so practise " + pre.name + " first"]; }
      return [strug, strug.name + " again, with fewer choices"];
    }
    var un = list.filter(CM.unlocked);
    if (!un.length) return [list[0], "First look at " + list[0].name];
    var learning = un.find(function (s) { return CM.pp(s) < CM.MASTER; });
    if (learning) return [learning, learning.name + " is ready to learn (" + CM.pct(CM.pp(learning)) + " sure)"];
    var top = un[un.length - 1];
    return [top, "Review: " + top.name + " is already learned (" + CM.pct(CM.pp(top)) + ")"];
  };

  CM.pct = function (p) { return Math.round(p * 100) + "%"; };

  // Plan which games to play this session. Fixed once the session starts, so the child is never surprised.
  CM.planSession = function () {
    var S = CM.store.S(), P = CM.store.P(), N = S.blocks;
    var games = CM.GAME_ORDER.filter(function (g) { return S.games[g]; });
    if (!games.length) games = ["match"];
    var reasons = [], plan = [];
    var cycle = function () { for (var i = 0; i < N; i++) plan.push(games[i % games.length]); };

    if (S.mode === "fixed") { cycle(); reasons.push("Same order every time, chosen by a grown-up"); return { plan: plan, reasons: reasons }; }
    if (!P.history.length) { cycle(); reasons.push("First session: one short go at each game to see where to start"); return { plan: plan, reasons: reasons }; }

    var best = function (g) { return Math.max.apply(null, [0].concat(CM.SKILLS.filter(function (k) { return k.game === g && CM.unlocked(k); }).map(CM.pp))); };
    var available = games.filter(function (g) { return CM.SKILLS.some(function (k) { return k.game === g && CM.unlocked(k); }); });
    if (!available.length) available = ["match"];
    var canLearn = function (g) { return CM.SKILLS.some(function (k) { return k.game === g && CM.unlocked(k) && CM.pp(k) < CM.MASTER; }); };
    var flagged = function (g) { return CM.SKILLS.some(function (k) { return k.game === g && skillState(k).struggle; }) ? 1 : 0; };
    var neverPlayed = function (g) { return CM.SKILLS.some(function (k) { return k.game === g && skillState(k).turns > 0; }) ? 0 : 1; };
    var recent = {};
    P.history.slice(0, 2).forEach(function (h) { h.blocks.forEach(function (b) { var g = CM.SK[b.skill] && CM.SK[b.skill].game; if (g) recent[g] = (recent[g] || 0) + 1; }); });

    var strong = available.slice().sort(function (a, b) { return best(b) - best(a); });
    plan.push(strong[0]);
    reasons.push("Warm-up with " + CM.GAMES[strong[0]].label + ": strongest game (" + CM.pct(best(strong[0])) + ")");

    var learn = available.filter(canLearn).sort(function (a, b) {
      return (flagged(b) - flagged(a)) || (neverPlayed(b) - neverPlayed(a)) || ((recent[a] || 0) - (recent[b] || 0)) || (best(b) - best(a));
    });
    var pool = learn.length ? learn : available;
    var middle = N >= 3 ? N - 2 : N - 1, k = 0;
    for (var i = 0; i < middle; i++) {
      var g = pool[k % pool.length];
      if (g === plan[plan.length - 1] && pool.length > 1) { k++; g = pool[k % pool.length]; }
      k++; plan.push(g);
      reasons.push(flagged(g) ? CM.GAMES[g].label + ": was hard last time, so it comes early with a step back"
        : neverPlayed(g) ? CM.GAMES[g].label + ": new game, now open"
        : learn.indexOf(g) >= 0 ? CM.GAMES[g].label + ": has a skill ready to learn" + (recent[g] ? "" : ", not played lately")
        : CM.GAMES[g].label + ": everything learned, keeping it fresh");
    }
    if (N >= 3) {
      var last = strong.find(function (x) { return x !== plan[plan.length - 1] && x !== plan[0]; }) || strong.find(function (x) { return x !== plan[plan.length - 1]; }) || strong[0];
      plan.push(last); reasons.push("Finish on " + CM.GAMES[last].label + ": something familiar");
    }
    return { plan: plan, reasons: reasons };
  };
})();
