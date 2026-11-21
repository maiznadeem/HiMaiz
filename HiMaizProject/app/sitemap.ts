import type { MetadataRoute } from "next";
import { getLogEntries } from "@/lib/log";

export const dynamic = "force-static";

const ORIGIN = "https://himaiz.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const entries = getLogEntries();
    return [
        {
            url: ORIGIN,
            lastModified: entries[0]?.date ?? new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        ...entries
            .filter((entry) => entry.hasPage)
            .map((entry) => ({ url: `${ORIGIN}/log/${entry.slug}`, lastModified: entry.date })),
    ];
}
