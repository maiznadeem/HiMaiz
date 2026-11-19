import { describe, expect, it } from "vitest";
import { entryMetadata, OPEN_GRAPH_BASE } from "./site";

const entry = { slug: "hello-world", date: "2026-11-01", summary: "Fish & chips" };

describe("entryMetadata", () => {
    const meta = entryMetadata(entry);

    it("describes the entry in the open graph tags", () => {
        expect(meta.openGraph).toMatchObject({
            siteName: "HiMaiz",
            locale: "en_US",
            title: "Fish & chips",
            description: "Fish & chips",
            url: "/log/hello-world",
            type: "article",
            publishedTime: "2026-11-01T00:00:00.000Z",
        });
    });

    it("keeps the social image on open graph and twitter", () => {
        expect(meta.openGraph).toMatchObject({ images: OPEN_GRAPH_BASE.images });
        expect(meta.twitter).toMatchObject({
            card: "summary_large_image",
            title: "Fish & chips",
            description: "Fish & chips",
            images: ["/opengraph-image"],
        });
    });

    it("sets the page description and canonical", () => {
        expect(meta.description).toBe("Fish & chips");
        expect(meta.alternates?.canonical).toBe("/log/hello-world");
    });
});
