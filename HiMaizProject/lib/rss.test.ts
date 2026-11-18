import { describe, expect, it } from "vitest";
import { toRssDate } from "./dates";
import type { LogEntry } from "./log";
import { buildRss } from "./rss";

const options = {
    siteUrl: "https://himaiz.com",
    title: "Maiz Nadeem",
    description: "Notes & things.",
};

function entry(overrides: Partial<LogEntry> = {}): LogEntry {
    return {
        slug: "first",
        date: "2026-11-01",
        summary: "First",
        draft: false,
        body: "",
        hasPage: false,
        ...overrides,
    };
}

/** Dependency-free well-formedness check: balanced tags, no stray `&` or `<`. */
function assertWellFormed(xml: string) {
    const body = xml.replace(/^<\?xml[^>]*\?>/, "");
    const stack: string[] = [];
    for (const match of body.matchAll(/<(\/?)([A-Za-z:][\w:.-]*)[^<>]*?(\/?)>/g)) {
        const [, closing, name, selfClosing] = match;
        if (selfClosing) continue;
        if (closing) expect(stack.pop()).toBe(name);
        else stack.push(name);
    }
    expect(stack).toEqual([]);
    const text = body.replace(/<[^<>]*>/g, "");
    expect(text).not.toMatch(/[<>]|&(?!(amp|lt|gt|quot|apos);)/);
}

describe("buildRss", () => {
    it("builds an empty channel", () => {
        const xml = buildRss([], options);
        expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).toContain("<channel>");
        expect(xml).not.toContain("<item>");
        assertWellFormed(xml);
    });

    it("declares the channel metadata and atom self link", () => {
        const xml = buildRss([], options);
        expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
        expect(xml).toContain("<title>Maiz Nadeem</title>");
        expect(xml).toContain("<link>https://himaiz.com/</link>");
        expect(xml).toContain("<description>Notes &amp; things.</description>");
        expect(xml).toContain("<language>en</language>");
        expect(xml).toContain(
            '<atom:link href="https://himaiz.com/log/rss.xml" rel="self" type="application/rss+xml"/>',
        );
    });

    it("escapes the summary in title and description", () => {
        const xml = buildRss([entry({ summary: 'Fish & chips <3 "quoted"' })], options);
        const escaped = "Fish &amp; chips &lt;3 &quot;quoted&quot;";
        expect(xml).toContain(`<title>${escaped}</title>`);
        expect(xml).toContain(`<description>${escaped}</description>`);
        assertWellFormed(xml);
    });

    it("uses the RSS date for pubDate", () => {
        const xml = buildRss([entry({ date: "2026-11-01" })], options);
        expect(xml).toContain(`<pubDate>${toRssDate("2026-11-01")}</pubDate>`);
    });

    it("links entries with a page to their page", () => {
        const xml = buildRss([entry({ slug: "with-page", hasPage: true })], options);
        expect(xml).toContain("<link>https://himaiz.com/log/with-page</link>");
        expect(xml).toContain("<guid>https://himaiz.com/log/with-page</guid>");
    });

    it("links entries without a page to the site with a stable guid", () => {
        const xml = buildRss([entry({ slug: "no-page" })], options);
        expect(xml).toContain("<link>https://himaiz.com/</link>\n      <guid");
        expect(xml).toContain('<guid isPermaLink="false">log-no-page</guid>');
    });

    it("keeps the order it is given", () => {
        const xml = buildRss(
            [entry({ slug: "b", summary: "Second" }), entry({ slug: "a", summary: "First" })],
            options,
        );
        expect(xml.indexOf("Second")).toBeLessThan(xml.indexOf("First"));
        assertWellFormed(xml);
    });
});
