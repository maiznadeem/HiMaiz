import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { NarrationLine } from "./narration";
import { UserError, VIDEO_DIR, VOICE_CACHE } from "./paths";
import { run } from "./proc";

/** The one voice used for every video. See README "Voice" for how it was chosen. */
export const VOICE = {
    engine: "kokoro-onnx 0.6.1",
    model: "kokoro-v1.0",
    voice: "am_michael",
    speed: 1.0,
    lang: "en-us",
    trim: 1,
} as const;

/** Where the voice environment lives (outside the repo): $VIDEO_ENV, or the path in Video/.video-env. */
export function voiceEnv() {
    let dir = process.env.VIDEO_ENV;
    const pointer = path.join(VIDEO_DIR, ".video-env");
    if (!dir && existsSync(pointer)) dir = readFileSync(pointer, "utf8").trim();
    if (!dir) {
        throw new UserError(
            "The voice environment is not set up. Run `npm run setup:voice -- <folder outside the repo>` once, or set VIDEO_ENV.",
        );
    }
    const python =
        process.platform === "win32"
            ? path.join(dir, ".venv", "Scripts", "python.exe")
            : path.join(dir, ".venv", "bin", "python");
    const model = path.join(dir, "models", "kokoro-v1.0.onnx");
    const voices = path.join(dir, "models", "voices-v1.0.bin");
    for (const f of [python, model, voices]) {
        if (!existsSync(f)) {
            throw new UserError(
                `Voice environment at ${dir} is incomplete: missing ${f}. Re-run npm run setup:voice.`,
            );
        }
    }
    return { dir, python, model, voices };
}

/** A cache file is written under a temporary name first, so a crash never leaves a half file. */
const partial = (file: string) => file.replace(/\.wav$/, ".partial.wav");

/** The cache key for a line: the words spoken plus every voice setting. */
export function voiceHash(spoken: string): string {
    return createHash("sha256")
        .update(JSON.stringify({ ...VOICE, spoken }))
        .digest("hex")
        .slice(0, 20);
}

/** Make (or reuse from the cache) one WAV per narration line. Returns the paths in line order. */
export async function makeVoice(
    lines: NarrationLine[],
): Promise<{ files: string[]; made: number }> {
    mkdirSync(VOICE_CACHE, { recursive: true });
    const files = lines.map((l) => path.join(VOICE_CACHE, `${voiceHash(l.say ?? l.text)}.wav`));
    const missing = lines
        .map((l, i) => ({ text: l.say ?? l.text, out: files[i] }))
        .filter(
            (item, i, all) =>
                !existsSync(item.out) && all.findIndex((o) => o.out === item.out) === i,
        );
    if (missing.length) {
        const env = voiceEnv();
        const job = path.join(VOICE_CACHE, `job-${process.pid}.json`);
        writeFileSync(
            job,
            JSON.stringify({
                model: env.model,
                voices: env.voices,
                voice: VOICE.voice,
                speed: VOICE.speed,
                lang: VOICE.lang,
                items: missing.map((m) => ({ text: m.text, out: partial(m.out) })),
            }),
        );
        await run(env.python, ["-I", path.join(VIDEO_DIR, "scripts", "voice.py"), job]);
        for (const m of missing) renameSync(partial(m.out), m.out);
        rmSync(job, { force: true });
    }
    return { files, made: missing.length };
}
