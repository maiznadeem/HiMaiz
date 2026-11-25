import React from "react";
import { Paper, Stage, useTheme, type Cue } from "../kit";
import { seeded } from "../kit/random";
import { clamp01, lerp, useClock, type Clock } from "./shared/clock";
import {
    Check,
    Ear,
    FullFrame,
    Hand,
    Harbour,
    INK,
    Lighthouse,
    ROOM,
    Sheet,
} from "./shared/pieces";

// watch/finding-the-intro. Lines (0-based): 0-1 the player and its missing intro, 2 mono 8 kHz,
// 3 a window 31.25 times a second, 4 33 bands, 5 a 32-bit hash per moment, 6 plain Node,
// 7-9 two episodes slide until the theme lines up, 10-11 the season votes, 12 one supporter is
// flagged, 13 the edges snap to shot cuts, 14 skip intro. The show and every title are invented.

export const theme = "qoria";
export const poster: Cue = { line: 11, at: "end" };

export default function FindingTheIntro() {
    return (
        <Stage>
            <FullFrame>
                <Scene />
            </FullFrame>
        </Stage>
    );
}

function Scene() {
    const c = useClock();
    const { S, N, t } = c;
    return (
        <>
            {t < S(2) + 0.7 && <Tv c={c} mode="start" />}
            {t >= S(2) - 0.1 && t < N(6) + 0.5 && <Analysis c={c} />}
            {t >= S(7) - 0.1 && t < N(11) + 0.5 && <Season c={c} />}
            {t >= S(12) - 0.1 && t < N(12) + 0.5 && <Pilot c={c} />}
            {t >= S(13) - 0.1 && t < N(13) + 0.5 && <Snap c={c} />}
            {t >= S(14) - 0.3 && <Tv c={c} mode="end" />}
        </>
    );
}

/** Fade in at `a`, out at `b`. */
function win(c: Clock, a: number, b: number, fade = 0.35) {
    return c.p(a, a + fade) * (1 - c.p(b, b + fade));
}

// ---------------------------------------------------------------------------------------------
// The player on a paper TV.

const TV = { x: 380, y: 60, w: 1160, h: 720 };
const SCR = { x: 420, y: 100, w: 1080, h: 620 };
const BAR = { x: 460, y: 664, w: 1000 };
const RUNTIME = 42 * 60;
const barX = (sec: number) => BAR.x + (sec / RUNTIME) * BAR.w;

function Tv({ c, mode }: { c: Clock; mode: "start" | "end" }) {
    const theme = useTheme();
    const { S, t } = c;
    const start = mode === "start";
    const appear = start ? c.sp(S(0) - 0.9) : c.sp(S(14) - 0.3);
    const leave = start ? c.p(S(2), S(2) + 0.6) : 0;
    const q = start ? c.pop(S(0, 0.55)) : 0;
    const skip = start ? c.pop(S(1, 0.15)) : 1;
    const ear = start ? c.pop(S(1, 0.55)) : 0;
    const fill = start ? 0 : c.p(S(14, 0.12), S(14, 0.25));
    const handIn = start ? 0 : c.p(S(14, 0.12), S(14, 0.32));
    const press = start ? 0 : win(c, S(14, 0.32), S(14, 0.42), 0.08);
    const jumped = !start && t >= S(14, 0.4);
    const jump = start ? 0 : c.p(S(14, 0.4), S(14, 0.48));
    const head = start ? 0 : lerp(72, 123, jump);
    const mm = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                opacity: Math.min(1, appear * 1.6) * (1 - leave),
                transform: `translateY(${(1 - appear) * 50 + leave * 60}px) scale(${1 - leave * 0.08})`,
                transformOrigin: "50% 40%",
            }}
        >
            {/* legs */}
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <path
                    d="M 760 770 L 700 860 M 1160 770 L 1220 860"
                    stroke={INK}
                    strokeWidth={14}
                    strokeLinecap="round"
                />
            </svg>
            <Sheet
                seed="tv-body"
                x={TV.x}
                y={TV.y}
                w={TV.w}
                h={TV.h}
                color="#b98a5a"
                sway={0.15}
                lift={1.2}
            />
            <div
                style={{
                    position: "absolute",
                    left: SCR.x,
                    top: SCR.y,
                    width: SCR.w,
                    height: SCR.h,
                    overflow: "hidden",
                    borderRadius: 14,
                    background: ROOM.bg,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 1 - (jumped ? c.p(S(14, 0.4), S(14, 0.55)) : 0),
                    }}
                >
                    <Lighthouse w={SCR.w} h={SCR.h} beam={(t * 0.12) % 1} />
                </div>
                {jumped && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: c.p(S(14, 0.4), S(14, 0.55)),
                        }}
                    >
                        <Harbour w={SCR.w} h={SCR.h} />
                    </div>
                )}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 230,
                        background: "linear-gradient(rgba(29,28,26,0), rgba(29,28,26,0.92))",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 170,
                        background: "linear-gradient(rgba(29,28,26,0.55), rgba(29,28,26,0))",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 40,
                        top: 30,
                        color: ROOM.text,
                        fontFamily: "Fraunces",
                    }}
                >
                    <div style={{ fontWeight: 600, fontSize: 52 }}>Fogbell Point</div>
                    <div style={{ fontStyle: "italic", fontSize: 34, color: "#e6dccb" }}>
                        S1 E3 · The Fog Bell
                    </div>
                </div>
            </div>
            {/* timeline */}
            <div
                style={{
                    position: "absolute",
                    left: BAR.x,
                    top: BAR.y - 5,
                    width: BAR.w,
                    height: 10,
                    borderRadius: 5,
                    background: "#57534c",
                }}
            />
            {!start && (
                <div
                    style={{
                        position: "absolute",
                        left: barX(72),
                        top: BAR.y - 5,
                        width: barX(123) - barX(72),
                        height: 10,
                        background: theme.accent,
                        opacity: 0.55,
                    }}
                />
            )}
            <div
                style={{
                    position: "absolute",
                    left: BAR.x,
                    top: BAR.y - 5,
                    width: barX(head) - BAR.x,
                    height: 10,
                    borderRadius: 5,
                    background: theme.accent,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: barX(head) - 12,
                    top: BAR.y - 12,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: ROOM.text,
                    border: `4px solid ${theme.accent}`,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: BAR.x + BAR.w - 110,
                    top: BAR.y + 14,
                    fontFamily: "IBM Plex Mono",
                    fontSize: 28,
                    color: ROOM.soft,
                }}
            >
                42:00
            </div>
            {!start && (
                <div
                    style={{
                        position: "absolute",
                        left: BAR.x,
                        top: BAR.y - 92,
                        fontFamily: "IBM Plex Mono",
                        fontWeight: 500,
                        fontSize: 52,
                        color: ROOM.text,
                    }}
                >
                    {mm(head)}
                </div>
            )}
            {/* the unknown intro */}
            {q > 0 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: BAR.x,
                            top: BAR.y - 14,
                            width: barX(150) - BAR.x,
                            height: 28,
                            border: `4px dashed ${theme.accent}`,
                            borderRadius: 8,
                            opacity: Math.min(1, q * 2),
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: BAR.x - 30,
                            top: BAR.y - 170 + Math.sin(t * 3) * 6,
                            opacity: Math.min(1, q * 2),
                            transform: `scale(${0.6 + 0.4 * q}) rotate(-8deg)`,
                        }}
                    >
                        <Paper
                            seed="qmark"
                            color="#f7f6f1"
                            roughness={1.2}
                            innerStyle={{
                                padding: "0 26px",
                                fontFamily: "Fraunces",
                                fontWeight: 600,
                                fontSize: 110,
                                lineHeight: 1.1,
                                color: INK,
                            }}
                        >
                            ?
                        </Paper>
                    </div>
                </>
            )}
            {ear > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: BAR.x + 110,
                        top: BAR.y - 118,
                        transform: `scale(${ear})`,
                        transformOrigin: "50% 100%",
                    }}
                >
                    <Ear size={96} />
                </div>
            )}
            {/* skip intro */}
            {skip > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 1220,
                        top: 560,
                        width: 250,
                        height: 66,
                        borderRadius: 10,
                        border:
                            fill > 0.5 ? `4px solid ${theme.accent}` : `4px dashed ${ROOM.text}`,
                        background: `rgba(255,79,26,${fill})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 34,
                        color: ROOM.text,
                        opacity:
                            Math.min(1, skip * 2) * (start ? 1 : 1 - c.p(S(14, 0.6), S(14, 0.75))),
                        transform: `scale(${(0.7 + 0.3 * skip) * (1 - press * 0.08)})`,
                    }}
                >
                    Skip Intro
                </div>
            )}
            {handIn > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: lerp(1700, 1380, handIn) - press * 10,
                        top: lerp(900, 600, handIn) + press * 14,
                    }}
                >
                    <Hand size={190} />
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------
// Lines 2-6: from audio to a 32-bit hash.

const BANDS = 33;
const energy = (frame: number, b: number) => {
    const r = seeded(`e:${frame}:${b}`)();
    const shape = 0.35 + 0.45 * Math.sin((b / BANDS) * Math.PI * 1.3 + frame * 0.7) ** 2;
    return clamp01(shape * 0.7 + r * 0.45);
};

function wavePath(x0: number, x1: number, y: number, amp: number, seed: string, phase = 0) {
    const n = 220;
    let d = "";
    for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = x0 + (x1 - x0) * u;
        const env = 0.45 + 0.55 * Math.abs(Math.sin(u * 7.1 + 0.6));
        const v =
            Math.sin(u * 190 + phase) * 0.55 +
            Math.sin(u * 77 + 1.3 + phase * 0.5) * 0.3 +
            (seeded(`${seed}:${i}`)() - 0.5) * 0.5;
        d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${(y + v * amp * env).toFixed(1)} `;
    }
    return d;
}

const WAVE = { x0: 160, x1: 1760 };
const WIN = { x0: 200, step: 52, steps: 16, w: 60 };
const SPEC = { x: 640, y: 318, h: 15, maxW: 440 };
const COL = { x: 1250, cell: 16 };
const LONG = { x: 260, y: 846, w: 1300, cell: 10, rows: 8 };

function Analysis({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, E, N, t } = c;
    const vis = win(c, S(2) - 0.1, N(6) + 0.1);
    // Line 2: stereo merges to mono, then the band moves up for the analysis.
    const merge = c.p(S(2, 0.35), S(2, 0.8));
    const up = c.p(S(3) - 0.1, S(3) + 0.5);
    const yMid = lerp(480, 200, up);
    const amp = lerp(70, 50, up);
    const stamp = c.pop(S(2, 0.75));
    // Line 3: the window steps along.
    const stepP = c.lin(S(3, 0.1), E(3));
    const k = Math.min(WIN.steps - 1, Math.floor(stepP * WIN.steps));
    const winOn = c.p(S(3, 0.05), S(3, 0.2));
    const wx = WIN.x0 + k * WIN.step;
    const counter = win(c, S(3, 0.15), S(4) + 0.2);
    // Line 4: the spectrum grows into 33 strips.
    const grow = c.p(S(4), S(4) + 0.8);
    const frozen = t >= S(4);
    const frameIdx = frozen ? WIN.steps : k;
    // Line 5: compare with one frame back, drop the bits into a column.
    const ghost = c.p(S(5), S(5) + 0.5);
    const bitsA = S(5, 0.12);
    const bitsB = S(5, 0.78);
    const shrink = c.p(S(5, 0.8), E(5) + 0.3);
    const longFill = c.lin(S(5, 0.85), N(5) + 0.2);
    // Line 6: plain Node.
    const node = c.pop(S(6, 0.05));
    const lib = c.pop(S(6, 0.35));
    const strike = c.p(S(6, 0.55), S(6, 0.75));
    const showSpec = t >= S(3, 0.1);
    const cur = Array.from({ length: BANDS }, (_, b) => energy(frameIdx, b));
    const prev = Array.from({ length: BANDS }, (_, b) => energy(frameIdx - 1, b));
    const bits = Array.from(
        { length: 32 },
        (_, b) => cur[b] - cur[b + 1] - (prev[b] - prev[b + 1]) > 0,
    );
    const dropped = Math.floor(c.lin(bitsA, bitsB) * 32 + 0.0001);
    const stripY = (b: number) => SPEC.y + (BANDS - 1 - b) * SPEC.h;
    return (
        <div style={{ position: "absolute", inset: 0, opacity: vis }}>
            <svg
                width={1920}
                height={1080}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
                {/* stereo to mono */}
                <path
                    d={wavePath(WAVE.x0, WAVE.x1, lerp(yMid - 90, yMid, merge), amp, "wL")}
                    stroke={INK}
                    strokeWidth={4}
                    fill="none"
                    opacity={1}
                />
                <path
                    d={wavePath(WAVE.x0, WAVE.x1, lerp(yMid + 90, yMid, merge), amp, "wR", 0.4)}
                    stroke="#55544f"
                    strokeWidth={4}
                    fill="none"
                    opacity={1 - merge}
                />
                {/* the window and its tick marks */}
                {winOn > 0 &&
                    Array.from({ length: k + 1 }).map((_, i) => (
                        <line
                            key={i}
                            x1={WIN.x0 + i * WIN.step}
                            y1={yMid + 82}
                            x2={WIN.x0 + i * WIN.step}
                            y2={yMid + 100}
                            stroke={theme.accent}
                            strokeWidth={4}
                            strokeLinecap="round"
                            opacity={winOn}
                        />
                    ))}
                {winOn > 0 && (
                    <rect
                        x={wx}
                        y={yMid - 76}
                        width={WIN.w}
                        height={152}
                        rx={6}
                        fill="rgba(255,79,26,0.12)"
                        stroke={theme.accent}
                        strokeWidth={5}
                        opacity={winOn * (1 - shrink)}
                    />
                )}
                {/* line 5: the comparison arrows */}
                {t >= bitsA &&
                    t < bitsB + 0.4 &&
                    (() => {
                        const b = Math.min(31, dropped);
                        const y = (stripY(b) + stripY(b + 1)) / 2 + SPEC.h / 2;
                        return (
                            <g opacity={1 - c.p(bitsB, bitsB + 0.3)}>
                                <path
                                    d={`M ${SPEC.x + SPEC.maxW + 30} ${y} H ${COL.x - 24}`}
                                    stroke={theme.accent}
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                />
                                <path
                                    d={`M ${COL.x - 24} ${y} l -16 -10 M ${COL.x - 24} ${y} l -16 10`}
                                    stroke={theme.accent}
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                />
                                <path
                                    d={`M ${SPEC.x - 10} ${stripY(b) + 3} v ${SPEC.h * 2 - 6}`}
                                    stroke={theme.accent}
                                    strokeWidth={6}
                                    strokeLinecap="round"
                                />
                            </g>
                        );
                    })()}
            </svg>
            {stamp > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: lerp(1330, 160, up),
                        top: lerp(300, 46, up),
                        transform: `rotate(-4deg) scale(${lerp(1.6, 1, Math.min(1, stamp)) * lerp(1, 0.8, up)})`,
                        transformOrigin: "0 0",
                        opacity: Math.min(1, stamp * 2),
                    }}
                >
                    <div
                        style={{
                            padding: "6px 22px",
                            border: `5px solid ${theme.accent}`,
                            borderRadius: 8,
                            background: "rgba(247,246,241,0.9)",
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 44,
                            color: theme.accent,
                            whiteSpace: "nowrap",
                        }}
                    >
                        mono · 8 kHz
                    </div>
                </div>
            )}
            {merge < 0.6 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: 90,
                            top: 480 - 90 - 22,
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontSize: 36,
                            color: INK,
                            opacity: 1 - merge * 1.6,
                        }}
                    >
                        left
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: 90,
                            top: 480 + 90 - 22,
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontSize: 36,
                            color: INK,
                            opacity: 1 - merge * 1.6,
                        }}
                    >
                        right
                    </div>
                </>
            )}
            {counter > 0 && (
                <div style={{ position: "absolute", left: 1220, top: 330, opacity: counter }}>
                    <Paper seed="rate" innerStyle={{ padding: "18px 34px", whiteSpace: "nowrap" }}>
                        <span
                            style={{
                                fontFamily: "Fraunces",
                                fontWeight: 600,
                                fontSize: 96,
                                color: INK,
                            }}
                        >
                            31.25
                        </span>
                        <span
                            style={{
                                fontFamily: "Fraunces",
                                fontStyle: "italic",
                                fontSize: 40,
                                color: "#55544f",
                                marginLeft: 16,
                            }}
                        >
                            frames / s
                        </span>
                    </Paper>
                </div>
            )}
            {/* the spectrum: small under the window (line 3), then 33 strips (line 4) */}
            {showSpec &&
                cur.map((e, b) => {
                    const smallX = wx;
                    const smallY = yMid + 110 + (BANDS - 1 - b) * 7;
                    const x = lerp(smallX, SPEC.x, grow);
                    const y = lerp(smallY, stripY(b), grow);
                    const h = lerp(5, SPEC.h - 3, grow);
                    const w = lerp(20 + e * 150, 60 + e * (SPEC.maxW - 60), grow);
                    const flash = frozen
                        ? 1
                        : 0.55 + 0.45 * Math.cos((stepP * WIN.steps - k) * Math.PI);
                    return (
                        <div
                            key={b}
                            style={{
                                position: "absolute",
                                left: x,
                                top: y,
                                width: w,
                                height: h,
                                borderRadius: 3,
                                background: `rgba(25,25,25,${0.18 + 0.75 * e})`,
                                boxShadow: grow > 0.5 ? "3px 4px 0 rgba(25,25,25,0.18)" : undefined,
                                opacity: flash * (1 - shrink * 0.7),
                            }}
                        />
                    );
                })}
            {/* one frame back */}
            {ghost > 0 &&
                prev.map((e, b) => (
                    <div
                        key={b}
                        style={{
                            position: "absolute",
                            left: lerp(SPEC.x, 170, ghost),
                            top: stripY(b),
                            width: 60 + e * 300,
                            height: SPEC.h - 3,
                            borderRadius: 3,
                            background: `rgba(25,25,25,${0.1 + 0.4 * e})`,
                            opacity: ghost * 0.9 * (1 - shrink * 0.7),
                        }}
                    />
                ))}
            {ghost > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 170,
                        top: SPEC.y - 56,
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 34,
                        color: "#55544f",
                        opacity: ghost * (1 - shrink),
                    }}
                >
                    one frame back
                </div>
            )}
            {grow > 0 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: SPEC.x - 160,
                            top: stripY(BANDS - 1) - 8,
                            fontFamily: "IBM Plex Mono",
                            fontSize: 28,
                            color: INK,
                            opacity: grow * (1 - ghost),
                        }}
                    >
                        3400 Hz
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: SPEC.x - 140,
                            top: stripY(0) - 8,
                            fontFamily: "IBM Plex Mono",
                            fontSize: 28,
                            color: INK,
                            opacity: grow * (1 - ghost),
                        }}
                    >
                        300 Hz
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: SPEC.x + SPEC.maxW + 40,
                            top: SPEC.y - 4,
                            opacity: grow * (1 - c.p(S(5, 0.05), S(5, 0.2))),
                            transform: "rotate(-2deg)",
                        }}
                    >
                        <Paper
                            seed="bands"
                            color={theme.accent}
                            roughness={1}
                            innerStyle={{
                                padding: "8px 22px",
                                fontFamily: "Fraunces",
                                fontStyle: "italic",
                                fontSize: 40,
                                color: "#fffaf2",
                                whiteSpace: "nowrap",
                            }}
                        >
                            33 bands
                        </Paper>
                    </div>
                </>
            )}
            {/* the 32-bit column */}
            {t >= bitsA && (
                <div
                    style={{
                        position: "absolute",
                        left: lerp(COL.x, LONG.x + 64 * LONG.cell, shrink),
                        top: lerp(SPEC.y + SPEC.h / 2, LONG.y, shrink),
                        width: COL.cell,
                        height: 32 * COL.cell,
                        transform: `scale(${lerp(1, LONG.cell / COL.cell, shrink)}, ${lerp(1, (LONG.rows * LONG.cell) / (32 * COL.cell), shrink)})`,
                        transformOrigin: "0 0",
                        opacity: 1 - c.p(N(5) - 0.1, N(5) + 0.2),
                    }}
                >
                    {bits.slice(0, dropped).map((bit, b) => (
                        <div
                            key={b}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: (31 - b) * COL.cell,
                                width: COL.cell,
                                height: COL.cell,
                                background: bit ? INK : "#fbfaf6",
                                outline: "1.5px solid rgba(25,25,25,0.5)",
                            }}
                        />
                    ))}
                </div>
            )}
            {t >= bitsA && (
                <div
                    style={{
                        position: "absolute",
                        left: COL.x + 40,
                        top: SPEC.y + 210,
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 56,
                        color: INK,
                        opacity: c.p(bitsA, bitsA + 0.3) * (1 - shrink),
                        whiteSpace: "nowrap",
                    }}
                >
                    32 bits
                    <div
                        style={{
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontWeight: 400,
                            fontSize: 34,
                            color: "#55544f",
                        }}
                    >
                        one moment of sound
                    </div>
                </div>
            )}
            {longFill > 0 && (
                <BarcodeStrip
                    ep="E3"
                    x={LONG.x}
                    y={LONG.y}
                    reveal={longFill}
                    label="E3 · The Fog Bell"
                    labelSide="right"
                />
            )}
            {/* line 6 */}
            {node > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 1240,
                        top: 330,
                        opacity: Math.min(1, node * 2),
                        transform: `translateY(${(1 - Math.min(1, node)) * 30}px) rotate(1.5deg)`,
                    }}
                >
                    <Paper
                        seed="node-card"
                        color="#fffdf6"
                        lift={1.2}
                        innerStyle={{
                            padding: "18px 28px",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 32,
                            color: INK,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                background: "#7fae6b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Check size={32} color="#fff" />
                        </div>
                        fingerprint.ts · plain Node
                    </Paper>
                </div>
            )}
            {lib > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 1220,
                        top: 480,
                        opacity: Math.min(1, lib * 2),
                        transform: `translateY(${(1 - Math.min(1, lib)) * 30}px) rotate(-2deg)`,
                    }}
                >
                    <Paper
                        seed="lib-card"
                        color="#d9d8d0"
                        innerStyle={{
                            padding: "14px 26px",
                            fontFamily: "IBM Plex Mono",
                            fontSize: 28,
                            color: "#55544f",
                            whiteSpace: "nowrap",
                            position: "relative",
                        }}
                    >
                        fingerprint library: not in this build
                    </Paper>
                    <svg
                        width={560}
                        height={80}
                        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
                    >
                        <path
                            d="M 10 40 L 540 30"
                            stroke={theme.accent}
                            strokeWidth={6}
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray={1}
                            strokeDashoffset={1 - strike}
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------
// The barcode strips. Each strip covers the first three minutes of an episode, one column a cell.

const STRIP = { x: 260, w: 1300, cell: 10, rows: 8, cols: 130 };
const INTRO_COLS = 37;
type Ep = "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
/** Where each episode's copy of the theme tune starts (column), and which part of the theme it is. */
const THEME: Record<Ep, { from: number; to: number; offset: number }> = {
    E1: { from: 6, to: 20, offset: 0 },
    E2: { from: 40, to: 40 + INTRO_COLS, offset: 0 },
    E3: { from: 52, to: 52 + INTRO_COLS, offset: 0 },
    E4: { from: 35, to: 35 + INTRO_COLS, offset: 0 },
    E5: { from: 47, to: 47 + INTRO_COLS, offset: 0 },
    E6: { from: 80, to: 90, offset: 20 },
};
/** How far a strip slides (px) to line its theme up with E3's. */
const ALIGN: Record<Ep, number> = {
    E1: 0,
    E2: (52 - 40) * STRIP.cell,
    E3: 0,
    E4: (52 - 35) * STRIP.cell,
    E5: (52 - 47) * STRIP.cell,
    E6: (52 + 20 - 80) * STRIP.cell,
};

const bitCache = new Map<string, boolean[][]>();
function stripBits(ep: Ep): boolean[][] {
    const hit = bitCache.get(ep);
    if (hit) return hit;
    const th = THEME[ep];
    const cols: boolean[][] = [];
    for (let col = 0; col < STRIP.cols; col++) {
        const inTheme = col >= th.from && col < th.to;
        const key = inTheme ? `theme:${col - th.from + th.offset}` : `${ep}:${col}`;
        const rand = seeded(key);
        cols.push(Array.from({ length: STRIP.rows }, () => rand() > 0.5));
    }
    bitCache.set(ep, cols);
    return cols;
}

function BarcodeStrip(props: {
    ep: Ep;
    x: number;
    y: number;
    reveal?: number;
    lit?: number;
    pale?: boolean;
    label?: string;
    labelSide?: "above" | "right";
    labelX?: number;
}) {
    const theme = useTheme();
    const bits = stripBits(props.ep);
    const th = THEME[props.ep];
    const shown = Math.round((props.reveal ?? 1) * STRIP.cols);
    const lit = props.lit ?? 0;
    const cell = STRIP.cell;
    const litFill = props.pale ? "#ffd9c7" : theme.accent;
    return (
        <>
            <svg
                width={STRIP.w}
                height={STRIP.rows * cell}
                style={{
                    position: "absolute",
                    left: props.x,
                    top: props.y,
                    overflow: "visible",
                    filter: "drop-shadow(5px 7px 0 rgba(25,25,25,0.25))",
                }}
            >
                <rect x={0} y={0} width={shown * cell} height={STRIP.rows * cell} fill="#fbfaf6" />
                {lit > 0 && (
                    <rect
                        x={th.from * cell}
                        y={0}
                        width={(th.to - th.from) * cell}
                        height={STRIP.rows * cell}
                        fill={props.pale ? "#fff1ea" : "#ffd2bf"}
                        opacity={lit}
                    />
                )}
                {bits.slice(0, shown).map((col, i) =>
                    col.map((b, r) => {
                        if (!b) return null;
                        const inLit = lit > 0.5 && i >= th.from && i < th.to;
                        return (
                            <rect
                                key={`${i}-${r}`}
                                x={i * cell}
                                y={r * cell}
                                width={cell}
                                height={cell}
                                fill={inLit ? litFill : INK}
                            />
                        );
                    }),
                )}
                {props.pale && lit > 0 && (
                    <rect
                        x={th.from * cell - 3}
                        y={-3}
                        width={(th.to - th.from) * cell + 6}
                        height={STRIP.rows * cell + 6}
                        fill="none"
                        stroke={theme.accent}
                        strokeWidth={3}
                        strokeDasharray="10 8"
                        opacity={lit}
                    />
                )}
            </svg>
            {props.label && (
                <div
                    style={{
                        position: "absolute",
                        left:
                            props.labelSide === "right"
                                ? props.x + STRIP.w + 24
                                : (props.labelX ?? props.x),
                        top: props.labelSide === "right" ? props.y + 14 : props.y - 44,
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 34,
                        color: INK,
                        whiteSpace: "nowrap",
                    }}
                >
                    {props.label}
                </div>
            )}
        </>
    );
}

const ROWS: { ep: Ep; title: string; y: number }[] = [
    { ep: "E3", title: "E3 · The Fog Bell", y: 214 },
    { ep: "E4", title: "E4 · Low Tide", y: 340 },
    { ep: "E2", title: "E2 · Gull Season", y: 466 },
    { ep: "E5", title: "E5 · The Inspector", y: 592 },
    { ep: "E6", title: "E6 · Storm Glass", y: 718 },
];
const LABEL_X = 70;
const introX0 = STRIP.x + THEME.E3.from * STRIP.cell;
const introX1 = STRIP.x + THEME.E3.to * STRIP.cell;

function Ballot(props: { x: number; y: number; s: number }) {
    return (
        <div
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                opacity: Math.min(1, props.s * 2),
                transform: `scale(${0.5 + 0.5 * props.s}) rotate(4deg)`,
            }}
        >
            <Paper
                seed={`ballot-${props.y}`}
                color="#fffdf6"
                innerStyle={{
                    width: 64,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Check size={48} color="#ff4f1a" width={6} />
            </Paper>
        </div>
    );
}

/** Lines 7-11: two episodes, then the season. */
function Season({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, E, N, t } = c;
    const vis = win(c, S(7) - 0.1, N(11) + 0.05);
    const rise = c.p(S(7) - 0.1, S(7) + 0.6);
    const e4in = c.pop(S(7, 0.35));
    // Line 8: E4 slides back and forth; line 9: it settles where the theme lines up.
    const d8 = E(8) - S(8);
    const keys: [number, number][] = [
        [S(7), 0],
        [S(8), 0],
        [S(8) + d8 * 0.3, -150],
        [S(8) + d8 * 0.7, 300],
        [E(8) + 0.1, 60],
        [S(9, 0.3), ALIGN.E4],
    ];
    let off = ALIGN.E4;
    for (let i = 0; i < keys.length - 1; i++) {
        const [ta, va] = keys[i];
        const [tb, vb] = keys[i + 1];
        if (t <= tb) {
            off = lerp(va, vb, c.p(ta, tb));
            break;
        }
    }
    if (t <= keys[0][0]) off = 0;
    const lit = c.p(S(9, 0.32), S(9, 0.42));
    const near = Math.exp(-(((off - ALIGN.E4) / 30) ** 2));
    const meter = clamp01(0.08 + 0.12 * Math.abs(Math.sin(t * 23)) + 0.82 * near);
    const meterOn = win(c, S(8), S(10) - 0.2);
    const brackets = win(c, S(9, 0.45), S(10) - 0.1);
    const title = c.p(S(10) - 0.2, S(10) + 0.4);
    const bar = c.p(S(11), S(11) + 0.6);
    const rows = ROWS.map((r, i) => {
        if (r.ep === "E3") {
            return { ...r, y: lerp(LONG.y, r.y, rise), off: 0, on: 1, lit };
        }
        if (r.ep === "E4") return { ...r, off, on: e4in, lit };
        const at = S(10, 0.05) + (i - 2) * 0.28;
        const on = c.pop(at);
        const slide = c.p(at + 0.25, at + 0.95);
        const wiggle = Math.sin(c.lin(at + 0.25, at + 0.95) * Math.PI * 2) * 60 * (1 - slide);
        return {
            ...r,
            off: lerp(0, ALIGN[r.ep], slide) + wiggle,
            on,
            lit: c.p(at + 0.9, at + 1.05),
        };
    });
    const ticks = [
        { ep: "E4", at: S(10, 0.35) },
        { ep: "E2", at: S(10, 0.05) + 1.1 },
        { ep: "E5", at: S(10, 0.05) + 1.38 },
    ];
    return (
        <div style={{ position: "absolute", inset: 0, opacity: vis }}>
            {title > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: LABEL_X,
                        top: 40,
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 68,
                        color: INK,
                        opacity: title,
                        transform: `translateY(${(1 - title) * 20}px)`,
                    }}
                >
                    It finds the intro by listening.
                </div>
            )}
            {bar > 0 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: introX0 - 14,
                            top: ROWS[0].y - 14,
                            width: introX1 - introX0 + 28,
                            height: ROWS[3].y + 80 + 14 - (ROWS[0].y - 14),
                            opacity: bar,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 8,
                                background: "rgba(255,79,26,0.22)",
                                border: `5px solid ${theme.accent}`,
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: introX0 - 14,
                            top: ROWS[0].y - 66 - (1 - bar) * 10,
                            opacity: bar,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Paper
                            seed="intro-tag"
                            color={theme.accent}
                            roughness={1}
                            innerStyle={{
                                padding: "4px 18px",
                                fontFamily: "Fraunces",
                                fontWeight: 600,
                                fontSize: 34,
                                color: "#fffaf2",
                            }}
                        >
                            Intro · 3 of 4 siblings agree
                        </Paper>
                    </div>
                </>
            )}
            {rows.map((r) =>
                r.on > 0 ? (
                    <div
                        key={r.ep}
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: Math.min(1, r.on * 2),
                            transform: `translateY(${(1 - Math.min(1, r.on)) * -40}px)`,
                        }}
                    >
                        <BarcodeStrip
                            ep={r.ep}
                            x={STRIP.x + r.off}
                            y={r.y}
                            lit={r.lit}
                            pale={r.ep === "E6"}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: LABEL_X,
                                top: r.y - 44,
                                fontFamily: "Fraunces",
                                fontStyle: "italic",
                                fontSize: 34,
                                color: INK,
                                whiteSpace: "nowrap",
                                opacity: r.ep === "E3" ? rise : 1,
                            }}
                        >
                            {r.title}
                        </div>
                    </div>
                ) : null,
            )}
            {ticks.map((tk) => {
                const row = ROWS.find((r) => r.ep === tk.ep)!;
                const s = c.pop(tk.at);
                return s > 0 ? <Ballot key={tk.ep} x={1790} y={row.y + 6} s={s} /> : null;
            })}
            {brackets > 0 && (
                <svg
                    width={1920}
                    height={1080}
                    style={{ position: "absolute", left: 0, top: 0, opacity: brackets }}
                >
                    <path
                        d={`M ${introX0} ${ROWS[0].y - 8} v -14 H ${introX1} v 14`}
                        stroke={theme.accent}
                        strokeWidth={5}
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d={`M ${introX0} ${ROWS[1].y + 88} v 14 H ${introX1} v -14`}
                        stroke={theme.accent}
                        strokeWidth={5}
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            )}
            {brackets > 0 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: introX1 + 20,
                            top: ROWS[0].y - 46,
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 30,
                            color: theme.accent,
                            opacity: brackets,
                        }}
                    >
                        E3 01:12 to 02:03
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: introX1 + 20,
                            top: ROWS[1].y + 84,
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 30,
                            color: theme.accent,
                            opacity: brackets,
                        }}
                    >
                        E4 00:48 to 01:39
                    </div>
                </>
            )}
            {meterOn > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 1300,
                        top: 520,
                        opacity: meterOn,
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                    }}
                >
                    <span
                        style={{
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontSize: 36,
                            color: INK,
                        }}
                    >
                        agreement
                    </span>
                    <div
                        style={{
                            width: 300,
                            height: 40,
                            borderRadius: 8,
                            background: "#d9d8d0",
                            border: `4px solid ${INK}`,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: `${meter * 100}%`,
                                height: "100%",
                                background: meter > 0.7 ? theme.accent : "#8a8880",
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/** Line 12: an episode with only one supporter is flagged, not trusted. */
function Pilot({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, N } = c;
    const vis = win(c, S(12) - 0.1, N(12) + 0.05);
    const lit = c.p(S(12, 0.3), S(12, 0.45));
    const flag = c.pop(S(12, 0.55));
    const sibs: { ep: Ep; title: string; y: number; lit: boolean }[] = [
        { ep: "E2", title: "E2 · Gull Season", y: 430, lit: false },
        { ep: "E4", title: "E4 · Low Tide", y: 556, lit: true },
        { ep: "E5", title: "E5 · The Inspector", y: 682, lit: false },
        { ep: "E6", title: "E6 · Storm Glass", y: 808, lit: false },
    ];
    const e1y = 300;
    const e4 = sibs[1];
    return (
        <div style={{ position: "absolute", inset: 0, opacity: vis }}>
            <div
                style={{
                    position: "absolute",
                    left: LABEL_X,
                    top: 40,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 68,
                    color: INK,
                }}
            >
                A different episode.
            </div>
            <BarcodeStrip ep="E1" x={STRIP.x} y={e1y} lit={lit} pale />
            <div
                style={{
                    position: "absolute",
                    left: LABEL_X,
                    top: e1y - 44,
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 34,
                    color: INK,
                }}
            >
                E1 · Pilot
            </div>
            {sibs.map((s) => (
                <div
                    key={s.ep}
                    style={{ position: "absolute", inset: 0, opacity: s.lit ? 1 : 0.4 }}
                >
                    <BarcodeStrip ep={s.ep} x={STRIP.x} y={s.y} lit={s.lit ? lit : 0} />
                    <div
                        style={{
                            position: "absolute",
                            left: LABEL_X,
                            top: s.y - 44,
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontSize: 34,
                            color: INK,
                        }}
                    >
                        {s.title}
                    </div>
                </div>
            ))}
            <svg
                width={1920}
                height={1080}
                style={{ position: "absolute", left: 0, top: 0, opacity: lit }}
            >
                <path
                    d={`M ${STRIP.x + (THEME.E4.from + 6) * STRIP.cell} ${e4.y - 6} C ${STRIP.x + (THEME.E4.from + 4) * STRIP.cell} ${e4.y - 120}, ${STRIP.x + (THEME.E1.from + 8) * STRIP.cell} ${e1y + 200}, ${STRIP.x + (THEME.E1.from + 7) * STRIP.cell} ${e1y + 92}`}
                    stroke={theme.accent}
                    strokeWidth={5}
                    strokeDasharray="12 10"
                    fill="none"
                />
            </svg>
            {flag > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: STRIP.x + THEME.E1.from * STRIP.cell + 40,
                        top: e1y - 120,
                        transform: `scale(${flag}) rotate(-3deg)`,
                        transformOrigin: "0 100%",
                    }}
                >
                    <svg width={20} height={150} style={{ position: "absolute", left: 0, top: 0 }}>
                        <path d="M 8 4 V 146" stroke={INK} strokeWidth={6} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", left: 14, top: 0 }}>
                        <Paper
                            seed="flag"
                            color={theme.accent}
                            roughness={1.2}
                            innerStyle={{
                                padding: "8px 22px",
                                fontFamily: "Fraunces",
                                fontWeight: 600,
                                fontSize: 34,
                                color: "#fffaf2",
                                whiteSpace: "nowrap",
                            }}
                        >
                            only one sibling agrees
                        </Paper>
                    </div>
                </div>
            )}
            {flag > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 830,
                        top: e1y - 104,
                        opacity: Math.min(1, flag),
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 40,
                        color: "#55544f",
                        whiteSpace: "nowrap",
                    }}
                >
                    flagged, not trusted
                </div>
            )}
        </div>
    );
}

/** Line 13: the edges snap to the nearest shot cut. A close-up of E3 around its intro. */
const ZOOM = { t0: 60, t1: 135 };
const zx = (sec: number) => STRIP.x + ((sec - ZOOM.t0) / (ZOOM.t1 - ZOOM.t0)) * STRIP.w;

function Snap({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, N, t } = c;
    const vis = win(c, S(13) - 0.1, N(13) + 0.05);
    const cuts = c.p(S(13, 0.15), S(13, 0.35));
    const snapAt = S(13, 0.5);
    const snap = t < snapAt ? 0 : c.pop(snapAt);
    const shots = [
        { a: 60, b: 71.8, color: "#22344f" },
        { a: 71.8, b: 88, color: "#ff8a5c" },
        { a: 88, b: 104, color: "#f1e9dc" },
        { a: 104, b: 123.2, color: "#5b7894" },
        { a: 123.2, b: 135, color: "#e9b48a" },
    ];
    const rough = [70.2, 124.9];
    const x0 = lerp(zx(rough[0]), zx(71.8), snap);
    const x1 = lerp(zx(rough[1]), zx(123.2), snap);
    const thumbsY = 270;
    const stripY = 540;
    const barY = 660;
    // A zoomed strip: E3's bits stretched around the intro.
    const bits = stripBits("E3");
    const colW = STRIP.w / ((ZOOM.t1 - ZOOM.t0) / 1.3889);
    const firstCol = Math.floor(ZOOM.t0 / 1.3889);
    return (
        <div style={{ position: "absolute", inset: 0, opacity: vis }}>
            <div
                style={{
                    position: "absolute",
                    left: LABEL_X,
                    top: 40,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 68,
                    color: INK,
                }}
            >
                Snap to the picture.
            </div>
            {[
                ["picture", thumbsY + 76],
                ["sound", stripY + 18],
                ["intro", barY + 12],
            ].map(([label, y]) => (
                <div
                    key={label}
                    style={{
                        position: "absolute",
                        left: LABEL_X,
                        top: y as number,
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 38,
                        color: INK,
                    }}
                >
                    {label}
                </div>
            ))}
            {shots.map((s, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        left: zx(s.a) + 4,
                        top: thumbsY,
                        width: zx(s.b) - zx(s.a) - 8,
                        height: 200,
                        transform: `translateY(${(1 - c.pop(S(13) + i * 0.06)) * 30}px)`,
                    }}
                >
                    <Sheet
                        seed={`shot-${i}`}
                        x={0}
                        y={0}
                        w={zx(s.b) - zx(s.a) - 8}
                        h={200}
                        color={s.color}
                        sway={0.2}
                    />
                </div>
            ))}
            <svg
                width={1920}
                height={1080}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
                {Array.from({ length: Math.ceil(STRIP.w / colW) }).map((_, i) => {
                    const col = bits[firstCol + i];
                    if (!col) return null;
                    const th = THEME.E3;
                    const inIntro = firstCol + i >= th.from && firstCol + i < th.to;
                    return col.map((b, r) =>
                        b ? (
                            <rect
                                key={`${i}-${r}`}
                                x={STRIP.x + i * colW}
                                y={stripY + r * 10}
                                width={colW - 1}
                                height={10}
                                fill={inIntro ? theme.accent : INK}
                                opacity={0.85}
                            />
                        ) : null,
                    );
                })}
                {[71.8, 123.2].map((s) => (
                    <path
                        key={s}
                        d={`M ${zx(s)} ${thumbsY - 16} V ${barY + 90}`}
                        stroke={INK}
                        strokeWidth={5}
                        strokeDasharray="14 10"
                        opacity={cuts}
                    />
                ))}
            </svg>
            {[71.8, 123.2].map((s) => (
                <div
                    key={s}
                    style={{
                        position: "absolute",
                        left: zx(s) - 30,
                        top: thumbsY - 64,
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 32,
                        color: INK,
                        opacity: cuts,
                    }}
                >
                    cut
                </div>
            ))}
            <div
                style={{
                    position: "absolute",
                    left: x0,
                    top: barY,
                    width: x1 - x0,
                    height: 70,
                    borderRadius: 8,
                    background: theme.accent,
                    boxShadow: "5px 7px 0 rgba(25,25,25,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 40,
                    color: "#fffaf2",
                }}
            >
                Intro
            </div>
            {snap > 0.6 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: zx(71.8) - 54,
                            top: barY + 96,
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 36,
                            color: INK,
                        }}
                    >
                        01:12
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: zx(123.2) - 54,
                            top: barY + 96,
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 36,
                            color: INK,
                        }}
                    >
                        02:03
                    </div>
                </>
            )}
        </div>
    );
}
