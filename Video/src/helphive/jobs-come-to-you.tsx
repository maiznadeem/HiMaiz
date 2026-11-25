import React from "react";
import { Paper, Stage, Tag, useTheme, useType } from "../kit";
import { HONEY } from "./shared/pieces";

// A still (npm run still): a job nearby reaches a provider's phone, even with the app closed.
export const theme = "qoria";
export const poster = { line: 0, at: "end" } as const;

function Pin(props: { x: number; y: number; color: string; size?: number; rings?: boolean }) {
    const theme = useTheme();
    const s = props.size ?? 56;
    return (
        <div style={{ position: "absolute", left: props.x - s / 2, top: props.y - s * 1.2 }}>
            {props.rings &&
                [1, 2].map((r) => (
                    <div
                        key={r}
                        style={{
                            position: "absolute",
                            left: s / 2 - 30 * r,
                            top: s * 1.2 - 30 * r,
                            width: 60 * r,
                            height: 60 * r,
                            borderRadius: "50%",
                            border: `4px solid ${theme.accent}`,
                            opacity: 0.7 / r,
                        }}
                    />
                ))}
            <svg width={s} height={s * 1.25} viewBox="0 0 40 50" style={{ position: "relative" }}>
                <path
                    d="M20 48 C20 48 4 30 4 18 C4 9 11 2 20 2 C29 2 36 9 36 18 C36 30 20 48 20 48 Z"
                    fill={props.color}
                    stroke={theme.ink}
                    strokeWidth={3}
                />
                <circle cx="20" cy="18" r="6" fill="#fff" />
            </svg>
        </div>
    );
}

export default function JobsComeToYou() {
    const theme = useTheme();
    const type = useType();
    const cx = 430;
    const cy = 400;
    const r = 300;
    return (
        <Stage>
            {/* Left: a paper map of an invented town. */}
            <div style={{ position: "absolute", left: 0, top: -20 }}>
                <Paper
                    seed="map"
                    color="#dfe6d2"
                    style={{ width: 880, height: 840 }}
                    innerStyle={{ position: "relative", overflow: "hidden" }}
                    sway={0}
                >
                    <svg width={880} height={840} style={{ position: "absolute", left: 0, top: 0 }}>
                        <path
                            d="M -20 640 C 200 560 300 720 520 640 C 700 580 760 700 900 660"
                            stroke="#a9c6d6"
                            strokeWidth={46}
                            fill="none"
                        />
                        {[
                            "M 0 220 C 300 200 600 260 880 230",
                            "M 0 480 C 260 470 560 430 880 470",
                            "M 210 0 C 230 300 190 560 240 840",
                            "M 620 0 C 600 280 660 560 640 840",
                        ].map((d) => (
                            <path key={d} d={d} stroke="#f7f6f1" strokeWidth={20} fill="none" />
                        ))}
                        <circle
                            cx={cx}
                            cy={cy + 20}
                            r={r}
                            fill="rgba(255, 79, 26, 0.06)"
                            stroke={theme.accent}
                            strokeWidth={5}
                            strokeDasharray="18 14"
                        />
                    </svg>
                    <div
                        style={{
                            position: "absolute",
                            left: 30,
                            top: 24,
                            ...type.display,
                            fontSize: 40,
                            color: "#4d5a45",
                        }}
                    >
                        Riverside
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: 40,
                            top: cy + 80,
                            ...type.label,
                            fontSize: 36,
                            color: theme.accent,
                            background: "#dfe6d2",
                            padding: "0 8px",
                        }}
                    >
                        25 km
                    </div>
                    <Pin x={300} y={300} color={HONEY} rings />
                    <Pin x={570} y={350} color={HONEY} />
                    <Pin x={360} y={600} color={HONEY} />
                    <Pin x={810} y={110} color="#bdbcb4" />
                    <div
                        style={{
                            position: "absolute",
                            left: 560,
                            top: 120,
                            width: 220,
                            textAlign: "right",
                            ...type.label,
                            fontSize: 30,
                            color: theme.inkSoft,
                            lineHeight: 1.2,
                        }}
                    >
                        outside 25 km · no alert
                    </div>
                    {/* The provider. */}
                    <div
                        style={{
                            position: "absolute",
                            left: cx - 34,
                            top: cy - 14,
                            width: 68,
                            height: 68,
                            borderRadius: 34,
                            background: theme.accent,
                            border: `5px solid ${theme.paper}`,
                            boxShadow: `4px 6px 0 ${theme.shadow}`,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: cx - 60,
                            top: cy + 62,
                            ...type.label,
                            fontSize: 30,
                            background: "#dfe6d2",
                            padding: "0 6px",
                        }}
                    >
                        you
                    </div>
                </Paper>
            </div>

            {/* Right: the lock screen. */}
            <div style={{ position: "absolute", left: 1010, top: -40 }}>
                <Paper
                    seed="phone"
                    color={theme.ink}
                    style={{ width: 470, height: 870 }}
                    innerStyle={{ padding: 14, boxSizing: "border-box" }}
                    roughness={0.3}
                    sway={0}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 30,
                            background: "linear-gradient(170deg, #3d4a5c, #24262d)",
                            padding: "40px 22px",
                            boxSizing: "border-box",
                            color: "#f7f6f1",
                        }}
                    >
                        <div
                            style={{
                                textAlign: "center",
                                fontFamily: "Fraunces",
                                fontWeight: 400,
                                fontSize: 120,
                                lineHeight: 1,
                            }}
                        >
                            12:41
                        </div>
                        <div
                            style={{
                                marginTop: 50,
                                background: "#f7f6f1",
                                color: theme.ink,
                                borderRadius: 22,
                                padding: "18px 22px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <path
                                        d="M16 2 L28 9 V23 L16 30 L4 23 V9 Z"
                                        fill={HONEY}
                                        stroke={theme.ink}
                                        strokeWidth={2.5}
                                    />
                                </svg>
                                <span style={{ ...type.body, fontSize: 28, color: theme.inkSoft }}>
                                    HelpHive · now
                                </span>
                            </div>
                            <div style={{ ...type.display, fontSize: 38, marginTop: 10 }}>
                                New job nearby
                            </div>
                            <div
                                style={{
                                    ...type.body,
                                    fontSize: 30,
                                    marginTop: 6,
                                    lineHeight: 1.3,
                                }}
                            >
                                Room turnover, 6 rooms · Today 14:00 to 17:00 · 3.2 km away
                            </div>
                        </div>
                        <div
                            style={{
                                marginTop: 18,
                                background: "rgba(247, 246, 241, 0.82)",
                                color: theme.ink,
                                borderRadius: 22,
                                padding: "14px 22px",
                            }}
                        >
                            <div style={{ ...type.body, fontSize: 28, color: theme.inkSoft }}>
                                HelpHive · earlier
                            </div>
                            <div style={{ ...type.display, fontSize: 32, marginTop: 4 }}>
                                You&apos;re online
                            </div>
                            <div
                                style={{
                                    ...type.body,
                                    fontSize: 28,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                We&apos;ll notify you when a job is available within 25 km, even
                                with the app closed.
                            </div>
                        </div>
                    </div>
                </Paper>
            </div>
            <div style={{ position: "absolute", left: 1250, top: 730 }}>
                <Tag text="app closed" size={34} seed="app-closed" />
            </div>
        </Stage>
    );
}
