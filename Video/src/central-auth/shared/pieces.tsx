import React, { type CSSProperties } from "react";
import { Paper, roughPath, useTheme, useType, type Point } from "../../kit";

/** The four invented app faces from demo-data.md. */
export const APPS = [
    { name: "Ledgerly", ink: "#5b2a6e", bg: "#eadff2", icon: "coins" },
    { name: "Skyline", ink: "#2f5d3a", bg: "#d6efdf", icon: "sun" },
    { name: "Reelhouse", ink: "#1f4fbf", bg: "#fbf1c4", icon: "film" },
    { name: "Notebook", ink: "#46515c", bg: "#f5ef9e", icon: "page" },
] as const;
export type App = (typeof APPS)[number];

export const CORAL = "#e8604c";
export const GOOD = "#4f7d45";
export const MONO = "'IBM Plex Mono', monospace";

export function AppIcon({ app, size = 64 }: { app: App; size?: number }) {
    const s = {
        fill: "none",
        stroke: app.ink,
        strokeWidth: 5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    } as const;
    return (
        <svg width={size} height={size} viewBox="0 0 64 64">
            {app.icon === "coins" &&
                [44, 32, 20].map((y) => (
                    <ellipse key={y} cx="32" cy={y} rx="20" ry="7" {...s} fill={app.bg} />
                ))}
            {app.icon === "sun" && (
                <>
                    <path d="M14 40 A18 18 0 0 1 50 40" {...s} fill={app.ink} />
                    <path d="M6 48 H58" {...s} />
                    {[-60, -30, 0, 30, 60].map((a) => {
                        const r = (a * Math.PI) / 180;
                        return (
                            <path
                                key={a}
                                d={`M ${32 + Math.sin(r) * 24} ${36 - Math.cos(r) * 24} L ${32 + Math.sin(r) * 30} ${36 - Math.cos(r) * 30}`}
                                {...s}
                            />
                        );
                    })}
                </>
            )}
            {app.icon === "film" && (
                <>
                    <rect x="8" y="12" width="48" height="40" rx="4" {...s} />
                    {[16, 28, 40].map((x) => (
                        <g key={x}>
                            <rect x={x} y="16" width="6" height="5" fill={app.ink} />
                            <rect x={x} y="43" width="6" height="5" fill={app.ink} />
                        </g>
                    ))}
                    <path d="M8 26 H56 M8 38 H56" {...s} strokeWidth={3} />
                </>
            )}
            {app.icon === "page" && (
                <>
                    <path d="M14 6 H40 L52 18 V58 H14 Z" {...s} />
                    <path d="M40 6 V18 H52" {...s} />
                    <path d="M22 30 H44 M22 40 H44 M22 50 H36" {...s} strokeWidth={3.5} />
                </>
            )}
        </svg>
    );
}

/** An app as a coloured cut-paper card with its icon and name. */
export function AppCard(props: {
    app: App;
    w?: number;
    h?: number;
    style?: CSSProperties;
    dim?: number;
    tilt?: number;
}) {
    const type = useType();
    const w = props.w ?? 250;
    const h = props.h ?? 180;
    return (
        <div
            style={{
                width: w,
                height: h,
                transform: `rotate(${props.tilt ?? 0}deg)`,
                filter: props.dim
                    ? `grayscale(${props.dim}) brightness(${1 - props.dim * 0.25})`
                    : undefined,
                ...props.style,
            }}
        >
            <Paper
                seed={`app-${props.app.name}`}
                color={props.app.bg}
                style={{ width: "100%", height: "100%" }}
                innerStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                }}
            >
                <AppIcon app={props.app} size={h * 0.4} />
                <div
                    style={{
                        ...type.display,
                        fontSize: Math.max(28, h * 0.19),
                        color: props.app.ink,
                    }}
                >
                    {props.app.name}
                </div>
            </Paper>
        </div>
    );
}

/** The sign-in server as a paper door with its label. `crack` 0..1 tears it top to bottom. */
export function Door(props: {
    w?: number;
    label?: string;
    crack?: number;
    flimsy?: boolean;
    style?: CSSProperties;
    color?: string;
}) {
    const theme = useTheme();
    const type = useType();
    const w = props.w ?? 200;
    const h = w * 1.5;
    const crack = props.crack ?? 0;
    const flimsy = props.flimsy;
    const crackPts: Point[] = [
        [100, 0],
        [86, 50],
        [112, 95],
        [90, 150],
        [116, 205],
        [96, 255],
        [108, 300],
    ];
    let d = "";
    const n = crackPts.length - 1;
    const upto = crack * n;
    for (let i = 0; i <= Math.ceil(upto) && i <= n; i++) {
        const p = crackPts[i];
        const prev = crackPts[Math.max(0, i - 1)];
        const frac = i <= upto ? 1 : upto - (i - 1);
        const x = prev[0] + (p[0] - prev[0]) * frac;
        const y = prev[1] + (p[1] - prev[1]) * frac;
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return (
        <div style={{ width: w, ...props.style }}>
            <svg
                width={w}
                height={h}
                viewBox="0 0 200 300"
                style={{
                    overflow: "visible",
                    filter: `drop-shadow(${theme.shadowOffset[0]}px ${theme.shadowOffset[1]}px 0 ${theme.shadow})`,
                }}
            >
                <path
                    d="M10 300 V70 C10 25 50 4 100 4 C150 4 190 25 190 70 V300 Z"
                    fill={props.color ?? (flimsy ? "#efede6" : theme.paper)}
                    stroke={theme.ink}
                    strokeWidth={flimsy ? 4 : 6}
                    strokeDasharray={flimsy ? "14 10" : undefined}
                />
                {!flimsy && (
                    <>
                        <path
                            d="M40 140 V84 C40 56 64 38 100 38 C136 38 160 56 160 84 V140 Z"
                            fill="none"
                            stroke={theme.inkSoft}
                            strokeWidth={4}
                        />
                        <rect
                            x="40"
                            y="170"
                            width="120"
                            height="100"
                            rx="6"
                            fill="none"
                            stroke={theme.inkSoft}
                            strokeWidth={4}
                        />
                    </>
                )}
                <circle cx="158" cy="160" r="11" fill={flimsy ? theme.inkSoft : theme.accent} />
                {crack > 0 && (
                    <>
                        <path d={d} fill="none" stroke={theme.bg} strokeWidth={16} />
                        <path d={d} fill="none" stroke={theme.ink} strokeWidth={4} />
                    </>
                )}
            </svg>
            {props.label && (
                <div
                    style={{
                        ...type.label,
                        fontSize: Math.max(28, w * 0.18),
                        textAlign: "center",
                        marginTop: 10,
                        color: flimsy ? theme.inkSoft : theme.onBg,
                        whiteSpace: "nowrap",
                    }}
                >
                    {props.label}
                </div>
            )}
        </div>
    );
}

/** A hand-drawn ink line that draws itself (0..1). */
export function Ink(props: {
    from: Point;
    to: Point;
    p: number;
    seed: string;
    color?: string;
    width?: number;
    dashed?: boolean;
    bow?: number;
    opacity?: number;
}) {
    const theme = useTheme();
    const d = roughPath(props.from, props.to, props.seed, 3, props.bow ?? 0.04);
    if (props.p <= 0) return null;
    return (
        <path
            d={d}
            fill="none"
            stroke={props.color ?? theme.ink}
            strokeWidth={props.width ?? 5}
            strokeLinecap="round"
            opacity={props.opacity ?? 1}
            pathLength={1}
            strokeDasharray={props.dashed ? "0.02 0.018" : 1}
            strokeDashoffset={props.dashed ? 0 : 1 - props.p}
            style={props.dashed ? { clipPath: `inset(0 ${100 - props.p * 100}% 0 0)` } : undefined}
        />
    );
}

/**
 * A cut-paper padlock. `shut` 0..1 drops the shackle; shut locks turn ink-dark with an orange keyhole.
 * `flash` 0..1 is the little orange burst as it clicks; `fail` turns it coral.
 */
export function Lock(props: {
    size: number;
    shut: number;
    flash?: number;
    fail?: boolean;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const s = props.shut;
    const lift = (1 - s) * 22;
    const swing = (1 - s) * 18;
    const closed = s > 0.95;
    const body = props.fail ? CORAL : closed ? theme.ink : theme.paper;
    const hole = props.fail ? theme.paper : closed ? theme.accent : theme.inkSoft;
    const f = props.flash ?? 0;
    return (
        <svg
            width={props.size}
            height={props.size * 1.15}
            viewBox="-10 -30 100 115"
            style={{ overflow: "visible", ...props.style }}
        >
            {f > 0 && f < 1 && (
                <g opacity={1 - f}>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                        const r = (a * Math.PI) / 180;
                        const r1 = 46 + f * 20;
                        const r2 = 58 + f * 34;
                        return (
                            <path
                                key={a}
                                d={`M ${40 + Math.cos(r) * r1} ${42 + Math.sin(r) * r1} L ${40 + Math.cos(r) * r2} ${42 + Math.sin(r) * r2}`}
                                stroke={theme.accent}
                                strokeWidth={6}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>
            )}
            <g transform={`translate(0 ${-lift}) rotate(${-swing} 62 30)`}>
                <path
                    d="M18 34 V18 C18 4 28 -4 40 -4 C52 -4 62 4 62 18 V34"
                    fill="none"
                    stroke={props.fail ? CORAL : theme.ink}
                    strokeWidth={9}
                    strokeLinecap="round"
                />
            </g>
            <rect
                x="4"
                y="28"
                width="72"
                height="56"
                rx="9"
                fill={body}
                stroke={theme.ink}
                strokeWidth={4}
                style={{ filter: `drop-shadow(3px 4px 0 ${theme.shadow})` }}
            />
            <circle cx="40" cy="50" r="7" fill={hole} />
            <rect x="37" y="52" width="6" height="16" rx="2" fill={hole} />
        </svg>
    );
}

/** A dark paper terminal; each line types in as its own 0..1 progress. */
export function Terminal(props: {
    w: number;
    h: number;
    lines: { text: string; p: number; color?: string; size?: number; weight?: number }[];
    style?: CSSProperties;
}) {
    return (
        <div style={{ width: props.w, height: props.h, ...props.style }}>
            <Paper
                seed="terminal"
                color="#23221f"
                style={{ width: "100%", height: "100%" }}
                innerStyle={{ padding: "26px 34px", boxSizing: "border-box" }}
                sway={0.4}
            >
                <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
                    {["#e8604c", "#e3b341", "#6c9a5e"].map((c) => (
                        <div
                            key={c}
                            style={{ width: 18, height: 18, borderRadius: 9, background: c }}
                        />
                    ))}
                </div>
                {props.lines.map((l, i) => {
                    const n = Math.round(l.p * l.text.length);
                    if (l.p <= 0) return null;
                    return (
                        <div
                            key={i}
                            style={{
                                fontFamily: MONO,
                                fontSize: l.size ?? 32,
                                fontWeight: l.weight ?? 400,
                                color: l.color ?? "#e7e7e2",
                                whiteSpace: "pre",
                                lineHeight: 1.35,
                            }}
                        >
                            {l.text.slice(0, n)}
                            {l.p < 1 && <span style={{ opacity: 0.8 }}>▍</span>}
                        </div>
                    );
                })}
            </Paper>
        </div>
    );
}

export type SegState = "idle" | "run" | "ok" | "fail";

/** The deploy bar: labelled segments, each filling and ticking in turn. */
export function DeployBar(props: {
    w: number;
    segments: { label: string; fill: number; state: SegState }[];
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const gap = 14;
    const segW = (props.w - gap * (props.segments.length - 1)) / props.segments.length;
    return (
        <div style={{ display: "flex", gap, width: props.w, ...props.style }}>
            {props.segments.map((s, i) => {
                const col = s.state === "fail" ? CORAL : s.state === "ok" ? GOOD : theme.accent;
                const mark = s.state === "ok" ? " ✓" : s.state === "fail" ? " ✗" : "";
                return (
                    <div key={i} style={{ width: segW }}>
                        <div
                            style={{
                                height: 26,
                                borderRadius: 6,
                                background: theme.paperAlt,
                                overflow: "hidden",
                                border: `3px solid ${theme.ink}`,
                            }}
                        >
                            <div
                                style={{
                                    width: `${s.fill * 100}%`,
                                    height: "100%",
                                    background: col,
                                }}
                            />
                        </div>
                        <div
                            style={{
                                ...type.label,
                                fontSize: 30,
                                marginTop: 8,
                                color: s.state === "idle" ? theme.inkSoft : theme.onBg,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {s.label}
                            <span style={{ color: col, fontStyle: "normal", fontWeight: 600 }}>
                                {mark}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** A small paper inspector: round head, body, a magnifying glass. `walk` bobs the steps. */
export function Inspector(props: { size: number; walk: number; style?: CSSProperties }) {
    const theme = useTheme();
    const bob = Math.abs(Math.sin(props.walk * Math.PI * 2)) * 6;
    const leg = Math.sin(props.walk * Math.PI * 2) * 12;
    return (
        <svg
            width={props.size}
            height={props.size * 1.4}
            viewBox="0 0 100 140"
            style={{ overflow: "visible", ...props.style }}
        >
            <g transform={`translate(0 ${-bob})`}>
                <path
                    d={`M42 100 L${38 + leg} 136 M58 100 L${62 - leg} 136`}
                    stroke={theme.ink}
                    strokeWidth={7}
                    strokeLinecap="round"
                />
                <path
                    d="M28 104 C28 62 72 62 72 104 Z"
                    fill={theme.accent}
                    stroke={theme.ink}
                    strokeWidth={4}
                />
                <circle
                    cx="50"
                    cy="44"
                    r="18"
                    fill={theme.paper}
                    stroke={theme.ink}
                    strokeWidth={4}
                />
                <path d="M70 80 L86 64" stroke={theme.ink} strokeWidth={6} strokeLinecap="round" />
                <circle
                    cx="92"
                    cy="56"
                    r="12"
                    fill="#ffffff88"
                    stroke={theme.ink}
                    strokeWidth={5}
                />
            </g>
        </svg>
    );
}

/** A pointing cursor hand. */
export function Hand({ size = 70, style }: { size?: number; style?: CSSProperties }) {
    const theme = useTheme();
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 60 60"
            style={{ overflow: "visible", ...style }}
        >
            <path
                d="M20 4 C24 4 26 7 26 10 V28 L44 31 C50 32 52 36 51 41 L48 54 C47 57 45 58 42 58 H24 C21 58 19 57 18 55 L8 38 C6 34 9 30 13 32 L16 35 V10 C16 7 17 4 20 4 Z"
                fill={theme.paper}
                stroke={theme.ink}
                strokeWidth={3.5}
                strokeLinejoin="round"
            />
        </svg>
    );
}
