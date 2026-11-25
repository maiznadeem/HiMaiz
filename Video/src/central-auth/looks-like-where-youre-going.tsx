import React from "react";
import { Paper, Stage, roughPath, useTheme, useType } from "../kit";
import { APPS, AppIcon, type App } from "./shared/pieces";

// A still (npm run still): the same sign-in step, dressed as the app you came from.
export const theme = "qoria";
export const poster = { line: 0, at: "end" } as const;

function Phone(props: {
    app: App;
    x: number;
    y: number;
    rot: number;
    passkey?: boolean;
    z: number;
}) {
    const theme = useTheme();
    const type = useType();
    const { app } = props;
    return (
        <div
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                transform: `rotate(${props.rot}deg)`,
                zIndex: props.z,
            }}
        >
            <Paper
                seed={`phone-${app.name}`}
                color={theme.ink}
                style={{ width: 400, height: 720 }}
                innerStyle={{ padding: 14, boxSizing: "border-box" }}
                roughness={0.3}
            >
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 26,
                        background: app.bg,
                        padding: "40px 34px",
                        boxSizing: "border-box",
                        color: app.ink,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <AppIcon app={app} size={60} />
                        <div style={{ ...type.display, fontSize: 40 }}>{app.name}</div>
                    </div>
                    {!props.passkey ? (
                        <>
                            <div style={{ ...type.display, fontSize: 44, marginTop: 70 }}>
                                Sign in to {app.name}
                            </div>
                            <div style={{ ...type.body, fontSize: 30, marginTop: 40 }}>
                                Username
                            </div>
                            <div
                                style={{
                                    marginTop: 10,
                                    border: `3px solid ${app.ink}`,
                                    borderRadius: 12,
                                    padding: "12px 18px",
                                    background: "#ffffff",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 32,
                                    color: "#191919",
                                }}
                            >
                                rowan
                            </div>
                            <div
                                style={{
                                    marginTop: "auto",
                                    background: app.ink,
                                    color: app.bg,
                                    borderRadius: 14,
                                    textAlign: "center",
                                    padding: "16px 0",
                                    ...type.display,
                                    fontSize: 34,
                                }}
                            >
                                Continue
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ ...type.display, fontSize: 44, marginTop: 70 }}>
                                Use your Laptop passkey
                            </div>
                            <svg
                                width="150"
                                height="150"
                                viewBox="0 0 60 60"
                                style={{ margin: "40px auto 0" }}
                            >
                                {[8, 14, 20, 26].map((r) => (
                                    <path
                                        key={r}
                                        d={`M ${30 - r} ${36} C ${30 - r} ${36 - r * 1.4} ${30 + r} ${36 - r * 1.4} ${30 + r} ${36}`}
                                        fill="none"
                                        stroke={app.ink}
                                        strokeWidth="3.2"
                                        strokeLinecap="round"
                                    />
                                ))}
                                <path
                                    d="M30 30 V54 M22 38 V52 M38 38 V50"
                                    stroke={app.ink}
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div
                                style={{
                                    marginTop: "auto",
                                    textAlign: "center",
                                    ...type.body,
                                    fontSize: 30,
                                    textDecoration: "underline",
                                }}
                            >
                                Use another method
                            </div>
                        </>
                    )}
                </div>
            </Paper>
        </div>
    );
}

export default function LooksLikeWhereYoureGoing() {
    const theme = useTheme();
    const type = useType();
    return (
        <Stage>
            <Phone app={APPS[0]} x={10} y={50} rot={-6} z={1} />
            <Phone app={APPS[1]} x={360} y={20} rot={-1} z={2} />
            <Phone app={APPS[2]} x={710} y={50} rot={5} passkey z={3} />
            <div
                style={{
                    position: "absolute",
                    left: 1240,
                    top: 20,
                    width: 360,
                    ...type.display,
                    fontSize: 54,
                    lineHeight: 1.1,
                }}
            >
                One sign-in, dressed as each app.
            </div>
            <svg width={600} height={400} style={{ position: "absolute", left: 1100, top: 260 }}>
                <path
                    d={roughPath([60, 60], [230, 230], "arrow", 4, 0.12)}
                    fill="none"
                    stroke={theme.ink}
                    strokeWidth={6}
                    strokeLinecap="round"
                />
                <path
                    d="M 206 236 L 232 232 L 228 206"
                    fill="none"
                    stroke={theme.ink}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 1260,
                    top: 270,
                    width: 340,
                    ...type.label,
                    fontSize: 36,
                    color: theme.accent,
                }}
            >
                unknown step? hand over here
            </div>
            <div style={{ position: "absolute", left: 1290, top: 500, transform: "rotate(3deg)" }}>
                <Paper
                    seed="builtin"
                    color="#d4d3cc"
                    style={{ width: 290, height: 250 }}
                    innerStyle={{ padding: "22px 26px", boxSizing: "border-box" }}
                >
                    <div style={{ ...type.label, fontSize: 32, color: theme.ink }}>
                        built-in page
                    </div>
                    {[0.9, 0.7, 0.8, 0.5].map((w, i) => (
                        <div
                            key={i}
                            style={{
                                height: 14,
                                width: `${w * 100}%`,
                                background: "#b4b3ab",
                                borderRadius: 7,
                                marginTop: 22,
                            }}
                        />
                    ))}
                </Paper>
            </div>
        </Stage>
    );
}
