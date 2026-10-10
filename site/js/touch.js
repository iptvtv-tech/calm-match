/* Touch layer for the child-facing buttons.
   Phones and tablets treat a held finger as a long-press (zoom, magnifier, text selection, "save image")
   and a slow second tap as double-tap zoom, so some children's taps never reach the game.
   This file stops those gestures on the game area and turns touches into answers in the way the parent chose:

     instant  the answer is chosen the moment a finger lands, however long it stays down (default)
     hold     the finger rests on a picture while a ring fills; the answer is chosen when the ring is full
     release  the picture under the finger when it lifts is chosen, even if the finger slid there

   A short cool-down after each answer ignores bouncing or repeated taps.
   Keyboard, switch and screen-reader activation are untouched: they still arrive as ordinary clicks. */
(function () {
  "use strict";
  var CM = window.CM;

  // Buttons the child uses. The grown-ups button keeps its own press-and-hold gate.
  var TARGETS = "#stage button, #breakBtn, #talkBtn, #talk button, .touch-try";
  var AREA = "#stage, #breakBtn, #talkBtn, #talk, .touch-try";

  CM.TOUCH_DEFAULTS = { touchMode: "instant", holdMs: 800, cooldownMs: 500 };
  CM.TOUCH_MODES = ["instant", "hold", "release"];
  CM.HOLD_CHOICES = [500, 800, 1200, 1600];
  CM.COOLDOWN_CHOICES = [0, 300, 500, 800, 1200];

  function settings() {
    var s = CM.store && CM.store.S ? CM.store.S() : {}, d = CM.TOUCH_DEFAULTS;
    return {
      mode: CM.TOUCH_MODES.indexOf(s.touchMode) >= 0 ? s.touchMode : d.touchMode,
      holdMs: +s.holdMs || d.holdMs,
      cooldownMs: s.cooldownMs == null ? d.cooldownMs : +s.cooldownMs
    };
  }

  var g = null;            // the gesture in progress: { id, el, mode, raf, start }
  var lastFire = -1e9;     // when the layer last chose an answer
  var guardUntil = 0;      // native clicks from a handled gesture are dropped until this time
  var firing = false;      // true while the layer's own click is being dispatched

  function target(el) {
    var b = el && el.closest ? el.closest(TARGETS) : null;
    return b && !b.disabled && !b.hidden ? b : null;
  }
  function under(x, y) { return target(document.elementFromPoint(x, y)); }

  function fire(el) {
    if (!el || !el.isConnected || el.disabled) return;
    lastFire = performance.now();
    firing = true;
    try { el.click(); } finally { firing = false; }
  }

  /* ----- visuals: the hold ring and the "armed" outline ----- */
  function setRing(el, p) { if (el) el.style.setProperty("--hold", (Math.round(p * 1000) / 10) + "%"); }
  function clearMarks(el) {
    if (!el) return;
    el.classList.remove("cm-holding", "cm-armed");
    el.style.removeProperty("--hold");
  }
  function endGesture() {
    if (!g) return;
    if (g.raf) cancelAnimationFrame(g.raf);
    clearMarks(g.el);
    g = null;
  }

  function holdStep() {
    if (!g || g.mode !== "hold") return;
    var p = Math.min(1, (performance.now() - g.start) / g.holdMs);
    setRing(g.el, p);
    if (p >= 1) { var el = g.el; endGesture(); fire(el); return; }
    g.raf = requestAnimationFrame(holdStep);
  }

  /* ----- pointer handling (capture phase, so it runs before the games' own handlers) ----- */
  document.addEventListener("pointerdown", function (e) {
    if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    var el = target(e.target);
    if (!el) return;
    var s = settings(), now = performance.now();
    guardUntil = Infinity;                 // every native click from this gesture is ours to drop
    e.preventDefault();                    // no text selection, no focus jump, no compatibility mouse events
    endGesture();
    if (now - lastFire < s.cooldownMs) return;   // bounce or repeat tap: ignore quietly
    if (s.mode === "instant") { fire(el); return; }
    g = { id: e.pointerId, el: el, mode: s.mode, start: now, holdMs: s.holdMs, raf: 0 };
    if (s.mode === "hold") { el.classList.add("cm-holding"); setRing(el, 0); g.raf = requestAnimationFrame(holdStep); }
    else el.classList.add("cm-armed");
  }, { capture: true, passive: false });

  document.addEventListener("pointermove", function (e) {
    if (!g || e.pointerId !== g.id) return;
    var el = under(e.clientX, e.clientY);
    if (g.mode === "hold") {
      if (el !== g.el) endGesture();      // slid off the picture: start again by resting on one
    } else if (el !== g.el) {
      clearMarks(g.el); g.el = el;
      if (el) el.classList.add("cm-armed");
    }
  }, { capture: true, passive: true });

  function lift(e) {
    if (!g || e.pointerId !== g.id) { if (guardUntil === Infinity) guardUntil = performance.now() + 700; return; }
    // Release mode: whatever picture is under the finger as it lifts. Lifting off every picture chooses nothing.
    var el = g.mode === "release" && e.type === "pointerup" ? under(e.clientX, e.clientY) : null;
    endGesture();
    guardUntil = performance.now() + 700;
    if (el) fire(el);
  }
  document.addEventListener("pointerup", lift, true);
  document.addEventListener("pointercancel", lift, true);

  // Drop the browser's own click after a gesture the layer handled, wherever it lands
  // (the screen may have changed under the finger). Clicks with no pointer before them are let through.
  document.addEventListener("click", function (e) {
    if (firing) return;
    if (performance.now() < guardUntil && e.target.closest && e.target.closest(AREA)) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);

  // Long-press menus ("save image", "copy") on the game area.
  document.addEventListener("contextmenu", function (e) { if (e.target.closest && e.target.closest(AREA)) e.preventDefault(); }, true);
  // iPad/iPhone pinch-zoom while a child is playing. The grown-ups area can still be zoomed.
  ["gesturestart", "gesturechange"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var panel = document.getElementById("panel");
      if (document.body.classList.contains("play") && (!panel || panel.hidden)) e.preventDefault();
    }, { passive: false });
  });
  // Images inside answers can't be dragged out.
  document.addEventListener("dragstart", function (e) { if (e.target.closest && e.target.closest(AREA)) e.preventDefault(); }, true);

  // If the page is hidden mid-hold (screen locks, app switch), forget the gesture.
  document.addEventListener("visibilitychange", function () { if (document.hidden) endGesture(); });

  CM.touch = {
    apply: function () { document.body.dataset.touch = settings().mode; },
    describe: function (mode) {
      return mode === "hold" ? "Rest a finger on a picture until the ring fills."
        : mode === "release" ? "The picture under the finger is chosen when it lifts, even after sliding."
        : "Chosen the moment a finger touches. Holding still counts as one tap.";
    }
  };
})();
