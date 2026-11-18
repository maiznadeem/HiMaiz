import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LogEntry } from "@/lib/log";
import { LogList } from "./LogList";

function entry(overrides: Partial<LogEntry> = {}): LogEntry {
    return {
        slug: "an-entry",
        date: "2026-11-01",
        summary: "Rebuilt this site.",
        draft: false,
        body: "",
        hasPage: false,
        ...overrides,
    };
}

describe("LogList", () => {
    it("renders nothing for no entries", () => {
        expect(renderToStaticMarkup(<LogList entries={[]} />)).toBe("");
    });

    it("escapes the summary", () => {
        const html = renderToStaticMarkup(
            <LogList entries={[entry({ summary: "Fish & chips <3" })]} />,
        );
        expect(html).toContain("Fish &amp; chips &lt;3");
    });

    it("links entries that have a page", () => {
        const html = renderToStaticMarkup(
            <LogList entries={[entry({ slug: "with-body", body: "More.", hasPage: true })]} />,
        );
        expect(html).toContain('href="/log/with-body"');
    });

    it("does not link entries without a page", () => {
        const html = renderToStaticMarkup(<LogList entries={[entry()]} />);
        expect(html).not.toContain("<a");
    });

    it("shows the month and year in a time element", () => {
        const html = renderToStaticMarkup(<LogList entries={[entry()]} />);
        expect(html).toContain('<time dateTime="2026-11-01">Nov 2026</time>');
    });
});
