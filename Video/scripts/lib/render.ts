import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, type openBrowser } from "@remotion/renderer";
import type { SceneTimeline } from "../../src/kit/timing";
import { CACHE_DIR, VIDEO_DIR } from "./paths";
import { withScene } from "./webpack";

export async function bundleScene(sceneFile: string, slug: string, sceneId: string) {
    return bundle({
        entryPoint: path.join(VIDEO_DIR, "src", "index.ts"),
        webpackOverride: (config) => withScene(config, sceneFile),
        outDir: path.join(CACHE_DIR, "bundles", `${slug}--${sceneId}`),
        enableCaching: true,
    });
}

export async function pickComposition(serveUrl: string, timeline: SceneTimeline) {
    const composition = await selectComposition({
        serveUrl,
        id: "Scene",
        inputProps: timeline,
        logLevel: "error",
    });
    return composition;
}

/** Default browser tabs per render: the machine is shared by several renders at once. */
export const DEFAULT_CONCURRENCY = 6;

/** Tabs for this render: `--concurrency N` on the command line, else VIDEO_CONCURRENCY, else 6. */
export function concurrency(): number {
    const i = process.argv.indexOf("--concurrency");
    const v = i >= 0 ? process.argv[i + 1] : process.env.VIDEO_CONCURRENCY;
    const n = Number(v ?? DEFAULT_CONCURRENCY);
    if (!Number.isInteger(n) || n < 1 || n > 32) {
        throw new Error(`--concurrency must be a whole number from 1 to 32, not "${v}"`);
    }
    return n;
}

export async function renderSilentVideo(opts: {
    serveUrl: string;
    composition: Awaited<ReturnType<typeof pickComposition>>;
    timeline: SceneTimeline;
    out: string;
    frameRange?: [number, number];
}) {
    let lastShown = -1;
    await renderMedia({
        serveUrl: opts.serveUrl,
        composition: opts.composition,
        inputProps: opts.timeline,
        codec: "h264",
        crf: 14,
        muted: true,
        imageFormat: "jpeg",
        jpegQuality: 94,
        pixelFormat: "yuv420p",
        concurrency: concurrency(),
        outputLocation: opts.out,
        frameRange: opts.frameRange ?? null,
        logLevel: "error",
        onProgress: ({ progress }) => {
            const step = Math.floor(progress * 4);
            if (step > lastShown) {
                lastShown = step;
                process.stdout.write(`${Math.round(progress * 100)}% `);
            }
        },
    });
}

export async function renderFrame(opts: {
    serveUrl: string;
    composition: Awaited<ReturnType<typeof pickComposition>>;
    timeline: SceneTimeline;
    frame: number;
    out: string;
    browser?: Awaited<ReturnType<typeof openBrowser>>;
}) {
    await renderStill({
        serveUrl: opts.serveUrl,
        composition: opts.composition,
        inputProps: opts.timeline,
        frame: opts.frame,
        output: opts.out,
        imageFormat: "png",
        logLevel: "error",
        puppeteerInstance: opts.browser,
    });
}
