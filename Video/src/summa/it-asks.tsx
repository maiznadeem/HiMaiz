import React from "react";
import { Paper, Stage, useTheme, useType } from "../kit";
import { CORAL, CREAM } from "./shared/pieces";

// A still (npm run still): when Summa is unsure about an email, it asks.
export const theme = "qoria";
export const poster = { line: 0, at: "end" } as const;

const ANSWERS = [
    ["Money moved", "A payment, transfer, refund, bill, or receipt."],
    [
        "About money, nothing moved",
        "A notice, statement ready, dispute, report, or service update.",
    ],
    ["Not about money", "Newsletters, promotions, and codes."],
];

export default function ItAsks() {
    const theme = useTheme();
    const type = useType();
    return (
        <Stage>
            <div style={{ position: "absolute", left: 1330, top: -20 }}>
                <Paper
                    seed="counter"
                    color={CORAL}
                    style={{ width: 240, height: 76 }}
                    innerStyle={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fffaf2",
                        ...type.display,
                        fontSize: 36,
                    }}
                >
                    3 to review
                </Paper>
            </div>
            <div style={{ position: "absolute", left: 470, top: -20 }}>
                <Paper
                    seed="review-card"
                    color={CREAM}
                    style={{ width: 660, height: 860 }}
                    innerStyle={{ padding: "34px 40px", boxSizing: "border-box" }}
                    sway={0}
                    lift={1.3}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                background: CORAL,
                                color: "#fffaf2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                ...type.display,
                                fontSize: 32,
                            }}
                        >
                            F
                        </div>
                        <div style={{ ...type.display, fontSize: 34 }}>Fenwick Studio Payroll</div>
                    </div>
                    <div style={{ ...type.body, fontSize: 32, marginTop: 18 }}>
                        Your March payslip is ready
                    </div>
                    <div
                        style={{
                            ...type.body,
                            fontSize: 28,
                            color: "#9a958a",
                            marginTop: 8,
                            lineHeight: 1.35,
                        }}
                    >
                        Hi Rowan, your payslip for March is attached…
                    </div>
                    <div style={{ height: 3, background: "#e9d9c4", margin: "26px 0" }} />
                    <div style={{ ...type.display, fontSize: 48 }}>What is this email?</div>
                    {ANSWERS.map(([label, detail], i) => (
                        <div
                            key={label}
                            style={{
                                marginTop: 20,
                                padding: "16px 24px",
                                borderRadius: 16,
                                background: "#ffffff",
                                border: "3px solid #e9d9c4",
                            }}
                        >
                            <div style={{ ...type.display, fontSize: 34, color: theme.ink }}>
                                {label}
                            </div>
                            <div
                                style={{
                                    ...type.body,
                                    fontSize: 28,
                                    color: theme.inkSoft,
                                    marginTop: 4,
                                    lineHeight: 1.3,
                                }}
                            >
                                {detail}
                            </div>
                        </div>
                    ))}
                </Paper>
            </div>
        </Stage>
    );
}
