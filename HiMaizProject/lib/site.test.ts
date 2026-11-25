import { describe, expect, it } from "vitest";
import {
    entryMetadata,
    OPEN_GRAPH_BASE,
    studyMetadata,
    WORK_DESCRIPTION,
    WORK_TITLE,
    workIndexMetadata,
} from "./site";

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

describe("workIndexMetadata", () => {
    const meta = workIndexMetadata();

    it("points at /work with its own description", () => {
        expect(meta.title).toBe(WORK_TITLE);
        expect(meta.description).toBe(WORK_DESCRIPTION);
        expect(meta.alternates?.canonical).toBe("/work");
        expect(meta.openGraph).toMatchObject({ url: "/work", images: OPEN_GRAPH_BASE.images });
    });
});

describe("studyMetadata", () => {
    const meta = studyMetadata({ slug: "acme", name: "Acme", summary: "Built the thing." });

    it("names the case study in the title, description and open graph tags", () => {
        expect(meta.title).toBe("Acme");
        expect(meta.description).toBe("Built the thing.");
        expect(meta.alternates?.canonical).toBe("/work/acme");
        expect(meta.openGraph).toMatchObject({
            siteName: "HiMaiz",
            title: "Acme",
            description: "Built the thing.",
            url: "/work/acme",
        });
        expect(meta.twitter).toMatchObject({ title: "Acme", images: ["/opengraph-image"] });
    });
});
