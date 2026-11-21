import path from "node:path";
import { describe, expect, it } from "vitest";
import {
    getLogEntries,
    getLogEntry,
    LogEntryError,
    renderMarkdown,
    shouldIncludeDrafts,
} from "./log";

const fixture = (name: string) => path.join(__dirname, "__fixtures__", "log", name);

describe("getLogEntries", () => {
    it("returns newest first, ties by slug, ignoring non-md and dotfiles", () => {
        const entries = getLogEntries({ dir: fixture("valid"), includeDrafts: true });
        expect(entries.map((e) => e.slug)).toEqual(["newest", "same-a", "same-b", "older"]);
    });

    it("computes hasPage and trims body", () => {
        const entries = getLogEntries({ dir: fixture("valid"), includeDrafts: true });
        const older = entries.find((e) => e.slug === "older");
        const newest = entries.find((e) => e.slug === "newest");
        expect(older?.hasPage).toBe(false);
        expect(older?.body).toBe("");
        expect(newest?.hasPage).toBe(true);
        expect(newest?.body).toBe("Some body text.");
    });

    it("filters drafts", () => {
        const dir = fixture("drafts");
        expect(getLogEntries({ dir, includeDrafts: false }).map((e) => e.slug)).toEqual(["live"]);
        expect(getLogEntries({ dir, includeDrafts: true }).map((e) => e.slug)).toEqual([
            "wip",
            "live",
        ]);
    });

    it("normalises unquoted YAML dates", () => {
        const [entry] = getLogEntries({ dir: fixture("yaml-date"), includeDrafts: true });
        expect(entry.date).toBe("2026-11-01");
    });

    it.each([
        ["missing-date", "entry.md", "date"],
        ["bad-date", "entry.md", "date"],
        ["empty-summary", "entry.md", "summary"],
        ["bad-slug", "My Entry.md", "slug"],
        ["bad-ext-upper", "Entry.MD", "lowercase .md"],
        ["bad-ext-markdown", "entry.markdown", "lowercase .md"],
    ])("throws for %s", (name, file, field) => {
        const run = () => getLogEntries({ dir: fixture(name), includeDrafts: true });
        expect(run).toThrow(LogEntryError);
        expect(run).toThrow(file);
        expect(run).toThrow(field);
        if (name === "missing-date") expect(run).toThrow("date is required");
    });
});

describe("missing directory", () => {
    it("returns no entries", () => {
        expect(getLogEntries({ dir: fixture("does-not-exist"), includeDrafts: true })).toEqual([]);
    });
});

describe("getLogEntry", () => {
    it("returns undefined for unknown slug", () => {
        expect(getLogEntry("missing", { dir: fixture("valid"), includeDrafts: true })).toBe(
            undefined,
        );
    });
    it("finds an entry", () => {
        expect(getLogEntry("older", { dir: fixture("valid"), includeDrafts: true })?.slug).toBe(
            "older",
        );
    });
});

describe("shouldIncludeDrafts", () => {
    it("follows env", () => {
        expect(shouldIncludeDrafts({ NODE_ENV: "development" })).toBe(true);
        expect(shouldIncludeDrafts({ NODE_ENV: "production" })).toBe(false);
    });
});

describe("renderMarkdown", () => {
    it("renders markdown", () => {
        expect(renderMarkdown("A & B")).toContain("A &amp; B");
        expect(renderMarkdown("**bold**")).toContain("<strong>bold</strong>");
    });

    it("demotes h1 to h2 so the page keeps a single h1", () => {
        const html = renderMarkdown(["# Top", "## Mid", "### Low", "#### Deep"].join("\n\n"));
        expect(html).not.toContain("<h1");
        expect(html).toContain("<h2>Top</h2>");
        expect(html).toContain("<h2>Mid</h2>");
        expect(html).toContain("<h3>Low</h3>");
        expect(html).toContain("<h4>Deep</h4>");
    });

    it("keeps inline formatting inside demoted headings", () => {
        expect(renderMarkdown("# A **big** `idea`")).toContain(
            "<h2>A <strong>big</strong> <code>idea</code></h2>",
        );
    });
});
