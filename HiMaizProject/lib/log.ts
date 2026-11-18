import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";

export type LogEntry = {
    slug: string;
    /** YYYY-MM-DD */
    date: string;
    summary: string;
    draft: boolean;
    /** Raw markdown, trimmed. */
    body: string;
    /** True when the entry has a body, so it gets its own page. */
    hasPage: boolean;
};

type LogOptions = { dir?: string; includeDrafts?: boolean };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class LogEntryError extends Error {
    constructor(file: string, field: string, problem: string) {
        super(`content/log/${file}: ${field} ${problem}`);
        this.name = "LogEntryError";
    }
}

const dateField = z.union([z.string(), z.date()]).transform((value, ctx) => {
    // gray-matter turns an unquoted YAML date into a Date at UTC midnight.
    const text = value instanceof Date ? value.toISOString().slice(0, 10) : value.trim();
    const parsed = new Date(`${text}T00:00:00Z`);
    const real =
        /^\d{4}-\d{2}-\d{2}$/.test(text) &&
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === text;
    if (!real) {
        ctx.addIssue({ code: "custom", message: "must be a real date (YYYY-MM-DD)" });
        return z.NEVER;
    }
    return text;
});

const frontmatter = z.object({
    date: dateField,
    summary: z
        .string()
        .trim()
        .min(1, "must not be empty")
        .refine((s) => !/[\r\n]/.test(s), "must be a single line"),
    draft: z.boolean().default(false),
});

export function shouldIncludeDrafts(env: NodeJS.ProcessEnv = process.env): boolean {
    return env.NODE_ENV !== "production" || env.VERCEL_ENV === "preview";
}

export function renderMarkdown(markdown: string): string {
    return marked.parse(markdown, { async: false });
}

function parseEntry(dir: string, file: string): LogEntry {
    const slug = file.slice(0, -".md".length);
    if (!SLUG.test(slug)) {
        throw new LogEntryError(file, "slug", "must be lowercase letters, digits and hyphens");
    }
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const result = frontmatter.safeParse(data);
    if (!result.success) {
        const issue = result.error.issues[0];
        const field = String(issue.path[0] ?? "frontmatter");
        const problem = data[field] === undefined ? "is required" : issue.message;
        throw new LogEntryError(file, field, problem);
    }
    const body = content.trim();
    return { slug, ...result.data, body, hasPage: body !== "" };
}

export function getLogEntries(options: LogOptions = {}): LogEntry[] {
    const dir = options.dir ?? path.join(/* turbopackIgnore: true */ process.cwd(), "content/log");
    const includeDrafts = options.includeDrafts ?? shouldIncludeDrafts();
    // Git does not track empty folders, so a missing directory means no entries.
    if (!fs.existsSync(/* turbopackIgnore: true */ dir)) return [];
    return fs
        .readdirSync(/* turbopackIgnore: true */ dir)
        .filter((file) => file.endsWith(".md") && !file.startsWith("."))
        .map((file) => parseEntry(dir, file))
        .filter((entry) => includeDrafts || !entry.draft)
        .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getLogEntry(slug: string, options: LogOptions = {}): LogEntry | undefined {
    return getLogEntries(options).find((entry) => entry.slug === slug);
}
