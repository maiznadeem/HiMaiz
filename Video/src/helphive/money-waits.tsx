import React from "react";
import { Paper, Stage, useTheme, useType } from "../kit";
import { GOOD, HONEY, MONO } from "./shared/pieces";

// A still (npm run still): the admin console holds a new provider's payout until it is reviewed.
export const theme = "qoria";
export const poster = { line: 0, at: "end" } as const;

export default function MoneyWaits() {
    const theme = useTheme();
    const type = useType();
    const cell = { ...type.body, fontSize: 30 } as const;
    const head = { ...type.label, fontSize: 28, color: theme.inkSoft } as const;
    const pill = (text: string, bg: string, color: string) => (
        <span
            style={{
                background: bg,
                color,
                borderRadius: 20,
                padding: "4px 16px",
                ...type.display,
                fontSize: 28,
                whiteSpace: "nowrap",
            }}
        >
            {text}
        </span>
    );
    const cols = "170px 190px 180px 1fr";
    return (
        <Stage>
            <div style={{ position: "absolute", left: 0, top: -40 }}>
                <Paper
                    seed="console"
                    style={{ width: 1600, height: 860 }}
                    innerStyle={{
                        boxSizing: "border-box",
                        position: "relative",
                        overflow: "hidden",
                    }}
                    sway={0}
                >
                    <div
                        style={{
                            background: theme.ink,
                            color: theme.paper,
                            padding: "16px 30px",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            ...type.display,
                            fontSize: 34,
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 32 32">
                            <path d="M16 2 L28 9 V23 L16 30 L4 23 V9 Z" fill={HONEY} />
                        </svg>
                        Admin · Bookings
                        <span
                            style={{
                                marginLeft: "auto",
                                background: theme.accent,
                                color: "#fffaf2",
                                borderRadius: 8,
                                padding: "2px 16px",
                                ...type.label,
                                fontSize: 28,
                            }}
                        >
                            demo data
                        </span>
                    </div>
                    {/* The bookings table. */}
                    <div style={{ position: "absolute", left: 30, top: 110, width: 920 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: cols,
                                ...head,
                                padding: "0 0 12px",
                            }}
                        >
                            <span>Booking</span>
                            <span>Status</span>
                            <span>Provider</span>
                            <span>Payout</span>
                        </div>
                        {[
                            {
                                id: "HH-0998",
                                who: "Sana R.",
                                pay: pill("72.00 · released", "#d6e8cf", GOOD),
                                note: "",
                            },
                            {
                                id: "HH-1019",
                                who: "Imran K.",
                                pay: pill("held", "#fbe3a6", "#7a5a0c"),
                                note: "rule: new provider, first 3 jobs reviewed",
                            },
                        ].map((r) => (
                            <div
                                key={r.id}
                                style={{
                                    borderTop: `3px solid ${theme.paperAlt}`,
                                    padding: "22px 0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: cols,
                                        alignItems: "center",
                                        ...cell,
                                    }}
                                >
                                    <span style={{ fontFamily: MONO, fontSize: 28 }}>{r.id}</span>
                                    <span>Completed</span>
                                    <span>{r.who}</span>
                                    <span>{r.pay}</span>
                                </div>
                                {r.note && (
                                    <div
                                        style={{
                                            ...type.label,
                                            fontSize: 30,
                                            color: "#7a5a0c",
                                            marginTop: 12,
                                            marginLeft: 540,
                                        }}
                                    >
                                        {r.note}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* The rule drawer. */}
                    <div
                        style={{
                            position: "absolute",
                            left: 990,
                            top: 72,
                            bottom: 0,
                            right: 0,
                            background: "#efede6",
                            borderLeft: `3px solid ${theme.paperAlt}`,
                            padding: "34px 34px",
                            boxSizing: "border-box",
                        }}
                    >
                        <div style={head}>Risk rule</div>
                        <div
                            style={{
                                ...type.display,
                                fontSize: 40,
                                marginTop: 10,
                                lineHeight: 1.15,
                            }}
                        >
                            Review payouts for a provider&apos;s first 3 jobs
                        </div>
                        <div
                            style={{
                                marginTop: 34,
                                display: "inline-block",
                                border: `3px solid ${theme.ink}`,
                                borderRadius: 12,
                                padding: "10px 22px",
                                ...type.display,
                                fontSize: 30,
                                background: theme.paper,
                            }}
                        >
                            Test against past bookings
                        </div>
                        <div
                            style={{
                                marginTop: 30,
                                padding: "18px 22px",
                                borderRadius: 12,
                                background: "#fbe3a6",
                                ...type.body,
                                fontSize: 32,
                                lineHeight: 1.25,
                            }}
                        >
                            Would have held <b>4 of 212</b> past payouts
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                left: 34,
                                right: 34,
                                bottom: 40,
                                borderTop: `3px solid ${theme.paperAlt}`,
                                paddingTop: 16,
                                ...type.body,
                                fontSize: 28,
                                color: theme.inkSoft,
                            }}
                        >
                            Processor risk score: normal · recorded only
                        </div>
                    </div>
                </Paper>
            </div>
        </Stage>
    );
}
