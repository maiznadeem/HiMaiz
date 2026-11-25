import React, { type CSSProperties } from "react";
import { Paper, SAFE } from "../../kit";

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

export function Check(props: { size?: number; color?: string; width?: number }) {
    const s = props.size ?? 30;
    return (
        <svg width={s} height={s} viewBox="0 0 30 30" style={{ display: "block" }}>
            <path
                d="M5 16 L12 23 L25 7"
                fill="none"
                stroke={props.color ?? "#191919"}
                strokeWidth={props.width ?? 4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Cross(props: { size?: number; color?: string }) {
    const s = props.size ?? 30;
    return (
        <svg width={s} height={s} viewBox="0 0 30 30" style={{ display: "block" }}>
            <path
                d="M7 7 L23 23 M23 7 L7 23"
                fill="none"
                stroke={props.color ?? "#191919"}
                strokeWidth={4.5}
                strokeLinecap="round"
            />
        </svg>
    );
}

export function Clip(props: { size?: number; color?: string }) {
    const s = props.size ?? 30;
    return (
        <svg width={s * 0.6} height={s} viewBox="0 0 18 30" style={{ display: "block" }}>
            <path
                d="M12 8 V22 C12 26 6 26 6 22 V6 C6 2 15 2 15 6 V21"
                fill="none"
                stroke={props.color ?? "#191919"}
                strokeWidth={2.6}
                strokeLinecap="round"
            />
        </svg>
    );
}

/** The Argus mark: an ink "A" under an arc of five small stars. `draw` runs 0..1. */
export function ArgusMark(props: { size?: number; draw: number; color: string; star: string }) {
    const s = props.size ?? 76;
    const d = props.draw;
    const star = (cx: number, cy: number, r: number) => {
        const pts: string[] = [];
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + (i * Math.PI) / 5;
            const rr = i % 2 === 0 ? r : r * 0.45;
            pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
        }
        return pts.join(" ");
    };
    const stars = [
        [14, 26],
        [24, 14],
        [38, 9],
        [52, 14],
        [62, 26],
    ];
    return (
        <svg width={s} height={s} viewBox="0 0 76 76" style={{ display: "block" }}>
            <path
                d="M18 70 L38 26 L58 70 M26 54 H50"
                fill="none"
                stroke={props.color}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - Math.min(1, d * 1.4)}
            />
            {stars.map(([x, y], i) => {
                const o = Math.max(0, Math.min(1, (d - 0.45 - i * 0.1) * 5));
                return (
                    <polygon
                        key={i}
                        points={star(x, y, 5.5)}
                        fill={props.star}
                        opacity={o}
                        transform={`rotate(${(1 - o) * 90} ${x} ${y})`}
                    />
                );
            })}
        </svg>
    );
}
