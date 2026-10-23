/* First-time setup for grown-ups: language, nickname and picture, interest theme, and how it should look and sound.
   Shown once on a new device (one untouched "Child 1"), or when a grown-up follows "Set up for my child" (play.html?setup=1).
   If the current child has already played, setup adds a new child instead of changing that one.
   Nothing here is read aloud: it's for the grown-up. Everything stays on this device. */
(function () {
  "use strict";
  var CM = window.CM;
  var AVATARS = ["🙂", "🦊", "🐻", "🐼", "🐯", "🐨", "🦉", "🐳", "🐙", "🦄"];
  var T = {
    en: {
      welcome: "Welcome to Calm Match", forGrown: "A few quick choices for a grown-up. It takes about a minute.",
      step: "Step {n} of {m}", next: "Next", back: "Back", skip: "Skip for now",
      langQ: "Which language should the games use?",
      nameQ: "What should we call your child?", nameNote: "A nickname is fine. Please don't add a full name, age or anything medical. It stays on this device.",
      nickname: "Nickname", avatarQ: "Pick a picture for them", nameNeeded: "Type a nickname first.",
      themeQ: "What do they love?", themeNote: "The games use these pictures. You can add your own photos later.",
      feelQ: "How should it look and sound?",
      presets: { calm: ["Very calm", "No motion, plain words and one quiet tone when an answer is right."],
        standard: ["Standard", "Soft sounds, gentle fades and a soft chime for a right answer."],
        clear: ["Bigger and clearer", "Bigger buttons, high contrast and words read aloud in short, clear phrases."] },
      done: "All set", doneNote: "You can change any of this in the Grown-ups area. There you can also make schedules, stories and a talk board, and record your child's name so the voice can say it.",
      play: "Start playing"
    },
    ga: {
      welcome: "Fáilte go Calm Match", forGrown: "Cúpla rogha thapa do dhuine fásta. Tógann sé thart ar nóiméad.",
      step: "Céim {n} as {m}", next: "Ar aghaidh", back: "Siar", skip: "Ní anois",
      langQ: "Cén teanga a úsáidfidh na cluichí?",
      nameQ: "Cén t-ainm a thabharfaimid ar do pháiste?", nameNote: "Is leor leasainm. Ná cuir ainm iomlán, aois ná aon rud leighis leis. Fanann sé ar an ngléas seo.",
      nickname: "Leasainm", avatarQ: "Roghnaigh pictiúr dóibh", nameNeeded: "Clóscríobh leasainm ar dtús.",
      themeQ: "Cad is breá leo?", themeNote: "Úsáideann na cluichí na pictiúir seo. Is féidir do ghrianghraif féin a chur leis níos déanaí.",
      feelQ: "Cuma agus fuaim",
      presets: { calm: ["An-chiúin", "Gan ghluaiseacht, focail shimplí agus ton ciúin amháin nuair a bhíonn freagra ceart."],
        standard: ["Gnáth", "Fuaimeanna boga agus cling bhog nuair a bhíonn freagra ceart."],
        clear: ["Níos mó agus níos soiléire", "Cnaipí níos mó, codarsnacht ard agus focail á léamh os ard i bhfrásaí gearra soiléire."] },
      done: "Sin é, réidh", doneNote: "Is féidir aon chuid de seo a athrú sa chuid do dhaoine fásta. Is féidir leat sceidil, scéalta agus clár cainte a dhéanamh ansin freisin, agus ainm do pháiste a thaifeadadh ionas gur féidir leis an nguth é a rá.",
      play: "Tosaigh ag imirt"
    }
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); }
  function forced() { try { return new URLSearchParams(location.search).get("setup") === "1"; } catch (e) { return false; } }
  function fresh(p) { return !(p.history && p.history.length) && !(p.stickers && p.stickers.length); }

  CM.setup = {
    // A brand-new device: one untouched child still called "Child 1", and setup not done or skipped.
    needed: function () {
      var db = CM.store.db(), list = CM.store.list();
      if (forced()) return true;
      if (db.app.setupDone) return false;
      var p = CM.store.P();
      return list.length === 1 && p.name === "Child 1" && fresh(p);
    },
    run: function (stage, done) {
      var db = CM.store.db(), P = CM.store.P(), addNew = !fresh(P);
      var d = { lang: addNew ? "en" : P.settings.lang, name: addNew || P.name === "Child 1" ? "" : P.name, avatar: addNew ? AVATARS[1] : P.avatar,
        theme: addNew ? CM.DEFAULTS.theme : P.settings.theme, preset: addNew ? "standard" : CM.presetOf(P.settings) };
      if (d.preset === "custom") d.preset = "standard";
      var step = 0, M = 4;
      try { if (forced()) history.replaceState(null, "", location.pathname); } catch (e) {}
      function finish(skipped) {
        db.app.setupDone = true;
        if (!skipped) {
          var st = addNew ? JSON.parse(JSON.stringify(CM.DEFAULTS)) : P.settings;
          st.lang = d.lang; st.theme = d.theme;
          var pr = CM.PRESETS.filter(function (x) { return x.id === d.preset; })[0]; if (pr) Object.assign(st, pr.set);
          if (addNew) CM.store.add(d.name, d.avatar, st);
          else { P.name = d.name; P.avatar = d.avatar; CM.store.save(); }
        }
        CM.store.persist();
        done();
      }
      function render() {
        var t = T[d.lang === "ga" ? "ga" : "en"], body = "";
        if (step === 0) {
          body = '<h1 class="say">' + esc(t.langQ) + "</h1>" +
            '<div class="su-opts">' + [["en", "English"], ["ga", "Gaeilge"]].map(function (x) {
              return '<button type="button" class="su-opt" data-v="' + x[0] + '" aria-pressed="' + (d.lang === x[0]) + '"><b>' + x[1] + "</b></button>";
            }).join("") + "</div>";
        } else if (step === 1) {
          body = '<h1 class="say">' + esc(t.nameQ) + "</h1>" +
            '<div class="inline-field su-name"><input type="text" id="suName" maxlength="20" autocomplete="off" aria-label="' + esc(t.nickname) + '" placeholder="' + esc(t.nickname) + '" value="' + esc(d.name) + '"></div>' +
            '<p class="sub">' + esc(t.nameNote) + '</p><p class="note su-err" id="suErr" aria-live="polite"></p>' +
            '<p class="label" style="margin-top:6px">' + esc(t.avatarQ) + '</p><div class="chips su-avatars">' + AVATARS.map(function (a) {
              return '<button type="button" class="chip" data-a="' + a + '" aria-pressed="' + (a === d.avatar) + '" aria-label="' + a + '">' + a + "</button>";
            }).join("") + "</div>";
        } else if (step === 2) {
          body = '<h1 class="say">' + esc(t.themeQ) + '</h1><p class="sub">' + esc(t.themeNote) + "</p>" +
            '<div class="su-opts themes">' + Object.keys(CM.THEMES).map(function (k) {
              var th = CM.THEMES[k];
              return '<button type="button" class="su-opt" data-v="' + k + '" aria-pressed="' + (d.theme === k) + '"><span class="su-e" aria-hidden="true">' + th.items[0][0] + "</span>" + esc(d.lang === "ga" && th.ga ? th.ga : th.label) + "</button>";
            }).join("") + "</div>";
        } else if (step === 3) {
          body = '<h1 class="say">' + esc(t.feelQ) + "</h1>" +
            '<div class="su-opts presets">' + CM.PRESETS.map(function (p) {
              return '<button type="button" class="su-opt" data-v="' + p.id + '" aria-pressed="' + (d.preset === p.id) + '"><b>' + esc(t.presets[p.id][0]) + "</b><small>" + esc(t.presets[p.id][1]) + "</small></button>";
            }).join("") + "</div>";
        } else {
          body = '<div class="bigicon" aria-hidden="true">' + esc(d.avatar) + '</div><h1 class="say">' + esc(t.done) + '</h1><p class="sub">' + esc(t.doneNote) + "</p>";
        }
        stage.innerHTML = '<div class="su" data-free>' + (step === 0 ? '<h2 class="su-welcome">' + esc(t.welcome) + '</h2><p class="sub">' + esc(t.forGrown) + "</p>" : "") +
          (step < M ? '<p class="label">' + esc(fill(t.step, { n: step + 1, m: M })) + "</p>" : "") +
          body +
          '<div class="row su-nav">' +
            (step > 0 ? '<button class="ghost-btn" type="button" id="suBack">' + esc(t.back) + "</button>" : "") +
            (step < M ? '<button class="big-btn" type="button" id="suNext">' + esc(t.next) + "</button>" : '<button class="big-btn" type="button" id="suPlay">' + esc(t.play) + "</button>") +
          "</div>" +
          (step < M ? '<button class="small-btn su-skip" type="button" id="suSkip">' + esc(t.skip) + "</button>" : "") + "</div>";
        stage.querySelectorAll(".su-opt").forEach(function (b) {
          b.onclick = function () { var v = b.dataset.v; if (step === 0) d.lang = v; else if (step === 2) d.theme = v; else d.preset = v; render(); var f = stage.querySelector('.su-opt[data-v="' + v + '"]'); if (f) f.focus(); };
        });
        stage.querySelectorAll(".su-avatars .chip").forEach(function (b) { b.onclick = function () { keepName(); d.avatar = b.dataset.a; render(); }; });
        function keepName() { var i = document.getElementById("suName"); if (i) d.name = i.value.trim().slice(0, 20); }
        var nx = document.getElementById("suNext");
        if (nx) nx.onclick = function () {
          if (step === 1) { keepName(); if (!d.name) { document.getElementById("suErr").textContent = t.nameNeeded; document.getElementById("suName").focus(); return; } }
          step++; render(); var h = stage.querySelector("h1"); if (h) { h.tabIndex = -1; h.focus(); }
        };
        var bk = document.getElementById("suBack"); if (bk) bk.onclick = function () { keepName(); step--; render(); };
        var sk = document.getElementById("suSkip"); if (sk) sk.onclick = function () { finish(true); };
        var pl = document.getElementById("suPlay"); if (pl) pl.onclick = function () { finish(false); };
        var nm = document.getElementById("suName"); if (nm) nm.onkeydown = function (e) { if (e.key === "Enter") nx.click(); };
      }
      render();
    }
  };
})();
