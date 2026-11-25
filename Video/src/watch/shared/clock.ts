import { Easing, spring } from "remotion";
import { useFrame, useTheme, useTimeline } from "../../kit";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Seconds-based timing for a scene that is drawn as one picture rather than in kit Shots.
 * S(i, at) is a moment inside line i's speech, E(i) its end, N(i) when the next line starts.
 */
export function useClock() {
    const tl = useTimeline();
    const theme = useTheme();
    const frame = useFrame();
    const fps = tl.fps;
    const t = frame / fps;
    const line = (i: number) => tl.lines[Math.max(0, Math.min(i, tl.lines.length - 1))];
    const S = (i: number, at = 0) => {
        const l = line(i);
        return l.start + (l.end - l.start) * at;
    };
    const E = (i: number) => line(i).end;
    const N = (i: number) => line(i).next;
    /** Eased 0..1 between two moments. */
    const p = (a: number, b: number) =>
        b <= a ? (t >= a ? 1 : 0) : ease(clamp01((t - a) / (b - a)));
    /** Linear 0..1 between two moments. */
    const lin = (a: number, b: number) => (b <= a ? (t >= a ? 1 : 0) : clamp01((t - a) / (b - a)));
    /** A settle-in spring in the look's feel, from a moment. */
    const sp = (a: number) =>
        t < a
            ? 0
            : spring({
                  frame: (t - a) * fps,
                  fps,
                  config: {
                      damping: theme.motion.damping,
                      stiffness: theme.motion.stiffness,
                      mass: theme.motion.mass,
                  },
              });
    /** A quicker pop with a little overshoot, for small pieces landing. */
    const pop = (a: number) =>
        t < a ? 0 : spring({ frame: (t - a) * fps, fps, config: { damping: 12, stiffness: 170 } });
    return { t, fps, frame, S, E, N, p, lin, sp, pop, duration: tl.duration };
}

export type Clock = ReturnType<typeof useClock>;
