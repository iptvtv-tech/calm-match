/* Does this device have a voice that can read aloud? Used by the games and the Alphabet book to show
   a short note to grown-ups when read-aloud can't work, instead of leaving them to think the site is broken.

   Browsers don't have voices of their own: they use the device's text-to-speech engine. Some devices have
   none, for example Huawei tablets without Google services and some low-cost Android tablets.
   Two signs of that:
   - the browser lists no voices at all once it has had time to load them;
   - speech is asked for but never starts.
   If speech is ever heard on this page, the device is treated as working, whatever the list says. */
(function () {
  "use strict";
  var CM = (window.CM = window.CM || {});
  var supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var voices = [], checked = false, worked = false, failed = false, listeners = [];
  var WAIT_LIST = 2500, WAIT_START = 3000;

  function load() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  function changed() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }
  if (supported) {
    load();
    try { speechSynthesis.addEventListener("voiceschanged", function () { load(); changed(); }); } catch (e) {}
    // Some browsers fill the list a moment after the page opens.
    setTimeout(function () { load(); checked = true; changed(); }, WAIT_LIST);
  } else { checked = true; }

  CM.speech = {
    supported: supported,
    voices: function () { if (!voices.length && supported) load(); return voices; },
    // "ok", or "none" when this device can't read aloud at all. Irish is checked separately (CM.irishVoice).
    status: function () {
      if (!supported) return "none";
      if (worked) return "ok";
      if (failed) return "none";
      return checked && !this.voices().length ? "none" : "ok";
    },
    // Watch one phrase: if it never starts, the device has no working voice.
    watch: function (u) {
      if (!u || worked) return u;
      var timer = setTimeout(function () {
        var busy = false; try { busy = speechSynthesis.speaking; } catch (e) {}
        if (!worked && !busy) { failed = true; changed(); }
      }, WAIT_START);
      var ok = function () { clearTimeout(timer); if (!worked) { worked = true; failed = false; changed(); } };
      u.addEventListener("start", ok);
      u.addEventListener("end", ok);
      u.addEventListener("error", function (e) {
        // "interrupted" and "canceled" just mean other speech took over; "not-allowed" means no tap yet.
        if (e && /interrupted|canceled|not-allowed/.test(e.error || "")) clearTimeout(timer);
      });
      return u;
    },
    onChange: function (fn) { listeners.push(fn); },
    // The note for grown-ups, in plain words.
    help: {
      en: "This device has no reading voice, so words can't be read aloud here. To add one, open the device's Settings, search for \"text-to-speech\", then choose or download an English voice. If there's no voice to choose, install a free one, such as RHVoice. You can also record words in your own voice in the grown-ups area.",
      ga: "Níl guth léitheoireachta ar an ngléas seo, mar sin ní féidir focail a léamh os ard anseo. Chun ceann a chur leis, oscail Socruithe an ghléis, cuardaigh \"text-to-speech\", agus roghnaigh nó íoslódáil guth. Is féidir leat focail a thaifeadadh i do ghuth féin sa chuid do dhaoine fásta freisin."
    }
  };
})();
