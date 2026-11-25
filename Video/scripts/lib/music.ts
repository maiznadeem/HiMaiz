import { seeded } from "../../src/kit/random";
import type { Theme } from "../../src/kit/themes";
import type { Pcm } from "./wav";

/**
 * A soft, slow lo-fi bed, synthesised from scratch (so it has no licence beyond this code). Each look
 * has its own chords, tempo and timbre; the seed makes a given scene sound the same on every render.
 */
export function synthMusic(theme: Theme, seconds: number, seedText: string): Pcm {
    const sr = 48000;
    const n = Math.ceil(seconds * sr);
    const L = new Float32Array(n);
    const R = new Float32Array(n);
    const rand = seeded(`music:${theme.name}:${seedText}`);
    const m = theme.music;
    const beat = 60 / m.bpm;
    const chordLen = beat * 4 * m.barsPerChord;
    const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

    type Note = {
        t0: number;
        dur: number;
        f: number;
        gain: number;
        pan: number;
        kind: "pad" | "bass" | "bell" | "kick";
    };
    const notes: Note[] = [];
    for (let t = 0, c = 0; t < seconds; t += chordLen, c++) {
        const chord = m.chords[c % m.chords.length];
        chord.slice(1).forEach((midi, i) => {
            const humanise = rand() * 0.04;
            notes.push({
                t0: t + humanise + (m.timbre === "rhodes" ? i * 0.025 : 0),
                dur: chordLen + 0.2,
                f: hz(midi),
                gain: 0.16 - i * 0.012,
                pan: (i / (chord.length - 2) - 0.5) * 0.6,
                kind: "pad",
            });
        });
        const beats = 4 * m.barsPerChord;
        for (let b = 0; b < beats; b += m.pulse ? 2 : beats) {
            notes.push({
                t0: t + b * beat,
                dur: m.pulse ? beat * 2 : chordLen,
                f: hz(chord[0] - 12 >= 28 ? chord[0] - 12 : chord[0]),
                gain: 0.22,
                pan: 0,
                kind: "bass",
            });
            if (m.pulse)
                notes.push({ t0: t + b * beat, dur: 0.4, f: 0, gain: 0.3, pan: 0, kind: "kick" });
        }
        for (let e = 0; e < beats * 2; e++) {
            if (rand() < m.sparkle * 0.22) {
                const pick = chord[1 + Math.floor(rand() * (chord.length - 1))] + 12;
                notes.push({
                    t0: t + e * (beat / 2),
                    dur: 1.6,
                    f: hz(pick),
                    gain: 0.07,
                    pan: rand() * 1.2 - 0.6,
                    kind: "bell",
                });
            }
        }
    }

    const TAU = Math.PI * 2;
    for (const note of notes) {
        const release = note.kind === "pad" ? 1.2 : 0.3;
        const s0 = Math.floor(note.t0 * sr);
        const s1 = Math.min(n, Math.floor((note.t0 + note.dur + release) * sr));
        const gl = Math.cos(((note.pan + 1) * Math.PI) / 4);
        const gr = Math.sin(((note.pan + 1) * Math.PI) / 4);
        const phase = rand() * TAU;
        for (let s = Math.max(0, s0); s < s1; s++) {
            const t = (s - s0) / sr;
            let env: number;
            let v: number;
            if (note.kind === "kick") {
                const f = 50 + 70 * Math.exp(-t * 30);
                env = Math.exp(-t * 9);
                v = Math.sin(TAU * f * t);
            } else if (note.kind === "bass") {
                env = Math.min(1, t / 0.02) * Math.exp(-t * (theme.music.pulse ? 1.6 : 0.5));
                v = Math.sin(TAU * note.f * t + phase) + 0.15 * Math.sin(TAU * 2 * note.f * t);
            } else if (note.kind === "bell") {
                env = Math.min(1, t / 0.005) * Math.exp(-t * 3.2);
                v =
                    Math.sin(TAU * note.f * t) +
                    0.2 * Math.sin(TAU * 2.76 * note.f * t) * Math.exp(-t * 8);
            } else {
                const attack = m.timbre === "rhodes" ? 0.015 : m.timbre === "glass" ? 1.4 : 0.5;
                env = Math.min(1, t / attack);
                if (m.timbre === "rhodes") env *= 0.45 + 0.55 * Math.exp(-t * 1.4);
                const vib = m.timbre === "reed" ? 0.004 * Math.sin(TAU * 4.8 * t) : 0;
                const f = note.f * (1 + vib);
                if (m.timbre === "rhodes") {
                    v =
                        Math.sin(TAU * f * t + phase) +
                        0.3 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 6) +
                        0.08 * Math.sin(TAU * 7 * f * t) * Math.exp(-t * 20);
                    v *= 1 + 0.12 * Math.sin(TAU * 4.2 * t);
                } else if (m.timbre === "glass") {
                    v =
                        Math.sin(TAU * f * t + phase) +
                        0.6 * Math.sin(TAU * f * 1.003 * t) +
                        0.12 * Math.sin(TAU * 3 * f * t);
                } else {
                    v =
                        Math.sin(TAU * f * t + phase) +
                        0.22 * Math.sin(TAU * 3 * f * t) +
                        0.08 * Math.sin(TAU * 5 * f * t);
                }
            }
            const endFade = Math.min(1, (s1 - s) / (release * sr));
            const out = v * env * endFade * note.gain;
            L[s] += out * gl;
            R[s] += out * gr;
        }
    }

    // Air: soft filtered hiss, plus a little vinyl crackle on the warmer looks.
    let lp = 0;
    let lpR = 0;
    for (let s = 0; s < n; s++) {
        lp += 0.05 * (rand() * 2 - 1 - lp);
        lpR += 0.05 * (rand() * 2 - 1 - lpR);
        let crackle = 0;
        if (m.timbre !== "glass" && rand() < 0.00012) crackle = (rand() - 0.5) * 0.35;
        L[s] += lp * 0.05 * m.air + crackle;
        R[s] += lpR * 0.05 * m.air + crackle * 0.7;
    }

    // Warm low-pass (lo-fi), fades, and normalise to a -6 dBFS peak. The mix sets the real level.
    for (const ch of [L, R]) {
        let y = 0;
        const a = 1 - Math.exp((-TAU * (m.timbre === "glass" ? 5200 : 3200)) / sr);
        for (let s = 0; s < n; s++) {
            y += a * (ch[s] - y);
            ch[s] = y;
        }
    }
    let peak = 1e-9;
    for (let s = 0; s < n; s++) {
        const t = s / sr;
        const fade = Math.min(1, t / 0.6, (seconds - t) / 1.5);
        L[s] *= Math.max(0, fade);
        R[s] *= Math.max(0, fade);
        peak = Math.max(peak, Math.abs(L[s]), Math.abs(R[s]));
    }
    const g = 0.5 / peak;
    for (let s = 0; s < n; s++) {
        L[s] *= g;
        R[s] *= g;
    }
    return { sampleRate: sr, channels: 2, data: [L, R] };
}
