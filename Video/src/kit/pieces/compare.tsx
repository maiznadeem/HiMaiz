import React from "react";
import { Paper } from "../paper";
import { useType } from "../stage";
import {
    cueFrame,
    useBoilSeed,
    useFrame,
    useProgress,
    useSpringIn,
    useTheme,
    useTimeline,
    type Cue,
} from "../timing";
import { roughPath } from "./rough";
import { Tag } from "./text";

/**
 * A before and after split. The "before" side is there from the start of the shot; the "after" side
 * is laid down at its own cue, as a fresh sheet of paper.
 */
export function BeforeAfter(props: {
    before: React.ReactNode;
    after: React.ReactNode;
    at?: Cue;
    afterAt: Cue;
    labels?: [string, string];
    width?: number;
    height?: number;
}) {
    const theme = useTheme();
    const a = useSpringIn(props.at);
    const b = useSpringIn(props.afterAt);
    const w = props.width ?? 1600;
    const h = props.height ?? 600;
    const half = (w - 60) / 2;
    const [l1, l2] = props.labels ?? ["Before", "After"];
    return (
        <div style={{ position: "relative", width: w, height: h }}>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: half,
                    height: h,
                    opacity: Math.min(1, a * 2),
                    transform: `translateX(${(1 - a) * -40}px)`,
                }}
            >
                <Paper
                    seed="before"
                    color={theme.paperAlt}
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{ padding: 40, boxSizing: "border-box" }}
                >
                    <Tag text={l1} at={props.at} color={theme.ink} seed="before-tag" size={26} />
                    <div style={{ marginTop: 24 }}>{props.before}</div>
                </Paper>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: half + 60,
                    top: 0,
                    width: half,
                    height: h,
                    opacity: Math.min(1, b * 2),
                    transform: `translateY(${(1 - b) * -60}px) rotate(${(1 - b) * 3}deg)`,
                }}
            >
                <Paper
                    seed="after"
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{ padding: 40, boxSizing: "border-box" }}
                    lift={1.4}
                >
                    <Tag text={l2} at={props.afterAt} seed="after-tag" size={26} />
                    <div style={{ marginTop: 24 }}>{props.after}</div>
                </Paper>
            </div>
        </div>
    );
}

/** A timeline: a line that draws across, with a marker and label popping in at each item's cue. */
export function Timeline(props: {
    items: { label: string; note?: string; at: Cue }[];
    at?: Cue;
    width?: number;
}) {
    const theme = useTheme();
    const type = useType();
    const timeline = useTimeline();
    const frame = useFrame();
    const w = props.width ?? 1500;
    const draw = useProgress(props.at, 0.8);
    const lastItem = props.items[props.items.length - 1];
    const lastFrame = lastItem ? cueFrame(timeline, lastItem.at) : frame;
    const seed = useBoilSeed("timeline");
    const d = roughPath([0, 60], [w, 60], seed, 2.5, 0.01);
    const n = props.items.length;
    return (
        <div style={{ position: "relative", width: w, height: 260 }}>
            <svg width={w} height={120} style={{ overflow: "visible" }}>
                <path
                    d={d}
                    stroke={theme.onBg}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - draw}
                />
            </svg>
            {props.items.map((item, i) => {
                const x = n === 1 ? w / 2 : (i / (n - 1)) * (w - 160) + 80;
                return (
                    <Marker
                        key={i}
                        x={x}
                        label={item.label}
                        note={item.note}
                        at={item.at}
                        active={
                            frame >= cueFrame(timeline, item.at) &&
                            (i === n - 1 || frame < lastFrame)
                        }
                        typeLabel={type.label}
                        typeDisplay={type.display}
                    />
                );
            })}
        </div>
    );
}

function Marker(props: {
    x: number;
    label: string;
    note?: string;
    at: Cue;
    active: boolean;
    typeLabel: React.CSSProperties;
    typeDisplay: React.CSSProperties;
}) {
    const theme = useTheme();
    const s = useSpringIn(props.at);
    return (
        <div
            style={{
                position: "absolute",
                left: props.x,
                top: 34,
                transform: `translateX(-50%) scale(${s})`,
                transformOrigin: "50% 26px",
                textAlign: "center",
                width: 300,
                marginLeft: 0,
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    margin: "0 auto",
                    borderRadius: "50%",
                    background: props.active ? theme.accent : theme.paper,
                    border: `5px solid ${theme.ink}`,
                    boxSizing: "border-box",
                }}
            />
            <div style={{ ...props.typeDisplay, fontSize: 42, color: theme.onBg, marginTop: 18 }}>
                {props.label}
            </div>
            {props.note && (
                <div
                    style={{
                        ...props.typeLabel,
                        fontSize: 24,
                        color: theme.onBgSoft,
                        marginTop: 6,
                    }}
                >
                    {props.note}
                </div>
            )}
        </div>
    );
}
