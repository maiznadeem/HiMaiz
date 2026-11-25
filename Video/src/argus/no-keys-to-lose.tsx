import React from "react";
import { Leaf, Paper, Pebble, roughPath, Stage, useTheme, type Cue, type Point } from "../kit";
import { ARGUS } from "./shared/data";
import { ArgusMark, FullFrame, Sheet } from "./shared/pieces";

// Still: argus / no-keys-to-lose. Top: Argus trades a short-lived sign-in token for short-lived
// access at each cloud, and keeps no stored keys. Bottom: a root helper on the server answers only a
// fixed list of questions over a local socket. Data from demo-data.md "Token exchange".

export const theme = "qoria";
export const poster: Cue = { line: 0, at: "end" };

export default function NoKeysStill() {
    return (
        <Stage ornaments={false}>
            <FullFrame>
                <Picture />
            </FullFrame>
        </Stage>
    );
}

const INK = "#191919";
const mono = (size: number): React.CSSProperties => ({
    fontFamily: "IBM Plex Mono",
    fontWeight: 500,
    fontSize: size,
    color: INK,
    whiteSpace: "nowrap",
});
const italic = (size: number, color = "#55544f"): React.CSSProperties => ({
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontSize: size,
    color,
    whiteSpace: "nowrap",
});

function InkArrow(props: {
    from: Point;
    to: Point;
    seed: string;
    color?: string;
    width?: number;
    dashed?: boolean;
}) {
    const color = props.color ?? INK;
    const w = props.width ?? 5;
    const ang = Math.atan2(props.to[1] - props.from[1], props.to[0] - props.from[0]);
    const head = (side: number) => {
        const a = ang + Math.PI + side * 0.5;
        return `M ${props.to[0]} ${props.to[1]} L ${props.to[0] + Math.cos(a) * 24} ${props.to[1] + Math.sin(a) * 24}`;
    };
    return (
        <g>
            <path
                d={roughPath(props.from, props.to, props.seed, 2, 0.03)}
                stroke={color}
                strokeWidth={w}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={props.dashed ? "14 12" : undefined}
            />
            <path
                d={`${head(1)} ${head(-1)}`}
                stroke={color}
                strokeWidth={w}
                strokeLinecap="round"
                fill="none"
            />
        </g>
    );
}

function Clock(props: { x: number; y: number; r?: number }) {
    const theme = useTheme();
    const r = props.r ?? 26;
    return (
        <svg
            width={r * 2 + 8}
            height={r * 2 + 8}
            style={{ position: "absolute", left: props.x - r - 4, top: props.y - r - 4 }}
        >
            <circle cx={r + 4} cy={r + 4} r={r} fill="#f7f6f1" stroke={INK} strokeWidth={4} />
            <path
                d={`M ${r + 4} ${r + 4} V ${12} M ${r + 4} ${r + 4} L ${r + 16} ${r + 10}`}
                stroke={INK}
                strokeWidth={4}
                strokeLinecap="round"
            />
            <circle cx={r + 4} cy={r + 4} r={4} fill={theme.accent} />
        </svg>
    );
}

function Ticket(props: {
    x: number;
    y: number;
    text: string;
    seed: string;
    color?: string;
    clock?: boolean;
}) {
    return (
        <div
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                transform: "rotate(-1.5deg)",
            }}
        >
            <Paper
                seed={props.seed}
                color={props.color ?? "#ffd9c7"}
                roughness={0.9}
                lift={1.1}
                innerStyle={{
                    padding: props.clock ? "10px 20px 10px 66px" : "10px 20px",
                    ...mono(28),
                }}
            >
                {props.text}
            </Paper>
            {props.clock && <Clock x={34} y={29} r={22} />}
        </div>
    );
}

function ServerIcon({ size = 96 }: { size?: number }) {
    const theme = useTheme();
    const s = {
        fill: "none",
        stroke: INK,
        strokeWidth: 5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    } as const;
    return (
        <svg width={size} height={size * 0.75} viewBox="0 0 96 72">
            {[4, 26, 48].map((y) => (
                <g key={y}>
                    <rect x="14" y={y} width="68" height="18" rx="4" {...s} />
                    <circle cx="28" cy={y + 9} r="3.5" fill={y === 4 ? theme.accent : INK} />
                </g>
            ))}
        </svg>
    );
}

function Door(props: { x: number; y: number; label: string; seed: string }) {
    return (
        <div style={{ position: "absolute", left: props.x, top: props.y, width: 200, height: 196 }}>
            <Sheet
                seed={props.seed}
                x={0}
                y={0}
                w={200}
                h={196}
                color="#c8c5b8"
                innerStyle={{ position: "relative" }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: 22,
                        top: 58,
                        width: 156,
                        height: 138,
                        background: "#8c7a5e",
                        borderRadius: "8px 8px 0 0",
                        boxShadow: "inset 0 0 0 4px #191919",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            right: 18,
                            top: 64,
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            background: "#e8c26a",
                            border: "3px solid #191919",
                        }}
                    />
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 10,
                        textAlign: "center",
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 34,
                        color: INK,
                    }}
                >
                    {props.label}
                </div>
            </Sheet>
        </div>
    );
}

function Picture() {
    const theme = useTheme();
    const questions = ["list secret names", "container status", "disk usage", "timer status"];
    return (
        <>
            {/* ---------------- Top: the clouds ---------------- */}
            <div style={{ position: "absolute", left: 90, top: 52, ...italic(38, INK) }}>
                Reading the clouds
            </div>

            <Sheet
                seed="signin"
                x={90}
                y={170}
                w={300}
                h={220}
                innerStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                }}
            >
                <ServerIcon />
                <div
                    style={{
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 32,
                        color: INK,
                        textAlign: "center",
                        lineHeight: 1.1,
                    }}
                >
                    My sign-in
                    <br />
                    server
                </div>
            </Sheet>

            <Sheet
                seed="argus-box"
                x={780}
                y={170}
                w={300}
                h={220}
                color={ARGUS.panel}
                lift={1.2}
                innerStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                }}
            >
                <ArgusMark size={90} draw={1} color={ARGUS.onPanel} star={theme.accent} />
                <div
                    style={{
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 44,
                        color: ARGUS.onPanel,
                    }}
                >
                    Argus
                </div>
            </Sheet>

            <Door x={1580} y={64} label="Cloud A" seed="door-a" />
            <Door x={1580} y={300} label="Cloud B" seed="door-b" />

            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <InkArrow from={[404, 300]} to={[766, 300]} seed="a1" />
                <InkArrow from={[1094, 232]} to={[1566, 172]} seed="a2" />
                <InkArrow from={[1094, 330]} to={[1566, 398]} seed="a3" />
                {/* the empty key hook */}
                <rect
                    x={895}
                    y={420}
                    width={70}
                    height={14}
                    rx={4}
                    fill="#8c7a5e"
                    stroke={INK}
                    strokeWidth={3}
                />
                <path
                    d="M930 434 V 458 C 930 478, 952 478, 952 462"
                    fill="none"
                    stroke={INK}
                    strokeWidth={5}
                    strokeLinecap="round"
                />
                {/* divider */}
                <path
                    d={roughPath([80, 560], [1840, 560], "divider", 2, 0.003)}
                    stroke="#8a8880"
                    strokeWidth={4}
                    strokeDasharray="18 14"
                    fill="none"
                />
            </svg>

            <Ticket x={428} y={222} text="token · short-lived" seed="t-token" color="#fffdf6" />
            <div style={{ position: "absolute", left: 1170, top: 160, ...italic(30) }}>
                shows token
            </div>
            <div style={{ position: "absolute", left: 1290, top: 318, ...italic(30) }}>
                shows token
            </div>
            <Ticket x={1110} y={70} text="access · short-lived" seed="t-acc-a" clock />
            <Ticket x={1110} y={440} text="access · short-lived" seed="t-acc-b" clock />
            <div
                style={{
                    position: "absolute",
                    left: 930,
                    top: 486,
                    transform: "translateX(-50%)",
                    ...italic(34, INK),
                }}
            >
                no stored keys
            </div>

            {/* ---------------- Bottom: the server ---------------- */}
            <div style={{ position: "absolute", left: 90, top: 590, ...italic(38, INK) }}>
                Reading the server
            </div>

            <Sheet
                seed="helper"
                x={90}
                y={660}
                w={470}
                h={340}
                innerStyle={{ position: "relative" }}
            >
                <div style={{ position: "absolute", left: 36, top: 40 }}>
                    <ServerIcon size={110} />
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 36,
                        top: 140,
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 44,
                        color: INK,
                    }}
                >
                    Root helper
                </div>
                <div style={{ position: "absolute", left: 36, top: 196, ...italic(32) }}>
                    (on the server)
                </div>
                <div
                    style={{
                        position: "absolute",
                        right: 34,
                        top: 270,
                        ...italic(30, theme.accent),
                    }}
                >
                    local socket →
                </div>
            </Sheet>
            {/* the slot */}
            <div
                style={{
                    position: "absolute",
                    left: 546,
                    top: 770,
                    width: 26,
                    height: 96,
                    background: INK,
                    borderRadius: 6,
                }}
            />

            <div style={{ position: "absolute", left: 610, top: 600, transform: "rotate(1.5deg)" }}>
                <Paper
                    seed="questions"
                    color="#fffdf6"
                    lift={1.2}
                    innerStyle={{ padding: "20px 30px 22px" }}
                >
                    <div
                        style={{
                            fontFamily: "Fraunces",
                            fontWeight: 600,
                            fontSize: 34,
                            color: INK,
                            marginBottom: 8,
                        }}
                    >
                        Questions I answer
                    </div>
                    {questions.map((q) => (
                        <div key={q} style={{ ...mono(27), lineHeight: 1.45 }}>
                            · {q}
                        </div>
                    ))}
                </Paper>
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: -12,
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        background: theme.accent,
                        border: "3px solid #191919",
                    }}
                />
            </div>

            {/* what comes out: names only */}
            <div style={{ position: "absolute", left: 1080, top: 640 }}>
                <div style={{ ...italic(30), marginBottom: 10 }}>answer to “list secret names”</div>
            </div>
            <div style={{ position: "absolute", left: 580, top: 832 }}>
                <Paper
                    seed="strip"
                    color="#f7f6f1"
                    roughness={0.7}
                    innerStyle={{ padding: "10px 24px", ...mono(27) }}
                >
                    orion_db_password, orion_session_key, lyra_api_token
                </Paper>
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <InkArrow from={[1260, 690]} to={[1260, 820]} seed="names" width={4} />
                <path
                    d="M 596 900 C 640 1000, 900 1020, 1070 996"
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray="12 10"
                />
                <path
                    d="M 1070 996 L 1048 984 M 1070 996 L 1050 1010"
                    stroke={theme.accent}
                    strokeWidth={5}
                    strokeLinecap="round"
                />
                <path
                    d="M 584 884 L 606 872 M 588 904 L 614 904 M 584 924 L 606 936"
                    stroke={theme.accent}
                    strokeWidth={4}
                    strokeLinecap="round"
                />
            </svg>

            {/* the request that bounces */}
            <div style={{ position: "absolute", left: 1090, top: 966, transform: "rotate(3deg)" }}>
                <Paper
                    seed="request"
                    color="#ffd9c7"
                    roughness={0.8}
                    lift={1.2}
                    innerStyle={{ padding: "12px 24px", ...mono(28) }}
                >
                    read value of orion_db_password
                </Paper>
                <div
                    style={{
                        position: "absolute",
                        left: 190,
                        top: -62,
                        padding: "4px 16px",
                        border: `4px solid ${theme.accent}`,
                        borderRadius: 6,
                        background: "rgba(247,246,241,0.94)",
                        transform: "rotate(-7deg)",
                        ...mono(30),
                        color: theme.accent,
                    }}
                >
                    not a question I answer
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    left: 1500,
                    top: 660,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                }}
            >
                <svg width="60" height="60" viewBox="0 0 60 60">
                    <path
                        d="M14 46 L40 12 L50 20 L24 54 L10 58 Z"
                        fill="#e8c26a"
                        stroke={INK}
                        strokeWidth={3.5}
                        strokeLinejoin="round"
                    />
                    <path
                        d="M6 6 L54 54"
                        stroke={theme.accent}
                        strokeWidth={6}
                        strokeLinecap="round"
                    />
                </svg>
                <span style={italic(38, INK)}>no write endpoints</span>
            </div>

            <Leaf
                size={120}
                seed="keys-leaf"
                style={{ position: "absolute", left: 1760, top: 880 }}
            />
            <Pebble
                size={66}
                seed="keys-pebble"
                style={{ position: "absolute", left: 1700, top: 960 }}
            />
        </>
    );
}
