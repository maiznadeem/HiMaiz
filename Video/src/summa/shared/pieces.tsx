import React, { type CSSProperties } from "react";
import { Paper, useTheme, useType } from "../../kit";

/** Summa's own face: coral on cream. */
export const CORAL = "#e8604c";
export const CREAM = "#fbf3e6";
export const GOOD = "#4f7d45";
export const MONO = "'IBM Plex Mono', monospace";

export type Line = { date: string; desc: string; amt: string; bal?: string };

/** The statement used in the video (demo-data.md). */
export const STATEMENT: Line[] = [
    { date: "02 Mar", desc: "Morning Loaf Bakery", amt: "−45.50", bal: "2,094.50" },
    { date: "04 Mar", desc: "Riverside Power", amt: "−62.15", bal: "2,032.35" },
    { date: "06 Mar", desc: "Lantern Café", amt: "−8.90", bal: "2,023.45" },
    { date: "09 Mar", desc: "Transfer from Savings ···· 2290", amt: "+150.00", bal: "2,173.45" },
    { date: "12 Mar", desc: "Corner Grocer", amt: "−46.20", bal: "2,127.25" },
    { date: "18 Mar", desc: "Northline Mobile", amt: "−25.00", bal: "2,102.25" },
    { date: "22 Mar", desc: "Bookshop on Elm", amt: "−18.40", bal: "2,083.85" },
    { date: "27 Mar", desc: "Cloudberry Rail", amt: "−212.50", bal: "1,871.35" },
];
/** Running totals of the misread copy (line 5 read as −4.62). */
export const MISREAD_RUN = [
    "2,140.00",
    "2,094.50",
    "2,032.35",
    "2,023.45",
    "2,173.45",
    "2,168.83",
    "2,143.83",
    "2,125.43",
    "1,912.93",
];
export const RIGHT_RUN = [
    "2,140.00",
    "2,094.50",
    "2,032.35",
    "2,023.45",
    "2,173.45",
    "2,127.25",
    "2,102.25",
    "2,083.85",
    "1,871.35",
];

export const EXPORT_A: Line[] = [
    { date: "12 Mar", desc: "Corner Grocer", amt: "−31.10", bal: "1,580.20" },
    { date: "13 Mar", desc: "Riverside Power", amt: "−56.40", bal: "1,523.80" },
    { date: "14 Mar", desc: "Bus pass top-up", amt: "−20.00", bal: "1,503.80" },
];
export const EXPORT_B: Line[] = [
    ...EXPORT_A,
    { date: "14 Mar", desc: "Lantern Café", amt: "−6.40", bal: "1,497.40" },
    { date: "14 Mar", desc: "Salary, Fenwick Studio", amt: "+1,250.00", bal: "2,747.40" },
    { date: "15 Mar", desc: "Bookshop on Elm", amt: "−12.99", bal: "2,734.41" },
];

/** One statement row: date, description, amount, optional running balance. */
export function Row(props: {
    line: Line;
    size?: number;
    h?: number;
    hl?: string;
    amtColor?: string;
    style?: CSSProperties;
    showBal?: boolean;
    opacity?: number;
    amt?: string;
}) {
    const theme = useTheme();
    const type = useType();
    const size = props.size ?? 28;
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                height: props.h ?? 46,
                padding: "0 14px",
                margin: "0 -14px",
                background: props.hl,
                borderRadius: 6,
                ...type.body,
                fontSize: size,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                opacity: props.opacity ?? 1,
                ...props.style,
            }}
        >
            <div style={{ width: size * 4, color: theme.inkSoft }}>{props.line.date}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>{props.line.desc}</div>
            <div style={{ width: size * 4.6, textAlign: "right", color: props.amtColor }}>
                {props.amt ?? props.line.amt}
            </div>
            {props.showBal && (
                <div style={{ width: size * 5, textAlign: "right", color: theme.inkSoft }}>
                    {props.line.bal}
                </div>
            )}
        </div>
    );
}

/** A coral (or green) rubber stamp. */
export function Stamp(props: {
    text: string;
    color?: string;
    size?: number;
    p: number;
    rot?: number;
    style?: CSSProperties;
}) {
    const type = useType();
    const color = props.color ?? CORAL;
    if (props.p <= 0) return null;
    return (
        <div
            style={{
                display: "inline-block",
                border: `6px solid ${color}`,
                borderRadius: 10,
                padding: "6px 22px",
                color,
                ...type.display,
                fontSize: props.size ?? 48,
                whiteSpace: "nowrap",
                opacity: Math.min(1, props.p * 2) * 0.92,
                transform: `rotate(${props.rot ?? -6}deg) scale(${1.6 - 0.6 * props.p})`,
                background: "rgba(255,255,255,0.35)",
                ...props.style,
            }}
        >
            {props.text}
        </div>
    );
}

/** A paper card with a heading strip. */
export function Card(props: {
    seed: string;
    w: number;
    h: number;
    title?: React.ReactNode;
    color?: string;
    head?: string;
    children?: React.ReactNode;
    style?: CSSProperties;
    pad?: number;
}) {
    const type = useType();
    const theme = useTheme();
    return (
        <div style={{ width: props.w, height: props.h, ...props.style }}>
            <Paper
                seed={props.seed}
                color={props.color}
                style={{ width: "100%", height: "100%" }}
                innerStyle={{ boxSizing: "border-box", overflow: "hidden" }}
                sway={0.5}
            >
                {props.title && (
                    <div
                        style={{
                            background: props.head ?? theme.ink,
                            color: theme.paper,
                            padding: "12px 24px",
                            ...type.display,
                            fontSize: 32,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {props.title}
                    </div>
                )}
                <div style={{ padding: `10px ${props.pad ?? 26}px` }}>{props.children}</div>
            </Paper>
        </div>
    );
}

export function Check({ size = 60, color = GOOD }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill={color} />
            <path
                d="M17 31 L26 40 L44 21"
                fill="none"
                stroke="#fff"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Scissors({ size = 110, style }: { size?: number; style?: CSSProperties }) {
    const theme = useTheme();
    return (
        <svg width={size} height={size * 0.7} viewBox="0 0 100 70" style={style}>
            <circle cx="16" cy="16" r="12" fill="none" stroke={theme.accent} strokeWidth={6} />
            <circle cx="16" cy="54" r="12" fill="none" stroke={theme.accent} strokeWidth={6} />
            <path
                d="M26 22 L96 46 M26 48 L96 24"
                stroke={theme.ink}
                strokeWidth={7}
                strokeLinecap="round"
            />
        </svg>
    );
}
