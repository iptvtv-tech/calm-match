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
    return out


def process(src, dst):
    """Trim silence, level loudness, add a little quiet at each end, save as a small mono MP3."""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    flt = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
           "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
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


def phonemes(text, lang):
    """IPA for Kokoro from espeak-ng (taken from the Piper release, see README)."""
    lib = os.path.join(MODELS, "piper")
    out = subprocess.check_output([os.path.join(lib, "espeak-ng"), "--path=" + lib, "-v", "en-gb" if lang == "en" else lang, "-q", "--ipa", text],
                                  env=dict(os.environ, LD_LIBRARY_PATH=lib)).decode("utf8")
    return " ".join(out.split())


def cmd_kokoro(a):
    import numpy as np, onnxruntime as ort
    if a.lang != "en": sys.exit("Kokoro has no Irish voice. Irish clips need a person or ABAIR (see the plan).")
    vocab = json.load(open(os.path.join(MODELS, "kokoro-config.json"), encoding="utf8"))["vocab"]
    voice = np.load(os.path.join(MODELS, "voices-v1.0.bin"))[a.voice]
    sess = ort.InferenceSession(os.path.join(MODELS, "kokoro-v1.0.onnx"), providers=["CPUExecutionProvider"])
    names = [i.name for i in sess.get_inputs()]
    tok_in = "input_ids" if "input_ids" in names else "tokens"
    only = set(a.only.split(",")) if a.only else None
    made = 0
    for r in items("en"):
        dst = os.path.join(AUDIO, r["path"])
        if only and r["file"] not in only and r["key"] not in only: continue
        if os.path.exists(dst) and not a.force and not only: continue
        ph = LETTER_FIX_EN.get(r["key"]) if r["kind"] == "letter" and r["key"] in LETTER_FIX_EN else phonemes(r["text"] if r["kind"] != "word" else r["text"] + ".", "en")
        toks = [vocab[c] for c in ph if c in vocab]
        style = voice[min(len(toks), len(voice)) - 1]
        audio = sess.run(None, {tok_in: np.array([[0] + toks + [0]], dtype=np.int64), "style": style.astype(np.float32),
                                "speed": np.array([a.speed], dtype=np.float32)})[0].ravel()
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
            process(tmp.name, dst)
            os.unlink(tmp.name)
        made += 1
        print("  %-16s %s" % (r["text"], ph))
    cmd_manifest(a, voice_note={"en": "Kokoro " + a.voice})
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
    with open(path, "w", encoding="utf8") as f:
        json.dump({"v": 1, "voices": voices, "files": files}, f, ensure_ascii=False, indent=0)
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
    s.add_argument("--speed", type=float, default=0.9); s.add_argument("--only"); s.add_argument("--force", action="store_true")
    s = sub.add_parser("import"); s.add_argument("--lang", required=True, choices=["en", "ga"]); s.add_argument("folder"); s.add_argument("--credit")
    sub.add_parser("manifest"); sub.add_parser("check")
    a = p.parse_args()
    {"script": cmd_script, "kokoro": cmd_kokoro, "import": cmd_import, "manifest": cmd_manifest, "check": cmd_check}[a.cmd](a)
