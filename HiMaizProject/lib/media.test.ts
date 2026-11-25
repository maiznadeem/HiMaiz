import { afterEach, describe, expect, it, vi } from "vitest";
import manifest from "@/content/work/media.json";

const [video, entry] = Object.entries(manifest)[0];

async function load(base: string | undefined) {
    vi.resetModules();
    if (base === undefined) vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE", undefined);
    else vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE", base);
    return import("./media");
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("media address, local", () => {
    it("is not remote when the variable is unset or empty", async () => {
        for (const base of [undefined, ""]) {
            const media = await load(base);
            expect(media.MEDIA_BASE).toBe("");
            expect(media.mediaIsRemote).toBe(false);
        }
    });

    it("returns every content path unchanged", async () => {
        const { mediaUrl } = await load("");
        expect(mediaUrl(video)).toBe(video);
        expect(mediaUrl("/work/qoria/side-door.jpg")).toBe("/work/qoria/side-door.jpg");
        expect(mediaUrl("/work/not-in-the-manifest.mp4")).toBe("/work/not-in-the-manifest.mp4");
    });
});

describe("media address, remote", () => {
    it("puts a video on the media host with its version", async () => {
        const media = await load("https://media.himaiz.com");
        expect(media.mediaIsRemote).toBe(true);
        expect(media.mediaUrl(video)).toBe(
            `https://media.himaiz.com${video}?v=${entry.sha256.slice(0, 8)}`,
        );
    });

    it("joins without a double slash", async () => {
        const { mediaUrl } = await load("https://media.himaiz.com/");
        expect(mediaUrl(video)).toMatch(/^https:\/\/media\.himaiz\.com\/work\//);
    });

    it("leaves posters, stills and captions on the site", async () => {
        const { mediaUrl } = await load("https://media.himaiz.com");
        for (const path of ["/work/a/b.jpg", "/work/a/b.webp", "/work/a/b.vtt"]) {
            expect(mediaUrl(path)).toBe(path);
        }
    });

    it("fails for a video that is not in the manifest", async () => {
        const { mediaUrl } = await load("https://media.himaiz.com");
        expect(() => mediaUrl("/work/qoria/not-uploaded.mp4")).toThrow(
            "/work/qoria/not-uploaded.mp4 is not in content/work/media.json: upload it with npm run media:upload",
        );
    });
});

describe("mediaUrl input", () => {
    it("accepts only paths under /work/", async () => {
        for (const base of ["", "https://media.himaiz.com"]) {
            const { mediaUrl } = await load(base);
            for (const path of ["work/a/b.mp4", "/log/a.mp4", "https://x.com/work/a.mp4", ""]) {
                expect(() => mediaUrl(path)).toThrow("does not start with /work/");
            }
        }
    });
});
