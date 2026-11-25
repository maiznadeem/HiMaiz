// npm run frame -- <slug> <scene-id> [--at 3.5,12] [--guides]
// Quick preview without a full render: PNG frames into Video/.cache/frames/<slug>/<scene-id>/.
// Default: one frame early and one late in every narration line, plus the poster frame.
// The voice is made (or taken from the cache) first, so the timing is the real one.
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { openBrowser } from "@remotion/renderer";
import { CACHE_DIR, sceneArgs } from "./lib/paths";
import { fail, prepare } from "./lib/prepare";
import { timed } from "./lib/proc";
import { takeSlot } from "./lib/slots";
import { bundleScene, pickComposition, renderFrame } from "./lib/render";

function option(name: string): string | undefined {
    const i = process.argv.indexOf(name);
    return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
    const { slug, sceneId } = sceneArgs(
        process.argv.slice(2),
        "npm run frame -- <slug> <scene-id> [--at <seconds,seconds>] [--guides]",
    );
    const times: Record<string, number> = {};
    const { timeline, sceneFile } = await prepare(slug, sceneId, times);
    const guides = process.argv.includes("--guides");
    const serveUrl = await timed("bundle", times, () => bundleScene(sceneFile, slug, sceneId));
    const composition = await pickComposition(serveUrl, { ...timeline, guides });
    const props = { ...(composition.props as typeof timeline), guides };
    const last = composition.durationInFrames - 1;

    const wanted: { name: string; frame: number }[] = [];
    const at = option("--at");
    if (at) {
        for (const s of at.split(",")) {
            const f = Math.min(last, Math.round(Number(s) * timeline.fps));
            if (!Number.isFinite(f)) throw new Error(`--at takes seconds, not "${s}"`);
            wanted.push({ name: `t${Number(s).toFixed(2)}s`, frame: f });
        }
    } else {
        timeline.lines.forEach((l, i) => {
            const d = l.end - l.start;
            wanted.push({
                name: `line${i}-early`,
                frame: Math.round((l.start + d * 0.2) * timeline.fps),
            });
            wanted.push({
                name: `line${i}-late`,
                frame: Math.round((l.start + d * 0.9) * timeline.fps),
            });
        });
        wanted.push({ name: "poster", frame: props.posterFrame ?? last });
    }

    const dir = path.join(CACHE_DIR, "frames", slug, sceneId);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const release = await takeSlot("frame", `frame ${slug}/${sceneId}`);
    const browser = await openBrowser("chrome");
    try {
        await timed(`${wanted.length} frames`, times, async () => {
            for (const w of wanted) {
                const out = path.join(dir, `${w.name}-f${w.frame}.png`);
                await renderFrame({
                    serveUrl,
                    composition,
                    timeline: props,
                    frame: w.frame,
                    out,
                    browser,
                });
            }
        });
    } finally {
        await browser.close({ silent: true });
        release();
    }
    console.log(`Frames in ${dir}`);
}

main().catch(fail);
