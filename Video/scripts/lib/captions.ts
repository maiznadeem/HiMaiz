import type { TimedLine } from "../../src/kit/timing";
import { wordStart, type WordTime } from "./words";

/** At most this many characters per cue (two lines of about 42). */
const MAX_CUE = 84;
const MAX_ROW = 42;

export type Cue = { start: number; end: number; text: string };

/** Split a long line into cue-sized pieces: at sentence ends first, then commas, then spaces. */
export function splitText(text: string): string[] {
    if (text.length <= MAX_CUE) return [text];
    for (const sep of [/(?<=[.!?])\s+/, /(?<=[,:])\s+/]) {
        const parts = text.split(sep);
        if (parts.length > 1) {
            const out: string[] = [];
            let cur = "";
            for (const p of parts) {
                if (cur && (cur + " " + p).length > MAX_CUE) {
                    out.push(cur);
                    cur = p;
                } else cur = cur ? `${cur} ${p}` : p;
            }
            if (cur) out.push(cur);
            if (out.length > 1) return out.flatMap(splitText);
        }
    }
    const words = text.split(" ");
    const half = Math.ceil(words.length / 2);
    return [
        ...splitText(words.slice(0, half).join(" ")),
        ...splitText(words.slice(half).join(" ")),
    ];
}

/** Break a cue into at most two rows near the middle. */
function rows(text: string): string {
    if (text.length <= MAX_ROW) return text;
    const mid = text.length / 2;
    let best = -1;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    return best < 0 ? text : `${text.slice(0, best)}\n${text.slice(best + 1)}`;
}

/**
 * Cues from the real voice timings. A line too long for one cue is split, and each part starts when its
 * first word is spoken (from `words`, the line's word timings). Without word timings, a split line shares
 * its time by the length of each part, which can drift by up to a second on long lines.
 */
export function buildCues(lines: TimedLine[], words: (WordTime[] | undefined)[] = []): Cue[] {
    const cues: Cue[] = [];
    lines.forEach((line, li) => {
        const parts = splitText(line.text);
        const total = parts.reduce((a, p) => a + p.length, 0);
        const starts: number[] = [];
        let t = line.start;
        for (const p of parts) {
            starts.push(t);
            t += ((line.end - line.start) * p.length) / total;
        }
        const w = words[li];
        if (w && parts.length > 1) {
            const textWords = line.text.split(/\s+/);
            let index = 0;
            parts.forEach((p, k) => {
                if (k > 0) {
                    const at = wordStart(textWords, index, w);
                    if (at !== undefined) {
                        // Keep the order and leave each cue at least 0.3 s on screen.
                        starts[k] = Math.min(
                            line.end - 0.3,
                            Math.max(starts[k - 1] + 0.3, line.start + at),
                        );
                    }
                }
                index += p.split(/\s+/).length;
            });
        }
        parts.forEach((p, k) =>
            cues.push({
                start: starts[k],
                end: k + 1 < parts.length ? starts[k + 1] : line.end,
                text: p,
            }),
        );
    });
    return cues;
}

function stamp(t: number): string {
    const ms = Math.round(t * 1000);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const pad = (v: number, w = 2) => v.toString().padStart(w, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms % 1000, 3)}`;
}

export function toVtt(cues: Cue[]): string {
    const body = cues.map(
        (c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${rows(c.text)}\n`,
    );
    // The repo's line endings (CRLF), so the file on disk matches a checkout.
    return `WEBVTT\n\n${body.join("\n")}`.replace(/\n/g, "\r\n");
}

/** Parse the cues back out of a WebVTT file (enough of the format for our own files and checks). */
export function parseVtt(text: string): Cue[] {
    const src = text.replace(/\r\n/g, "\n");
    if (!src.startsWith("WEBVTT")) throw new Error("does not start with WEBVTT");
    const out: Cue[] = [];
    for (const block of src.split(/\n\n+/).slice(1)) {
        const ls = block.split("\n").filter(Boolean);
        const ti = ls.findIndex((l) => l.includes("-->"));
        if (ti < 0) continue;
        const [a, b] = ls[ti].split("-->").map((s) => s.trim().split(" ")[0]);
        const secs = (s: string) => {
            const p = s.split(":").map(Number);
            return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
        };
        out.push({ start: secs(a), end: secs(b), text: ls.slice(ti + 1).join(" ") });
    }
    return out;
}
