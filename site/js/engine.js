/* The adaptive engine: content, skill map, knowledge tracing, prompt fading and session planning. No network access. */
(function () {
  "use strict";
  var CM = window.CM;

  // Each item: [emoji, English name, Irish name]
  CM.THEMES = {
    vehicles: { label: "Trains & vehicles", ga: "Traenacha & feithiclí", group: { en: "Vehicles", ga: "Feithiclí" },
      items: [["🚂","train","traein"],["🚌","bus","bus"],["🚗","car","carr"],["🚲","bike","rothar"],["🚁","helicopter","héileacaptar"],["🚜","tractor","tarracóir"],["⛵","boat","bád"],["🚒","fire engine","inneall dóiteáin"]] },
    animals:  { label: "Animals", ga: "Ainmhithe", family: "creatures", group: { en: "Animals", ga: "Ainmhithe" },
      items: [["🐶","dog","madra"],["🐱","cat","cat"],["🐰","rabbit","coinín"],["🐸","frog","frog"],["🐢","turtle","turtar"],["🐘","elephant","eilifint"],["🦁","lion","leon"],["🐧","penguin","piongain"]] },
    space:    { label: "Space", ga: "Spás", family: "sky", group: { en: "Space", ga: "Spás" },
      items: [["🚀","rocket","roicéad"],["🌙","moon","gealach"],["⭐","star","réalta"],["🪐","planet","pláinéad"],["☀️","sun","grian"],["🛸","spaceship","spásárthach"],["🌍","Earth","an Domhan"],["👩‍🚀","astronaut","spásaire"]] },
    dinos:    { label: "Dinosaurs", ga: "Díneasáir", family: "creatures", group: { en: "Dinosaurs", ga: "Díneasáir" },
      items: [["🦕","long-neck dinosaur","díneasár"],["🦖","T-rex","T-rex"],["🥚","egg","ubh"],["🌋","volcano","bolcán"],["🌴","palm tree","crann pailme"],["🦴","bone","cnámh"],["🐊","crocodile","crogall"],["🦎","lizard","laghairt"]] },
    colours:  { label: "Colours", ga: "Dathanna", noKind: true, group: { en: "Colours", ga: "Dathanna" },
      items: [["🔴","red","dearg"],["🟢","green","glas"],["🔵","blue","gorm"],["🟡","yellow","buí"],["🟣","purple","corcra"],["🟠","orange","oráiste"],["⚫","black","dubh"],["🟤","brown","donn"]] },
    farm:     { label: "Farm", ga: "Feirm", family: "creatures", group: { en: "Farm", ga: "Feirm" },
      items: [["🐄","cow","bó"],["🐖","pig","muc"],["🐑","sheep","caora"],["🐴","horse","capall"],["🐔","hen","cearc"],["🦆","duck","lacha"],["🐐","goat","gabhar"],["🌻","sunflower","lus na gréine"]] },
    sea:      { label: "Sea creatures", ga: "Créatúir mhara", family: "creatures", group: { en: "Sea", ga: "Farraige" },
      items: [["🐟","fish","iasc"],["🐙","octopus","ochtapas"],["🦀","crab","portán"],["🐳","whale","míol mór"],["🐬","dolphin","deilf"],["🦈","shark","siorc"],["🦭","seal","rón"],["🐚","shell","sliogán"]] },
    music:    { label: "Music", ga: "Ceol", group: { en: "Music", ga: "Ceol" },
      items: [["🥁","drum","druma"],["🎸","guitar","giotár"],["🎹","piano","pianó"],["🎺","trumpet","trumpa"],["🎻","violin","veidhlín"],["🎷","saxophone","sacsafón"],["🔔","bell","clog"],["🎤","microphone","micreafón"]] },
    food:     { label: "Food", ga: "Bia", group: { en: "Food", ga: "Bia" },
      items: [["🍎","apple","úll"],["🍌","banana","banana"],["🍞","bread","arán"],["🧀","cheese","cáis"],["🥕","carrot","cairéad"],["🍕","pizza","píotsa"],["🍓","strawberry","sú talún"],["🥛","milk","bainne"]] },
    clothes:  { label: "Clothes", ga: "Éadaí", group: { en: "Clothes", ga: "Éadaí" },
      items: [["👕","T-shirt","T-léine"],["👖","trousers","bríste"],["🧦","socks","stocaí"],["👟","shoes","bróga"],["🧥","coat","cóta"],["🧢","cap","caipín"],["🧤","gloves","lámhainní"],["👗","dress","gúna"]] },
    home:     { label: "At home", ga: "Sa bhaile", group: { en: "Home", ga: "Baile" },
      items: [["🛏️","bed","leaba"],["🪑","chair","cathaoir"],["🚪","door","doras"],["🛁","bath","folcadán"],["🚽","toilet","leithreas"],["🪟","window","fuinneog"],["🛋️","sofa","tolg"],["💡","light","solas"]] },
    toys:     { label: "Toys", ga: "Bréagáin", group: { en: "Toys", ga: "Bréagáin" },
      items: [["🧸","teddy","teidí"],["⚽","ball","liathróid"],["🪁","kite","eitleog"],["🧩","jigsaw","míreanna mearaí"],["🎈","balloon","balún"],["🎲","dice","dísle"],["🪀","yo-yo","yó-yó"],["🛹","skateboard","clár scátála"]] },
    body:     { label: "My body", ga: "Mo chorp", group: { en: "Body", ga: "Corp" },
      items: [["👁️","eye","súil"],["👂","ear","cluas"],["👃","nose","srón"],["👄","mouth","béal"],["✋","hand","lámh"],["🦶","foot","troigh"],["🦷","tooth","fiacail"],["💪","arm","géag"]] },
    weather:  { label: "Weather", ga: "Aimsir", family: "sky", group: { en: "Weather", ga: "Aimsir" },
      items: [["🌧️","rain","báisteach"],["☀️","sun","grian"],["❄️","snow","sneachta"],["🌈","rainbow","tuar ceatha"],["☁️","cloud","scamall"],["⚡","lightning","tintreach"],["🌬️","wind","gaoth"],["☂️","umbrella","scáth fearthainne"]] },
    school:   { label: "School", ga: "Scoil", group: { en: "School", ga: "Scoil" },
      items: [["✏️","pencil","peann luaidhe"],["📚","books","leabhair"],["🎒","school bag","mála scoile"],["✂️","scissors","siosúr"],["📏","ruler","rialóir"],["🖍️","crayon","crián"],["🧮","abacus","fráma comhairimh"],["🏫","school","scoil"]] },
    shapes:   { label: "Shapes", ga: "Cruthanna", noKind: true, group: { en: "Shapes", ga: "Cruthanna" },
      items: [["🔴","circle","ciorcal"],["🟦","square","cearnóg"],["🔺","triangle","triantán"],["⭐","star","réalta"],["❤️","heart","croí"],["🔶","diamond","muileata"],["🌙","crescent","corrán"],["➕","cross","cros"]] }
  };
  // Themes in the same family (all creatures) are never sorted against each other: a cow is an animal too.

  // Feelings for the Feelings game. Several faces per feeling, so children learn the feeling, not one picture.
  CM.FEELINGS = [
    { id: "happy",     en: "happy",     ga: "sásta",      faces: ["😀","😊","😄","🙂"], q: { en: "Which face is happy?",     ga: "Cén aghaidh atá sásta?" } },
    { id: "sad",       en: "sad",       ga: "brónach",    faces: ["😢","😞","😔","☹️"], q: { en: "Which face is sad?",       ga: "Cén aghaidh atá brónach?" } },
    { id: "angry",     en: "angry",     ga: "crosta",     faces: ["😠","😡"],          q: { en: "Which face is angry?",     ga: "Cén aghaidh atá crosta?" } },
    { id: "scared",    en: "scared",    ga: "scanraithe", faces: ["😨","😱","😰"],     q: { en: "Which face is scared?",    ga: "Cén aghaidh atá scanraithe?" } },
    { id: "surprised", en: "surprised", ga: "ionadh",     faces: ["😮","😲","😯"],     q: { en: "Which face is surprised?", ga: "Cén aghaidh a bhfuil ionadh uirthi?" } },
    { id: "sleepy",    en: "sleepy",    ga: "tuirseach",  faces: ["😴","🥱","😪"],     q: { en: "Which face is sleepy?",    ga: "Cén aghaidh atá tuirseach?" } },
    // "More feelings" (a setting, off by default): finer differences, for children who know the first six.
    { id: "calm",      en: "calm",      ga: "socair",       extra: true, faces: ["😌"],           q: { en: "Which face is calm?",      ga: "Cén aghaidh atá socair?" } },
    { id: "silly",     en: "silly",     ga: "seafóideach",  extra: true, faces: ["😜","🤪","😝"], q: { en: "Which face is silly?",     ga: "Cén aghaidh atá seafóideach?" } },
    { id: "worried",   en: "worried",   ga: "buartha",      extra: true, faces: ["😟","😧"],      q: { en: "Which face is worried?",   ga: "Cén aghaidh atá buartha?" } },
    { id: "loving",    en: "loving",    ga: "grámhar",      extra: true, faces: ["🥰","😍","😘"], q: { en: "Which face is loving?",    ga: "Cén aghaidh atá grámhar?" } }
  ];
  CM.feelings = function () { var more = CM.store && CM.store.S && CM.store.S().moreFeelings; return CM.FEELINGS.filter(function (f) { return more || !f.extra; }); };

  // cat: the group a game is listed under in the grown-ups area.
  CM.GAMES = {
    match:    { cat: "look",  label: "Match",    ga: "Meaitseáil", does: "Find the picture that is the same.", doesGa: "Aimsigh an pictiúr atá mar an gcéanna." },
    pairs:    { cat: "look",  label: "Pairs",    ga: "Péirí",      does: "Turn over two cards. Find the ones that are the same.", doesGa: "Iompaigh dhá chárta. Aimsigh na cinn atá mar an gcéanna." },
    shadow:   { cat: "look",  label: "Shadows",  ga: "Scáthanna",  does: "Find the picture that makes this shadow.", doesGa: "Aimsigh an pictiúr a dhéanann an scáth seo." },
    missing:  { cat: "look",  label: "What's missing?", ga: "Cad atá in easnamh?", does: "Look at the pictures. One goes away. Which one?", doesGa: "Féach ar na pictiúir. Imíonn ceann amháin. Cé acu?" },
    puzzle:   { cat: "look",  label: "Puzzle",   ga: "Mír mhearaí", does: "Find the piece that finishes the picture.", doesGa: "Aimsigh an píosa a chríochnaíonn an pictiúr." },
    find:     { cat: "words", label: "Find it",  ga: "Aimsigh é",  does: "Listen to the word. Find that picture.", doesGa: "Éist leis an bhfocal. Aimsigh an pictiúr sin." },
    sort:     { cat: "think", label: "Sort",     ga: "Sórtáil",    does: "Put each picture in the right basket.", doesGa: "Cuir gach pictiúr sa chiseán ceart." },
    odd:      { cat: "think", label: "Odd one out", ga: "An ceann corr", does: "Find the one that is different.", doesGa: "Aimsigh an ceann atá difriúil." },
    together: { cat: "think", label: "Goes together", ga: "Le chéile", does: "Find what goes with this picture.", doesGa: "Aimsigh cad a théann leis an bpictiúr seo." },
    count:    { cat: "num",   label: "Count",    ga: "Comhair",    does: "Count the pictures. Tap the number.", doesGa: "Comhair na pictiúir. Brúigh an uimhir." },
    num:      { cat: "num",   label: "Numbers",  ga: "Uimhreacha", does: "Match numbers and groups. Find which has more.", doesGa: "Meaitseáil uimhreacha agus grúpaí. Aimsigh cé acu is mó." },
    shapes:   { cat: "num",   label: "Shapes and sizes", ga: "Cruthanna agus méideanna", does: "Find the shape. Put pictures from small to big.", doesGa: "Aimsigh an cruth. Cuir na pictiúir ó bheag go mór." },
    letters:  { cat: "letters", label: "Letters", ga: "Litreacha", does: "Match letters, find first sounds and trace letters.", doesGa: "Meaitseáil litreacha, aimsigh an chéad fhuaim agus rianaigh litreacha." },
    seq:      { cat: "order", label: "Patterns", ga: "Patrúin",    does: "Look at the line of pictures. Find what comes next.", doesGa: "Féach ar líne na bpictiúr. Aimsigh cad a thagann ina dhiaidh." },
    order:    { cat: "order", label: "Steps in order", ga: "Céimeanna in ord", does: "Tap the pictures in order: first, next, last.", doesGa: "Brúigh na pictiúir in ord: ar dtús, ansin, ar deireadh." },
    feel:     { cat: "feel",  label: "Feelings", ga: "Mothúcháin", does: "Look at the faces. Find the feeling.", doesGa: "Féach ar na haghaidheanna. Aimsigh an mothúchán." }
  };
  CM.GAME_CATS = [["look", "Matching and looking"], ["words", "Words and listening"], ["think", "Sorting and thinking"], ["num", "Numbers and shapes"],
    ["letters", "Letters"], ["order", "Patterns and order"], ["feel", "Feelings"]];
  // The original six keep their place, so saved sessions and settings read the same.
  CM.GAME_ORDER = ["match", "sort", "seq", "count", "pairs", "feel", "find", "shadow", "odd", "num", "shapes", "together", "missing", "puzzle", "letters", "order"];

  // The skill map. Each skill opens when every skill in `pre` is at least READY.
  // Ids are saved with progress: add new skills, never rename old ones.
  CM.SKILLS = [
    { id: "same",      game: "match", name: "Same picture",           pre: [] },
    { id: "sortPic",   game: "sort",  name: "Sort by picture",        pre: ["same"], mode: "picture" },
    { id: "sortSize",  game: "sort",  name: "Sort big and small",     pre: ["sortPic"], mode: "size" },
    { id: "sortColour",game: "sort",  name: "Sort by colour",         pre: ["sortPic"], mode: "colour" },
    { id: "sortShape", game: "sort",  name: "Sort by shape",          pre: ["sortColour"], mode: "shape" },
    { id: "sortKind",  game: "sort",  name: "Sort by group",          pre: ["sortSize"], mode: "kind" },
    { id: "seqAB",     game: "seq",   name: "Pattern A B",            pre: ["same"], pattern: "AB" },
    { id: "seqAAB",    game: "seq",   name: "Pattern A A B",          pre: ["seqAB"], pattern: "AAB" },
    { id: "seqABC",    game: "seq",   name: "Pattern A B C",          pre: ["seqAAB"], pattern: "ABC" },
    { id: "count3",    game: "count", name: "Count to 3",             pre: ["same"], max: 3 },
    { id: "count5",    game: "count", name: "Count to 5",             pre: ["count3"], max: 5 },
    { id: "count8",    game: "count", name: "Count to 8",             pre: ["count5"], max: 8 },
    { id: "pairs2",    game: "pairs", name: "Pairs: 2 pairs",         pre: ["same"], n: 2 },
    { id: "pairs3",    game: "pairs", name: "Pairs: 3 pairs",         pre: ["pairs2"], n: 3 },
    { id: "pairs4",    game: "pairs", name: "Pairs: 4 pairs",         pre: ["pairs3"], n: 4 },
    { id: "feelSame",  game: "feel",  name: "Same face",              pre: ["same"], mode: "same" },
    { id: "feelName",  game: "feel",  name: "Name the feeling",       pre: ["feelSame"], mode: "name" },
    { id: "feelOther", game: "feel",  name: "Same feeling, new face", pre: ["feelName"], mode: "other" },
    { id: "feelWhy",   game: "feel",  name: "How do they feel?",      pre: ["feelName"], mode: "why" },
    { id: "findPic",   game: "find",  name: "Find the one I say",     pre: ["same"], mode: "theme" },
    { id: "findBody",  game: "find",  name: "Body parts",             pre: ["findPic"], mode: "body" },
    { id: "findWhere", game: "find",  name: "In, on and under",       pre: ["findBody"], mode: "where" },
    { id: "shadowPic", game: "shadow",name: "Shadow to picture",      pre: ["same"], mode: "toPic" },
    { id: "shadowFind",game: "shadow",name: "Picture to shadow",      pre: ["shadowPic"], mode: "toShadow" },
    { id: "oddPic",    game: "odd",   name: "One is different",       pre: ["sortPic"], mode: "pic" },
    { id: "oddGroup",  game: "odd",   name: "Not in the group",       pre: ["oddPic"], mode: "group" },
    { id: "together",  game: "together", name: "What goes together",  pre: ["sortPic"] },
    { id: "numMatch3", game: "num",   name: "Number to group, to 3",  pre: ["count3"], mode: "match", max: 3 },
    { id: "numMatch5", game: "num",   name: "Number to group, to 5",  pre: ["numMatch3", "count5"], mode: "match", max: 5 },
    { id: "numMore",   game: "num",   name: "Which has more?",        pre: ["count3"], mode: "more" },
    { id: "shapeName", game: "shapes",name: "Name the shape",         pre: ["same"], mode: "name" },
    { id: "sizeOrder", game: "shapes",name: "Small to big",           pre: ["shapeName"], mode: "size" },
    { id: "missing3",  game: "missing", name: "What's missing: 3",    pre: ["pairs2"], n: 3 },
    { id: "missing4",  game: "missing", name: "What's missing: 4",    pre: ["missing3"], n: 4 },
    { id: "puzzle2",   game: "puzzle",name: "Puzzle: half",           pre: ["same"], n: 2 },
    { id: "puzzle4",   game: "puzzle",name: "Puzzle: quarter",        pre: ["puzzle2"], n: 4 },
    { id: "letterSame",game: "letters", name: "Same letter",          pre: ["same"], mode: "same" },
    { id: "letterCase",game: "letters", name: "Big and small letters",pre: ["letterSame"], mode: "case" },
    { id: "letterFirst",game: "letters",name: "First sound",          pre: ["letterCase"], mode: "first" },
    { id: "letterTrace",game: "letters",name: "Trace a letter",       pre: ["letterSame"], mode: "trace" },
    { id: "order3",    game: "order", name: "3 steps in order",       pre: ["seqAB"], n: 3 },
    { id: "order4",    game: "order", name: "4 steps in order",       pre: ["order3"], n: 4 }
  ];
  CM.SK = {}; CM.SKILLS.forEach(function (s) { CM.SK[s.id] = s; });
  CM.TRACKS = CM.GAME_ORDER.filter(function (g) { return g !== "match"; }).map(function (g) { return { game: g, title: CM.GAMES[g].label }; });

  // Difficulty ladders inside a game. Index 0 is easiest. 0 means the game has no choices to add.
  CM.LV = { match: [2, 3, 4, 6], sort: [2, 3], seq: [2, 3, 4], count: [2, 3, 4], pairs: [3, 1.5, 0], feel: [2, 3, 4],
    find: [2, 3, 4], shadow: [2, 3, 4], odd: [0], num: [2, 3], shapes: [2, 3, 4], together: [2, 3, 4], missing: [2, 3, 4], puzzle: [2, 3], letters: [2, 3, 4], order: [0] };
  CM.lvDesc = function (game, i, skill) {
    var v = CM.LV[game][Math.min(i, CM.LV[game].length - 1)];
    if (game === "match") return v + " pictures to choose from";
    if (game === "feel") return v + " faces to choose from";
    if (game === "sort") return (skill && skill.mode === "size" ? 2 : v) + " baskets";
    if (game === "pairs") return v ? "cards shown for " + v + " seconds first" : "no peek at the start";
    if (!v) return "the same every time";
    return v + " answers to choose from";
  };
  CM.lvShort = function (game, i) {
    var v = CM.LV[game][Math.min(i, CM.LV[game].length - 1)];
    if (game === "sort") return v + " baskets";
    if (game === "pairs") return v ? v + "s peek" : "no peek";
    if (!v) return "–";
    return v + " choices";
  };
  CM.PROMPT_NAMES = ["no help", "outline on the answer", "answer highlighted"];

  CM.READY = 0.6; CM.MASTER = 0.9; CM.PRIOR = 0.15;
  var P_TRANSIT = 0.2, P_SLIP = 0.1;

  CM.theme = function () { return CM.THEMES[CM.store.S().theme] || CM.THEMES.vehicles; };
  CM.gameIcon = function (g) {
    var it = CM.theme().items;
    return { match: it[0][0] + it[0][0], sort: "🧺", seq: it[0][0] + it[1][0] + it[0][0], count: "1 2 3", pairs: "❔" + it[2][0], feel: "😊😢",
      find: "👂" + it[1][0], shadow: "🔦", odd: it[0][0] + it[0][0] + "🔍", together: "🧦👟", num: "🔢", shapes: "🔺🟦",
      missing: "🙈", puzzle: "🧩", letters: "A a", order: "🥚🐣🐥" }[g] || "🎲";
  };

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

  // Bayesian Knowledge Tracing: update the chance a skill is learned after one unprompted first attempt.
  CM.bkt = function (s, correct, nOpts) {
    var st = skillState(s), g = Math.min(0.5, 1 / Math.max(2, nOpts)), p = st.p;
    var post = correct ? p * (1 - P_SLIP) / (p * (1 - P_SLIP) + (1 - p) * g)
                       : p * P_SLIP / (p * P_SLIP + (1 - p) * (1 - g));
    st.p = Math.min(0.995, post + (1 - post) * P_TRANSIT);
  };

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
