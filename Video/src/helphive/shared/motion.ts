import { Easing, interpolate, spring } from "remotion";
import { cueSeconds, useFrame, useTheme, useTimeline, type Cue } from "../../kit";

const ease = Easing.bezier(0.45, 0, 0.2, 1);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A clock for hand-built pieces: progress and springs measured from narration cues, without
 * per-piece hooks, so pieces can be made in loops.
 */
export function useClock() {
    const timeline = useTimeline();
    const theme = useTheme();
    const frame = useFrame();
    const fps = timeline.fps;
    const t = frame / fps;
    const at = (cue: Cue) => cueSeconds(timeline, cue);
    /** Eased 0..1 from a cue (plus `delay` seconds) over `dur` seconds. */
    const prog = (cue: Cue, dur = 0.6, delay = 0) => {
        const s = at(cue) + delay;
        return interpolate(t, [s, s + Math.max(0.01, dur)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
        });
    };
    /** A spring in the look's feel from a cue (plus `delay` seconds). */
    const spr = (cue: Cue, delay = 0, stiff = 1) => {
        const s = Math.round((at(cue) + delay) * fps);
        if (frame < s) return 0;
        return spring({
            frame: frame - s,
            fps,
            config: {
                damping: theme.motion.damping,
                stiffness: theme.motion.stiffness * stiff,
                mass: theme.motion.mass,
            },
        });
    };
    /** True once the cue has passed. */
    const after = (cue: Cue, delay = 0) => t >= at(cue) + delay;
    return { t, frame, fps, at, prog, spr, after, timeline, theme };
}
