import { toRssDate } from "./dates";
import type { LogEntry } from "./log";

type RssOptions = { siteUrl: string; title: string; description: string };

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function renderItem(entry: LogEntry, siteUrl: string): string {
    const summary = escapeXml(entry.summary);
    const page = `${siteUrl}/log/${entry.slug}`;
    // Unescaped: siteUrl is a constant and slugs are validated to [a-z0-9-].
    const link = entry.hasPage ? page : `${siteUrl}/`;
    const guid = entry.hasPage
        ? `<guid>${page}</guid>`
        : `<guid isPermaLink="false">log-${entry.slug}</guid>`;
    return [
        "    <item>",
        `      <title>${summary}</title>`,
        `      <link>${link}</link>`,
        `      ${guid}`,
        `      <pubDate>${toRssDate(entry.date)}</pubDate>`,
        `      <description>${summary}</description>`,
        "    </item>",
    ].join("\n");
}

export function buildRss(entries: LogEntry[], { siteUrl, title, description }: RssOptions): string {
    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "  <channel>",
        `    <title>${escapeXml(title)}</title>`,
        `    <link>${siteUrl}/</link>`,
        `    <description>${escapeXml(description)}</description>`,
        "    <language>en</language>",
        `    <atom:link href="${siteUrl}/log/rss.xml" rel="self" type="application/rss+xml"/>`,
        ...entries.map((entry) => renderItem(entry, siteUrl)),
        "  </channel>",
        "</rss>",
    ];
    return `${lines.join("\n")}\n`;
}
