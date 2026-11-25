import { grain, grid } from "./texture";
import type { Theme } from "./types";

/** EZ-Spectrum: radio and spectrum. Night-blue page with a faint graph grid, stone cut-outs, a signal
 * teal next to the orange. Snappy motion with a little overshoot. */
export const ezSpectrum: Theme = {
    name: "ez-spectrum",
    bg: "#1c2631",
    onBg: "#eceae3",
    onBgSoft: "#9fb0bd",
    paper: "#eceae3",
    paperAlt: "#c9d3d6",
    ink: "#191919",
    inkSoft: "#4d5862",
    accent: "#ff4f1a",
    second: "#37b3a4",
    third: "#f0c04a",
    shadow: "rgba(0, 0, 0, 0.45)",
    shadowOffset: [5, 8],
    shadowBlur: 0,
    texture: "grid",
    pageLayers: [grain(1, 0.045), grid("rgba(160,190,205,0.10)")],
    vignette: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.04), rgba(0,0,0,0.35))",
    onAccent: "#fffaf2",
    tape: "rgba(244, 237, 220, 0.75)",
    vein: "rgba(0,0,0,0.25)",
    fonts: { display: "Fraunces", body: "Fraunces", label: "IBM Plex Mono", mono: "IBM Plex Mono" },
    labelWeight: 500,
    labelStyle: "normal",
    labelTransform: "uppercase",
    motion: {
        step: 1,
        damping: 11,
        stiffness: 170,
        mass: 0.8,
        wobbleDeg: 0.3,
        wobbleHz: 0.3,
        boil: false,
        enter: "snap",
    },
    music: {
        // Am9, Fmaj7#11, Cmaj9, G6: glassy, open, a little airborne.
        chords: [
            [45, 52, 55, 59, 60],
            [41, 48, 52, 55, 59],
            [48, 55, 59, 62, 64],
            [43, 50, 52, 55, 59],
        ],
        bpm: 84,
        barsPerChord: 2,
        timbre: "glass",
        pulse: false,
        sparkle: 0.6,
        air: 0.25,
    },
};
