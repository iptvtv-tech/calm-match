/* Token board, the child's sticker book, breaks and the calm corner.
   Tokens are only ever earned, never taken away. No streaks, no lost days, no surprise prizes. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc, t = function (k, v) { return CM.t(k, v); };
  var $ = function (id) { return document.getElementById(id); };
  var h = null, timers = [];
  var S = function () { return CM.store.S(); };
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
  function stop() { timers.forEach(function (id) { clearTimeout(id); clearInterval(id); }); timers = []; }
  function calm() { return S().calm || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }

  function tokenPic() { return S().tokenIcon === "theme" ? CM.theme().items[0][0] : "⭐"; }

  CM.rewards = {
    init: function (helpers) { h = helpers; },
    stop: stop,

    /* ---------- token board ---------- */
    renderStrip: function () {
      var el = $("tokens"); if (!el) return;
      var goal = S().tokens;
      if (!goal) { el.hidden = true; return; }
      var k = CM.lib.kid(), r = CM.ref(k.reward), n = Math.min(k.tokens, goal), dots = "";
      for (var i = 0; i < goal; i++) dots += '<span class="tok' + (i < n ? " on" : "") + '">' + (i < n ? tokenPic() : "") + "</span>";
      el.hidden = false;
      el.innerHTML = '<span class="tok-label">' + esc(t("workingFor")) + '</span><span class="tok-row" role="img" aria-label="' + esc(n + " / " + goal) + '">' + dots + '</span><span class="tok-arrow" aria-hidden="true">→</span><span class="tok-reward">' + r.html + "<b>" + esc(r.name) + "</b></span>";
    },
    // One token. Returns true when the board is now full.
    earn: function (why) {
      var goal = S().tokens; if (!goal) return false;
      var k = CM.lib.kid(); k.tokens = Math.min(goal, k.tokens + 1); CM.lib.save();
      this.renderStrip();
      var el = $("tokens"); if (el && !calm()) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
      return k.tokens >= goal;
    },
    full: function () { var goal = S().tokens; return !!goal && CM.lib.kid().tokens >= goal; },
    rewardScreen: function (onDone) {
      var k = CM.lib.kid(), r = CM.ref(k.reward);
      h.stage.innerHTML = '<p class="label">' + esc(t("earned")) + '</p><div class="reward-pic">' + r.html + '</div><h1 class="say">' + esc(t("timeFor", { reward: r.name })) + "</h1>" +
        '<button class="big-btn" id="rwOk" type="button">' + esc(t("ok")) + "</button>";
      h.tones([523.25, 659.25, 783.99], 0.2); h.say(t("earned") + " " + t("timeFor", { reward: r.name }));
      $("rwOk").onclick = function () { k.tokens = 0; CM.lib.save(); CM.rewards.renderStrip(); onDone(); };
      $("rwOk").focus();
    },

    /* ---------- the child's sticker book ---------- */
    stickerBook: function (onClose) {
      var st = CM.store.P().stickers;
      h.stage.innerHTML = '<h1 class="say">' + esc(t("myStickers")) + "</h1>" +
        (st.length ? '<div class="stickers book big">' + st.map(function (s) { return "<span>" + s + "</span>"; }).join("") + "</div>" : '<p class="sub">' + esc(t("noStickers")) + "</p>") +
        '<button class="big-btn" id="sbClose" type="button">' + esc(t("close")) + "</button>";
      $("sbClose").onclick = onClose; $("sbClose").focus();
      h.say(t("myStickers"));
    },

    /* ---------- breaks and the calm corner ----------
       opts: { timer: minutes (0 = none), title, onReady (shows "I'm ready"), onClose (calm corner) } */
    breakScreen: function (opts) {
      stop();
      var title = opts.title || t("breakChoose");
      var kinds = [["breathe", "🎈", t("brBreathe")], ["bubbles", "🔵", t("brBubbles")], ["music", "🎵", t("brMusic")], ["quiet", "🌙", t("brQuiet")]];
      h.stage.innerHTML = '<p class="label">' + esc(opts.label || t("breakLabel")) + '</p><h1 class="say">' + esc(title) + "</h1>" +
        '<div class="options brk" role="group" aria-label="' + esc(title) + '">' + kinds.map(function (k) { return '<button type="button" class="opt brk-opt" data-k="' + k[0] + '"><span aria-hidden="true">' + k[1] + "</span><b>" + esc(k[2]) + "</b></button>"; }).join("") + "</div>" +
        '<div class="row">' + (opts.onReady ? '<button class="ghost-btn" id="brReady" type="button">' + esc(t("ready")) + "</button>" : "") + (opts.onClose ? '<button class="ghost-btn" id="brClose" type="button">' + esc(t("close")) + "</button>" : "") + "</div>";
      h.say(title);
      h.stage.querySelectorAll("[data-k]").forEach(function (b) { b.onclick = function () { activity(b.dataset.k, opts); }; });
      if ($("brReady")) $("brReady").onclick = function () { stop(); opts.onReady(); };
      if ($("brClose")) $("brClose").onclick = function () { stop(); opts.onClose(); };
    }
  };

  function activity(kind, opts) {
    stop();
    var total = (opts.timer || 0) * 60, end = Date.now() + total * 1000, warned = false;
    var foot = '<div class="brk-foot"><div id="brTimer"></div><p class="vt-left" id="brLeft"></p>' +
      '<div class="row">' + (opts.onReady ? '<button class="big-btn" id="brReady" type="button">' + esc(t("ready")) + "</button>" : "") +
      '<button class="small-btn" id="brOther" type="button">' + esc(t("back")) + "</button>" + (opts.onClose ? '<button class="small-btn" id="brClose" type="button">' + esc(t("close")) + "</button>" : "") + "</div></div>";
    var body = "";
    if (kind === "breathe") body = '<div class="balloon-wrap"><div class="balloon' + (calm() ? " still" : "") + '" id="balloon" aria-hidden="true"></div></div><h1 class="say" id="brSay">' + esc(t("balloonIn")) + "</h1>";
    if (kind === "bubbles") body = '<h1 class="say">' + esc(t("popBubbles")) + '</h1><div class="bubbles" id="bubbles" role="group" aria-label="' + esc(t("popBubbles")) + '"></div>';
    if (kind === "music") body = '<h1 class="say">' + esc(t("brMusic")) + '</h1><div class="notes' + (calm() ? " still" : "") + '" aria-hidden="true"><span>🎵</span><span>🎶</span><span>🎵</span></div>' + (S().sound ? "" : '<p class="sub">🔇</p>');
    if (kind === "quiet") body = '<div class="quiet-moon" aria-hidden="true">🌙</div><h1 class="say">' + esc(t("quietTime")) + "</h1>";
    h.stage.innerHTML = body + foot;
    document.body.classList.toggle("dim", kind === "quiet");
    var leave = function (fn) { stop(); document.body.classList.remove("dim"); fn(); };
    $("brOther").onclick = function () { leave(function () { CM.rewards.breakScreen(opts); }); };
    if ($("brReady")) $("brReady").onclick = function () { leave(opts.onReady); };
    if ($("brClose")) $("brClose").onclick = function () { leave(opts.onClose); };

    if (kind === "breathe") {
      var inhale = true; h.say(t("balloonIn"));
      every(function () { inhale = !inhale; var b = $("balloon"), s = $("brSay"); if (!b) return; b.classList.toggle("out", !inhale); s.textContent = inhale ? t("balloonIn") : t("balloonOut"); }, 4000);
    }
    if (kind === "bubbles") {
      var area = $("bubbles"), n = 0;
      var add = function () {
        if (!area || area.children.length >= 7) return;
        var b = document.createElement("button"); b.type = "button"; b.className = "bubble" + (calm() ? " still" : "");
        b.setAttribute("aria-label", t("brBubbles") + " " + (++n));
        b.style.left = (5 + Math.random() * 78) + "%"; b.style.top = (5 + Math.random() * 70) + "%"; b.style.setProperty("--d", (5 + Math.random() * 4).toFixed(1) + "s");
        b.onclick = function () { h.tones([660 + Math.random() * 300], 0, 0.05); b.classList.add("pop"); later(function () { b.remove(); }, 250); };
        area.appendChild(b);
      };
      for (var i = 0; i < 5; i++) add();
      every(add, 1500);
    }
    if (kind === "music") {
      var scale = [261.63, 293.66, 329.63, 392, 440, 523.25];
      every(function () { h.tones([scale[Math.floor(Math.random() * scale.length)]], 0, 0.05); }, 1300);
    }
    if (kind === "quiet") h.say(t("quietTime"));
    if (total) {
      var draw = function () {
        var left = Math.max(0, Math.round((end - Date.now()) / 1000)), deg = Math.max(0, Math.min(360, left / total * 360));
        var w = $("brTimer"); if (w) w.innerHTML = '<div class="vt vt-small" role="timer" aria-label="' + esc(left > 60 ? t("minutesLeft", { n: Math.ceil(left / 60) }) : t("lessThanMin")) + '" style="--deg:' + deg.toFixed(1) + 'deg"><span class="vt-face"></span></div>';
        if (left <= 60 && !warned && total > 60) { warned = true; var l = $("brLeft"); if (l) l.textContent = t("oneMinute"); if (CM.timerSoundOn && CM.timerSoundOn()) { h.tones([587.33], 0, 0.08); h.say(t("oneMinute")); } }
        if (left <= 0) {
          stop(); document.body.classList.remove("dim");
          var l2 = $("brLeft"); if (l2) l2.textContent = t("breakOver"); if (!CM.timerSoundOn || CM.timerSoundOn()) { h.tones([659.25, 523.25], 0.45); h.say(t("breakOver")); }
          var r = $("brReady"); if (r) r.focus();
        }
      };
      draw(); every(draw, 1000);
    }
  }
})();
