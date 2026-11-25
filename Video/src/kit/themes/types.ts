export const THEME_NAMES = ["qoria", "ez-spectrum", "prtl-labs"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export function isThemeName(value: unknown): value is ThemeName {
    return typeof value === "string" && (THEME_NAMES as readonly string[]).includes(value);
}

export type Theme = {
    name: ThemeName;
    /** The page the scene sits on. */
    bg: string;
    /** Text drawn straight on the page. */
    onBg: string;
    onBgSoft: string;
    /** Cut-paper cards. */
    paper: string;
    paperAlt: string;
    ink: string;
    inkSoft: string;
    /** The site's orange, shared by all three looks. */
    accent: string;
    /** Each look's own second colour. */
    second: string;
    third: string;
    shadow: string;
    shadowOffset: [number, number];
    shadowBlur: number;
    texture: "grain" | "grid" | "kraft";
    /** The page texture: CSS background-image layers, made with the helpers in texture.ts. */
    pageLayers: string[];
    /** A soft light-and-shade gradient over the page. */
    vignette: string;
    /** Text on the accent colour (tags). */
    onAccent: string;
    /** Masking tape on ornaments, and the vein drawn on a leaf. */
    tape: string;
    vein: string;
    /** Font families; each must be loaded in src/kit/fonts.ts. `mono` is for code-like text. */
    fonts: { display: string; body: string; label: string; mono: string };
    labelWeight: number;
    labelStyle: "normal" | "italic";
    labelTransform: "none" | "uppercase";
    motion: {
        /** Hold each pose for this many frames (1 = smooth, 2 = "on twos" stop-motion). */
        step: number;
        damping: number;
        stiffness: number;
        mass: number;
        /** Gentle idle sway of paper pieces, in degrees, and its speed in Hz. */
        wobbleDeg: number;
        wobbleHz: number;
        /** Hand-drawn lines re-draw slightly every few frames ("boiling" lines). */
        boil: boolean;
        enter: "rise" | "snap" | "drop";
    };
    music: {
        /** MIDI note numbers per chord; each chord rings for `barsPerChord` bars. */
        chords: number[][];
        bpm: number;
        barsPerChord: number;
        timbre: "rhodes" | "glass" | "reed";
        /** A very soft kick and shaker under the pad. */
        pulse: boolean;
        /** Sparse melodic notes picked from the chord. */
        sparkle: number;
        /** Vinyl/tape hiss level, 0 to 1. */
        air: number;
    };
};
