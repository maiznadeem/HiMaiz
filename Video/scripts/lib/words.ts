import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { splitText } from "./captions";
import type { NarrationLine } from "./narration";
import { VIDEO_DIR, VOICE_CACHE } from "./paths";
import { run } from "./proc";
import { voiceEnv } from "./voice";

export type WordTime = { word: string; start: number; end: number };

/**
 * Word timings for each line that the captions will split (longer than one cue), from Whisper, cached
 * next to the line's voice file. Lines that fit in one cue get `undefined` (they need no timings).
 * If Whisper is not available, returns `undefined` for every line and the captions fall back to
 * splitting by character share (with a warning).
 */
export async function lineWords(
    lines: NarrationLine[],
    voiceFiles: string[],
): Promise<(WordTime[] | undefined)[]> {
    const needed = lines.map((l) => splitText(l.text).length > 1);
    const outs = voiceFiles.map((f) => f.replace(/\.wav$/, ".words.json"));
    const todo = outs
        .map((out, i) => ({ wav: voiceFiles[i], out, i }))
        .filter((x) => needed[x.i] && !existsSync(x.out));
    if (todo.length) {
        try {
            const env = voiceEnv();
            const job = path.join(VOICE_CACHE, `words-${process.pid}.json`);
            writeFileSync(
                job,
                JSON.stringify({
                    hf_home: path.join(env.dir, "models", "hf"),
                    items: todo.map(({ wav, out }) => ({ wav, out })),
                }),
            );
            await run(env.python, ["-I", path.join(VIDEO_DIR, "scripts", "words.py"), job]);
            rmSync(job, { force: true });
        } catch (err) {
            console.warn(
                `  WARNING: no word timings (${(err as Error).message.split("\n")[0]}); long lines' ` +
                    "captions are split by character share instead. Install faster-whisper with npm run setup:voice.",
            );
            return lines.map(() => undefined);
        }
    }
    return outs.map((out, i) =>
        needed[i] && existsSync(out)
            ? (JSON.parse(readFileSync(out, "utf8")) as WordTime[])
            : undefined,
    );
}

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The time (seconds from the line's start) at which the caption word number `wordIndex` (counted in the
 * caption text) is spoken. Looks for the same word in Whisper's words near where it should be, and falls
 * back to the proportional position when it cannot find it (for example when `say` differs from `text`).
 */
export function wordStart(
    textWords: string[],
    wordIndex: number,
    words: WordTime[],
): number | undefined {
    if (!words.length) return undefined;
    const guess = Math.round((wordIndex / Math.max(1, textWords.length)) * words.length);
    const target = norm(textWords[wordIndex] ?? "");
    let best: number | undefined;
    for (let d = 0; d <= 4; d++) {
        for (const j of [guess - d, guess + d]) {
            if (j >= 0 && j < words.length && target && norm(words[j].word) === target) {
                best = j;
                break;
            }
        }
        if (best !== undefined) break;
    }
    const j = best ?? Math.min(words.length - 1, Math.max(0, guess));
    return words[j].start;
}
