import type { SceneTimeline } from "../../src/kit/timing";
import { DEFAULT_PAUSE_MS, type NarrationLine } from "./narration";
import { run } from "./proc";
import { readWav, writeWav, type Pcm } from "./wav";

export const FPS = 30;
/** Music alone before the first word, and after the last. */
export const LEAD_IN = 1.2;
export const TAIL = 2.0;
/** How far the music sits under the voice before ducking (dB). Ducking takes it further down. */
export const MUSIC_UNDER_VOICE_DB = 16;
export const TARGET_LUFS = -16;
export const TARGET_TP = -1.5;

/** Lay the voice lines end to end with their pauses; return the timeline and the voice track. */
export function buildVoiceTrack(
    lines: NarrationLine[],
    files: string[],
    slug: string,
    sceneId: string,
): { timeline: SceneTimeline; voice: Pcm } {
    const clips = files.map((f) => readWav(f));
    const sr = clips[0].sampleRate;
    let t = LEAD_IN;
    const timed = lines.map((line, i) => {
        const dur = clips[i].data[0].length / clips[i].sampleRate;
        const start = t;
        const end = start + dur;
        t = end + (line.pauseAfterMs ?? DEFAULT_PAUSE_MS) / 1000;
        return { text: line.text, start, end, next: t };
    });
    const lastEnd = timed[timed.length - 1].end;
    const duration = Math.ceil((lastEnd + TAIL) * FPS) / FPS;
    timed[timed.length - 1].next = duration;
    const out = new Float32Array(Math.round(duration * sr));
    timed.forEach((tl, i) => {
        const clip = clips[i].data[0];
        out.set(
            clip.subarray(0, Math.max(0, out.length - Math.round(tl.start * sr))),
            Math.round(tl.start * sr),
        );
    });
    return {
        timeline: { slug, sceneId, fps: FPS, duration, lines: timed },
        voice: { sampleRate: sr, channels: 1, data: [out] },
    };
}

/** RMS in dB of the loud (speech) parts of a mono signal: 50 ms windows above -45 dBFS. */
export function activeRmsDb(x: Float32Array, sr: number): number {
    const win = Math.round(sr * 0.05);
    let sum = 0;
    let count = 0;
    for (let i = 0; i + win <= x.length; i += win) {
        let e = 0;
        for (let j = i; j < i + win; j++) e += x[j] * x[j];
        const ms = e / win;
        if (ms > Math.pow(10, -4.5)) {
            sum += ms;
            count++;
        }
    }
    return count ? 10 * Math.log10(sum / count) : -120;
}

export function rmsDb(channels: Float32Array[]): number {
    let e = 0;
    let n = 0;
    for (const ch of channels) {
        for (let i = 0; i < ch.length; i++) e += ch[i] * ch[i];
        n += ch.length;
    }
    return 10 * Math.log10(e / Math.max(1, n) + 1e-12);
}

/**
 * Mix voice and music: music set {@link MUSIC_UNDER_VOICE_DB} under the speech, ducked further by a
 * sidechain compressor while the voice speaks, then two-pass loudness normalisation to -16 LUFS with
 * true peak held under -1.5 dBTP.
 */
export async function mixAudio(opts: {
    voiceWav: string;
    musicWav: string;
    voice: Pcm;
    music: Pcm;
    premixWav: string;
    outWav: string;
    duration: number;
}): Promise<{ musicGainDb: number; loudnorm: Record<string, string> }> {
    const voiceDb = activeRmsDb(opts.voice.data[0], opts.voice.sampleRate);
    const musicDb = rmsDb(opts.music.data);
    const musicGainDb = voiceDb - MUSIC_UNDER_VOICE_DB - musicDb;
    const graph = [
        "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[v][key]",
        `[1:a]volume=${musicGainDb.toFixed(2)}dB[m]`,
        "[m][key]sidechaincompress=threshold=0.02:ratio=4:attack=80:release=600[md]",
        "[v][md]amix=inputs=2:normalize=0:duration=longest[mix]",
    ].join(";");
    await run("ffmpeg", [
        "-v",
        "error",
        "-y",
        "-i",
        opts.voiceWav,
        "-i",
        opts.musicWav,
        "-filter_complex",
        graph,
        "-map",
        "[mix]",
        "-t",
        opts.duration.toFixed(3),
        "-c:a",
        "pcm_f32le",
        opts.premixWav,
    ]);
    const ln = `loudnorm=I=${TARGET_LUFS}:TP=${TARGET_TP}:LRA=11`;
    const pass1 = await run("ffmpeg", [
        "-hide_banner",
        "-i",
        opts.premixWav,
        "-af",
        `${ln}:print_format=json`,
        "-f",
        "null",
        "-",
    ]);
    const json = pass1.stderr.slice(pass1.stderr.lastIndexOf("{"));
    const m = JSON.parse(json.slice(0, json.indexOf("}") + 1)) as Record<string, string>;
    const af =
        `${ln}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
        `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
    await run("ffmpeg", [
        "-v",
        "error",
        "-y",
        "-i",
        opts.premixWav,
        "-af",
        af,
        "-ar",
        "48000",
        "-c:a",
        "pcm_f32le",
        opts.outWav,
    ]);
    return { musicGainDb, loudnorm: m };
}

export function writePcm(file: string, pcm: Pcm) {
    writeWav(file, pcm);
}
