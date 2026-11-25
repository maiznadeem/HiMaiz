import React, { type CSSProperties } from "react";
import { jitter } from "./random";
import type { Theme } from "./themes";
import { SheetContext, useTheme, useWobble } from "./timing";

/** A rectangle with slightly uneven, scissor-cut edges, as a CSS polygon in percentages. */
export function cutEdge(seed: string, roughness = 0.5): string {
    const pts: string[] = [];
    const n = 9;
    const r = roughness;
    const p = (x: number, y: number) => pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    for (let i = 0; i < n; i++) p((i / n) * 100 + jitter(seed, i) * r, jitter(seed, 100 + i) * r);
    for (let i = 0; i < n; i++)
        p(100 + jitter(seed, 200 + i) * r, (i / n) * 100 + jitter(seed, 300 + i) * r);
    for (let i = 0; i < n; i++)
        p(100 - (i / n) * 100 + jitter(seed, 400 + i) * r, 100 + jitter(seed, 500 + i) * r);
    for (let i = 0; i < n; i++)
        p(jitter(seed, 600 + i) * r, 100 - (i / n) * 100 + jitter(seed, 700 + i) * r);
    return `polygon(${pts.join(", ")})`;
}

export function paperShadow(theme: Theme, lift = 1): string {
    const [x, y] = theme.shadowOffset;
    return `drop-shadow(${x * lift}px ${y * lift}px ${theme.shadowBlur}px ${theme.shadow})`;
}

/** A piece of cut paper: uneven edges, a hard paper shadow, a gentle sway. */
export function Paper(props: {
    seed: string;
    color?: string;
    style?: CSSProperties;
    innerStyle?: CSSProperties;
    lift?: number;
    sway?: number;
    roughness?: number;
    children?: React.ReactNode;
}) {
    const theme = useTheme();
    const rot = useWobble(props.seed, props.sway ?? 1);
    return (
        <div
            style={{
                filter: paperShadow(theme, props.lift ?? 1),
                transform: `rotate(${rot}deg)`,
                ...props.style,
            }}
        >
            <div
                style={{
                    background: props.color ?? theme.paper,
                    clipPath: cutEdge(props.seed, props.roughness ?? 0.5),
                    width: "100%",
                    height: "100%",
                    color: theme.ink,
                    ...props.innerStyle,
                }}
            >
                <SheetContext.Provider value={props.color ?? theme.paper}>
                    {props.children}
                </SheetContext.Provider>
            </div>
        </div>
    );
}

/** The site's orange pebble. */
export function Pebble(props: {
    size: number;
    color?: string;
    seed?: string;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const rot = useWobble(props.seed ?? "pebble", 2);
    return (
        <svg
            width={props.size}
            height={props.size * 0.8}
            viewBox="0 0 100 80"
            style={{ filter: paperShadow(theme), transform: `rotate(${rot}deg)`, ...props.style }}
        >
            <path
                d="M12 44 C8 20 34 4 58 8 C84 12 98 30 92 52 C86 72 58 80 36 74 C20 70 14 60 12 44 Z"
                fill={props.color ?? theme.accent}
            />
        </svg>
    );
}

/** The site's paper leaf. */
export function Leaf(props: {
    size: number;
    color?: string;
    seed?: string;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const rot = useWobble(props.seed ?? "leaf", 3);
    return (
        <svg
            width={props.size}
            height={props.size}
            viewBox="0 0 100 100"
            style={{ filter: paperShadow(theme), transform: `rotate(${rot}deg)`, ...props.style }}
        >
            <path
                d="M10 90 C10 40 40 10 92 8 C90 60 60 90 10 90 Z"
                fill={props.color ?? theme.second}
            />
            <path
                d="M14 86 C34 64 56 42 84 14"
                stroke={theme.vein}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
}

/** The page texture for a theme, as CSS background layers (set in the theme file). */
export function textureLayers(theme: Theme): string[] {
    return theme.pageLayers;
}
