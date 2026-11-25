// Qoria: how I work. The loop of directing coding agents, and the test suite and deploys that made the
// loop fast enough.
import React from "react";
import { Shot, Stage, useTheme, type Cue } from "../kit";
import {
    AppServer,
    At,
    Card,
    Ink,
    Label,
    lerp,
    mix,
    Person,
    pop,
    Robot,
    Stamp,
    useCue,
    useRamp,
    useSeconds,
} from "./shared-b/pieces";

export const theme = "qoria";
export const poster: Cue = { line: 13, at: "end" };

const C = { x: 470, y: 400, r: 250 };
const deg = (a: number) => (a * Math.PI) / 180;
const onLoop = (a: number): [number, number] => [
    C.x + C.r * Math.cos(deg(a)),
    C.y + C.r * Math.sin(deg(a)),
];
// The four cards, going round the loop: top, left, bottom, right.
const CARDS = [
    { name: "goal and rules", a: -90 },
    { name: "plan", a: 180 },
    { name: "build", a: 90 },
    { name: "review", a: 0 },
];
const GATE_A = 30;
const PANEL = { x: 1230 };

function LoopCard(props: { name: string; a: number; p: number; hl?: boolean }) {
    const theme = useTheme();
    const [x, y] = onLoop(props.a);
    return (
        <At x={x} y={y} scale={pop(props.p)}>
            <Card
                w={250}
                h={84}
                color={props.hl ? mix(theme.paper, theme.accent, 0.18) : theme.paper}
            >
                <Label size={34} style={{ textAlign: "center", paddingTop: 18 }}>
                    {props.name}
                </Label>
            </Card>
        </At>
    );
}

/** The loop: ring, cards, me in the middle, the agents, the tests gate and the requests going round. */
function Loop() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const cue = useCue();
    const ring = r(1, 0.9);
    const gate = pop(r({ line: 6, at: 0.35 }, 0.5));
    const stallFrom = cue({ line: 6, at: 0.55 });
    const flowAgain = cue({ line: 11, at: 0.45 });
    // Requests going round the loop, from line 6.
    const dots: React.ReactNode[] = [];
    if (t > cue(6)) {
        const n = 8;
        for (let k = 0; k < n; k++) {
            let a: number;
            if (t < stallFrom) {
                a = -90 - (k * 360) / n - (t - cue(6)) * 110;
            } else if (t < flowAgain) {
                // Stalled: the requests bunch up behind the tests gate.
                const queued = k < 5;
                a = queued
                    ? 90 - 0 + (k - 4) * -9 + -36
                    : -90 - (k * 360) / n - (stallFrom - cue(6)) * 110 - (t - stallFrom) * 6;
                if (queued) a = GATE_A + 5 + (4 - k) * 7;
            } else {
                a = -90 - (k * 360) / n - (t - flowAgain) * 170;
            }
            const [x, y] = onLoop(a);
            dots.push(
                <div
                    key={k}
                    style={{
                        position: "absolute",
                        left: x - 12,
                        top: y - 12,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        background: t >= stallFrom && t < flowAgain ? theme.accent : theme.ink,
                    }}
                />,
            );
        }
    }
    const [gx, gy] = onLoop(GATE_A);
    const gateLabel = t >= cue({ line: 11, at: 0.6 }) ? "tests: 91 s" : "tests";
    return (
        <>
            <svg
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
                width={1}
                height={1}
            >
                <circle
                    cx={C.x}
                    cy={C.y}
                    r={C.r}
                    fill="none"
                    stroke={theme.ink}
                    strokeWidth={6}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - ring}
                    transform={`rotate(-90 ${C.x} ${C.y}) scale(1 -1) translate(0 ${-2 * C.y})`}
                />
                {ring > 0.95 &&
                    [-135, 135, -45].map((a) => {
                        // Arrowheads pointing the way round (counter-clockwise on screen).
                        const [x, y] = onLoop(a);
                        const tang = deg(a - 90);
                        const back = (s: number) =>
                            `M ${x} ${y} L ${x - Math.cos(tang + s * 0.5) * 24} ${y - Math.sin(tang + s * 0.5) * 24}`;
                        return (
                            <path
                                key={a}
                                d={`${back(1)} ${back(-1)}`}
                                stroke={theme.ink}
                                strokeWidth={6}
                                strokeLinecap="round"
                                fill="none"
                            />
                        );
                    })}
            </svg>
            {dots}
            {CARDS.map((c, i) => (
                <LoopCard
                    key={c.name}
                    name={c.name}
                    a={c.a}
                    p={r({ line: 1, at: 0.15 + i * 0.15 }, 0.5)}
                />
            ))}
            {gate > 0 && (
                <At x={gx} y={gy} scale={gate} rotate={-45}>
                    <div
                        style={{
                            width: 120,
                            height: 30,
                            background: theme.paperAlt,
                            border: `5px solid ${theme.ink}`,
                            borderRadius: 6,
                        }}
                    />
                </At>
            )}
            {gate > 0 && (
                <Label
                    display
                    size={38}
                    style={{ position: "absolute", left: gx + 50, top: gy + 30, opacity: gate }}
                >
                    {gateLabel}
                </Label>
            )}
        </>
    );
}

function Team() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const others = 1 - r({ line: 1, delay: 0.1 }, 0.6);
    const robots = [0, 1, 2, 3, 4];
    return (
        <>
            <At x={C.x - 110} y={C.y + 10} scale={pop(r(0, 0.5))} opacity={others}>
                <Person size={64} />
            </At>
            <At
                x={C.x + 110}
                y={C.y + 10}
                scale={pop(r({ line: 0, delay: 0.1 }, 0.5))}
                opacity={others}
            >
                <Person size={64} />
            </At>
            <At x={C.x} y={C.y - 10} scale={pop(r({ line: 0, delay: 0.2 }, 0.5))}>
                <Person size={82} highlight />
            </At>
            <Label
                size={34}
                style={{
                    position: "absolute",
                    left: C.x,
                    top: C.y + 70,
                    transform: "translateX(-50%)",
                }}
            >
                me
            </Label>
            {robots.map((i) => {
                const p = r({ line: 0, at: 0.35 + i * 0.08 }, 0.6);
                const toBuild = r({ line: 1, at: 0.55 }, 0.8);
                const ang = -150 + i * 30;
                const sx = C.x + Math.cos(deg(ang)) * 900;
                const sy = C.y + Math.sin(deg(ang)) * 900;
                const ax = C.x + Math.cos(deg(-170 + i * 40)) * 120;
                const ay = C.y + Math.sin(deg(-170 + i * 40)) * 120;
                const [bx, by] = onLoop(90);
                const tx = bx - 120 + i * 60;
                const ty = by + 100;
                const x = lerp(lerp(sx, ax, p), tx, toBuild);
                const y = lerp(lerp(sy, ay, p), ty, toBuild);
                const bob = Math.sin(t * 5 + i) * 3;
                return (
                    <At
                        key={i}
                        x={x}
                        y={y + bob}
                        scale={toBuild > 0 ? lerp(1, 0.75, toBuild) : 1}
                        opacity={p > 0 ? 1 : 0}
                    >
                        <Robot size={56} color={mix(theme.paperAlt, theme.second, 0.25)} />
                    </At>
                );
            })}
            <Label
                display
                size={46}
                style={{
                    position: "absolute",
                    left: 960,
                    top: 340,
                    opacity: r({ line: 0, at: 0.5 }, 0.5) * others,
                }}
            >
                a small team, and coding agents
            </Label>
        </>
    );
}

const SHEETS = ["code", "load-test tools", "reports"];

function Sheets() {
    const theme = useTheme();
    const r = useRamp();
    const [bx, by] = onLoop(90);
    const [rx, ry] = onLoop(0);
    return (
        <>
            {SHEETS.map((s, i) => {
                const out = pop(r({ line: 2, at: 0.25 + i * 0.22 }, 0.5));
                const go = r({ line: 3, at: 0.0 + i * 0.08 }, 0.6);
                const sx = bx + 210 + i * 0;
                const sy = by - 30 - i * 6;
                const px = 980 + i * 0;
                const py = 220 + i * 150;
                const reviewX = rx + 290;
                const reviewY = ry - 120 + i * 120;
                const back = i === 2 ? r({ line: 3, at: 0.8 }, 0.7) : 0;
                let x = lerp(lerp(sx, px, Math.min(1, out)), reviewX, go);
                let y = lerp(lerp(sy, py, Math.min(1, out)), reviewY, go);
                x = lerp(x, bx + 40, back);
                y = lerp(y, by - 20, back);
                const stamp = i === 2 ? "no-go" : "go";
                const sp = r({ line: 3, at: 0.35 + i * 0.12 }, 0.4);
                return (
                    <At
                        key={s}
                        x={x}
                        y={y}
                        scale={out > 0 ? out * (1 - back * 0.5) : 0}
                        opacity={1 - back * 0.8}
                    >
                        <div style={{ position: "relative" }}>
                            <Card w={300} h={100}>
                                <Label size={36} style={{ textAlign: "center", paddingTop: 24 }}>
                                    {s}
                                </Label>
                            </Card>
                            <div style={{ position: "absolute", left: 180, top: -30 }}>
                                <Stamp
                                    text={stamp}
                                    p={sp}
                                    size={40}
                                    color={stamp === "go" ? theme.second : theme.accent}
                                />
                            </div>
                        </div>
                    </At>
                );
            })}
        </>
    );
}

function Binder() {
    const theme = useTheme();
    const r = useRamp();
    const fill = r({ line: 4, at: 0.3 }, { line: 4, at: "end" });
    const n = Math.round(60 * fill);
    return (
        <At x={PANEL.x} y={380} scale={pop(r({ line: 4 }, 0.5))}>
            <div style={{ position: "relative", width: 420, height: 440 }}>
                <Card w={420} h={440} color={theme.second} />
                <div style={{ position: "absolute", left: 40, top: 40, width: 340, height: 360 }}>
                    {Array.from({ length: 60 }, (_, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: (i % 3) * 3,
                                bottom: i * 5.6,
                                width: 330,
                                height: 4,
                                background: theme.paper,
                                opacity: i < n ? 1 : 0,
                            }}
                        />
                    ))}
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 150,
                        textAlign: "center",
                    }}
                >
                    <Card w={300} h={130} style={{ margin: "0 auto" }}>
                        <Label display size={80} style={{ textAlign: "center" }}>
                            {n}
                        </Label>
                    </Card>
                </div>
                <Label size={36} style={{ marginTop: 18, textAlign: "center" }}>
                    decision records
                </Label>
            </div>
        </At>
    );
}

function Commits() {
    const theme = useTheme();
    const r = useRamp();
    const grow = r({ line: 5, at: 0.05 }, { line: 5, at: 0.45 });
    const mark = r({ line: 5, at: 0.5 }, { line: 5, at: "end" });
    const cols = 22;
    const rows = 9;
    const total = cols * rows;
    const co = Math.round((total * 1503) / 2782);
    // A fixed, spread-out choice of which squares are co-written.
    const order = Array.from({ length: total }, (_, i) => (i * 97) % total);
    const coSet = new Set(order.slice(0, co));
    return (
        <div style={{ position: "absolute", left: 900, top: 120 }}>
            <Label display size={50} style={{ opacity: grow }}>
                2,782 commits
            </Label>
            <div
                style={{ position: "relative", marginTop: 20, width: cols * 30, height: rows * 30 }}
            >
                {Array.from({ length: total }, (_, i) => {
                    const shown = i < grow * total;
                    const isCo = coSet.has(i) && order.indexOf(i) < mark * co;
                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: (i % cols) * 30,
                                top: Math.floor(i / cols) * 30,
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                background: isCo ? theme.second : theme.paper,
                                border: `3px solid ${theme.ink}`,
                                boxSizing: "border-box",
                                opacity: shown ? 1 : 0,
                            }}
                        />
                    );
                })}
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 26,
                    opacity: mark,
                }}
            >
                <div
                    style={{
                        width: 30,
                        height: 30,
                        background: theme.second,
                        borderRadius: 4,
                        border: `3px solid ${theme.ink}`,
                    }}
                />
                <Label display size={46} color={theme.ink}>
                    {Math.round(1503 * mark).toLocaleString("en-US")} co-written with an agent
                </Label>
            </div>
        </div>
    );
}

function Clock(props: { minutes: number; label: string; size?: number; color?: string }) {
    const theme = useTheme();
    const s = props.size ?? 300;
    const a = deg((props.minutes / 60) * 360 - 90);
    const c = s / 2;
    return (
        <div style={{ position: "relative", width: s, textAlign: "center" }}>
            <svg width={s} height={s} style={{ overflow: "visible" }}>
                <circle
                    cx={c}
                    cy={c}
                    r={c - 6}
                    fill={theme.paper}
                    stroke={theme.ink}
                    strokeWidth={7}
                />
                {props.minutes > 0 && (
                    <path
                        d={`M ${c} ${c} L ${c} 10 A ${c - 10} ${c - 10} 0 ${props.minutes > 30 ? 1 : 0} 1 ${c + Math.cos(a) * (c - 10)} ${c + Math.sin(a) * (c - 10)} Z`}
                        fill={props.color ?? theme.accent}
                        opacity={0.35}
                    />
                )}
                {Array.from({ length: 12 }, (_, i) => {
                    const ta = deg(i * 30);
                    return (
                        <path
                            key={i}
                            d={`M ${c + Math.cos(ta) * (c - 22)} ${c + Math.sin(ta) * (c - 22)} L ${c + Math.cos(ta) * (c - 10)} ${c + Math.sin(ta) * (c - 10)}`}
                            stroke={theme.ink}
                            strokeWidth={5}
                            strokeLinecap="round"
                        />
                    );
                })}
                <path
                    d={`M ${c} ${c} L ${c + Math.cos(a) * (c - 34)} ${c + Math.sin(a) * (c - 34)}`}
                    stroke={theme.ink}
                    strokeWidth={8}
                    strokeLinecap="round"
                />
                <circle cx={c} cy={c} r={10} fill={theme.ink} />
            </svg>
            <Label display size={46} style={{ marginTop: 12 }} color={props.color ?? theme.ink}>
                {props.label}
            </Label>
        </div>
    );
}

function MiniClock() {
    const theme = useTheme();
    return (
        <svg width={50} height={50} viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="21" fill={theme.paper} stroke={theme.ink} strokeWidth={4} />
            <path
                d="M25 25 V10 M25 25 H36"
                stroke={theme.accent}
                strokeWidth={4}
                strokeLinecap="round"
            />
        </svg>
    );
}

function SlowSuite() {
    const theme = useTheme();
    const r = useRamp();
    const sweep = r({ line: 7, at: 0.05 }, { line: 7, at: 0.5 });
    const marks = r({ line: 7, at: 0.55 }, { line: 7, at: "end" });
    const prs = [2, 3, 2];
    return (
        <>
            <At x={1010} y={280}>
                <Clock minutes={30 * sweep} label="about 30 minutes" size={260} />
            </At>
            <div style={{ position: "absolute", left: PANEL.x + 70, top: 110 }}>
                <Label size={34} style={{ marginBottom: 14 }}>
                    each pull request
                </Label>
                {prs.map((n, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 22,
                            opacity: Math.min(1, marks * 3 - i * 0.6 + 0.6),
                        }}
                    >
                        <Card w={90} h={110}>
                            {[0.7, 0.5, 0.6].map((w, j) => (
                                <div
                                    key={j}
                                    style={{
                                        margin: "14px 12px 0",
                                        height: 9,
                                        width: `${w * 100}%`,
                                        background: theme.inkSoft,
                                        borderRadius: 4,
                                    }}
                                />
                            ))}
                        </Card>
                        {Array.from({ length: n }, (_, j) => (
                            <div
                                key={j}
                                style={{ opacity: marks * 3 - i * 0.6 - j * 0.3 > 0 ? 1 : 0 }}
                            >
                                <MiniClock />
                            </div>
                        ))}
                    </div>
                ))}
                <Label display size={40} color={theme.accent} style={{ opacity: marks }}>
                    paid 2 or 3 times
                </Label>
            </div>
        </>
    );
}

/** Inside the tests gate: the row of tests, then the heavy setup, then the cheap setup on 24 workers. */
function InsideTheGate() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const cue = useCue();
    const heavy = r({ line: 9, at: 0.1 }, 0.6) * (1 - r({ line: 10, at: 0.05 }, 0.5));
    const split = r({ line: 10, at: 0.35 }, { line: 10, at: "end" });
    const left = 880;
    const width = 700;
    const top = 160;
    const lanes = Math.round(lerp(1, 24, split));
    const laneH = lerp(110, 19, split);
    // Speed: quick, then slowed by the heavy setup, then quick again.
    const speed = lerp(lerp(420, 70, heavy), 380, split);
    const t0 = cue(8);
    const travel = (t - t0) * speed;
    const cards: React.ReactNode[] = [];
    for (let l = 0; l < lanes; l++) {
        const y = top + 120 + l * (laneH + (split > 0 ? 3 : 0));
        for (let k = 0; k < 6; k++) {
            const gap = lerp(150, heavy > 0.5 ? 300 : 150, heavy);
            const x = ((k * gap + travel + l * 37) % (6 * gap)) - gap;
            if (x < -60 || x > width) continue;
            cards.push(
                <div key={`${l}-${k}`} style={{ position: "absolute", left: left + x, top: y }}>
                    {heavy > 0.05 && split < 0.5 && (
                        <div
                            style={{
                                position: "absolute",
                                left: -150,
                                top: -6,
                                display: "flex",
                                gap: 6,
                                opacity: heavy,
                            }}
                        >
                            <div
                                style={{
                                    width: 66,
                                    height: laneH + 12,
                                    background: theme.inkSoft,
                                    borderRadius: 6,
                                }}
                            />
                            <div
                                style={{
                                    width: 66,
                                    height: laneH + 12,
                                    background: theme.ink,
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    )}
                    <div
                        style={{
                            width: lerp(70, 24, split),
                            height: laneH,
                            background: theme.paper,
                            border: `${split > 0.5 ? 2 : 4}px solid ${theme.ink}`,
                            borderRadius: 4,
                            boxSizing: "border-box",
                        }}
                    />
                </div>,
            );
        }
    }
    const title =
        t < cue(9)
            ? "each test is quick"
            : t < cue({ line: 10, at: 0.2 })
              ? "the setup is not"
              : "cheap setup, 24 workers";
    return (
        <>
            <Label display size={50} style={{ position: "absolute", left, top: 50 }}>
                {title}
            </Label>
            <div
                style={{
                    position: "absolute",
                    left,
                    top: top + 90,
                    width,
                    height: 520,
                    overflow: "hidden",
                }}
            >
                <div style={{ position: "absolute", left: -left, top: -(top + 90) }}>{cards}</div>
            </div>
            {heavy > 0.05 && (
                <div style={{ position: "absolute", left, top: top + 260, opacity: heavy }}>
                    <div style={{ display: "flex", gap: 16 }}>
                        <Card w={300} h={70} color={theme.inkSoft} border="none">
                            <Label
                                size={32}
                                color="#fffaf2"
                                style={{ textAlign: "center", paddingTop: 14 }}
                            >
                                mocks rebuilt
                            </Label>
                        </Card>
                        <Card w={320} h={70} color={theme.ink} border="none">
                            <Label
                                size={32}
                                color="#fffaf2"
                                style={{ textAlign: "center", paddingTop: 14 }}
                            >
                                password hashing
                            </Label>
                        </Card>
                    </div>
                    <Label size={32} color={theme.onBgSoft} style={{ marginTop: 10 }}>
                        before every test, for every fake user
                    </Label>
                </div>
            )}
            <Ink
                from={onLoop(GATE_A).map((v, i) => v + (i ? 20 : 60)) as [number, number]}
                to={[left - 20, top + 160]}
                dashed
                p={r(8, 0.5)}
                color={theme.inkSoft}
                width={4}
            />
        </>
    );
}

function FastSuite() {
    const theme = useTheme();
    const r = useRamp();
    const back = r({ line: 11, at: 0.05 }, { line: 11, at: 0.55 });
    const minutes = lerp(30, 91 / 60, back);
    const count = Math.round(8253 * r({ line: 11, at: 0.2 }, { line: 11, at: 0.8 }));
    return (
        <>
            <At x={PANEL.x - 140} y={330}>
                <Clock
                    minutes={minutes}
                    label={back >= 1 ? "91 s" : `${Math.round(minutes)} min`}
                    size={300}
                    color={back >= 1 ? theme.second : theme.accent}
                />
            </At>
            <At x={PANEL.x + 220} y={300} scale={pop(r({ line: 11, at: 0.2 }, 0.5))}>
                <Card w={300} h={160}>
                    <div style={{ textAlign: "center", paddingTop: 16 }}>
                        <Label display size={68}>
                            {count.toLocaleString("en-US")}
                        </Label>
                        <Label size={34} color={theme.inkSoft}>
                            tests
                        </Label>
                    </div>
                </Card>
            </At>
        </>
    );
}

function Deploys() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const [rx, ry] = onLoop(0);
    const arrow = r({ line: 12 }, 0.6);
    const belt = r({ line: 12, at: 0.2 }, 0.7);
    const timerIn = pop(r({ line: 13, at: 0.1 }, 0.5));
    const timer = r({ line: 13, at: 0.3 }, { line: 13, at: 0.85 });
    const envs = ["preview", "staging", "production"];
    const beltY = 330;
    const ax = rx + 150;
    const items: React.ReactNode[] = [];
    if (belt > 0.5) {
        for (let k = 0; k < 6; k++) {
            const x = ((t * 140 + k * 95) % 570) + 990;
            items.push(
                <div
                    key={k}
                    style={{
                        position: "absolute",
                        left: x,
                        top: beltY - 30,
                        width: 30,
                        height: 24,
                        background: theme.accent,
                        borderRadius: 4,
                        opacity: 0.85,
                    }}
                />,
            );
        }
    }
    const secs = 160 * timer;
    const fmtTime = (s: number) =>
        `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    return (
        <>
            <Ink from={[ax, ry]} to={[960, beltY]} p={arrow} width={6} head />
            <div
                style={{
                    position: "absolute",
                    left: 980,
                    top: beltY - 6,
                    width: 600 * belt,
                    height: 14,
                    background: theme.ink,
                    borderRadius: 7,
                }}
            />
            {items}
            <Label
                size={32}
                color={theme.onBgSoft}
                style={{ position: "absolute", left: 990, top: beltY + 16, opacity: belt }}
            >
                one workflow
            </Label>
            {envs.map((e, i) => (
                <At
                    key={e}
                    x={1060 + i * 220}
                    y={beltY - 130}
                    scale={pop(r({ line: 12, at: 0.25 + i * 0.12 }, 0.5))}
                >
                    <AppServer size={120} label={e} />
                </At>
            ))}
            {timerIn > 0 && (
                <>
                    <At x={1280} y={530} scale={timerIn}>
                        <Clock
                            minutes={secs / 60}
                            label={fmtTime(secs)}
                            size={160}
                            color={theme.second}
                        />
                    </At>
                    <Label
                        size={32}
                        color={theme.onBgSoft}
                        style={{
                            position: "absolute",
                            left: 1280,
                            top: 700,
                            transform: "translateX(-50%)",
                            opacity: timerIn,
                        }}
                    >
                        production deploy, median, first two weeks
                    </Label>
                </>
            )}
        </>
    );
}

export default function HowIWork() {
    return (
        <Stage>
            <Loop />
            <Shot from={0} to={1}>
                <Team />
            </Shot>
            <Shot from={2} to={3}>
                <Team />
                <Sheets />
            </Shot>
            <Shot from={4} to={4}>
                <Binder />
            </Shot>
            <Shot from={5} to={5}>
                <Commits />
            </Shot>
            <Shot from={7} to={7}>
                <SlowSuite />
            </Shot>
            <Shot from={8} to={10}>
                <InsideTheGate />
            </Shot>
            <Shot from={11} to={11}>
                <FastSuite />
            </Shot>
            <Shot from={12}>
                <Deploys />
            </Shot>
            <Shot from={4}>
                <MeInTheMiddle />
            </Shot>
        </Stage>
    );
}

/** After the opening, me at the centre of the loop with the agents on the build card. */
function MeInTheMiddle() {
    const theme = useTheme();
    const t = useSeconds();
    const [bx, by] = onLoop(90);
    return (
        <>
            <At x={C.x} y={C.y - 10}>
                <Person size={82} highlight />
            </At>
            <Label
                size={34}
                style={{
                    position: "absolute",
                    left: C.x,
                    top: C.y + 70,
                    transform: "translateX(-50%)",
                }}
            >
                me
            </Label>
            {[0, 1, 2, 3, 4].map((i) => (
                <At
                    key={i}
                    x={bx - 120 + i * 60}
                    y={by + 100 + Math.sin(t * 5 + i) * 3}
                    scale={0.75}
                >
                    <Robot size={56} color={mix(theme.paperAlt, theme.second, 0.25)} />
                </At>
            ))}
        </>
    );
}
