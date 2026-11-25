import React from "react";
import { Paper, Stage, useTheme, type Cue } from "../kit";
import { FullFrame, INK, Lighthouse, Sheet } from "./shared/pieces";

// Still: watch / smaller-files. The measured figures from the content file only: 1.48 GB vs 0.94 GB,
// SSIM 0.913 vs 0.911, 8 to 5 Mbps, CRF 19 to 21, 1.0x to 2.3x real time. The picture is an invented
// illustration, never a frame from the measured episode.

export const theme = "qoria";
export const poster: Cue = { line: 0, at: "end" };

export default function SmallerFiles() {
    return (
        <Stage>
            <FullFrame>
                <Picture />
            </FullFrame>
        </Stage>
    );
}

const FRAME = { w: 704, h: 396, y: 70 };
const BAR = { x: 190, w: 1300, h: 76 };

function Frame(props: { x: number; label: string; ssim: string; seed: string }) {
    return (
        <>
            <Sheet
                seed={props.seed}
                x={props.x - 16}
                y={FRAME.y - 16}
                w={FRAME.w + 32}
                h={FRAME.h + 32}
                color="#f7f6f1"
                sway={0.15}
                lift={1.1}
            />
            <div
                style={{
                    position: "absolute",
                    left: props.x,
                    top: FRAME.y,
                    width: FRAME.w,
                    height: FRAME.h,
                    overflow: "hidden",
                }}
            >
                <Lighthouse w={FRAME.w} h={FRAME.h} beam={0.35} />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: props.x - 30,
                    top: FRAME.y - 40,
                    transform: "rotate(-3deg)",
                }}
            >
                <Paper
                    seed={`${props.seed}-tag`}
                    color={INK}
                    roughness={1}
                    innerStyle={{
                        padding: "6px 24px",
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 44,
                        color: "#f7f6f1",
                    }}
                >
                    {props.label}
                </Paper>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: props.x + FRAME.w - 190,
                    top: FRAME.y + FRAME.h - 56,
                    padding: "4px 14px",
                    background: "rgba(247,246,241,0.88)",
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 28,
                    color: "#55544f",
                }}
            >
                illustration
            </div>
            <div
                style={{
                    position: "absolute",
                    left: props.x,
                    width: FRAME.w,
                    top: FRAME.y + FRAME.h + 28,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 16,
                }}
            >
                <span
                    style={{
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 36,
                        color: "#55544f",
                    }}
                >
                    SSIM
                </span>
                <span style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 60, color: INK }}>
                    {props.ssim}
                </span>
            </div>
        </>
    );
}

function Dial(props: { cx: number; cy: number; value: number; label: string; hot?: boolean }) {
    const theme = useTheme();
    const r = 74;
    const max = 3;
    // A half dial from 0x (left) to 3x (right).
    const ang = Math.PI + (props.value / max) * Math.PI;
    const nx = props.cx + Math.cos(ang) * (r - 14);
    const ny = props.cy + Math.sin(ang) * (r - 14);
    return (
        <>
            <svg
                width={1920}
                height={1080}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    filter: "drop-shadow(5px 7px 0 rgba(25,25,25,0.25))",
                }}
            >
                <path
                    d={`M ${props.cx - r} ${props.cy} A ${r} ${r} 0 0 1 ${props.cx + r} ${props.cy} Z`}
                    fill="#f7f6f1"
                    stroke={INK}
                    strokeWidth={5}
                    strokeLinejoin="round"
                />
                {[0, 1, 2, 3].map((v) => {
                    const a = Math.PI + (v / max) * Math.PI;
                    return (
                        <line
                            key={v}
                            x1={props.cx + Math.cos(a) * (r - 4)}
                            y1={props.cy + Math.sin(a) * (r - 4)}
                            x2={props.cx + Math.cos(a) * (r - 18)}
                            y2={props.cy + Math.sin(a) * (r - 18)}
                            stroke={INK}
                            strokeWidth={4}
                        />
                    );
                })}
                <line
                    x1={props.cx}
                    y1={props.cy}
                    x2={nx}
                    y2={ny}
                    stroke={props.hot ? theme.accent : INK}
                    strokeWidth={8}
                    strokeLinecap="round"
                />
                <circle cx={props.cx} cy={props.cy} r={9} fill={INK} />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: props.cx - 160,
                    width: 320,
                    top: props.cy + 14,
                    textAlign: "center",
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 40,
                    color: INK,
                }}
            >
                {props.label}
            </div>
        </>
    );
}

function Picture() {
    const theme = useTheme();
    const afterW = BAR.w * (0.94 / 1.48);
    return (
        <>
            <Frame x={190} label="Before" ssim="0.913" seed="before" />
            <Frame x={1000} label="After" ssim="0.911" seed="after" />

            <Sheet
                seed="bar-before"
                x={BAR.x}
                y={600}
                w={BAR.w}
                h={BAR.h}
                color="#c8c5b8"
                innerStyle={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 28px",
                    fontFamily: "IBM Plex Mono",
                    fontWeight: 500,
                    fontSize: 32,
                    color: INK,
                    whiteSpace: "nowrap",
                }}
            >
                Before · 8 Mbps cap · CRF 19 · 1.48 GB
            </Sheet>
            <Sheet
                seed="bar-after"
                x={BAR.x}
                y={700}
                w={afterW}
                h={BAR.h}
                color={theme.accent}
                innerStyle={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 28px",
                    fontFamily: "IBM Plex Mono",
                    fontWeight: 500,
                    fontSize: 32,
                    color: "#fffaf2",
                    whiteSpace: "nowrap",
                }}
            >
                After · 5 Mbps cap · CRF 21 · 0.94 GB
            </Sheet>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                <path
                    d={`M ${BAR.x + afterW + 14} 756 v 16 H ${BAR.x + BAR.w} v -16`}
                    stroke={theme.accent}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d={`M ${BAR.x + BAR.w} 690 V 756`}
                    stroke={INK}
                    strokeWidth={3}
                    strokeDasharray="8 8"
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: BAR.x + afterW + 40,
                    top: 700,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 46,
                    color: theme.accent,
                    whiteSpace: "nowrap",
                }}
            >
                about 36% smaller
            </div>

            <Dial cx={1180} cy={900} value={1.0} label="1.0× real time" />
            <Dial cx={1580} cy={900} value={2.3} label="2.3× real time" hot />
            <div
                style={{
                    position: "absolute",
                    left: 1530,
                    top: 1010,
                    transform: "translateX(-50%) rotate(-1.5deg)",
                    whiteSpace: "nowrap",
                }}
            >
                <Paper
                    seed="preset-tag"
                    color="#fffdf6"
                    roughness={1}
                    innerStyle={{
                        padding: "4px 18px",
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 28,
                        color: "#55544f",
                    }}
                >
                    faster encoder preset, same size and picture
                </Paper>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: BAR.x,
                    top: 880,
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 38,
                    color: "#55544f",
                }}
            >
                Measured on one 4K source episode.
            </div>
        </>
    );
}
