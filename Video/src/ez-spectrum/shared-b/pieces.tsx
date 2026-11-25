// Pieces shared by the operations and overnight-waves scenes (EZ-Spectrum, maker b).
// A study is a small paper card with a tower mark, a worker is a small box with a gear, the database
// is a paper cylinder. Everything is drawn in safe-area pixels.
import React, { type CSSProperties } from "react";
import { Easing, interpolate, spring } from "remotion";
import {
    cueFrame,
    jitter,
    Paper,
    paperShadow,
    roughPath,
    useFrame,
    useTheme,
    useTimeline,
    type Cue,
    type Point,
} from "../../kit";

export const MONO = "IBM Plex Mono";
export const SERIF = "Fraunces";
export const GREEN = "#5cc98a";
export const RED = "#e0533d";
export const GREY = "#8c97a0";

const EASE = Easing.bezier(0.45, 0, 0.2, 1);

/** A cue at a point inside a narration line. */
export const L = (line: number, at: number | "end" | "next" = 0, delay = 0): Cue => ({
    line,
    at,
    delay,
});

/**
 * Plain functions over the current frame, so they can be used inside loops (unlike hooks).
 * `p(cue, seconds | {until})` is eased 0..1 progress; `s(cue)` is a spring in the look's feel.
 */
export function useClock() {
    const frame = useFrame();
    const timeline = useTimeline();
    const theme = useTheme();
    const fps = timeline.fps;
    const at = (c: Cue) => cueFrame(timeline, c);
    const p = (c: Cue, span: number | { until: Cue } = 0.8, linear = false) => {
        const a = at(c);
        const b = typeof span === "number" ? a + span * fps : at(span.until);
        return interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: linear ? undefined : EASE,
        });
    };
    const s = (c: Cue, delay = 0) => {
        const start = at(c) + Math.round(delay * fps);
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
    };
    /** Seconds since a cue (negative before it). */
    const since = (c: Cue) => (frame - at(c)) / fps;
    return { frame, fps, t: frame / fps, at, p, s, since, theme };
}

/**
 * The pictures, drawn 10% larger than the safe area and anchored at its top centre, so they use the frame
 * down to about 86% of its height. The site's captions only cover the band under that.
 */
export function Frame(props: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                transform: "translateY(20px) scale(1.1)",
                transformOrigin: "50% 0",
            }}
        >
            {props.children}
        </div>
    );
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Mixes two #rrggbb colours. */
export function mixColor(a: string, b: string, t: number): string {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    const c = pa.map((v, i) => Math.round(mix(v, pb[i], clamp01(t))));
    return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Absolutely placed block, by its top-left corner (or centre). */
export function At(props: {
    x: number;
    y: number;
    w?: number;
    h?: number;
    center?: boolean;
    style?: CSSProperties;
    children?: React.ReactNode;
}) {
    return (
        <div
            style={{
                position: "absolute",
                left: props.center && props.w ? props.x - props.w / 2 : props.x,
                top: props.center && props.h ? props.y - props.h / 2 : props.y,
                width: props.w,
                height: props.h,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}

/** Monospace label text. */
export function Mono(props: {
    children: React.ReactNode;
    size?: number;
    color?: string;
    style?: CSSProperties;
}) {
    return (
        <span
            style={{
                fontFamily: MONO,
                fontWeight: 500,
                fontSize: props.size ?? 28,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: props.color,
                whiteSpace: "nowrap",
                ...props.style,
            }}
        >
            {props.children}
        </span>
    );
}

/** A full-size overlay SVG in safe-area coordinates. */
export function Ink(props: { children: React.ReactNode; style?: CSSProperties }) {
    return (
        <svg
            width={1}
            height={1}
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                overflow: "visible",
                pointerEvents: "none",
                ...props.style,
            }}
        >
            {props.children}
        </svg>
    );
}

/** A hand-drawn line that draws itself (progress 0..1). */
export function InkLine(props: {
    from: Point;
    to: Point;
    p: number;
    color: string;
    width?: number;
    dashed?: boolean;
    seed?: string;
    bow?: number;
}) {
    const d = roughPath(props.from, props.to, props.seed ?? "ink", 2, props.bow ?? 0.03);
    return (
        <path
            d={d}
            stroke={props.color}
            strokeWidth={props.width ?? 5}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={props.dashed ? "0.025 0.03" : 1}
            strokeDashoffset={props.dashed ? 0 : 1 - props.p}
            opacity={props.dashed ? props.p : 1}
        />
    );
}

/** A handwritten-looking scribble standing in for unreadable text, `w` wide. */
export function scribblePath(w: number, seed: string, amp = 7, wavelength = 22): string {
    const n = Math.max(2, Math.round(w / (wavelength / 2)));
    let d = `M 0 0`;
    for (let i = 1; i <= n; i++) {
        const x = (i / n) * w;
        const y = (i % 2 ? -1 : 1) * amp * (0.55 + 0.45 * Math.abs(jitter(seed, i)));
        const cx = x - w / n / 2;
        d += ` Q ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(jitter(seed, i + 50) * 1.5).toFixed(1)}`;
    }
    return d;
}

export function Scribble(props: {
    w: number;
    seed: string;
    color: string;
    amp?: number;
    width?: number;
    wavelength?: number;
    p?: number;
    style?: CSSProperties;
}) {
    const amp = props.amp ?? 7;
    return (
        <svg
            width={props.w}
            height={amp * 2 + 8}
            viewBox={`0 ${-amp - 4} ${props.w} ${amp * 2 + 8}`}
            style={{ overflow: "visible", display: "block", ...props.style }}
        >
            <path
                d={scribblePath(props.w, props.seed, amp, props.wavelength)}
                fill="none"
                stroke={props.color}
                strokeWidth={props.width ?? 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - (props.p ?? 1)}
            />
        </svg>
    );
}

/** A gear, rotated by `angle` degrees. */
export function Gear(props: { size: number; angle?: number; color: string; hole: string }) {
    const teeth = 9;
    const R = 48;
    const r = 37;
    let d = "";
    for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const step = (Math.PI * 2) / teeth;
        const pts: [number, number][] = [
            [r, a0],
            [R, a0 + step * 0.12],
            [R, a0 + step * 0.42],
            [r, a0 + step * 0.54],
        ];
        for (const [rad, a] of pts) {
            d += `${d ? " L" : "M"} ${(Math.cos(a) * rad).toFixed(1)} ${(Math.sin(a) * rad).toFixed(1)}`;
        }
    }
    d += " Z";
    return (
        <svg
            width={props.size}
            height={props.size}
            viewBox="-52 -52 104 104"
            style={{ display: "block", transform: `rotate(${props.angle ?? 0}deg)` }}
        >
            <path d={d} fill={props.color} />
            <circle r={15} fill={props.hole} />
            <circle r={26} fill="none" stroke={props.hole} strokeWidth={3} opacity={0.35} />
        </svg>
    );
}

/** A worker: a small paper box with a gear. */
export function WorkerBox(props: {
    seed: string;
    size?: number;
    angle: number;
    dim?: number;
    label?: string;
    children?: React.ReactNode;
}) {
    const theme = useTheme();
    const size = props.size ?? 130;
    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <Paper
                seed={props.seed}
                color={theme.paperAlt}
                style={{ width: "100%", height: "100%" }}
                innerStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <Gear
                    size={size * 0.68}
                    angle={props.angle}
                    color={mixColor(theme.ink, GREY, props.dim ?? 0)}
                    hole={theme.paperAlt}
                />
            </Paper>
            {props.children}
        </div>
    );
}

/** The tower mark used on a study card: a lattice mast with radio arcs. */
export function TowerMark(props: { size: number; ink: string; accent: string }) {
    const s = {
        stroke: props.ink,
        strokeWidth: 4,
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
    } as const;
    return (
        <svg
            width={props.size}
            height={props.size}
            viewBox="0 0 60 60"
            style={{ display: "block" }}
        >
            <path d="M18 56 L30 12 L42 56" {...s} />
            <path
                d="M22 42 L38 42 M25 30 L35 30 M22 42 L35 30 M38 42 L25 30"
                {...s}
                strokeWidth={3}
            />
            <circle cx={30} cy={10} r={4} fill={props.accent} />
            <path d="M40 4 A 14 14 0 0 1 44 18" {...s} stroke={props.accent} strokeWidth={3.5} />
            <path d="M20 4 A 14 14 0 0 0 16 18" {...s} stroke={props.accent} strokeWidth={3.5} />
        </svg>
    );
}

/** A study: a small paper card with a tower mark and two lines of ink. */
export function StudyCard(props: { w?: number; seed: string; done?: boolean }) {
    const theme = useTheme();
    const w = props.w ?? 92;
    return (
        <Paper
            seed={props.seed}
            style={{ width: w, height: w * 0.72 }}
            innerStyle={{ display: "flex", alignItems: "center", gap: w * 0.06, padding: w * 0.07 }}
            sway={0.5}
        >
            <TowerMark size={w * 0.42} ink={theme.ink} accent={theme.accent} />
            <div style={{ display: "flex", flexDirection: "column", gap: w * 0.08 }}>
                <div style={{ width: w * 0.3, height: 4, background: theme.inkSoft }} />
                <div style={{ width: w * 0.22, height: 4, background: theme.inkSoft }} />
                {props.done && (
                    <div
                        style={{ width: w * 0.3, height: 6, background: GREEN, borderRadius: 3 }}
                    />
                )}
            </div>
        </Paper>
    );
}

/** The database: a paper cylinder. */
export function Cylinder(props: {
    w: number;
    h: number;
    label?: string;
    children?: React.ReactNode;
}) {
    const theme = useTheme();
    const { w, h } = props;
    const ry = w * 0.16;
    const s = { stroke: theme.ink, strokeWidth: 5, strokeLinejoin: "round" } as const;
    return (
        <div style={{ position: "relative", width: w, height: h }}>
            <svg
                width={w}
                height={h}
                viewBox={`-4 -4 ${w + 8} ${h + 8}`}
                style={{ display: "block", overflow: "visible", filter: paperShadow(theme) }}
            >
                <path
                    d={`M 0 ${ry} V ${h - ry} A ${w / 2} ${ry} 0 0 0 ${w} ${h - ry} V ${ry} Z`}
                    fill={theme.paper}
                    {...s}
                />
                {[0.38, 0.66].map((f) => (
                    <path
                        key={f}
                        d={`M 0 ${h * f} A ${w / 2} ${ry} 0 0 0 ${w} ${h * f}`}
                        fill="none"
                        {...s}
                        stroke={f < 0.5 ? theme.accent : theme.ink}
                        strokeWidth={4}
                    />
                ))}
                <ellipse cx={w / 2} cy={ry} rx={w / 2} ry={ry} fill={theme.paperAlt} {...s} />
            </svg>
            {props.label && (
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        width: w,
                        top: h * 0.74,
                        textAlign: "center",
                    }}
                >
                    <Mono color={theme.ink}>{props.label}</Mono>
                </div>
            )}
            {props.children}
        </div>
    );
}

/** A faceless paper robot: an AI coding agent. */
export function Robot(props: { size: number; color: string; angle?: number; arm?: number }) {
    const theme = useTheme();
    const s = { stroke: theme.ink, strokeWidth: 4, strokeLinecap: "round" } as const;
    const arm = props.arm ?? 0;
    return (
        <svg
            width={props.size}
            height={props.size * 1.2}
            viewBox="0 0 50 60"
            style={{
                display: "block",
                overflow: "visible",
                filter: paperShadow(theme, 0.6),
                transform: `rotate(${props.angle ?? 0}deg)`,
                transformOrigin: "50% 100%",
            }}
        >
            <path d="M25 6 V1" {...s} />
            <circle cx={25} cy={2} r={3} fill={theme.accent} />
            <rect x={12} y={6} width={26} height={18} rx={5} fill={theme.paper} />
            <rect x={17} y={13} width={16} height={4} rx={2} fill={theme.ink} opacity={0.75} />
            <rect x={9} y={26} width={32} height={24} rx={4} fill={props.color} />
            <path d={`M9 32 L${2 - arm * 2} ${40 - arm * 14}`} {...s} />
            <path d={`M41 32 L${48 + arm * 6} ${40 - arm * 10}`} {...s} />
            <path d="M18 50 V58 M32 50 V58" {...s} />
        </svg>
    );
}

/** A padlock. */
export function Padlock(props: { size: number; color?: string; open?: number }) {
    const theme = useTheme();
    const lift = (props.open ?? 0) * 10;
    return (
        <svg
            width={props.size}
            height={props.size * 1.15}
            viewBox="0 0 40 46"
            style={{ display: "block", overflow: "visible" }}
        >
            <path
                d={`M11 ${20 - lift} V${13 - lift} A9 9 0 0 1 29 ${13 - lift} V${20 - lift}`}
                fill="none"
                stroke={theme.ink}
                strokeWidth={5}
                strokeLinecap="round"
            />
            <rect x={5} y={19} width={30} height={24} rx={4} fill={props.color ?? theme.third} />
            <circle cx={20} cy={29} r={3.5} fill={theme.ink} />
            <path d="M20 31 V37" stroke={theme.ink} strokeWidth={3} strokeLinecap="round" />
        </svg>
    );
}

/** A tick or a cross mark. */
export function Mark(props: { ok: boolean; size: number; p?: number; color?: string }) {
    const color = props.color ?? (props.ok ? GREEN : RED);
    const p = props.p ?? 1;
    const d = props.ok ? "M8 26 L20 38 L42 10" : "M10 10 L40 40 M40 10 L10 40";
    return (
        <svg
            width={props.size}
            height={props.size}
            viewBox="0 0 50 50"
            style={{ display: "block" }}
        >
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
            />
        </svg>
    );
}

/** A point on a quadratic curve. */
export function quad(a: Point, c: Point, b: Point, t: number): Point {
    const u = 1 - t;
    return [
        u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ];
}
