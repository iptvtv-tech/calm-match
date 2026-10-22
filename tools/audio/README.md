# Built-in recordings

Short sound files for the Alphabet book (letters and words, English and Irish), so words are read aloud
on every device, even ones with no voice of their own, and in Irish, which almost no device can speak.

- Clips live in `site/audio/<lang>/letters/`, `words/` and `phrases/`, listed in `site/audio/manifest.json`.
- The site plays: a grown-up's own recording → the built-in clip → the device's voice. A word with no clip
  just uses the device's voice, so a language can be filled in a bit at a time.
- Everything goes through `build.py` (run `python3 tools/audio/build.py -h`).

## When the word lists change

Word lists are in `site/js/alphabet.js`. After adding or changing a word:

1. `python3 tools/audio/build.py check` lists what's missing or no longer used (delete unused files).
2. Make or record the missing clips (below), then the manifest is rebuilt automatically.
3. Bump `VERSION` in `site/sw.js` so devices download the new clips.

## Recording with a person (any language)

1. `python3 tools/audio/build.py script --lang ga` prints the list and writes `script-ga.csv`.
2. Record each line as its own file, named after the `file` column (for example `bo.m4a`, `letter-b.m4a`).
   A phone voice-memo app in a quiet room is fine. Calm, friendly, a little slow.
3. `python3 tools/audio/build.py import --lang ga path/to/folder --credit "Name, Connacht Irish"`.
   Each file is trimmed, levelled to the same loudness and saved as a small MP3.

## Making English clips with Kokoro (current English set)

The English set was made with the Kokoro open voice (Apache 2.0), voice `bf_emma`, speed 0.9.
The model files are large and are not kept in the repo. To remake or add clips, put these in one folder
and point `CM_TTS_DIR` at it:

- `kokoro-v1.0.onnx` and `voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
- `kokoro-config.json`: `src/kokoro_onnx/config.json` from the same repo
- `piper/`: the unpacked `piper/` folder from https://github.com/rhasspy/piper/releases (2023.11.14-2,
  `piper_linux_x86_64.tar.gz`), used only for its espeak-ng pronunciation library

Needs Python with `numpy` and `onnxruntime`, plus `ffmpeg` and `node`.

```
CM_TTS_DIR=/path/to/models python3 tools/audio/build.py kokoro --lang en            # only missing clips
CM_TTS_DIR=/path/to/models python3 tools/audio/build.py kokoro --lang en --only bee,letter-b   # remake some
```

Letter names follow Irish English: H is "haitch", Z is "zed".

## Irish

Kokoro has no Irish voice. Irish clips need a fluent speaker (`import`), or ABAIR (abair.ie, Trinity College
Dublin) if permission is granted. Finish the Irish speaker's check of the word lists before recording.
