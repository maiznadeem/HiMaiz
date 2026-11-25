import { existsSync, readFileSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import { parseVtt, type Cue } from "./captions";
import { MAX_MP4_BYTES, MAX_POSTER_BYTES } from "./encode";
import { loadNarration, normText } from "./narration";
import { ffprobe, run } from "./proc";

/** The music bed counts as missing when its music-only stretches are quieter than this. */
export const MUSIC_MAX_UNDER_DB = 24;
export const MUSIC_FLOOR_DBFS = -45;

export type CheckResult = { name: string; ok: boolean; detail: string; skipped?: boolean };

/** Top-level MP4 boxes in order, to see that `moov` comes before `mdat` (faststart). */
function topBoxes(file: string): string[] {
    const buf = readFileSync(file);
    const out: string[] = [];
    let off = 0;
    while (off + 8 <= buf.length && out.length < 50) {
        let size = buf.readUInt32BE(off);
        const type = buf.toString("ascii", off + 4, off + 8);
        if (size === 1) size = Number(buf.readBigUInt64BE(off + 8));
        if (size === 0) size = buf.length - off;
        out.push(type);
        if (size < 8) break;
        off += size;
    }
    return out;
}

/** Integrated loudness and true peak with ffmpeg's EBU R128 meter. */
export async function loudness(file: string): Promise<{ I: number; TP: number }> {
    const { stderr } = await run("ffmpeg", [
        "-hide_banner",
        "-nostats",
        "-i",
        file,
        "-map",
        "0:a:0",
        "-af",
        "ebur128=peak=true",
        "-f",
        "null",
        "-",
    ]);
    const summary = stderr.slice(stderr.lastIndexOf("Summary:"));
    const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
    const TP = Number(/True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS/.exec(summary)?.[1]);
    return { I, TP };
}

/** Decode the audio to mono 16 kHz floats. */
export function decodeMono(file: string): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
        const p = spawn(
            "ffmpeg",
            [
                "-v",
                "error",
                "-i",
                file,
                "-map",
                "0:a:0",
                "-ac",
                "1",
                "-ar",
                "16000",
                "-f",
                "f32le",
                "-",
            ],
            {
                windowsHide: true,
            },
        );
        const chunks: Buffer[] = [];
        p.stdout.on("data", (d: Buffer) => chunks.push(d));
        p.on("error", reject);
        p.on("close", (code) => {
            if (code !== 0) return reject(new Error(`ffmpeg decode failed for ${file}`));
            const b = Buffer.concat(chunks);
            resolve(new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4)));
        });
    });
}

function rmsDbRange(x: Float32Array, sr: number, a: number, b: number): number {
    const i0 = Math.max(0, Math.floor(a * sr));
    const i1 = Math.min(x.length, Math.floor(b * sr));
    let e = 0;
    for (let i = i0; i < i1; i++) e += x[i] * x[i];
    return 10 * Math.log10(e / Math.max(1, i1 - i0) + 1e-12);
}

/**
 * Voice over music: the level during captions (voice) against the level in the gaps between them
 * (music only). Gaps shorter than 0.35 s are ignored, and 0.1 s is trimmed from each side of a gap.
 */
export function voiceOverMusic(x: Float32Array, sr: number, cues: Cue[], duration: number) {
    const gaps: [number, number][] = [];
    let prev = 0;
    for (const c of cues) {
        if (c.start - prev >= 0.35) gaps.push([prev + 0.1, c.start - 0.1]);
        prev = Math.max(prev, c.end);
    }
    if (duration - prev >= 0.35) gaps.push([prev + 0.1, duration - 0.1]);
    const energy = (ranges: [number, number][]) => {
        let e = 0;
        let n = 0;
        for (const [a, b] of ranges) {
            const d = b - a;
            if (d <= 0) continue;
            e += Math.pow(10, rmsDbRange(x, sr, a, b) / 10) * d;
            n += d;
        }
        return { db: n ? 10 * Math.log10(e / n + 1e-12) : -120, secs: n };
    };
    const voice = energy(cues.map((c) => [c.start + 0.05, c.end - 0.05]));
    // Skip the music fade-in and fade-out so the gap level is the bed at its full level.
    const music = energy(gaps.map(([a, b]) => [Math.max(a, 0.7), Math.min(b, duration - 1.6)]));
    const perCue = cues.map((c) => rmsDbRange(x, sr, c.start + 0.05, c.end - 0.05));
    return { voiceDb: voice.db, musicDb: music.db, musicSecs: music.secs, perCue };
}

const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/**
 * Check one scene's three files against the contract (section 3). Durations of 45 to 90 s are
 * enforced for every slug except samples (slugs starting with "_").
 */
export async function checkScene(p: {
    slug: string;
    sceneId: string;
    mp4: string;
    jpg: string;
    vtt: string;
    narration: string;
}): Promise<CheckResult[]> {
    const r: CheckResult[] = [];
    const add = (name: string, ok: boolean, detail: string, skipped = false) =>
        r.push({ name, ok, detail, skipped });
    for (const f of [p.mp4, p.jpg, p.vtt])
        add(`exists ${f.split(/[\\/]/).pop()}`, existsSync(f), f);
    if (!existsSync(p.mp4)) return r;

    const bytes = statSync(p.mp4).size;
    add("mp4 at most 8 MB", bytes <= MAX_MP4_BYTES, `${bytes} bytes`);
    const probe = await ffprobe(p.mp4);
    const v = probe.streams.find((s) => s.codec_type === "video");
    const a = probe.streams.find((s) => s.codec_type === "audio");
    const duration = Number(probe.format.duration);
    add("video H.264", v?.codec_name === "h264", `${v?.codec_name}`);
    add("profile High", v?.profile === "High", `${v?.profile}`);
    add("pixel format yuv420p", v?.pix_fmt === "yuv420p", `${v?.pix_fmt}`);
    add("1920x1080", v?.width === 1920 && v?.height === 1080, `${v?.width}x${v?.height}`);
    add(
        "30 fps",
        v?.r_frame_rate === "30/1" && v?.avg_frame_rate === "30/1",
        `${v?.r_frame_rate} avg ${v?.avg_frame_rate}`,
    );
    add("has audio", Boolean(a), a ? "yes" : "no audio stream");
    add("audio AAC", a?.codec_name === "aac", `${a?.codec_name}`);
    add("audio stereo", a?.channels === 2, `${a?.channels} channels`);
    const abr = Number(a?.bit_rate);
    add("audio 128 kbit/s", close(abr, 128000, 8000), `${abr}`);
    const boxes = topBoxes(p.mp4);
    add(
        "faststart (moov before mdat)",
        boxes.indexOf("moov") >= 0 && boxes.indexOf("moov") < boxes.indexOf("mdat"),
        boxes.join(" "),
    );
    const sample = p.slug.startsWith("_");
    add(
        "45 to 90 seconds",
        sample || (duration >= 45 && duration <= 90),
        `${duration.toFixed(2)} s${sample ? " (sample: length not enforced)" : ""}`,
        sample,
    );

    if (a) {
        const { I, TP } = await loudness(p.mp4);
        add("loudness -17 to -15 LUFS", I >= -17 && I <= -15, `${I} LUFS`);
        add("true peak under -1 dBTP", TP < -1, `${TP} dBTP`);
        add("not silent", I > -60, `${I} LUFS`);
    }

    if (existsSync(p.jpg)) {
        const pb = statSync(p.jpg).size;
        const pp = await ffprobe(p.jpg);
        const ps = pp.streams[0];
        add(
            "poster JPEG 1920x1080",
            ps?.codec_name === "mjpeg" && ps.width === 1920 && ps.height === 1080,
            `${ps?.codec_name} ${ps?.width}x${ps?.height}`,
        );
        add("poster at most 250 kB", pb <= MAX_POSTER_BYTES, `${pb} bytes`);
    }

    if (existsSync(p.vtt)) {
        let cues: Cue[] = [];
        try {
            cues = parseVtt(readFileSync(p.vtt, "utf8"));
            add("captions parse", cues.length > 0, `${cues.length} cues`);
        } catch (err) {
            add("captions parse", false, (err as Error).message);
        }
        if (existsSync(p.narration) && cues.length) {
            const lines = loadNarration(p.narration);
            const want = normText(lines.map((l) => l.text).join(" "));
            const got = normText(cues.map((c) => c.text).join(" "));
            add(
                "captions match narration",
                want === got,
                want === got ? "same text" : `caption text: "${got}"\nnarration: "${want}"`,
            );
        } else if (!existsSync(p.narration)) {
            add("captions match narration", false, `no narration file at ${p.narration}`);
        }
        const ordered = cues.every(
            (c, i) => c.end > c.start && (i === 0 || c.start >= cues[i - 1].end - 0.001),
        );
        add("cues in order", ordered, ordered ? "ok" : "overlapping or empty cue");
        const last = cues.length ? cues[cues.length - 1].end : 0;
        add(
            "cues inside the video",
            last <= duration + 0.05,
            `last cue ends ${last.toFixed(2)} s of ${duration.toFixed(2)} s`,
        );
        if (a && cues.length) {
            const x = await decodeMono(p.mp4);
            const vm = voiceOverMusic(x, 16000, cues, duration);
            const diff = vm.voiceDb - vm.musicDb;
            add(
                "music at least 12 dB under the voice",
                vm.musicSecs >= 0.3 && diff >= 12,
                `voice ${vm.voiceDb.toFixed(1)} dB, music only ${vm.musicDb.toFixed(1)} dB (over ${vm.musicSecs.toFixed(2)} s of gaps), difference ${diff.toFixed(1)} dB`,
            );
            // The bed must really be there: not silent, not a faint hiss. The kit sets it about 16 dB
            // under the voice, so more than 24 dB under, or below -45 dBFS, means it is missing.
            add(
                "music bed present",
                vm.musicSecs >= 0.3 && diff <= MUSIC_MAX_UNDER_DB && vm.musicDb >= MUSIC_FLOOR_DBFS,
                `music only ${vm.musicDb.toFixed(1)} dBFS, ${diff.toFixed(1)} dB under the voice (needs at most ${MUSIC_MAX_UNDER_DB} dB under and at least ${MUSIC_FLOOR_DBFS} dBFS)`,
            );
            const weak = vm.perCue.map((d, i) => ({ d, i })).filter(({ d }) => d - vm.musicDb < 6);
            add(
                "speech in every cue",
                weak.length === 0,
                weak.length
                    ? `quiet cues: ${weak.map((w) => w.i + 1).join(", ")}`
                    : `${vm.perCue.length} cues all at least 6 dB over the music`,
            );
        }
    }
    return r;
}

export function report(results: CheckResult[]): boolean {
    let ok = true;
    for (const c of results) {
        if (!c.ok) ok = false;
        const mark = c.skipped ? "SKIP" : c.ok ? " ok " : "FAIL";
        console.log(`  [${mark}] ${c.name}: ${c.detail}`);
    }
    return ok;
}
