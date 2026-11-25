import type { NarrationLine } from "./narration";

/**
 * Forms the voice reads badly, found by voicing "The value was <form> today." with the kit's voice and
 * transcribing it with Whisper with digit tokens suppressed (2026-11-25). For example "22 ms" is heard as
 * "twenty-two M S", "5 min" as "five men", "60 Hz" as "sixty HD", "1/3" as "one slash three".
 * Tested and read correctly, so NOT flagged: "40%", "0.01%", "350,794", "10,000", "p95", "10×" ("ten
 * times"), "12:22", "10:30 pm", "9am", "7.9%", "v2.3.1" ("V two point three point one"), "4 CPUs".
 * Full results: the run folder's video-env/unitstest/forms.json and forms2.json.
 */
const RULES: { pattern: RegExp; say: (m: RegExpMatchArray) => string }[] = [
    unit("ms", "milliseconds"),
    unit("s", "seconds", true),
    unit("sec", "seconds"),
    unit("h", "hours"),
    unit("hr", "hours"),
    unit("min", "minutes"),
    unit("GB", "gigabytes"),
    unit("MB", "megabytes"),
    unit("kB", "kilobytes"),
    unit("KB", "kilobytes"),
    unit("TB", "terabytes"),
    unit("Hz", "hertz"),
    unit("kHz", "kilohertz"),
    unit("MHz", "megahertz"),
    unit("GHz", "gigahertz"),
    unit("km", "kilometres"),
    unit("fps", "frames per second"),
    unit("x", "times"),
    {
        pattern: /(\d[\d.,]*)\s?(kbit|Mbit|kb|Mb)\/s\b/g,
        say: (m) => `${m[1]} ${m[2]} per second, in words`,
    },
    {
        pattern: /(\d[\d.,]*)\s?(kbps|Mbps|Gbps)\b/g,
        say: (m) => `${m[1]} ${m[2].replace(/bps/, "bits")} per second`,
    },
    {
        pattern: /\b(\d+)\/(\d+)\b/g,
        say: (m) => `"${m[1]} in ${m[2]}" or "${m[1]} out of ${m[2]}"`,
    },
    { pattern: /→|->/g, say: () => `"to" or "then"` },
    // "9:00 am" is heard as "nine zero zero a.m."; "12:22" and "10:30 pm" read fine.
    { pattern: /\b(\d{1,2}):00\b/g, say: (m) => `"${m[1]} o'clock" or "${m[1]} a.m."` },
];

function unit(abbr: string, word: string, needsSpace = false) {
    // "3 s" only with a space, so "the 1990s" is not caught.
    const sep = needsSpace ? "\\s" : "\\s?";
    return {
        pattern: new RegExp(`(\\d[\\d.,]*)${sep}${abbr}\\b`, "g"),
        say: (m: RegExpMatchArray) => `"${m[1]} ${word}"`,
    };
}

export type LintHit = { line: number; found: string; spoken: string; suggestion: string };

/** Check what the voice will read (`say`, else `text`) for forms it reads badly. */
export function lintNarration(lines: NarrationLine[]): LintHit[] {
    const hits: LintHit[] = [];
    lines.forEach((l, i) => {
        const spoken = l.say ?? l.text;
        for (const r of RULES) {
            for (const m of spoken.matchAll(r.pattern)) {
                hits.push({ line: i, found: m[0], spoken, suggestion: r.say(m) });
            }
        }
    });
    return hits;
}

export function formatHits(file: string, hits: LintHit[]): string {
    return hits
        .map(
            (h) =>
                `${file} line ${h.line}: "${h.found}" is read badly by the voice. ` +
                `Add "say" with it spelled out, e.g. ${h.suggestion}.\n    spoken: ${h.spoken}`,
        )
        .join("\n");
}
