/* Visual timer and First/Then board, shown full-size in the child's view. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var h = null, timerId = null, state = null;

  function stop() { clearInterval(timerId); timerId = null; }
  function fmtLeft(sec) {
    if (sec <= 0) return "";
    if (sec < 60) return CM.t("lessThanMin");
    return CM.t("minutesLeft", { n: Math.ceil(sec / 60) });
  }
  function dial(total, left, small) {
    var deg = Math.max(0, Math.min(360, (left / total) * 360));
    return '<div class="vt' + (small ? " vt-small" : "") + '" role="timer" aria-label="' + esc(fmtLeft(left) || CM.t("timeUp")) + '" style="--deg:' + deg.toFixed(1) + 'deg"><span class="vt-face"></span></div>';
  }
  function act(i) { return CM.ACTIVITIES[i] || CM.ACTIVITIES[0]; }

  // Runs a countdown; calls draw(left) each second and done() at zero.
  function countdown(total, draw, done) {
    stop();
    var end = Date.now() + total * 1000, paused = false, leftAtPause = total;
    state = {
      total: total,
      pause: function () { if (paused) return; paused = true; leftAtPause = Math.max(0, Math.round((end - Date.now()) / 1000)); },
      resume: function () { if (!paused) return; paused = false; end = Date.now() + leftAtPause * 1000; },
      paused: function () { return paused; },
      left: function () { return paused ? leftAtPause : Math.max(0, Math.round((end - Date.now()) / 1000)); }
    };
    draw(total);
    timerId = setInterval(function () {
      var left = state.left(); draw(left);
      if (left <= 0) { stop(); done(); }
    }, 1000);
  }
  function ending() {
    h.tones([659.25, 523.25], 0.45);
    h.say(CM.t("timeUp"));
  }

  CM.tools = {
    init: function (helpers) { h = helpers; },
    active: function () { return !!state || !!h.stage.querySelector(".ft, .vt"); },
    stop: function () { stop(); state = null; },

    timer: function (minutes) {
      var total = Math.round(minutes * 60), stage = h.stage;
      h.enter();
      stage.innerHTML = '<p class="label">' + esc(CM.t("now")) + '</p><div id="vtWrap"></div><p class="vt-left" id="vtLeft"></p>' +
        '<div class="row"><button class="small-btn" type="button" id="vtPause">Pause</button><button class="small-btn" type="button" id="vtStop">Close timer</button></div>';
      var draw = function (left) { $("vtWrap").innerHTML = dial(total, left); $("vtLeft").textContent = fmtLeft(left); };
      countdown(total, draw, function () {
        ending();
        $("vtLeft").textContent = CM.t("timeUp");
        $("vtPause").hidden = true; $("vtStop").textContent = CM.t("ok");
      });
      $("vtPause").onclick = function () {
        if (state.paused()) { state.resume(); this.textContent = "Pause"; } else { state.pause(); this.textContent = "Resume"; }
      };
      $("vtStop").onclick = function () { CM.tools.stop(); h.exit(); };
    },

    board: function (cfg) {
      var stage = h.stage, F = act(cfg.first), Tn = act(cfg.then), firstDone = false;
      h.enter();
      var render = function () {
        stage.innerHTML =
          '<div class="ft">' +
            '<div class="ftc' + (firstDone ? " done" : " now") + '"><p class="label">' + esc(CM.t("first")) + '</p><div class="fte" aria-hidden="true">' + F[0] + "</div><b>" + esc(CM.nm(F)) + "</b>" +
              (firstDone ? '<span class="ftdone">✓ ' + esc(CM.t("firstDone")) + "</span>" : cfg.minutes ? '<div id="ftTimer"></div><p class="vt-left" id="vtLeft"></p>' : "") + "</div>" +
            '<div class="ftarrow" aria-hidden="true">→</div>' +
            '<div class="ftc' + (firstDone ? " now" : "") + '"><p class="label">' + esc(CM.t("thenWord")) + '</p><div class="fte" aria-hidden="true">' + Tn[0] + "</div><b>" + esc(CM.nm(Tn)) + "</b></div>" +
          "</div>" +
          '<div class="row">' + (firstDone ? (cfg.then === 0 ? '<button class="big-btn" type="button" id="ftPlay">' + esc(CM.t("start")) + "</button>" : "")
            : '<button class="big-btn" type="button" id="ftDone">✓ ' + esc(CM.t("firstDone")) + "</button>") +
          '<button class="small-btn" type="button" id="ftClose">Close board</button></div>';
        if ($("ftDone")) $("ftDone").onclick = function () { firstDone = true; CM.tools.stop(); render(); h.say(CM.t("thenWord") + ": " + CM.nm(Tn)); };
        if ($("ftPlay")) $("ftPlay").onclick = function () { CM.tools.stop(); h.exit(); };
        $("ftClose").onclick = function () { CM.tools.stop(); h.exit(); };
      };
      render();
      h.say(CM.t("first") + ": " + CM.nm(F) + ". " + CM.t("thenWord") + ": " + CM.nm(Tn) + ".");
      if (cfg.minutes) {
        var total = cfg.minutes * 60;
        countdown(total, function (left) {
          var w = $("ftTimer"); if (w) w.innerHTML = dial(total, left, true);
          var l = $("vtLeft"); if (l) l.textContent = fmtLeft(left);
        }, function () { ending(); var l = $("vtLeft"); if (l) l.textContent = CM.t("timeUp"); });
      }
    }
    ,
    // Visual schedule: every step in order, "Now" and "Next" marked, Done moves on.
    schedule: function (list) {
      var stage = h.stage, i = 0;
      list = (list || []).slice(0, 8);
      if (!list.length) return;
      h.enter();
      var render = function () {
        var finished = i >= list.length;
        stage.innerHTML = '<p class="label">' + esc(CM.t("myDay")) + "</p>" +
          '<ol class="sched">' + list.map(function (ai, k) {
            var a = act(ai), state = k < i ? " done" : k === i ? " now" : "";
            var tag = k < i ? '<span class="ftdone">✓ ' + esc(CM.t("stepDone")) + "</span>" : k === i ? '<span class="sc-tag">' + esc(CM.t("now")) + "</span>" : k === i + 1 ? '<span class="sc-tag next">' + esc(CM.t("next")) + "</span>" : "";
            return '<li class="sc' + state + '"' + (k === i ? ' aria-current="step"' : "") + '><span class="sce" aria-hidden="true">' + a[0] + "</span><b>" + esc(CM.nm(a)) + "</b>" + tag + "</li>";
          }).join("") + "</ol>" +
          (finished ? '<p class="sc-end">' + esc(CM.t("dayDone")) + "</p>" : "") +
          '<div class="row">' + (finished ? '<button class="big-btn" type="button" id="scOk">' + esc(CM.t("ok")) + "</button>"
            : '<button class="big-btn" type="button" id="scDone">✓ ' + esc(CM.t("stepDone")) + "</button>") +
          (i > 0 ? '<button class="small-btn" type="button" id="scBack">Back a step</button>' : "") +
          '<button class="small-btn" type="button" id="scClose">Close schedule</button></div>';
        var cur = stage.querySelector(".sc.now"); if (cur && cur.scrollIntoView) try { cur.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {}
        if ($("scDone")) $("scDone").onclick = function () {
          i++; render();
          if (i < list.length) h.say(CM.t("now") + ": " + CM.nm(act(list[i])) + "."); else { h.tones([523.25, 659.25], 0.35); h.say(CM.t("dayDone")); }
          var b = $("scDone") || $("scOk"); if (b) b.focus();
        };
        if ($("scBack")) $("scBack").onclick = function () { i = Math.max(0, i - 1); render(); };
        if ($("scOk")) $("scOk").onclick = function () { h.exit(); };
        $("scClose").onclick = function () { h.exit(); };
      };
      render();
      h.say(CM.t("myDay") + ". " + CM.t("now") + ": " + CM.nm(act(list[0])) + ".");
    }
  };
  function $(id) { return document.getElementById(id); }
})();
