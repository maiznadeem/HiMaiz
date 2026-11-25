import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { WorkStudy } from "@/lib/work";
import { formatSeconds, SceneVideo } from "./SceneVideo";
import { SceneSpread } from "./Spreads";
import { sceneLine } from "./WorkIndex";

const video = {
    src: "/work/acme/intro.mp4",
    poster: "/work/acme/intro.jpg",
    captions: "/work/acme/intro.vtt",
    seconds: 74,
    transcript: "First part.\n\nSecond part.",
};

function study(overrides: Partial<WorkStudy> = {}): WorkStudy {
    return {
        slug: "acme",
        kind: "job",
        name: "Acme",
        role: "Developer",
        order: 1,
        draft: false,
        summary: "A job.",
        intro: "An intro.",
        stack: [],
        more: [],
        note: "",
        scenes: [
            {
                id: "intro",
                title: "A hook.",
                body: "Read [the post](https://example.com).",
                stats: [{ value: "10,000", label: "users" }],
                video,
            },
        ],
        ...overrides,
    };
}

describe("SceneVideo", () => {
    const html = renderToStaticMarkup(<SceneVideo video={video} title="A hook." />);

    it("shows the poster with native controls and never autoplays or preloads", () => {
        expect(html).toContain('poster="/work/acme/intro.jpg"');
        expect(html).toContain("controls");
        expect(html).toContain('preload="none"');
        expect(html).not.toContain("autoplay");
        expect(html).toContain('<source src="/work/acme/intro.mp4" type="video/mp4"/>');
    });

    it("has English captions on by default", () => {
        expect(html).toMatch(/<track kind="captions" src="\/work\/acme\/intro.vtt" srcLang="en"/);
        expect(html).toMatch(/<track[^>]* default=""/);
    });

    it("offers the narration as text, a paragraph per break", () => {
        expect(html).toContain("<summary>Read it instead</summary>");
        expect(html).toContain("<p>First part.</p><p>Second part.</p>");
    });

    it("adds its play button only once scripts run", () => {
        expect(html).not.toContain("play-pebble");
    });

    it("formats the length", () => {
        expect(formatSeconds(74)).toBe("1 min 14 s");
        expect(formatSeconds(60)).toBe("1 min");
        expect(formatSeconds(45)).toBe("45 s");
    });
});

describe("SceneSpread", () => {
    it("shows the hook, body, stats and video of the scene", () => {
        const s = study();
        const html = renderToStaticMarkup(<SceneSpread study={s} scene={s.scenes[0]} index={0} />);
        expect(html).toContain('id="scene-intro"');
        expect(html).toContain("A hook.");
        expect(html).toContain("10,000");
        expect(html).toContain("users");
        expect(html).toContain("<video");
        expect(html).toContain('href="https://example.com"');
    });

    it("gives a scene with a video or still the media-first layout, and one without the art", () => {
        const s = study();
        const withVideo = renderToStaticMarkup(
            <SceneSpread study={s} scene={s.scenes[0]} index={0} />,
        );
        expect(withVideo).toContain('data-media="has-media"');
        const bare = { ...s.scenes[0], video: undefined };
        const without = renderToStaticMarkup(<SceneSpread study={s} scene={bare} index={0} />);
        expect(without).toContain('data-media="no-media"');
        expect(without).toContain('class="stand-in"');
    });

    it.each(["project", "fyp"] as const)("never links out on a %s page", (kind) => {
        const s = study({ kind });
        const html = renderToStaticMarkup(<SceneSpread study={s} scene={s.scenes[0]} index={0} />);
        expect(html).not.toContain("https://example.com");
        expect(html).toContain("Read the post.");
    });
});

describe("sceneLine", () => {
    it("counts scenes and minutes of video", () => {
        expect(sceneLine(study())).toBe("One scene, about 2 minutes of video");
        const quiet = study();
        quiet.scenes = [
            { ...quiet.scenes[0], video: undefined },
            { ...quiet.scenes[0], id: "b" },
        ];
        quiet.scenes[1].video = undefined;
        expect(sceneLine(quiet)).toBe("Two scenes");
    });
});
