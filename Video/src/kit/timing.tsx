import React, { createContext, useContext } from "react";
import { Easing, interpolate, spring } from "remotion";
import { THEMES, type Theme, type ThemeName } from "./themes";

/** One narration line as it really sounds: seconds from the start of the video. */
export type TimedLine = {
    text: string;
    /** When the voice starts this line. */
    start: number;
    /** When the voice finishes this line. */
    end: number;
    /** When the next line starts (or the end of the video for the last line). */
    next: number;
};

/** Everything the animation knows about the voice. Built by `npm run scene` from the real audio. */
export type SceneTimeline = {
    slug: string;
    sceneId: string;
    fps: number;
    /** Total length in seconds. */
    duration: number;
    lines: TimedLine[];
    /** Filled in by calculateMetadata from the scene file. */
    theme?: ThemeName;
    posterFrame?: number;
    /** Remotion Studio only: draw the caption-safe guides. */
    guides?: boolean;
};

/**
 * A moment in the narration. A scene author never types a frame number:
 * - `2` is the moment line 2 starts;
 * - `{ line: 2, at: 0.5 }` is halfway through line 2's speech;
 * - `{ line: 2, at: "end" }` is when the voice finishes line 2, `"next"` is when line 3 starts;
 * - `delay` adds seconds (negative to lead slightly).
 */
export type Cue = number | { line: number; at?: number | "end" | "next"; delay?: number };

type Ctx = { timeline: SceneTimeline; theme: Theme; frame: number };
const SceneContext = createContext<Ctx | null>(null);

export function SceneProvider(props: {
    timeline: SceneTimeline;
    frame: number;
    children: React.ReactNode;
}) {
    const theme = THEMES[props.timeline.theme ?? "qoria"];
    return (
        <SceneContext.Provider value={{ timeline: props.timeline, theme, frame: props.frame }}>
            {props.children}
        </SceneContext.Provider>
    );
}

function useScene(): Ctx {
    const ctx = useContext(SceneContext);
    if (!ctx) throw new Error("Kit pieces must be inside the Scene composition.");
    return ctx;
}

/**
 * Set by <Paper>: its children sit on a sheet, not on the page. On a sheet, if the page's text colour
 * would be hard to read against the sheet (the dark ez-spectrum page has light text), pieces get the ink
 * colours instead. Where the page colour already reads on the sheet, nothing changes.
 */
export const SheetContext = createContext<string | null>(null);

function luminance(hex: string): number {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return 0.5;
    const n = parseInt(m[1], 16);
    const lin = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

/** WCAG contrast ratio between two #rrggbb colours. */
export function contrast(a: string, b: string): number {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
}

const onSheetCache = new Map<string, Theme>();

/** The look's colours, adjusted for the surface the piece sits on. */
export const useTheme = (): Theme => {
    const theme = useScene().theme;
    const sheet = useContext(SheetContext);
    if (!sheet || contrast(theme.onBg, sheet) >= 3) return theme;
    const key = `${theme.name}:${sheet}`;
    let t = onSheetCache.get(key);
    if (!t) {
        t = { ...theme, onBg: theme.ink, onBgSoft: theme.inkSoft };
        onSheetCache.set(key, t);
    }
    return t;
};
export const useTimeline = (): SceneTimeline => useScene().timeline;

/** The absolute frame, held on the theme's step (stop-motion looks hold each pose for 2 frames). */
export function useFrame(): number {
    const { frame, theme } = useScene();
    const step = theme.motion.step;
    return Math.floor(frame / step) * step;
}

/** The time of a cue, in seconds. */
export function cueSeconds(timeline: SceneTimeline, cue: Cue): number {
    const c = typeof cue === "number" ? { line: cue } : cue;
    const line = timeline.lines[c.line];
    if (!line) {
        throw new Error(
            `A cue points at line ${c.line}, but the narration has ${timeline.lines.length} lines.`,
        );
    }
    let t: number;
    const at = c.at ?? 0;
    if (at === "end") t = line.end;
    else if (at === "next") t = line.next;
    else t = line.start + (line.end - line.start) * at;
    return Math.max(0, t + (c.delay ?? 0));
}

export function cueFrame(timeline: SceneTimeline, cue: Cue): number {
    return Math.round(cueSeconds(timeline, cue) * timeline.fps);
}

/** Context set by <Shot>: pieces default to starting when their shot starts. */
export const ShotContext = createContext<{ start: number; end: number } | null>(null);

/** The start frame for a piece: its own cue, or the start of the shot it sits in. */
export function useStartFrame(at?: Cue): number {
    const shot = useContext(ShotContext);
    const timeline = useTimeline();
    if (at === undefined) return shot?.start ?? 0;
    return cueFrame(timeline, at);
}

/** How long something takes: a number of seconds, or until another cue. */
export type Span = number | { until: Cue };

export function useSpanFrames(startFrame: number, span: Span | undefined, fallback: number) {
    const timeline = useTimeline();
    if (span === undefined) return Math.max(1, Math.round(fallback * timeline.fps));
    if (typeof span === "number") return Math.max(1, Math.round(span * timeline.fps));
    return Math.max(1, cueFrame(timeline, span.until) - startFrame);
}

/** Eased 0..1 progress from a cue over a span. */
export function useProgress(at?: Cue, span?: Span, fallbackSeconds = 1): number {
    const frame = useFrame();
    const start = useStartFrame(at);
    const length = useSpanFrames(start, span, fallbackSeconds);
    return interpolate(frame, [start, start + length], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.45, 0, 0.2, 1),
    });
}

/** A spring in the theme's motion feel, starting at a cue. 0 before, settles at 1. */
export function useSpringIn(at?: Cue, delaySeconds = 0): number {
    const frame = useFrame();
    const theme = useTheme();
    const { fps } = useTimeline();
    const start = useStartFrame(at) + Math.round(delaySeconds * fps);
    if (frame < start) return 0;
    return spring({
        frame: frame - start,
        fps,
        config: {
            damping: theme.motion.damping,
            stiffness: theme.motion.stiffness,
            mass: theme.motion.mass,
        },
    });
}

const WOBBLE_HOLD = 6;

/** The idle sway of a paper piece, in degrees. Seeded so pieces do not move in step. */
export function useWobble(seed: string, scale = 1): number {
    const theme = useTheme();
    const frame = useFrame();
    const { fps } = useTimeline();
    let phase = 0;
    for (let i = 0; i < seed.length; i++) phase += seed.charCodeAt(i) * (i + 1);
    // The sway holds each pose for a few frames: too small a step to see as a jump, and the frames
    // in between are identical, which keeps long videos small.
    const t = (Math.floor(frame / WOBBLE_HOLD) * WOBBLE_HOLD) / fps;
    const hz = theme.motion.wobbleHz * (0.8 + (phase % 7) / 15);
    return theme.motion.wobbleDeg * scale * Math.sin(2 * Math.PI * hz * t + (phase % 628) / 100);
}

/** For boiling lines: a seed that changes every few frames on stop-motion looks, never on smooth ones. */
export function useBoilSeed(seed: string): string {
    const theme = useTheme();
    const frame = useFrame();
    return theme.motion.boil ? `${seed}:${Math.floor(frame / 4) % 3}` : seed;
}
