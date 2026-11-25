import React, { type CSSProperties } from "react";
import { Paper, Stage, roughPath, useTheme, useType, type Point } from "../kit";
import { CORAL } from "./shared/pieces";

// A still (npm run still): one frame, drawn statically.
export const theme = "qoria";
export const poster = { line: 0, at: "end" } as const;

function Person(props: { name: string; x: number; y: number; made?: boolean }) {
    const theme = useTheme();
    const type = useType();
    return (
        <div style={{ position: "absolute", left: props.x, top: props.y }}>
            <Paper
                seed={`person-${props.name}-${props.x}`}
                color={props.made ? "#f3e3d6" : theme.paper}
                style={{ width: 340, height: 78 }}
                innerStyle={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "0 20px",
                    boxSizing: "border-box",
                }}
            >
                <svg width="44" height="50" viewBox="0 0 44 50">
                    <circle cx="22" cy="14" r="11" fill={theme.ink} />
                    <path d="M2 50 C2 30 42 30 42 50 Z" fill={props.made ? CORAL : theme.accent} />
                </svg>
                <div
                    style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 32,
                        whiteSpace: "nowrap",
                    }}
                >
                    {props.name}
                </div>
            </Paper>
        </div>
    );
}

function HumanBox(props: { style?: CSSProperties }) {
    const theme = useTheme();
    const type = useType();
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                border: `3px solid ${theme.inkSoft}`,
                borderRadius: 10,
                padding: "10px 18px",
                background: "#fbfaf6",
                whiteSpace: "nowrap",
                ...type.body,
                fontSize: 30,
                ...props.style,
            }}
        >
            <div
                style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    border: `3px solid ${theme.ink}`,
                    borderRadius: 6,
                    background: "#fff",
                }}
            />
            I&apos;m human
        </div>
    );
}

function Page(props: {
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
    step?: string;
    children?: React.ReactNode;
}) {
    const theme = useTheme();
    const type = useType();
    return (
        <div style={{ position: "absolute", left: props.x, top: props.y }}>
            <Paper
                seed={`page-${props.title}-${props.x}-${props.y}`}
                style={{ width: props.w, height: props.h }}
                innerStyle={{ padding: "18px 26px", boxSizing: "border-box" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {props.step && (
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                background: theme.ink,
                                color: theme.paper,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                ...type.display,
                                fontSize: 28,
                            }}
                        >
                            {props.step}
                        </div>
                    )}
                    <div style={{ ...type.display, fontSize: 38 }}>{props.title}</div>
                </div>
                {props.children}
            </Paper>
        </div>
    );
}

function Line(props: {
    pts: Point[];
    color: string;
    dashed?: boolean;
    seed: string;
    width?: number;
}) {
    const d = props.pts
        .slice(1)
        .map((p, i) => roughPath(props.pts[i], p, `${props.seed}${i}`, 3, 0.03))
        .map((seg, i) => (i === 0 ? seg : seg.replace(/^M/, "L")))
        .join(" ");
    const end = props.pts[props.pts.length - 1];
    const prev = props.pts[props.pts.length - 2];
    const a = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
    const head = (da: number) =>
        `${end[0] - Math.cos(a + da) * 22} ${end[1] - Math.sin(a + da) * 22}`;
    return (
        <g>
            <path
                d={d}
                fill="none"
                stroke={props.color}
                strokeWidth={props.width ?? 6}
                strokeLinecap="round"
                strokeDasharray={props.dashed ? "16 14" : undefined}
            />
            <path
                d={`M ${head(0.5)} L ${end[0]} ${end[1]} L ${head(-0.5)}`}
                fill="none"
                stroke={props.color}
                strokeWidth={props.width ?? 6}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
    );
}

export default function RobotCheckOwnPage() {
    const theme = useTheme();
    const type = useType();
    const head = (x: number, text: string, mark: string, color: string, dim?: boolean) => (
        <div
            style={{
                position: "absolute",
                left: x,
                top: -40,
                ...type.display,
                fontSize: 50,
                color: dim ? theme.inkSoft : theme.ink,
                whiteSpace: "nowrap",
            }}
        >
            <span style={{ color }}>{mark}</span> {text}
        </div>
    );
    return (
        <Stage>
            {head(20, "Check on the name page", "✗", CORAL, true)}
            {head(850, "Check on its own page", "✓", theme.accent)}
            <svg width={10} height={820} style={{ position: "absolute", left: 795, top: -30 }}>
                <path
                    d={roughPath([5, 0], [5, 800], "rule", 2, 0.005)}
                    stroke={theme.ink}
                    strokeWidth={3}
                />
            </svg>

            {/* Left: greyed. The made-up name skips the check, and that difference gives it away. */}
            <div
                style={{ position: "absolute", inset: 0, filter: "saturate(0.35)", opacity: 0.88 }}
            >
                <svg width={800} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                    <Line
                        pts={[
                            [175, 150],
                            [175, 330],
                            [170, 548],
                        ]}
                        color={theme.ink}
                        seed="lr"
                    />
                    <Line
                        pts={[
                            [545, 150],
                            [740, 300],
                            [740, 470],
                            [560, 548],
                        ]}
                        color={CORAL}
                        dashed
                        seed="ln"
                    />
                </svg>
                <Person name="rowan" x={30} y={70} />
                <Person name="not-a-user" x={390} y={70} made />
                <Page title="Username + human check" x={20} y={200} w={680} h={250}>
                    <div
                        style={{
                            marginTop: 18,
                            border: `3px solid ${theme.inkSoft}`,
                            borderRadius: 10,
                            padding: "8px 16px",
                            width: 380,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 30,
                            background: "#fbfaf6",
                        }}
                    >
                        username
                    </div>
                    <HumanBox style={{ marginTop: 18, width: 260 }} />
                </Page>
                <Page title="Password / passkey" x={20} y={560} w={330} h={110} />
                <Page title="A different page" x={410} y={560} w={330} h={110} />
            </div>
            <svg width={200} height={200} style={{ position: "absolute", left: 600, top: 440 }}>
                <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="rgba(255,255,255,0.35)"
                    stroke={CORAL}
                    strokeWidth={12}
                />
                <path d="M108 108 L160 160" stroke={CORAL} strokeWidth={18} strokeLinecap="round" />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: 700,
                    width: 760,
                    ...type.label,
                    fontSize: 38,
                    color: CORAL,
                }}
            >
                The skip tells you the name isn&apos;t real.
            </div>

            {/* Right: every name walks the same three pages. */}
            <svg width={800} height={800} style={{ position: "absolute", left: 800, top: 0 }}>
                <Line
                    pts={[
                        [190, 150],
                        [190, 600],
                    ]}
                    color={theme.ink}
                    seed="rr"
                />
                <Line
                    pts={[
                        [560, 150],
                        [560, 600],
                    ]}
                    color={theme.accent}
                    seed="rn"
                />
            </svg>
            <Person name="rowan" x={845} y={70} />
            <Person name="not-a-user" x={1225} y={70} made />
            <Page title="Username" step="1" x={850} y={190} w={730} h={110} />
            <Page title="Human check" step="2" x={850} y={340} w={730} h={130}>
                <HumanBox
                    style={{ position: "absolute", right: 30, top: 34, width: 220, fontSize: 28 }}
                />
            </Page>
            <Page title="Password / passkey" step="3" x={850} y={510} w={730} h={110} />
            <div
                style={{
                    position: "absolute",
                    left: 850,
                    top: 660,
                    width: 740,
                    ...type.label,
                    fontSize: 38,
                    color: theme.accent,
                    lineHeight: 1.25,
                }}
            >
                Same check, same response. Nothing tells you which names exist.
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 790,
                    width: 1600,
                    textAlign: "center",
                    ...type.body,
                    fontSize: 36,
                    color: theme.ink,
                }}
            >
                Every sign-in ends in a second factor. Passkeys first.
            </div>
        </Stage>
    );
}
