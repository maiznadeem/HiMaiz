import React from "react";
import { Paper, paperShadow } from "../paper";
import { seeded } from "../random";
import { useType } from "../stage";
import {
    cueFrame,
    useBoilSeed,
    useFrame,
    useProgress,
    useSpringIn,
    useStartFrame,
    useTheme,
    useTimeline,
    type Cue,
    type Span,
} from "../timing";
import { lerpPoint, roughPath, type Point } from "./rough";

export type BoxKind = "client" | "edge" | "server" | "database" | "queue" | "plain";

/** Size of a diagram box, so arrows can be aimed at its edges. */
export const BOX = { w: 240, h: 190 } as const;

/** The point on a box's edge: `side` is "left", "right", "top" or "bottom" of the box centred at x, y. */
export function edge(x: number, y: number, side: "left" | "right" | "top" | "bottom"): Point {
    if (side === "left") return [x - BOX.w / 2 - 12, y];
    if (side === "right") return [x + BOX.w / 2 + 12, y];
    if (side === "top") return [x, y - BOX.h / 2 - 12];
    return [x, y + BOX.h / 2 + 12];
}

function Icon({ kind, ink, accent }: { kind: BoxKind; ink: string; accent: string }) {
    const s = {
        fill: "none",
        stroke: ink,
        strokeWidth: 5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    } as const;
    switch (kind) {
        case "client":
            return (
                <svg width="96" height="72" viewBox="0 0 96 72">
                    <rect x="16" y="6" width="64" height="44" rx="5" {...s} />
                    <path d="M6 62 H90" {...s} />
                    <circle cx="48" cy="28" r="7" fill={accent} />
                </svg>
            );
        case "edge":
            return (
                <svg width="96" height="72" viewBox="0 0 96 72">
                    <path d="M48 4 L80 16 V36 C80 54 64 64 48 70 C32 64 16 54 16 36 V16 Z" {...s} />
                    <path d="M36 37 L45 46 L62 27" {...s} stroke={accent} />
                </svg>
            );
        case "server":
            return (
                <svg width="96" height="72" viewBox="0 0 96 72">
                    {[4, 26, 48].map((y) => (
                        <g key={y}>
                            <rect x="14" y={y} width="68" height="18" rx="4" {...s} />
                            <circle cx="28" cy={y + 9} r="3.5" fill={y === 4 ? accent : ink} />
                        </g>
                    ))}
                </svg>
            );
        case "database":
            return (
                <svg width="96" height="72" viewBox="0 0 96 72">
                    <ellipse cx="48" cy="12" rx="30" ry="9" {...s} />
                    <path d="M18 12 V58 C18 63 31 68 48 68 C65 68 78 63 78 58 V12" {...s} />
                    <path d="M18 35 C18 40 31 45 48 45 C65 45 78 40 78 35" {...s} stroke={accent} />
                </svg>
            );
        case "queue":
            return (
                <svg width="96" height="72" viewBox="0 0 96 72">
                    <rect x="4" y="18" width="88" height="36" rx="6" {...s} />
                    {[14, 34, 54].map((x, i) => (
                        <rect
                            key={x}
                            x={x}
                            y="27"
                            width="14"
                            height="18"
                            rx="3"
                            fill={i === 0 ? accent : ink}
                        />
                    ))}
                </svg>
            );
        default:
            return null;
    }
}

/** A system-diagram box (client, edge, server, database, queue) that pops in at its cue. */
export function Box(props: {
    kind: BoxKind;
    label: string;
    x: number;
    y: number;
    at?: Cue;
    color?: string;
    highlight?: boolean;
}) {
    const theme = useTheme();
    const type = useType();
    const s = useSpringIn(props.at);
    return (
        <div
            style={{
                position: "absolute",
                left: props.x - BOX.w / 2,
                top: props.y - BOX.h / 2,
                width: BOX.w,
                height: BOX.h,
                opacity: Math.min(1, s * 2),
                transform: `scale(${0.5 + 0.5 * s})`,
            }}
        >
            <Paper
                seed={`box-${props.label}`}
                color={props.color ?? (props.highlight ? theme.paperAlt : theme.paper)}
                style={{ width: "100%", height: "100%" }}
                innerStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                }}
            >
                <Icon kind={props.kind} ink={theme.ink} accent={theme.accent} />
                <div
                    style={{
                        ...type.label,
                        fontSize: 28,
                        color: theme.ink,
                        textAlign: "center",
                        lineHeight: 1.1,
                    }}
                >
                    {props.label}
                </div>
            </Paper>
        </div>
    );
}

/** A hand-drawn arrow that draws itself from one point to another. Coordinates are in the safe area. */
export function Arrow(props: {
    from: Point;
    to: Point;
    at?: Cue;
    over?: Span;
    color?: string;
    label?: string;
    dashed?: boolean;
    width?: number;
}) {
    const theme = useTheme();
    const type = useType();
    const p = useProgress(props.at, props.over, 0.6);
    const seed = useBoilSeed(`arrow-${props.from.join()}-${props.to.join()}`);
    const d = roughPath(props.from, props.to, seed, 2.5, 0.04);
    const color = props.color ?? theme.onBg;
    const ang = Math.atan2(props.to[1] - props.from[1], props.to[0] - props.from[0]);
    const head = (side: number): string => {
        const a = ang + Math.PI + side * 0.5;
        const [x, y] = props.to;
        return `M ${x} ${y} L ${x + Math.cos(a) * 26} ${y + Math.sin(a) * 26}`;
    };
    // Label above the middle of a flat arrow, or above the start of a steep one.
    const flat = Math.abs(props.to[0] - props.from[0]) >= Math.abs(props.to[1] - props.from[1]);
    const mid = flat ? lerpPoint(props.from, props.to, 0.5) : props.from;
    const width = props.width ?? 6;
    return (
        <svg
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                overflow: "visible",
                pointerEvents: "none",
            }}
            width={1}
            height={1}
        >
            <path
                d={d}
                stroke={color}
                strokeWidth={width}
                fill="none"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={props.dashed ? "0.02 0.025" : 1}
                strokeDashoffset={props.dashed ? 0 : 1 - p}
                opacity={props.dashed ? p : 1}
            />
            {p > 0.97 && (
                <path
                    d={`${head(1)} ${head(-1)}`}
                    stroke={color}
                    strokeWidth={width}
                    strokeLinecap="round"
                    fill="none"
                />
            )}
            {props.label && p > 0.5 && (
                <text
                    x={mid[0]}
                    y={mid[1] - (flat ? 22 : 16)}
                    textAnchor="middle"
                    fill={color}
                    style={{ ...type.label, fontSize: 26 }}
                    opacity={Math.min(1, (p - 0.5) * 4)}
                >
                    {props.label}
                </text>
            )}
        </svg>
    );
}

/**
 * A stream of dots (requests) flowing from one point to another. With `block`, a paper wall goes up at a
 * cue and a share of the dots stop at it: "drop" ones fall away, "block" ones bounce back and fade.
 */
export function DotStream(props: {
    from: Point;
    to: Point;
    at?: Cue;
    until?: Cue;
    /** Dots per second. */
    rate?: number;
    /** Seconds for one dot to cross. */
    travel?: number;
    lane?: number;
    size?: number;
    color?: string;
    block?: {
        at: Cue;
        /** Share of dots stopped, 0 to 1. */
        share: number;
        /** Where the wall stands, 0 (start) to 1 (end). */
        where?: number;
        mode?: "block" | "drop";
        color?: string;
        label?: string;
    };
    seed?: string;
}) {
    const theme = useTheme();
    const type = useType();
    const timeline = useTimeline();
    const frame = useFrame();
    const start = useStartFrame(props.at);
    const fps = timeline.fps;
    const stop = props.until === undefined ? Infinity : cueFrame(timeline, props.until);
    const interval = fps / (props.rate ?? 6);
    const travel = (props.travel ?? 1.8) * fps;
    const lane = props.lane ?? 26;
    const size = props.size ?? 18;
    const seed = props.seed ?? `dots-${props.from.join()}`;
    const block = props.block;
    const blockStart = block ? cueFrame(timeline, block.at) : Infinity;
    const where = block?.where ?? 0.62;
    const wallIn = useSpringIn(block?.at ?? 0);
    const [x1, y1] = props.from;
    const [x2, y2] = props.to;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;

    const dots: React.ReactNode[] = [];
    if (frame >= start) {
        const first = Math.max(0, Math.floor((frame - start - travel * 2.2) / interval));
        const last = Math.floor((frame - start) / interval);
        for (let k = first; k <= last; k++) {
            const born = start + k * interval;
            if (born >= stop) break;
            const age = frame - born;
            const rand = seeded(`${seed}:${k}`);
            const off = (rand() * 2 - 1) * lane;
            const stopped =
                block !== undefined && born + travel * where >= blockStart && rand() < block.share;
            let t = age / travel;
            let fall = 0;
            let back = 0;
            let alpha = 1;
            let color = props.color ?? theme.onBg;
            if (stopped && t >= where) {
                const after = (age - travel * where) / fps;
                t = where;
                color = block?.color ?? theme.accent;
                if ((block?.mode ?? "drop") === "drop") fall = 700 * after * after;
                else back = Math.min(60, after * 120);
                alpha = Math.max(0, 1 - after / 0.6);
            } else if (t > 1) {
                continue;
            }
            if (alpha <= 0) continue;
            const along: Point = lerpPoint(props.from, props.to, t);
            const bx = (back * (x2 - x1)) / len;
            const by = (back * (y2 - y1)) / len;
            dots.push(
                <circle
                    key={k}
                    cx={along[0] + nx * off - bx}
                    cy={along[1] + ny * off - by + fall}
                    r={size / 2}
                    fill={color}
                    opacity={alpha * Math.min(1, age / 4)}
                />,
            );
        }
    }
    const wall = lerpPoint(props.from, props.to, where);
    return (
        <>
            <svg
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    overflow: "visible",
                    pointerEvents: "none",
                }}
                width={1}
                height={1}
            >
                {dots}
            </svg>
            {block && frame >= blockStart && (
                <div
                    style={{
                        position: "absolute",
                        left: wall[0] - 14,
                        top: wall[1] - lane - 70,
                        width: 28,
                        height: (lane + 70) * 2,
                        transform: `scaleY(${wallIn})`,
                        transformOrigin: "50% 100%",
                    }}
                >
                    <Paper
                        seed="wall"
                        color={block.color ?? theme.accent}
                        style={{ width: "100%", height: "100%" }}
                    />
                    {block.label && (
                        <div
                            style={{
                                ...type.label,
                                position: "absolute",
                                top: (lane + 70) * 2 + 14,
                                left: "50%",
                                transform: "translateX(-50%)",
                                whiteSpace: "nowrap",
                                fontSize: 26,
                                color: theme.onBg,
                                filter: paperShadow(theme, 0),
                            }}
                        >
                            {block.label}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
