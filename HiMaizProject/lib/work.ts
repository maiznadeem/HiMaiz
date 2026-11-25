import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { z } from "zod";
import { shouldIncludeDrafts } from "./log";
import { MEDIA_MANIFEST, mediaIsRemote, type MediaManifest } from "./media";

/** "job" is an employer, "fyp" the Final Year Project, "project" a personal project. One template. */
export type WorkKind = "job" | "fyp" | "project";

export type WorkStat = { value: string; label: string };

export type WorkVideo = {
    src: string;
    poster: string;
    captions: string;
    seconds: number;
    transcript: string;
};

export type WorkImage = { src: string; alt: string; width: number; height: number };

export type WorkScene = {
    id: string;
    title: string;
    kicker?: string;
    /** Raw markdown, trimmed. */
    body: string;
    stats: WorkStat[];
    video?: WorkVideo;
    image?: WorkImage;
};

export type WorkStudy = {
    slug: string;
    kind: WorkKind;
    name: string;
    role: string;
    /** YYYY-MM */
    start?: string;
    /** YYYY-MM or "present" */
    end?: string;
    place?: string;
    order: number;
    draft: boolean;
    summary: string;
    intro: string;
    stack: string[];
    scenes: WorkScene[];
    more: string[];
    /** The optional closing note: the markdown body, trimmed. */
    note: string;
};

type WorkOptions = {
    dir?: string;
    publicDir?: string;
    includeDrafts?: boolean;
    /** The uploaded videos when they are served from the media host; null checks them on disk. */
    media?: MediaManifest | null;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Scenes per case study, by kind (contract section 2). */
export const SCENE_LIMITS: Record<WorkKind, [number, number]> = {
    job: [3, 6],
    fyp: [2, 4],
    project: [1, 3],
};

/** Only employer pages may link out. The FYP and personal projects never do (contract section 1). */
export const linksOut = (kind: WorkKind) => kind === "job";

/** Media size limits in bytes (contract sections 2 and 3). */
const MAX_BYTES = { video: 8_000_000, poster: 250_000, image: 300_000, captions: 200_000 };

export class WorkFileError extends Error {
    constructor(file: string, field: string, problem: string) {
        super(`content/work/${file}: ${field} ${problem}`);
        this.name = "WorkFileError";
    }
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

// His voice: no semicolons and no long dashes in anything a visitor reads.
const voice = (text: string) => !/[;–—]/.test(text);
const VOICE = "must not use semicolons or long dashes";

function line(max?: number) {
    let schema = z.string().trim().min(1, "must not be empty");
    if (max) schema = schema.max(max, `must be at most ${max} characters`);
    return schema.refine((s) => !/[\r\n]/.test(s), "must be a single line").refine(voice, VOICE);
}

function prose(maxWords?: number) {
    const schema = z.string().trim().min(1, "must not be empty").refine(voice, VOICE);
    if (!maxWords) return schema;
    return schema.refine((s) => words(s) <= maxWords, `must be at most ${maxWords} words`);
}

// A YAML `2025-03` stays a string, but `2025` is a number and `2025-03-01` a Date: all are
// reported as the wrong shape rather than coerced.
const monthField = z.unknown().transform((value, ctx) => {
    if (typeof value !== "string" || !MONTH.test(value.trim())) {
        ctx.addIssue({ code: "custom", message: "must be a month (YYYY-MM)" });
        return z.NEVER;
    }
    return value.trim();
});

const endField = z.unknown().transform((value, ctx) => {
    if (value === "present") return value;
    if (typeof value !== "string" || !MONTH.test(value.trim())) {
        ctx.addIssue({ code: "custom", message: 'must be a month (YYYY-MM) or "present"' });
        return z.NEVER;
    }
    return value.trim();
});

const mediaPath = z
    .string()
    .trim()
    .refine((s) => s.startsWith("/work/"), "must be a path under /work/");

// Limits are the contract's (section 2) and no tighter: a field the contract leaves open, such as a
// stat value or a `more` line, takes any length and the pages make room for it.
const scene = z.strictObject({
    id: z.string().regex(SLUG, "must be lowercase letters, digits and hyphens"),
    title: line(60),
    kicker: line(30).optional(),
    body: prose(110),
    stats: z
        .array(
            z.strictObject({
                value: z.string("must be a quoted string").trim().min(1, "must not be empty"),
                label: line(40),
            }),
        )
        .max(3, "must have at most 3 items")
        .default([]),
    video: z
        .strictObject({
            src: mediaPath,
            poster: mediaPath,
            captions: mediaPath,
            seconds: z.number().int("must be whole seconds").positive("must be above zero"),
            transcript: prose(),
        })
        .optional(),
    image: z
        .strictObject({
            src: mediaPath,
            alt: line(),
            width: z.number().int().positive("must be above zero"),
            height: z.number().int().positive("must be above zero"),
        })
        .optional(),
});

const frontmatter = z
    .strictObject({
        kind: z.enum(["job", "fyp", "project"], 'must be "job", "fyp" or "project"'),
        name: line(),
        role: line(),
        start: monthField.optional(),
        end: endField.optional(),
        place: line().optional(),
        order: z.number().int("must be a whole number").positive("must be 1 or more"),
        draft: z.boolean().default(false),
        summary: line(160),
        intro: prose(),
        stack: z.array(line()).max(8, "must have at most 8 items").default([]),
        scenes: z.array(scene).min(1, "must have at least 1 scene"),
        more: z.array(line()).max(8, "must have at most 8 items").default([]),
    })
    .superRefine((data, ctx) => {
        const [min, max] = SCENE_LIMITS[data.kind];
        if (data.scenes.length < min || data.scenes.length > max) {
            ctx.addIssue({
                code: "custom",
                path: ["scenes"],
                message: `must have ${min} to ${max} scenes for kind ${data.kind}`,
            });
        }
        if (data.kind === "job") {
            for (const field of ["start", "end"] as const) {
                if (data[field] === undefined) {
                    ctx.addIssue({ code: "custom", path: [field], message: "is required" });
                }
            }
        }
        if (data.start && data.end && data.end !== "present" && data.end < data.start) {
            ctx.addIssue({ code: "custom", path: ["end"], message: "must not be before start" });
        }
        const seen = new Set<string>();
        data.scenes.forEach((s, i) => {
            if (seen.has(s.id)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["scenes", i, "id"],
                    message: `repeats "${s.id}"`,
                });
            }
            seen.add(s.id);
        });
    });

/** "scenes", 2, "title" -> "scenes[2].title" */
function fieldName(parts: readonly PropertyKey[]): string {
    return parts
        .map((part, i) =>
            typeof part === "number" ? `[${part}]` : `${i ? "." : ""}${String(part)}`,
        )
        .join("");
}

function valueAt(data: unknown, parts: readonly PropertyKey[]): unknown {
    let value = data;
    for (const part of parts) {
        if (value === null || typeof value !== "object") return undefined;
        value = (value as Record<PropertyKey, unknown>)[part];
    }
    return value;
}

/**
 * The most useful zod issue as "<field> <problem>". An unknown field comes first: a misspelt
 * `titel` also leaves `title` missing, and the misspelling is the thing to fix.
 */
function describe(error: z.ZodError, data: unknown): [string, string] {
    const unknown = error.issues.find((i) => i.code === "unrecognized_keys");
    if (unknown) {
        const where = unknown.path.join(".");
        const missing = error.issues.find(
            (i) =>
                i.path.slice(0, -1).join(".") === where &&
                valueAt(data, i.path) === undefined &&
                i.code !== "unrecognized_keys",
        );
        const hint = missing ? ` (is it a misspelling of ${String(missing.path.at(-1))}?)` : "";
        return [fieldName([...unknown.path, unknown.keys[0]]), `is not a known field${hint}`];
    }
    const issue = error.issues[0];
    const field = issue.path.length ? fieldName(issue.path) : "frontmatter";
    const missing = issue.path.length > 0 && valueAt(data, issue.path) === undefined;
    return [field, missing ? "is required" : issue.message];
}

const sha256Cache = new Map<string, string>();
function sha256Of(file: string): string {
    const { size, mtimeMs } = fs.statSync(/* turbopackIgnore: true */ file);
    const key = `${file}|${size}|${mtimeMs}`;
    let hash = sha256Cache.get(key);
    if (!hash) {
        const data = fs.readFileSync(/* turbopackIgnore: true */ file);
        hash = createHash("sha256").update(data).digest("hex");
        sha256Cache.set(key, hash);
    }
    return hash;
}

/**
 * Media must be the scene's own files in public/work/<slug>/, present and within the size limits.
 * With a remote media host (`media` set), a video must be in content/work/media.json instead, and
 * a copy on disk must be the uploaded one, so a re-rendered video never ships pointing at the old.
 */
function checkMedia(
    file: string,
    slug: string,
    scenes: WorkScene[],
    publicDir: string,
    media: MediaManifest | null,
) {
    const check = (field: string, src: string, exts: string[], id: string, max: number) => {
        const base = `/work/${slug}/${id}`;
        if (!exts.some((ext) => src === `${base}.${ext}`)) {
            const names = exts.map((ext) => `${base}.${ext}`).join(" or ");
            throw new WorkFileError(file, field, `must be ${names}`);
        }
        const onDisk = path.join(publicDir, ...src.split("/").filter(Boolean));
        if (media && src.endsWith(".mp4")) {
            const entry = media[src];
            if (!entry) {
                throw new WorkFileError(
                    file,
                    field,
                    `is not in content/work/media.json: upload it with npm run media:upload`,
                );
            }
            if (entry.bytes > max) {
                throw new WorkFileError(
                    file,
                    field,
                    `is ${entry.bytes} bytes, over the ${max} byte limit`,
                );
            }
            const local = fs.existsSync(/* turbopackIgnore: true */ onDisk);
            if (local && sha256Of(onDisk) !== entry.sha256) {
                throw new WorkFileError(
                    file,
                    field,
                    `public${src} differs from the uploaded copy in content/work/media.json: re-upload it with npm run media:upload`,
                );
            }
            return;
        }
        if (!fs.existsSync(/* turbopackIgnore: true */ onDisk)) {
            throw new WorkFileError(file, field, `points to a missing file: public${src}`);
        }
        const size = fs.statSync(/* turbopackIgnore: true */ onDisk).size;
        if (size > max) {
            throw new WorkFileError(file, field, `is ${size} bytes, over the ${max} byte limit`);
        }
    };
    scenes.forEach((s, i) => {
        const at = `scenes[${i}]`;
        if (s.video) {
            check(`${at}.video.src`, s.video.src, ["mp4"], s.id, MAX_BYTES.video);
            check(`${at}.video.poster`, s.video.poster, ["jpg"], s.id, MAX_BYTES.poster);
            check(`${at}.video.captions`, s.video.captions, ["vtt"], s.id, MAX_BYTES.captions);
        }
        if (s.image) {
            check(`${at}.image.src`, s.image.src, ["jpg", "jpeg", "webp"], s.id, MAX_BYTES.image);
        }
    });
}

const MARKDOWN_FILE = /\.(md|markdown)$/i;

/** Lists case study files. A markdown file that is not a lowercase `.md` fails instead of being skipped. */
function studyFiles(dir: string): string[] {
    return fs
        .readdirSync(/* turbopackIgnore: true */ dir)
        .filter((file) => !file.startsWith(".") && MARKDOWN_FILE.test(file))
        .map((file) => {
            if (!file.endsWith(".md")) {
                throw new WorkFileError(file, "extension", "must use a lowercase .md file name");
            }
            return file;
        });
}

function parseStudy(
    dir: string,
    file: string,
    publicDir: string,
    media: MediaManifest | null,
): WorkStudy {
    const slug = file.slice(0, -".md".length);
    if (!SLUG.test(slug)) {
        throw new WorkFileError(file, "slug", "must be lowercase letters, digits and hyphens");
    }
    let parsed: matter.GrayMatterFile<string>;
    try {
        // Options turn off gray-matter's cache, which keeps a file it failed to parse and then
        // returns it as empty on the next read.
        parsed = matter(fs.readFileSync(path.join(dir, file), "utf8"), {});
    } catch (error) {
        // js-yaml reports the line and the reason; the build should also say which file.
        const { reason, mark } = error as { reason?: string; mark?: { line: number } };
        const where = mark ? ` at line ${mark.line + 2}` : "";
        throw new WorkFileError(
            file,
            "front matter",
            `is not valid YAML${where}: ${reason ?? error}`,
        );
    }
    const { data, content } = parsed;
    const result = frontmatter.safeParse(data);
    if (!result.success) {
        const [field, problem] = describe(result.error, data);
        throw new WorkFileError(file, field, problem);
    }
    const note = content.trim();
    if (!voice(note)) throw new WorkFileError(file, "closing note", VOICE);
    checkMedia(file, slug, result.data.scenes, publicDir, media);
    return { slug, ...result.data, note };
}

const KIND_RANK: Record<WorkKind, number> = { job: 0, fyp: 1, project: 2 };

/**
 * Every case study in content/work: employers, then the Final Year Project, then personal projects,
 * each by `order` (ties by slug). The list is whatever files exist: nothing here knows a slug.
 */
export function getWorkStudies(options: WorkOptions = {}): WorkStudy[] {
    const cwd = /* turbopackIgnore: true */ process.cwd();
    const dir = options.dir ?? path.join(cwd, "content/work");
    const publicDir = options.publicDir ?? path.join(cwd, "public");
    const includeDrafts = options.includeDrafts ?? shouldIncludeDrafts();
    const media =
        options.media === undefined ? (mediaIsRemote ? MEDIA_MANIFEST : null) : options.media;
    // Git does not track empty folders, so a missing directory means no case studies.
    if (!fs.existsSync(/* turbopackIgnore: true */ dir)) return [];
    const studies = studyFiles(dir).map((file) => parseStudy(dir, file, publicDir, media));
    const fyps = studies.filter((study) => study.kind === "fyp");
    if (fyps.length > 1) {
        const files = fyps.map((study) => `${study.slug}.md`);
        throw new WorkFileError(
            files.join(" and content/work/"),
            "kind",
            "is fyp in each, and only one Final Year Project may exist",
        );
    }
    return studies
        .filter((study) => includeDrafts || !study.draft)
        .sort(
            (a, b) =>
                KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
                a.order - b.order ||
                a.slug.localeCompare(b.slug),
        );
}

export function getWorkStudy(slug: string, options: WorkOptions = {}): WorkStudy | undefined {
    return getWorkStudies(options).find((study) => study.slug === slug);
}

/**
 * Where "Next" leads after a case study. It never leaves the visitor's group in a way that would
 * name an employer on a personal page: an employer leads to the next employer, the last employer
 * to the Final Year Project (or the first personal project if there is none); the Final Year
 * Project leads to the first personal project; a personal project leads to the next one. The
 * last of the chain has no next and the page offers the way back to /work instead.
 */
export function nextStudy(studies: WorkStudy[], slug: string): WorkStudy | undefined {
    const study = studies.find((s) => s.slug === slug);
    if (!study) return undefined;
    const ofKind = (kind: WorkKind) => studies.filter((s) => s.kind === kind);
    const group = ofKind(study.kind);
    const after = group[group.indexOf(study) + 1];
    if (after) return after;
    if (study.kind === "job") return ofKind("fyp")[0] ?? ofKind("project")[0];
    if (study.kind === "fyp") return ofKind("project")[0];
    return undefined;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthLabel = (month: string) => {
    const [year, m] = month.split("-").map(Number);
    return `${MONTHS[m - 1]} ${year}`;
};

/** "Mar 2025 to now", "Jun 2022 to Feb 2025", "Since Mar 2025", or "" when there are no dates. */
export function formatSpan(study: Pick<WorkStudy, "start" | "end">): string {
    const end = study.end === "present" ? "now" : study.end && monthLabel(study.end);
    if (study.start && end) return `${monthLabel(study.start)} to ${end}`;
    if (study.start) return `Since ${monthLabel(study.start)}`;
    if (end && end !== "now") return `Until ${end}`;
    return "";
}

/** Total video length in whole minutes, rounded up; 0 when no scene has a video. */
export function videoMinutes(study: Pick<WorkStudy, "scenes">): number {
    const seconds = study.scenes.reduce((sum, s) => sum + (s.video?.seconds ?? 0), 0);
    return Math.ceil(seconds / 60);
}

const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The scene title is an h2, so a heading inside a body renders as h3 or lower.
const heading: ConstructorParameters<typeof Marked>[0] = {
    renderer: {
        heading({ tokens, depth }) {
            const level = Math.min(Math.max(depth, 3), 6);
            return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
        },
    },
};

const withLinks = new Marked(heading);

// FYP and project pages never link out: a link keeps its words and loses its address, and raw
// HTML is shown as text so it cannot carry one either.
const withoutLinks = new Marked(heading, {
    renderer: {
        link({ tokens }) {
            return this.parser.parseInline(tokens);
        },
        html({ text }) {
            return escapeHtml(text);
        },
    },
});

export function renderWorkMarkdown(source: string, kind: WorkKind): string {
    const markdown = linksOut(kind) ? withLinks : withoutLinks;
    return markdown.parse(source, { async: false }) as string;
}
