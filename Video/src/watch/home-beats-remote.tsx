import React from "react";
import { Leaf, Paper, Pebble, Stage, useTheme, type Cue } from "../kit";
import { FullFrame, INK, Lighthouse, ROOM, Sheet } from "./shared/pieces";

// Still: watch / home-beats-remote. The phone plays the invented show; it reaches the library over two
// paths, Home and Remote, and Home wins when it answers within 300 ms. No names, addresses or devices.

export const theme = "qoria";
export const poster: Cue = { line: 0, at: "end" };

export default function HomeBeatsRemote() {
    return (
        <Stage ornaments={false}>
            <FullFrame>
                <Picture />
            </FullFrame>
        </Stage>
    );
}

const PHONE = { x: 60, y: 300, w: 700, h: 370 };

function Phone() {
    const theme = useTheme();
    const scr = { x: PHONE.x + 46, y: PHONE.y + 22, w: PHONE.w - 92, h: PHONE.h - 44 };
    const barY = scr.y + scr.h - 40;
    return (
        <>
            <Sheet
                seed="phone"
                x={PHONE.x}
                y={PHONE.y}
                w={PHONE.w}
                h={PHONE.h}
                color={INK}
                sway={0.12}
                lift={1.2}
                roughness={0.25}
            />
            <div
                style={{
                    position: "absolute",
                    left: scr.x,
                    top: scr.y,
                    width: scr.w,
                    height: scr.h,
                    overflow: "hidden",
                    borderRadius: 10,
                    background: ROOM.bg,
                }}
            >
                <Lighthouse w={scr.w} h={scr.h} beam={0.3} />
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 130,
                        background: "linear-gradient(rgba(29,28,26,0), rgba(29,28,26,0.92))",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 22,
                        top: 16,
                        fontFamily: "Fraunces",
                        color: ROOM.text,
                    }}
                >
                    <div style={{ fontWeight: 600, fontSize: 34 }}>Fogbell Point</div>
                    <div style={{ fontStyle: "italic", fontSize: 26, color: "#e6dccb" }}>
                        S1 E3 · The Fog Bell
                    </div>
                </div>
                <div
                    style={{
                        position: "absolute",
                        right: 20,
                        top: 18,
                        padding: "2px 12px",
                        border: `2px solid ${ROOM.text}`,
                        borderRadius: 6,
                        fontFamily: "Fraunces",
                        fontSize: 24,
                        color: ROOM.text,
                    }}
                >
                    English
                </div>
                <div
                    style={{
                        position: "absolute",
                        right: 22,
                        bottom: 64,
                        padding: "8px 22px",
                        borderRadius: 8,
                        background: theme.accent,
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 28,
                        color: ROOM.text,
                    }}
                >
                    Skip Intro
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 22,
                        bottom: 64,
                        fontFamily: "IBM Plex Mono",
                        fontWeight: 500,
                        fontSize: 30,
                        color: ROOM.text,
                    }}
                >
                    01:20
                </div>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: scr.x + 22,
                    top: barY,
                    width: scr.w - 44,
                    height: 8,
                    borderRadius: 4,
                    background: "#57534c",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: scr.x + 22,
                    top: barY,
                    width: (scr.w - 44) * (80 / 2520),
                    height: 8,
                    borderRadius: 4,
                    background: theme.accent,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: scr.x + 22 + (scr.w - 44) * (80 / 2520) - 10,
                    top: barY - 6,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: ROOM.text,
                    border: `3px solid ${theme.accent}`,
                }}
            />
        </>
    );
}

function House(props: { x: number; y: number }) {
    const theme = useTheme();
    return (
        <svg
            width={260}
            height={230}
            viewBox="0 0 260 230"
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                filter: "drop-shadow(6px 9px 0 rgba(25,25,25,0.28))",
            }}
        >
            <path
                d="M 30 110 L 130 20 L 230 110 Z"
                fill={theme.accent}
                stroke={INK}
                strokeWidth={5}
                strokeLinejoin="round"
            />
            <rect
                x={50}
                y={106}
                width={160}
                height={110}
                fill="#f7f6f1"
                stroke={INK}
                strokeWidth={5}
            />
            <rect
                x={110}
                y={146}
                width={42}
                height={70}
                fill="#8c7a5e"
                stroke={INK}
                strokeWidth={4}
            />
            <rect
                x={66}
                y={128}
                width={34}
                height={30}
                fill="#ffd58a"
                stroke={INK}
                strokeWidth={4}
            />
            <rect
                x={164}
                y={128}
                width={34}
                height={30}
                fill="#ffd58a"
                stroke={INK}
                strokeWidth={4}
            />
        </svg>
    );
}

function Cloud(props: { x: number; y: number }) {
    return (
        <svg
            width={300}
            height={190}
            viewBox="0 0 300 190"
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                filter: "drop-shadow(6px 9px 0 rgba(25,25,25,0.28))",
            }}
        >
            <path
                d="M 60 160 C 20 160, 14 108, 52 98 C 50 54, 104 40, 126 70 C 140 30, 210 30, 216 82 C 262 74, 286 118, 258 148 C 252 158, 244 160, 232 160 Z"
                fill="#d9d8d0"
                stroke={INK}
                strokeWidth={5}
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Stopwatch(props: { cx: number; cy: number }) {
    const theme = useTheme();
    const r = 110;
    // The face reads one second round; 300 ms is the first 108 degrees.
    const mark = (300 / 1000) * Math.PI * 2;
    const a0 = -Math.PI / 2;
    const ax = props.cx + Math.cos(a0 + mark) * r;
    const ay = props.cy + Math.sin(a0 + mark) * r;
    return (
        <svg
            width={1920}
            height={1080}
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                filter: "drop-shadow(6px 9px 0 rgba(25,25,25,0.25))",
            }}
        >
            <rect
                x={props.cx - 22}
                y={props.cy - r - 46}
                width={44}
                height={28}
                rx={6}
                fill={INK}
            />
            <circle
                cx={props.cx}
                cy={props.cy}
                r={r + 12}
                fill="#f7f6f1"
                stroke={INK}
                strokeWidth={6}
            />
            <path
                d={`M ${props.cx} ${props.cy} L ${props.cx} ${props.cy - r} A ${r} ${r} 0 0 1 ${ax} ${ay} Z`}
                fill={theme.accent}
                opacity={0.85}
            />
            {Array.from({ length: 10 }).map((_, i) => {
                const a = a0 + (i / 10) * Math.PI * 2;
                return (
                    <line
                        key={i}
                        x1={props.cx + Math.cos(a) * (r - 2)}
                        y1={props.cy + Math.sin(a) * (r - 2)}
                        x2={props.cx + Math.cos(a) * (r + 8)}
                        y2={props.cy + Math.sin(a) * (r + 8)}
                        stroke={INK}
                        strokeWidth={4}
                    />
                );
            })}
            <line
                x1={props.cx}
                y1={props.cy}
                x2={ax}
                y2={ay}
                stroke={INK}
                strokeWidth={7}
                strokeLinecap="round"
            />
            <circle cx={props.cx} cy={props.cy} r={10} fill={INK} />
        </svg>
    );
}

function Picture() {
    const theme = useTheme();
    const homeD = `M 770 440 C 860 330, 920 280, 1010 270`;
    const remoteD = `M 770 560 C 980 720, 1300 760, 1500 690`;
    return (
        <>
            <Phone />
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <path
                    d={homeD}
                    stroke={theme.accent}
                    strokeWidth={12}
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d={remoteD}
                    stroke="#9a9890"
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="22 18"
                />
            </svg>
            <House x={1000} y={130} />
            <Cloud x={1490} y={590} />
            <div
                style={{
                    position: "absolute",
                    left: 1076,
                    top: 362,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 48,
                    color: INK,
                }}
            >
                Home
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 1580,
                    top: 790,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 48,
                    color: INK,
                }}
            >
                Remote
            </div>
            <div style={{ position: "absolute", left: 1290, top: 220, transform: "rotate(-3deg)" }}>
                <Paper
                    seed="home-tag"
                    color={theme.accent}
                    roughness={1}
                    lift={1.2}
                    innerStyle={{
                        padding: "8px 24px",
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 40,
                        color: "#fffaf2",
                        whiteSpace: "nowrap",
                    }}
                >
                    answered in time · wins
                </Paper>
            </div>
            <div style={{ position: "absolute", left: 880, top: 760, transform: "rotate(2deg)" }}>
                <Paper
                    seed="remote-tag"
                    color="#d9d8d0"
                    roughness={1}
                    innerStyle={{
                        padding: "8px 24px",
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 38,
                        color: "#55544f",
                        whiteSpace: "nowrap",
                    }}
                >
                    standing by
                </Paper>
            </div>
            <Stopwatch cx={1380} cy={500} />
            <Leaf
                size={130}
                seed="race-leaf"
                style={{ position: "absolute", left: 70, top: 110 }}
            />
            <Pebble
                size={70}
                seed="race-pebble"
                style={{ position: "absolute", left: 200, top: 190 }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 1530,
                    top: 380,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 56,
                    color: theme.accent,
                    whiteSpace: "nowrap",
                }}
            >
                300 ms
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 60,
                    top: 920,
                    width: 1800,
                    textAlign: "center",
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 40,
                    color: INK,
                }}
            >
                Home wins if it answers within 300 ms. Checked again during playback.
            </div>
        </>
    );
}
