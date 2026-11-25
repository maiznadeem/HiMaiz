import React, { type CSSProperties } from "react";
import { Paper, SAFE } from "../../kit";

// Watch demo data and shared pieces. Every title here is invented (storyboard/demo-data.md).

/** Watch's own screen: a dark room with warm off-white text and the one orange. */
export const ROOM = {
    bg: "#1d1c1a",
    panel: "#2a2826",
    text: "#f1e9dc",
    soft: "#a69f93",
    sea: "#22344f",
    seaDeep: "#18253a",
} as const;

export const INK = "#191919";

/** Lets a scene place things in whole-frame pixels (1920 x 1080) instead of safe-area pixels. */
export function FullFrame(props: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: "absolute",
                left: -SAFE.left,
                top: -SAFE.top,
                width: 1920,
                height: 1080,
            }}
        >
            {props.children}
        </div>
    );
}

/** A cut-paper rectangle at a frame position. */
export function Sheet(props: {
    seed: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color?: string;
    sway?: number;
    lift?: number;
    roughness?: number;
    style?: CSSProperties;
    innerStyle?: CSSProperties;
    children?: React.ReactNode;
}) {
    return (
        <Paper
            seed={props.seed}
            color={props.color}
            sway={props.sway ?? 0.25}
            lift={props.lift}
            roughness={props.roughness}
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                width: props.w,
                height: props.h,
                ...props.style,
            }}
            innerStyle={props.innerStyle}
        >
            {props.children}
        </Paper>
    );
}

/**
 * The invented "Fogbell Point" picture: a striped lighthouse on dark blue paper, drawn in a
 * w x h box. `beam` 0..1 sweeps the light.
 */
export function Lighthouse(props: { w: number; h: number; beam?: number }) {
    const { w, h } = props;
    const cx = w * 0.62;
    const base = h * 0.82;
    const top = h * 0.3;
    const bw = w * 0.07;
    const tw = w * 0.045;
    const stripes = 5;
    const a = ((props.beam ?? 0.3) * 2 - 1) * 0.7;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
            <rect width={w} height={h} fill={ROOM.sea} />
            <circle cx={w * 0.47} cy={h * 0.17} r={h * 0.06} fill="#f1e9dc" opacity={0.85} />
            <path
                d={`M ${cx} ${top + h * 0.04} L ${cx + Math.cos(a) * w} ${top + Math.sin(a) * w - h * 0.12} L ${cx + Math.cos(a) * w} ${top + Math.sin(a) * w + h * 0.12} Z`}
                fill="#ffd58a"
                opacity={0.22}
            />
            <path
                d={`M 0 ${h * 0.78} C ${w * 0.3} ${h * 0.72}, ${w * 0.5} ${h * 0.8}, ${w} ${h * 0.74} V ${h} H 0 Z`}
                fill={ROOM.seaDeep}
            />
            <path
                d={`M ${w * 0.4} ${h} L ${w * 0.5} ${base - h * 0.04} L ${w * 0.8} ${base - h * 0.06} L ${w * 0.92} ${h} Z`}
                fill="#3b3a36"
            />
            {Array.from({ length: stripes }).map((_, i) => {
                const y0 = top + ((base - top) * i) / stripes;
                const y1 = top + ((base - top) * (i + 1)) / stripes;
                const w0 = tw + ((bw - tw) * i) / stripes;
                const w1 = tw + ((bw - tw) * (i + 1)) / stripes;
                return (
                    <path
                        key={i}
                        d={`M ${cx - w0} ${y0} L ${cx + w0} ${y0} L ${cx + w1} ${y1} L ${cx - w1} ${y1} Z`}
                        fill={i % 2 ? "#f1e9dc" : "#ff4f1a"}
                    />
                );
            })}
            <rect
                x={cx - tw * 1.1}
                y={top - h * 0.08}
                width={tw * 2.2}
                height={h * 0.08}
                fill="#ffd58a"
            />
            <path
                d={`M ${cx - tw * 1.5} ${top - h * 0.08} L ${cx} ${top - h * 0.16} L ${cx + tw * 1.5} ${top - h * 0.08} Z`}
                fill={INK}
            />
        </svg>
    );
}

/** The first scene after the intro: a harbour at dawn with a small boat. */
export function Harbour(props: { w: number; h: number }) {
    const { w, h } = props;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
            <rect width={w} height={h} fill="#e9b48a" />
            <circle cx={w * 0.72} cy={h * 0.46} r={h * 0.12} fill="#ffd58a" />
            <rect y={h * 0.58} width={w} height={h * 0.42} fill="#5b7894" />
            <path
                d={`M 0 ${h * 0.58} L ${w * 0.22} ${h * 0.4} L ${w * 0.36} ${h * 0.58} Z`}
                fill="#6d6457"
            />
            <path
                d={`M ${w * 0.3} ${h * 0.72} L ${w * 0.56} ${h * 0.72} L ${w * 0.52} ${h * 0.8} L ${w * 0.34} ${h * 0.8} Z`}
                fill="#8c4a2f"
            />
            <rect x={w * 0.42} y={h * 0.5} width={w * 0.012} height={h * 0.22} fill={INK} />
            <path
                d={`M ${w * 0.432} ${h * 0.52} L ${w * 0.52} ${h * 0.68} L ${w * 0.432} ${h * 0.68} Z`}
                fill="#f1e9dc"
            />
            <rect x={w * 0.7} y={h * 0.62} width={w * 0.3} height={h * 0.05} fill="#3b3a36" />
        </svg>
    );
}

/** A cut-paper ear (Watch listens; no eyes anywhere). */
export function Ear(props: { size: number; color?: string }) {
    const s = props.size;
    return (
        <svg
            width={s}
            height={s}
            viewBox="0 0 60 60"
            style={{ display: "block", filter: "drop-shadow(4px 5px 0 rgba(25,25,25,0.28))" }}
        >
            <path
                d="M18 40 C 8 26, 14 6, 32 6 C 48 6, 54 20, 48 32 C 44 40, 36 40, 36 48 C 36 56, 26 58, 22 52"
                fill={props.color ?? "#f1c7a8"}
                stroke={INK}
                strokeWidth={3.5}
                strokeLinejoin="round"
            />
            <path
                d="M24 30 C 22 20, 28 14, 34 15 C 41 16, 42 25, 37 29 C 33 32, 30 30, 30 35"
                fill="none"
                stroke={INK}
                strokeWidth={3.5}
                strokeLinecap="round"
            />
        </svg>
    );
}

/** A paper hand pointing down and to the left, its fingertip at (0, 0) of the box's top-left. */
export function Hand(props: { size: number }) {
    const s = props.size;
    return (
        <svg
            width={s}
            height={s}
            viewBox="0 0 100 100"
            style={{ display: "block", filter: "drop-shadow(5px 7px 0 rgba(25,25,25,0.28))" }}
        >
            <path
                d="M6 6 C 2 2, 10 -2, 14 4 L 40 34 L 42 26 C 44 20, 52 20, 54 28 L 56 34 C 58 26, 68 26, 68 36 L 70 40 C 72 34, 82 34, 82 44 L 84 60 C 86 80, 74 96, 56 96 C 42 96, 34 88, 28 78 L 6 6 Z"
                fill="#f1c7a8"
                stroke={INK}
                strokeWidth={3.5}
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Check(props: { size?: number; color?: string; width?: number }) {
    const s = props.size ?? 30;
    return (
        <svg width={s} height={s} viewBox="0 0 30 30" style={{ display: "block" }}>
            <path
                d="M5 16 L12 23 L25 7"
                fill="none"
                stroke={props.color ?? INK}
                strokeWidth={props.width ?? 4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
