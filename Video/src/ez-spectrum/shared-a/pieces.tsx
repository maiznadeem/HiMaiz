// Pieces shared by the ez-spectrum scenes study-engine and plan-reports. Everything is drawn in SVG, in
// safe-area coordinates (1600 x 760), so a scene can place hundreds of small pieces exactly.
// The common set: a study is a small paper card with a tower mark, a worker is a small box with a gear,
// the database is a cylinder, the server is one large box drawn with many small cores.
import React from "react";
import { Easing, spring } from "remotion";
import { useFrame, useTheme, useTimeline, type Cue } from "../../kit";
import { jitter, seeded } from "../../kit/random";
import { cueFrame } from "../../kit/timing";

export const W = 1600;
export const H = 760;
export const GREEN = "#37b3a4";
export const RED = "#ff4f1a";
export const GREY = "#c9d3d6";
export const LABEL: React.CSSProperties = {
    fontFamily: "IBM Plex Mono",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
};
export const DISPLAY: React.CSSProperties = {
    fontFamily: "Fraunces",
    fontWeight: 600,
    letterSpacing: "-0.01em",
};

const EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Time helpers for one frame. Every moment is a narration cue; no frame numbers in scenes. */
export function useClock() {
    const frame = useFrame();
    const tl = useTimeline();
    const theme = useTheme();
    const fps = tl.fps;
    const at = (c: Cue) => cueFrame(tl, c);
    /** Eased 0..1 over `seconds` from a cue. */
    const prog = (c: Cue, seconds = 0.8, delay = 0) =>
        EASE(clamp01((frame - at(c) - delay * fps) / Math.max(1, seconds * fps)));
    /** Eased 0..1 between two cues. */
    const span = (a: Cue, b: Cue) => EASE(clamp01((frame - at(a)) / Math.max(1, at(b) - at(a))));
    /** Linear 0..1 between two cues. */
    const lin = (a: Cue, b: Cue) => clamp01((frame - at(a)) / Math.max(1, at(b) - at(a)));
    /** A spring in the look's feel: 0 before the cue, settles at 1 (with a little overshoot). */
    const pop = (c: Cue, delay = 0) => {
        const s = at(c) + Math.round(delay * fps);
        if (frame < s) return 0;
        return spring({
            frame: frame - s,
            fps,
            config: {
                damping: theme.motion.damping,
                stiffness: theme.motion.stiffness,
                mass: theme.motion.mass,
            },
        });
    };
    const after = (c: Cue, delay = 0) => frame >= at(c) + delay * fps;
    return { frame, fps, t: frame / fps, at, prog, span, lin, pop, after, theme };
}

/** Defs every scene SVG needs: the hard paper shadow and the red hatch for an overlap. */
export function PaperDefs() {
    return (
        <defs>
            <filter id="ps" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                    dx="5"
                    dy="8"
                    stdDeviation="0"
                    floodColor="#000"
                    floodOpacity="0.45"
                />
            </filter>
            <filter id="ps-small" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow
                    dx="2"
                    dy="3"
                    stdDeviation="0"
                    floodColor="#000"
                    floodOpacity="0.45"
                />
            </filter>
            <pattern
                id="hatch"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(40)"
            >
                <rect width="16" height="16" fill="rgba(255,79,26,0.25)" />
                <line x1="0" y1="0" x2="0" y2="16" stroke={RED} strokeWidth="7" />
            </pattern>
        </defs>
    );
}

/**
 * The scene's pictures, enlarged 1.08x and moved so the safe area's 1600 x 760 maps to frame x 50..1778,
 * y 60..881: the pictures use more of the frame and still stay above the bottom 14% (the site's captions)
 * and clear of the look's ornament in the top-right corner.
 */
export function Enlarge(props: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                transform: "translate(-70px, -10px) scale(1.08)",
                transformOrigin: "0 0",
            }}
        >
            {props.children}
        </div>
    );
}

/** A full safe-area SVG layer. */
export function Layer(props: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...props.style }}
        >
            <PaperDefs />
            {props.children}
        </svg>
    );
}

type Pt = [number, number];

function smoothClosed(pts: Pt[]): string {
    const n = pts.length;
    const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
        const p = pts[i];
        const m = mid(p, pts[(i + 1) % n]);
        d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    return d + " Z";
}

/** A hand-drawn circle: slightly uneven, never quite round. */
export function roughCircle(cx: number, cy: number, r: number, seed: string, amp = 0.025): string {
    const n = Math.max(14, Math.round(r / 9));
    const pts: Pt[] = [];
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = r * (1 + amp * jitter(seed, i));
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return smoothClosed(pts);
}

/** A rectangle with scissor-cut edges, as a path. */
export function cutRect(x: number, y: number, w: number, h: number, seed: string, amp = 2): string {
    const pts: Pt[] = [];
    const nx = Math.max(2, Math.round(w / 40));
    const ny = Math.max(2, Math.round(h / 40));
    const j = (i: number) => jitter(seed, i) * amp;
    for (let i = 0; i < nx; i++) pts.push([x + (w * i) / nx + j(i), y + j(100 + i)]);
    for (let i = 0; i < ny; i++) pts.push([x + w + j(200 + i), y + (h * i) / ny + j(300 + i)]);
    for (let i = 0; i < nx; i++) pts.push([x + w - (w * i) / nx + j(400 + i), y + h + j(500 + i)]);
    for (let i = 0; i < ny; i++) pts.push([x + j(600 + i), y + h - (h * i) / ny + j(700 + i)]);
    return "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + " Z";
}

/** A generic, invented landmass: a blob with a few slow bumps. Not any real place. */
export function makeLand(cx: number, cy: number, rx: number, ry: number, seed: string, wiggle = 1) {
    const rnd = seeded(seed);
    const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
    const radius = (a: number) =>
        1 +
        0.11 * wiggle * Math.sin(2 * a + ph[0]) +
        0.07 * wiggle * Math.sin(3 * a + ph[1]) +
        0.045 * wiggle * Math.sin(5 * a + ph[2]) +
        0.03 * wiggle * Math.sin(9 * a + ph[3]);
    const n = 90;
    const pts: Pt[] = [];
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = radius(a) * (1 + 0.012 * jitter(seed, i));
        pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
    }
    const inside = (x: number, y: number, margin = 0.9) => {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const a = Math.atan2(dy, dx);
        return Math.hypot(dx, dy) < radius(a) * margin;
    };
    return { d: smoothClosed(pts), inside, pts };
}

/** Seeded points inside a shape, kept apart from each other. */
export function scatter(
    n: number,
    box: { x: number; y: number; w: number; h: number },
    inside: (x: number, y: number) => boolean,
    seed: string,
    minGap: number,
): Pt[] {
    const rnd = seeded(seed);
    const out: Pt[] = [];
    let tries = 0;
    while (out.length < n && tries < 20000) {
        tries++;
        const x = box.x + rnd() * box.w;
        const y = box.y + rnd() * box.h;
        if (!inside(x, y)) continue;
        if (out.some(([px, py]) => Math.hypot(px - x, py - y) < minGap)) continue;
        out.push([x, y]);
    }
    return out;
}

/** A radio mast in cut paper: a lattice tower on its base point, with signal arcs at the top. */
export function Mast(props: {
    x: number;
    y: number;
    h: number;
    color: string;
    rise?: number;
    arcs?: number;
    opacity?: number;
    shadow?: boolean;
}) {
    const theme = useTheme();
    const { x, y, h } = props;
    const rise = props.rise ?? 1;
    if (rise <= 0.001) return null;
    const w = h * 0.24;
    const sw = Math.max(1.5, h / 50);
    const braces: string[] = [];
    const steps = 4;
    for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const y0 = -h * 0.82 * t0;
        const y1 = -h * 0.82 * t1;
        const w0 = w * (1 - t0 * 0.82);
        const w1 = w * (1 - t1 * 0.82);
        braces.push(`M ${-w0} ${y0} L ${w1} ${y1} M ${w0} ${y0} L ${-w1} ${y1}`);
    }
    const arcs = props.arcs ?? 2;
    return (
        <g
            transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * rise} ${rise})`}
            opacity={props.opacity ?? 1}
            filter={props.shadow === false ? undefined : h > 60 ? "url(#ps)" : "url(#ps-small)"}
        >
            <path
                d={`M ${-w} 0 L ${-w * 0.12} ${-h * 0.86} L ${w * 0.12} ${-h * 0.86} L ${w} 0 Z`}
                fill={props.color}
                stroke={theme.ink}
                strokeWidth={sw}
                strokeLinejoin="round"
            />
            {h > 40 && (
                <path d={braces.join(" ")} stroke={theme.ink} strokeWidth={sw * 0.7} fill="none" />
            )}
            <circle
                cx={0}
                cy={-h * 0.9}
                r={h * 0.075}
                fill={props.color}
                stroke={theme.ink}
                strokeWidth={sw}
            />
            {Array.from({ length: arcs }, (_, i) => {
                const r = h * (0.16 + i * 0.11);
                return (
                    <g key={i}>
                        <path
                            d={`M ${-r * 0.7} ${-h * 0.9 - r * 0.7} A ${r} ${r} 0 0 0 ${-r * 0.7} ${-h * 0.9 + r * 0.7}`}
                            stroke={props.color}
                            strokeWidth={sw * 1.4}
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d={`M ${r * 0.7} ${-h * 0.9 - r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.7} ${-h * 0.9 + r * 0.7}`}
                            stroke={props.color}
                            strokeWidth={sw * 1.4}
                            fill="none"
                            strokeLinecap="round"
                        />
                    </g>
                );
            })}
        </g>
    );
}

/** The tower mark printed on a study card. */
function TowerMark(props: { x: number; y: number; s: number; color: string }) {
    const { x, y, s } = props;
    return (
        <path
            d={`M ${x - s * 0.3} ${y + s * 0.5} L ${x} ${y - s * 0.35} L ${x + s * 0.3} ${y + s * 0.5} M ${x - s * 0.15} ${y + s * 0.1} L ${x + s * 0.15} ${y + s * 0.1} M ${x - s * 0.36} ${y - s * 0.45} A ${s * 0.45} ${s * 0.45} 0 0 0 ${x - s * 0.36} ${y - s * 0.05} M ${x + s * 0.36} ${y - s * 0.45} A ${s * 0.45} ${s * 0.45} 0 0 1 ${x + s * 0.36} ${y - s * 0.05}`}
            stroke={props.color}
            strokeWidth={Math.max(1.4, s / 9)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
}

export type CardState = "idle" | "ok" | "no";

/** A study: a small paper card with a tower mark. Green when the channel is free, orange-red when not. */
export function StudyCard(props: {
    x: number;
    y: number;
    w?: number;
    state?: CardState;
    text?: string;
    seed?: string;
    rot?: number;
    opacity?: number;
    scale?: number;
    shadow?: boolean;
}) {
    const theme = useTheme();
    const base = props.w ?? 64;
    const h = base * 0.66;
    // A card with text grows to fit it.
    const w = props.text
        ? Math.max(base, h * 1.15 + props.text.length * h * 0.42 * 0.64 + h * 0.3)
        : base;
    const state = props.state ?? "idle";
    const fill = state === "ok" ? GREEN : state === "no" ? RED : theme.paper;
    const ink = state === "idle" ? theme.ink : "#fffaf2";
    const big = base >= 50;
    return (
        <g
            transform={`translate(${props.x} ${props.y}) rotate(${props.rot ?? 0}) scale(${props.scale ?? 1})`}
            opacity={props.opacity ?? 1}
            filter={props.shadow === false ? undefined : big ? "url(#ps-small)" : undefined}
        >
            {big && (
                <path d={cutRect(-w / 2, -h / 2, w, h, props.seed ?? "card", 1.2)} fill={fill} />
            )}
            {!big && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.08} fill={fill} />}
            {state === "idle" && (
                <rect
                    x={-w / 2}
                    y={-h / 2}
                    width={w}
                    height={h}
                    rx={w * 0.06}
                    fill="none"
                    stroke={theme.inkSoft}
                    strokeWidth={big ? 2 : 1}
                />
            )}
            <TowerMark x={props.text ? -w / 2 + h * 0.5 : 0} y={0} s={h * 0.62} color={ink} />
            {props.text && (
                <text
                    x={-w / 2 + h * 0.95}
                    y={h * 0.13}
                    fill={ink}
                    style={{ ...LABEL, fontSize: h * 0.42 }}
                    dominantBaseline="middle"
                >
                    {props.text}
                </text>
            )}
        </g>
    );
}

/** A gear outline centred on 0,0. */
export function gearPath(r: number, teeth = 8): string {
    const pts: string[] = [];
    const n = teeth * 4;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const k = i % 4;
        const rr = k === 0 || k === 1 ? r : r * 0.76;
        pts.push(`${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
    }
    return `M ${pts.join(" L ")} Z`;
}

/** A worker: a small paper box with a gear that turns while it works. */
export function Worker(props: {
    x: number;
    y: number;
    size?: number;
    spin?: number;
    busy?: boolean;
    opacity?: number;
    scale?: number;
    seed?: string;
}) {
    const theme = useTheme();
    const s = props.size ?? 70;
    const busy = props.busy ?? true;
    return (
        <g
            transform={`translate(${props.x} ${props.y}) scale(${props.scale ?? 1})`}
            opacity={props.opacity ?? 1}
            filter="url(#ps-small)"
        >
            <path
                d={cutRect(-s / 2, -s / 2, s, s, props.seed ?? "worker", 1.4)}
                fill={theme.paper}
            />
            <g transform={`rotate(${props.spin ?? 0})`}>
                <path
                    d={gearPath(s * 0.32, 8)}
                    fill={busy ? theme.accent : GREY}
                    stroke={theme.ink}
                    strokeWidth={Math.max(1.5, s / 28)}
                    strokeLinejoin="round"
                />
                <circle
                    r={s * 0.09}
                    fill={theme.paper}
                    stroke={theme.ink}
                    strokeWidth={Math.max(1.5, s / 28)}
                />
            </g>
        </g>
    );
}

/** The database: a paper cylinder. Children are drawn inside its body (clipped). */
export function Cylinder(props: {
    x: number;
    y: number;
    w: number;
    h: number;
    fill?: string;
    open?: number;
    id: string;
    children?: React.ReactNode;
    label?: string;
}) {
    const theme = useTheme();
    const { x, y, w } = props;
    const h = props.h * (props.open ?? 1);
    if (h <= 1) return null;
    const ry = w * 0.16;
    const body = `M ${x - w / 2} ${y} L ${x - w / 2} ${y + h} A ${w / 2} ${ry} 0 0 0 ${x + w / 2} ${y + h} L ${x + w / 2} ${y} Z`;
    return (
        <g>
            <defs>
                <clipPath id={props.id}>
                    <path d={body} />
                </clipPath>
            </defs>
            <g filter="url(#ps)">
                <path d={body} fill={props.fill ?? theme.paper} />
                <ellipse cx={x} cy={y} rx={w / 2} ry={ry} fill={theme.paperAlt} />
            </g>
            <g clipPath={`url(#${props.id})`}>{props.children}</g>
            <path
                d={`M ${x - w / 2} ${y} L ${x - w / 2} ${y + h} A ${w / 2} ${ry} 0 0 0 ${x + w / 2} ${y + h} L ${x + w / 2} ${y}`}
                fill="none"
                stroke={theme.ink}
                strokeWidth={5}
            />
            <ellipse
                cx={x}
                cy={y}
                rx={w / 2}
                ry={ry}
                fill="none"
                stroke={theme.ink}
                strokeWidth={5}
            />
            {props.label && (
                <text
                    x={x}
                    y={y + h + ry + 46}
                    textAnchor="middle"
                    fill={theme.onBg}
                    style={{ ...LABEL, fontSize: 30 }}
                >
                    {props.label}
                </text>
            )}
        </g>
    );
}

/** The server: one large paper box drawn with many small cores. `lit` is how many cores are busy. */
export function ServerBox(props: {
    x: number;
    y: number;
    w: number;
    h: number;
    cores: number;
    cols: number;
    lit: number;
    label?: string;
    labelSize?: number;
    pulse?: number;
}) {
    const theme = useTheme();
    const { x, y, w, h, cores, cols } = props;
    const rows = Math.ceil(cores / cols);
    const pad = 34;
    const top = props.label ? 80 : pad;
    const cw = (w - pad * 2) / cols;
    const ch = (h - top - pad) / rows;
    const cell = Math.min(cw, ch);
    return (
        <g>
            <path d={cutRect(x, y, w, h, "server", 2.5)} fill={theme.paper} filter="url(#ps)" />
            {props.label && (
                <text
                    x={x + pad}
                    y={y + 54}
                    fill={theme.ink}
                    style={{ ...LABEL, fontSize: props.labelSize ?? 34 }}
                >
                    {props.label}
                </text>
            )}
            {Array.from({ length: cores }, (_, i) => {
                const c = i % cols;
                const r = Math.floor(i / cols);
                const cx = x + pad + c * cw + (cw - cell * 0.8) / 2;
                const cy = y + top + r * ch + (ch - cell * 0.8) / 2;
                const on = i < props.lit;
                const blink = on && props.pulse !== undefined ? ((i * 7 + props.pulse) % 9) / 9 : 1;
                return (
                    <rect
                        key={i}
                        x={cx}
                        y={cy}
                        width={cell * 0.8}
                        height={cell * 0.8}
                        rx={3}
                        fill={on ? theme.accent : theme.paperAlt}
                        opacity={on ? 0.75 + 0.25 * blink : 1}
                        stroke={theme.ink}
                        strokeWidth={2}
                    />
                );
            })}
        </g>
    );
}

/** A paper stopwatch with a hand and a readout under it. */
export function Stopwatch(props: {
    x: number;
    y: number;
    r: number;
    angle: number;
    readout: string;
    /** One line, or several stacked upwards from the top of the watch. */
    label?: string | string[];
    color?: string;
    opacity?: number;
    dim?: boolean;
}) {
    const theme = useTheme();
    const { x, y, r } = props;
    const a = ((props.angle - 90) * Math.PI) / 180;
    const color = props.color ?? theme.accent;
    return (
        <g opacity={props.opacity ?? 1}>
            <g filter="url(#ps)">
                <rect
                    x={x - r * 0.16}
                    y={y - r * 1.28}
                    width={r * 0.32}
                    height={r * 0.26}
                    rx={4}
                    fill={theme.paperAlt}
                />
                <circle cx={x} cy={y} r={r} fill={props.dim ? theme.paperAlt : theme.paper} />
            </g>
            <circle
                cx={x}
                cy={y}
                r={r}
                fill="none"
                stroke={theme.ink}
                strokeWidth={Math.max(3, r / 22)}
            />
            {Array.from({ length: 12 }, (_, i) => {
                const t = (i / 12) * Math.PI * 2;
                return (
                    <line
                        key={i}
                        x1={x + Math.cos(t) * r * 0.78}
                        y1={y + Math.sin(t) * r * 0.78}
                        x2={x + Math.cos(t) * r * 0.9}
                        y2={y + Math.sin(t) * r * 0.9}
                        stroke={theme.inkSoft}
                        strokeWidth={Math.max(2, r / 40)}
                    />
                );
            })}
            <line
                x1={x}
                y1={y}
                x2={x + Math.cos(a) * r * 0.75}
                y2={y + Math.sin(a) * r * 0.75}
                stroke={color}
                strokeWidth={Math.max(3, r / 16)}
                strokeLinecap="round"
            />
            <circle cx={x} cy={y} r={Math.max(4, r / 12)} fill={theme.ink} />
            <text
                x={x}
                y={y + r + Math.max(40, r * 0.42)}
                textAnchor="middle"
                fill={theme.onBg}
                style={{
                    ...DISPLAY,
                    fontSize: Math.max(32, r * 0.42),
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {props.readout}
            </text>
            {props.label &&
                (Array.isArray(props.label) ? props.label : [props.label]).map((line, i, all) => {
                    const size = Math.max(28, r * 0.2);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y - r * 1.28 - 18 - (all.length - 1 - i) * size * 1.2}
                            textAnchor="middle"
                            fill={theme.onBgSoft}
                            style={{ ...LABEL, fontSize: size }}
                        >
                            {line}
                        </text>
                    );
                })}
        </g>
    );
}

/** An ink stamp that lands with a thud: big and faint, then down to size. */
export function Stamp(props: {
    x: number;
    y: number;
    text: string;
    color: string;
    p: number;
    size?: number;
    rot?: number;
}) {
    if (props.p <= 0) return null;
    const size = props.size ?? 44;
    const scale = 1 + (1 - Math.min(1, props.p)) * 0.8;
    const w = props.text.length * size * 0.66 + size * 1.2;
    const h = size * 1.7;
    return (
        <g
            transform={`translate(${props.x} ${props.y}) rotate(${props.rot ?? -6}) scale(${scale})`}
            opacity={Math.min(1, props.p * 1.6)}
        >
            <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={10}
                fill="rgba(28,38,49,0.7)"
                stroke={props.color}
                strokeWidth={6}
            />
            <text
                x={0}
                y={size * 0.36}
                textAnchor="middle"
                fill={props.color}
                style={{ ...LABEL, fontSize: size, fontWeight: 500 }}
            >
                {props.text}
            </text>
        </g>
    );
}

/** A tick mark drawn in ink, `p` 0..1 of the stroke. */
export function Tick(props: {
    x: number;
    y: number;
    s: number;
    p: number;
    color: string;
    width?: number;
}) {
    if (props.p <= 0) return null;
    const { x, y, s } = props;
    return (
        <path
            d={`M ${x - s * 0.45} ${y} L ${x - s * 0.1} ${y + s * 0.35} L ${x + s * 0.5} ${y - s * 0.4}`}
            stroke={props.color}
            strokeWidth={props.width ?? Math.max(4, s / 6)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 3"
            strokeDashoffset={1 - clamp01(props.p)}
        />
    );
}

/** A hand-drawn ink cross over a box, `p` 0..1. */
export function Cross(props: {
    x: number;
    y: number;
    w: number;
    h: number;
    p: number;
    color: string;
}) {
    const { x, y, w, h, p } = props;
    const a = clamp01(p * 2);
    const b = clamp01(p * 2 - 1);
    return (
        <g stroke={props.color} strokeWidth={14} strokeLinecap="round" fill="none">
            {a > 0 && (
                <path
                    d={`M ${x} ${y} Q ${x + w * 0.52} ${y + h * 0.46} ${x + w} ${y + h}`}
                    pathLength={1}
                    strokeDasharray="1 3"
                    strokeDashoffset={1 - a}
                />
            )}
            {b > 0 && (
                <path
                    d={`M ${x + w} ${y} Q ${x + w * 0.46} ${y + h * 0.54} ${x} ${y + h}`}
                    pathLength={1}
                    strokeDasharray="1 3"
                    strokeDashoffset={1 - b}
                />
            )}
        </g>
    );
}

/** Text in the label style (mono, uppercase). */
export function Label(props: {
    x: number;
    y: number;
    text: string;
    size?: number;
    color?: string;
    anchor?: "start" | "middle" | "end";
    opacity?: number;
}) {
    const theme = useTheme();
    return (
        <text
            x={props.x}
            y={props.y}
            textAnchor={props.anchor ?? "start"}
            fill={props.color ?? theme.onBg}
            opacity={props.opacity ?? 1}
            style={{ ...LABEL, fontSize: props.size ?? 30 }}
        >
            {props.text}
        </text>
    );
}

/** Big display text (Fraunces). */
export function Big(props: {
    x: number;
    y: number;
    text: string;
    size?: number;
    color?: string;
    anchor?: "start" | "middle" | "end";
    opacity?: number;
    italic?: boolean;
}) {
    const theme = useTheme();
    return (
        <text
            x={props.x}
            y={props.y}
            textAnchor={props.anchor ?? "start"}
            fill={props.color ?? theme.onBg}
            opacity={props.opacity ?? 1}
            style={{
                ...DISPLAY,
                fontSize: props.size ?? 72,
                fontStyle: props.italic ? "italic" : "normal",
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {props.text}
        </text>
    );
}

/** A paper tag (filled box with label text), drawn in SVG. */
export function SvgTag(props: {
    x: number;
    y: number;
    text: string;
    color?: string;
    ink?: string;
    size?: number;
    p?: number;
    rot?: number;
    anchor?: "start" | "middle";
}) {
    const theme = useTheme();
    const p = props.p ?? 1;
    if (p <= 0) return null;
    const size = props.size ?? 30;
    const w = props.text.length * size * 0.66 + size * 1.3;
    const h = size * 1.75;
    const x0 = props.anchor === "middle" ? -w / 2 : 0;
    return (
        <g
            transform={`translate(${props.x} ${props.y}) rotate(${props.rot ?? -1.5}) scale(${0.6 + 0.4 * p})`}
            opacity={Math.min(1, p * 2)}
            filter="url(#ps-small)"
        >
            <path
                d={cutRect(x0, -h / 2, w, h, `tag-${props.text}`, 1.5)}
                fill={props.color ?? theme.accent}
            />
            <text
                x={x0 + size * 0.65}
                y={size * 0.36}
                fill={props.ink ?? "#fffaf2"}
                style={{ ...LABEL, fontSize: size }}
            >
                {props.text}
            </text>
        </g>
    );
}

/** Format a number with thousands separators. */
export const fmt = (v: number, decimals = 0) =>
    v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
