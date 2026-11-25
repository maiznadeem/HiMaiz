"""Word timings for voice lines, with faster-whisper (small.en, CPU), so captions split at real words.

Usage: python words.py <job.json>
job.json: {"hf_home": "...", "items": [{"wav": "line.wav", "out": "line.words.json"}, ...]}
Each out file is a JSON list of {"word": "...", "start": s, "end": s}, seconds from the start of the clip.
"""

import json
import os
import sys

import numpy as np
import soundfile as sf


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    with open(sys.argv[1], encoding="utf-8") as f:
        job = json.load(f)
    os.environ["HF_HOME"] = job["hf_home"]
    from faster_whisper import WhisperModel

    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    for item in job["items"]:
        audio, sr = sf.read(item["wav"], dtype="float32")
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        if sr != 16000:
            t = np.arange(0, len(audio) / sr, 1 / 16000)
            audio = np.interp(t, np.arange(len(audio)) / sr, audio).astype(np.float32)
        segments, _ = model.transcribe(audio, language="en", word_timestamps=True)
        words = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for s in segments
            for w in s.words
        ]
        with open(item["out"], "w", encoding="utf-8") as f:
            json.dump(words, f)
        print(json.dumps({"out": item["out"], "words": len(words)}), flush=True)


if __name__ == "__main__":
    main()
