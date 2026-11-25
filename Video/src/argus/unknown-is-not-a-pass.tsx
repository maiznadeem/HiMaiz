import React from "react";
import { Leaf, Paper, Pebble, Stage, useTheme, type Cue } from "../kit";
import { seeded } from "../kit/random";
import { clamp01, lerp, useClock, type Clock } from "./shared/clock";
import { ARGUS, RULES, SOURCES, SUMMARY, TOTAL_RULES, type RuleResult } from "./shared/data";
import { ArgusMark, Check, Clip, Cross, FullFrame, Sheet } from "./shared/pieces";

// argus/unknown-is-not-a-pass. Lines (0-based): 0-1 a dashboard that shows green when it is blind,
// 2 the Argus layout, 3 the sweep, 4 sixty seconds each, 5 Cloud B goes stale, 6 the 23 rules,
// 7 one rule is one file, 8-11 the four results, 12-14 Cloud B's rules turn grey, 15 the summary,
// 16 the tests. All names are demo data (shared/data.ts).

export const theme = "qoria";
export const poster: Cue = { line: 15, at: "end" };

export default function UnknownIsNotAPass() {
    return (
        <Stage>
            <FullFrame>
                <Scene />
            </FullFrame>
        </Stage>
    );
}

function Scene() {
    const c = useClock();
    return (
        <>
            {c.t < c.S(2) + 0.7 && <Dashboard c={c} />}
            {c.t >= c.S(2, 0.1) && <ArgusScreen c={c} />}
            {c.t >= c.S(16) && <Tests c={c} />}
        </>
    );
}

// ---------------------------------------------------------------------------------------------
// Lines 0-1: an ordinary dashboard, all green, with one light blindfolded.

const GREEN = ARGUS.pass;

function Light(props: { x: number; y: number; r: number; on: number }) {
    return (
        <g
            opacity={props.on}
            transform={`translate(${props.x} ${props.y}) scale(${0.6 + 0.4 * props.on})`}
        >
            <circle r={props.r + 10} fill="#191919" />
            <circle r={props.r} fill={GREEN} />
            <ellipse
                cx={-props.r * 0.3}
                cy={-props.r * 0.35}
                rx={props.r * 0.32}
                ry={props.r * 0.2}
                fill="rgba(255,255,255,0.45)"
            />
        </g>
    );
}

function Dashboard({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, t } = c;
    const appear = c.sp(S(0) - 0.9);
    const fold = c.p(S(2), S(2) + 0.6);
    const lights = [
        { label: "Site", x: 230 },
        { label: "Database", x: 500 },
        { label: "Backups", x: 770 },
    ];
    const ly = 330;
    const drop = c.pop(S(1, 0.12));
    const bagY = lerp(-560, 0, drop);
    const glow = c.p(S(1, 0.35), S(1, 0.6));
    const scribble = c.lin(S(1, 0.5), S(1, 0.85));
    const text = "can't see";
    return (
        <div
            style={{
                position: "absolute",
                left: 440,
                top: 180,
                width: 1000,
                height: 600,
                opacity: Math.min(1, appear * 1.6) * (1 - fold),
                transform: `translateY(${(1 - appear) * 40}px) scaleY(${1 - 0.92 * fold})`,
                transformOrigin: "50% 50%",
            }}
        >
            <Sheet seed="dash-card" x={0} y={0} w={1000} h={600} sway={0.2} />
            <div
                style={{
                    position: "absolute",
                    left: 70,
                    top: 60,
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 72,
                    color: theme.ink,
                }}
            >
                <div
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        background: GREEN,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Check size={50} color="#fff" width={4} />
                </div>
                Everything OK
            </div>
            <svg
                width={1000}
                height={600}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
                <defs>
                    <radialGradient id="bagGlow">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.9} />
                        <stop offset="55%" stopColor={GREEN} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                    </radialGradient>
                </defs>
                {lights.map((l, i) => (
                    <Light key={l.label} x={l.x} y={ly} r={78} on={c.pop(S(0) - 0.6 + i * 0.18)} />
                ))}
                {drop > 0 && (
                    <circle
                        cx={770}
                        cy={ly + 10}
                        r={190}
                        fill="url(#bagGlow)"
                        opacity={0.25 + 0.75 * glow}
                    />
                )}
                {drop > 0 && (
                    <g transform={`translate(770 ${ly + bagY})`}>
                        {/* A kraft paper bag pulled down over the light. */}
                        <path
                            d="M-118 -170 L118 -170 L132 112 L-132 112 Z"
                            fill="#b8925e"
                            stroke="#191919"
                            strokeWidth={5}
                            strokeLinejoin="round"
                        />
                        <path
                            d="M-118 -170 L-100 -196 L-72 -168 L-44 -196 L-16 -168 L12 -196 L40 -168 L68 -196 L96 -168 L118 -170"
                            fill="#a07c4c"
                            stroke="#191919"
                            strokeWidth={4}
                            strokeLinejoin="round"
                        />
                        <path
                            d="M-60 -120 L-66 90 M60 -120 L66 90"
                            stroke="rgba(25,25,25,0.25)"
                            strokeWidth={4}
                        />
                        <circle
                            cy={10}
                            r={70}
                            fill={GREEN}
                            opacity={0.18 + 0.32 * glow}
                            style={{ filter: "blur(14px)" }}
                        />
                    </g>
                )}
                {lights.map((l) => (
                    <text
                        key={l.label}
                        x={l.x}
                        y={ly + 165}
                        textAnchor="middle"
                        fill={theme.ink}
                        style={{ fontFamily: "Fraunces", fontSize: 40 }}
                        opacity={c.pop(S(0) - 0.4)}
                    >
                        {l.label}
                    </text>
                ))}
                {scribble > 0 && (
                    <>
                        <path
                            d="M985 140 C960 170 930 190 905 205"
                            fill="none"
                            stroke={theme.accent}
                            strokeWidth={6}
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray={1}
                            strokeDashoffset={1 - clamp01(scribble * 2)}
                        />
                        {scribble > 0.5 && (
                            <path
                                d="M905 205 L930 204 M905 205 L916 183"
                                stroke={theme.accent}
                                strokeWidth={6}
                                strokeLinecap="round"
                            />
                        )}
                    </>
                )}
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 960,
                    top: 60,
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 56,
                    color: theme.accent,
                    whiteSpace: "nowrap",
                    transform: "rotate(-6deg)",
                }}
            >
                {Array.from(text).map((ch, i) => (
                    <span key={i} style={{ opacity: clamp01(scribble * text.length * 1.3 - i) }}>
                        {ch}
                    </span>
                ))}
            </div>
            {t > S(1, 0.7) && (
                <div
                    style={{
                        position: "absolute",
                        left: 600,
                        top: 640,
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 40,
                        color: theme.inkSoft,
                        opacity: c.p(S(1, 0.7), S(1, 0.9)),
                        whiteSpace: "nowrap",
                    }}
                >
                    still green
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------
// The Argus screen: sources on the left, rules on the right.

const PANEL = { x: 70, y: 40, w: 1640, h: 880 };
const TILE = { x: 100, w: 420, y0: 165, h: 84, gap: 6 };
const tileY = (i: number) => TILE.y0 + i * (TILE.h + TILE.gap);
const GRID = { x0: 580, w: 352, gx: 17, y0: 165, h: 128, gy: 14 };
const cardX = (i: number) => GRID.x0 + (i % 3) * (GRID.w + GRID.gx);
const cardY = (i: number) => GRID.y0 + Math.floor(i / 3) * (GRID.h + GRID.gy);
const SUM = { x: 580, y: 778, h: 100 };

function ArgusScreen({ c }: { c: Clock }) {
    const { S, N } = c;
    const unfold = c.sp(S(2, 0.1));
    const shrink = c.p(S(16), S(16) + 0.6);
    const focus = c.p(S(12), S(12) + 0.4) * (1 - c.p(S(15) - 0.2, S(15) + 0.3));
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${lerp(1, 0.56, shrink)})`,
                transformOrigin: "60px 520px",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: Math.min(1, unfold * 2),
                    transform: `scaleY(${0.2 + 0.8 * unfold})`,
                    transformOrigin: `50% ${PANEL.y}px`,
                }}
            >
                <Sheet
                    seed="argus-panel"
                    x={PANEL.x}
                    y={PANEL.y}
                    w={PANEL.w}
                    h={PANEL.h}
                    color={ARGUS.panel}
                    sway={0}
                    lift={1.2}
                    roughness={0.3}
                />
                <Header c={c} />
                <FanLines c={c} dim={focus} />
                {SOURCES.map((s, i) => (
                    <SourceTile key={s.name} c={c} i={i} dim={i === 1 ? 0 : focus} />
                ))}
                <Sweep c={c} />
                {RULES.map((r, i) => (
                    <RuleCard key={r.n} c={c} i={i} dim={RULES[i].cloudB ? 0 : focus} />
                ))}
                <MoreTab c={c} dim={focus} />
                <CloudBLinks c={c} focus={focus} />
                <Details c={c} />
                {c.t >= S(15) && <Summary c={c} />}
                {c.t >= S(7) && c.t < N(7) + 0.5 && <RuleFile c={c} />}
            </div>
        </div>
    );
}

function Header({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, E } = c;
    const draw = c.p(S(2, 0.3), S(2, 0.95));
    const swap = c.p(S(15) - 0.1, S(15) + 0.5);
    const count = Math.round(TOTAL_RULES * c.lin(S(6, 0.1), E(6)));
    const tag = c.pop(S(4, 0.05));
    return (
        <>
            <div style={{ position: "absolute", left: 100, top: 58 }}>
                <ArgusMark size={80} draw={draw} color={ARGUS.onPanel} star={theme.accent} />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 196,
                    top: 66,
                    fontFamily: "Fraunces",
                    fontWeight: 600,
                    fontSize: 60,
                    color: ARGUS.onPanel,
                    opacity: c.p(S(2, 0.4), S(2, 0.8)) * (1 - swap),
                }}
            >
                Argus
            </div>
            {swap > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 196,
                        top: 62,
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 64,
                        color: ARGUS.onPanel,
                        opacity: swap,
                        transform: `translateY(${(1 - swap) * 16}px)`,
                        whiteSpace: "nowrap",
                    }}
                >
                    Unknown is never a pass.
                </div>
            )}
            {tag > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 400,
                        top: 76,
                        opacity: Math.min(1, tag * 2) * (1 - swap),
                        transform: `scale(${0.6 + 0.4 * tag}) rotate(-2deg)`,
                        transformOrigin: "0 50%",
                    }}
                >
                    <Paper
                        seed="sixty"
                        color={theme.accent}
                        roughness={1}
                        innerStyle={{
                            padding: "8px 20px",
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontSize: 34,
                            color: "#fffaf2",
                            whiteSpace: "nowrap",
                        }}
                    >
                        60 s per source
                    </Paper>
                </div>
            )}
            {c.t >= S(6) && (
                <div
                    style={{
                        position: "absolute",
                        right: 1920 - 1680,
                        top: 60,
                        display: "flex",
                        alignItems: "baseline",
                        gap: 14,
                        color: ARGUS.onPanel,
                        opacity: c.p(S(6), S(6) + 0.3),
                    }}
                >
                    <span
                        style={{
                            fontFamily: "Fraunces",
                            fontWeight: 600,
                            fontSize: 68,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {count}
                    </span>
                    <span
                        style={{
                            fontFamily: "Fraunces",
                            fontStyle: "italic",
                            fontSize: 36,
                            color: ARGUS.onPanelSoft,
                        }}
                    >
                        rules
                    </span>
                </div>
            )}
        </>
    );
}

/** When the sweep line passes a tile's middle. */
function fillTime(c: Clock, i: number) {
    const a = c.S(3, 0.08);
    const b = c.E(3) - 0.2;
    const cy = tileY(i) + TILE.h / 2;
    return a + ((cy - TILE.y0) / (tileY(7) + TILE.h - TILE.y0)) * (b - a);
}

function Sweep({ c }: { c: Clock }) {
    const theme = useTheme();
    const a = c.S(3, 0.08);
    const b = c.E(3) - 0.2;
    if (c.t < a - 0.2 || c.t > b + 0.4) return null;
    const y = lerp(TILE.y0 - 10, tileY(7) + TILE.h + 10, c.lin(a, b));
    const o = c.p(a - 0.2, a) * (1 - c.p(b, b + 0.4));
    return (
        <div
            style={{
                position: "absolute",
                left: TILE.x - 18,
                top: y - 4,
                width: TILE.w + 36,
                height: 8,
                opacity: o,
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: theme.accent,
                    borderRadius: 4,
                    boxShadow: `0 0 24px ${theme.accent}`,
                }}
            />
        </div>
    );
}

function Dial(props: {
    x: number;
    y: number;
    prog: number;
    done: number;
    stuck: boolean;
    on: number;
}) {
    const theme = useTheme();
    const r = 26;
    const a = props.prog * Math.PI * 2;
    const ex = props.x + Math.sin(a) * r;
    const ey = props.y - Math.cos(a) * r;
    const large = props.prog > 0.5 ? 1 : 0;
    const wedge =
        props.prog >= 0.999
            ? `M ${props.x} ${props.y - r} A ${r} ${r} 0 1 1 ${props.x - 0.01} ${props.y - r} Z`
            : `M ${props.x} ${props.y} L ${props.x} ${props.y - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
    if (props.done > 0) {
        return (
            <g transform={`translate(${props.x} ${props.y}) scale(${props.done})`}>
                <circle r={r} fill={GREEN} />
                <path
                    d="M-12 1 L-3 10 L13 -9"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        );
    }
    return (
        <g opacity={props.on}>
            <circle
                cx={props.x}
                cy={props.y}
                r={r}
                fill="#e3e1d8"
                stroke="#191919"
                strokeWidth={3}
            />
            {props.prog > 0 && <path d={wedge} fill={props.stuck ? theme.accent : "#55544f"} />}
            <line
                x1={props.x}
                y1={props.y}
                x2={ex}
                y2={ey}
                stroke="#191919"
                strokeWidth={4}
                strokeLinecap="round"
            />
            {props.stuck && (
                <line
                    x1={props.x}
                    y1={props.y - r - 8}
                    x2={props.x}
                    y2={props.y - r + 8}
                    stroke={theme.accent}
                    strokeWidth={6}
                />
            )}
        </g>
    );
}

function SourceTile({ c, i, dim }: { c: Clock; i: number; dim: number }) {
    const theme = useTheme();
    const { S } = c;
    const s = SOURCES[i];
    const y = tileY(i);
    const appear = c.pop(S(2, 0.3) + i * 0.06);
    const ft = fillTime(c, i);
    const filled = c.p(ft, ft + 0.3);
    const stale = i === 1;
    const timeout = S(5, 0.3);
    const staleFade = stale ? c.p(timeout, timeout + 0.5) : 0;
    const stamp = stale ? c.pop(S(5, 0.42)) : 0;
    // Line 12: the stale source is pointed at again.
    const pulse =
        stale && c.t > c.S(12) && c.t < c.S(13)
            ? Math.sin((c.t - c.S(12)) * 9) * 0.03 * (1 - c.lin(c.S(12), c.S(13)))
            : 0;
    const done = i === 1 ? 0 : c.pop(S(4) + 0.45 + i * 0.17);
    const prog = stale ? c.lin(S(4), timeout) : c.lin(S(4), S(4) + 0.45 + i * 0.17);
    const timeText = stale ? (c.t < timeout ? "reading…" : s.time) : s.time;
    return (
        <div
            style={{
                position: "absolute",
                left: TILE.x,
                top: y,
                width: TILE.w,
                height: TILE.h,
                opacity: Math.min(1, appear * 2) * (1 - 0.65 * dim),
                transform: `scale(${(0.85 + 0.15 * appear) * (1 + pulse)})`,
            }}
        >
            <Sheet
                seed={`tile-${s.name}`}
                x={0}
                y={0}
                w={TILE.w}
                h={TILE.h}
                color={stale && staleFade > 0 ? "#dcdad1" : "#f7f6f1"}
                sway={0.2}
            />
            <div
                style={{
                    position: "absolute",
                    left: 20,
                    top: 6,
                    opacity: filled * (1 - 0.45 * staleFade),
                }}
            >
                <div
                    style={{
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 34,
                        color: theme.ink,
                        lineHeight: 1.1,
                    }}
                >
                    {s.name}
                </div>
                <div
                    style={{
                        fontFamily: "IBM Plex Mono",
                        fontSize: 28,
                        color: theme.inkSoft,
                        lineHeight: 1.2,
                    }}
                >
                    {timeText}
                </div>
            </div>
            <svg
                width={TILE.w}
                height={TILE.h}
                style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            >
                {c.t >= S(4) && (
                    <Dial
                        x={TILE.w - 48}
                        y={TILE.h / 2}
                        prog={prog}
                        done={done}
                        stuck={stale && prog >= 1}
                        on={c.p(S(4), S(4) + 0.25)}
                    />
                )}
            </svg>
            {stamp > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 168,
                        top: -10,
                        padding: "4px 14px",
                        border: `4px solid ${theme.accent}`,
                        borderRadius: 6,
                        background: "rgba(247,246,241,0.92)",
                        color: theme.accent,
                        fontFamily: "IBM Plex Mono",
                        fontWeight: 500,
                        lineHeight: 1.05,
                        transform: `rotate(-5deg) scale(${lerp(1.8, 1, Math.min(1, stamp))})`,
                        opacity: Math.min(1, stamp * 2),
                        whiteSpace: "nowrap",
                    }}
                >
                    <div style={{ fontSize: 36 }}>STALE</div>
                    <div style={{ fontSize: 28 }}>last good 05:00</div>
                </div>
            )}
        </div>
    );
}

function FanLines({ c, dim }: { c: Clock; dim: number }) {
    const { S } = c;
    if (c.t < S(6)) return null;
    const draw = c.p(S(6), S(6) + 0.7);
    return (
        <svg
            width={1920}
            height={1080}
            style={{ position: "absolute", left: 0, top: 0, opacity: (1 - 0.7 * dim) * 0.85 }}
        >
            {SOURCES.map((s, i) => {
                const y1 = tileY(i) + TILE.h / 2;
                const row = Math.floor(i / 2);
                const y2 = cardY(row * 3) + GRID.h / 2;
                const x1 = TILE.x + TILE.w + 2;
                const x2 = GRID.x0 - 4;
                return (
                    <path
                        key={s.name}
                        d={`M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={ARGUS.onPanelSoft}
                        strokeWidth={3}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - draw}
                    />
                );
            })}
        </svg>
    );
}

/** When each card gets its result. */
function resultTime(c: Clock, i: number): number {
    const { S, E } = c;
    if (i === 1) return S(8, 0.25);
    if (i === 2) return S(9, 0.1);
    if (i === 3) return S(10, 0.15);
    if (i === 4) return S(11, 0.25);
    const order = [0, 5, 6, 7, 8, 9, 10, 11].indexOf(i);
    return E(11) + 0.15 + order * 0.08;
}

const COLORS: Record<RuleResult, string> = {
    pass: ARGUS.pass,
    broken: ARGUS.broken,
    excepted: ARGUS.excepted,
    unknown: ARGUS.unknown,
};

function StatusChip({ result, cloudB }: { result: RuleResult; cloudB?: boolean }) {
    const ink = "#191919";
    const text =
        result === "pass"
            ? "pass"
            : result === "broken"
              ? "broken"
              : result === "excepted"
                ? "excepted"
                : cloudB
                  ? "Cloud B stale"
                  : "could not check";
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontSize: 28,
                color: ink,
                whiteSpace: "nowrap",
            }}
        >
            {result === "pass" && <Check size={30} />}
            {result === "broken" && <Cross size={30} />}
            {result === "excepted" && <Clip size={30} />}
            {result === "unknown" && (
                <span style={{ fontStyle: "normal", fontWeight: 600, fontSize: 32 }}>?</span>
            )}
            {text}
        </div>
    );
}

function CardFace(props: {
    n: string;
    name: string;
    result?: RuleResult;
    cloudB?: boolean;
    nameOn: number;
}) {
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 18,
                    top: 10,
                    right: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: props.nameOn,
                }}
            >
                <span
                    style={{
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 28,
                        color: "#55544f",
                    }}
                >
                    {props.n}
                </span>
                {props.result && <StatusChip result={props.result} cloudB={props.cloudB} />}
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 18,
                    right: 16,
                    top: 50,
                    fontFamily: "Fraunces",
                    fontSize: 29,
                    lineHeight: 1.14,
                    color: "#191919",
                    opacity: props.nameOn,
                }}
            >
                {props.name}
            </div>
            {props.result === "unknown" && (
                <svg
                    width={GRID.w}
                    height={GRID.h}
                    style={{ position: "absolute", left: 0, top: 0 }}
                >
                    <rect
                        x={7}
                        y={7}
                        width={GRID.w - 14}
                        height={GRID.h - 14}
                        rx={6}
                        fill="none"
                        stroke={ARGUS.unknownLine}
                        strokeWidth={3}
                        strokeDasharray="12 9"
                    />
                </svg>
            )}
        </>
    );
}

function RuleCard({ c, i, dim }: { c: Clock; i: number; dim: number }) {
    const { S } = c;
    const r = RULES[i];
    const x = cardX(i);
    const y = cardY(i);
    const appear = c.pop(S(2, 0.4) + i * 0.04);
    const nameAt = S(6, 0.15) + i * 0.16;
    const nameOn = c.p(nameAt, nameAt + 0.25);
    const bump =
        c.t > nameAt && c.t < nameAt + 0.4 ? Math.sin(((c.t - nameAt) / 0.4) * Math.PI) * 0.06 : 0;
    const rt = resultTime(c, i);
    const res = c.pop(rt);
    // The three Cloud B rules show a green "pass" sticker that peels (line 13) and falls (line 14).
    const under: RuleResult = r.final;
    const showSticker = r.cloudB && res > 0;
    const k = i - 9;
    const peel = r.cloudB ? c.p(c.S(13, 0.1) + k * 0.12, c.E(13) + k * 0.1) : 0;
    const fall = r.cloudB ? c.lin(c.S(14, 0.05) + k * 0.12, c.S(14, 0.05) + k * 0.12 + 0.9) : 0;
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: GRID.w,
                height: GRID.h,
                opacity: Math.min(1, appear * 2) * (1 - 0.65 * dim),
                transform: `scale(${(0.85 + 0.15 * appear) * (1 + bump)})`,
            }}
        >
            <Sheet
                seed={`card-${r.n}`}
                x={0}
                y={0}
                w={GRID.w}
                h={GRID.h}
                color={ARGUS.blank}
                sway={0.2}
            >
                <CardFace n={r.n} name={r.name} nameOn={nameOn} />
            </Sheet>
            {res > 0 && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: Math.min(1, res * 2.5),
                        transform: `scale(${lerp(1.12, 1, Math.min(1, res))})`,
                    }}
                >
                    <Sheet
                        seed={`card-${r.n}-res`}
                        x={0}
                        y={0}
                        w={GRID.w}
                        h={GRID.h}
                        color={COLORS[under]}
                        sway={0.2}
                    >
                        <CardFace
                            n={r.n}
                            name={r.name}
                            result={under}
                            cloudB={r.cloudB}
                            nameOn={1}
                        />
                    </Sheet>
                </div>
            )}
            {showSticker && fall < 1 && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: Math.min(1, res * 2.5) * (1 - clamp01((fall - 0.15) / 0.4)),
                        transformOrigin: "0% 0%",
                        transform: `translate(${peel * 8}px, ${fall * fall * 240}px) rotate(${peel * 6 + fall * 32}deg)`,
                    }}
                >
                    <Sheet
                        seed={`card-${r.n}-sticker`}
                        x={0}
                        y={0}
                        w={GRID.w}
                        h={GRID.h}
                        color={ARGUS.pass}
                        sway={0.2}
                        lift={1 + peel * 1.5}
                    >
                        <CardFace n={r.n} name={r.name} result="pass" nameOn={1} />
                    </Sheet>
                    {peel > 0 && (
                        <svg
                            width={GRID.w}
                            height={GRID.h}
                            style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
                        >
                            <path
                                d={`M ${GRID.w} ${GRID.h - 70 * peel} L ${GRID.w - 70 * peel} ${GRID.h} L ${GRID.w - 50 * peel} ${GRID.h - 50 * peel} Z`}
                                fill="#5d8a4b"
                                stroke="#191919"
                                strokeWidth={2}
                            />
                        </svg>
                    )}
                </div>
            )}
        </div>
    );
}

function MoreTab({ c, dim }: { c: Clock; dim: number }) {
    const s = c.pop(c.S(6, 0.15) + 12 * 0.16);
    if (s <= 0) return null;
    return (
        <div
            style={{
                position: "absolute",
                left: 1500,
                top: 724,
                opacity: Math.min(1, s * 2) * (1 - 0.65 * dim),
                transform: `scale(${0.7 + 0.3 * s})`,
            }}
        >
            <Paper
                seed="more-tab"
                color="#d9d8d0"
                innerStyle={{
                    padding: "4px 18px",
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 30,
                    color: "#191919",
                    whiteSpace: "nowrap",
                }}
            >
                + 11 more
            </Paper>
        </div>
    );
}

/** Line 12: ink lines from the stale source to the three rules that read it, pulsing orange. */
function CloudBLinks({ c, focus }: { c: Clock; focus: number }) {
    const theme = useTheme();
    if (focus <= 0) return null;
    const draw = c.p(c.S(12, 0.2), c.S(12, 0.9));
    const x1 = TILE.x + TILE.w + 4;
    const y1 = tileY(1) + TILE.h / 2;
    return (
        <svg
            width={1920}
            height={1080}
            style={{ position: "absolute", left: 0, top: 0, opacity: focus }}
        >
            {[9, 10, 11].map((i) => {
                const x2 = cardX(i) + GRID.w / 2;
                const y2 = cardY(i) - 8;
                const d = `M ${x1} ${y1} C ${x1 + 160} ${y1}, ${x2} ${y2 - 200}, ${x2} ${y2}`;
                return (
                    <g key={i}>
                        <path
                            d={d}
                            fill="none"
                            stroke={theme.accent}
                            strokeWidth={6}
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray={1}
                            strokeDashoffset={1 - draw}
                            opacity={0.35}
                        />
                        {draw >= 1 && (
                            <path
                                d={d}
                                fill="none"
                                stroke={theme.accent}
                                strokeWidth={7}
                                strokeLinecap="round"
                                pathLength={1}
                                strokeDasharray="0.05 0.07"
                                strokeDashoffset={-c.t * 0.25}
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

/** The detail that each result names, shown for its own line. */
function Details({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S } = c;
    const items = [
        {
            at: S(9, 0.4),
            until: S(10),
            x: 1010,
            y: 296,
            color: theme.accent,
            ink: "#fffaf2",
            text: "app12-lyra.example.net answers direct",
            icon: null as React.ReactNode,
        },
        {
            at: S(10, 0.45),
            until: S(11),
            x: 580,
            y: 438,
            color: "#c9d5e6",
            ink: "#191919",
            text: "excepted: app07-vega, read-only demo",
            icon: <Clip size={34} />,
        },
        {
            at: S(11, 0.45),
            until: S(12, 0.2),
            x: 860,
            y: 438,
            color: "#d9d8d0",
            ink: "#191919",
            text: "Billing answered without a caps field",
            icon: null,
        },
    ];
    return (
        <>
            {items.map((it) => {
                if (c.t < it.at || c.t > it.until + 0.4) return null;
                const s = c.pop(it.at);
                const out = c.p(it.until, it.until + 0.35);
                return (
                    <div
                        key={it.text}
                        style={{
                            position: "absolute",
                            left: it.x,
                            top: it.y,
                            opacity: Math.min(1, s * 2) * (1 - out),
                            transform: `translateY(${(1 - Math.min(1, s)) * -30 + out * 20}px) rotate(${-1.2 + (1 - Math.min(1, s)) * -4}deg)`,
                            transformOrigin: "10% 0%",
                        }}
                    >
                        <Paper
                            seed={`detail-${it.text}`}
                            color={it.color}
                            lift={1.4}
                            roughness={0.8}
                            innerStyle={{
                                padding: "10px 22px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 28,
                                color: it.ink,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {it.icon}
                            {it.text}
                        </Paper>
                    </div>
                );
            })}
        </>
    );
}

/** Line 7: one rule card opens up into its file. */
function RuleFile({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, N } = c;
    const i = 2;
    const open = c.p(S(7), S(7) + 0.6) * (1 - c.p(N(7) - 0.35, N(7) + 0.2));
    const flip = c.p(S(7, 0.25), S(7, 0.25) + 0.5) * (1 - c.p(c.E(7) + 0.1, c.E(7) + 0.5));
    const from = { x: cardX(i), y: cardY(i), w: GRID.w, h: GRID.h };
    const to = { x: 600, y: 210, w: 980, h: 470 };
    const box = {
        x: lerp(from.x, to.x, open),
        y: lerp(from.y, to.y, open),
        w: lerp(from.w, to.w, open),
        h: lerp(from.h, to.h, open),
    };
    const scale = box.w / to.w;
    const angle = flip * 180;
    const back = angle > 90;
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: PANEL.x,
                    top: PANEL.y,
                    width: PANEL.w,
                    height: PANEL.h,
                    background: "rgba(20,22,26,0.55)",
                    opacity: open,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: box.x,
                    top: box.y,
                    width: to.w,
                    height: to.h,
                    transform: `scale(${scale}, ${box.h / to.h}) perspective(1600px) rotateY(${back ? angle - 180 : angle}deg)`,
                    transformOrigin: "0 0",
                    opacity: 1 - c.p(N(7) - 0.15, N(7) + 0.15),
                }}
            >
                <Sheet
                    seed="rule-file"
                    x={0}
                    y={0}
                    w={to.w}
                    h={to.h}
                    color={back ? "#f7f6f1" : ARGUS.blank}
                    sway={0}
                    lift={1.6}
                >
                    {!back ? (
                        <div style={{ padding: "40px 56px" }}>
                            <div
                                style={{
                                    fontFamily: "Fraunces",
                                    fontStyle: "italic",
                                    fontSize: 44,
                                    color: "#55544f",
                                }}
                            >
                                Rule 04
                            </div>
                            <div
                                style={{
                                    fontFamily: "Fraunces",
                                    fontWeight: 600,
                                    fontSize: 84,
                                    lineHeight: 1.05,
                                    color: "#191919",
                                    marginTop: 20,
                                }}
                            >
                                Every origin refuses direct calls
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                padding: "40px 56px",
                                fontFamily: "IBM Plex Mono",
                                color: "#191919",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    fontSize: 36,
                                    fontWeight: 500,
                                }}
                            >
                                <svg width="34" height="42" viewBox="0 0 34 42">
                                    <path
                                        d="M3 3 H22 L31 12 V39 H3 Z M22 3 V12 H31"
                                        fill="none"
                                        stroke="#191919"
                                        strokeWidth="3"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                rules/04-origin-refuses-direct.ts
                            </div>
                            <div
                                style={{
                                    height: 4,
                                    background: theme.accent,
                                    width: 180,
                                    margin: "26px 0 30px",
                                    borderRadius: 2,
                                }}
                            />
                            <div style={{ fontSize: 38, lineHeight: 1.5 }}>
                                <span style={{ color: theme.accent }}>why:</span> traffic must pass
                                the edge
                            </div>
                            <div style={{ fontSize: 38, lineHeight: 1.5 }}>
                                <span style={{ color: theme.accent }}>exceptions:</span>
                            </div>
                            <div style={{ fontSize: 38, lineHeight: 1.5, paddingLeft: 40 }}>
                                app07-vega (static demo)
                            </div>
                        </div>
                    )}
                </Sheet>
            </div>
        </>
    );
}

/** Line 15: the count, where the grey cards bounce off "Pass" into their own bucket. */
function Summary({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S } = c;
    const appear = c.sp(S(15));
    const buckets = [
        { key: "pass", label: "Pass", n: SUMMARY.pass, w: 250, color: ARGUS.pass },
        { key: "broken", label: "Broken", n: SUMMARY.broken, w: 230, color: ARGUS.broken },
        { key: "excepted", label: "Excepted", n: SUMMARY.excepted, w: 260, color: ARGUS.excepted },
        {
            key: "unknown",
            label: "Could not check",
            n: SUMMARY.unknown,
            w: 350,
            color: ARGUS.unknown,
        },
    ];
    let x = SUM.x;
    const pos = buckets.map((b) => {
        const p = { ...b, x };
        x += b.w;
        return p;
    });
    const sources = [4, 9, 10, 11];
    const chips = sources.map((ci, k) => {
        const start = S(15, 0.2) + k * 0.16;
        const a = c.lin(start, start + 0.45);
        const b = c.lin(start + 0.45, start + 1.0);
        return { ci, start, a, b, landed: b >= 1 };
    });
    const landed = chips.filter((ch) => ch.landed).length;
    const hit = chips.some((ch) => ch.a > 0.85 && ch.b < 0.25);
    const passCx = pos[0].x + pos[0].w / 2;
    const unk = pos[3];
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    opacity: Math.min(1, appear * 2),
                    transform: `translateY(${(1 - appear) * 40}px)`,
                }}
            >
                {pos.map((b) => (
                    <div
                        key={b.key}
                        style={{
                            position: "absolute",
                            left: b.x,
                            top: SUM.y,
                            width: b.w - 10,
                            height: SUM.h,
                            transform:
                                b.key === "pass" && hit
                                    ? `translateX(${Math.sin(c.t * 60) * 5}px)`
                                    : undefined,
                        }}
                    >
                        <Sheet
                            seed={`sum-${b.key}`}
                            x={0}
                            y={0}
                            w={b.w - 10}
                            h={SUM.h}
                            color={b.color}
                            sway={0.15}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "center",
                                    gap: 14,
                                    height: "100%",
                                    paddingTop: 22,
                                    fontFamily: "Fraunces",
                                    color: "#191919",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span style={{ fontSize: 32, fontStyle: "italic" }}>{b.label}</span>
                                <span
                                    style={{
                                        fontSize: 52,
                                        fontWeight: 600,
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {b.key === "unknown" ? landed : b.n}
                                </span>
                            </div>
                            {b.key === "unknown" && (
                                <svg
                                    width={b.w - 10}
                                    height={SUM.h}
                                    style={{ position: "absolute", left: 0, top: 0 }}
                                >
                                    <rect
                                        x={7}
                                        y={7}
                                        width={b.w - 24}
                                        height={SUM.h - 14}
                                        rx={6}
                                        fill="none"
                                        stroke={ARGUS.unknownLine}
                                        strokeWidth={3}
                                        strokeDasharray="12 9"
                                    />
                                </svg>
                            )}
                        </Sheet>
                    </div>
                ))}
            </div>
            {chips.map((ch) => {
                if (c.t < ch.start || ch.landed) return null;
                const sx = cardX(ch.ci) + GRID.w / 2;
                const sy = cardY(ch.ci) + GRID.h / 2;
                let px: number;
                let py: number;
                if (ch.b <= 0) {
                    px = lerp(sx, passCx, ch.a);
                    py = lerp(sy, SUM.y - 10, ch.a) - Math.sin(ch.a * Math.PI) * 60;
                } else {
                    px = lerp(passCx, unk.x + unk.w / 2, ch.b);
                    py = lerp(SUM.y - 10, SUM.y + 40, ch.b) - Math.sin(ch.b * Math.PI) * 170;
                }
                return (
                    <div
                        key={ch.ci}
                        style={{
                            position: "absolute",
                            left: px - 34,
                            top: py - 26,
                            width: 68,
                            height: 52,
                            borderRadius: 8,
                            background: ARGUS.unknown,
                            border: `3px dashed ${ARGUS.unknownLine}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "Fraunces",
                            fontWeight: 600,
                            fontSize: 34,
                            color: "#191919",
                            boxShadow: `5px 7px 0 ${theme.shadow}`,
                            transform: `rotate(${(ch.a + ch.b) * 200}deg)`,
                        }}
                    >
                        ?
                    </div>
                );
            })}
        </>
    );
}

// ---------------------------------------------------------------------------------------------
// Line 16: the tests that hold the line.

function Tests({ c }: { c: Clock }) {
    const theme = useTheme();
    const { S, E } = c;
    const n = 14;
    const span = Math.max(1.2, E(16) - S(16, 0.1));
    const count = Math.round(2960 * (1 - Math.pow(1 - c.lin(S(16) + 0.45, S(16, 0.1) + span), 2)));
    const head = c.sp(S(16) + 0.45);
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 1090,
                    top: 92,
                    opacity: Math.min(1, head * 2),
                    transform: `translateY(${(1 - head) * 30}px)`,
                }}
            >
                <div
                    style={{
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 140,
                        lineHeight: 1,
                        color: theme.ink,
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    ~{count.toLocaleString("en-US")}
                </div>
                <div
                    style={{
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 40,
                        color: theme.inkSoft,
                        marginTop: 8,
                    }}
                >
                    tests, about three thousand
                </div>
            </div>
            {Array.from({ length: n }).map((_, k) => {
                const at = S(16, 0.1) + (k / n) * span * 0.9;
                const s = c.pop(at);
                if (s <= 0) return null;
                const rand = seeded(`slip-${k}`);
                const top = k === n - 1;
                const y = 850 - 60 - k * 33;
                const rot = (rand() * 2 - 1) * 1.6;
                return (
                    <div
                        key={k}
                        style={{
                            position: "absolute",
                            left: 1090 + (rand() * 2 - 1) * 10,
                            top: y + (1 - Math.min(1, s)) * 60,
                            width: 580,
                            height: 60,
                            opacity: Math.min(1, s * 3),
                            transform: `rotate(${rot}deg)`,
                        }}
                    >
                        <Sheet
                            seed={`slip-${k}`}
                            x={0}
                            y={0}
                            w={580}
                            h={60}
                            color={top ? "#fffdf6" : k % 2 ? "#f7f6f1" : "#efeee8"}
                            sway={0.3}
                        >
                            {top ? (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "8px 22px",
                                        fontFamily: "IBM Plex Mono",
                                        fontWeight: 500,
                                        fontSize: 32,
                                        color: "#191919",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 19,
                                            background: ARGUS.pass,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Check size={28} color="#fff" />
                                    </div>
                                    unknown ≠ pass
                                </div>
                            ) : (
                                <div style={{ display: "flex", gap: 12, padding: "24px 22px" }}>
                                    <div
                                        style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: 7,
                                            background: ARGUS.pass,
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: 12,
                                            width: 120 + rand() * 220,
                                            background: "#c8c5b8",
                                            borderRadius: 6,
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: 12,
                                            width: 40 + rand() * 80,
                                            background: "#d9d8d0",
                                            borderRadius: 6,
                                        }}
                                    />
                                </div>
                            )}
                        </Sheet>
                    </div>
                );
            })}
            <Leaf
                size={110}
                seed="tests-leaf"
                style={{ position: "absolute", left: 1700, top: 760 }}
            />
            <Pebble
                size={70}
                seed="tests-pebble"
                style={{ position: "absolute", left: 990, top: 850 }}
            />
        </>
    );
}
