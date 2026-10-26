#!/usr/bin/env python3
"""Built-in recordings for the Alphabet book: letters and words in English and Irish.

Every clip is a short MP3 in site/audio/<lang>/{letters,words,phrases}/, listed in site/audio/manifest.json.
The site plays a clip when one exists and falls back to the device's voice when it doesn't, so a language
can be recorded a bit at a time.

Commands (run from the repo root):
  python3 tools/audio/build.py script  [--lang en|ga]          what to record: a printable list + CSV
  python3 tools/audio/build.py kokoro  --lang en [--voice bf_emma] [--only LIST] [--force]
                                                               make clips with the Kokoro open-licence voice
  python3 tools/audio/build.py import  --lang en FOLDER        turn a person's recordings into clips
  python3 tools/audio/build.py manifest                        rebuild site/audio/manifest.json
  python3 tools/audio/build.py check                           list missing and left-over clips

Recordings from a person: name each file after the "file" column of the script (for example bee.m4a,
letter-b.m4a, ends-with-x.m4a), any common audio format, and run `import`. Every clip, made or recorded,
goes through the same steps: trim silence, level to the same calm loudness, mono MP3.

Kokoro needs the model files and espeak-ng (see tools/audio/README.md); they are not kept in the repo.
"""
import argparse, csv, json, os, re, subprocess, sys, tempfile, unicodedata, wave

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site")
AUDIO = os.path.join(SITE, "audio")
HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.environ.get("CM_TTS_DIR", os.path.join(HERE, ".models"))

# Letter names said the Irish way where it differs: "haitch", and "zed" (espeak already says zed).
LETTER_FIX_EN = {"H": "hˈeɪtʃ"}
PHRASES = {"en": {"ends-with-x": "ends with x."}, "ga": {}}


def slug(w):
    """Same as CM.alpha.slug in site/js/alphabet.js."""
    s = unicodedata.normalize("NFD", str(w))
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "x"


def words():
    """The word lists from site/js/alphabet.js, read with node so there is only one copy of them."""
    js = ("global.window={};window.CM={};eval(require('fs').readFileSync(%r,'utf8'));"
          "const A=window.CM.alpha;process.stdout.write(JSON.stringify({words:A.WORDS,letters:{en:A.letters('en'),ga:A.letters('ga')}}))"
          % os.path.join(SITE, "js", "alphabet.js"))
    return json.loads(subprocess.check_output(["node", "-e", js]))


def items(lang):
    """Every clip a language needs: {kind, key, text, path, file}."""
    data, out, seen = words(), [], set()
    for L in data["letters"][lang]:
        out.append({"kind": "letter", "key": L, "text": L, "path": "%s/letters/%s.mp3" % (lang, L.lower()), "file": "letter-" + L.lower()})
    for L in data["letters"][lang]:
        for it in data["words"][lang].get(L, []):
            s = slug(it[1])
            if s in seen: continue  # fox is on F and on X: one clip
            seen.add(s)
            out.append({"kind": "word", "key": s, "text": it[1], "path": "%s/words/%s.mp3" % (lang, s), "file": s})
    for k, text in PHRASES.get(lang, {}).items():
        out.append({"kind": "phrase", "key": k, "text": text, "path": "%s/phrases/%s.mp3" % (lang, k), "file": k})
    # Everything else the site says: the pieces listed by tools/audio/harvest.js (English only for now).
    lib = os.path.join(HERE, "phrases-%s.json" % lang)
    if os.path.exists(lib):
        for e in json.load(open(lib, encoding="utf8")):
            if e.get("shared"): continue  # letters and alphabet words: the recordings above
            out.append({"kind": "lib", "key": e["key"], "text": e.get("say") or e["text"], "path": e["path"],
                        "file": "lib-" + os.path.basename(e["path"])[:-4], "group": e["group"]})
    # What the Alphabet book says for each card, as one natural phrase: "A for apple", or "fox ends with x".
    # One clip per letter and word (fox is "F for fox" on F and "fox ends with x" on X).
    if lang == "en":
        for L in data["letters"][lang]:
            for it in data["words"][lang].get(L, []):
                s, end = slug(it[1]), len(it) > 2 and it[2] == "end"
                text = ("%s ends with %s" % (it[1], L.lower())) if end else ("%s for %s" % (L, it[1]))
                key = "%s-%s" % (L.lower(), s)
                out.append({"kind": "say", "key": key, "letter": L, "word": it[1], "end": end, "text": text,
                            "path": "%s/say/%s.mp3" % (lang, key), "file": "say-" + key})
    return out


def process(src, dst):
    """Trim silence, level loudness, add a little quiet at each end, save as a small mono MP3."""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    flt = ("silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.02,"
           "areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.05,areverse,"
           "loudnorm=I=-20:TP=-2:LRA=7,afade=t=in:d=0.01,adelay=80:all=1,apad=pad_dur=0.12")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", flt, "-ac", "1", "-ar", "22050",
                    "-c:a", "libmp3lame", "-b:a", "48k", dst], check=True)


def cmd_script(a):
    for lang in ([a.lang] if a.lang else ["en", "ga"]):
        rows = items(lang)
        path = os.path.join(HERE, "script-%s.csv" % lang)
        with open(path, "w", newline="", encoding="utf8") as f:
            w = csv.writer(f); w.writerow(["number", "kind", "say", "file"])
            for i, r in enumerate(rows, 1): w.writerow([i, r["kind"], r["text"], r["file"]])
        print("%s: %d clips -> %s" % (lang, len(rows), os.path.relpath(path, ROOT)))
        for i, r in enumerate(rows, 1): print("  %3d  %-7s %-16s %s" % (i, r["kind"], r["text"], r["file"]))


# Kokoro v1.0 was trained on "misaki" phonemes, which write some sounds as one symbol where espeak-ng uses two.
# Sending espeak's spelling makes it stumble, most of all at the start of a phrase ("A" came out like "za").
# British misaki: A = eɪ (day), I = aɪ (eye), W = aʊ (cow), Y = ɔɪ (boy), Q = əʊ (go), ʤ = dʒ, ʧ = tʃ.
MISAKI_GB = [("dʒ", "ʤ"), ("tʃ", "ʧ"), ("eɪ", "A"), ("aɪ", "I"), ("aʊ", "W"), ("ɔɪ", "Y"), ("əʊ", "Q"), ("eə", "ɛː"), ("ɐ", "ə")]


def misaki(ph):
    for a, b in MISAKI_GB:
        ph = ph.replace(a, b)
    return ph


def phonemes(text, lang):
    """IPA for Kokoro from espeak-ng (taken from the Piper release, see README)."""
    lib = os.path.join(MODELS, "piper")
    out = subprocess.check_output([os.path.join(lib, "espeak-ng"), "--path=" + lib, "-v", "en-gb" if lang == "en" else lang, "-q", "--ipa", text],
                                  env=dict(os.environ, LD_LIBRARY_PATH=lib)).decode("utf8")
    return " ".join(out.split())


def letter_ph(L):
    return LETTER_FIX_EN.get(L) or phonemes(L, "en")


def say_ph(r):
    if r["end"]:
        return phonemes(r["word"], "en") + " ˈɛndz wɪð " + letter_ph(r["letter"]) + "."
    return letter_ph(r["letter"]) + " fɔː " + phonemes(r["word"], "en") + "."


# The voice stumbles on the first and last sounds of a clip: a letter at the start (A, C, I) came out like "z",
# and the last word got an extra hiss or syllable ("apple" sounded like "apples", "horse" like "horses").
# So every clip is spoken inside a carrier, "Now: A for apple. Two.", and the carrier words are cut off using
# the model's own timing for each sound (see onnx_timings.py). Cuts land in the pauses either side.
# The full stop before "Two" matters: with a comma, the voice stayed up as if more was coming and swallowed the
# last sound ("look at" lost its t), so longer sentences sounded clipped.
LEAD_IN = "nˈW: "
TRAIL = ". tˈuː."  # a full stop, so the sentence ends naturally (voice falls, last sound fully said), then "Two."
FRAME = 600  # samples per timing frame at 24 kHz


def ntok(ph, vocab): return sum(1 for c in ph if c in vocab)


def cut_by_timing(audio, dur, n_lead, n_body):
    """dur: frames per token, including the padding token at each end. Keep the body, plus up to 50 ms of
    the pauses either side of it, with short fades."""
    import numpy as np
    d = [int(x) for x in dur]
    start = 0
    if n_lead:
        start = sum(d[:1 + n_lead]) - min(2, d[n_lead])        # into the pause after "Now:"
    body_end = sum(d[:1 + n_lead + n_body]) * FRAME
    nxt = sum(d[:3 + n_lead + n_body]) * FRAME                    # where "two" is due to start
    # The sound runs a little behind the timings (about 0.1 s by the end of a long sentence), so the last word
    # is often still sounding at body_end. Cut instead at the quietest moment just before the "t" of "two":
    # the short silence when the tongue closes for the "t". Search from body_end to just past where "two" is due.
    f = 240
    lo, hi = body_end, min(len(audio) - f, nxt + 3 * FRAME)
    end, best = nxt, None
    for i in range(lo, hi, f // 2):
        e = float(np.sqrt(np.mean(audio[i:i + f] ** 2)))
        if best is None or e < best: best, end = e, i + f // 2
    out = audio[start * FRAME:end].copy()
    f = 240
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    return out


# Sounds that are hissy or have a burst of their own at the end of a word (fox, cat, fish). After any other
# final sound (door, moon, lemon, yellow) a bright hiss at the end of the cut is the breath into the carrier's
# "Two", not part of the word, and it reads as a plural "s" (owner's listening check, 26 Oct 2026).
NOISY_ENDINGS = set("ptkbdgszfvhθðʃʒʧʤ")

def trim_hiss(audio, body):
    """Cut the breath before "Two" off the end of a clip whose word ends in a vowel, nasal, liquid or glide.
    Finds the last 10 ms window that is clearly voiced (energy up, spectral centroid below 3.5 kHz), then
    keeps 20 ms more and fades out. Clips ending in a hiss or stop of their own are left alone."""
    import numpy as np
    last = body.rstrip().rstrip(".").rstrip()[-1:] if body else ""
    if not last or last in NOISY_ENDINGS: return audio
    w = 240                                                         # 10 ms at 24 kHz
    n = min(len(audio), 24000 // 4)                                 # look at the last 250 ms
    peak = float(np.sqrt(np.mean(audio[-n:] ** 2))) + 1e-9
    fr = np.fft.rfftfreq(w, 1 / 24000)
    voiced_end = None
    for i in range(len(audio) - w, len(audio) - n, -w):
        seg = audio[i:i + w]
        rms = float(np.sqrt(np.mean(seg ** 2)))
        if rms < 0.6 * peak: continue
        sp = np.abs(np.fft.rfft(seg * np.hanning(w)))
        if (sp * fr).sum() / (sp.sum() + 1e-9) < 3500: voiced_end = i + w; break
    if voiced_end is None or voiced_end + 2 * w >= len(audio): return audio
    end = voiced_end + 2 * w
    out = audio[:end].copy()
    out[-2 * w:] *= np.linspace(1, 0, 2 * w)
    return out


def cmd_kokoro(a):
    import numpy as np, onnxruntime as ort
    if a.lang != "en": sys.exit("Kokoro has no Irish voice. Irish clips need a person or ABAIR (see the plan).")
    vocab = json.load(open(os.path.join(MODELS, "kokoro-config.json"), encoding="utf8"))["vocab"]
    voice = np.load(os.path.join(MODELS, "voices-v1.0.bin"))[a.voice]
    timed = os.path.join(MODELS, "kokoro-v1.0-timed.onnx")
    if not os.path.exists(timed):
        sys.exit("Needs kokoro-v1.0-timed.onnx in CM_TTS_DIR: run tools/audio/onnx_timings.py on kokoro-v1.0.onnx (see README).")
    sess = ort.InferenceSession(timed, providers=["CPUExecutionProvider"])
    names = [i.name for i in sess.get_inputs()]
    tok_in = "input_ids" if "input_ids" in names else "tokens"
    only = set(a.only.split(",")) if a.only else None
    out_dir = a.out or AUDIO
    made = 0
    for r in items("en"):
        dst = os.path.join(out_dir, r["path"])
        if only and r["file"] not in only and r["key"] not in only: continue
        if a.kind and r["kind"] != a.kind: continue
        if os.path.exists(dst) and not a.force and not only: continue
        if r["kind"] == "say": ph = say_ph(r)
        elif r["kind"] == "letter": ph = letter_ph(r["key"])
        else: ph = phonemes(r["text"], "en")
        body = misaki(ph).rstrip(".").strip()
        if not body: print("  skipped (nothing to say): %r" % r["text"]); continue
        lead = LEAD_IN
        ph = lead + body + TRAIL
        toks = [vocab[c] for c in ph if c in vocab]
        style = voice[min(len(toks), len(voice)) - 1]
        speed = a.say_speed if r["kind"] == "say" else a.lib_speed if r["kind"] == "lib" else a.speed
        audio, dur = sess.run(None, {tok_in: np.array([[0] + toks + [0]], dtype=np.int64), "style": style.astype(np.float32),
                                     "speed": np.array([speed], dtype=np.float32)})
        audio = cut_by_timing(audio.ravel(), np.asarray(dur).ravel(), ntok(lead, vocab), ntok(body, vocab))
        audio = trim_hiss(audio, body)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
            process(tmp.name, dst)
            os.unlink(tmp.name)
        made += 1
        print("  %-16s %s" % (r["text"], body))
    if not a.out: cmd_manifest(a, voice_note={"en": "Kokoro " + a.voice})
    print("made %d clips" % made)


def cmd_import(a):
    rows = {r["file"]: r for r in items(a.lang)}
    n = 0
    for name in sorted(os.listdir(a.folder)):
        stem = os.path.splitext(name)[0].lower()
        if stem not in rows: print("  skipped %s (not in the script)" % name); continue
        process(os.path.join(a.folder, name), os.path.join(AUDIO, rows[stem]["path"])); n += 1
    cmd_manifest(a, voice_note={a.lang: a.credit} if a.credit else None)
    print("imported %d clips" % n)


def cmd_manifest(a=None, voice_note=None):
    path = os.path.join(AUDIO, "manifest.json")
    old = json.load(open(path, encoding="utf8")) if os.path.exists(path) else {}
    files = []
    for lang in ("en", "ga"):
        for r in items(lang):
            if os.path.exists(os.path.join(AUDIO, r["path"])): files.append(r["path"])
    voices = old.get("voices", {})
    if voice_note: voices.update(voice_note)
    os.makedirs(AUDIO, exist_ok=True)
    # lib: phrase -> clip, for site/js/emma.js. core: clips saved for offline use straight away (the Alphabet
    # book and the games); the rest are saved the first time they play.
    lib, core, whole = {}, [], {}
    for lang in ("en", "ga"):
        src = os.path.join(HERE, "phrases-%s.json" % lang)
        if not os.path.exists(src): continue
        L, W = {}, []
        for e in json.load(open(src, encoding="utf8")):
            if os.path.exists(os.path.join(AUDIO, e["path"])):
                L[e["key"]] = e["path"]
                if e.get("whole"): W.append(e["key"])
                if e["group"] == "core" and e["path"] not in core: core.append(e["path"])
        if L: lib[lang] = L
        if W: whole[lang] = sorted(W)
    for p in files:
        if "/lib/" not in p and p not in core: core.append(p)
    with open(path, "w", encoding="utf8") as f:
        json.dump({"v": 2, "voices": voices, "files": files, "core": sorted(core), "lib": lib, "whole": whole}, f, ensure_ascii=False, indent=0)
        f.write("\n")
    print("manifest: %d clips" % len(files))


def cmd_check(a):
    bad = 0
    for lang in ("en", "ga"):
        want = {r["path"] for r in items(lang)}
        have = set()
        d = os.path.join(AUDIO, lang)
        for base, _, fs in os.walk(d):
            for f in fs: have.add(os.path.relpath(os.path.join(base, f), AUDIO).replace(os.sep, "/"))
        miss, extra = sorted(want - have), sorted(have - want)
        print("%s: %d of %d clips" % (lang, len(want & have), len(want)))
        for m in miss: print("  missing  " + m)
        for e in extra: print("  not used " + e); bad += 1
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("script"); s.add_argument("--lang", choices=["en", "ga"])
    s = sub.add_parser("kokoro"); s.add_argument("--lang", default="en"); s.add_argument("--voice", default="bf_emma")
    s.add_argument("--speed", type=float, default=0.9); s.add_argument("--say-speed", type=float, default=0.8); s.add_argument("--lib-speed", type=float, default=0.8)
    s.add_argument("--kind", help="only make clips of this kind: letter, word, say, phrase or lib"); s.add_argument("--only"); s.add_argument("--force", action="store_true")
    s.add_argument("--out", help="write clips here instead of site/audio (for listening samples)")
    s = sub.add_parser("import"); s.add_argument("--lang", required=True, choices=["en", "ga"]); s.add_argument("folder"); s.add_argument("--credit")
    sub.add_parser("manifest"); sub.add_parser("check")
    a = p.parse_args()
    {"script": cmd_script, "kokoro": cmd_kokoro, "import": cmd_import, "manifest": cmd_manifest, "check": cmd_check}[a.cmd](a)
