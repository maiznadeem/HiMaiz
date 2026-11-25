import React, { type CSSProperties } from "react";
import { Paper } from "../paper";
import { useType } from "../stage";
import { useBoilSeed, useProgress, useSpringIn, useTheme, type Cue, type Span } from "../timing";
import { roughPath, type Point } from "./rough";

/** A number that counts up on a paper card, with a label under it. */
export function CountUp(props: {
    to: number;
    from?: number;
    at?: Cue;
    over?: Span;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    label?: string;
    size?: number;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const s = useSpringIn(props.at);
    const p = useProgress(props.at, props.over, 1.6);
    const from = props.from ?? 0;
    const value = from + (props.to - from) * (1 - Math.pow(1 - p, 2));
    const text = value.toLocaleString("en-US", {
        minimumFractionDigits: props.decimals ?? 0,
        maximumFractionDigits: props.decimals ?? 0,
    });
    const size = props.size ?? 150;
    return (
        <div
            style={{
                display: "inline-block",
                opacity: Math.min(1, s * 2),
                transform: `translateY(${(1 - s) * 30}px)`,
                ...props.style,
            }}
        >
            <Paper
                seed={`count-${props.label ?? props.to}`}
                innerStyle={{ padding: `${size * 0.18}px ${size * 0.35}px ${size * 0.22}px` }}
            >
                <div
                    style={{
                        ...type.display,
                        fontSize: size,
                        color: theme.ink,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                    }}
                >
                    {props.prefix}
                    {text}
                    {props.suffix && <span style={{ color: theme.accent }}>{props.suffix}</span>}
                </div>
                {props.label && (
                    <div
                        style={{
                            ...type.label,
                            fontSize: size * 0.22,
                            color: theme.inkSoft,
                            marginTop: 8,
                        }}
                    >
                        {props.label}
                    </div>
                )}
            </Paper>
        </div>
    );
}

/** A paper strip that grows to a value, with its label and number. */
export function GrowBar(props: {
    value: number;
    max: number;
    label: string;
    at?: Cue;
    over?: Span;
    width?: number;
    color?: string;
    format?: (v: number) => string;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const p = useProgress(props.at, props.over, 1.2);
    const s = useSpringIn(props.at);
    const width = props.width ?? 900;
    const w = Math.max(6, (props.value / props.max) * width * p);
    const shown = props.format
        ? props.format(props.value * p)
        : Math.round(props.value * p).toString();
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: Math.min(1, s * 2),
                ...props.style,
            }}
        >
            <div
                style={{
                    ...type.label,
                    fontSize: 30,
                    width: 260,
                    textAlign: "right",
                    color: theme.onBg,
                }}
            >
                {props.label}
            </div>
            <Paper
                seed={`bar-${props.label}`}
                color={props.color ?? theme.accent}
                style={{ width: w, height: 64 }}
                roughness={0.8}
                sway={0.3}
            />
            <div
                style={{
                    ...type.display,
                    fontSize: 44,
                    color: theme.onBg,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {shown}
            </div>
        </div>
    );
}

/** A hand-drawn line chart that draws itself left to right. Values are scaled to fit the box. */
export function LineGrow(props: {
    points: number[];
    at?: Cue;
    over?: Span;
    width?: number;
    height?: number;
    color?: string;
    labels?: string[];
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const p = useProgress(props.at, props.over, 2);
    const w = props.width ?? 900;
    const h = props.height ?? 360;
    const max = Math.max(...props.points);
    const min = Math.min(0, ...props.points);
    const pts: Point[] = props.points.map((v, i) => [
        (i / Math.max(1, props.points.length - 1)) * w,
        h - ((v - min) / (max - min || 1)) * h,
    ]);
    const seed = useBoilSeed("line-grow");
    const d = pts
        .slice(1)
        .map((pt, i) => roughPath(pts[i], pt, `${seed}-${i}`, 2, 0.02))
        .map((seg, i) => (i === 0 ? seg : seg.replace(/^M [^ ]+ [^ ]+/, "")))
        .join(" ");
    const axis = roughPath([0, h + 10], [w, h + 10], `${seed}-axis`, 1.5, 0.005);
    return (
        <div style={{ position: "relative", width: w, height: h + 60, ...props.style }}>
            <svg width={w} height={h + 20} style={{ overflow: "visible" }}>
                <path
                    d={axis}
                    stroke={theme.onBgSoft}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                />
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
                {pts.map(([x, y], i) => {
                    const visible = p >= i / Math.max(1, pts.length - 1) - 0.001;
                    return visible ? (
                        <circle key={i} cx={x} cy={y} r={11} fill={theme.onBg} />
                    ) : null;
                })}
            </svg>
            {props.labels && (
                <div style={{ position: "absolute", top: h + 26, left: 0, width: w, height: 30 }}>
                    {props.labels.map((l, i) => (
                        <div
                            key={i}
                            style={{
                                ...type.label,
                                position: "absolute",
                                left: pts[i]?.[0] ?? 0,
                                transform: "translateX(-50%)",
                                fontSize: 24,
                                color: theme.onBgSoft,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {l}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
