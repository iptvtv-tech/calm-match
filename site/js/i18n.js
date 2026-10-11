/* Child-facing words in English and Irish (Gaeilge).
   The grown-ups area stays in English. Irish text should be checked by a fluent speaker before launch. */
(function () {
  "use strict";
  var CM = window.CM;

  var T = {
    en: {
      today: "Today, {name}", gamesThenDone: "{n} games, then all done", tapBreak: "You can tap Break any time.",
      sayToday: "Today: {list}. Then all done.", then: "then", allDone: "All done", now: "Now", go: "Go", start: "Start",
      sayNow: "Now: {game}. {does}", next: "Next", finish: "Finish",
      findSame: "Find the same one", findThis: "Find this", sayFind: "Find the {name}",
      bigOrSmall: "Big or small?", whichGroup: "Which group?", putSame: "Put it with the same one", whereGo: "Where does it go?",
      big: "Big", small: "Small", sayBigSmall: "Is this {name} big or small?", sayGroup: "Which group does the {name} go in?", saySortPic: "Put the {name} with the same picture",
      whatNext: "What comes next?", sayWhatNext: "What comes next?",
      howMany: "How many?", sayCount: "Count the {name} pictures. How many?",
      findPairs: "Find the pairs", sayPairs: "Find the pairs. Tap a card, then another card.", tapCard: "Tap a card, then tap another.",
      peekNote: "Look carefully. The cards will turn over.", aPair: "A pair! Two {name} cards.", notSame: "Not the same. They will turn back over.", allPairs: "All pairs found!",
      faceDown: "Card {n}, face down",
      feelSame: "Find the same face", feelOther: "Find another face that feels the same", feelOtherShort: "Same feeling",
      notThat: "Not that one. Look again.", lookAgain: "Look again", lookOutline: "Look for the dashed outline.", lookHighlight: "Tap the one with the bright outline.",
      sayAgain: "Say it again",
      praiseCheer: "Brilliant! {name}!", praiseGentle: "Yes! {name}.", praiseCalm: "That's right. {name}.",
      praiseCheerPlain: "Brilliant!", praiseGentlePlain: "Yes!", praiseCalmPlain: "That's right.",
      finished: "{game} finished", stickerTitle: "You earned a sticker", calmDone: "Finished",
      nextIs: "Next: {game}.", lastGame: "That was the last game.", somethingNew: "Something new is open: {skill}",
      lastOne: "This is the last one. Then {next}.", nMore: "{n} more, then {next}.", finishedNext: "Finished. Next: {next}.", allDoneLower: "all done",
      greatWork: "Great work, {name}", calmWell: "All done, {name}", played: "You played {n} games. Your sticker book has {s} stickers.", playedCalm: "You played {n} games.",
      playAgain: "Play again", stopNow: "Stop for now", seeYou: "See you next time", comeBack: "Come back whenever you are ready.", backStart: "Back to start",
      breakLabel: "Break", breathe: "Breathe in. Breathe out.", takeTime: "Take as long as you need. Your game will wait.", ready: "I'm ready",
      first: "First", thenWord: "Then", firstDone: "Done", timeUp: "Time is up", ok: "OK", minutesLeft: "{n} min", lessThanMin: "Less than a minute",
      sayDone: "All done. Great work.", sayDoneCalm: "All done.", myDay: "My day", stepDone: "Done", dayDone: "All done for now",
      whoseShadow: "Whose shadow is this?", findShadow: "Find the shadow", thisShadow: "This shadow", aShadow: "A shadow", shadowOfN: "Shadow of {n}", sayFindShadow: "Find the shadow of the {name}",
      findOdd: "Which one is different?", sayOdd: "Which one is different?", goesWith: "What goes with the {name}?", whatGoesWith: "What goes with this?",
      whichMore: "Which has more?", nPictures: "{n} pictures", findGroup: "Find {n}", sizeN: "Size {n}", smallToBig: "Small to big",
      saySmallToBig: "Tap the smallest first, then the next, up to the biggest.", smallest: "Smallest", biggest: "Biggest",
      whatMissing: "What's missing?", remember: "Look and remember", finishPicture: "Which piece finishes the picture?", pieceOf: "Piece of {n}",
      traceLetter: "Trace the letter {l}", firstLetter: "Which letter does it start with?", sayFirstLetter: "Which letter does {name} start with?", findSmallLetter: "Find the small letter",
      sayOrder: "Tap the pictures in order.", lastWord: "Last", howFeel: "How do they feel?", notYet: "Not that one yet. Look again.", traceAgain: "Start again", traceHint: "Use your finger to go over the letter.",
      workingFor: "Working for", tokensLeft: "{n} more, then {reward}", earned: "You did it!", timeFor: "Time for: {reward}", myStickers: "My stickers", noStickers: "No stickers yet. You get one for each game you finish.",
      breakChoose: "What kind of break?", brBreathe: "Breathing", brBubbles: "Bubbles", brMusic: "Music", brQuiet: "Quiet", oneMinute: "1 minute, then back to the game.", breakOver: "Break time is over. Ready?", breakTime: "Time for a break",
      popBubbles: "Pop the bubbles", balloonIn: "Breathe in. The balloon gets bigger.", balloonOut: "Breathe out. The balloon gets smaller.", quietTime: "Quiet time. Rest your eyes.", calmCorner: "Calm corner", balloon: "Balloon breathing",
      inShort: "Breathe in", outShort: "Breathe out", chooseAnswer: "Choose an answer", cardsLabel: "Cards", showMe: "Show me how", readStory: "Read our story", pause: "Pause", resume: "Carry on", closeTimer: "Close timer", closeBoard: "Close board", stepBack: "Back a step", closeSched: "Close schedule", talkEmptyWant: "A grown-up can add choices here.", talkEmptyWords: "A grown-up can add words here.", oneMinuteLeft: "1 minute left", minutesLeftSay: "{n} minutes left", change: "Change", changeMsg: "Change: {new} instead of {old}", talk: "Talk", iWant: "I want", sayIWant: "I want {x}", words: "Words", myWords: "My words", clear: "Clear", sayIt: "Say it", close: "Close",
      theEnd: "The end", back: "Back", stepNofM: "Step {n} of {m}", whoPlaying: "Who is playing?", myStories: "My stories", pickStory: "Pick a story", howTo: "How to", allSteps: "All the steps"
    },
    ga: {
      today: "Inniu, {name}", gamesThenDone: "Cluichí inniu: {n}", tapBreak: "Is féidir leat Sos a bhrú am ar bith.",
      sayToday: "Inniu: {list}. Ansin, críochnaithe.", then: "ansin", allDone: "Críochnaithe", now: "Anois", go: "Ar aghaidh", start: "Tosaigh",
      sayNow: "Anois: {game}. {does}", next: "Ar aghaidh", finish: "Críochnaigh",
      findSame: "Aimsigh an ceann céanna", findThis: "Aimsigh é seo", sayFind: "Aimsigh: {name}",
      bigOrSmall: "Mór nó beag?", whichGroup: "Cén grúpa?", putSame: "Cuir leis an gceann céanna é", whereGo: "Cá dtéann sé?",
      big: "Mór", small: "Beag", sayBigSmall: "Mór nó beag?", sayGroup: "Cén grúpa? {name}", saySortPic: "Cuir leis an gceann céanna é: {name}",
      whatNext: "Cad a thagann ina dhiaidh?", sayWhatNext: "Cad a thagann ina dhiaidh?",
      howMany: "Cé mhéad?", sayCount: "Comhair na pictiúir. Cé mhéad?",
      findPairs: "Aimsigh na péirí", sayPairs: "Aimsigh na péirí. Brúigh cárta, ansin cárta eile.", tapCard: "Brúigh cárta, ansin cárta eile.",
      peekNote: "Féach go cúramach. Iompóidh na cártaí.", aPair: "Péire! {name}.", notSame: "Ní hionann iad. Iompóidh siad ar ais.", allPairs: "Fuair tú na péirí ar fad!",
      faceDown: "Cárta {n}, bunoscionn",
      feelSame: "Aimsigh an aghaidh chéanna", feelOther: "Aimsigh aghaidh eile leis an mothúchán céanna", feelOtherShort: "An mothúchán céanna",
      notThat: "Ní hé sin é. Féach arís.", lookAgain: "Féach arís", lookOutline: "Féach ar an gceann leis an imlíne.", lookHighlight: "Brúigh an ceann leis an imlíne gheal.",
      sayAgain: "Abair arís é",
      praiseCheer: "Iontach! {name}!", praiseGentle: "Maith thú! {name}.", praiseCalm: "Sin é. {name}.",
      praiseCheerPlain: "Iontach!", praiseGentlePlain: "Maith thú!", praiseCalmPlain: "Sin é.",
      finished: "{game}: críochnaithe", stickerTitle: "Fuair tú greamán", calmDone: "Críochnaithe",
      nextIs: "Ar aghaidh: {game}.", lastGame: "B'shin an cluiche deireanach.", somethingNew: "Rud nua le triail!",
      lastOne: "Seo an ceann deireanach. Ansin: {next}.", nMore: "{n} eile, ansin: {next}.", finishedNext: "Críochnaithe. Ar aghaidh: {next}.", allDoneLower: "críochnaithe",
      greatWork: "Obair iontach, {name}", calmWell: "Críochnaithe, {name}", played: "Cluichí a d'imir tú: {n}. Greamáin i do leabhar: {s}.", playedCalm: "Cluichí a d'imir tú: {n}.",
      playAgain: "Imir arís", stopNow: "Stop anois", seeYou: "Feicfidh mé arís thú", comeBack: "Fill nuair a bheidh tú réidh.", backStart: "Ar ais go dtí an tús",
      breakLabel: "Sos", breathe: "Anáil isteach. Anáil amach.", takeTime: "Tóg do chuid ama. Fanfaidh do chluiche leat.", ready: "Táim réidh",
      first: "Ar dtús", thenWord: "Ansin", firstDone: "Déanta", timeUp: "Tá an t-am istigh", ok: "Ceart go leor", minutesLeft: "{n} nóim.", lessThanMin: "Níos lú ná nóiméad",
      sayDone: "Críochnaithe. Obair iontach.", sayDoneCalm: "Críochnaithe.", myDay: "Mo lá", stepDone: "Déanta", dayDone: "Críochnaithe go fóill",
      whoseShadow: "Cé leis an scáth seo?", findShadow: "Aimsigh an scáth", thisShadow: "An scáth seo", aShadow: "Scáth", shadowOfN: "Scáth: {n}", sayFindShadow: "Aimsigh an scáth: {name}",
      findOdd: "Cé acu atá difriúil?", sayOdd: "Cé acu atá difriúil?", goesWith: "Cad a théann leis seo: {name}?", whatGoesWith: "Cad a théann leis seo?",
      whichMore: "Cé acu a bhfuil níos mó ann?", nPictures: "Pictiúir: {n}", findGroup: "Aimsigh {n}", sizeN: "Méid {n}", smallToBig: "Ó bheag go mór",
      saySmallToBig: "Brúigh an ceann is lú ar dtús, ansin an chéad cheann eile, suas go dtí an ceann is mó.", smallest: "Is lú", biggest: "Is mó",
      whatMissing: "Cad atá in easnamh?", remember: "Féach agus cuimhnigh", finishPicture: "Cén píosa a chríochnaíonn an pictiúr?", pieceOf: "Píosa: {n}",
      traceLetter: "Rianaigh an litir {l}", firstLetter: "Cén litir atá ar dtús?", sayFirstLetter: "Cén litir atá ar dtús? {name}", findSmallLetter: "Aimsigh an litir bheag",
      sayOrder: "Brúigh na pictiúir in ord.", lastWord: "Ar deireadh", howFeel: "Conas a mhothaíonn siad?", notYet: "Ní hé sin fós. Féach arís.", traceAgain: "Tosaigh arís", traceHint: "Lean an litir le do mhéar.",
      workingFor: "Ag obair i gcomhair", tokensLeft: "{n} eile, ansin: {reward}", earned: "Rinne tú é!", timeFor: "Am do: {reward}", myStickers: "Mo ghreamáin", noStickers: "Níl greamán ar bith fós. Faigheann tú ceann i ndiaidh gach cluiche.",
      breakChoose: "Cén sórt sosa?", brBreathe: "Análú", brBubbles: "Boilgeoga", brMusic: "Ceol", brQuiet: "Ciúnas", oneMinute: "Nóiméad amháin, ansin ar ais go dtí an cluiche.", breakOver: "Tá an sos thart. An bhfuil tú réidh?", breakTime: "Am sosa",
      popBubbles: "Pléasc na boilgeoga", balloonIn: "Anáil isteach. Éiríonn an balún níos mó.", balloonOut: "Anáil amach. Éiríonn an balún níos lú.", quietTime: "Am ciúin. Lig do scíth.", calmCorner: "Cúinne ciúin", balloon: "Análú balúin",
      inShort: "Anáil isteach", outShort: "Anáil amach", chooseAnswer: "Roghnaigh freagra", cardsLabel: "Cártaí", showMe: "Taispeáin dom", readStory: "Léigh ár scéal", pause: "Cuir ar sos", resume: "Lean ar aghaidh", closeTimer: "Dún an t-amadóir", closeBoard: "Dún an clár", stepBack: "Céim siar", closeSched: "Dún an sceideal", talkEmptyWant: "Is féidir le duine fásta roghanna a chur anseo.", talkEmptyWords: "Is féidir le duine fásta focail a chur anseo.", oneMinuteLeft: "Nóiméad amháin fágtha", minutesLeftSay: "{n} nóiméad fágtha", change: "Athrú", changeMsg: "Athrú: {new} in áit {old}", talk: "Labhair", iWant: "Ba mhaith liom", sayIWant: "Ba mhaith liom {x}", words: "Focail", myWords: "Mo chuid focal", clear: "Glan", sayIt: "Abair é", close: "Dún",
      theEnd: "Críoch", back: "Siar", stepNofM: "Céim {n} as {m}", whoPlaying: "Cé atá ag imirt?", myStories: "Mo scéalta", pickStory: "Roghnaigh scéal", howTo: "Conas", allSteps: "Na céimeanna ar fad"
    }
  };

  CM.lang = function () { var s = CM.store && CM.store.S(); return s && s.lang === "ga" ? "ga" : "en"; };
  CM.t = function (key, vars) {
    var dict = T[CM.lang()], s = dict[key] != null ? dict[key] : T.en[key] != null ? T.en[key] : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  };
  CM.nm = function (item) { return CM.lang() === "ga" && item[2] ? item[2] : item[1]; };
  CM.gameName = function (g) { return CM.lang() === "ga" ? CM.GAMES[g].ga : CM.GAMES[g].label; };
  CM.gameDoes = function (g) { return CM.lang() === "ga" ? CM.GAMES[g].doesGa : CM.GAMES[g].does; };
  CM.groupName = function (themeKey) { return CM.THEMES[themeKey].group[CM.lang()]; };
  CM.feelWord = function (f) { return f[CM.lang()]; };
  CM.feelQ = function (f) { return f.q[CM.lang()]; };
  // Capitalise the first letter for display after "Yes!" etc.
  CM.cap = function (s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); };

  // Activities for the First/Then board.
  CM.ACTIVITIES = [
    ["🎮", "Calm Match", "Calm Match"], ["🦷", "Brush teeth", "Scuab fiacla"], ["👟", "Shoes on", "Bróga ort"], ["🧥", "Coat on", "Cóta ort"],
    ["🍽️", "Dinner", "Dinnéar"], ["🍪", "Snack", "Sneaic"], ["🛁", "Bath", "Folcadh"], ["🛏️", "Bed", "Leaba"],
    ["📚", "Reading", "Léamh"], ["✏️", "Homework", "Obair bhaile"], ["🧸", "Play", "Súgradh"], ["🧩", "Puzzle", "Míreanna mearaí"],
    ["📺", "TV", "Teilifís"], ["🌳", "Park", "Páirc"], ["🚗", "Car", "Carr"], ["🏫", "School", "Scoil"],
    ["🎵", "Music", "Ceol"], ["🚽", "Toilet", "Leithreas"], ["🧹", "Tidy up", "Glan suas"], ["🤗", "Hug", "Barróg"],
    // Added later: always add new activities at the end, so saved boards and schedules keep their pictures.
    ["🥣", "Breakfast", "Bricfeasta"], ["🥪", "Lunch", "Lón"], ["👕", "Get dressed", "Éadaí ort"], ["🧼", "Wash hands", "Nigh do lámha"],
    ["🚶", "Walk", "Siúlóid"], ["🎨", "Drawing", "Líníocht"], ["🧘", "Quiet time", "Am ciúin"], ["🚌", "Bus", "Bus"]
  ];
})();
