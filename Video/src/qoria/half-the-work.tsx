// Qoria: same hardware, half the work. The database under the 10,000-phone test, the statements
// ranked by share of total time, the three changes, the replay check, and the same test again.
import React from "react";
import { DotStream, Shot, Stage, useTheme, useType, type Cue } from "../kit";
import { seeded } from "../kit/random";
import {
    At,
    Card,
    Database,
    fmt,
    InkCross,
    Label,
    lerp,
    mix,
    Phone,
    pop,
    Stamp,
    Tick,
    useCue,
    useRamp,
    useSeconds,
} from "./shared-b/pieces";

export const theme = "qoria";
export const poster: Cue = { line: 15, at: "end" };

// The database sits on the right for the whole video, the same size throughout.
const DB = { x: 1250, top: 90, w: 320, h: 420 };
const DB_CENTRE_X = 800;
const METER = { dx: 250, top: 150, h: 320, w: 52, max: 25 };

function useDbX() {
    const r = useRamp();
    return lerp(DB.x, DB_CENTRE_X, r({ line: 15, delay: 0.1 }, 1.1));
}

function useCpu() {
    const r = useRamp();
    const up = r({ line: 0, at: 0.35 }, { line: 0, at: "end" });
    const down = r({ line: 12, at: 0.3 }, { line: 12, at: "end" });
    return lerp(0, 93, up) - (93 - 44) * down;
}

function Gauge(props: { value: number; ghost?: number; r: number }) {
    const theme = useTheme();
    const type = useType();
    const { r } = props;
    const ang = (v: number) => -120 + (240 * v) / 100;
    const needle = (v: number, color: string, w: number, op = 1) => {
        const a = ((ang(v) - 90) * Math.PI) / 180;
        return (
            <path
                d={`M ${r} ${r} L ${r + Math.cos(a) * r * 0.78} ${r + Math.sin(a) * r * 0.78}`}
                stroke={color}
                strokeWidth={w}
                strokeLinecap="round"
                opacity={op}
            />
        );
    };
    const arc = (from: number, to: number) => {
        const a1 = ((ang(from) - 90) * Math.PI) / 180;
        const a2 = ((ang(to) - 90) * Math.PI) / 180;
        const rr = r * 0.9;
        const large = ang(to) - ang(from) > 180 ? 1 : 0;
        return `M ${r + Math.cos(a1) * rr} ${r + Math.sin(a1) * rr} A ${rr} ${rr} 0 ${large} 1 ${r + Math.cos(a2) * rr} ${r + Math.sin(a2) * rr}`;
    };
    const hot = props.value > 70;
    return (
        <div style={{ position: "relative", width: r * 2, height: r * 2 }}>
            <svg width={r * 2} height={r * 2} style={{ overflow: "visible" }}>
                <circle cx={r} cy={r} r={r} fill={theme.paper} stroke={theme.ink} strokeWidth={5} />
                <path d={arc(0, 70)} stroke={theme.paperAlt} strokeWidth={10} fill="none" />
                <path d={arc(70, 100)} stroke={theme.accent} strokeWidth={10} fill="none" />
                {props.ghost !== undefined && needle(props.ghost, theme.inkSoft, 6, 0.35)}
                {needle(props.value, hot ? theme.accent : theme.ink, 8)}
                <circle cx={r} cy={r} r={9} fill={theme.ink} />
            </svg>
            <div
                style={{
                    ...type.display,
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: r * 1.22,
                    textAlign: "center",
                    fontSize: 50,
                    color: hot ? theme.accent : theme.ink,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {Math.round(props.value)}%
            </div>
        </div>
    );
}

function TheDatabase() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const cue = useCue();
    const x = useDbX();
    const cpu = useCpu();
    const heat = Math.max(0, Math.min(1, (cpu - 50) / 40));
    const appear = pop(r(0, 0.6));
    const ghost = t >= cue(12) ? 93 : undefined;
    const ghostOutline = r(11, 0.6) * (1 - r({ line: 13 }, 0.5));
    // The cost meter: database time per request, in ms.
    const ms =
        lerp(0, 22, r({ line: 1, at: 0.45 }, { line: 1, at: "end" })) -
        12 * r({ line: 13, at: 0.25 }, { line: 13, at: "end" });
    const meterIn = r({ line: 1, at: 0.1 }, 0.5);
    const meterFill = ms / METER.max;
    const labelOut = r({ line: 15 }, 0.5);
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: x - DB.w / 2,
                    top: DB.top,
                    transform: `scale(${appear})`,
                    transformOrigin: "50% 100%",
                }}
            >
                <Database w={DB.w} h={DB.h} heat={heat}>
                    <Label
                        size={32}
                        style={{ position: "absolute", top: 104, width: DB.w, textAlign: "center" }}
                        color={theme.ink}
                    >
                        database CPU
                    </Label>
                    <div style={{ position: "absolute", left: DB.w / 2 - 104, top: 152 }}>
                        <Gauge value={cpu} r={104} ghost={ghost} />
                    </div>
                </Database>
                <Label
                    size={32}
                    color={theme.onBgSoft}
                    style={{
                        marginTop: 14,
                        width: DB.w,
                        textAlign: "center",
                        lineHeight: 1.15,
                        opacity: 1 - labelOut,
                    }}
                >
                    same machine
                </Label>
            </div>
            {ghostOutline > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: x - DB.w / 2 - 16,
                        top: DB.top - 16,
                        opacity: ghostOutline,
                    }}
                >
                    <Database w={DB.w + 32} h={DB.h + 32} ghost />
                    <Label
                        size={32}
                        color={theme.inkSoft}
                        style={{
                            position: "absolute",
                            top: -50,
                            left: 0,
                            width: DB.w + 32,
                            textAlign: "center",
                        }}
                    >
                        same size as before
                    </Label>
                </div>
            )}
            {meterIn > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: x + METER.dx - METER.w / 2,
                        top: METER.top,
                        opacity: meterIn,
                    }}
                >
                    <Label
                        display
                        size={44}
                        color={ms > 15 ? theme.accent : theme.ink}
                        style={{
                            position: "absolute",
                            top: -60,
                            left: METER.w / 2,
                            transform: "translateX(-50%)",
                        }}
                    >
                        {Math.round(ms)} ms
                    </Label>
                    <div
                        style={{
                            position: "relative",
                            width: METER.w,
                            height: METER.h,
                            border: `5px solid ${theme.ink}`,
                            borderRadius: 10,
                            background: theme.paper,
                            overflow: "hidden",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: `${meterFill * 100}%`,
                                background: ms > 15 ? theme.accent : theme.second,
                            }}
                        />
                    </div>
                    <Label
                        size={32}
                        color={theme.onBgSoft}
                        style={{
                            position: "absolute",
                            top: METER.h + 12,
                            left: METER.w / 2,
                            transform: "translateX(-50%)",
                            textAlign: "center",
                            lineHeight: 1.1,
                        }}
                    >
                        per
                        <br />
                        request
                    </Label>
                </div>
            )}
        </>
    );
}

/** The crowd of phones on the left, with its count. */
function Crowd(props: { at: number; until: Cue; follow?: boolean }) {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const cue = useCue();
    const phones: React.ReactNode[] = [];
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const i = row * 5 + col;
            const p = pop(r({ line: props.at, delay: 0.35 }, 0.25 + i * 0.022));
            const bob = Math.sin(t * 3 + i * 1.7) * 3;
            phones.push(
                <At key={i} x={60 + col * 88 + (row % 2) * 22} y={190 + row * 98 + bob} scale={p}>
                    <Phone size={74} />
                </At>,
            );
        }
    }
    const label = r({ line: props.at, delay: 0.35 }, 0.5);
    // One request picked out and followed into the database.
    let followDot: React.ReactNode = null;
    if (props.follow && t >= cue(1) && t < cue({ line: 1, at: "next" })) {
        const f = r({ line: 1, at: 0.0 }, { line: 1, at: 0.5 });
        const x = lerp(520, 1080, f);
        const y = lerp(430, 360, f);
        followDot = (
            <div style={{ opacity: f < 1 ? 1 : 0 }}>
                <div
                    style={{
                        position: "absolute",
                        left: x - 24,
                        top: y - 24,
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: `6px solid ${theme.accent}`,
                        background: theme.paper,
                        boxSizing: "border-box",
                    }}
                />
                <Label
                    size={34}
                    style={{
                        position: "absolute",
                        left: x - 90,
                        top: y - 84,
                        opacity: Math.max(0, 1 - Math.max(0, f - 0.7) / 0.2),
                    }}
                >
                    one request
                </Label>
            </div>
        );
    }
    return (
        <>
            <DotStream
                from={[520, 430]}
                to={[1060, 360]}
                at={{ line: props.at, delay: 0.5 }}
                until={props.until}
                rate={10}
                travel={1.3}
                lane={95}
                size={16}
            />
            {phones}
            <Label
                display
                size={68}
                style={{ position: "absolute", left: 30, top: 40, opacity: label }}
            >
                10,000 phones
            </Label>
            {followDot}
        </>
    );
}

function BiggerMachine() {
    const theme = useTheme();
    const r = useRamp();
    const enter = r({ line: 2 }, { line: 2, at: 0.25 });
    const cross = r({ line: 2, at: 0.32 }, 0.6);
    const leave = r({ line: 2, at: 0.58 }, 0.7);
    const glow = Math.sin(Math.min(1, r({ line: 2, at: 0.12 }, 0.7)) * Math.PI);
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: lerp(-500, 440, enter) - leave * 900,
                    top: 0,
                    opacity: 1 - leave,
                    transform: `rotate(${leave * -8}deg)`,
                }}
            >
                <div style={{ filter: `drop-shadow(0 0 ${glow * 34}px ${theme.accent})` }}>
                    <Database w={400} h={480} />
                </div>
                <Label
                    display
                    size={52}
                    style={{ position: "absolute", top: 510, width: 400, textAlign: "center" }}
                >
                    a bigger machine
                </Label>
                <div style={{ position: "absolute", left: 40, top: 80 }}>
                    <InkCross size={320} p={cross} width={10} color={theme.accent} />
                </div>
            </div>
            <At x={480} y={330}>
                <Stamp
                    text="fix the code"
                    p={r({ line: 2, at: 0.62 }, 0.5)}
                    size={110}
                    color={theme.ink}
                />
            </At>
        </>
    );
}

function ResponseCard(props: { label: string }) {
    const theme = useTheme();
    const widths = [0.7, 0.5, 0.85, 0.4, 0.65, 0.55, 0.75];
    return (
        <div style={{ textAlign: "center" }}>
            <Card w={340} h={420}>
                <div style={{ padding: "36px 30px" }}>
                    {widths.map((w, i) => (
                        <div
                            key={i}
                            style={{
                                height: 18,
                                width: `${w * 100}%`,
                                marginLeft: i % 3 === 0 ? 0 : 34,
                                background: i === 0 ? theme.accent : theme.ink,
                                opacity: i === 0 ? 0.9 : 0.75,
                                borderRadius: 9,
                                marginBottom: 32,
                            }}
                        />
                    ))}
                </div>
            </Card>
            <Label size={38} style={{ marginTop: 16 }}>
                {props.label}
            </Label>
        </div>
    );
}

function SameAnswers() {
    const r = useRamp();
    const a = pop(r({ line: 3, at: 0.05 }, 0.5));
    const b = pop(r({ line: 3, at: 0.25 }, 0.5));
    const eq = pop(r({ line: 3, at: 0.5 }, 0.5));
    return (
        <>
            <Label display size={60} style={{ position: "absolute", left: 30, top: 20 }}>
                Same answers, exactly
            </Label>
            <At x={220} y={430} scale={a} rotate={(1 - a) * -6}>
                <ResponseCard label="before" />
            </At>
            <At x={510} y={390} scale={eq}>
                <Label display size={150}>
                    =
                </Label>
            </At>
            <At x={800} y={430} scale={b} rotate={(1 - b) * 6}>
                <ResponseCard label="after" />
            </At>
        </>
    );
}

// The database statements: three big ones, then a long tail. Lengths are only illustrative.
const TOP = [
    { name: "search", v: 420 },
    { name: "Discover", v: 330 },
    { name: "feed shares", v: 260 },
];
const TAIL = Array.from({ length: 17 }, (_, i) => 92 - i * 5);
const STRIP_SCALE = 1.4;

function Ranking() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const cue = useCue();
    if (t < cue(4) || t > cue({ line: 8, at: "next" }) + 0.5) return null;
    const fadeAll = 1 - r({ line: 8, at: "next" }, 0.4);
    const fallIn = r({ line: 4 }, { line: 4, at: 0.35 });
    const sort = r({ line: 4, at: 0.45 }, { line: 4, at: 0.95 });
    const hot = r({ line: 5, at: 0.1 }, 0.6);
    const bracket = r({ line: 5, at: 0.5 }, 0.6);
    const tailFade = r({ line: 6 }, 0.5);
    const compact = r({ line: 6 }, 0.7);
    const shrink1 = r({ line: 6, at: 0.6 }, { line: 6, at: "end" });
    const shrink2 = r({ line: 7, at: 0.6 }, { line: 7, at: "end" });
    const header = r({ line: 4, at: 0.2 }, 0.5);
    const strike = r({ line: 4, at: 0.6 }, 0.5);
    const all = [...TOP.map((s) => s.v), ...TAIL];
    const strips = all.map((v, i) => {
        const rand = seeded(`strip-${i}`);
        const sx = rand() * Math.max(0, 960 - v * STRIP_SCALE);
        const sy = 140 + rand() * 560;
        const srot = (rand() * 2 - 1) * 18;
        const drop = 1 - Math.min(1, Math.max(0, fallIn * 1.6 - (i / 20) * 0.6));
        const rowY = 130 + i * 31;
        let x = lerp(sx, 0, sort);
        let y = lerp(sy - drop * 760, rowY, sort);
        const rot = lerp(srot, 0, sort);
        let h = 22;
        let w = v * STRIP_SCALE;
        let color = theme.ink;
        let opacity = 1;
        if (i < 3) {
            color = mix(theme.ink, theme.accent, hot);
            // Compact: the three move to the top of the stage, larger.
            x = lerp(x, 230, compact);
            y = lerp(y, 30 + i * 56, compact);
            h = lerp(22, 36, compact);
            let k = 1 - 0.6 * shrink1;
            if (i === 0) k *= 1 - 0.75 * shrink2;
            w = w * k;
        } else {
            opacity = 1 - tailFade;
            color = mix(theme.ink, theme.inkSoft, hot * 0.7);
        }
        return (
            <div
                key={i}
                style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    background: color,
                    borderRadius: 4,
                    transform: `rotate(${rot}deg)`,
                    opacity,
                }}
            />
        );
    });
    return (
        <div style={{ position: "absolute", inset: 0, opacity: fadeAll }}>
            <div
                style={{ position: "absolute", left: 0, top: -14, opacity: header * (1 - compact) }}
            >
                <Label display size={44} style={{ marginBottom: 6 }}>
                    the busiest statements
                </Label>
                <Label size={36}>
                    ranked by{" "}
                    <span style={{ position: "relative", color: theme.inkSoft }}>
                        average speed
                        <span
                            style={{
                                position: "absolute",
                                left: -4,
                                top: "52%",
                                height: 5,
                                width: `${strike * 104}%`,
                                background: theme.accent,
                            }}
                        />
                    </span>{" "}
                    <span style={{ opacity: strike, fontWeight: 600 }}>share of total time</span>
                </Label>
            </div>
            {strips}
            {TOP.map((s, i) => {
                const y = lerp(130 + i * 31 - 9, 30 + i * 56 + 0, compact);
                const x = lerp(s.v * STRIP_SCALE + 20, 0, compact);
                return (
                    <Label
                        key={s.name}
                        size={32}
                        color={theme.ink}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            opacity: hot,
                            width: compact > 0.5 ? 210 : undefined,
                            textAlign: compact > 0.5 ? "right" : "left",
                        }}
                    >
                        {s.name}
                    </Label>
                );
            })}
            {bracket > 0 && compact < 1 && (
                <div
                    style={{
                        position: "absolute",
                        left: 730,
                        top: 124,
                        opacity: bracket * (1 - compact),
                    }}
                >
                    <svg width={40} height={100} style={{ overflow: "visible" }}>
                        <path
                            d="M 4 4 C 24 4 18 48 34 48 C 18 48 24 92 4 92"
                            stroke={theme.accent}
                            strokeWidth={5}
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                    <Label
                        display
                        size={42}
                        color={theme.accent}
                        style={{
                            position: "absolute",
                            left: 50,
                            top: -8,
                            whiteSpace: "normal",
                            width: 280,
                            lineHeight: 1.05,
                        }}
                    >
                        over half of all database time
                    </Label>
                </div>
            )}
        </div>
    );
}

function KeysFirst() {
    const theme = useTheme();
    const r = useRamp();
    const sweep = r({ line: 6, at: 0.0 }, { line: 6, at: 0.4 });
    const oldX = r({ line: 6, at: 0.36 }, 0.4);
    const keys = r({ line: 6, at: 0.45 }, 0.6);
    const lift = r({ line: 6, at: 0.62 }, { line: 6, at: "end" });
    const rows = 10;
    const pick = [1, 3, 4, 7];
    const top = 270;
    const rowH = 46;
    return (
        <>
            <Label size={36} style={{ position: "absolute", left: 0, top: top - 58 }}>
                <span style={{ opacity: 1 - keys * 0.6 }}>read every row</span>
                <span style={{ opacity: keys, marginLeft: 24, fontWeight: 600 }}>
                    → keys first, then only those rows
                </span>
            </Label>
            {Array.from({ length: rows }, (_, i) => {
                const picked = pick.includes(i);
                const j = pick.indexOf(i);
                const lx = picked ? lerp(0, 520, lift) : 0;
                const ly = picked ? lerp(0, (j - i) * rowH + 50 + j * 16, lift) : 0;
                return (
                    <div key={i}>
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: top + i * rowH,
                                width: 64,
                                height: rowH - 10,
                                background: picked
                                    ? mix(theme.paper, theme.second, keys)
                                    : theme.paper,
                                border: `3px solid ${theme.ink}`,
                                borderRadius: 4,
                                boxSizing: "border-box",
                                transform: `translateX(${keys * -14}px)`,
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: 90 + lx,
                                top: top + i * rowH + ly,
                                width: 420,
                                height: rowH - 10,
                                background: theme.paper,
                                border: `${picked && lift > 0 ? 5 : 3}px solid ${picked && lift > 0 ? theme.second : theme.ink}`,
                                borderRadius: 4,
                                boxSizing: "border-box",
                                opacity: picked ? 1 : 1 - lift * 0.55,
                                filter:
                                    picked && lift > 0.05
                                        ? "drop-shadow(5px 7px 0 rgba(25,25,25,0.25))"
                                        : undefined,
                            }}
                        >
                            {[0.25, 0.5, 0.75].map((c) => (
                                <div
                                    key={c}
                                    style={{
                                        position: "absolute",
                                        left: `${c * 100}%`,
                                        top: 4,
                                        bottom: 4,
                                        width: 3,
                                        background: theme.paperAlt,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
            {/* The old way: a slow scan over every row. */}
            {sweep > 0 && sweep < 1 && (
                <div
                    style={{
                        position: "absolute",
                        left: 84,
                        top: top + sweep * rows * rowH - 6,
                        width: 432,
                        height: rowH,
                        background: theme.accent,
                        opacity: 0.35,
                        borderRadius: 6,
                    }}
                />
            )}
            <div
                style={{
                    position: "absolute",
                    left: 220,
                    top: top + 140,
                    opacity: oldX * (1 - keys),
                }}
            >
                <InkCross size={170} p={oldX} color={theme.accent} />
            </div>
            <Label
                size={34}
                color={theme.second}
                style={{ position: "absolute", left: 610, top: top + 2, opacity: lift }}
            >
                one page of rows
            </Label>
        </>
    );
}

function SkipFuzzy() {
    const theme = useTheme();
    const type = useType();
    const r = useRamp();
    const typed = r({ line: 7 }, 0.4);
    const open = r({ line: 7, at: 0.25 }, 0.5);
    const close = r({ line: 7, at: 0.55 }, 0.4);
    const aside = r({ line: 7, at: 0.65 }, 0.6);
    const ang = open * (1 - close);
    const top = 240;
    return (
        <>
            <div style={{ position: "absolute", left: 0, top: top + 70 }}>
                <Card w={420} h={110} style={{ borderRadius: 55 }}>
                    <div
                        style={{
                            ...type.display,
                            fontSize: 64,
                            padding: "10px 44px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span>{typed > 0.2 ? "s" : ""}</span>
                        <span
                            style={{
                                width: 5,
                                height: 60,
                                background: theme.accent,
                                display: "inline-block",
                            }}
                        />
                    </div>
                </Card>
                <Label size={36} color={theme.onBgSoft} style={{ marginTop: 16 }}>
                    one or two letters
                </Label>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 680 + aside * 40,
                    top: top - 20 + aside * 150,
                    opacity: 1 - aside * 0.6,
                    transform: `rotate(${aside * 8}deg) scale(${1 - aside * 0.3})`,
                }}
            >
                <div style={{ position: "relative", width: 340, height: 340, perspective: 1800 }}>
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: theme.paperAlt,
                            border: `5px solid ${theme.ink}`,
                            borderRadius: 8,
                            boxSizing: "border-box",
                            padding: 40,
                        }}
                    >
                        {[0.8, 0.6, 0.9, 0.5, 0.7, 0.85].map((w, i) => (
                            <div
                                key={i}
                                style={{
                                    height: 10,
                                    width: `${w * 100}%`,
                                    background: theme.inkSoft,
                                    opacity: 0.5,
                                    borderRadius: 5,
                                    marginBottom: 30,
                                }}
                            />
                        ))}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: theme.paper,
                            border: `5px solid ${theme.ink}`,
                            borderRadius: 8,
                            boxSizing: "border-box",
                            transformOrigin: "0% 50%",
                            transform: `rotateY(${-ang * 105}deg)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                        }}
                    >
                        <Label
                            display
                            size={52}
                            style={{
                                whiteSpace: "normal",
                                lineHeight: 1.05,
                                opacity: ang < 0.4 ? 1 : 0,
                            }}
                        >
                            fuzzy-match index
                        </Label>
                    </div>
                </div>
                <div style={{ position: "absolute", left: 190, top: -50 }}>
                    <Stamp
                        text="skip"
                        p={r({ line: 7, at: 0.6 }, 0.4)}
                        size={64}
                        color={theme.second}
                    />
                </div>
            </div>
        </>
    );
}

const ACTIONS: { name: string; drop: number }[] = [
    { name: "like", drop: 4 },
    { name: "save", drop: 4 },
    { name: "share", drop: 4 },
    { name: "comment", drop: 4 },
    { name: "follow", drop: 4 },
];

function ActionIcon({ i }: { i: number }) {
    const theme = useTheme();
    const s = {
        fill: theme.paper,
        stroke: theme.ink,
        strokeWidth: 5,
        strokeLinejoin: "round",
        strokeLinecap: "round",
    } as const;
    const icons = [
        <path
            key="h"
            d="M40 68 C10 46 6 30 14 20 C22 10 36 12 40 24 C44 12 58 10 66 20 C74 30 70 46 40 68 Z"
            {...s}
        />,
        <path key="b" d="M22 10 H58 V70 L40 56 L22 70 Z" {...s} />,
        <g key="s">
            <path d="M14 46 V66 H66 V46" {...s} fill="none" />
            <path d="M40 52 V12 M26 26 L40 12 L54 26" {...s} fill="none" />
        </g>,
        <path key="c" d="M12 16 H68 V54 H34 L20 68 V54 H12 Z" {...s} />,
        <g key="f">
            <circle cx="32" cy="24" r="12" {...s} />
            <path d="M10 70 C10 50 20 42 32 42 C44 42 54 50 54 70 Z" {...s} />
            <path d="M62 30 V50 M52 40 H72" {...s} fill="none" stroke={theme.second} />
        </g>,
    ];
    return (
        <svg width={110} height={110} viewBox="0 0 80 80" style={{ overflow: "visible" }}>
            {icons[i]}
        </svg>
    );
}

function FewerStatements() {
    const theme = useTheme();
    const r = useRamp();
    const top = 250;
    const label = r({ line: 8, at: 0.55 }, 0.5);
    return (
        <>
            {ACTIONS.map((a, i) => {
                const x = 40 + i * 205;
                const iconIn = pop(r({ line: 8, at: 0.05 + i * 0.08 }, 0.5));
                const peel = r({ line: 8, at: 0.4 + i * 0.05 }, 0.9);
                const total = a.drop + 4;
                return (
                    <div key={a.name}>
                        <At x={x + 60} y={top + 40} scale={iconIn}>
                            <ActionIcon i={i} />
                        </At>
                        <Label
                            size={34}
                            style={{
                                position: "absolute",
                                left: x + 60,
                                top: top + 106,
                                transform: "translateX(-50%)",
                                opacity: iconIn,
                            }}
                        >
                            {a.name}
                        </Label>
                        {Array.from({ length: total }, (_, k) => {
                            const goes = k >= total - a.drop;
                            const rank = goes ? k - (total - a.drop) : 0;
                            const pk = goes
                                ? Math.max(0, Math.min(1, peel * 1.6 - rank * 0.12))
                                : 0;
                            const rand = seeded(`peel-${i}-${k}`);
                            const dx = (rand() * 0.6 + 0.6) * 380 * pk;
                            const dy = -(rand() * 260 + 120) * pk;
                            const rot = (rand() * 2 - 1) * 70 * pk;
                            const y = top + 420 - (k + 1) * 24;
                            return (
                                <div
                                    key={k}
                                    style={{
                                        position: "absolute",
                                        left: x + 10 + dx,
                                        top: y + dy,
                                        width: 110,
                                        height: 15,
                                        borderRadius: 4,
                                        background: goes ? theme.accent : theme.ink,
                                        opacity: (1 - pk) * iconIn,
                                        transform: `rotate(${rot}deg)`,
                                    }}
                                />
                            );
                        })}
                    </div>
                );
            })}
            <Label
                display
                size={54}
                style={{ position: "absolute", left: 10, top: top + 432, opacity: label }}
            >
                4 fewer statements each
            </Label>
        </>
    );
}

function Replay() {
    const theme = useTheme();
    const r = useRamp();
    const t = useSeconds();
    const cue = useCue();
    const count = Math.round(392 * r({ line: 9, at: 0.25 }, { line: 9, at: "end" }));
    const checks = r({ line: 10 }, { line: 10, at: "end" });
    const done = r({ line: 10, at: 0.5 }, 0.4);
    const start = cue({ line: 9, at: 0.1 });
    const stop = cue({ line: 10, at: 0.0 });
    const moveT = Math.min(t, stop) - start;
    const lanes = [
        { name: "old code", y: 160 },
        { name: "new code", y: 410 },
    ];
    const cards: React.ReactNode[] = [];
    const spacing = 160;
    for (let k = 0; k < 9; k++) {
        const x = 260 + ((k * spacing + Math.max(0, moveT) * 260) % (9 * spacing)) - 60;
        if (x < 230 || x > 1040) continue;
        lanes.forEach((lane, li) =>
            cards.push(
                <div key={`${k}-${li}`} style={{ position: "absolute", left: x, top: lane.y }}>
                    <Card w={120} h={150}>
                        {[0.7, 0.45, 0.6].map((w, j) => (
                            <div
                                key={j}
                                style={{
                                    margin: "18px 14px 0",
                                    height: 13,
                                    width: `${w * 100}%`,
                                    borderRadius: 6,
                                    background: j === 0 ? theme.accent : theme.ink,
                                    opacity: 0.75,
                                }}
                            />
                        ))}
                    </Card>
                </div>,
            ),
        );
        const order = (x - 240) / 800;
        const ck = Math.max(0, Math.min(1, checks * 2.2 - order));
        cards.push(
            <div key={`ck-${k}`} style={{ position: "absolute", left: x + 18, top: 322 }}>
                <Tick size={84} p={ck} />
            </div>,
        );
    }
    return (
        <>
            <Label display size={56} style={{ position: "absolute", left: 0, top: 30 }}>
                Replayed before merging
            </Label>
            {lanes.map((lane) => (
                <Label
                    key={lane.name}
                    size={38}
                    style={{ position: "absolute", left: 0, top: lane.y + 52 }}
                >
                    {lane.name}
                </Label>
            ))}
            <div
                style={{
                    position: "absolute",
                    left: 230,
                    top: 140,
                    width: 800,
                    height: 440,
                    overflow: "hidden",
                }}
            >
                <div style={{ position: "absolute", left: -230, top: -140 }}>{cards}</div>
            </div>
            <div style={{ position: "absolute", left: 0, top: 620 }}>
                <Label display size={66} color={mix(theme.ink, theme.second, done)}>
                    {fmt(count)}
                    {done > 0 ? " of 392 match" : " recorded responses"}
                </Label>
            </div>
        </>
    );
}

function SearchDrop() {
    const theme = useTheme();
    const type = useType();
    const r = useRamp();
    const snap = r({ line: 14, at: 0.6 }, 0.5);
    const grow = r({ line: 14, at: 0.1 }, 0.6);
    const before = 3310;
    const after = 54;
    const max = 660;
    const w = lerp(max * grow, Math.max(12, (after / before) * max), snap);
    const value = snap > 0.5 ? after : Math.round(before * grow);
    return (
        <>
            <div style={{ position: "absolute", left: 0, top: 110 }}>
                <Card w={360} h={110} style={{ borderRadius: 55 }}>
                    <div style={{ ...type.display, fontSize: 64, padding: "10px 44px" }}>s</div>
                </Card>
                <Label size={36} color={theme.onBgSoft} style={{ marginTop: 14 }}>
                    a one-letter search
                </Label>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 400,
                    top: 128,
                    transform: `scale(${pop(r({ line: 14 }, 0.4))}) rotate(-3deg)`,
                }}
            >
                <Card w={290} h={72} color={theme.second} border={`4px solid ${theme.ink}`}>
                    <Label
                        size={38}
                        color="#fffaf2"
                        style={{ textAlign: "center", paddingTop: 10 }}
                    >
                        free member
                    </Label>
                </Card>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 340,
                    width: w,
                    height: 100,
                    background: snap > 0.5 ? theme.second : theme.accent,
                    borderRadius: 8,
                }}
            />
            <Label
                display
                size={78}
                color={snap > 0.5 ? theme.second : theme.accent}
                style={{ position: "absolute", left: w + 24, top: 340 }}
            >
                {fmt(value)} ms
            </Label>
            {snap > 0 && (
                <Label
                    size={40}
                    color={theme.inkSoft}
                    style={{ position: "absolute", left: 0, top: 480, opacity: snap }}
                >
                    was <span style={{ textDecoration: "line-through" }}>3,310 ms</span> of database
                    time
                </Label>
            )}
            <Label
                size={32}
                color={theme.onBgSoft}
                style={{ position: "absolute", left: 0, top: 610, opacity: grow }}
            >
                free member, measured on a copy of the test data
            </Label>
        </>
    );
}

function Readouts() {
    const theme = useTheme();
    const r = useRamp();
    const items = [
        { big: "93% → 44%", small: "database CPU" },
        { big: "22 → 10 ms", small: "work per request" },
        { big: "3,310 → 54 ms", small: "one-letter search, free member" },
    ];
    return (
        <>
            {items.map((it, i) => {
                const p = pop(r({ line: 15, at: 0.1 + i * 0.12 }, 0.5));
                return (
                    <At key={i} x={DB_CENTRE_X + (i - 1) * 520} y={650} scale={p}>
                        <Card w={490} h={150} color={theme.paper}>
                            <div style={{ textAlign: "center", paddingTop: 16 }}>
                                <Label display size={56} color={theme.ink}>
                                    {it.big}
                                </Label>
                                <Label size={34} color={theme.inkSoft} style={{ marginTop: 4 }}>
                                    {it.small}
                                </Label>
                            </div>
                        </Card>
                    </At>
                );
            })}
        </>
    );
}

export default function HalfTheWork() {
    return (
        <Stage>
            <Shot from={0} to={1}>
                <Crowd at={0} until={{ line: 1, at: "end" }} follow />
            </Shot>
            <Shot from={2} to={2}>
                <BiggerMachine />
            </Shot>
            <Shot from={3} to={3}>
                <SameAnswers />
            </Shot>
            <Ranking />
            <Shot from={6} to={6}>
                <KeysFirst />
            </Shot>
            <Shot from={7} to={7}>
                <SkipFuzzy />
            </Shot>
            <Shot from={8} to={8}>
                <FewerStatements />
            </Shot>
            <Shot from={9} to={10}>
                <Replay />
            </Shot>
            <Shot from={11} to={13}>
                <Crowd at={11} until={{ line: 13, at: "end" }} />
            </Shot>
            <Shot from={14} to={14}>
                <SearchDrop />
            </Shot>
            <Shot from={15}>
                <Readouts />
            </Shot>
            <TheDatabase />
        </Stage>
    );
}
