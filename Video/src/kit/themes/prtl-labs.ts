import { dots, fibres, grain } from "./texture";
import type { Theme } from "./types";

/** PRTL Labs: the workshop bench. Kraft paper with fibres and a dot grid, blueprint blue, mono labels.
 * Stop-motion feel: poses held on twos, hand-drawn lines that boil. */
export const prtlLabs: Theme = {
    name: "prtl-labs",
    bg: "#d6c29c",
    onBg: "#1d1b18",
    onBgSoft: "#5e5240",
    paper: "#f4eddc",
    paperAlt: "#e2d6bb",
    ink: "#1d1b18",
    inkSoft: "#5e5546",
    accent: "#ff4f1a",
    second: "#2d4b7d",
    third: "#7d8f55",
    shadow: "rgba(60, 40, 15, 0.35)",
    shadowOffset: [7, 7],
    shadowBlur: 2,
    texture: "kraft",
    pageLayers: [grain(0, 0.07), dots("rgba(60,40,15,0.16)"), fibres([0.35, 0.24, 0.1], 0.16)],
    vignette: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.18), rgba(0,0,0,0.08))",
    onAccent: "#fffaf2",
    tape: "rgba(244, 237, 220, 0.75)",
    vein: "rgba(0,0,0,0.25)",
    fonts: { display: "Fraunces", body: "Fraunces", label: "IBM Plex Mono", mono: "IBM Plex Mono" },
    labelWeight: 500,
    labelStyle: "normal",
    labelTransform: "none",
    motion: {
        step: 2,
        damping: 14,
        stiffness: 120,
        mass: 1,
        wobbleDeg: 1.1,
        wobbleHz: 0.22,
        boil: true,
        enter: "drop",
    },
    music: {
        // Fmaj7, Em7, Dm9, Cmaj7: a warm reed-organ walk down.
        chords: [
            [41, 48, 52, 57, 60],
            [40, 47, 50, 55, 59],
            [38, 45, 48, 53, 57],
            [36, 43, 47, 52, 55],
        ],
        bpm: 66,
        barsPerChord: 1,
        timbre: "reed",
        pulse: true,
        sparkle: 0.2,
        air: 0.7,
    },
};
