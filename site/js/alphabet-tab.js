/* The Alphabet tab in the grown-ups area: photos for the ready-made words, the family's own words,
   hiding a word a child doesn't like, and recording a word in a grown-up's own voice.
   Everything stays on this device (js/alphabet.js). */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var tabLang = null, tabLetter = "A", pendingFile = null;

  function renderTab(box) {
    var lang = tabLang || (CM.lang ? CM.lang() : "en");
    if (!CM.alpha.hasLetter(lang, tabLetter)) tabLetter = "A";
    var L = tabLetter, words = CM.alpha.words(lang, L, { hidden: true }), own = CM.alpha.ownCount(lang, L);
    var langName = lang === "ga" ? "Irish" : "English";

    box.innerHTML =
      '<div><h3>Alphabet book</h3>' +
      '<p class="note">A calm picture book: one letter at a time, with things that start with it. Your child taps a picture to hear the letter and the word. It follows the language of the games and works in English and Irish. Nothing plays on its own.</p>' +
      '<div class="row start" style="margin-top:10px"><a class="small-btn primary" href="alphabet/?lang=' + lang + "&letter=" + L + '">Open the Alphabet book</a></div></div>' +

      '<div><h3>Words and photos</h3>' +
      '<p class="note">Change a picture to your own photo, hide a word your child doesn\'t like, or add words from your child\'s world, like Mam, their dog\'s name or their favourite cup. Your words also turn up in the Letters game. Words marked 🔊 have a built-in recording, so they are read aloud even on devices with no voice of their own. Words without 🔊, like the words you add, use the device\'s voice, so on a device with no voice they stay silent unless you record them. If you record a word yourself, your recording plays instead. Photos are shrunk and kept on this device only. They are never uploaded, even with an account.</p>' +
      '<div class="chips" id="alLang" role="group" aria-label="Alphabet language">' +
        [["en", "English"], ["ga", "Gaeilge"]].map(function (x) { return '<button type="button" class="chip" data-lang="' + x[0] + '" aria-pressed="' + (x[0] === lang) + '">' + x[1] + "</button>"; }).join("") + "</div>" +
      '<div class="chips" id="alLetters" role="group" aria-label="Letter">' +
        CM.alpha.letters(lang).map(function (x) {
          var n = CM.alpha.ownCount(lang, x);
          return '<button type="button" class="chip" data-l="' + x + '" aria-pressed="' + (x === L) + '"' + (n ? ' aria-label="' + x + ", " + n + ' of your own"' : "") + ">" + x + (n ? " •" : "") + "</button>";
        }).join("") + "</div>" +
      '<h3 style="margin-top:14px">' + L + " in " + langName + "</h3>" +
      '<div class="pslots">' + words.map(function (e, i) {
        var photo = CM.alpha.photo(e);
        return '<div class="pslot' + (e.hidden ? " off" : "") + '">' +
          '<div class="pthumb">' + CM.alpha.picHtml(e) + "</div>" +
          '<span class="pname">' + esc(e.word) + (e.kind === "own" ? " (yours)" : "") + (e.kind === "preset" && CM.alpha.wordClip(lang, e.word) ? ' <span title="Has a built-in recording">🔊</span>' : "") + (e.hidden ? " · hidden" : "") + (e.end ? " · x at the end" : "") + "</span>" +
          '<label class="small-btn pbtn">' + (photo ? "Change photo" : "Add photo") + '<input type="file" accept="image/*" data-ph="' + i + '" class="visually-hidden"></label>' +
          (photo ? '<button type="button" class="small-btn pbtn" data-rmph="' + i + '">' + (e.kind === "own" ? "Remove photo" : "Use emoji") + "</button>" : "") +
          (e.kind === "preset" ? '<button type="button" class="small-btn pbtn" data-hide="' + i + '">' + (e.hidden ? "Show" : "Hide") + "</button>"
            : '<button type="button" class="small-btn danger pbtn" data-del="' + i + '">Delete</button>') +
          (CM.voice ? CM.voice.button(CM.alpha.recKey(e)) : "") +
          "</div>";
      }).join("") + "</div>" +

      '<h3 style="margin-top:16px">Add your own word for ' + L + "</h3>" +
      (own >= CM.alpha.MAX_OWN ? '<p class="note">You have ' + CM.alpha.MAX_OWN + " of your own words for " + L + ", which is the most for one letter. Delete one to add another.</p>" :
        '<div class="inline-field"><input type="text" id="alNew" maxlength="30" placeholder="' + (lang === "ga" ? "For example, " + (L === "M" ? "Mamaí" : "a word starting with " + L) : "For example, " + (L === "D" ? "Daddy" : L === "M" ? "Mam" : "a word starting with " + L)) + '" aria-label="New word for ' + L + '">' +
        '<label class="small-btn pbtn" id="alFileLbl">' + (pendingFile ? "Photo chosen ✓" : "Choose a photo") + '<input type="file" accept="image/*" id="alFile" class="visually-hidden"></label>' +
        '<button class="small-btn primary" type="button" id="alAdd">Add</button></div>' +
        '<p class="note">Type the word on its own (dog, not the dog), starting with ' + L + ". The photo is optional. Up to " + CM.alpha.MAX_OWN + " of your own words for each letter. Please don't use photos that show a child's full name or school crest.</p>") +
      '<p class="note" id="alMsg" aria-live="polite"></p><div id="alFix"></div></div>';

    var msg = box.querySelector("#alMsg"), rerender = function () { renderTab(box); };
    var say = function (t) { var m = box.querySelector("#alMsg"); if (m) m.textContent = t; };

    box.querySelectorAll("#alLang .chip").forEach(function (b) { b.onclick = function () { tabLang = b.dataset.lang; pendingFile = null; rerender(); }; });
    box.querySelectorAll("#alLetters .chip").forEach(function (b) { b.onclick = function () { tabLetter = b.dataset.l; pendingFile = null; rerender(); }; });

    box.querySelectorAll("input[data-ph]").forEach(function (inp) {
      inp.onchange = function () {
        var e = words[+inp.dataset.ph], f = inp.files && inp.files[0]; if (!f) return;
        msg.textContent = "Saving…";
        CM.alpha.setPhoto(e, f).then(function () { rerender(); say("Saved a photo for " + e.word + "."); }).catch(function (x) { say(x.message); });
      };
    });
    box.querySelectorAll("[data-rmph]").forEach(function (b) {
      b.onclick = function () { var e = words[+b.dataset.rmph]; CM.alpha.removePhoto(e).then(function () { rerender(); say(e.kind === "own" ? "Photo removed." : e.word + " shows its emoji again."); }); };
    });
    box.querySelectorAll("[data-hide]").forEach(function (b) {
      b.onclick = function () { var e = words[+b.dataset.hide]; CM.alpha.setHidden(e, !e.hidden); rerender(); say(e.hidden ? e.word + " is back in the book and the games." : e.word + " is hidden from the book and the games."); };
    });
    // Delete takes two taps, so a family word isn't lost by accident.
    box.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var e = words[+b.dataset.del];
        if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Tap again to delete"; return; }
        CM.alpha.removeOwn(e).then(function () { rerender(); say("Deleted " + e.word + "."); });
      };
    });
    if (CM.voice) CM.voice.bind(box);

    var file = box.querySelector("#alFile");
    if (file) file.onchange = function () { pendingFile = file.files && file.files[0] || null; var l = box.querySelector("#alFileLbl"); if (l) l.firstChild.nodeValue = pendingFile ? "Photo chosen ✓" : "Choose a photo"; };
    var add = box.querySelector("#alAdd"), input = box.querySelector("#alNew");
    function addTo(letter, word) {
      say("Saving…");
      var f = pendingFile;
      CM.alpha.addOwn(lang, letter, word, f).then(function () {
        pendingFile = null; tabLetter = letter; rerender(); say("Added " + word.trim() + " to " + letter + ".");
      }).catch(function (x) { pendingFile = null; tabLetter = letter; rerender(); say("Added " + word.trim() + ", but the photo couldn't be saved: " + x.message); });
    }
    if (add) {
      add.onclick = function () {
        var w = input.value, problem = CM.alpha.check(lang, L, w), fix = box.querySelector("#alFix");
        fix.innerHTML = "";
        if (!problem) return addTo(L, w);
        say(problem.msg);
        // Offer to put the word on the page it starts with, if that page has room.
        if (problem.letter && !CM.alpha.check(lang, problem.letter, w)) {
          fix.innerHTML = '<div class="row start"><button type="button" class="small-btn primary" id="alMove">Put it on the ' + problem.letter + ' page</button></div>';
          fix.querySelector("#alMove").onclick = function () { addTo(problem.letter, w); };
        }
      };
      input.onkeydown = function (e) { if (e.key === "Enter") add.click(); };
    }
  }

  CM.alpha.renderTab = renderTab;
})();
