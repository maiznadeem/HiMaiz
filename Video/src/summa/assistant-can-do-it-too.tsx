import React from "react";
import { Paper, Stage, roughPath, useTheme, useType } from "../kit";
import { CORAL, CREAM, MONO } from "./shared/pieces";

// A still (npm run still): an assistant uses Summa's tools, and a test keeps the tools complete.
export const theme = "qoria";
export const poster = { line: 0, at: "end" } as const;

function Bubble(props: { who: "you" | "assistant"; children: React.ReactNode }) {
    const theme = useTheme();
    const type = useType();
    const mine = props.who === "you";
    return (
        <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
            <div
                style={{
                    maxWidth: 560,
                    background: mine ? CORAL : "#ffffff",
                    color: mine ? "#fffaf2" : theme.ink,
                    border: mine ? undefined : `3px solid #e9d9c4`,
                    borderRadius: 22,
                    padding: "18px 26px",
                    ...type.body,
                    fontSize: 34,
                    lineHeight: 1.3,
                }}
            >
                {props.children}
            </div>
        </div>
    );
}

export default function AssistantCanDoItToo() {
    const theme = useTheme();
    const type = useType();
    const run = (ok: boolean) => (
        <div style={{ fontFamily: MONO, fontSize: 30, lineHeight: 1.45, whiteSpace: "pre" }}>
            <div style={{ color: "#bdbcb4" }}>$ npm test</div>
            <div style={{ color: ok ? "#9fd48c" : "#ff8a73" }}>
                {ok ? "✓ every app action maps to a tool" : "✗ every app action maps to a tool:"}
            </div>
            {!ok && <div style={{ color: "#ff8a73" }}>{"  splitTransaction is not mapped"}</div>}
        </div>
    );
    return (
        <Stage>
            {/* Left: the assistant chat, Summa's coral on cream. */}
            <div style={{ position: "absolute", left: 0, top: 60 }}>
                <Paper
                    seed="chat"
                    color={CREAM}
                    style={{ width: 760, height: 640 }}
                    innerStyle={{ padding: "30px 34px", boxSizing: "border-box" }}
                    sway={0}
                >
                    <div
                        style={{
                            ...type.label,
                            fontSize: 32,
                            color: theme.inkSoft,
                            marginBottom: 150,
                        }}
                    >
                        Assistant
                    </div>
                    <Bubble who="you">
                        Put the Lantern Café charge on 6 Mar under Eating out.
                    </Bubble>
                    <div style={{ margin: "22px 0", display: "flex", justifyContent: "center" }}>
                        <div
                            style={{
                                fontFamily: MONO,
                                fontSize: 28,
                                padding: "8px 18px",
                                borderRadius: 30,
                                border: `3px solid ${CORAL}`,
                                color: CORAL,
                                background: "#fff",
                            }}
                        >
                            ⚙ categorize_transaction
                        </div>
                    </div>
                    <Bubble who="assistant">
                        Done. Lantern Café, 6 Mar, −8.90, now under Eating out.
                    </Bubble>
                </Paper>
            </div>
            {/* The consent screen, pinned at the corner like a note. */}
            <div
                style={{
                    position: "absolute",
                    left: 470,
                    top: -30,
                    transform: "rotate(4deg)",
                    zIndex: 2,
                }}
            >
                <Paper
                    seed="consent"
                    style={{ width: 380, height: 210 }}
                    innerStyle={{ padding: "22px 26px", boxSizing: "border-box" }}
                    lift={1.3}
                >
                    <div style={{ ...type.body, fontSize: 30, lineHeight: 1.25 }}>
                        An assistant wants to use Summa. Allow?
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
                        <div
                            style={{
                                background: CORAL,
                                color: "#fffaf2",
                                borderRadius: 12,
                                padding: "8px 26px",
                                ...type.display,
                                fontSize: 30,
                            }}
                        >
                            Allow
                        </div>
                        <div
                            style={{
                                border: `3px solid ${theme.ink}`,
                                borderRadius: 12,
                                padding: "6px 26px",
                                ...type.display,
                                fontSize: 30,
                            }}
                        >
                            Deny
                        </div>
                    </div>
                </Paper>
                <div
                    style={{
                        position: "absolute",
                        left: 170,
                        top: -14,
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        background: theme.accent,
                        boxShadow: `3px 4px 0 ${theme.shadow}`,
                    }}
                />
            </div>

            {/* Right: the test runner, before and after. */}
            <div style={{ position: "absolute", left: 840, top: 60 }}>
                <Paper
                    seed="runner"
                    color="#23221f"
                    style={{ width: 760, height: 640 }}
                    innerStyle={{ padding: "30px 34px", boxSizing: "border-box" }}
                    sway={0}
                >
                    <div
                        style={{ ...type.label, fontSize: 32, color: "#bdbcb4", marginBottom: 20 }}
                    >
                        tests
                    </div>
                    {run(false)}
                    <div style={{ height: 210 }} />
                    {run(true)}
                </Paper>
            </div>
            <svg width={300} height={200} style={{ position: "absolute", left: 1000, top: 330 }}>
                <path
                    d={roughPath([40, 10], [40, 128], "fix-arrow", 3, 0.1)}
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth={6}
                    strokeLinecap="round"
                />
                <path
                    d="M 24 108 L 40 130 L 58 108"
                    fill="none"
                    stroke={theme.accent}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 1080,
                    top: 380,
                    fontFamily: MONO,
                    fontSize: 30,
                    color: theme.accent,
                }}
            >
                added split_transaction
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 750,
                    width: 1600,
                    textAlign: "center",
                    ...type.display,
                    fontSize: 46,
                }}
            >
                60 tools <span style={{ color: theme.accent }}>·</span> one test keeps them complete
            </div>
        </Stage>
    );
}
