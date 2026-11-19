import type { Metadata } from "next";

export const EMAIL = "contact.maiznadeem@gmail.com";

/** The one plain sentence under the headline; also the site description. */
export const TAGLINE = "Thoughtful code and curious experiments, logged here as they happen.";

/** Next.js replaces the root `alternates` object wholesale, so pages that set their own must repeat this. */
export const RSS_ALTERNATE = { "application/rss+xml": "/log/rss.xml" };

/** Open Graph fields shared by every page. Next.js replaces `openGraph` wholesale, so pages that set their own spread this. */
export const OPEN_GRAPH_BASE = {
    siteName: "HiMaiz",
    locale: "en_US",
    images: [
        {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: "Maiz Nadeem. A leaf and an orange pebble cut from paper.",
        },
    ],
};

/** Metadata for a log entry page, so its link previews describe the entry, not the home page. */
export function entryMetadata(entry: { slug: string; date: string; summary: string }): Metadata {
    return {
        title: entry.summary,
        description: entry.summary,
        alternates: { canonical: `/log/${entry.slug}`, types: RSS_ALTERNATE },
        openGraph: {
            ...OPEN_GRAPH_BASE,
            title: entry.summary,
            description: entry.summary,
            url: `/log/${entry.slug}`,
            type: "article",
            publishedTime: new Date(`${entry.date}T00:00:00Z`).toISOString(),
        },
        twitter: {
            card: "summary_large_image",
            title: entry.summary,
            description: entry.summary,
            images: ["/opengraph-image"],
        },
    };
}
