/* Recorded voices and family videos. Both stay on this device (js/media.js) and are never uploaded.
   A grown-up records a word, a schedule step or a story page in their own voice; it then plays instead of
   the device's voice. The microphone is only switched on while a grown-up is recording. */
(function () {
  "use strict";
  var CM = window.CM, esc = CM.esc;
  var MAX_SEC = 8, playing = null, rec = null;
  var canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  function lang() { return CM.lang ? CM.lang() : "en"; }
  // Recordings are per language, so an Irish recording plays only when the games are in Irish.
  function refKey(r) { return "voice/" + lang() + "/" + r; }

  CM.voice = {
    canRecord: canRecord,
    refKey: refKey,
    // Play a recording for this picture reference, if there is one. Returns true if it played.
    play: function (r) { return this.playKey(refKey(r)); },
    playKey: function (key) {
      if (!CM.store.S().speech && !CM.store.S().sound) return false;
      if (!CM.media.has(key)) return false;
      try {
        if (playing) { playing.pause(); }
        try { speechSynthesis.cancel(); } catch (e) {}
        playing = new Audio(CM.media.url(key)); playing.play().catch(function () {});
        return true;
      } catch (e) { return false; }
    },
    // A record / play / delete control for the grown-ups area. Call bind(container) after inserting it.
    button: function (key) {
      var has = CM.media.has(key);
      return '<span class="rec" data-key="' + esc(key) + '">' +
        (canRecord ? '<button type="button" class="small-btn rec-go">' + (has ? "Record again" : "🎙 Record") + "</button>" : "") +
        (has ? '<button type="button" class="small-btn rec-play" aria-label="Play recording">▶</button><button type="button" class="small-btn rec-del" aria-label="Delete recording">✕</button>' : "") + "</span>";
    },
    bind: function (box) {
      box.querySelectorAll(".rec").forEach(function (el) {
        var key = el.dataset.key, go = el.querySelector(".rec-go"), pl = el.querySelector(".rec-play"), del = el.querySelector(".rec-del");
        if (pl) pl.onclick = function () { CM.voice.playKey(key) || new Audio(CM.media.url(key)).play().catch(function () {}); };
        if (del) del.onclick = function () { CM.media.del(key).then(function () { el.outerHTML = CM.voice.button(key); CM.voice.bind(box); }); };
        if (go) go.onclick = function () {
          if (rec) { rec.stop(); return; }
          start(key, go, function () { el.outerHTML = CM.voice.button(key); CM.voice.bind(box); }, function (msg) { go.textContent = msg; });
        };
      });
    }
  };

  function start(key, btn, done, fail) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var chunks = [], type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", ""].find(function (x) { return !x || (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x)); });
      rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
      var timer = null, left = MAX_SEC;
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        clearInterval(timer); stream.getTracks().forEach(function (tr) { tr.stop(); }); rec = null;
        var blob = new Blob(chunks, { type: chunks[0] ? chunks[0].type : "audio/webm" });
        if (!blob.size) return fail("Nothing recorded");
        CM.media.put(key, blob).then(function () { CM.media.keep(); done(); }, function (e) { fail(e.message); });
      };
      rec.start();
      btn.textContent = "■ Stop (" + left + ")"; btn.classList.add("recording");
      timer = setInterval(function () { left--; btn.textContent = "■ Stop (" + left + ")"; if (left <= 0 && rec) rec.stop(); }, 1000);
    }).catch(function () { fail("Microphone not allowed"); });
  }

  /* ---------- family videos ---------- */
  var MAX_MB = 40, MAX_VIDEO_SEC = 90;
  CM.video = {
    // Check a chosen clip and save it. Resolves with its media key.
    save: function (file) {
      return new Promise(function (resolve, reject) {
        if (!file || !/^video\//.test(file.type)) return reject(new Error("Please choose a video file."));
        if (file.size > MAX_MB * 1024 * 1024) return reject(new Error("That video is over " + MAX_MB + " MB. Trim it to under a minute and a half, then try again."));
        var v = document.createElement("video"), url = URL.createObjectURL(file);
        v.preload = "metadata"; v.muted = true;
        v.onloadedmetadata = function () {
          URL.revokeObjectURL(url);
          if (isFinite(v.duration) && v.duration > MAX_VIDEO_SEC) return reject(new Error("That video is longer than a minute and a half. Short clips work best."));
          var key = "video/" + CM.uid("v");
          CM.media.put(key, file).then(function () { CM.media.keep(); resolve(key); }, reject);
        };
        v.onerror = function () { URL.revokeObjectURL(url); reject(new Error("This device can't play that video. Try recording it again with the camera.")); };
        v.src = url;
      });
    }
  };
})();
