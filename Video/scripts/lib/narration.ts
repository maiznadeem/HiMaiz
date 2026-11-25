import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { UserError } from "./paths";

/** One line of narration as written in narration/<slug>/<scene-id>.json. */
export type NarrationLine = {
    /** What the captions show. */
    text: string;
    /** What the voice reads, when it should differ from the caption (numbers, units, acronyms). */
    say?: string;
    /** Silence after this line, in milliseconds. Default 300. */
    pauseAfterMs?: number;
};

export const DEFAULT_PAUSE_MS = 300;

/** A "no such scene" message that lists what does exist, so a typo is easy to spot. */
export function missingSceneMessage(file: string): string {
    const dir = path.dirname(file);
    const root = path.dirname(dir);
    if (!existsSync(dir)) {
        const slugs = existsSync(root) ? readdirSync(root) : [];
        return `No narration folder ${dir}. Slugs with narration: ${slugs.join(", ") || "(none)"}`;
    }
    const ids = readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.slice(0, -5));
    return `No narration file at ${file}. Scene ids in ${path.basename(dir)}: ${ids.join(", ") || "(none)"}`;
}

export function loadNarration(file: string): NarrationLine[] {
    if (!existsSync(file)) throw new UserError(missingSceneMessage(file));
    let data: unknown;
    try {
        data = JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
        throw new UserError(`${file} is not valid JSON: ${(err as Error).message}`);
    }
    if (!Array.isArray(data) || data.length === 0) {
        throw new UserError(
            `${file} must be a non-empty array of { "text": "...", "pauseAfterMs": 300 }`,
        );
    }
    return data.map((raw, i) => {
        const where = `${file} line ${i}`;
        if (typeof raw !== "object" || raw === null) throw new UserError(`${where}: not an object`);
        const { text, say, pauseAfterMs, ...rest } = raw as Record<string, unknown>;
        const extra = Object.keys(rest);
        if (extra.length) throw new UserError(`${where}: unknown field(s) ${extra.join(", ")}`);
        if (typeof text !== "string" || !text.trim())
            throw new UserError(`${where}: "text" is required`);
        if (say !== undefined && (typeof say !== "string" || !say.trim())) {
            throw new UserError(`${where}: "say" must be a non-empty string when present`);
        }
        if (
            pauseAfterMs !== undefined &&
            (typeof pauseAfterMs !== "number" || pauseAfterMs < 0 || pauseAfterMs > 5000)
        ) {
            throw new UserError(`${where}: "pauseAfterMs" must be a number from 0 to 5000`);
        }
        return { text: text.trim(), say: say?.trim(), pauseAfterMs };
    });
}

/** Normalise text for comparing captions with narration. */
export function normText(s: string): string {
    return s.replace(/\s+/g, " ").trim();
}
