import React, { type CSSProperties } from "react";
import { Easing, interpolate } from "remotion";
import { Paper, paperShadow } from "../../kit/paper";
import { roughPath, type Point } from "../../kit/pieces/rough";
import { seeded } from "../../kit/random";
import { useType } from "../../kit/stage";
import {
    cueFrame,
    useBoilSeed,
    useFrame,
    useProgress,
    useSpringIn,
    useTheme,
    useTimeline,
    useWobble,
    type Cue,
    type Span,
} from "../../kit/timing";

// The PRTL Labs town: agents are little cut-paper houses with window eyes, outside services are
// plain paper buildings with a sign, messages are paper notes that travel along paper wires, and a
// workflow is a path of stepping stones. Every timing is a narration cue, never a frame number.

export const W = 1600;
export const H = 760;
const EASE = Easing.bezier(0.45, 0, 0.2, 1);
/** A cue that never comes, for optional cues (hooks must always run). */
export const NEVER: Cue = { line: 0, delay: 1e5 };

/** Is the scene at or past a cue? */
export function useAfter(at: Cue): boolean {
    const frame = useFrame();
    const timeline = useTimeline();
    return frame >= cueFrame(timeline, at);
}

/** A 0..1 pulse that rises and falls over `seconds` from a cue (0 outside it). */
export function usePulse(at: Cue, seconds = 0.6): number {
    const frame = useFrame();
    const timeline = useTimeline();
    const start = cueFrame(timeline, at);
    const len = seconds * timeline.fps;
    if (frame < start || frame > start + len) return 0;
    return Math.sin(((frame - start) / len) * Math.PI);
}

export type Key = {
    at: Cue;
    x?: number;
    y?: number;
    /** Scale. */
    s?: number;
    /** Rotation in degrees. */
    r?: number;
    /** Opacity. */
    o?: number;
};
type Pose = { x: number; y: number; s: number; r: number; o: number };

/** Where a piece is now, from keyframes set at narration cues. Values carry forward between keys. */
export function useTrack(keys: Key[]): Pose & { visible: boolean } {
    const frame = useFrame();
    const timeline = useTimeline();
    const poses: (Pose & { f: number })[] = [];
    let prev: Pose = { x: 0, y: 0, s: 1, r: 0, o: 1 };
    for (const k of keys) {
        const p = {
            x: k.x ?? prev.x,
            y: k.y ?? prev.y,
            s: k.s ?? prev.s,
            r: k.r ?? prev.r,
            o: k.o ?? prev.o,
        };
        poses.push({ ...p, f: cueFrame(timeline, k.at) });
        prev = p;
    }
    if (poses.length === 0 || frame < poses[0].f) {
        return { ...(poses[0] ?? prev), visible: false };
    }
    for (let i = poses.length - 1; i >= 0; i--) {
        if (frame >= poses[i].f) {
            const a = i === 0 ? poses[0] : poses[i - 1];
            const b = poses[i];
            // Each key is reached over the moments after its cue: a key's cue starts its move.
            const next = poses[i + 1];
            const moveFrames = Math.max(1, Math.round(0.7 * timeline.fps));
            const t = interpolate(frame, [b.f, b.f + moveFrames], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE,
            });
            void next;
            const mix = (u: number, v: number) => u + (v - u) * (i === 0 ? 1 : t);
            return {
                x: mix(a.x, b.x),
                y: mix(a.y, b.y),
                s: mix(a.s, b.s),
                r: mix(a.r, b.r),
                o: mix(a.o, b.o),
                visible: true,
            };
        }
    }
    return { ...poses[0], visible: true };
}

/**
 * A piece placed at keyframed positions (its centre, or its bottom centre with `anchor="bottom"`).
 * It pops in at its first key and, with `out`, fades away at that cue.
 */
export function Mover(props: {
    keys: Key[];
    children: React.ReactNode;
    anchor?: "center" | "bottom" | "left";
    pop?: boolean;
    out?: Cue;
    z?: number;
    sway?: string;
    style?: CSSProperties;
}) {
    const pose = useTrack(props.keys);
    const pop = useSpringIn(props.keys[0]?.at ?? 0);
    const frame = useFrame();
    const timeline = useTimeline();
    const wob = useWobble(props.sway ?? "mover", props.sway ? 1 : 0);
    if (!pose.visible) return null;
    let o = pose.o;
    if (props.out !== undefined) {
        const f = cueFrame(timeline, props.out);
        o *= interpolate(frame, [f, f + 0.35 * timeline.fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });
        if (o <= 0) return null;
    }
    const s = pose.s * (props.pop === false ? 1 : 0.4 + 0.6 * pop);
    const anchor = props.anchor ?? "center";
    const tx = anchor === "left" ? "0%" : "-50%";
    const ty = anchor === "bottom" ? "-100%" : "-50%";
    return (
        <div
            style={{
                position: "absolute",
                left: pose.x,
                top: pose.y,
                transform: `translate(${tx}, ${ty}) scale(${s}) rotate(${pose.r + wob}deg)`,
                transformOrigin:
                    anchor === "bottom" ? "50% 100%" : anchor === "left" ? "0% 50%" : "50% 50%",
                opacity: Math.min(1, o * (props.pop === false ? 1 : Math.min(1, pop * 2))),
                zIndex: props.z,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------ */
/* Houses                                                                                            */

export type Sign =
    "none" | "spark" | "search" | "db" | "camera" | "film" | "x" | "chart" | "clock" | "bolt";

function SignIcon({ kind, ink, accent }: { kind: Sign; ink: string; accent: string }) {
    const s = {
        fill: "none",
        stroke: ink,
        strokeWidth: 4,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    } as const;
    switch (kind) {
        case "spark":
            return (
                <path
                    d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z"
                    fill={accent}
                    stroke={ink}
                    strokeWidth={3}
                    strokeLinejoin="round"
                />
            );
        case "search":
            return (
                <g {...s}>
                    <circle cx={-3} cy={-3} r={9} />
                    <path d="M4 4 L13 13" />
                </g>
            );
        case "db":
            return (
                <g {...s}>
                    <ellipse cx={0} cy={-9} rx={12} ry={4.5} />
                    <path d="M-12 -9 V9 C-12 13 12 13 12 9 V-9" />
                    <path d="M-12 0 C-12 4 12 4 12 0" stroke={accent} />
                </g>
            );
        case "camera":
            return (
                <g {...s}>
                    <rect x={-13} y={-9} width={26} height={19} rx={5} />
                    <circle cx={0} cy={0.5} r={5} stroke={accent} />
                </g>
            );
        case "film":
            return (
                <g {...s}>
                    <rect x={-13} y={-10} width={26} height={20} rx={2} />
                    <path d="M-5 -5 L6 0 L-5 5 Z" fill={accent} stroke="none" />
                </g>
            );
        case "x":
            return (
                <g {...s}>
                    <path d="M-9 -9 L9 9 M9 -9 L-9 9" />
                </g>
            );
        case "chart":
            return (
                <g {...s}>
                    <path d="M-12 10 V-10 M-12 10 H12" />
                    <path d="M-7 4 L-1 -3 L4 1 L11 -8" stroke={accent} />
                </g>
            );
        case "clock":
            return (
                <g {...s}>
                    <circle r={12} />
                    <path d="M0 -7 V0 L5 4" stroke={accent} />
                </g>
            );
        case "bolt":
            return (
                <path
                    d="M3 -15 L-8 2 L0 2 L-3 15 L9 -3 L1 -3 Z"
                    fill={accent}
                    stroke={ink}
                    strokeWidth={3}
                    strokeLinejoin="round"
                />
            );
        default:
            return null;
    }
}

/**
 * A cut-paper house, drawn standing on the ground: put it with <Mover anchor="bottom">.
 * `eyes` turns the windows into eyes (an agent, a character); `look` moves the pupils (-1..1).
 */
export function House(props: {
    label?: string;
    w?: number;
    roof?: string;
    body?: string;
    outline?: string;
    sign?: Sign;
    eyes?: boolean;
    look?: [number, number];
    /** When the windows light up (orange). */
    litAt?: Cue;
    /** Until when they stay lit. */
    litUntil?: Cue;
    /** Pop up from the ground at this cue, like a pop-up book. */
    rise?: Cue;
    shakeAt?: Cue;
    labelSize?: number;
    seed: string;
    labelBelow?: boolean;
}) {
    const theme = useTheme();
    const type = useType();
    const w = props.w ?? 200;
    const h = w * 0.95;
    const rise = useSpringIn(props.rise ?? 0);
    const lit = useAfter(props.litAt ?? NEVER) && props.litAt !== undefined;
    const unlit = useAfter(props.litUntil ?? NEVER) && props.litUntil !== undefined;
    const shake = usePulse(props.shakeAt ?? NEVER, 0.7);
    const frame = useFrame();
    const isLit = lit && !unlit;
    const seed = useBoilSeed(`house-${props.seed}`);
    const ink = theme.ink;
    const outline = props.outline ?? ink;
    const sw = props.outline ? 7 : 4.5;
    const body = props.body ?? theme.paper;
    const roof = props.roof ?? theme.second;
    const j = (i: number, amp = 2.5) => (seeded(`${seed}:${i}`)() * 2 - 1) * amp;
    const bodyPts = [
        [22 + j(1), 84 + j(2)],
        [178 + j(3), 84 + j(4)],
        [179 + j(5), 188],
        [21 + j(6), 188],
    ];
    const roofPts = [
        [6 + j(7), 92 + j(8)],
        [100 + j(9), 12 + j(10)],
        [194 + j(11), 92 + j(12)],
    ];
    const poly = (pts: number[][]) => pts.map((p) => p.join(",")).join(" ");
    const look = props.look ?? [0, 0];
    // A blink every few seconds, seeded per house.
    const blinkPhase = Math.floor(seeded(props.seed)() * 90);
    const blink = props.eyes && (frame + blinkPhase) % 110 < 4;
    const winFill = isLit ? theme.accent : "#3b3326";
    const jiggle = shake ? Math.sin(frame * 1.7) * 4 * shake : 0;
    return (
        <div
            style={{
                position: "relative",
                width: w,
                transform: `scaleY(${props.rise === undefined ? 1 : rise}) rotate(${jiggle}deg)`,
                transformOrigin: "50% 100%",
            }}
        >
            <svg
                width={w}
                height={h}
                viewBox="0 0 200 190"
                style={{ display: "block", overflow: "visible", filter: paperShadow(theme) }}
            >
                <rect
                    x={136}
                    y={22}
                    width={20}
                    height={44}
                    fill={theme.paperAlt}
                    stroke={ink}
                    strokeWidth={4}
                />
                <polygon
                    points={poly(bodyPts)}
                    fill={body}
                    stroke={outline}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                />
                <polygon
                    points={poly(roofPts)}
                    fill={roof}
                    stroke={outline}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                />
                {props.sign && props.sign !== "none" && (
                    <g transform="translate(100 60)">
                        <circle r={21} fill={theme.paper} stroke={ink} strokeWidth={3.5} />
                        <SignIcon kind={props.sign} ink={ink} accent={theme.accent} />
                    </g>
                )}
                <path
                    d="M86 188 V146 Q100 132 114 146 V188"
                    fill={theme.paperAlt}
                    stroke={ink}
                    strokeWidth={4}
                />
                {props.eyes
                    ? [52, 148].map((cx) => (
                          <g key={cx}>
                              <circle
                                  cx={cx}
                                  cy={124}
                                  r={17}
                                  fill={isLit ? "#fff6e8" : "#fffaf0"}
                                  stroke={outline}
                                  strokeWidth={4}
                              />
                              {blink ? (
                                  <path
                                      d={`M${cx - 12} 124 H${cx + 12}`}
                                      stroke={ink}
                                      strokeWidth={4}
                                      strokeLinecap="round"
                                  />
                              ) : (
                                  <circle
                                      cx={cx + look[0] * 6}
                                      cy={124 + look[1] * 6}
                                      r={7}
                                      fill={isLit ? theme.accent : ink}
                                  />
                              )}
                          </g>
                      ))
                    : [52, 148].map((cx) => (
                          <g key={cx}>
                              <rect
                                  x={cx - 15}
                                  y={110}
                                  width={30}
                                  height={28}
                                  fill={winFill}
                                  stroke={ink}
                                  strokeWidth={4}
                              />
                              <path
                                  d={`M${cx} 110 V138 M${cx - 15} 124 H${cx + 15}`}
                                  stroke={ink}
                                  strokeWidth={2.5}
                              />
                          </g>
                      ))}
            </svg>
            {props.label && (
                <div
                    style={{
                        position: "absolute",
                        top: h + 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                    }}
                >
                    <Paper
                        seed={`label-${props.seed}`}
                        color={theme.paper}
                        sway={0.3}
                        lift={0.6}
                        innerStyle={{
                            ...type.label,
                            fontSize: props.labelSize ?? 28,
                            padding: "6px 16px",
                            color: theme.ink,
                        }}
                    >
                        {props.label}
                    </Paper>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------ */
/* Paper cards, chips, notes                                                                         */

export function Card(props: {
    seed: string;
    w?: number;
    h?: number;
    color?: string;
    pad?: number;
    lift?: number;
    sway?: number;
    children?: React.ReactNode;
    style?: CSSProperties;
}) {
    return (
        <Paper
            seed={props.seed}
            color={props.color}
            lift={props.lift}
            sway={props.sway ?? 0.5}
            style={{ width: props.w, height: props.h, ...props.style }}
            innerStyle={{ padding: props.pad ?? 24, boxSizing: "border-box" }}
        >
            {props.children}
        </Paper>
    );
}

/** A tool chip: a small paper card with a plain-English label. Lit = orange. */
export function Chip(props: {
    text: string;
    lit?: boolean;
    size?: number;
    w?: number;
    seed?: string;
    dim?: boolean;
}) {
    const theme = useTheme();
    const type = useType();
    const size = props.size ?? 34;
    return (
        <Paper
            seed={props.seed ?? `chip-${props.text}`}
            color={props.lit ? theme.accent : theme.paper}
            lift={props.lit ? 1.4 : 1}
            sway={0.4}
            style={{ width: props.w, opacity: props.dim ? 0.55 : 1 }}
            innerStyle={{
                ...type.label,
                fontSize: size,
                padding: `${size * 0.4}px ${size * 0.7}px`,
                color: props.lit ? "#fffaf2" : theme.ink,
                whiteSpace: "nowrap",
                boxSizing: "border-box",
            }}
        >
            {props.text}
        </Paper>
    );
}

/** Ink text written straight on the kraft page. */
export function Ink(props: {
    text: string;
    size?: number;
    color?: string;
    italic?: boolean;
    mono?: boolean;
    weight?: number;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    return (
        <div
            style={{
                ...(props.mono ? type.label : type.display),
                fontSize: props.size ?? 34,
                fontStyle: props.italic ? "italic" : "normal",
                fontWeight: props.weight ?? (props.mono ? 500 : 600),
                color: props.color ?? theme.onBg,
                whiteSpace: "nowrap",
                ...props.style,
            }}
        >
            {props.text}
        </div>
    );
}

/** The scene's title, in ink, top left (the poster reads with it). */
export function Title(props: { text: string; from: Cue; to?: Cue }) {
    const p = useProgress(props.from, 0.9);
    const frame = useFrame();
    const timeline = useTimeline();
    const end = props.to === undefined ? Infinity : cueFrame(timeline, props.to);
    const fade = frame >= end ? Math.max(0, 1 - (frame - end) / 10) : 1;
    if (p <= 0 || fade <= 0) return null;
    return (
        <div style={{ position: "absolute", left: 0, top: -6, opacity: Math.min(1, p * 2) * fade }}>
            <Ink text={props.text} size={50} italic weight={600} />
            <InkLine
                from={[0, 66]}
                to={[560 * p, 62]}
                seed="title-line"
                color="#ff4f1a"
                width={7}
            />
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------ */
/* Ink marks                                                                                         */

/** A hand-drawn straight ink line inside its own little svg. */
export function InkLine(props: {
    from: Point;
    to: Point;
    seed: string;
    color?: string;
    width?: number;
    p?: number;
}) {
    const theme = useTheme();
    const seed = useBoilSeed(props.seed);
    const d = roughPath(props.from, props.to, seed, 1.5, 0.02);
    return (
        <svg
            width={1}
            height={1}
            style={{ overflow: "visible", position: "absolute", left: 0, top: 0 }}
        >
            <path
                d={d}
                stroke={props.color ?? theme.ink}
                strokeWidth={props.width ?? 5}
                fill="none"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - (props.p ?? 1)}
            />
        </svg>
    );
}

/** An absolutely positioned svg layer the size of the safe area, for wires and marks. */
export function Layer(props: { children: React.ReactNode; z?: number }) {
    return (
        <svg
            width={W}
            height={H}
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                overflow: "visible",
                pointerEvents: "none",
                zIndex: props.z,
            }}
        >
            {props.children}
        </svg>
    );
}

/** A tick that draws itself at a cue. Use inside a <Layer>. */
export function Tick(props: { x: number; y: number; at: Cue; size?: number; color?: string }) {
    const theme = useTheme();
    const p = useProgress(props.at, 0.35);
    if (p <= 0) return null;
    const s = (props.size ?? 40) / 40;
    const d = `M ${props.x - 16 * s} ${props.y} L ${props.x - 4 * s} ${props.y + 13 * s} L ${props.x + 20 * s} ${props.y - 16 * s}`;
    return (
        <path
            d={d}
            stroke={props.color ?? theme.accent}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
        />
    );
}

/** An ink cross drawn over a box. Use inside a <Layer>. */
export function Cross(props: {
    x: number;
    y: number;
    w: number;
    h: number;
    at: Cue;
    color?: string;
}) {
    const theme = useTheme();
    const a = useProgress(props.at, 0.25);
    const b = useProgress(
        {
            ...(typeof props.at === "number" ? { line: props.at } : props.at),
            delay: ((typeof props.at === "number" ? 0 : props.at.delay) ?? 0) + 0.2,
        },
        0.25,
    );
    const seed = useBoilSeed(`cross-${props.x}-${props.y}`);
    const c = props.color ?? theme.accent;
    const { x, y, w, h } = props;
    return (
        <>
            {a > 0 && (
                <path
                    d={roughPath([x, y], [x + w, y + h], seed, 3, 0.03)}
                    stroke={c}
                    strokeWidth={9}
                    fill="none"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - a}
                />
            )}
            {b > 0 && (
                <path
                    d={roughPath([x + w, y], [x, y + h], `${seed}b`, 3, 0.03)}
                    stroke={c}
                    strokeWidth={9}
                    fill="none"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - b}
                />
            )}
        </>
    );
}

/** A hand-drawn bracket over a span of x, opening downward, with a label above. HTML, absolute. */
export function Bracket(props: {
    x1: number;
    x2: number;
    y: number;
    at: Cue;
    label: string;
    color?: string;
    size?: number;
    below?: boolean;
}) {
    const theme = useTheme();
    const p = useProgress(props.at, 0.6);
    const seed = useBoilSeed(`bracket-${props.x1}-${props.x2}`);
    if (p <= 0) return null;
    const c = props.color ?? theme.ink;
    const dir = props.below ? -1 : 1;
    const { x1, x2, y } = props;
    const d = `M ${x1} ${y + 22 * dir} Q ${x1} ${y} ${x1 + 22} ${y} ${roughPath([x1 + 22, y], [x2 - 22, y], seed, 2, 0.005).replace(/^M [^ ]+ [^ ]+/, "")} Q ${x2} ${y} ${x2} ${y + 22 * dir}`;
    return (
        <>
            <svg
                width={1}
                height={1}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
                <path
                    d={d}
                    stroke={c}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - p}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: (x1 + x2) / 2,
                    top: props.below ? y + 12 : y - 12,
                    transform: `translate(-50%, ${props.below ? "0" : "-100%"})`,
                    opacity: Math.min(1, p * 2),
                }}
            >
                <Ink text={props.label} size={props.size ?? 34} color={c} mono />
            </div>
        </>
    );
}

/** An ink stamp that slams down at a cue. */
export function Stamp(props: {
    text: string;
    at: Cue;
    color?: string;
    rot?: number;
    size?: number;
}) {
    const theme = useTheme();
    const type = useType();
    const s = useSpringIn(props.at);
    if (s <= 0) return null;
    const c = props.color ?? theme.accent;
    return (
        <div
            style={{
                ...type.label,
                fontSize: props.size ?? 30,
                color: c,
                border: `5px solid ${c}`,
                borderRadius: 8,
                padding: "4px 14px",
                whiteSpace: "nowrap",
                transform: `scale(${2 - s}) rotate(${props.rot ?? -8}deg)`,
                opacity: Math.min(1, s * 1.5),
                background: "rgba(255,250,240,0.55)",
            }}
        >
            {props.text}
        </div>
    );
}

/** A push pin with a small label ("saved"). */
export function Pin(props: { text?: string; at: Cue; color?: string; size?: number }) {
    const theme = useTheme();
    const type = useType();
    const s = useSpringIn(props.at);
    if (s <= 0) return null;
    const c = props.color ?? theme.second;
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                transform: `translateY(${(1 - s) * -30}px)`,
                opacity: Math.min(1, s * 2),
            }}
        >
            <svg
                width={26}
                height={34}
                viewBox="0 0 26 34"
                style={{ filter: paperShadow(theme, 0.5) }}
            >
                <path d="M13 18 V33" stroke={theme.ink} strokeWidth={3} strokeLinecap="round" />
                <circle cx={13} cy={11} r={10} fill={c} stroke={theme.ink} strokeWidth={3} />
            </svg>
            {props.text && (
                <div
                    style={{
                        ...type.label,
                        fontSize: props.size ?? 26,
                        color: theme.ink,
                        background: theme.paper,
                        padding: "1px 8px",
                        filter: paperShadow(theme, 0.4),
                    }}
                >
                    {props.text}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------ */
/* Wires and things that travel on them                                                              */

/** A point along a quadratic curve from a to b bowed sideways by `bow` (share of the length). */
export function curvePoint(a: Point, b: Point, bow: number, t: number): Point {
    const c = control(a, b, bow);
    const u = 1 - t;
    return [
        u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
    ];
}

function control(a: Point, b: Point, bow: number): Point {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [
        (a[0] + b[0]) / 2 + (-dy / len) * bow * len,
        (a[1] + b[1]) / 2 + (dx / len) * bow * len,
    ];
}

/**
 * A paper wire: a pale paper strip with ink edges, drawn in from `a` to `b` at a cue. It can flash
 * orange at cues, be dashed (a test that sends nothing), or snap (torn) between two cues.
 * Use inside a <Layer>.
 */
export function Wire(props: {
    a: Point;
    b: Point;
    at: Cue;
    over?: Span;
    bow?: number;
    flash?: Cue[];
    lit?: Cue;
    dashed?: boolean;
    snap?: { at: Cue; until: Cue };
    width?: number;
    color?: string;
    hideAt?: Cue;
}) {
    const theme = useTheme();
    const p = useProgress(props.at, props.over ?? 0.7);
    const frame = useFrame();
    const timeline = useTimeline();
    const bow = props.bow ?? 0.08;
    const c = control(props.a, props.b, bow);
    const flashes = (props.flash ?? []).map((f) => cueFrame(timeline, f));
    let glow = 0;
    for (const f of flashes) {
        if (frame >= f && frame < f + 0.8 * timeline.fps)
            glow = Math.max(glow, Math.sin(((frame - f) / (0.8 * timeline.fps)) * Math.PI));
    }
    const litOn = props.lit !== undefined && frame >= cueFrame(timeline, props.lit);
    const snapped =
        props.snap !== undefined &&
        frame >= cueFrame(timeline, props.snap.at) &&
        frame < cueFrame(timeline, props.snap.until);
    const hidden = props.hideAt !== undefined && frame >= cueFrame(timeline, props.hideAt);
    if (p <= 0 || hidden) return null;
    const w = props.width ?? 12;
    const d = `M ${props.a[0]} ${props.a[1]} Q ${c[0]} ${c[1]} ${props.b[0]} ${props.b[1]}`;
    const fill = litOn ? theme.accent : (props.color ?? theme.paper);
    if (snapped) {
        const m1 = curvePoint(props.a, props.b, bow, 0.44);
        const m2 = curvePoint(props.a, props.b, bow, 0.56);
        const h1 = curvePoint(props.a, props.b, bow, 0.22);
        const h2 = curvePoint(props.a, props.b, bow, 0.78);
        const d1 = `M ${props.a[0]} ${props.a[1]} Q ${h1[0]} ${h1[1]} ${m1[0]} ${m1[1] + 26}`;
        const d2 = `M ${props.b[0]} ${props.b[1]} Q ${h2[0]} ${h2[1]} ${m2[0]} ${m2[1] + 26}`;
        return (
            <g>
                {[d1, d2].map((dd, i) => (
                    <g key={i}>
                        <path
                            d={dd}
                            stroke={theme.ink}
                            strokeWidth={w + 6}
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d={dd}
                            stroke="#d8452f"
                            strokeWidth={w - 2}
                            fill="none"
                            strokeLinecap="round"
                        />
                    </g>
                ))}
            </g>
        );
    }
    return (
        <g opacity={props.dashed ? 0.9 : 1}>
            <path
                d={d}
                stroke={theme.ink}
                strokeWidth={w + 6}
                fill="none"
                strokeLinecap="round"
                pathLength={props.dashed ? undefined : 1}
                strokeDasharray={props.dashed ? "4 22" : 1}
                strokeDashoffset={props.dashed ? 0 : 1 - p}
                opacity={props.dashed ? p : 1}
            />
            {!props.dashed && (
                <path
                    d={d}
                    stroke={fill}
                    strokeWidth={w}
                    fill="none"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - p}
                />
            )}
            {glow > 0 && !props.dashed && (
                <path
                    d={d}
                    stroke={theme.accent}
                    strokeWidth={w}
                    fill="none"
                    strokeLinecap="round"
                    opacity={glow}
                />
            )}
        </g>
    );
}

/**
 * Something that travels from `a` to `b` along a bowed path between two cues, then stays at `b`
 * (or vanishes with `vanish`). Before `at` it waits at `a` if `wait` is set, else it is hidden.
 */
export function Along(props: {
    a: Point;
    b: Point;
    at: Cue;
    over?: Span;
    bow?: number;
    wait?: boolean;
    vanish?: boolean;
    shrink?: number;
    hideAfter?: Cue;
    children: React.ReactNode;
    z?: number;
}) {
    const frame = useFrame();
    const timeline = useTimeline();
    const start = cueFrame(timeline, props.at);
    const p = useProgress(props.at, props.over ?? 0.9);
    if (frame < start && !props.wait) return null;
    if (props.vanish && p >= 1) return null;
    if (props.hideAfter !== undefined && frame >= cueFrame(timeline, props.hideAfter)) return null;
    const [x, y] = curvePoint(props.a, props.b, props.bow ?? 0.12, p);
    const s = 1 - (1 - (props.shrink ?? 1)) * p;
    const tilt = Math.sin(p * Math.PI) * 8;
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${s}) rotate(${tilt}deg)`,
                zIndex: props.z,
            }}
        >
            {props.children}
        </div>
    );
}

/** A paper note: a small folded sheet with a line of text. */
export function Note(props: {
    text?: string;
    seed: string;
    color?: string;
    size?: number;
    children?: React.ReactNode;
}) {
    const theme = useTheme();
    const type = useType();
    return (
        <Paper
            seed={`note-${props.seed}`}
            color={props.color ?? "#fff8e6"}
            sway={0.6}
            lift={1.3}
            innerStyle={{
                ...type.label,
                fontSize: props.size ?? 28,
                padding: "10px 18px",
                whiteSpace: "nowrap",
                color: theme.ink,
            }}
        >
            {props.children ?? props.text}
        </Paper>
    );
}

/** Little burst lines around a point at a cue (a spark, a ring, a click). Use inside a <Layer>. */
export function Burst(props: {
    x: number;
    y: number;
    at: Cue;
    r?: number;
    color?: string;
    n?: number;
}) {
    const theme = useTheme();
    const p = usePulse(props.at, 0.7);
    if (p <= 0) return null;
    const n = props.n ?? 8;
    const r = props.r ?? 40;
    return (
        <g stroke={props.color ?? theme.accent} strokeWidth={6} strokeLinecap="round" opacity={p}>
            {Array.from({ length: n }, (_, i) => {
                const a = (i / n) * Math.PI * 2;
                const r1 = r * (0.7 + 0.3 * p);
                const r2 = r * (1.1 + 0.5 * p);
                return (
                    <path
                        key={i}
                        d={`M ${props.x + Math.cos(a) * r1} ${props.y + Math.sin(a) * r1} L ${props.x + Math.cos(a) * r2} ${props.y + Math.sin(a) * r2}`}
                    />
                );
            })}
        </g>
    );
}

/* ------------------------------------------------------------------------------------------------ */
/* Workflows: paths of stepping stones                                                               */

/**
 * A workflow lane: a row of stepping stones that fill orange one by one from `run` over `over`, each
 * finished stone getting a "saved" pin. With `loop`, the lane keeps ticking (start again when full).
 */
export function Stones(props: {
    n: number;
    gap: number;
    size?: number;
    run?: Cue;
    over?: Span;
    pins?: boolean;
    loop?: boolean;
    seed: string;
}) {
    const theme = useTheme();
    const frame = useFrame();
    const timeline = useTimeline();
    const size = props.size ?? 64;
    const start = props.run === undefined ? Infinity : cueFrame(timeline, props.run);
    const p = useProgress(props.run ?? NEVER, props.over ?? 3);
    let filled = props.run === undefined ? 0 : p * props.n;
    if (props.loop && frame > start) {
        const per = 0.55 * timeline.fps;
        filled = ((frame - start) / per) % (props.n + 2);
    }
    return (
        <div
            style={{ position: "relative", width: props.gap * (props.n - 1) + size, height: size }}
        >
            {Array.from({ length: props.n }, (_, i) => {
                const on = filled >= i + 1;
                const rot = (seeded(`${props.seed}:${i}`)() * 2 - 1) * 6;
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: i * props.gap,
                            top: 0,
                            width: size,
                            height: size,
                        }}
                    >
                        <Paper
                            seed={`${props.seed}-${i}`}
                            color={on ? theme.accent : theme.paperAlt}
                            sway={0.3}
                            roughness={1.6}
                            style={{ width: size, height: size, transform: `rotate(${rot}deg)` }}
                        />
                        {props.pins && on && !props.loop && (
                            <div style={{ position: "absolute", left: size * 0.5 - 11, top: -18 }}>
                                <svg
                                    width={22}
                                    height={30}
                                    viewBox="0 0 26 34"
                                    style={{ filter: paperShadow(theme, 0.5) }}
                                >
                                    <path
                                        d="M13 18 V33"
                                        stroke={theme.ink}
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx={13}
                                        cy={11}
                                        r={10}
                                        fill={theme.second}
                                        stroke={theme.ink}
                                        strokeWidth={3}
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** A start lever on a little post. `pull` is when it is pulled down. */
export function Lever(props: { pull?: Cue; seed: string; size?: number }) {
    const theme = useTheme();
    const p = useProgress(props.pull ?? NEVER, 0.4);
    const s = (props.size ?? 90) / 90;
    const ang = -40 + 80 * (props.pull === undefined ? 0 : p);
    return (
        <svg
            width={90 * s}
            height={110 * s}
            viewBox="0 0 90 110"
            style={{ overflow: "visible", filter: paperShadow(theme, 0.8) }}
        >
            <rect
                x={20}
                y={70}
                width={50}
                height={36}
                rx={6}
                fill={theme.paperAlt}
                stroke={theme.ink}
                strokeWidth={4}
            />
            <g transform={`rotate(${ang} 45 78)`}>
                <path d="M45 78 V18" stroke={theme.ink} strokeWidth={8} strokeLinecap="round" />
                <circle
                    cx={45}
                    cy={16}
                    r={13}
                    fill={theme.accent}
                    stroke={theme.ink}
                    strokeWidth={4}
                />
            </g>
        </svg>
    );
}

/** A paper hand, pointing up with a pinch (pulling levers). */
export function Hand(props: { size?: number }) {
    const theme = useTheme();
    const s = props.size ?? 120;
    return (
        <svg
            width={s}
            height={s * 1.1}
            viewBox="0 0 100 110"
            style={{ filter: paperShadow(theme) }}
        >
            <path
                d="M30 108 L30 60 C22 56 14 48 16 40 C18 34 26 36 30 42 L32 18 C32 10 42 10 42 18 L42 40 L44 14 C44 6 54 6 54 14 L54 40 L56 18 C56 10 66 10 66 18 L66 44 L68 28 C68 20 78 20 78 28 L76 66 C76 84 70 96 66 108 Z"
                fill="#f1d9bd"
                stroke={theme.ink}
                strokeWidth={4}
                strokeLinejoin="round"
            />
            <rect
                x={26}
                y={96}
                width={46}
                height={14}
                fill={theme.second}
                stroke={theme.ink}
                strokeWidth={4}
            />
        </svg>
    );
}

/** A small cut-paper tree, for the town. */
export function Tree(props: { size?: number; seed: string; color?: string }) {
    const theme = useTheme();
    const rot = useWobble(`tree-${props.seed}`, 2);
    const s = props.size ?? 80;
    return (
        <svg
            width={s}
            height={s * 1.3}
            viewBox="0 0 80 104"
            style={{
                filter: paperShadow(theme, 0.7),
                transform: `rotate(${rot}deg)`,
                transformOrigin: "50% 100%",
            }}
        >
            <rect
                x={35}
                y={70}
                width={10}
                height={34}
                fill="#6b4f2c"
                stroke={theme.ink}
                strokeWidth={3}
            />
            <path
                d="M40 4 C60 20 74 44 70 62 C66 78 14 78 10 62 C6 44 20 20 40 4 Z"
                fill={props.color ?? theme.third}
                stroke={theme.ink}
                strokeWidth={3.5}
            />
            <path
                d="M40 22 V62 M40 40 L52 30 M40 50 L28 40"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

/** A paper alarm clock. `hours` sets the hand (0..24). `ring` cues make it shake with ring lines. */
export function Clock(props: {
    size?: number;
    hours: number;
    minutes?: number;
    ringAt?: Cue[];
    ringFor?: number;
    jam?: boolean;
    singleHand?: boolean;
    handColor?: string;
    face?: string;
    blank?: boolean;
}) {
    const theme = useTheme();
    const frame = useFrame();
    const timeline = useTimeline();
    const s = props.size ?? 120;
    const rings = (props.ringAt ?? []).map((c) => cueFrame(timeline, c));
    let ringing = 0;
    for (const f of rings) {
        if (frame >= f && frame < f + (props.ringFor ?? 1.6) * timeline.fps) ringing = 1;
    }
    const shake = ringing || props.jam ? Math.sin(frame * 2.1) * (props.jam ? 5 : 7) : 0;
    const hAng = ((props.hours % 12) / 12) * 360 + ((props.minutes ?? 0) / 60) * 30;
    const mAng = ((props.minutes ?? 0) / 60) * 360;
    return (
        <svg
            width={s}
            height={s * 1.1}
            viewBox="-60 -70 120 132"
            style={{
                overflow: "visible",
                filter: paperShadow(theme, 0.8),
                transform: `rotate(${shake}deg)`,
            }}
        >
            <circle
                cx={-34}
                cy={-42}
                r={15}
                fill={theme.second}
                stroke={theme.ink}
                strokeWidth={4}
            />
            <circle
                cx={34}
                cy={-42}
                r={15}
                fill={theme.second}
                stroke={theme.ink}
                strokeWidth={4}
            />
            <path
                d="M-30 46 L-38 58 M30 46 L38 58"
                stroke={theme.ink}
                strokeWidth={5}
                strokeLinecap="round"
            />
            <circle r={48} fill={props.face ?? theme.paper} stroke={theme.ink} strokeWidth={5} />
            {[0, 1, 2, 3].map((i) => (
                <path
                    key={i}
                    d={`M 0 -40 V -33`}
                    stroke={theme.ink}
                    strokeWidth={4}
                    strokeLinecap="round"
                    transform={`rotate(${i * 90})`}
                />
            ))}
            {!props.blank && (
                <>
                    {!props.singleHand && (
                        <path
                            d="M0 0 V-34"
                            stroke={theme.inkSoft}
                            strokeWidth={4}
                            strokeLinecap="round"
                            transform={`rotate(${mAng})`}
                        />
                    )}
                    <path
                        d="M0 0 V-24"
                        stroke={props.handColor ?? theme.accent}
                        strokeWidth={7}
                        strokeLinecap="round"
                        transform={`rotate(${hAng})`}
                    />
                </>
            )}
            {props.blank && (
                <text
                    x={0}
                    y={14}
                    textAnchor="middle"
                    fontSize={40}
                    fontFamily="Fraunces"
                    fontWeight={600}
                    fill={theme.accent}
                >
                    ?
                </text>
            )}
            <circle r={5} fill={theme.ink} />
            {ringing > 0 && (
                <g stroke={theme.accent} strokeWidth={5} strokeLinecap="round" fill="none">
                    <path d="M-62 -40 Q-70 -20 -62 0" />
                    <path d="M62 -40 Q70 -20 62 0" />
                    <path d="M-74 -46 Q-84 -20 -74 6" />
                    <path d="M74 -46 Q84 -20 74 6" />
                </g>
            )}
        </svg>
    );
}

/** A full-safe-area container for a shot's pieces. */
export function Field(props: { children: React.ReactNode; style?: CSSProperties }) {
    return (
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, ...props.style }}>
            {props.children}
        </div>
    );
}

/** Paper tokens flowing along a bowed wire, `rate` per second, from a cue until another. Use inside a <Layer>. */
export function Flow(props: {
    a: Point;
    b: Point;
    at: Cue;
    until?: Cue;
    bow?: number;
    rate?: number;
    travel?: number;
    color?: string;
    size?: number;
}) {
    const theme = useTheme();
    const frame = useFrame();
    const timeline = useTimeline();
    const start = cueFrame(timeline, props.at);
    const stop = props.until === undefined ? Infinity : cueFrame(timeline, props.until);
    if (frame < start) return null;
    const interval = timeline.fps / (props.rate ?? 2);
    const travel = (props.travel ?? 1.2) * timeline.fps;
    const dots: React.ReactNode[] = [];
    const first = Math.max(0, Math.floor((frame - start - travel) / interval));
    const last = Math.floor((frame - start) / interval);
    for (let k = first; k <= last; k++) {
        const born = start + k * interval;
        if (born >= stop) break;
        const t = (frame - born) / travel;
        if (t < 0 || t > 1) continue;
        const [x, y] = curvePoint(props.a, props.b, props.bow ?? 0.08, t);
        const sz = props.size ?? 16;
        dots.push(
            <rect
                key={k}
                x={x - sz / 2}
                y={y - sz * 0.35}
                width={sz}
                height={sz * 0.7}
                rx={2}
                fill={props.color ?? theme.accent}
                stroke={theme.ink}
                strokeWidth={2.5}
                transform={`rotate(${((k * 37) % 30) - 15} ${x} ${y})`}
            />,
        );
    }
    return <g>{dots}</g>;
}

export { useProgress };
export type { Point };
