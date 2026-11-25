// Pieces shared by the Qoria scenes half-the-work, side-door and how-i-work. The shared Qoria look:
// a phone is a small rounded upright rectangle, an app server a small box with two slots, the
// database a cylinder, the edge a shield. Healthy is ink, in trouble is orange, dead is grey with a
// cross. Good marks (checks, matches) are the look's sage.
import React, { type CSSProperties } from "react";
import { Easing, interpolate } from "remotion";
import {
    cueSeconds,
    roughPath,
    useFrame,
    useTheme,
    useTimeline,
    useType,
    type Cue,
} from "../../kit";

export type State = "ok" | "hot" | "dead";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** Seconds since the start of the video. */
export function useSeconds(): number {
    const frame = useFrame();
    return frame / useTimeline().fps;
}

/** The time of a cue, in seconds. */
export function useCue(): (cue: Cue) => number {
    const timeline = useTimeline();
    return (cue: Cue) => cueSeconds(timeline, cue);
}

/** Eased 0..1 from cue `a` over `secs` seconds (or until cue `b`). */
export function useRamp(): (a: Cue, b: Cue | number) => number {
    const t = useSeconds();
    const cue = useCue();
    return (a: Cue, b: Cue | number) => {
        const s = cue(a);
        const e = typeof b === "number" ? s + b : cue(b);
        return interpolate(t, [s, Math.max(s + 0.01, e)], [0, 1], { ...clamp, easing: ease });
    };
}

/** A spring-like pop: 0 before, overshoots a little, settles at 1. */
export function pop(p: number): number {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return 1 + Math.sin(p * Math.PI) * 0.12 - (1 - p) * (1 - p) * 1.0;
}

export function lerp(a: number, b: number, p: number): number {
    return a + (b - a) * p;
}

/** Text in the look's label face. */
export function Label(props: {
    children: React.ReactNode;
    size?: number;
    color?: string;
    style?: CSSProperties;
    display?: boolean;
}) {
    const theme = useTheme();
    const type = useType();
    return (
        <div
            style={{
                ...(props.display ? type.display : type.label),
                fontSize: props.size ?? 32,
                color: props.color ?? theme.onBg,
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}

/** A positioned, centred holder. */
export function At(props: {
    x: number;
    y: number;
    children: React.ReactNode;
    scale?: number;
    rotate?: number;
    opacity?: number;
    origin?: string;
    style?: CSSProperties;
}) {
    return (
        <div
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                transform: `translate(-50%, -50%) scale(${props.scale ?? 1}) rotate(${props.rotate ?? 0}deg)`,
                transformOrigin: props.origin ?? "50% 50%",
                opacity: props.opacity ?? 1,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}

function shadow(theme: ReturnType<typeof useTheme>, lift = 1) {
    return `drop-shadow(${theme.shadowOffset[0] * lift}px ${theme.shadowOffset[1] * lift}px 0 ${theme.shadow})`;
}

const stroke = (color: string, w = 5) =>
    ({
        fill: "none",
        stroke: color,
        strokeWidth: w,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    }) as const;

function deadOrHot(theme: ReturnType<typeof useTheme>, state: State) {
    if (state === "hot") return { line: theme.accent, fill: "#ffe3d6" };
    if (state === "dead") return { line: "#9a9993", fill: "#d4d3cd" };
    return { line: theme.ink, fill: theme.paper };
}

/** A grey cross over a dead piece. */
function DeadCross({ w, h }: { w: number; h: number }) {
    return (
        <path
            d={`M ${w * 0.2} ${h * 0.2} L ${w * 0.8} ${h * 0.8} M ${w * 0.8} ${h * 0.2} L ${w * 0.2} ${h * 0.8}`}
            {...stroke("#6f6e69", Math.max(4, w * 0.08))}
        />
    );
}

/** A phone: a small rounded upright rectangle. */
export function Phone(props: { size?: number; state?: State; glow?: boolean }) {
    const theme = useTheme();
    const h = props.size ?? 64;
    const w = h * 0.56;
    const c = deadOrHot(theme, props.state ?? "ok");
    return (
        <svg
            width={w + 8}
            height={h + 8}
            viewBox={`-4 -4 ${w + 8} ${h + 8}`}
            style={{ filter: shadow(theme, 0.5), overflow: "visible" }}
        >
            <rect
                x={0}
                y={0}
                width={w}
                height={h}
                rx={w * 0.22}
                {...stroke(c.line, 3.5)}
                fill={c.fill}
            />
            <rect
                x={w * 0.16}
                y={h * 0.14}
                width={w * 0.68}
                height={h * 0.62}
                rx={3}
                fill={props.glow ? theme.accent : theme.paperAlt}
            />
            <circle cx={w / 2} cy={h * 0.87} r={Math.max(1.5, w * 0.06)} fill={c.line} />
            {props.state === "dead" && <DeadCross w={w} h={h} />}
        </svg>
    );
}

/** An app server: a small box with two slots. */
export function AppServer(props: { size?: number; state?: State; label?: string }) {
    const theme = useTheme();
    const w = props.size ?? 120;
    const h = w * 0.8;
    const c = deadOrHot(theme, props.state ?? "ok");
    return (
        <div style={{ position: "relative", width: w, textAlign: "center" }}>
            <svg
                width={w}
                height={h}
                viewBox={`-4 -4 ${w + 8} ${h + 8}`}
                style={{ filter: shadow(theme), overflow: "visible" }}
            >
                <rect
                    x={0}
                    y={0}
                    width={w}
                    height={h}
                    rx={10}
                    {...stroke(c.line, 5)}
                    fill={c.fill}
                />
                {[0.28, 0.6].map((y) => (
                    <g key={y}>
                        <rect
                            x={w * 0.14}
                            y={h * y}
                            width={w * 0.72}
                            height={h * 0.18}
                            rx={4}
                            {...stroke(c.line, 4)}
                        />
                        <circle cx={w * 0.26} cy={h * (y + 0.09)} r={w * 0.035} fill={c.line} />
                    </g>
                ))}
                {props.state === "dead" && <DeadCross w={w} h={h} />}
            </svg>
            {props.label && (
                <Label size={28} style={{ marginTop: 10 }}>
                    {props.label}
                </Label>
            )}
        </div>
    );
}

/** The database: a paper cylinder. `heat` (0..1) tints it toward the trouble colour. */
export function Database(props: {
    w?: number;
    h?: number;
    heat?: number;
    children?: React.ReactNode;
    ghost?: boolean;
    dashed?: boolean;
}) {
    const theme = useTheme();
    const w = props.w ?? 300;
    const h = props.h ?? 380;
    const ry = w * 0.16;
    const heat = props.heat ?? 0;
    const fill = mix(theme.paper, "#ffd9c7", heat);
    const line = mix(theme.ink, theme.accent, heat);
    const body = `M 0 ${ry} V ${h - ry} A ${w / 2} ${ry} 0 0 0 ${w} ${h - ry} V ${ry}`;
    return (
        <div style={{ position: "relative", width: w, height: h }}>
            <svg
                width={w}
                height={h}
                viewBox={`-6 -6 ${w + 12} ${h + 12}`}
                style={{
                    overflow: "visible",
                    filter: props.ghost ? undefined : shadow(theme, 1.2),
                }}
            >
                {props.ghost ? (
                    <>
                        <path d={body} {...stroke(theme.inkSoft, 4)} strokeDasharray="14 12" />
                        <ellipse
                            cx={w / 2}
                            cy={ry}
                            rx={w / 2}
                            ry={ry}
                            {...stroke(theme.inkSoft, 4)}
                            strokeDasharray="14 12"
                        />
                    </>
                ) : (
                    <>
                        <path
                            d={`${body} A ${w / 2} ${ry} 0 0 0 0 ${ry} Z`}
                            {...stroke(line, 6)}
                            fill={fill}
                        />
                        <ellipse
                            cx={w / 2}
                            cy={ry}
                            rx={w / 2}
                            ry={ry}
                            {...stroke(line, 6)}
                            fill={mix(theme.paperAlt, "#ffc4a8", heat)}
                        />
                        <path
                            d={`M 0 ${h * 0.82} A ${w / 2} ${ry} 0 0 0 ${w} ${h * 0.82}`}
                            {...stroke(theme.accent, 6)}
                        />
                    </>
                )}
            </svg>
            <div style={{ position: "absolute", inset: 0 }}>{props.children}</div>
        </div>
    );
}

/** The edge: a shield. */
export function Shield(props: { size?: number; dim?: number; check?: boolean }) {
    const theme = useTheme();
    const s = props.size ?? 120;
    const dim = props.dim ?? 0;
    const line = mix(theme.ink, "#a3a29c", dim);
    return (
        <svg
            width={s}
            height={s * 1.1}
            viewBox="0 0 100 110"
            style={{ filter: shadow(theme, 0.7), overflow: "visible" }}
        >
            <path
                d="M50 4 L90 18 V48 C90 76 70 94 50 104 C30 94 10 76 10 48 V18 Z"
                {...stroke(line, 6)}
                fill={mix(theme.paper, "#d8d7d1", dim)}
            />
            <path
                d="M50 16 L78 26 V48 C78 68 64 82 50 90 Z"
                fill={mix(theme.second, "#b9b8b2", dim)}
                opacity={0.85}
            />
            {props.check && <path d="M33 54 L45 66 L68 40" {...stroke(theme.ink, 7)} />}
        </svg>
    );
}

/** A hand-drawn tick that draws itself; p is 0..1. */
export function Tick(props: { size?: number; p?: number; color?: string; width?: number }) {
    const theme = useTheme();
    const s = props.size ?? 60;
    const p = props.p ?? 1;
    return (
        <svg width={s} height={s} viewBox="0 0 60 60" style={{ overflow: "visible" }}>
            <path
                d="M8 32 L24 48 L54 12"
                {...stroke(props.color ?? theme.second, props.width ?? 9)}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
            />
        </svg>
    );
}

/** A hand-drawn cross that draws itself; p is 0..1. */
export function InkCross(props: { size?: number; p?: number; color?: string; width?: number }) {
    const theme = useTheme();
    const s = props.size ?? 60;
    const p = props.p ?? 1;
    const a = Math.min(1, p * 2);
    const b = Math.max(0, p * 2 - 1);
    return (
        <svg width={s} height={s} viewBox="0 0 60 60" style={{ overflow: "visible" }}>
            <path
                d="M8 8 L52 52"
                {...stroke(props.color ?? theme.ink, props.width ?? 8)}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - a}
            />
            <path
                d="M52 8 L8 52"
                {...stroke(props.color ?? theme.ink, props.width ?? 8)}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - b}
            />
        </svg>
    );
}

/** A rubber stamp that slams in; p is 0..1 from its cue. */
export function Stamp(props: {
    text: string;
    p: number;
    color?: string;
    size?: number;
    rotate?: number;
}) {
    const theme = useTheme();
    const type = useType();
    const color = props.color ?? theme.accent;
    const p = props.p;
    if (p <= 0) return null;
    const scale =
        p < 0.35 ? lerp(1.8, 0.94, p / 0.35) : lerp(0.94, 1, Math.min(1, (p - 0.35) / 0.3));
    const size = props.size ?? 44;
    return (
        <div
            style={{
                ...type.display,
                display: "inline-block",
                fontSize: size,
                color,
                border: `${Math.max(4, size * 0.1)}px solid ${color}`,
                borderRadius: size * 0.2,
                padding: `${size * 0.12}px ${size * 0.4}px`,
                transform: `scale(${scale}) rotate(${props.rotate ?? -6}deg)`,
                opacity: Math.min(1, p * 4) * 0.92,
                whiteSpace: "nowrap",
                background: "rgba(247,246,241,0.85)",
            }}
        >
            {props.text}
        </div>
    );
}

/** A small paper robot (an agent, a scanner, a test). */
export function Robot(props: { size?: number; color?: string; label?: string; bob?: number }) {
    const theme = useTheme();
    const s = props.size ?? 70;
    const body = props.color ?? theme.paperAlt;
    return (
        <div style={{ position: "relative", width: s, textAlign: "center" }}>
            <svg
                width={s}
                height={s * 1.15}
                viewBox="0 0 60 70"
                style={{
                    filter: shadow(theme, 0.5),
                    overflow: "visible",
                    transform: `translateY(${props.bob ?? 0}px)`,
                }}
            >
                <path d="M30 2 V10" {...stroke(theme.ink, 3)} />
                <circle cx="30" cy="3" r="3" fill={theme.accent} />
                <rect
                    x="10"
                    y="10"
                    width="40"
                    height="28"
                    rx="8"
                    {...stroke(theme.ink, 3.5)}
                    fill={body}
                />
                <circle cx="23" cy="24" r="3.5" fill={theme.ink} />
                <circle cx="37" cy="24" r="3.5" fill={theme.ink} />
                <rect
                    x="14"
                    y="40"
                    width="32"
                    height="22"
                    rx="5"
                    {...stroke(theme.ink, 3.5)}
                    fill={body}
                />
                <path d="M20 62 V68 M40 62 V68" {...stroke(theme.ink, 3.5)} />
            </svg>
            {props.label && (
                <Label size={28} style={{ marginTop: 4 }}>
                    {props.label}
                </Label>
            )}
        </div>
    );
}

/** A simple paper person. */
export function Person(props: { size?: number; color?: string; highlight?: boolean }) {
    const theme = useTheme();
    const s = props.size ?? 70;
    const fill = props.color ?? (props.highlight ? theme.accent : theme.paper);
    return (
        <svg
            width={s}
            height={s * 1.4}
            viewBox="0 0 50 70"
            style={{ filter: shadow(theme, 0.5), overflow: "visible" }}
        >
            <circle cx="25" cy="13" r="10" {...stroke(theme.ink, 3.5)} fill={fill} />
            <path
                d="M8 66 C8 40 14 28 25 28 C36 28 42 40 42 66 Z"
                {...stroke(theme.ink, 3.5)}
                fill={fill}
            />
        </svg>
    );
}

/** A paper card (a plain rectangle with a cut edge feel). */
export function Card(props: {
    w: number;
    h: number;
    color?: string;
    children?: React.ReactNode;
    style?: CSSProperties;
    lift?: number;
    border?: string;
}) {
    const theme = useTheme();
    return (
        <div
            style={{
                width: props.w,
                height: props.h,
                background: props.color ?? theme.paper,
                borderRadius: 6,
                border: props.border ?? `4px solid ${theme.ink}`,
                boxSizing: "border-box",
                filter: shadow(theme, props.lift ?? 0.8),
                color: theme.ink,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}

/** A hand-drawn line between two points that draws in with p. */
export function Ink(props: {
    from: [number, number];
    to: [number, number];
    p?: number;
    color?: string;
    width?: number;
    dashed?: boolean;
    seed?: string;
    head?: boolean;
}) {
    const theme = useTheme();
    const p = props.p ?? 1;
    const d = roughPath(
        props.from,
        props.to,
        props.seed ?? `ink-${props.from}-${props.to}`,
        2,
        0.03,
    );
    const color = props.color ?? theme.ink;
    const w = props.width ?? 5;
    const ang = Math.atan2(props.to[1] - props.from[1], props.to[0] - props.from[0]);
    const head = (side: number) => {
        const a = ang + Math.PI + side * 0.5;
        const [x, y] = props.to;
        return `M ${x} ${y} L ${x + Math.cos(a) * 22} ${y + Math.sin(a) * 22}`;
    };
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
                {...stroke(color, w)}
                pathLength={1}
                strokeDasharray={props.dashed ? "0.012 0.018" : 1}
                strokeDashoffset={props.dashed ? 0 : 1 - p}
                opacity={props.dashed ? p : 1}
            />
            {props.head && p > 0.97 && <path d={`${head(1)} ${head(-1)}`} {...stroke(color, w)} />}
        </svg>
    );
}

/** A dot at a point. */
export function Dot(props: { x: number; y: number; r?: number; color?: string; opacity?: number }) {
    const theme = useTheme();
    const r = props.r ?? 9;
    return (
        <div
            style={{
                position: "absolute",
                left: props.x - r,
                top: props.y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                background: props.color ?? theme.ink,
                opacity: props.opacity ?? 1,
            }}
        />
    );
}

/** Mix two #rrggbb colours. */
export function mix(a: string, b: string, t: number): string {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const k = Math.max(0, Math.min(1, t));
    const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
    return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

/** Format a number with thousands separators. */
export function fmt(n: number): string {
    return Math.round(n).toLocaleString("en-US");
}
