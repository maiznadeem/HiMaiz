import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { afterAll, describe, expect, it } from "vitest";
import {
    formatSpan,
    getWorkStudies,
    getWorkStudy,
    nextStudy,
    renderWorkMarkdown,
    videoMinutes,
    WorkFileError,
} from "./work";
import type { MediaManifest } from "./media";

const fixture = (name: string) => path.join(__dirname, "__fixtures__", "work", name);
const publicDir = path.join(__dirname, "__fixtures__", "work-public");
const load = (dir: string) => getWorkStudies({ dir, publicDir, includeDrafts: true });

describe("getWorkStudies", () => {
    it("lists employers, then the final year project, then projects, each by order", () => {
        expect(load(fixture("valid")).map((s) => s.slug)).toEqual([
            "b-job",
            "a-job",
            "final",
            "side-project",
        ]);
    });

    it("reads every field of a case study", () => {
        const study = getWorkStudy("b-job", { dir: fixture("valid"), publicDir });
        expect(study).toMatchObject({
            kind: "job",
            name: "Newer Job",
            role: "Backend Lead",
            start: "2025-03",
            end: "present",
            place: "Remote",
            order: 1,
            draft: false,
            summary: "The newer job.",
            stack: ["Django", "PostgreSQL"],
            more: ["Also did this smaller thing."],
            note: "A closing note with a [link](https://example.com).",
        });
        expect(study?.scenes.map((s) => s.id)).toEqual(["opening", "still", "last"]);
        expect(study?.scenes[0]).toMatchObject({
            title: "The first scene.",
            kicker: "Start",
            body: "What was wrong, what I did, what happened.",
            stats: [{ value: "10,000", label: "concurrent users" }],
            video: { src: "/work/b-job/opening.mp4", seconds: 74, transcript: "The narration." },
        });
        expect(study?.scenes[1].image).toMatchObject({ alt: "A cut paper chart.", width: 1600 });
        expect(study?.scenes[2].stats).toEqual([]);
    });

    it("defaults the optional lists", () => {
        const study = getWorkStudy("a-job", { dir: fixture("valid"), publicDir });
        expect(study).toMatchObject({ stack: [], more: [], note: "", draft: false });
    });

    it("leaves drafts out unless asked", () => {
        const dir = fixture("drafts");
        const slugs = (includeDrafts: boolean) =>
            getWorkStudies({ dir, publicDir, includeDrafts }).map((s) => s.slug);
        expect(slugs(false)).toEqual(["live"]);
        expect(slugs(true)).toEqual(["wip", "live"]);
    });

    it.each([
        ["bad-slug", "My Study.md", "slug"],
        ["bad-ext", "study.markdown", "lowercase .md"],
    ])("throws for %s", (name, file, field) => {
        const run = () => load(fixture(name));
        expect(run).toThrow(WorkFileError);
        expect(run).toThrow(`content/work/${file}`);
        expect(run).toThrow(field);
    });

    // The orchestrator runs Prettier on every content file it brings in: 4-space YAML, the stack
    // list broken over lines. The loader reads that form, and Prettier leaves long lines inside
    // a block scalar alone, so a body is never rewrapped.
    it("reads a Prettier-formatted file, and Prettier leaves its long body lines alone", async () => {
        const file = path.join(fixture("prettier"), "formatted.md");
        const [study] = load(fixture("prettier"));
        expect(study.stack).toHaveLength(8);
        expect(study.stack[1]).toBe("Cloudflare Workers");
        expect(study.scenes[0].body).toContain(
            "far longer than one hundred columns, so the test can show that Prettier leaves a line",
        );
        expect(study.scenes[0].stats[0].value).toBe("22 → 10 ms");
        const prettier = await import("prettier");
        const source = fs.readFileSync(file, "utf8");
        const options = await prettier.resolveConfig(file, { editorconfig: true });
        expect(await prettier.format(source, { ...options, filepath: file })).toBe(source);
    });

    it("returns nothing for a missing directory", () => {
        expect(load(fixture("does-not-exist"))).toEqual([]);
    });
});

// Each rule below starts from a valid job and changes one thing, written to a fresh folder.
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "work-test-"));
afterAll(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

const scene = (id: string) => ({ id, title: "A title.", body: "A body." });
const base = () => ({
    kind: "job",
    name: "Job",
    role: "Developer",
    start: "2024-01",
    end: "2025-01",
    order: 1,
    summary: "A job.",
    intro: "An intro.",
    scenes: [scene("one"), scene("two"), scene("three")],
});

type Data = Record<string, unknown> & { scenes: Record<string, unknown>[] };

function loadOne(change: (data: Data) => void, note = "", slug = "study") {
    const data = base() as Data;
    change(data);
    const dir = fs.mkdtempSync(path.join(tmpRoot, "case-"));
    fs.writeFileSync(path.join(dir, `${slug}.md`), matter.stringify(note, data));
    return () => load(dir);
}

describe("validation", () => {
    it("accepts the base case", () => {
        expect(loadOne(() => {})()).toHaveLength(1);
    });

    // Real case studies carry these, and the contract sets no length for them.
    it("accepts long more lines, long stat values with arrows, a long intro and role", () => {
        const [study] = loadOne((d) => {
            d.more = Array(8).fill("word ".repeat(40).trim());
            d.scenes[0].stats = [
                { value: "22 → 10 ms", label: "a" },
                { value: "2 of 350,794", label: "b" },
                { value: "1 → 0, 2 → 0, 3,310 → 54 ms", label: "c" },
            ];
            d.intro = "word ".repeat(150).trim();
            d.role = "r".repeat(120);
            d.stack = ["A very long tool name that goes on and on"];
        })();
        expect(study.more).toHaveLength(8);
        expect(study.scenes[0].stats.map((s) => s.value)).toEqual([
            "22 → 10 ms",
            "2 of 350,794",
            "1 → 0, 2 → 0, 3,310 → 54 ms",
        ]);
    });

    it.each<[string, (d: Data) => void, string]>([
        ["a missing name", (d) => delete d.name, "name is required"],
        ["an unknown kind", (d) => (d.kind = "gig"), 'kind must be "job", "fyp" or "project"'],
        ["a job without start", (d) => delete d.start, "start is required"],
        ["a job without end", (d) => delete d.end, "end is required"],
        ["a day in start", (d) => (d.start = "2024-01-05"), "start must be a month (YYYY-MM)"],
        ["a bad end", (d) => (d.end = "soon"), 'end must be a month (YYYY-MM) or "present"'],
        ["end before start", (d) => (d.end = "2023-12"), "end must not be before start"],
        ["order zero", (d) => (d.order = 0), "order must be 1 or more"],
        ["a long summary", (d) => (d.summary = "x".repeat(161)), "summary must be at most 160"],
        ["a two-line summary", (d) => (d.summary = "a\nb"), "summary must be a single line"],
        ["a semicolon", (d) => (d.intro = "One; two."), "intro must not use semicolons"],
        ["a long dash", (d) => (d.role = "Lead — backend"), "role must not use semicolons"],
        ["an unknown field", (d) => (d.sumary = "typo"), "sumary is not a known field"],
        ["nine stack items", (d) => (d.stack = Array(9).fill("x")), "stack must have at most 8"],
        ["nine more items", (d) => (d.more = Array(9).fill("x")), "more must have at most 8"],
        ["two scenes for a job", (d) => d.scenes.pop(), "scenes must have 3 to 6 scenes"],
        [
            "seven scenes for a job",
            (d) => d.scenes.push(...["d", "e", "f", "g"].map(scene)),
            "scenes must have 3 to 6 scenes",
        ],
        [
            "four scenes for a project",
            (d) => {
                d.kind = "project";
                d.scenes.push(scene("four"));
            },
            "scenes must have 1 to 3 scenes for kind project",
        ],
        [
            "one scene for a final year project",
            (d) => {
                d.kind = "fyp";
                d.scenes.splice(1);
            },
            "scenes must have 2 to 4 scenes for kind fyp",
        ],
        ["a repeated scene id", (d) => (d.scenes[1].id = "one"), 'scenes[1].id repeats "one"'],
        ["a bad scene id", (d) => (d.scenes[0].id = "Load Test"), "scenes[0].id must be"],
        [
            "a long title",
            (d) => (d.scenes[0].title = "x".repeat(61)),
            "scenes[0].title must be at most 60",
        ],
        [
            "a long kicker",
            (d) => (d.scenes[0].kicker = "x".repeat(31)),
            "scenes[0].kicker must be at most 30",
        ],
        [
            "a body over 110 words",
            (d) => (d.scenes[2].body = "word ".repeat(111)),
            "scenes[2].body must be at most 110 words",
        ],
        ["a missing body", (d) => delete d.scenes[0].body, "scenes[0].body is required"],
        [
            "four stats",
            (d) => (d.scenes[0].stats = Array(4).fill({ value: "1", label: "x" })),
            "scenes[0].stats must have at most 3",
        ],
        [
            "an unquoted stat value",
            (d) => (d.scenes[0].stats = [{ value: 10, label: "x" }]),
            "scenes[0].stats[0].value must be a quoted string",
        ],
        [
            "a long stat label",
            (d) => (d.scenes[0].stats = [{ value: "1", label: "x".repeat(41) }]),
            "scenes[0].stats[0].label must be at most 40",
        ],
    ])("rejects %s", (_name, change, message) => {
        const run = loadOne(change);
        expect(run).toThrow(WorkFileError);
        expect(run).toThrow("content/work/study.md: ");
        expect(run).toThrow(message);
    });

    it("rejects a second final year project", () => {
        const dir = fs.mkdtempSync(path.join(tmpRoot, "case-"));
        const fyp = { ...base(), kind: "fyp", scenes: [scene("one"), scene("two")] };
        fs.writeFileSync(path.join(dir, "first.md"), matter.stringify("", fyp));
        fs.writeFileSync(path.join(dir, "second.md"), matter.stringify("", fyp));
        expect(() => load(dir)).toThrow(
            "content/work/first.md and content/work/second.md: kind is fyp in each, and only one Final Year Project may exist",
        );
    });

    it("names the file when its front matter is not valid YAML", () => {
        const dir = fs.mkdtempSync(path.join(tmpRoot, "case-"));
        const broken = ["---", "kind: job", "name: [unclosed", "---", ""].join("\n");
        fs.writeFileSync(path.join(dir, "broken.md"), broken);
        const run = () => load(dir);
        expect(run).toThrow(WorkFileError);
        expect(run).toThrow("content/work/broken.md: front matter is not valid YAML at line");
    });

    it("reports a misspelt field as unknown, not the real one as missing", () => {
        const run = loadOne((d) => {
            d.scenes[0].titel = d.scenes[0].title;
            delete d.scenes[0].title;
        });
        expect(run).toThrow(
            "content/work/study.md: scenes[0].titel is not a known field (is it a misspelling of title?)",
        );
    });

    it("rejects a semicolon in the closing note", () => {
        expect(loadOne(() => {}, "Done; dusted.")).toThrow(
            "closing note must not use semicolons or long dashes",
        );
    });

    const video = (slug: string, id: string) => ({
        src: `/work/${slug}/${id}.mp4`,
        poster: `/work/${slug}/${id}.jpg`,
        captions: `/work/${slug}/${id}.vtt`,
        seconds: 60,
        transcript: "Words.",
    });

    it("accepts media that is the scene's own and on disk", () => {
        const run = loadOne(
            (d) => (d.scenes[0] = { ...scene("opening"), video: video("b-job", "opening") }),
            "",
            "b-job",
        );
        expect(run()[0].scenes[0].video?.poster).toBe("/work/b-job/opening.jpg");
    });

    it("rejects media named for another scene", () => {
        const run = loadOne(
            (d) => (d.scenes[0] = { ...scene("intro"), video: video("b-job", "opening") }),
            "",
            "b-job",
        );
        expect(run).toThrow("scenes[0].video.src must be /work/b-job/intro.mp4");
    });

    it("rejects media that is not on disk", () => {
        const run = loadOne(
            (d) => (d.scenes[0] = { ...scene("gone"), video: video("b-job", "gone") }),
            "",
            "b-job",
        );
        expect(run).toThrow(
            "scenes[0].video.src points to a missing file: public/work/b-job/gone.mp4",
        );
    });

    it("rejects an image in a format the contract does not allow", () => {
        const run = loadOne(
            (d) =>
                (d.scenes[0] = {
                    ...scene("still"),
                    image: { src: "/work/b-job/still.png", alt: "A still.", width: 1, height: 1 },
                }),
            "",
            "b-job",
        );
        expect(run).toThrow("scenes[0].image.src must be /work/b-job/still.jpg or");
    });
});

describe("videos on the media host", () => {
    const src = "/work/b-job/opening.mp4";
    const onDisk = fs.readFileSync(path.join(publicDir, "work", "b-job", "opening.mp4"));
    const sha256 = createHash("sha256").update(onDisk).digest("hex");
    const uploaded = { bytes: onDisk.length, sha256, seconds: 60 };
    const run = (id: string, media: MediaManifest) => {
        const data = base() as Data;
        data.scenes[0] = {
            ...scene(id),
            video: {
                src: `/work/b-job/${id}.mp4`,
                poster: `/work/b-job/${id}.jpg`,
                captions: `/work/b-job/${id}.vtt`,
                seconds: 60,
                transcript: "Words.",
            },
        };
        const dir = fs.mkdtempSync(path.join(tmpRoot, "media-"));
        fs.writeFileSync(path.join(dir, "b-job.md"), matter.stringify("", data));
        return () => getWorkStudies({ dir, publicDir, includeDrafts: true, media });
    };

    it("accepts a video that matches its uploaded copy", () => {
        expect(run("opening", { [src]: uploaded })()).toHaveLength(1);
    });

    it("rejects a video that is not in the manifest", () => {
        expect(run("opening", {})).toThrow(
            "content/work/b-job.md: scenes[0].video.src is not in content/work/media.json: upload it with npm run media:upload",
        );
    });

    it("rejects a video that differs from its uploaded copy", () => {
        expect(run("opening", { [src]: { ...uploaded, sha256: "0".repeat(64) } })).toThrow(
            "public/work/b-job/opening.mp4 differs from the uploaded copy in content/work/media.json: re-upload it with npm run media:upload",
        );
    });

    it("rejects an uploaded video over the size limit", () => {
        expect(run("opening", { [src]: { ...uploaded, bytes: 8_000_001 } })).toThrow(
            "is 8000001 bytes, over the 8000000 byte limit",
        );
    });

    it("needs no copy of an uploaded video on disk, but still checks the poster on disk", () => {
        // gone.mp4 is only in the manifest, so the video passes; its poster is checked in public/.
        expect(run("gone", { "/work/b-job/gone.mp4": uploaded })).toThrow(
            "scenes[0].video.poster points to a missing file: public/work/b-job/gone.jpg",
        );
    });
});

describe("nextStudy", () => {
    const studies = load(fixture("valid"));
    const next = (slug: string, list = studies) => nextStudy(list, slug)?.slug;

    it("leads employer to employer, then to the final year project, then to the projects", () => {
        expect(next("b-job")).toBe("a-job");
        expect(next("a-job")).toBe("final");
        expect(next("final")).toBe("side-project");
    });

    it("never leads a personal project to an employer", () => {
        expect(next("side-project")).toBe(undefined);
        const projects = studies.filter((s) => s.kind === "project");
        const second = { ...projects[0], slug: "second", order: 2 };
        expect(next("side-project", [...studies, second])).toBe("second");
        expect(next("second", [...studies, second])).toBe(undefined);
    });

    it("leads the last employer to the first project when there is no final year project", () => {
        const noFyp = studies.filter((s) => s.kind !== "fyp");
        expect(next("a-job", noFyp)).toBe("side-project");
        expect(
            next(
                "a-job",
                noFyp.filter((s) => s.kind === "job"),
            ),
        ).toBe(undefined);
    });

    it("has nothing after a lone or unknown case study", () => {
        expect(next("b-job", studies.slice(0, 1))).toBe(undefined);
        expect(next("missing")).toBe(undefined);
    });
});

describe("formatSpan", () => {
    it.each([
        [{ start: "2025-03", end: "present" }, "Mar 2025 to now"],
        [{ start: "2022-06", end: "2025-02" }, "Jun 2022 to Feb 2025"],
        [{ start: "2025-03" }, "Since Mar 2025"],
        [{ end: "2024-12" }, "Until Dec 2024"],
        [{}, ""],
    ])("formats %o", (study, text) => {
        expect(formatSpan(study)).toBe(text);
    });
});

describe("videoMinutes", () => {
    it("adds up the video seconds and rounds up", () => {
        const [study] = load(fixture("valid"));
        expect(videoMinutes(study)).toBe(2);
        expect(videoMinutes({ scenes: [] })).toBe(0);
    });
});

describe("renderWorkMarkdown", () => {
    it("keeps links on employer pages", () => {
        expect(renderWorkMarkdown("[a](https://example.com)", "job")).toContain(
            '<a href="https://example.com">a</a>',
        );
    });

    it("never links out from a project page", () => {
        const project = load(fixture("valid")).find((s) => s.kind === "project")!;
        const html = renderWorkMarkdown(project.scenes[0].body, project.kind);
        expect(html).not.toContain("<a");
        expect(html).toContain("the repo");
        expect(html).toContain("&lt;a href=");
        expect(renderWorkMarkdown("<https://example.com>", "project")).not.toContain("<a");
    });

    it("never links out from the final year project page", () => {
        const html = renderWorkMarkdown("One [link](https://example.com).", "fyp");
        expect(html).not.toContain("<a");
        expect(html).toContain("One link.");
    });

    it("keeps headings under the scene title", () => {
        const html = renderWorkMarkdown("# Top\n\n## Mid", "job");
        expect(html).toContain("<h3>Top</h3>");
        expect(html).toContain("<h3>Mid</h3>");
    });
});
