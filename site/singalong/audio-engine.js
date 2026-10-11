/*
 * Calm Match — Sing Along audio engine
 *
 * Plays a song's notes with the Web Audio API: a soft sine tone with a quiet
 * octave overtone, shaped by a gain envelope so notes never click.
 * Nothing is downloaded and no network request is made.
 *
 * Timing uses the standard "lookahead" pattern: a short timer schedules notes
 * ~150 ms ahead on the audio clock (sample-accurate), and a requestAnimationFrame
 * loop fires onNote(index) when each scheduled note actually starts sounding,
 * so the lyric highlight and the sound stay locked together at any tempo.
 *
 * Usage:
 *   var engine = new SingAlongEngine({ bpm: 96, onNote: fn, onEnd: fn, onStateChange: fn });
 *   engine.load(song.notes);      // [["C4", 1], ["G4", 2], ...]  (note, beats)
 *   engine.play(); engine.pause(); engine.toggle(); engine.restart(); engine.stop();
 *   engine.setTempo(80);          // takes effect from the next note
 *   engine.setLoop(true);
 *   engine.state                  // "stopped" | "playing" | "paused"
 */
(function (global) {
  'use strict';

  var SEMITONES = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6,
                    Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

  // "C4" -> 261.63. Numbers pass through as Hz. "rest" (or null) -> 0 (silence).
  function noteToFreq(n) {
    if (typeof n === 'number') return n;
    if (n === null || n === 'rest') return 0;
    var m = /^([A-G](?:#|b)?)(-?\d)$/.exec(n);
    if (!m || !(m[1] in SEMITONES)) throw new Error('SingAlongEngine: unknown note "' + n + '"');
    var midi = (parseInt(m[2], 10) + 1) * 12 + SEMITONES[m[1]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  var LOOKAHEAD = 0.15;    // seconds of audio scheduled in advance
  var TICK_MS = 25;        // scheduler interval
  var START_DELAY = 0.06;  // small gap before the first note
  function noop() {}

  function Engine(o) {
    o = o || {};
    this.bpm = o.bpm || 96;
    this.loop = !!o.loop;
    this.loopGapBeats = o.loopGapBeats == null ? 2 : o.loopGapBeats;
    this.volume = o.volume == null ? 0.2 : o.volume;
    this.onNote = o.onNote || noop;
    this.onEnd = o.onEnd || noop;
    this.onStateChange = o.onStateChange || noop;
    this.state = 'stopped';

    this._ctx = null;
    this._master = null;
    this._notes = [];
    this._next = 0;
    this._nextTime = 0;
    this._endTime = 0;
    this._events = [];
    this._voices = [];
    this._timer = null;
    this._raf = null;
    this._tick = this._tick.bind(this);
    this._dispatch = this._dispatch.bind(this);
  }

  Engine.prototype.load = function (notes) {
    this.stop();
    this._notes = notes.map(function (n) {
      var name = Array.isArray(n) ? n[0] : (n.note != null ? n.note : n.freq);
      var beats = Array.isArray(n) ? n[1] : (n.beats != null ? n.beats : 1);
      return { freq: noteToFreq(name), beats: beats == null ? 1 : beats };
    });
  };

  Engine.prototype.play = function () {
    if (!this._notes.length || this.state === 'playing') return;
    this._ensureCtx();
    var ctx = this._ctx;
    ctx.resume();
    if (this.state === 'paused') { this._setState('playing'); return; }

    this._next = 0;
    this._nextTime = ctx.currentTime + START_DELAY;
    this._endTime = 0;
    this._events = [];
    this._setState('playing');
    this._timer = setInterval(this._tick, TICK_MS);
    this._tick();
    this._raf = requestAnimationFrame(this._dispatch);
  };

  Engine.prototype.pause = function () {
    if (this.state !== 'playing') return;
    this._ctx.suspend();   // freezes the audio clock, so scheduled notes wait too
    this._setState('paused');
  };

  Engine.prototype.toggle = function () {
    if (this.state === 'playing') this.pause(); else this.play();
  };

  Engine.prototype.stop = function () {
    this._clearTimers();
    var ctx = this._ctx;
    if (ctx) {
      var t = ctx.currentTime, running = ctx.state === 'running';
      this._voices.forEach(function (v) {
        try {
          if (running) {
            v.gain.gain.cancelScheduledValues(t);
            v.gain.gain.setTargetAtTime(0, t, 0.02);   // quick fade, no click
            v.osc.forEach(function (o) { o.stop(t + 0.15); });
          } else {
            v.gain.disconnect();
          }
        } catch (e) { /* voice already finished */ }
      });
    }
    this._voices = [];
    this._events = [];
    this._next = 0;
    this._endTime = 0;
    this._setState('stopped');
  };

  Engine.prototype.restart = function () {
    this.stop();
    this.play();
  };

  Engine.prototype.setTempo = function (bpm) {
    this.bpm = Math.max(30, Math.min(240, +bpm || this.bpm));
  };

  Engine.prototype.setLoop = function (on) {
    this.loop = !!on;
    if (this.loop && this._endTime) {   // song was about to finish: carry on instead
      this._events = this._events.filter(function (e) { return !e.end; });
      this._endTime = 0;
    }
  };

  // ---- internals ----

  Engine.prototype._ensureCtx = function () {
    if (this._ctx) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) throw new Error('SingAlongEngine: Web Audio API not supported');
    // iOS 17+: play even when the ringer switch is on silent
    try { if (global.navigator && navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    var ctx = this._ctx = new AC();
    this._master = ctx.createGain();
    this._master.gain.value = this.volume;
    var soften = ctx.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = 2200;
    this._master.connect(soften);
    soften.connect(ctx.destination);
  };

  Engine.prototype._setState = function (s) {
    if (this.state === s) return;
    this.state = s;
    this.onStateChange(s);
  };

  Engine.prototype._clearTimers = function () {
    if (this._timer) clearInterval(this._timer);
    if (this._raf) cancelAnimationFrame(this._raf);
    this._timer = this._raf = null;
  };

  Engine.prototype._tick = function () {
    if (this.state === 'stopped') return;
    var ctx = this._ctx, horizon = ctx.currentTime + LOOKAHEAD;
    while (this._nextTime < horizon) {
      if (this._next >= this._notes.length) {
        if (this.loop) {
          this._next = 0;
          this._nextTime += this.loopGapBeats * 60 / this.bpm;
          continue;
        }
        if (!this._endTime) {
          this._endTime = this._nextTime;
          this._events.push({ time: this._endTime, end: true });
        }
        break;
      }
      var n = this._notes[this._next], dur = n.beats * 60 / this.bpm;
      if (n.freq > 0) this._voice(n.freq, this._nextTime, dur);
      this._events.push({ time: this._nextTime, index: this._next });
      this._next++;
      this._nextTime += dur;
    }
    var now = ctx.currentTime;
    this._voices = this._voices.filter(function (v) { return v.end > now; });
  };

  Engine.prototype._dispatch = function () {
    if (this.state === 'stopped') return;
    var now = this._ctx.currentTime;
    while (this._events.length && this._events[0].time <= now) {
      var ev = this._events.shift();
      if (ev.end) {             // let the last note ring out naturally
        this._clearTimers();
        this._events = [];
        this._next = 0;
        this._endTime = 0;
        this._setState('stopped');
        this.onEnd();
        return;
      }
      this.onNote(ev.index, this._notes.length);
    }
    this._raf = requestAnimationFrame(this._dispatch);
  };

  Engine.prototype._voice = function (freq, t, dur) {
    var ctx = this._ctx;
    var len = Math.max(0.08, dur * 0.88);   // small gap so repeated notes are distinct
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + 0.025);   // gentle attack
    g.gain.setTargetAtTime(0.55, t + 0.025, 0.18);  // settle
    g.gain.setTargetAtTime(0.0001, t + len, 0.06);  // soft release
    g.connect(this._master);

    var o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = freq;
    o1.connect(g);

    var o2 = ctx.createOscillator();          // faint octave: warmer, music-box feel
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    var g2 = ctx.createGain();
    g2.gain.value = 0.12;
    o2.connect(g2);
    g2.connect(g);

    var stopAt = t + len + 0.4;
    o1.start(t); o2.start(t);
    o1.stop(stopAt); o2.stop(stopAt);
    this._voices.push({ gain: g, osc: [o1, o2], end: stopAt });
  };

  Engine.noteToFreq = noteToFreq;
  global.SingAlongEngine = Engine;
})(window);
