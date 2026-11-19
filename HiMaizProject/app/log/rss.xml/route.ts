import { getLogEntries } from "@/lib/log";
import { buildRss } from "@/lib/rss";
import { TAGLINE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
    const xml = buildRss(getLogEntries(), {
        siteUrl: "https://himaiz.com",
        title: "Maiz Nadeem",
        description: TAGLINE,
    });
    return new Response(xml, {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
}
