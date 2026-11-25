import React, { type CSSProperties } from "react";
import { Paper } from "../paper";
import { useType } from "../stage";
import {
    useBoilSeed,
    useFrame,
    useProgress,
    useSpringIn,
    useStartFrame,
    useTheme,
    type Cue,
    type Span,
} from "../timing";
import { roughPath } from "./rough";

/** A small paper label, like a kicker or a sticker. */
export function Tag(props: {
    text: string;
    at?: Cue;
    color?: string;
    ink?: string;
    size?: number;
    seed?: string;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const s = useSpringIn(props.at);
    const size = props.size ?? 30;
    return (
        <div
            style={{
                display: "inline-block",
                opacity: Math.min(1, s * 2),
                transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -6 - 1.5}deg)`,
                transformOrigin: "0% 50%",
                ...props.style,
            }}
        >
            <Paper
                seed={props.seed ?? `tag-${props.text}`}
                color={props.color ?? theme.accent}
                innerStyle={{
                    padding: `${size * 0.35}px ${size * 0.7}px`,
                    color: props.ink ?? theme.onAccent,
                    fontSize: size,
                    ...type.label,
                }}
                roughness={1}
            >
                {props.text}
            </Paper>
        </div>
    );
}

/** The opening card of a scene: a kicker tag, a big title, and a hand-drawn underline. */
export function TitleCard(props: { title: string; kicker?: string; at?: Cue; width?: number }) {
    const theme = useTheme();
    const type = useType();
    const start = useStartFrame(props.at);
    const frame = useFrame();
    const words = props.title.split(" ");
    const lineStart = start + words.length * 2.2 + 10;
    const underline = Math.max(0, Math.min(1, (frame - lineStart) / 18));
    const eased = 1 - Math.pow(1 - underline, 3);
    const width = props.width ?? 1300;
    const path = roughPath([0, 12], [width * 0.55, 6], useBoilSeed("title-underline"), 5, 0.08);
    return (
        <div style={{ position: "absolute", left: 40, top: 170, width }}>
            {props.kicker && <Tag text={props.kicker} at={props.at} seed="title-kicker" />}
            <div
                style={{
                    ...type.display,
                    fontSize: 112,
                    color: theme.onBg,
                    marginTop: 34,
                    display: "flex",
                    flexWrap: "wrap",
                    columnGap: "0.25em",
                }}
            >
                {words.map((w, i) => {
                    const local = frame - start - i * 2.2 - 4;
                    const p = Math.max(0, Math.min(1, local / 10));
                    return (
                        <span
                            key={i}
                            style={{
                                display: "inline-block",
                                opacity: p,
                                transform: `translateY(${(1 - p) * 30}px) rotate(${(1 - p) * 3}deg)`,
                            }}
                        >
                            {w}
                        </span>
                    );
                })}
            </div>
            <svg width={width} height={30} style={{ marginTop: 18, overflow: "visible" }}>
                <path
                    d={path}
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth={9}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - eased}
                />
            </svg>
        </div>
    );
}

/** Text that writes itself in, letter by letter, over a span (by default most of a line). */
export function WriteOn(props: {
    text: string;
    at?: Cue;
    over?: Span;
    size?: number;
    color?: string;
    italic?: boolean;
    weight?: number;
    width?: number;
    style?: CSSProperties;
}) {
    const theme = useTheme();
    const type = useType();
    const p = useProgress(props.at, props.over, Math.min(2.2, 0.045 * props.text.length + 0.4));
    const shown = p * props.text.length;
    const chars = Array.from(props.text);
    return (
        <div
            style={{
                ...type.display,
                fontSize: props.size ?? 64,
                fontWeight: props.weight ?? 600,
                fontStyle: props.italic ? "italic" : "normal",
                color: props.color ?? theme.onBg,
                width: props.width,
                ...props.style,
            }}
        >
            {chars.map((c, i) => {
                const o = Math.max(0, Math.min(1, shown - i));
                return (
                    <span key={i} style={{ opacity: o }}>
                        {c}
                    </span>
                );
            })}
        </div>
    );
}
