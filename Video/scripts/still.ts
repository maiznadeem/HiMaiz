// npm run still -- <slug> <scene-id>
// An image-only scene: renders one frame of src/<slug>/<scene-id>.tsx to
// HiMaizProject/public/work/<slug>/<scene-id>.jpg (1920x1080 JPEG, at most 300 kB).
// The frame is the scene's `poster` cue. A narration file is optional: without one the scene gets a
// single silent three-second line, so cues like `0` or `{ line: 0, at: "end" }` still work.
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import type { SceneTimeline } from "../src/kit/timing";
import { MAX_STILL_BYTES, encodeJpeg } from "./lib/encode";
import { sceneArgs, scenePaths, UserError } from "./lib/paths";
import { fail, prepare } from "./lib/prepare";
import { ffprobe, timed } from "./lib/proc";
import { bundleScene, pickComposition, renderFrame } from "./lib/render";
import { takeSlot } from "./lib/slots";

async function main() {
    const { slug, sceneId } = sceneArgs(
        process.argv.slice(2),
        "npm run still -- <slug> <scene-id>",
    );
    const times: Record<string, number> = {};
    const paths = scenePaths(slug, sceneId);
    if (!paths.sceneFile) {
        throw new UserError(
            `No scene file. Create ${paths.sceneFileExpected} (see Video/README.md).`,
        );
    }
    let timeline: SceneTimeline;
    if (existsSync(paths.narration)) {
        timeline = (await prepare(slug, sceneId, times)).timeline;
    } else {
        timeline = {
            slug,
            sceneId,
            fps: 30,
            duration: 3,
            lines: [{ text: "", start: 0, end: 2, next: 3 }],
        };
    }
    mkdirSync(paths.work, { recursive: true });
    const serveUrl = await timed("bundle", times, () =>
        bundleScene(paths.sceneFile as string, slug, sceneId),
    );
    const composition = await pickComposition(serveUrl, timeline);
    const props = composition.props as SceneTimeline;
    const frame = props.posterFrame ?? composition.durationInFrames - 1;
    const release = await takeSlot("frame", `still ${slug}/${sceneId}`);
    const png = path.join(paths.work, "still.png");
    await timed("frame", times, () =>
        renderFrame({ serveUrl, composition, timeline: props, frame, out: png }),
    );
    release();
    mkdirSync(paths.outDir, { recursive: true });
    const bytes = await encodeJpeg(png, paths.jpg, MAX_STILL_BYTES);
    const probe = (await ffprobe(paths.jpg)).streams[0];
    const ok =
        probe?.width === 1920 &&
        probe.height === 1080 &&
        statSync(paths.jpg).size <= MAX_STILL_BYTES;
    console.log(
        `Wrote ${paths.jpg}: ${probe?.width}x${probe?.height}, ${bytes} bytes (frame ${frame})`,
    );
    if (!ok) {
        console.error(`FAILED: the still must be 1920x1080 and at most ${MAX_STILL_BYTES} bytes.`);
        process.exit(1);
    }
    console.log("OK");
}

main().catch(fail);
