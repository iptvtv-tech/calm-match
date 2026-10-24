# Emma: the built-in voice

Short recordings that ship with the site, so everything Calm Match says sounds the same on every device,
works offline and sends nothing anywhere. English uses the Kokoro open voice (Apache 2.0), voice `bf_emma`.
Irish will use the same system once there are Irish recordings (ABAIR or a fluent speaker).

- Recordings live in `site/audio/<lang>/`:
  - `say/` — Alphabet book cards, one phrase each ("A for apple", "fox ends with x")
  - `letters/`, `words/`, `phrases/` — letters, alphabet words and "ends with x" on their own
  - `lib/` — everything else the site says, in pieces ("find the", "dog", "look again")
- `site/audio/manifest.json` lists them: `lib` maps each piece to its file, `core` lists what is saved for
  offline use straight away (Alphabet book and games); the rest is saved the first time it plays.
- `site/js/emma.js` splits a sentence into pieces and plays them. If any piece has no recording (words a
  grown-up typed), the device's voice says the whole sentence, so voices are never mixed in one sentence.
- Playback order everywhere: a grown-up's own recording → Emma → the device's voice. Grown-ups can choose
  "This device" in Settings > Voice. The voice speed setting changes Emma's speed too: Slower 88%, Normal 100%, Faster 112%.
- The child's name: a grown-up records it in the Children tab; until then Emma leaves the name out.
- Listening check: `site/audio/review.html` (not linked from the site) plays every recording and lets the
  owner tick ones that sound wrong.

## When words change

1. `node tools/audio/harvest.js` — lists every piece the site can say (reads the site's own code, so new
   games, phrases or words are picked up), and checks sample sentences can all be put together.
2. `python3 tools/audio/build.py check` — what's missing or no longer used (delete unused files).
3. Make the missing clips (below). The manifest is rebuilt automatically.
4. Bump `VERSION` in `site/sw.js`.

## Making English clips with Kokoro

Put these in one folder and point `CM_TTS_DIR` at it (they are large, so they're not in the repo):

- `kokoro-v1.0.onnx` and `voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
- `kokoro-config.json`: `src/kokoro_onnx/config.json` from the same repo
- `kokoro-v1.0-timed.onnx`: run `python3 tools/audio/onnx_timings.py kokoro-v1.0.onnx kokoro-v1.0-timed.onnx`
  (a copy of the model that also reports how long each sound lasts)
- `piper/`: the unpacked `piper/` folder from https://github.com/rhasspy/piper/releases (2023.11.14-2,
  `piper_linux_x86_64.tar.gz`), used only for its espeak-ng pronunciation library

Needs Python with `numpy` and `onnxruntime`, plus `ffmpeg` and `node`.

```
CM_TTS_DIR=/path/to/models python3 tools/audio/build.py kokoro --lang en                 # only missing clips
CM_TTS_DIR=/path/to/models python3 tools/audio/build.py kokoro --lang en --only say-a-apple,lib-find-the-1a2b3c   # remake some
CM_TTS_DIR=/path/to/models python3 tools/audio/build.py kokoro --lang en --only say-a-apple --out /tmp/try    # listen first
```

How the clips are made, and why:

- **Pronunciation:** espeak-ng gives the sounds, converted to Kokoro's own spelling ("misaki": `A` for the
  sound in "day", `I` for "eye", `Q` for "go", `ʤ`, `ʧ`). Sending espeak's spelling made letters sound wrong.
- **Clean starts and ends:** the voice stumbles on the first and last sound of a clip ("za for apple",
  "apples"). So every clip is spoken inside a carrier, "Now: A for apple. Two.", and "Now" and "Two" are cut
  off using the model's own timings (`cut_by_timing`), in the pauses either side. The full stop matters: with
  a comma the voice stayed up as if more was coming and swallowed the last sound, so sentences sounded clipped.
- Letter names follow Irish English: H is "haitch", Z is "zed".
- Speeds: Alphabet cards and everything else the site says 0.8 (the pace the owner chose, Oct 2026), letters and words 0.9.
- Whole sentence parts: anything with a fill-in ("find the train", "next is Match") is also recorded whole, so it isn't stitched. These are saved on a device the first time they play; until then Emma uses the pieces.
- Every clip is trimmed, levelled to the same calm loudness (−20 LUFS) and saved as a small mono MP3.

## Recording with a person (any language)

1. `python3 tools/audio/build.py script --lang ga` prints the list and writes `script-ga.csv`.
2. Record each line as its own file, named after the `file` column (for example `bo.m4a`, `letter-b.m4a`).
   A phone voice-memo app in a quiet room is fine. Calm, friendly, a little slow.
3. `python3 tools/audio/build.py import --lang ga path/to/folder --credit "Name, Connacht Irish"`.

## Irish

Kokoro has no Irish voice. Irish clips need a fluent speaker (`import`), or ABAIR (abair.ie, Trinity College
Dublin) if permission is granted. Finish the Irish speaker's check of the word lists before recording.
Irish still needs its own phrase list: `harvest.js` lists English only for now.
