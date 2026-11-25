// ez-spectrum / overnight-waves: six waves of AI agents in one night, the proof rules every change
// had to pass, and what came back. Night variant of the ez-spectrum look: darker page, brighter orange.
// Every timing is a narration line (0 to 14) or a point inside one.
import React from "react";
import { Paper, paperShadow, seeded, Shot, Stage, Tag, type Cue } from "../kit";
import {
    At,
    clamp01,
    Frame,
    GREEN,
    GREY,
    Ink,
    InkLine,
    L,
    Mark,
    mix,
    mixColor,
    Mono,
    MONO,
    Padlock,
    RED,
    Robot,
    Scribble,
    SERIF,
    useClock,
} from "./shared-b/pieces";

export const poster: Cue = L(12, "end");

const NIGHT_ORANGE = "#ff6a33";
const WAVE_COLORS = [NIGHT_ORANGE, "#37b3a4", "#f0c04a", "#8fb3ff", "#e58fb0", "#9ad26a"];
const JOBS = ["speed", "bugs", "dead code", "structure"];
const JOB_COLORS = ["#f0c04a", "#e58fb0", "#c9d3d6", "#8fb3ff"];
const WAVE_JOB = [0, 1, 2, 3, 0, 1];

/** The night: a darker page, stars, and the dawn at the very end. */
function Night() {
    const { p, t } = useClock();
    const dawn = p(L(14, 0.25), { until: L(14, "next") });
    const rand = seeded("stars");
    const stars = Array.from({ length: 46 }, () => ({
        x: rand() * 1920,
        y: rand() * 640,
        r: 1.5 + rand() * 2.5,
        ph: rand() * 6.28,
    }));
    return (
        <div style={{ position: "absolute", left: -120, top: -70, width: 1920, height: 1080 }}>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `rgba(4, 8, 18, ${0.42 * (1 - dawn * 0.7)})`,
                }}
            />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                {stars.map((s, i) => (
                    <circle
                        key={i}
                        cx={s.x}
                        cy={s.y}
                        r={s.r}
                        fill="#eceae3"
                        opacity={(0.35 + 0.3 * Math.sin(Math.floor(t * 2) + s.ph)) * (1 - dawn)}
                    />
                ))}
            </svg>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(to top, rgba(255,140,70,0.55), rgba(255,180,110,0.18) 55%, rgba(120,170,220,0.05))",
                    opacity: dawn,
                }}
            />
        </div>
    );
}

function Moon(props: { x: number; y: number }) {
    const { s, theme } = useClock();
    const a = s(L(0, 0, -0.6));
    return (
        <At
            x={props.x}
            y={props.y}
            style={{ opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}
        >
            <svg
                width={120}
                height={120}
                viewBox="0 0 120 120"
                style={{ filter: paperShadow(theme) }}
            >
                <path d="M78 10 A52 52 0 1 0 110 84 A42 42 0 1 1 78 10 Z" fill="#f4e7c3" />
            </svg>
        </At>
    );
}

// ---------------------------------------------------------------- the waves

function wavePath(w: number, h: number, phase: number): string {
    let d = `M 0 ${h}`;
    const n = 24;
    for (let i = 0; i <= n; i++) {
        const x = (i / n) * w;
        const y = 14 + 9 * Math.sin((i / n) * Math.PI * 4 + phase) + 4 * Math.sin(i * 1.7 + phase);
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return `${d} L ${w} ${h} Z`;
}

/** The six waves stacked at the left, with their numbers and their robots. */
function Waves(props: {
    x: number;
    w: number;
    robots: number;
    appear?: Cue;
    chips?: boolean;
    y0?: number;
    gap?: number;
}) {
    const { s, t, p, theme } = useClock();
    const y0 = props.y0 ?? 140;
    const gap = props.gap ?? 96;
    const h = 72;
    return (
        <>
            {WAVE_COLORS.map((color, i) => {
                const a = props.appear ? s(props.appear, i * 0.18) : 1;
                const y = y0 + i * gap;
                const robotsIn = props.chips ? s(L(1, 0.55), i * 0.05) : 1;
                const phase = Math.floor(t * 10) / 10 + i;
                return (
                    <At
                        key={i}
                        x={props.x}
                        y={y}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `translateX(${(1 - a) * -260}px)`,
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 12,
                                width: 52,
                                height: 52,
                                borderRadius: 26,
                                background: theme.paper,
                                color: theme.ink,
                                fontFamily: SERIF,
                                fontWeight: 600,
                                fontSize: 34,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                filter: paperShadow(theme, 0.6),
                            }}
                        >
                            {i + 1}
                        </div>
                        <svg
                            width={props.w - 70}
                            height={h}
                            style={{
                                position: "absolute",
                                left: 70,
                                top: 4,
                                filter: paperShadow(theme, 0.7),
                            }}
                        >
                            <path d={wavePath(props.w - 70, h, phase)} fill={color} />
                        </svg>
                        {Array.from({ length: props.robots }, (_, r) => {
                            const rx = 70 + ((r + 1) * (props.w - 70)) / (props.robots + 1) - 22;
                            const bob = 5 * Math.sin(Math.floor(t * 8) / 4 + i + r * 2);
                            return (
                                <div
                                    key={r}
                                    style={{
                                        position: "absolute",
                                        left: rx,
                                        top: -48 + bob,
                                        opacity: robotsIn,
                                        transform: `scale(${0.4 + 0.6 * robotsIn})`,
                                        transformOrigin: "50% 100%",
                                    }}
                                >
                                    <Robot size={50} color={mixColor(color, "#ffffff", 0.25)} />
                                </div>
                            );
                        })}
                        {props.chips && (
                            <WaveChip i={i} x={props.w + 14} pick={p(L(1, 0.12 + i * 0.07), 0.6)} />
                        )}
                    </At>
                );
            })}
        </>
    );
}

const CHIP_ROW_X = [0, 160, 300, 530];

function chipBox(job: number, theme: ReturnType<typeof useClock>["theme"]) {
    return (
        <Paper
            seed={`job-${job}`}
            color={JOB_COLORS[job]}
            innerStyle={{ padding: "6px 16px" }}
            roughness={1}
            sway={0.6}
        >
            <Mono color={theme.ink}>{JOBS[job]}</Mono>
        </Paper>
    );
}

/** A copy of the wave's job chip, flying from the chip row to the end of the wave. */
function WaveChip(props: { i: number; x: number; pick: number }) {
    const { theme } = useClock();
    const job = WAVE_JOB[props.i];
    if (props.pick <= 0) return null;
    // From the chip row (above the waves) to the wave's right end.
    const fromX = CHIP_ROW_X[job] - (props.x - 0);
    const fromY = -140 - props.i * 96 + 40;
    const x = mix(fromX, 0, props.pick);
    const y = mix(fromY, 14, props.pick) - Math.sin(props.pick * Math.PI) * 60;
    return (
        <div style={{ position: "absolute", left: props.x + x, top: y }}>{chipBox(job, theme)}</div>
    );
}

function ChipRow() {
    const { s, theme } = useClock();
    return (
        <>
            {JOBS.map((_, j) => {
                const a = s(L(1, 0.02 + j * 0.06));
                return (
                    <At
                        key={j}
                        x={CHIP_ROW_X[j]}
                        y={40}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `translateY(${(1 - a) * -40}px)`,
                        }}
                    >
                        {chipBox(j, theme)}
                    </At>
                );
            })}
        </>
    );
}

// ---------------------------------------------------------------- the codebase map

type Block = { x: number; y: number; w: number; h: number; label: string; key: string };

const MAP_LABELS: string[][] = [
    ["", "Files", "Studies", "", "Website"],
    ["Sign-in", "", "", "Admin", ""],
    ["", "Reports", "", "", ""],
    ["", "", "", "", ""],
];

function mapBlocks(x0: number, y0: number, w: number, h: number): Block[] {
    const rows = MAP_LABELS.length;
    const gap = 14;
    const rh = (h - gap * (rows - 1)) / rows;
    const out: Block[] = [];
    MAP_LABELS.forEach((row, r) => {
        const rand = seeded(`map-row-${r}`);
        const weights = row.map((l) => (l ? 1.35 : 0.7 + rand() * 0.6));
        const total = weights.reduce((a, b) => a + b, 0);
        const free = w - gap * (row.length - 1);
        let x = x0;
        row.forEach((label, c) => {
            const bw = (weights[c] / total) * free;
            out.push({ x, y: y0 + r * (rh + gap), w: bw, h: rh, label, key: `${r}-${c}` });
            x += bw + gap;
        });
    });
    return out;
}

function MapBlocks(props: {
    blocks: Block[];
    appear?: Cue;
    labelSize?: number;
    children?: (b: Block) => React.ReactNode;
}) {
    const { s, theme } = useClock();
    return (
        <>
            {props.blocks.map((b, i) => {
                const a = props.appear
                    ? s(props.appear, (i % 7) * 0.06 + Math.floor(i / 5) * 0.1)
                    : 1;
                return (
                    <At
                        key={b.key}
                        x={b.x}
                        y={b.y}
                        w={b.w}
                        h={b.h}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `scale(${0.7 + 0.3 * a})`,
                        }}
                    >
                        <Paper
                            seed={`blk-${b.key}`}
                            color={
                                b.label ? theme.paper : mixColor(theme.paperAlt, "#1c2631", 0.25)
                            }
                            style={{ width: "100%", height: "100%" }}
                            innerStyle={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            sway={0.3}
                        >
                            {b.label ? (
                                <span
                                    style={{
                                        fontFamily: SERIF,
                                        fontWeight: 600,
                                        fontSize: props.labelSize ?? 32,
                                        color: theme.ink,
                                    }}
                                >
                                    {b.label}
                                </span>
                            ) : (
                                <Scribble
                                    w={Math.min(90, b.w * 0.5)}
                                    seed={`blk-s-${b.key}`}
                                    color={theme.inkSoft}
                                    amp={5}
                                />
                            )}
                        </Paper>
                        {props.children?.(b)}
                    </At>
                );
            })}
        </>
    );
}

// ---------------------------------------------------------------- lines 0-1

function OpeningShot() {
    const blocks = mapBlocks(760, 270, 840, 470);
    return (
        <>
            <Moon x={1150} y={20} />
            <ChipRow />
            <Waves x={0} w={470} robots={2} appear={L(0, 0.1)} chips />
            <MapBlocks blocks={blocks} appear={L(0, 0.35)} labelSize={30} />
        </>
    );
}

// ---------------------------------------------------------------- lines 2-8: the rules

const RULES = [
    "Same harness, before and after",
    "At least 5 runs: median, spread",
    "Outputs match saved fixtures",
    "Each fix has a failing test",
    "Production is read only",
];

function InkText(props: { text: string; p: number; size: number; color: string }) {
    const chars = Array.from(props.text);
    const shown = props.p * chars.length;
    return (
        <span
            style={{
                fontFamily: SERIF,
                fontSize: props.size,
                color: props.color,
                whiteSpace: "nowrap",
            }}
        >
            {chars.map((c, i) => (
                <span key={i} style={{ opacity: clamp01(shown - i) }}>
                    {c}
                </span>
            ))}
        </span>
    );
}

function Gate() {
    const { s, p, theme } = useClock();
    const rise = s(L(2, 0.05));
    const sheet = s(L(2, 0.45));
    return (
        <>
            {[322, 942].map((x) => (
                <At
                    key={x}
                    x={x}
                    y={20}
                    w={30}
                    h={720}
                    style={{ transform: `scaleY(${rise})`, transformOrigin: "50% 100%" }}
                >
                    <Paper
                        seed={`post-${x}`}
                        color={theme.paperAlt}
                        style={{ width: 30, height: 720 }}
                    />
                </At>
            ))}
            <At
                x={300}
                y={20}
                w={694}
                h={80}
                style={{
                    opacity: Math.min(1, rise * 2),
                    transform: `translateY(${(1 - rise) * 300}px)`,
                }}
            >
                <Paper
                    seed="gate-bar"
                    color={NIGHT_ORANGE}
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    lift={1.2}
                >
                    <Mono size={40} color="#fffaf2">
                        Rules
                    </Mono>
                </Paper>
            </At>
            <At
                x={366}
                y={136}
                w={564}
                h={476}
                style={{
                    opacity: Math.min(1, sheet * 2),
                    transform: `translateY(${(1 - sheet) * -80}px) rotate(${(1 - sheet) * -6 - 0.8}deg)`,
                }}
            >
                <Paper
                    seed="proof-sheet"
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{ padding: "26px 22px", boxSizing: "border-box" }}
                    lift={1.3}
                >
                    <div
                        style={{
                            fontFamily: SERIF,
                            fontWeight: 600,
                            fontSize: 46,
                            color: theme.ink,
                        }}
                    >
                        Proof rules
                    </div>
                    {RULES.map((rule, k) => {
                        const ink = p(L(3 + k, 0.02), 0.9);
                        const tick = p(L(3 + k, 0.02, 0.9), 0.4);
                        return (
                            <div
                                key={k}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    marginTop: 22,
                                    height: 52,
                                    borderBottom: `2px solid ${theme.paperAlt}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        flex: "none",
                                        border: `3px solid ${theme.ink}`,
                                        borderRadius: 4,
                                        position: "relative",
                                    }}
                                >
                                    <div style={{ position: "absolute", left: -4, top: -8 }}>
                                        <Mark ok size={42} p={tick} />
                                    </div>
                                </div>
                                <InkText text={rule} p={ink} size={29} color={theme.ink} />
                            </div>
                        );
                    })}
                </Paper>
                {/* The pin. */}
                <div
                    style={{
                        position: "absolute",
                        left: 270,
                        top: -10,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        background: NIGHT_ORANGE,
                        filter: paperShadow(theme, 0.5),
                    }}
                />
            </At>
        </>
    );
}

/** Change slips piling up at the gate while the agents work (line 2). */
function Slips() {
    const { p, theme } = useClock();
    return (
        <>
            {Array.from({ length: 12 }, (_, k) => {
                const fly = p(L(2, 0.1 + k * 0.065), 0.5);
                if (fly <= 0) return null;
                const wave = k % 6;
                const from: [number, number] = [260, 150 + wave * 96];
                const to: [number, number] = [250 + (k % 3) * 18, 690 - Math.floor(k / 2) * 16];
                const x = mix(from[0], to[0], fly);
                const y = mix(from[1], to[1], fly) - Math.sin(fly * Math.PI) * 80;
                return (
                    <At
                        key={k}
                        x={x}
                        y={y}
                        style={{ transform: `rotate(${(k % 2 ? 1 : -1) * (6 + k * 2) * fly}deg)` }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 34,
                                background: theme.paper,
                                filter: paperShadow(theme, 0.5),
                                padding: "8px 6px",
                                boxSizing: "border-box",
                            }}
                        >
                            <div style={{ height: 4, width: 36, background: WAVE_COLORS[wave] }} />
                            <div
                                style={{
                                    height: 4,
                                    width: 26,
                                    marginTop: 6,
                                    background: theme.inkSoft,
                                }}
                            />
                        </div>
                    </At>
                );
            })}
        </>
    );
}

/** One demo in the area right of the gate, visible from its line until the next demo's line. */
function Demo(props: { line: number; until?: number; children: React.ReactNode }) {
    const { p, frame, at } = useClock();
    const end = props.until ?? props.line + 1;
    const a = p(L(props.line, 0, -0.1), 0.35);
    const b = props.until === -1 ? 0 : p(L(end, 0, -0.15), 0.3);
    if (frame < at(L(props.line, 0, -0.1)) || (props.until !== -1 && b >= 1)) return null;
    return (
        <div style={{ position: "absolute", inset: 0, opacity: a * (1 - b) }}>{props.children}</div>
    );
}

const DX = 1000; // left edge of the demo area
const DW = 600;

function Stopwatch(props: { angle: number; size: number }) {
    const { theme } = useClock();
    return (
        <svg
            width={props.size}
            height={props.size * 1.15}
            viewBox="0 0 100 115"
            style={{ filter: paperShadow(theme) }}
        >
            <rect x={42} y={0} width={16} height={12} rx={3} fill={theme.paperAlt} />
            <circle cx={50} cy={62} r={46} fill={theme.paper} stroke={theme.ink} strokeWidth={5} />
            {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return (
                    <path
                        key={i}
                        d={`M ${50 + Math.sin(a) * 36} ${62 - Math.cos(a) * 36} L ${50 + Math.sin(a) * 41} ${62 - Math.cos(a) * 41}`}
                        stroke={theme.inkSoft}
                        strokeWidth={3}
                    />
                );
            })}
            <path
                d={`M 50 62 L ${50 + Math.sin((props.angle * Math.PI) / 180) * 32} ${62 - Math.cos((props.angle * Math.PI) / 180) * 32}`}
                stroke={NIGHT_ORANGE}
                strokeWidth={5}
                strokeLinecap="round"
            />
            <circle cx={50} cy={62} r={5} fill={theme.ink} />
        </svg>
    );
}

function DemoMeasure() {
    const { p, s, theme } = useClock();
    const run1 = p(L(3, 0.25), 0.9, true);
    const run2 = p(L(3, 0.68), 0.9, true);
    const angle = run2 > 0 ? run2 * 300 : run1 * 300;
    const b = s(L(3, 0.25, 0.9));
    const a = s(L(3, 0.68, 0.9));
    return (
        <>
            <At x={DX + DW / 2 - 170} y={140} w={340} h={100}>
                <Paper
                    seed="harness"
                    color={theme.paperAlt}
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Mono size={32} color={theme.ink}>
                        same harness
                    </Mono>
                </Paper>
            </At>
            <At x={DX + DW / 2 - 90} y={270}>
                <Stopwatch angle={angle} size={180} />
            </At>
            {[
                { label: "before", v: b, x: DX + 30 },
                { label: "after", v: a, x: DX + DW - 230 },
            ].map((m) => (
                <At
                    key={m.label}
                    x={m.x}
                    y={520}
                    w={200}
                    style={{
                        opacity: Math.min(1, m.v * 2),
                        transform: `scale(${0.6 + 0.4 * m.v})`,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                    }}
                >
                    <Tag
                        text={m.label}
                        color={theme.second}
                        ink={theme.ink}
                        seed={`m-${m.label}`}
                    />
                </At>
            ))}
        </>
    );
}

const RUN_X = [0.2, 0.37, 0.48, 0.6, 0.82];

function DemoRuns() {
    const { p, s, theme } = useClock();
    const lineY = 430;
    const x0 = DX + 30;
    const w = DW - 60;
    const count = RUN_X.filter((_, k) => p(L(4, 0.04 + k * 0.08), 0.35) >= 1).length;
    const med = s(L(4, 0.58));
    const spread = p(L(4, 0.72), 0.5);
    return (
        <>
            <At x={x0} y={140}>
                <Mono size={34} color={theme.onBg}>{`run ${Math.max(1, count)} of 5`}</Mono>
            </At>
            <Ink>
                <InkLine
                    from={[x0, lineY]}
                    to={[x0 + w, lineY]}
                    p={p(L(4, 0), 0.4)}
                    color={theme.onBgSoft}
                    seed="runs-axis"
                />
                {RUN_X.map((f, k) => {
                    const fall = p(L(4, 0.04 + k * 0.08), 0.35, true);
                    if (fall <= 0) return null;
                    return (
                        <circle
                            key={k}
                            cx={x0 + f * w}
                            cy={mix(220, lineY - 16, fall * fall)}
                            r={16}
                            fill={k === 2 && med > 0.5 ? NIGHT_ORANGE : theme.paper}
                        />
                    );
                })}
                {spread > 0 && (
                    <path
                        d={`M ${x0 + RUN_X[0] * w} ${lineY + 30} v 22 H ${x0 + (RUN_X[0] + (RUN_X[4] - RUN_X[0]) * spread) * w} v -22`}
                        fill="none"
                        stroke={theme.second}
                        strokeWidth={5}
                        strokeLinejoin="round"
                    />
                )}
            </Ink>
            <At
                x={x0 + RUN_X[2] * w - 4}
                y={lineY - 110}
                w={8}
                h={110 * med}
                style={{ background: NIGHT_ORANGE, transformOrigin: "50% 100%" }}
            />
            <At
                x={x0 + RUN_X[2] * w - 80}
                y={lineY - 160}
                w={160}
                style={{ textAlign: "center", opacity: med }}
            >
                <Mono color={NIGHT_ORANGE}>median</Mono>
            </At>
            <At
                x={x0 + ((RUN_X[0] + RUN_X[4]) / 2) * w - 90}
                y={lineY + 64}
                w={180}
                style={{ textAlign: "center", opacity: spread }}
            >
                <Mono color={theme.second}>spread</Mono>
            </At>
        </>
    );
}

function OutputSheet(props: { seed: string; label: string; right?: boolean }) {
    const { theme } = useClock();
    return (
        <Paper
            seed={`out-${props.seed}`}
            style={{ width: 210, height: 250 }}
            innerStyle={{ padding: "22px 16px", boxSizing: "border-box" }}
        >
            <div style={{ textAlign: props.right ? "right" : "left" }}>
                <Mono size={28} color={props.right ? NIGHT_ORANGE : theme.inkSoft}>
                    {props.label}
                </Mono>
            </div>
            {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} style={{ marginTop: 16 }}>
                    <Scribble w={140 - (k % 3) * 25} seed={`same-${k}`} color={theme.ink} amp={5} />
                </div>
            ))}
        </Paper>
    );
}

function DemoIdentical() {
    const { p, theme } = useClock();
    const slide = p(L(5, 0.3), { until: L(5, 0.58) });
    const match = p(L(5, 0.62), 0.3);
    const hashColor = mixColor("#c9d3d6", GREEN, match);
    return (
        <>
            <At x={DX + 70} y={150}>
                <OutputSheet seed="saved" label="saved" />
            </At>
            <At
                x={mix(DX + 330, DX + 80, slide)}
                y={mix(150, 160, slide)}
                style={{ opacity: 1 - slide * 0.2 }}
            >
                <OutputSheet seed="new" label="new" right />
            </At>
            <At x={DX + 30} y={460} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Mono size={32} color={hashColor} style={{ textTransform: "none" }}>
                    saved a3f9c1…
                </Mono>
                <Mono size={32} color={hashColor} style={{ textTransform: "none" }}>
                    new a3f9c1…
                </Mono>
            </At>
            <At x={DX + 420} y={470}>
                <Mark ok size={90} p={match} />
            </At>
        </>
    );
}

function DemoFailingTest() {
    const { p, theme } = useClock();
    const toOld = p(L(6, 0.08), 0.5);
    const red = p(L(6, 0.3), 0.3);
    const toNew = p(L(6, 0.55), 0.5);
    const green = p(L(6, 0.78), 0.3);
    const x = mix(mix(DX + 210, DX + 40, toOld), DX + 360, toNew);
    const y = mix(560, 360, toOld);
    const card = mixColor(mixColor(theme.paper, RED, red * (1 - toNew)), GREEN, green);
    return (
        <>
            {[
                { label: "old code", x: DX + 20 },
                { label: "new code", x: DX + 340 },
            ].map((b) => (
                <At key={b.label} x={b.x} y={140} w={240} h={200}>
                    <Paper
                        seed={`code-${b.label}`}
                        color={theme.paperAlt}
                        style={{ width: "100%", height: "100%" }}
                        innerStyle={{ padding: 20, boxSizing: "border-box" }}
                    >
                        <Mono size={28} color={theme.ink}>
                            {b.label}
                        </Mono>
                        {[0, 1, 2].map((k) => (
                            <div key={k} style={{ marginTop: 18 }}>
                                <Scribble
                                    w={170 - k * 30}
                                    seed={`${b.label}-${k}`}
                                    color={theme.inkSoft}
                                    amp={5}
                                />
                            </div>
                        ))}
                    </Paper>
                </At>
            ))}
            <At x={x} y={y} w={200} h={110}>
                <Paper
                    seed="test-card"
                    color={card}
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                    }}
                    lift={1.4}
                >
                    <Mono size={32} color={theme.ink}>
                        test
                    </Mono>
                    {toNew < 0.5 ? (
                        <Mark ok={false} size={44} p={red} color={theme.ink} />
                    ) : (
                        <Mark ok size={44} p={green} color={theme.ink} />
                    )}
                </Paper>
            </At>
            <At x={DX + 20} y={600} w={240} style={{ textAlign: "center", opacity: red }}>
                <Mono color={RED}>fails</Mono>
            </At>
            <At x={DX + 340} y={600} w={240} style={{ textAlign: "center", opacity: green }}>
                <Mono color={GREEN}>passes</Mono>
            </At>
        </>
    );
}

function DemoReadOnly() {
    const { p, s, theme } = useClock();
    const lock = s(L(7, 0.02));
    const reach = p(L(7, 0.12), 0.45) * (1 - p(L(7, 0.42), 0.3));
    const bounce = p(L(7, 0.4), 0.25);
    const glass = p(L(7, 0.52), { until: L(7, "next") });
    return (
        <>
            <At x={DX + 290} y={210} w={290} h={220}>
                <Paper
                    seed="production"
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    <Mono size={32} color={theme.ink}>
                        Production
                    </Mono>
                    <Scribble w={160} seed="prod-s" color={theme.inkSoft} amp={5} />
                    <Scribble w={120} seed="prod-s2" color={theme.inkSoft} amp={5} />
                </Paper>
            </At>
            <At x={DX + 405} y={150 + (1 - lock) * -60} style={{ opacity: lock }}>
                <Padlock size={60} />
            </At>
            <At x={DX + 30} y={300}>
                <Robot size={90} color="#8fb3ff" arm={reach} />
            </At>
            {/* The pencil reaches in and bounces off. */}
            <At
                x={DX + 120 + reach * 120 - bounce * 30}
                y={300 - reach * 20}
                style={{ transform: `rotate(${-30 + bounce * 40}deg)` }}
            >
                <svg width={130} height={30} viewBox="0 0 130 30">
                    <rect x={0} y={6} width={100} height={18} fill={theme.third} />
                    <path d="M100 6 L126 15 L100 24 Z" fill="#f4e7c3" />
                    <path d="M118 12 L126 15 L118 18 Z" fill={theme.ink} />
                </svg>
            </At>
            <At
                x={DX + 40}
                y={520}
                style={{ opacity: bounce, display: "flex", alignItems: "center", gap: 10 }}
            >
                <Mark ok={false} size={44} p={bounce} />
                <Mono color={RED}>write</Mono>
            </At>
            {glass > 0 && (
                <At x={mix(DX + 240, DX + 520, glass)} y={250}>
                    <svg
                        width={120}
                        height={120}
                        viewBox="0 0 60 60"
                        style={{ filter: paperShadow(theme, 0.6) }}
                    >
                        <circle
                            cx={24}
                            cy={24}
                            r={16}
                            fill="rgba(200,230,240,0.35)"
                            stroke={theme.ink}
                            strokeWidth={5}
                        />
                        <path
                            d="M36 36 L54 54"
                            stroke={theme.ink}
                            strokeWidth={7}
                            strokeLinecap="round"
                        />
                    </svg>
                </At>
            )}
            <At
                x={DX + 340}
                y={520}
                style={{
                    opacity: clamp01(glass * 3),
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <Mark ok size={44} p={clamp01(glass * 3)} />
                <Mono color={GREEN}>read</Mono>
            </At>
        </>
    );
}

function DemoPreview() {
    const { p, s, theme } = useClock();
    const track = p(L(8, 0), 0.6);
    const stamp = s(L(8, 0.74));
    const trackY = 430;
    return (
        <>
            <At x={DX} y={trackY - 54} style={{ opacity: track }}>
                <Mono size={30} color={theme.second}>
                    preview branch
                </Mono>
            </At>
            <At x={DX} y={trackY} w={(DW - 110) * track} h={46}>
                <Paper
                    seed="track"
                    color={theme.second}
                    style={{ width: "100%", height: "100%" }}
                    roughness={0.8}
                />
            </At>
            {[0, 1, 2].map((k) => {
                const a = s(L(8, 0.05 + k * 0.08));
                const drop = p(L(8, 0.15 + k * 0.1), 0.35, true);
                const slide = p(L(8, 0.3 + k * 0.1), { until: L(8, 0.72) });
                const rx = DX + 40 + k * 150;
                return (
                    <React.Fragment key={k}>
                        <At x={rx} y={180} style={{ opacity: a }}>
                            <Robot
                                size={56}
                                color={WAVE_COLORS[k * 2]}
                                arm={drop > 0 && drop < 1 ? 1 : 0}
                            />
                        </At>
                        {drop > 0 && (
                            <At
                                x={mix(rx + 40, DX + DW - 230 - (2 - k) * 26, slide)}
                                y={mix(250, trackY - 26, drop * drop)}
                                style={{ transform: `rotate(${(k - 1) * 8}deg)` }}
                            >
                                <div
                                    style={{
                                        width: 60,
                                        height: 38,
                                        background: theme.paper,
                                        filter: paperShadow(theme, 0.5),
                                        padding: "9px 7px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: 4,
                                            width: 38,
                                            background: WAVE_COLORS[k * 2],
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: 4,
                                            width: 26,
                                            marginTop: 7,
                                            background: theme.inkSoft,
                                        }}
                                    />
                                </div>
                            </At>
                        )}
                    </React.Fragment>
                );
            })}
            {/* The person at the end of the track. */}
            <At x={DX + DW - 100} y={trackY - 150} style={{ opacity: track }}>
                <svg
                    width={100}
                    height={200}
                    viewBox="0 0 50 100"
                    style={{ filter: paperShadow(theme) }}
                >
                    <circle cx={25} cy={18} r={13} fill="#f4e7c3" />
                    <path d="M4 100 C4 56 10 36 25 36 C40 36 46 56 46 100 Z" fill="#f4e7c3" />
                </svg>
            </At>
            <At
                x={DX + DW - 300}
                y={trackY + 80}
                style={{
                    opacity: Math.min(1, stamp * 2),
                    transform: `scale(${2.2 - 1.2 * stamp}) rotate(-8deg)`,
                }}
            >
                <div
                    style={{
                        border: `5px solid ${NIGHT_ORANGE}`,
                        padding: "6px 18px",
                        borderRadius: 8,
                    }}
                >
                    <Mono size={40} color={NIGHT_ORANGE}>
                        merge
                    </Mono>
                </div>
            </At>
        </>
    );
}

function RulesShot() {
    return (
        <>
            <Waves x={0} w={300} robots={1} y0={130} gap={96} />
            <Slips />
            <Gate />
            <Demo line={2} until={3}>
                <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
                    <MapBlocks blocks={mapBlocks(1000, 140, 600, 600)} labelSize={28} />
                </div>
            </Demo>
            <Demo line={3}>
                <DemoMeasure />
            </Demo>
            <Demo line={4}>
                <DemoRuns />
            </Demo>
            <Demo line={5}>
                <DemoIdentical />
            </Demo>
            <Demo line={6}>
                <DemoFailingTest />
            </Demo>
            <Demo line={7}>
                <DemoReadOnly />
            </Demo>
            <Demo line={8} until={-1}>
                <DemoPreview />
            </Demo>
        </>
    );
}

// ---------------------------------------------------------------- lines 9-13: what came back

const MAP_Y = 400;
const MAP_H = 340;
const CARD_W = 500;
const CARD_H = 340;
const CARDS = [
    { block: "Files", x: 0, line: 10 },
    { block: "Studies", x: 550, line: 11 },
    { block: "Website", x: 1100, line: 12 },
];
const RECEIPT_BLOCKS = [
    "0-0",
    "0-1",
    "0-2",
    "0-4",
    "1-1",
    "1-3",
    "2-0",
    "2-2",
    "2-4",
    "3-1",
    "3-3",
];
const CRACKED = ["2-3", "3-1"];

function SweepWaves() {
    const { p, theme } = useClock();
    return (
        <>
            {WAVE_COLORS.map((color, i) => {
                const go = p(L(9, 0, i * 0.22 - 0.2), 1.7, true);
                if (go <= 0 || go >= 1) return null;
                const x = mix(-260, 1820, go);
                return (
                    <At key={i} x={x} y={MAP_Y - 60} style={{ opacity: 0.8 }}>
                        <svg width={200} height={MAP_H + 100} viewBox="0 0 200 440">
                            <path
                                d="M0 0 C80 30 120 60 150 120 C190 200 200 300 170 440 L0 440 Z"
                                fill={color}
                                opacity={0.75}
                            />
                            <path
                                d="M0 0 C80 30 120 60 150 120 C190 200 200 300 170 440"
                                fill="none"
                                stroke={theme.paper}
                                strokeWidth={5}
                            />
                        </svg>
                    </At>
                );
            })}
        </>
    );
}

function sweepFrontX(frame: number, at: (c: Cue) => number, fps: number): number {
    // The first wave's front: where receipts have popped up so far.
    const start = at(L(9, 0, -0.2));
    const go = clamp01((frame - start) / (1.7 * fps));
    return mix(-260, 1820, go) + 150;
}

function Receipt(props: { b: Block }) {
    const { frame, at, fps, s, theme } = useClock();
    if (!RECEIPT_BLOCKS.includes(props.b.key) && !CARDS.some((c) => c.block === props.b.label))
        return null;
    const front = sweepFrontX(frame, at, fps);
    const passed = front > props.b.x + props.b.w / 2;
    if (!passed) return null;
    const pop = s(L(9, 0, -0.2), ((props.b.x + props.b.w / 2 + 260 - 150) / 2080) * 1.7);
    return (
        <div
            style={{
                position: "absolute",
                right: 8,
                top: -18,
                transform: `scale(${pop}) rotate(6deg)`,
                transformOrigin: "50% 100%",
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 34,
                    background: "#f4e7c3",
                    filter: paperShadow(theme, 0.5),
                    borderTop: `5px solid ${NIGHT_ORANGE}`,
                }}
            />
        </div>
    );
}

function Crack(props: { b: Block }) {
    const { p, s, theme } = useClock();
    const k = CRACKED.indexOf(props.b.key);
    if (k < 0) return null;
    const crack = p(L(13, 0.05 + k * 0.15), 0.4);
    const tape = s(L(13, 0.45 + k * 0.15));
    const cx = props.b.w / 2;
    const cy = props.b.h / 2;
    return (
        <>
            <svg
                width={props.b.w}
                height={props.b.h}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
                <path
                    d={`M ${cx - 50} ${cy - 30} L ${cx - 18} ${cy - 2} L ${cx - 30} ${cy + 10} L ${cx + 14} ${cy + 22} L ${cx + 8} ${cy + 34} L ${cx + 52} ${cy + 40}`}
                    fill="none"
                    stroke={theme.ink}
                    strokeWidth={6}
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - crack}
                />
            </svg>
            {tape > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: cx - 90,
                        top: cy - 24,
                        width: 180,
                        height: 48,
                        background: NIGHT_ORANGE,
                        opacity: 0.95,
                        transform: `rotate(-12deg) scale(${tape})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        filter: paperShadow(theme, 0.5),
                    }}
                >
                    <Mono size={28} color="#fffaf2">
                        fixed
                    </Mono>
                </div>
            )}
        </>
    );
}

function CardShell(props: {
    i: number;
    blocks: Block[];
    children: React.ReactNode;
    title: string;
}) {
    const { s, p, theme } = useClock();
    const c = CARDS[props.i];
    const b = props.blocks.find((x) => x.label === c.block) as Block;
    const open = s(L(c.line, 0.02));
    const dim = p(L(13, 0), 0.5);
    const bx = b.x + b.w / 2;
    const by = b.y;
    const x = mix(bx - 30, c.x, open);
    const y = mix(by - 30, 20, open);
    return (
        <>
            <Ink style={{ opacity: open * (1 - dim * 0.9) }}>
                <path
                    d={`M ${c.x + CARD_W / 2} ${20 + CARD_H} L ${bx} ${by - 10}`}
                    stroke="#f4e7c3"
                    strokeWidth={3}
                    strokeDasharray="10 9"
                />
            </Ink>
            <At
                x={x}
                y={y}
                w={CARD_W}
                h={CARD_H}
                style={{
                    opacity: Math.min(1, open * 2) * (1 - dim * 0.8),
                    transform: `scale(${0.12 + 0.88 * open})`,
                    transformOrigin: "0 0",
                }}
            >
                <Paper
                    seed={`card-${props.i}`}
                    color="#f4e7c3"
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{
                        padding: "22px 26px",
                        boxSizing: "border-box",
                        position: "relative",
                    }}
                    lift={1.4}
                >
                    <div
                        style={{
                            fontFamily: SERIF,
                            fontWeight: 600,
                            fontSize: 40,
                            color: theme.ink,
                            borderTop: `6px solid ${NIGHT_ORANGE}`,
                            paddingTop: 8,
                            display: "inline-block",
                        }}
                    >
                        {props.title}
                    </div>
                    {props.children}
                </Paper>
            </At>
        </>
    );
}

function BigNum(props: {
    text: string;
    color: string;
    size?: number;
    opacity?: number;
    strike?: boolean;
}) {
    return (
        <span
            style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: props.size ?? 56,
                color: props.color,
                opacity: props.opacity ?? 1,
                whiteSpace: "nowrap",
                textDecoration: props.strike ? "line-through" : undefined,
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {props.text}
        </span>
    );
}

function CardDownloads(props: { blocks: Block[] }) {
    const { p, theme } = useClock();
    const grow = p(L(10, 0.3), 0.6);
    const shrink = p(L(10, 0.76), 0.6);
    const full = 440;
    const w = grow * mix(full, (full * 45) / 837, shrink);
    const color = mixColor(GREY, NIGHT_ORANGE, shrink);
    const old = clamp01(grow * 2 - 0.6);
    const nu = p(L(10, 0.86), 0.4);
    return (
        <CardShell i={0} blocks={props.blocks} title="File downloads">
            <div style={{ marginTop: 26, height: 56, width: full, position: "relative" }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        border: `3px dashed ${GREY}`,
                        opacity: shrink,
                    }}
                />
                <div style={{ width: Math.max(8, w), height: 56, background: color }} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 30 }}>
                <BigNum text="837 ms" color={GREY} opacity={old} strike={nu > 0.5} />
                <BigNum text="45 ms" color={NIGHT_ORANGE} opacity={nu} size={72} />
            </div>
        </CardShell>
    );
}

function pieSlice(r: number, share: number): string {
    const a = share * Math.PI * 2;
    const x = Math.sin(a) * r;
    const y = -Math.cos(a) * r;
    return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

function CardMemory(props: { blocks: Block[] }) {
    const { p, theme } = useClock();
    const show = p(L(11, 0.4), 0.5);
    const shrink = p(L(11, 0.78), 0.6);
    const share = mix(0.275, 0.093, shrink) * show;
    const nu = p(L(11, 0.86), 0.4);
    return (
        <CardShell i={1} blocks={props.blocks} title="Memory clean-up">
            <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 18 }}>
                <svg width={190} height={190} viewBox="-95 -95 190 190" style={{ flex: "none" }}>
                    <circle r={88} fill={theme.second} />
                    {share > 0.001 && (
                        <path d={pieSlice(88, share)} fill={mixColor(GREY, NIGHT_ORANGE, shrink)} />
                    )}
                    <circle r={88} fill="none" stroke={theme.ink} strokeWidth={4} />
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <BigNum
                        text="27.5%"
                        color={GREY}
                        opacity={clamp01(show * 2)}
                        strike={nu > 0.5}
                        size={50}
                    />
                    <BigNum text="9.3%" color={NIGHT_ORANGE} opacity={nu} size={72} />
                    <Mono size={28} color={theme.inkSoft} style={{ opacity: show }}>
                        of a run
                    </Mono>
                </div>
            </div>
        </CardShell>
    );
}

function CardPhone(props: { blocks: Block[] }) {
    const { p, theme } = useClock();
    const load = p(L(12, 0.18), { until: L(12, 0.55) }, true);
    const was = p(L(12, 0.84), 0.4);
    const secs = (1.98 * load).toFixed(2);
    return (
        <CardShell i={2} blocks={props.blocks} title="Home page, phone">
            <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 16 }}>
                <div
                    style={{
                        width: 112,
                        height: 196,
                        border: `6px solid ${theme.ink}`,
                        borderRadius: 18,
                        padding: 10,
                        boxSizing: "border-box",
                        flex: "none",
                    }}
                >
                    <div
                        style={{
                            height: 14,
                            width: 50,
                            background: theme.inkSoft,
                            borderRadius: 3,
                        }}
                    />
                    <div
                        style={{
                            marginTop: 10,
                            height: 70,
                            background: theme.second,
                            borderRadius: 4,
                            opacity: clamp01(load * 1.2 - 0.1),
                        }}
                    />
                    <div
                        style={{
                            marginTop: 10,
                            height: 8,
                            width: 70,
                            background: theme.inkSoft,
                            opacity: load,
                        }}
                    />
                    <div
                        style={{
                            marginTop: 8,
                            height: 8,
                            width: 50,
                            background: theme.inkSoft,
                            opacity: load,
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Mono size={28} color={theme.inkSoft}>
                        main content in
                    </Mono>
                    <BigNum
                        text={`${secs} s`}
                        color={NIGHT_ORANGE}
                        size={72}
                        opacity={clamp01(load * 4)}
                    />
                    <BigNum text="was 3.26 s" color={GREY} size={44} opacity={was} />
                </div>
            </div>
        </CardShell>
    );
}

function ResultsShot() {
    const blocks = mapBlocks(0, MAP_Y, 1600, MAP_H);
    const { s, p } = useClock();
    return (
        <>
            <MapBlocks blocks={blocks} labelSize={32}>
                {(b) => (
                    <>
                        <Receipt b={b} />
                        <Crack b={b} />
                    </>
                )}
            </MapBlocks>
            <SweepWaves />
            <At x={0} y={40} style={{ opacity: s(L(9, 0.1)) * (1 - p(L(10, 0), 0.3)) }}>
                <Tag text="What came back" at={L(9, 0.1)} seed="ow-back" size={40} />
            </At>
            <CardDownloads blocks={blocks} />
            <CardMemory blocks={blocks} />
            <CardPhone blocks={blocks} />
            <At x={520} y={140}>
                <Tag
                    text="Security bugs fixed"
                    at={L(13, 0.3)}
                    seed="ow-sec"
                    color={NIGHT_ORANGE}
                    size={44}
                />
            </At>
        </>
    );
}

// ---------------------------------------------------------------- line 14: every endpoint checked

const DOOR_COLS = 8;
const DOOR_ROWS = 3;
const MISSING = 13;

function DoorsShot() {
    const { p, s, theme } = useClock();
    const red = p(L(14, 0.18), 0.3);
    const fix = p(L(14, 0.46), 0.5, true);
    const green = p(L(14, 0.7), 0.3);
    const light = green > 0 ? mixColor(RED, GREEN, green) : mixColor("#555e66", RED, red);
    const status = green > 0.5 ? "build passes" : red > 0.5 ? "build fails" : "build";
    const dw = 120;
    const dh = 150;
    const gx = 44;
    const gy = 24;
    const x0 = (1600 - (DOOR_COLS * dw + (DOOR_COLS - 1) * gx)) / 2;
    const y0 = 230;
    return (
        <>
            <At x={0} y={0}>
                <Tag
                    text="Every endpoint"
                    at={L(14, 0)}
                    seed="ow-doors"
                    color={theme.second}
                    ink={theme.ink}
                />
            </At>
            <At x={800 - 230} y={30} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                <div
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        background: light,
                        border: `8px solid ${theme.paper}`,
                        boxShadow: green > 0 || red > 0 ? `0 0 60px ${light}` : undefined,
                    }}
                />
                <Mono size={44} color={theme.onBg}>
                    {status}
                </Mono>
            </At>
            {Array.from({ length: DOOR_COLS * DOOR_ROWS }, (_, i) => {
                const c = i % DOOR_COLS;
                const r = Math.floor(i / DOOR_COLS);
                const a = s(L(14, 0, (c + r) * 0.04));
                const missing = i === MISSING;
                return (
                    <At
                        key={i}
                        x={x0 + c * (dw + gx)}
                        y={y0 + r * (dh + gy)}
                        w={dw}
                        h={dh}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `scale(${0.6 + 0.4 * a})`,
                        }}
                    >
                        <Paper
                            seed={`door-${i}`}
                            color={
                                missing && red > 0.5 && fix < 1
                                    ? mixColor(theme.paperAlt, RED, 0.35)
                                    : theme.paperAlt
                            }
                            style={{ width: "100%", height: "100%" }}
                            sway={0.3}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: 14,
                                    right: 14,
                                    bottom: 0,
                                    border: `4px solid ${theme.inkSoft}`,
                                    borderBottom: "none",
                                    borderRadius: "8px 8px 0 0",
                                }}
                            />
                        </Paper>
                        <div
                            style={{
                                position: "absolute",
                                left: dw / 2 - 22,
                                top: missing ? mix(-260, dh / 2 - 26, fix) : dh / 2 - 26,
                                opacity: missing ? (fix > 0 ? 1 : 0) : 1,
                            }}
                        >
                            <Padlock size={44} />
                        </div>
                    </At>
                );
            })}
        </>
    );
}

export default function OvernightWaves() {
    return (
        <Stage>
            <Night />
            <Frame>
                <Shot from={L(0, 0, -1.2)} to={1}>
                    <OpeningShot />
                </Shot>
                <Shot from={2} to={8}>
                    <RulesShot />
                </Shot>
                <Shot from={9} to={13}>
                    <ResultsShot />
                </Shot>
                <Shot from={14}>
                    <DoorsShot />
                </Shot>
            </Frame>
        </Stage>
    );
}
