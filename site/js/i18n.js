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
      sayDone: "All done. Great work.", sayDoneCalm: "All done."
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
      sayDone: "Críochnaithe. Obair iontach.", sayDoneCalm: "Críochnaithe."
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
    ["🎵", "Music", "Ceol"], ["🚽", "Toilet", "Leithreas"], ["🧹", "Tidy up", "Glan suas"], ["🤗", "Hug", "Barróg"]
  ];
})();
