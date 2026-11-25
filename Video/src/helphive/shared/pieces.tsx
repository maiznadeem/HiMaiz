import React, { type CSSProperties } from "react";
import { Paper, useTheme, useType } from "../../kit";

/** HelpHive's honey yellow, the second accent. */
export const HONEY = "#f2b632";
export const CORAL = "#e8604c";
export const GOOD = "#4f7d45";
export const MONO = "'IBM Plex Mono', monospace";

/** The Marigold Inn: a paper hotel front. */
export function Hotel(props: { w: number; h: number; style?: CSSProperties; doorOpen?: number }) {
    const theme = useTheme();
    const type = useType();
    const { w, h } = props;
    return (
        <div style={{ width: w, height: h, position: "relative", ...props.style }}>
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
                <g style={{ filter: `drop-shadow(6px 9px 0 ${theme.shadow})` }}>
                    <path d={`M ${-10} 90 L ${w / 2} 10 L ${w + 10} 90 Z`} fill={CORAL} />
                    <rect x="0" y="88" width={w} height={h - 88} fill={theme.paper} />
                </g>
                {[0, 1, 2].map((r) =>
                    [0, 1].map((cl) => (
                        <rect
                            key={`${r}${cl}`}
                            x={34 + cl * (w / 2 - 10)}
                            y={200 + r * 90}
                            width={w / 2 - 58}
                            height={56}
                            rx={6}
                            fill="#cfd8dc"
                            stroke={theme.ink}
                            strokeWidth={3}
                        />
                    )),
                )}
                <rect
                    x={w / 2 - 44}
                    y={h - 130}
                    width={88}
                    height={130}
                    rx={8}
                    fill={HONEY}
                    stroke={theme.ink}
                    strokeWidth={4}
                />
                <circle cx={w / 2 + 26} cy={h - 64} r={6} fill={theme.ink} />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: 110,
                    textAlign: "center",
                    ...type.display,
                    fontSize: 32,
                    lineHeight: 1.05,
                }}
            >
                The Marigold Inn
            </div>
        </div>
    );
}

/** A booking card. */
export function Booking(props: {
    id: string;
    service: string;
    when: string;
    w?: number;
    color?: string;
    clock?: string;
    style?: CSSProperties;
    curl?: number;
}) {
    const theme = useTheme();
    const type = useType();
    return (
        <div style={{ width: props.w ?? 560, ...props.style }}>
            <Paper
                seed={`booking-${props.id}`}
                color={props.color ?? theme.paper}
                style={{ width: "100%", height: 170 }}
                innerStyle={{ padding: "16px 24px", boxSizing: "border-box", position: "relative" }}
                roughness={0.5 + (props.curl ?? 0) * 2.5}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: MONO, fontSize: 28, color: theme.inkSoft }}>
                        {props.id}
                    </div>
                    {props.clock && (
                        <div
                            style={{
                                fontFamily: MONO,
                                fontSize: 30,
                                background: theme.ink,
                                color: theme.paper,
                                borderRadius: 8,
                                padding: "0 12px",
                            }}
                        >
                            {props.clock}
                        </div>
                    )}
                </div>
                <div style={{ ...type.display, fontSize: 40, marginTop: 6 }}>{props.service}</div>
                <div style={{ ...type.body, fontSize: 32, marginTop: 6, color: theme.inkSoft }}>
                    {props.when}
                </div>
            </Paper>
        </div>
    );
}

/** A glass jar holding the paid amount. `level` 0..1 of coins; `tip` tilts it. */
export function Jar(props: {
    level: number;
    label: string;
    tip?: number;
    cobweb?: number;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const n = Math.round(props.level * 5);
    return (
        <div style={{ width: 150, ...props.style }}>
            <svg
                width={150}
                height={170}
                viewBox="0 0 150 170"
                style={{
                    overflow: "visible",
                    transform: `rotate(${-(props.tip ?? 0) * 70}deg)`,
                    transformOrigin: "20% 100%",
                }}
            >
                <rect x="40" y="6" width="70" height="20" rx="5" fill={theme.inkSoft} />
                <path
                    d="M30 30 H120 C134 30 140 40 140 54 V150 C140 162 132 168 120 168 H30 C18 168 10 162 10 150 V54 C10 40 16 30 30 30 Z"
                    fill="rgba(220, 235, 240, 0.55)"
                    stroke={theme.ink}
                    strokeWidth={4}
                />
                {Array.from({ length: n }, (_, i) => (
                    <ellipse
                        key={i}
                        cx={75 + (i % 2 ? 6 : -6)}
                        cy={150 - i * 16}
                        rx={42}
                        ry={10}
                        fill={HONEY}
                        stroke={theme.ink}
                        strokeWidth={3}
                    />
                ))}
                {(props.cobweb ?? 0) > 0 && (
                    <g opacity={props.cobweb} stroke={theme.inkSoft} strokeWidth={2} fill="none">
                        <path d="M110 30 L140 60 M110 30 L128 70 M110 30 L140 44" />
                        <path d="M122 42 Q130 46 134 52 M118 52 Q126 56 132 62" />
                    </g>
                )}
            </svg>
            <div
                style={{
                    ...type.label,
                    fontSize: 30,
                    textAlign: "center",
                    marginTop: 4,
                    whiteSpace: "nowrap",
                }}
            >
                {props.label}
            </div>
        </div>
    );
}

/** A coin. */
export function Coin({ size = 40, style }: { size?: number; style?: CSSProperties }) {
    const theme = useTheme();
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
            <circle cx="20" cy="20" r="17" fill={HONEY} stroke={theme.ink} strokeWidth={3} />
            <circle
                cx="20"
                cy="20"
                r="10"
                fill="none"
                stroke={theme.ink}
                strokeWidth={2}
                opacity={0.5}
            />
        </svg>
    );
}

/** A kitchen-timer shape. `turn` 0..1 sweeps the dial; `ring` shakes it. */
export function Timer(props: {
    size: number;
    turn: number;
    ring?: number;
    color?: string;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const shake = props.ring ? Math.sin(props.ring * 60) * 10 * (props.ring < 1 ? 1 : 0) : 0;
    const a = props.turn * Math.PI * 2 - Math.PI / 2;
    return (
        <svg
            width={props.size}
            height={props.size}
            viewBox="0 0 100 100"
            style={{ overflow: "visible", transform: `rotate(${shake}deg)`, ...props.style }}
        >
            <rect x="42" y="0" width="16" height="12" rx="3" fill={theme.ink} />
            <circle
                cx="50"
                cy="56"
                r="42"
                fill={props.color ?? theme.paper}
                stroke={theme.ink}
                strokeWidth={5}
                style={{ filter: `drop-shadow(4px 6px 0 ${theme.shadow})` }}
            />
            <path
                d={`M 50 56 L 50 18 A 38 38 0 ${props.turn > 0.5 ? 1 : 0} 1 ${50 + Math.cos(a) * 38} ${56 + Math.sin(a) * 38} Z`}
                fill={theme.accent}
                opacity={props.turn > 0 ? 0.85 : 0}
            />
            <circle cx="50" cy="56" r="6" fill={theme.ink} />
            {props.ring && props.ring > 0 && props.ring < 1 && (
                <g stroke={theme.accent} strokeWidth={5} strokeLinecap="round">
                    <path d="M -4 30 L -16 22 M -6 56 L -20 56 M 104 30 L 116 22 M 106 56 L 120 56" />
                </g>
            )}
        </svg>
    );
}

/** A small walking person, as a paper silhouette. */
export function Walker(props: {
    size: number;
    walk: number;
    color?: string;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const leg = Math.sin(props.walk * Math.PI * 2) * 12;
    const bob = Math.abs(Math.sin(props.walk * Math.PI * 2)) * 5;
    return (
        <svg
            width={props.size}
            height={props.size * 1.6}
            viewBox="0 0 60 96"
            style={{ overflow: "visible", ...props.style }}
        >
            <g transform={`translate(0 ${-bob})`}>
                <path
                    d={`M26 66 L${22 + leg} 94 M34 66 L${38 - leg} 94`}
                    stroke={theme.ink}
                    strokeWidth={7}
                    strokeLinecap="round"
                />
                <path d="M14 70 C14 36 46 36 46 70 Z" fill={props.color ?? theme.inkSoft} />
                <circle cx="30" cy="22" r="13" fill={props.color ?? theme.inkSoft} />
            </g>
        </svg>
    );
}

/** A paper cloud. */
export function Cloud({ w, style }: { w: number; style?: CSSProperties }) {
    const theme = useTheme();
    return (
        <svg
            width={w}
            height={w * 0.45}
            viewBox="0 0 200 90"
            style={{ overflow: "visible", ...style }}
        >
            <path
                d="M30 80 C8 80 4 56 24 50 C20 26 50 16 66 30 C74 6 116 4 124 30 C140 16 170 24 166 48 C190 50 194 80 170 80 Z"
                fill="#ffffff"
                stroke={theme.ink}
                strokeWidth={4}
                style={{ filter: `drop-shadow(5px 7px 0 ${theme.shadow})` }}
            />
        </svg>
    );
}

export function Label(props: { children: React.ReactNode; color?: string; style?: CSSProperties }) {
    const type = useType();
    const theme = useTheme();
    return (
        <div
            style={{
                ...type.label,
                fontSize: 30,
                color: props.color ?? theme.ink,
                whiteSpace: "nowrap",
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}
