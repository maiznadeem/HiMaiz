// ez-spectrum / operations: the supervisor, the pause row, the Operations page, the cloud clean-up.
// Every timing is a narration line (0 to 13) or a point inside one.
import React from "react";
import { Paper, paperShadow, Shot, Stage, Tag, type Cue, type Point } from "../kit";
import {
    At,
    clamp01,
    Cylinder,
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
    quad,
    RED,
    Scribble,
    SERIF,
    StudyCard,
    useClock,
    WorkerBox,
} from "./shared-b/pieces";

export const poster: Cue = L(13, "end", 1.0);

const SERVICES = ["Website", "API", "Admin", "Workers"];
const SX = [150, 450, 750, 1050];
const SY = 390;
const BW = 240;
const BH = 160;
const SUP: Point = [1420, 390];
const CHIP = ["#37b3a4", "#ff4f1a", "#f0c04a", "#8fb3ff"];
const DARK_RED = "#7a2a22";

type IconKind = "start" | "pause" | "stop" | "logs";
const ICONS: IconKind[] = ["start", "pause", "stop", "logs"];

function ControlIcon(props: { kind: IconKind; size: number; color: string; accent: string }) {
    const c = props.color;
    return (
        <svg
            width={props.size}
            height={props.size}
            viewBox="0 0 60 60"
            style={{ display: "block" }}
        >
            {props.kind === "start" && <path d="M18 10 L50 30 L18 50 Z" fill={props.accent} />}
            {props.kind === "pause" && (
                <>
                    <rect x={14} y={10} width={11} height={40} rx={3} fill={c} />
                    <rect x={35} y={10} width={11} height={40} rx={3} fill={c} />
                </>
            )}
            {props.kind === "stop" && <rect x={12} y={12} width={36} height={36} rx={4} fill={c} />}
            {props.kind === "logs" && (
                <>
                    <path
                        d="M14 8 H46 V52 H14 Z"
                        fill="none"
                        stroke={c}
                        strokeWidth={5}
                        strokeLinejoin="round"
                    />
                    {[18, 28, 38].map((y) => (
                        <path
                            key={y}
                            d={`M21 ${y} H39`}
                            stroke={y === 18 ? props.accent : c}
                            strokeWidth={4}
                            strokeLinecap="round"
                        />
                    ))}
                </>
            )}
        </svg>
    );
}

/** A paper browser window. */
function Browser(props: {
    w: number;
    h: number;
    seed: string;
    title?: string;
    children?: React.ReactNode;
    pill?: number;
}) {
    const { theme } = useClock();
    return (
        <Paper seed={props.seed} style={{ width: props.w, height: props.h }} lift={1.3} sway={0.4}>
            <div
                style={{
                    height: 64,
                    background: theme.paperAlt,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "0 26px",
                }}
            >
                {[RED, theme.third, GREEN].map((c) => (
                    <div
                        key={c}
                        style={{ width: 20, height: 20, borderRadius: 10, background: c }}
                    />
                ))}
                {props.title ? (
                    <div
                        style={{
                            fontFamily: SERIF,
                            fontWeight: 600,
                            fontSize: 40,
                            color: theme.ink,
                            marginLeft: 20,
                        }}
                    >
                        {props.title}
                    </div>
                ) : (
                    <div
                        style={{
                            marginLeft: 20,
                            width: 380,
                            height: 32,
                            borderRadius: 16,
                            background: mixColor(theme.paper, theme.accent, props.pill ?? 0),
                        }}
                    />
                )}
            </div>
            <div style={{ position: "relative", height: props.h - 64 }}>{props.children}</div>
        </Paper>
    );
}

// ---------------------------------------------------------------- lines 0-1: the ask

const ASK_X = [485, 695, 905, 1115];
const ASK_CUE = [0.33, 0.44, 0.55, 0.88];
const HEAP: { x: number; y: number; r: number }[] = [
    { x: 640, y: 655, r: -22 },
    { x: 760, y: 668, r: 14 },
    { x: 880, y: 650, r: -8 },
    { x: 745, y: 588, r: 28 },
];

function Ask() {
    const { p, s, theme } = useClock();
    const win = s(L(0, 0, -0.4));
    return (
        <>
            <At x={0} y={0}>
                <Tag text="The ask" at={L(0, 0)} seed="ops-ask" />
            </At>
            <At
                x={330}
                y={30}
                style={{
                    opacity: Math.min(1, win * 2),
                    transform: `translateY(${(1 - win) * -90}px) rotate(${(1 - win) * -5 - 1}deg)`,
                }}
            >
                <Paper
                    seed="ask-note"
                    color="#f4e7c3"
                    style={{ width: 940, height: 540 }}
                    innerStyle={{ padding: "40px 50px", boxSizing: "border-box" }}
                    lift={1.3}
                    sway={0.5}
                >
                    <div
                        style={{
                            fontFamily: SERIF,
                            fontStyle: "italic",
                            fontSize: 52,
                            color: theme.inkSoft,
                            borderBottom: `4px solid ${theme.accent}`,
                            display: "inline-block",
                            paddingBottom: 6,
                        }}
                    >
                        the owner&apos;s ask
                    </div>
                </Paper>
                <div
                    style={{
                        position: "absolute",
                        left: 454,
                        top: -14,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: theme.accent,
                        filter: paperShadow(theme, 0.5),
                    }}
                />
            </At>
            {ICONS.map((kind, i) => {
                const a = s(L(0, ASK_CUE[i]));
                const fall = p(L(1, 0.02 + i * 0.07), 0.55, true);
                const g = fall * fall;
                const h = HEAP[i];
                const x = mix(ASK_X[i], h.x, fall);
                const y = mix(300, h.y, g);
                const rot = h.r * fall;
                return (
                    <At
                        key={kind}
                        x={x - 65}
                        y={y - 65}
                        w={130}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `scale(${0.5 + 0.5 * a}) rotate(${rot}deg)`,
                        }}
                    >
                        <Paper
                            seed={`ask-${kind}`}
                            color={theme.paperAlt}
                            style={{ width: 130, height: 130 }}
                            innerStyle={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            lift={1.2}
                        >
                            <ControlIcon
                                kind={kind}
                                size={72}
                                color={theme.ink}
                                accent={theme.accent}
                            />
                        </Paper>
                        <div
                            style={{ textAlign: "center", marginTop: 12, opacity: 1 - fall * 1.5 }}
                        >
                            <Mono color={theme.ink}>{kind}</Mono>
                        </div>
                    </At>
                );
            })}
        </>
    );
}

// ---------------------------------------------------------------- lines 2-6: the control room

function ServiceBox(props: { i: number; crack: number; off: number }) {
    const { s, theme } = useClock();
    const a = s(L(2, props.i * 0.06));
    const color = mixColor(mixColor(theme.paper, GREY, props.off), DARK_RED, props.crack);
    const ink = mixColor(theme.ink, theme.paper, props.crack);
    return (
        <At
            x={SX[props.i] - BW / 2}
            y={SY - BH / 2}
            w={BW}
            h={BH}
            style={{ opacity: Math.min(1, a * 2), transform: `scale(${0.6 + 0.4 * a})` }}
        >
            <Paper
                seed={`svc-${props.i}`}
                color={color}
                style={{ width: "100%", height: "100%" }}
                innerStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                }}
            >
                <svg width={90} height={48} viewBox="0 0 90 48">
                    {[4, 26].map((y) => (
                        <g key={y}>
                            <rect
                                x={6}
                                y={y}
                                width={78}
                                height={18}
                                rx={4}
                                fill="none"
                                stroke={ink}
                                strokeWidth={4}
                            />
                            <circle cx={20} cy={y + 9} r={3.5} fill={CHIP[props.i]} />
                        </g>
                    ))}
                </svg>
                <Mono size={30} color={ink}>
                    {SERVICES[props.i]}
                </Mono>
            </Paper>
            {props.crack > 0 && (
                <svg
                    width={BW}
                    height={BH}
                    style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
                >
                    <path
                        d="M120 -6 L104 40 L132 70 L110 112 L126 166"
                        fill="none"
                        stroke={theme.ink}
                        strokeWidth={6}
                        strokeLinejoin="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - props.crack}
                    />
                </svg>
            )}
        </At>
    );
}

const MESSY = [
    { amp: 4, wl: 14, rot: -4, color: "#191919", w: 4 },
    { amp: 10, wl: 34, rot: 3, color: "#3a6ea5", w: 3 },
    { amp: 6, wl: 22, rot: -2, color: "#8a4f9e", w: 5 },
    { amp: 12, wl: 44, rot: 5, color: "#2f7d5a", w: 3 },
];
const LEVELS = [
    ["INFO", "INFO", "WARN"],
    ["INFO", "WARN", "INFO"],
    ["INFO", "INFO", "INFO"],
    ["WARN", "INFO", "INFO"],
];

/** The log ribbon under a service: messy, then one shared format, then rolled up. */
function Ribbon(props: { i: number }) {
    const { p, t, theme } = useClock();
    const i = props.i;
    const print = p(L(2, 0.06 + i * 0.03), { until: L(2, 0.38) });
    const tidy = p(L(2, 0.42), 0.7);
    const roll = p(L(2, 0.76), { until: L(2, "end") });
    const h = 172 * print * (1 - roll);
    const m = MESSY[i];
    const rollSize = 72 * Math.min(1, roll * 3 + (roll > 0 ? 0.2 : 0));
    return (
        <>
            <At x={SX[i] - 140} y={SY + BH / 2 + 8} w={280} h={h} style={{ overflow: "hidden" }}>
                <div
                    style={{
                        width: 280,
                        height: 172,
                        background: theme.paper,
                        filter: paperShadow(theme, 0.6),
                        padding: "10px 12px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    {LEVELS[i].map((lvl, r) => (
                        <div key={r} style={{ position: "relative", height: 40 }}>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 12,
                                    opacity: 1 - tidy,
                                    transform: `rotate(${m.rot}deg)`,
                                }}
                            >
                                <Scribble
                                    w={220 - r * 30}
                                    seed={`messy-${i}-${r}`}
                                    color={m.color}
                                    amp={m.amp}
                                    wavelength={m.wl}
                                    width={m.w}
                                />
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    opacity: tidy,
                                }}
                            >
                                <div
                                    style={{
                                        background: CHIP[i],
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                    }}
                                >
                                    <Mono size={28} color={theme.ink}>
                                        {SERVICES[i]}
                                    </Mono>
                                </div>
                                <Mono
                                    size={28}
                                    color={lvl === "WARN" ? theme.accent : theme.inkSoft}
                                    style={{ letterSpacing: 0 }}
                                >
                                    {lvl}
                                </Mono>
                            </div>
                        </div>
                    ))}
                </div>
            </At>
            {roll > 0 && (
                <At x={SX[i] - rollSize / 2} y={SY + BH / 2 + 14} w={rollSize} h={rollSize}>
                    <svg
                        width={rollSize}
                        height={rollSize}
                        viewBox="-40 -40 80 80"
                        style={{
                            display: "block",
                            filter: paperShadow(theme, 0.6),
                            transform: `rotate(${t * 70 + i * 40}deg)`,
                        }}
                    >
                        <circle r={36} fill={theme.paper} />
                        <path
                            d="M0 0 m 0 -6 a 6 6 0 1 1 -6 6 a 12 12 0 1 1 12 12 a 18 18 0 1 1 -18 -18 a 26 26 0 1 1 26 26"
                            fill="none"
                            stroke={theme.inkSoft}
                            strokeWidth={3}
                        />
                        <circle r={5} fill={CHIP[i]} />
                    </svg>
                </At>
            )}
        </>
    );
}

function fmtUp(sec: number): string {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** The gauge card over a service: state, CPU, memory, uptime. */
function Gauge(props: {
    i: number;
    state: "run" | "stop" | "dead";
    upBase: number;
    upFrom: number;
    style?: React.CSSProperties;
    width?: number;
    cue: Cue;
}) {
    const { p, s, t, theme } = useClock();
    const i = props.i;
    const a = s(props.cue);
    const bars = p(props.cue, 1.2);
    const live = props.state === "run" ? 1 : 0;
    const cpu = live * (0.35 + 0.25 * Math.sin(t * 2.1 + i * 1.7) + 0.1 * Math.sin(t * 5.3 + i));
    const mem = live * (0.5 + 0.08 * Math.sin(t * 0.7 + i * 2.3));
    const stateText = props.state === "run" ? "running" : "stopped";
    const stateColor = props.state === "run" ? GREEN : props.state === "dead" ? RED : GREY;
    const up = props.state === "run" ? fmtUp(props.upBase + (t - props.upFrom)) : "-:--:--";
    const w = props.width ?? 250;
    const bar = (label: string, v: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mono size={28} color={theme.inkSoft} style={{ width: 62 }}>
                {label}
            </Mono>
            <div style={{ flex: 1, height: 18, background: theme.paperAlt, borderRadius: 4 }}>
                <div
                    style={{
                        width: `${Math.max(0, v * bars) * 100}%`,
                        height: "100%",
                        background: theme.second,
                        borderRadius: 4,
                    }}
                />
            </div>
        </div>
    );
    return (
        <div
            style={{
                width: w,
                opacity: Math.min(1, a * 2),
                transform: `translateY(${(1 - a) * 30}px)`,
                ...props.style,
            }}
        >
            <Paper
                seed={`gauge-${i}-${w}`}
                style={{ width: w }}
                innerStyle={{
                    padding: "10px 14px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
                sway={0.4}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{ width: 18, height: 18, borderRadius: 9, background: stateColor }}
                    />
                    <Mono size={28} color={props.state === "dead" ? RED : theme.ink}>
                        {stateText}
                    </Mono>
                </div>
                {bar("CPU", cpu)}
                {bar("MEM", mem)}
                <Mono size={28} color={theme.ink} style={{ letterSpacing: 0 }}>
                    up {up}
                </Mono>
            </Paper>
        </div>
    );
}

const THREAD_FROM: Point = [SUP[0] - 120, SUP[1] + 92];
const threadEnd = (i: number): Point => [SX[i] + 70, SY + BH / 2 + 6];
const threadCtl = (i: number): Point => [(SX[i] + THREAD_FROM[0]) / 2, 690 - i * 18];

function Supervisor(props: { glow: number }) {
    const { s, t, theme, p } = useClock();
    const a = s(L(3, 0.05));
    const slide = 1 - p(L(3, 0.05), 0.8);
    const pulse = props.glow * (1 + 0.12 * Math.sin(t * 9));
    return (
        <At
            x={SUP[0] - 140 + slide * 420}
            y={SUP[1] - 95}
            w={280}
            h={190}
            style={{ opacity: Math.min(1, a * 2) }}
        >
            {props.glow > 0 && (
                <div
                    style={{
                        position: "absolute",
                        inset: -14,
                        borderRadius: 18,
                        border: `6px solid ${theme.accent}`,
                        opacity: 0.55 + 0.35 * Math.sin(t * 6),
                    }}
                />
            )}
            <Paper
                seed="supervisor"
                color={theme.second}
                style={{ width: "100%", height: "100%" }}
                innerStyle={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                }}
                lift={1.3}
            >
                <svg width={96} height={50} viewBox="0 0 96 50">
                    <path
                        d="M4 25 C24 2 72 2 92 25 C72 48 24 48 4 25 Z"
                        fill={theme.paper}
                        stroke={theme.ink}
                        strokeWidth={4}
                    />
                    <circle cx={48 + 8 * Math.sin(t * 0.9)} cy={25} r={11} fill={theme.ink} />
                </svg>
                <Mono size={30} color={theme.ink}>
                    Supervisor
                </Mono>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ transform: `scale(${1 + 0.25 * (pulse - props.glow)})` }}>
                        <ControlIcon
                            kind="start"
                            size={34}
                            color={theme.ink}
                            accent={props.glow > 0 ? theme.accent : theme.ink}
                        />
                    </div>
                    <ControlIcon kind="stop" size={34} color={theme.ink} accent={theme.accent} />
                </div>
            </Paper>
        </At>
    );
}

/** The supervisor's live log pane. */
function LogPane(props: { apiOnly: number }) {
    const { s, t, theme } = useClock();
    const a = s(L(5, 0.55));
    const rows = 4;
    const step = 46;
    const scroll = (t * 52) % step;
    const base = Math.floor((t * 52) / step);
    return (
        <At
            x={SUP[0] - 140}
            y={SUP[1] + 120}
            w={280}
            h={236}
            style={{ opacity: Math.min(1, a * 2), transform: `translateY(${(1 - a) * 30}px)` }}
        >
            <Paper
                seed="sup-pane"
                color={theme.ink}
                style={{ width: 280, height: 236 }}
                innerStyle={{ position: "relative", overflow: "hidden" }}
            >
                {Array.from({ length: rows + 1 }, (_, r) => {
                    const n = base + r;
                    const svc = props.apiOnly > 0.5 ? 1 : n % 4;
                    const lvl =
                        props.apiOnly > 0.5 ? (n % 2 ? "ERROR" : "WARN") : n % 5 ? "INFO" : "WARN";
                    const sec = (12 * 60 + n * 7) % 3600;
                    const time = `${String(Math.floor(sec / 60) % 24).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
                    return (
                        <div
                            key={n}
                            style={{
                                position: "absolute",
                                left: 14,
                                top: 14 + (rows - r) * step - scroll - step,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 16,
                                    height: 26,
                                    borderRadius: 3,
                                    background: CHIP[svc],
                                }}
                            />
                            <Mono size={28} color={theme.paper} style={{ letterSpacing: 0 }}>
                                {time}
                            </Mono>
                            <Mono
                                size={28}
                                color={lvl === "INFO" ? theme.onBgSoft : theme.accent}
                                style={{ letterSpacing: 0 }}
                            >
                                {lvl}
                            </Mono>
                        </div>
                    );
                })}
            </Paper>
        </At>
    );
}

function ControlRoom() {
    const { p, s, t, at, frame, fps, theme } = useClock();
    const crack = p(L(6, 0.08), 0.5);
    const workersOff = p(L(5, 0.22), 0.25) * (1 - p(L(5, 0.5), 0.25));
    const workersState = workersOff > 0.5 ? "stop" : "run";
    const restartAt = at(L(5, 0.5)) / fps;
    const gapIn = p(L(3, 0.35), 0.6);
    const gapLabel = gapIn * (1 - p(L(4, 0), 0.5));
    const streamOn = frame >= at(L(5, 0.55));
    const apiStop = at(L(6, 0.1)) / fps;
    const tap = p(L(5, 0.05), 0.5);
    const tapPoint = quad(THREAD_FROM, threadCtl(3), threadEnd(3), tap);
    return (
        <>
            <At x={0} y={0}>
                <Tag
                    text="One log format, tagged by app"
                    at={L(2, 0.45)}
                    seed="ops-format"
                    style={{ opacity: 1 - p(L(3, 0), 0.4) }}
                />
            </At>
            <Ink>
                {SERVICES.map((_, i) => (
                    <path
                        key={i}
                        d={`M ${THREAD_FROM[0]} ${THREAD_FROM[1]} Q ${threadCtl(i)[0]} ${threadCtl(i)[1]} ${threadEnd(i)[0]} ${threadEnd(i)[1]}`}
                        fill="none"
                        stroke={i === 1 && crack > 0.5 ? RED : theme.onBgSoft}
                        strokeWidth={3.5}
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - p(L(4, 0.02 + i * 0.05), 0.7)}
                    />
                ))}
                {streamOn &&
                    SERVICES.map((_, i) =>
                        Array.from({ length: 4 }, (_, k) => {
                            const ph = (t * 0.55 + k / 4 + i * 0.13) % 1;
                            if (i === 1 && t - ph / 0.55 > apiStop) return null;
                            const [x, y] = quad(threadEnd(i), threadCtl(i), THREAD_FROM, ph);
                            return (
                                <rect
                                    key={`${i}-${k}`}
                                    x={x - 14}
                                    y={y - 6}
                                    width={28}
                                    height={12}
                                    rx={3}
                                    fill={CHIP[i]}
                                />
                            );
                        }),
                    )}
                {tap > 0 && tap < 1 && (
                    <circle cx={tapPoint[0]} cy={tapPoint[1]} r={14} fill={theme.accent} />
                )}
                <InkLine
                    from={[1238, 280]}
                    to={[1238, 510]}
                    p={gapIn}
                    color={theme.accent}
                    width={5}
                    dashed
                    seed="gap"
                />
            </Ink>
            <At x={1238 - 160} y={220} w={320} style={{ textAlign: "center", opacity: gapLabel }}>
                <Mono color={theme.accent}>no dependency</Mono>
            </At>
            {SERVICES.map((_, i) => (
                <Ribbon key={`r${i}`} i={i} />
            ))}
            {SERVICES.map((_, i) => (
                <ServiceBox
                    key={`b${i}`}
                    i={i}
                    crack={i === 1 ? crack : 0}
                    off={i === 3 ? workersOff : 0}
                />
            ))}
            {SERVICES.map((_, i) => (
                <At key={`g${i}`} x={SX[i] - 125} y={110}>
                    <Gauge
                        i={i}
                        cue={L(4, 0.1 + i * 0.08)}
                        state={i === 1 && crack > 0.3 ? "dead" : i === 3 ? workersState : "run"}
                        upBase={i === 3 && t > restartAt ? 0 : 3 * 3600 + i * 1517}
                        upFrom={i === 3 && t > restartAt ? restartAt : 0}
                    />
                </At>
            ))}
            <At
                x={SX[1] - 120}
                y={SY + 96}
                w={240}
                style={{ textAlign: "center", opacity: p(L(6, 0.3), 0.4) }}
            >
                <Tag text="won't start" color={RED} at={L(6, 0.3)} seed="api-dead" size={28} />
            </At>
            <Supervisor glow={p(L(6, 0.35), 0.4)} />
            <LogPane apiOnly={p(L(6, 0.45), 0.2)} />
            <At
                x={SX[3] - 125}
                y={SY + 96}
                w={250}
                style={{
                    textAlign: "center",
                    opacity: s(L(5, 0.22)) * (1 - p(L(5, 0.75), 0.3)),
                }}
            >
                <Mono color={theme.onBg}>{workersOff > 0.5 ? "stop" : "start"}</Mono>
            </At>
        </>
    );
}

// ---------------------------------------------------------------- lines 7-8: pause is a row

const FLEET_X = [600, 760, 920, 1080, 1240, 1400];
const FLEET_Y = 560;
const INFLIGHT = 3;

function PauseRow() {
    const { p, s, t, at, fps, frame, theme } = useClock();
    const db = s(L(7, 0.05));
    const drawer = p(L(7, 0.3), 0.8);
    const flipP = p(L(8, 0.12), 0.45);
    const flipped = flipP > 0.5;
    const flipScale = Math.abs(Math.cos(flipP * Math.PI));
    const stopAt = at(L(8, 0.28)) / fps;
    const finishAt = at(L(8, 0.66)) / fps;
    const lastStop = at(L(8, 0.84)) / fps;
    const spin = (j: number) => {
        const end = j === INFLIGHT ? lastStop : stopAt;
        const run = Math.min(t, end);
        const coast = t > end ? Math.min(0.35, t - end) : 0;
        return (run * 160 + j * 23 + coast * 80 * (1 - coast / 0.7)) % 360;
    };
    const cardFill = clamp01((t - at(L(7, 0.2)) / fps) / (finishAt - at(L(7, 0.2)) / fps));
    const drop = p(L(8, 0.68), 0.45, true);
    const tray: Point = [FLEET_X[INFLIGHT], 700];
    const links = p(L(7, 0.88), 0.8);
    return (
        <>
            <At x={0} y={0}>
                <Tag text="Pause = one row" at={L(7, 0.05)} seed="ops-row" />
            </At>
            {/* The drawer: one row pulled out of the database. */}
            <At
                x={mix(80, 350, drawer)}
                y={250}
                w={620}
                h={96}
                style={{ opacity: drawer > 0 ? 1 : 0 }}
            >
                <div style={{ transform: `scaleY(${flipScale})`, width: "100%", height: "100%" }}>
                    <Paper
                        seed="pause-row"
                        color={flipped ? theme.accent : theme.paper}
                        style={{ width: "100%", height: "100%" }}
                        innerStyle={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 18,
                        }}
                        lift={1.4}
                    >
                        <span
                            style={{
                                fontFamily: MONO,
                                fontSize: 38,
                                fontWeight: 500,
                                color: theme.ink,
                            }}
                        >
                            workers_paused =
                        </span>
                        <span
                            style={{
                                fontFamily: MONO,
                                fontSize: 38,
                                fontWeight: 600,
                                color: flipped ? "#fffaf2" : theme.second,
                            }}
                        >
                            {flipped ? "true" : "false"}
                        </span>
                    </Paper>
                </div>
            </At>
            <At
                x={40}
                y={130}
                style={{ opacity: Math.min(1, db * 2), transform: `scale(${0.7 + 0.3 * db})` }}
            >
                <Cylinder w={300} h={380} label="Database" />
            </At>
            {/* Not a signal, not a file. */}
            {[
                { label: "signal", at: 0.62, x: 1110 },
                { label: "file", at: 0.76, x: 1350 },
            ].map((n) => {
                const a = s(L(7, n.at));
                const x = p(L(7, n.at + 0.06), 0.4);
                return (
                    <At
                        key={n.label}
                        x={n.x}
                        y={40}
                        w={200}
                        style={{
                            opacity: Math.min(1, a * 2) * (1 - p(L(8, 0.05), 0.5) * 0.6),
                            transform: `scale(${0.6 + 0.4 * a})`,
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: 120,
                                height: 120,
                                margin: "0 auto",
                            }}
                        >
                            <svg width={120} height={120} viewBox="0 0 60 60">
                                {n.label === "signal" ? (
                                    <path
                                        d="M34 4 L14 34 H28 L22 56 L46 22 H32 Z"
                                        fill={theme.third}
                                    />
                                ) : (
                                    <path
                                        d="M14 4 H36 L48 16 V56 H14 Z M36 4 V16 H48"
                                        fill={theme.paper}
                                        stroke={theme.ink}
                                        strokeWidth={3}
                                        strokeLinejoin="round"
                                    />
                                )}
                            </svg>
                            <div style={{ position: "absolute", left: 10, top: 10 }}>
                                <Mark ok={false} size={100} p={x} />
                            </div>
                        </div>
                        <Mono color={theme.onBg}>{n.label}</Mono>
                    </At>
                );
            })}
            <Ink>
                {FLEET_X.map((x, j) => (
                    <InkLine
                        key={j}
                        from={[mix(80, 350, 1) + 400, 352]}
                        to={[x, FLEET_Y - 82]}
                        p={links}
                        color={flipped ? theme.accent : theme.onBgSoft}
                        width={3}
                        dashed
                        seed={`link-${j}`}
                        bow={0.02}
                    />
                ))}
            </Ink>
            {FLEET_X.map((x, j) => {
                const a = s(L(7, 0.12 + j * 0.04));
                const stopped = t > (j === INFLIGHT ? lastStop : stopAt);
                return (
                    <At
                        key={j}
                        x={x - 65}
                        y={FLEET_Y - 65}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `scale(${0.6 + 0.4 * a})`,
                        }}
                    >
                        <WorkerBox seed={`fleet-${j}`} angle={spin(j)} dim={stopped ? 0.7 : 0} />
                    </At>
                );
            })}
            {/* The study in flight: it finishes, drops in the tray, then its worker stops. */}
            {frame >= at(L(7, 0.3)) && (
                <At
                    x={mix(FLEET_X[INFLIGHT] - 46, tray[0] + 44, drop)}
                    y={mix(FLEET_Y - 150, tray[1] - 30, drop * drop)}
                    style={{ zIndex: 3, transform: `rotate(${drop * 14}deg)` }}
                >
                    <StudyCard seed="inflight" w={92} done={cardFill >= 1} />
                    {drop === 0 && (
                        <div
                            style={{
                                marginTop: 8,
                                width: 92,
                                height: 10,
                                background: theme.paperAlt,
                                borderRadius: 5,
                            }}
                        >
                            <div
                                style={{
                                    width: `${cardFill * 100}%`,
                                    height: "100%",
                                    background: theme.accent,
                                    borderRadius: 5,
                                }}
                            />
                        </div>
                    )}
                </At>
            )}
            <At
                x={tray[0] + 30}
                y={tray[1] - 6}
                style={{ opacity: s(L(8, 0.45)), display: "flex", alignItems: "center", gap: 14 }}
            >
                <Paper
                    seed="tray"
                    color={theme.paperAlt}
                    style={{ width: 250, height: 44 }}
                    innerStyle={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: 20,
                    }}
                >
                    <Mono size={28} color={theme.ink}>
                        done
                    </Mono>
                </Paper>
            </At>
            <At
                x={FLEET_X[0] - 65}
                y={FLEET_Y + 80}
                style={{
                    opacity: s(L(8, 0.3)),
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <ControlIcon kind="pause" size={36} color={theme.accent} accent={theme.accent} />
                <Mono color={theme.accent}>paused together</Mono>
            </At>
        </>
    );
}

// ---------------------------------------------------------------- line 9 and 13: the Operations page

function OpsPage(props: { logs: boolean; hop: boolean; children?: React.ReactNode }) {
    const { p, s, t, theme } = useClock();
    const tileW = 360;
    return (
        <Browser w={1560} h={720} seed="ops-page" title="Operations">
            {/* The four buttons from line 1 hop back into the toolbar. */}
            <div style={{ position: "absolute", right: 30, top: -60, display: "flex", gap: 16 }}>
                {ICONS.map((kind, i) => {
                    const h = props.hop ? p(L(9, 0.45 + i * 0.08), 0.5) : 1;
                    const y = (1 - h) * 760 - Math.sin(h * Math.PI) * 90;
                    return (
                        <div
                            key={kind}
                            style={{
                                transform: `translateY(${y}px) rotate(${(1 - h) * HEAP[i].r}deg)`,
                            }}
                        >
                            <Paper
                                seed={`hop-${kind}`}
                                color={theme.paper}
                                style={{ width: 52, height: 52 }}
                                innerStyle={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ControlIcon
                                    kind={kind}
                                    size={34}
                                    color={theme.ink}
                                    accent={theme.accent}
                                />
                            </Paper>
                        </div>
                    );
                })}
            </div>
            {SERVICES.map((name, i) => {
                const a = props.hop ? s(L(9, 0.08 + i * 0.07)) : 1;
                return (
                    <div
                        key={name}
                        style={{
                            position: "absolute",
                            left: 30 + i * (tileW + 22),
                            top: 26,
                            width: tileW,
                            opacity: Math.min(1, a * 2),
                            transform: `translateY(${(1 - a) * 30}px)`,
                        }}
                    >
                        <div
                            style={{
                                background: theme.paperAlt,
                                borderRadius: 10,
                                padding: "12px 16px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Mono size={30} color={theme.ink}>
                                {name}
                            </Mono>
                            <div style={{ display: "flex", gap: 8 }}>
                                {(["start", "pause", "stop"] as IconKind[]).map((k) => (
                                    <ControlIcon
                                        key={k}
                                        kind={k}
                                        size={30}
                                        color={theme.ink}
                                        accent={theme.accent}
                                    />
                                ))}
                            </div>
                        </div>
                        <Gauge
                            i={i}
                            cue={props.hop ? L(9, 0.12 + i * 0.07) : L(0, 0)}
                            state="run"
                            upBase={2 * 3600 + i * 2711}
                            upFrom={0}
                            width={tileW}
                            style={{ marginTop: 10 }}
                        />
                    </div>
                );
            })}
            {props.logs && (
                <div
                    style={{
                        position: "absolute",
                        left: 30,
                        right: 30,
                        top: 330,
                        bottom: 26,
                        background: theme.ink,
                        borderRadius: 10,
                        overflow: "hidden",
                        opacity: props.hop ? p(L(9, 0.3), 0.5) : 1,
                    }}
                >
                    {Array.from({ length: 7 }, (_, r) => {
                        const step = 50;
                        const off = (t * 60) % step;
                        const n = Math.floor((t * 60) / step) + r;
                        const svc = (n * 3) % 4;
                        return (
                            <div
                                key={n}
                                style={{
                                    position: "absolute",
                                    left: 24,
                                    top: 300 - r * step + off - step,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 18,
                                }}
                            >
                                <Mono size={28} color={theme.onBgSoft} style={{ letterSpacing: 0 }}>
                                    {`12:${String(4 + Math.floor(n / 9)).padStart(2, "0")}:${String((n * 7) % 60).padStart(2, "0")}`}
                                </Mono>
                                <div
                                    style={{
                                        background: CHIP[svc],
                                        padding: "0 8px",
                                        borderRadius: 4,
                                    }}
                                >
                                    <Mono size={28} color={theme.ink}>
                                        {SERVICES[svc]}
                                    </Mono>
                                </div>
                                <Mono
                                    size={28}
                                    color={n % 6 ? theme.paper : theme.accent}
                                    style={{ letterSpacing: 0 }}
                                >
                                    {n % 6 ? "INFO" : "WARN"}
                                </Mono>
                                <Scribble
                                    w={420 + ((n * 97) % 400)}
                                    seed={`op-log-${n}`}
                                    color={theme.inkSoft}
                                    amp={6}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
            {props.children}
        </Browser>
    );
}

function OpsShot() {
    const { p } = useClock();
    const away = p(L(10, 0), 0.9);
    const unfold = p(L(9, 0, -0.15), 0.8);
    return (
        <At
            x={20}
            y={20}
            style={{
                transform: `translateY(${away * 700}px) perspective(2400px) rotateX(${(1 - unfold) * -85}deg)`,
                transformOrigin: "50% 0",
                opacity: Math.min(1, unfold * 3),
            }}
        >
            <OpsPage logs hop />
        </At>
    );
}

// ---------------------------------------------------------------- lines 10-12: the cloud

const CLOUD_BOXES = ["web hosting", "monitoring", "log store", "files", "secrets"];
const CB_X = [280, 540, 800, 1060, 1320];
const KEEP_X = [670, 930];

const ROOM_X = [230, 470, 710, 950];
const ROOM_Y = 560;

/** The control room under the cloud: only "files" and "secrets" are wired to it. */
function CloudRoom(props: { regroup: number }) {
    const { p, s, theme } = useClock();
    const hide = p(L(12, 0, -0.1), 0.4);
    const wires = p(L(10, 0.6), 0.6);
    const unused = s(L(11, 0.02));
    if (hide >= 1) return null;
    return (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - hide }}>
            <Ink>
                {/* A bus over the whole control room: the two kept boxes serve the apps as a group. */}
                <InkLine
                    from={[ROOM_X[0], ROOM_Y - 30]}
                    to={[1450, ROOM_Y - 30]}
                    p={wires}
                    color={theme.second}
                    width={5}
                    seed="room-bus"
                    bow={0.005}
                />
                {[3, 4].map((i) => {
                    const x = mix(CB_X[i], KEEP_X[i - 3], props.regroup);
                    return (
                        <InkLine
                            key={i}
                            from={[x, 298]}
                            to={[x, ROOM_Y - 34]}
                            p={wires}
                            color={theme.second}
                            width={4}
                            dashed
                            seed={`wire-${i}`}
                        />
                    );
                })}
            </Ink>
            {[0, 1, 2].map((i) => (
                <At
                    key={i}
                    x={CB_X[i] - 80}
                    y={302}
                    w={160}
                    style={{
                        textAlign: "center",
                        opacity: unused * (1 - p(L(11, 0.5 + i * 0.09), 0.3)),
                    }}
                >
                    <Mono size={28} color={theme.ink}>
                        no users
                    </Mono>
                </At>
            ))}
            {[...SERVICES, "Supervisor"].map((name, i) => {
                const a = s(L(10, 0.35), i * 0.06);
                const sup = i === 4;
                return (
                    <At
                        key={name}
                        x={sup ? 1210 : ROOM_X[i]}
                        y={ROOM_Y}
                        w={sup ? 240 : 210}
                        h={100}
                        style={{
                            opacity: Math.min(1, a * 2),
                            transform: `translateY(${(1 - a) * 40}px)`,
                        }}
                    >
                        <Paper
                            seed={`room-${i}`}
                            color={sup ? theme.second : theme.paper}
                            style={{ width: "100%", height: "100%" }}
                            innerStyle={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Mono size={28} color={theme.ink}>
                                {name}
                            </Mono>
                        </Paper>
                    </At>
                );
            })}
        </div>
    );
}

function CloudShot() {
    const { p, s, theme } = useClock();
    const pan = 1 - p(L(10, 0, -0.1), 0.9);
    const snip = p(L(11, 0.42), { until: L(11, 0.72) });
    const scX = mix(CB_X[0] - 130, CB_X[2] + 150, snip);
    const regroup = p(L(11, 0.8), 0.6);
    const chainDraw = p(L(12, 0), { until: L(12, 0.35) });
    const fold = p(L(12, 0.4), { until: L(12, 0.72) });
    const block = s(L(12, 0.68));
    const rollback = p(L(12, 0.8), 0.5);
    const steps = 8;
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                transform: `translateY(${-pan * 600 + 40}px)`,
            }}
        >
            <At x={0} y={0}>
                <Tag text="The cloud" at={L(10, 0.1)} seed="ops-cloud" color={theme.second} />
            </At>
            <At x={100} y={30}>
                <svg
                    width={1400}
                    height={410}
                    viewBox="0 0 1400 410"
                    style={{
                        display: "block",
                        filter: paperShadow(theme, 1.2),
                        overflow: "visible",
                    }}
                >
                    <path
                        d="M120 400 C20 400 0 300 70 260 C30 170 130 110 220 140 C250 40 420 10 500 80 C560 0 760 -10 820 70 C900 10 1080 20 1110 120 C1220 90 1340 160 1310 250 C1400 280 1390 400 1290 400 Z"
                        fill={theme.paperAlt}
                    />
                </svg>
            </At>
            {CLOUD_BOXES.map((label, i) => {
                const a = s(L(10, 0.25 + i * 0.08));
                const doomed = i < 3;
                const cross = doomed ? p(L(11, 0.06 + i * 0.1), 0.45) : 0;
                const cut = doomed ? clamp01((scX - CB_X[i]) / 60) : 0;
                const fall = doomed ? p(L(11, 0.5 + i * 0.09), 0.7, true) : 0;
                const x = doomed ? CB_X[i] : mix(CB_X[i], KEEP_X[i - 3], regroup);
                return (
                    <At
                        key={label}
                        x={x - 120}
                        y={180 + fall * fall * 700}
                        w={240}
                        h={110}
                        style={{
                            opacity: Math.min(1, a * 2) * (1 - fall),
                            transform: `scale(${0.6 + 0.4 * a}) rotate(${fall * (i - 1) * 30}deg)`,
                        }}
                    >
                        <Paper
                            seed={`cloud-${i}`}
                            color={doomed ? mixColor(theme.paper, GREY, cut * 0.5) : theme.paper}
                            style={{ width: "100%", height: "100%" }}
                            innerStyle={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Mono size={28} color={theme.ink}>
                                {label}
                            </Mono>
                        </Paper>
                        {cross > 0 && (
                            <div style={{ position: "absolute", left: 70, top: 5 }}>
                                <Mark ok={false} size={100} p={cross} />
                            </div>
                        )}
                    </At>
                );
            })}
            <CloudRoom regroup={regroup} />
            {snip > 0 && snip < 1 && (
                <At x={scX - 50} y={120}>
                    <svg width={110} height={80} viewBox="0 0 110 80">
                        <circle
                            cx={18}
                            cy={20}
                            r={13}
                            fill="none"
                            stroke={theme.accent}
                            strokeWidth={6}
                        />
                        <circle
                            cx={18}
                            cy={60}
                            r={13}
                            fill="none"
                            stroke={theme.accent}
                            strokeWidth={6}
                        />
                        <path
                            d={`M28 28 L104 ${44 - 10 * Math.abs(Math.sin(snip * 30))} M28 52 L104 ${36 + 10 * Math.abs(Math.sin(snip * 30))}`}
                            stroke={theme.onBg}
                            strokeWidth={7}
                            strokeLinecap="round"
                        />
                    </svg>
                </At>
            )}
            {/* Deploys: many steps fold into one job with a rollback. */}
            {Array.from({ length: steps }, (_, i) => {
                const show = clamp01(chainDraw * steps - i);
                const x0 = 100 + i * 190;
                const x = mix(x0, 800 - 45, fold);
                return (
                    <At
                        key={i}
                        x={x}
                        y={490}
                        style={{
                            opacity: show * (1 - clamp01((fold - 0.85) * 8)),
                            transform: `scale(${0.6 + 0.4 * show}) scaleX(${1 - fold * 0.6})`,
                        }}
                    >
                        <Paper
                            seed={`step-${i}`}
                            style={{ width: 90, height: 90 }}
                            innerStyle={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Scribble w={56} seed={`step-s-${i}`} color={theme.inkSoft} amp={6} />
                        </Paper>
                    </At>
                );
            })}
            <Ink>
                {Array.from({ length: steps - 1 }, (_, i) => (
                    <path
                        key={i}
                        d={`M ${100 + i * 190 + 100} 535 L ${100 + (i + 1) * 190 - 10} 535`}
                        stroke={theme.onBgSoft}
                        strokeWidth={4}
                        strokeLinecap="round"
                        opacity={clamp01(chainDraw * steps - i - 1) * (1 - fold)}
                    />
                ))}
                {rollback > 0 && (
                    <>
                        <path
                            d="M 960 610 Q 800 730 640 610"
                            fill="none"
                            stroke={theme.second}
                            strokeWidth={6}
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray={1}
                            strokeDashoffset={1 - rollback}
                        />
                        {rollback > 0.95 && (
                            <path
                                d="M 640 610 L 668 614 M 640 610 L 650 636"
                                stroke={theme.second}
                                strokeWidth={6}
                                strokeLinecap="round"
                            />
                        )}
                    </>
                )}
            </Ink>
            <At
                x={800 - 160}
                y={480}
                w={320}
                h={115}
                style={{
                    opacity: Math.min(1, block * 2),
                    transform: `scale(${0.5 + 0.5 * block})`,
                }}
            >
                <Paper
                    seed="deploy-block"
                    color={theme.accent}
                    style={{ width: "100%", height: "100%" }}
                    innerStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    lift={1.3}
                >
                    <Mono size={40} color="#fffaf2">
                        deploy
                    </Mono>
                </Paper>
            </At>
            <At x={800 - 150} y={672} w={300} style={{ textAlign: "center", opacity: rollback }}>
                <Mono color={theme.second}>rollback</Mono>
            </At>
        </div>
    );
}

// ---------------------------------------------------------------- line 13: push to live

function PushToLive() {
    const { p, theme } = useClock();
    const grow = p(L(13, 0.15), { until: L(13, 0.45) });
    const shrink = p(L(13, 0.58), { until: L(13, 0.84) });
    const full = 1440;
    const final = Math.max(40, (full * 35) / 900);
    const w = grow * mix(full, final, shrink);
    const segs = 14;
    const fold = Math.sin(shrink * Math.PI);
    const color = mixColor(GREY, theme.accent, clamp01((shrink - 0.6) * 3));
    const newText = p(L(13, 0.8), 0.4);
    return (
        <div
            style={{
                position: "absolute",
                left: 30,
                right: 30,
                top: 330,
                bottom: 26,
                background: theme.paper,
                borderRadius: 10,
            }}
        >
            <div style={{ position: "absolute", left: 30, top: 24 }}>
                <Mono size={30} color={theme.ink}>
                    push to live
                </Mono>
            </div>
            {/* The old length, kept as a dashed outline. */}
            <div
                style={{
                    position: "absolute",
                    left: 30,
                    top: 90,
                    width: full * grow,
                    height: 96,
                    border: `4px dashed ${GREY}`,
                    borderRadius: 8,
                    boxSizing: "border-box",
                    opacity: shrink > 0 ? 1 : 0,
                }}
            />
            <div style={{ position: "absolute", left: 30, top: 90, display: "flex", height: 96 }}>
                {Array.from({ length: segs }, (_, k) => (
                    <div
                        key={k}
                        style={{
                            width: w / segs,
                            height: 96,
                            background: color,
                            transform: `skewY(${(k % 2 ? 1 : -1) * fold * 18}deg)`,
                            filter: k % 2 ? "brightness(0.88)" : undefined,
                        }}
                    />
                ))}
            </div>
            <div
                style={{
                    position: "absolute",
                    top: 202,
                    left: 30,
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 52,
                    color: GREY,
                    opacity: clamp01(grow * 3 - 1.6),
                    whiteSpace: "nowrap",
                }}
            >
                about 15 minutes
            </div>
            <div
                style={{
                    position: "absolute",
                    top: 104,
                    left: 30 + final + 30,
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 64,
                    color: theme.accent,
                    opacity: newText,
                    whiteSpace: "nowrap",
                }}
            >
                35 seconds
            </div>
        </div>
    );
}

function FinalShot() {
    return (
        <At x={20} y={20}>
            <OpsPage logs={false} hop={false}>
                <PushToLive />
            </OpsPage>
        </At>
    );
}

export default function Operations() {
    return (
        <Stage>
            <Frame>
                <Shot from={L(0, 0, -1.2)} to={1}>
                    <Ask />
                </Shot>
                <Shot from={2} to={6}>
                    <ControlRoom />
                </Shot>
                <Shot from={7} to={8}>
                    <PauseRow />
                </Shot>
                <Shot from={9} to={L(10, 0.6)}>
                    <OpsShot />
                </Shot>
                <Shot from={10} to={12}>
                    <CloudShot />
                </Shot>
                <Shot from={13}>
                    <FinalShot />
                </Shot>
            </Frame>
        </Stage>
    );
}
