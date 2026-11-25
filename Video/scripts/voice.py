"""Make voice lines with Kokoro-82M (kokoro-onnx), locally on the CPU.

Usage: python voice.py <job.json>
job.json: {"model": "...onnx", "voices": "...bin", "voice": "am_michael", "speed": 1.0,
           "lang": "en-us", "items": [{"text": "...", "out": "path.wav"}, ...]}
Each line is written as 24 kHz mono 16-bit WAV, with leading and trailing silence trimmed to 40 ms.
"""

import json
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro


def trim(samples: np.ndarray, sr: int, threshold: float = 0.004, keep_ms: int = 40) -> np.ndarray:
    loud = np.flatnonzero(np.abs(samples) > threshold)
    if loud.size == 0:
        return samples
    keep = int(sr * keep_ms / 1000)
    return samples[max(0, loud[0] - keep) : min(len(samples), loud[-1] + keep)]


def main() -> None:
    with open(sys.argv[1], encoding="utf-8") as f:
        job = json.load(f)
    kokoro = Kokoro(job["model"], job["voices"])
    for item in job["items"]:
        samples, sr = kokoro.create(
            item["text"], voice=job["voice"], speed=job["speed"], lang=job["lang"]
        )
        samples = trim(np.asarray(samples, dtype=np.float32), sr)
        sf.write(item["out"], samples, sr, subtype="PCM_16")
        print(json.dumps({"out": item["out"], "seconds": round(len(samples) / sr, 3)}), flush=True)


if __name__ == "__main__":
    main()
