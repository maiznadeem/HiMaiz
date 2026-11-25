import { rmSync, statSync } from "node:fs";
import path from "node:path";
import { run } from "./proc";

export const MAX_MP4_BYTES = 8_000_000;
export const MAX_POSTER_BYTES = 250_000;
export const MAX_STILL_BYTES = 300_000;

/** Final encode to the contract's spec: H.264 High yuv420p 1080p30, AAC 128k stereo, faststart. */
export async function encodeFinal(opts: {
    video: string;
    audio: string;
    out: string;
    duration: number;
    work: string;
}): Promise<{ bytes: number; passes: number }> {
    // Budget leaves room for the audio (128 kbit/s) and container overhead under 8 MB.
    const budgetKbps = Math.floor(((MAX_MP4_BYTES * 0.93 * 8) / opts.duration - 136_000) / 1000);
    const maxrate = Math.min(6000, budgetKbps);
    const common = (videoArgs: string[], output: string[] = [opts.out]) => [
        "-v",
        "error",
        "-y",
        "-i",
        opts.video,
        "-i",
        opts.audio,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "slow",
        // Remotion's intermediate is full-range (yuvj420p); convert to the standard TV range.
        "-vf",
        "scale=in_range=pc:out_range=tv,format=yuv420p",
        "-color_range",
        "tv",
        // A keyframe every 10 s: the paper grain makes keyframes the costliest part of the file.
        "-tune",
        "animation",
        "-r",
        "30",
        "-g",
        "300",
        "-colorspace",
        "bt709",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        ...videoArgs,
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ac",
        "2",
        "-ar",
        "48000",
        "-t",
        opts.duration.toFixed(3),
        "-movflags",
        "+faststart",
        ...output,
    ];
    await run(
        "ffmpeg",
        common(["-crf", "20", "-maxrate", `${maxrate}k`, "-bufsize", `${maxrate * 2}k`]),
    );
    let bytes = statSync(opts.out).size;
    if (bytes <= MAX_MP4_BYTES) return { bytes, passes: 1 };

    // Over budget: two-pass at a fixed average that is sure to fit.
    const target = Math.floor(budgetKbps * 0.9);
    const log = path.join(opts.work, "x264pass");
    const rate = (n: number) => [
        "-b:v",
        `${target}k`,
        "-maxrate",
        `${target * 2}k`,
        "-bufsize",
        `${target * 4}k`,
        "-pass",
        `${n}`,
        "-passlogfile",
        log,
    ];
    const nul = process.platform === "win32" ? "NUL" : "/dev/null";
    await run("ffmpeg", common(rate(1), ["-f", "mp4", nul]));
    await run("ffmpeg", common(rate(2)));
    for (const f of [`${log}-0.log`, `${log}-0.log.mbtree`]) rmSync(f, { force: true });
    bytes = statSync(opts.out).size;
    return { bytes, passes: 2 };
}

/** The poster: a PNG frame to a 1920x1080 JPEG of at most 250 kB. */
export function encodePoster(png: string, out: string): Promise<number> {
    return encodeJpeg(png, out, MAX_POSTER_BYTES);
}

/** A PNG frame to a 1920x1080 JPEG, at the best quality that fits under `maxBytes`. */
export async function encodeJpeg(png: string, out: string, maxBytes: number): Promise<number> {
    for (const q of [2, 3, 4, 5, 6, 8, 10, 13]) {
        await run("ffmpeg", [
            "-v",
            "error",
            "-y",
            "-i",
            png,
            "-vf",
            "scale=1920:1080",
            "-q:v",
            `${q}`,
            out,
        ]);
        const bytes = statSync(out).size;
        if (bytes <= maxBytes * 0.96) return bytes;
    }
    throw new Error(`${out} stays over ${maxBytes} bytes even at low JPEG quality.`);
}
