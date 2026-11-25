import React from "react";
import { Paper, Shot, Stage, Tag, useTheme, useType } from "../kit";
import { clamp01, mix, useClock } from "./shared/motion";
import {
    Booking,
    CORAL,
    Cloud,
    Coin,
    GOOD,
    HONEY,
    Hotel,
    Jar,
    Label,
    MONO,
    Timer,
    Walker,
} from "./shared/pieces";

export const theme = "qoria";
export const poster = { line: 9, at: "end" } as const;

const SERVICE = "Housekeeping, 2 floors";
const WHEN = "14 Jun · 09:00 to 13:00 · 4 h";

function Stamp(props: { p: number; style?: React.CSSProperties }) {
    const type = useType();
    if (props.p <= 0) return null;
    return (
        <div
            style={{
                position: "absolute",
                border: `6px solid ${CORAL}`,
                borderRadius: 10,
                padding: "4px 20px",
                color: CORAL,
                background: "rgba(255,255,255,0.5)",
                ...type.display,
                fontSize: 44,
                whiteSpace: "nowrap",
                opacity: Math.min(1, props.p * 2),
                transform: `rotate(-6deg) scale(${1.6 - 0.6 * props.p})`,
                ...props.style,
            }}
        >
            cancelled · refunded
        </div>
    );
}

/** Coins flying from a jar back to the hotel door along an arc. */
function CoinsBack(props: { p: number; from: [number, number]; to: [number, number] }) {
    if (props.p <= 0 || props.p >= 1.6) return null;
    return (
        <>
            {[0, 1, 2, 3].map((i) => {
                const q = clamp01(props.p * 1.4 - i * 0.12);
                if (q <= 0 || q >= 1) return null;
                const x = mix(props.from[0], props.to[0], q);
                const y = mix(props.from[1], props.to[1], q) - Math.sin(q * Math.PI) * 120;
                return <Coin key={i} size={44} style={{ position: "absolute", left: x, top: y }} />;
            })}
        </>
    );
}

/** Lines 0 to 10: one hotel, two bookings, two timers. */
function Tracks() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const out = c.spr({ line: 0, at: 0.1 });
    const paid = c.prog({ line: 0, at: 0.6 }, 0.9);
    const split = c.spr(1, 0.1);
    const later = c.after(6) && !c.after(9);
    const dimA = c.prog(6, 0.4) * (1 - c.prog(9, 0.4));

    // Track A.
    const ayCard = mix(250, 50, split);
    const aClock = c.after(4)
        ? `08:${String(Math.min(59, Math.round(40 + 20 * c.prog({ line: 4, at: 0.3 }, 2.6)))).padStart(2, "0")}`
        : undefined;
    const aClockText = aClock && c.after({ line: 4, at: 0.3 }, 2.6) ? "09:00" : aClock;
    const cloud = c.spr(4);
    const ringA = c.prog(5, 0.9);
    const stampA = c.prog({ line: 5, at: 0.3 }, 0.35);
    const tipA = c.prog({ line: 5, at: 0.45 }, 0.4);
    const backA = c.prog({ line: 5, at: 0.55 }, 1.2);

    // Track B.
    const byCard = mix(250, 420, split);
    const accepted = c.spr(3, 0.1);
    const walkOff = c.prog({ line: 3, at: 0.5 }, 1.6);
    const age = c.prog({ line: 6, at: 0.2 }, 3) * (1 - c.prog(7, 0.4));
    const rewind = c.prog(7, 0.6);
    const timerB = c.spr({ line: 7, at: 0.4 });
    const labelB = c.prog(8, 0.5);
    const bar = c.prog({ line: 8, at: 0.4 }, 0.8);
    const run = c.prog(9, (c.at({ line: 9, at: 0.62 }) - c.at(9)) * 1, 0);
    const hour = Math.floor(9 + 4 * clamp01(run / 0.8));
    const bClock = c.after(8)
        ? run >= 0.8
            ? "13:00 + grace"
            : `${String(hour).padStart(2, "0")}:00`
        : undefined;
    const ringB = c.prog({ line: 9, at: 0.62 }, 0.9);
    const stampB = c.prog({ line: 9, at: 0.7 }, 0.35);
    const tipB = c.prog({ line: 9, at: 0.75 }, 0.4);
    const backB = c.prog({ line: 9, at: 0.8 }, 1.2);
    const day = 15 + Math.round(13 * age);
    const yellow = age;
    const score = c.spr(10);
    const strike = c.prog({ line: 10, at: 0.3 }, 1.4);

    return (
        <>
            {/* Top band: kicker, "later", then the title. */}
            {!c.after(6) && (
                <div style={{ position: "absolute", left: 290, top: -40 }}>
                    <Tag
                        text="HelpHive"
                        at={0}
                        seed="kicker"
                        size={34}
                        color={HONEY}
                        ink={theme.ink}
                    />
                </div>
            )}
            {later && (
                <div style={{ position: "absolute", left: 290, top: -40 }}>
                    <Tag text="later" at={6} seed="later" size={34} />
                </div>
            )}
            {c.after(9, -0.2) && (
                <div
                    style={{
                        position: "absolute",
                        left: 290,
                        top: -50,
                        ...type.display,
                        fontSize: 54,
                        whiteSpace: "nowrap",
                        opacity: c.prog(9, 0.5, -0.2),
                    }}
                >
                    A booking that refunds itself.
                </div>
            )}

            <Hotel w={250} h={600} style={{ position: "absolute", left: 0, top: 130 }} />

            {/* Cloud and timers. */}
            {cloud > 0 && (
                <>
                    <Cloud
                        w={400}
                        style={{ position: "absolute", left: 1170, top: mix(-260, -40, cloud) }}
                    />
                    <svg
                        width={600}
                        height={700}
                        style={{ position: "absolute", left: 1100, top: 0 }}
                    >
                        <path
                            d={`M 170 110 L 170 ${mix(110, 200, c.prog({ line: 4, at: 0.2 }, 0.5))}`}
                            stroke={theme.ink}
                            strokeWidth={3}
                        />
                        {timerB > 0 && (
                            <path
                                d={`M 380 110 L 380 ${mix(110, 430, timerB)}`}
                                stroke={theme.ink}
                                strokeWidth={3}
                            />
                        )}
                    </svg>
                    <div
                        style={{
                            position: "absolute",
                            left: 1210,
                            top: mix(110, 190, c.prog({ line: 4, at: 0.2 }, 0.5)),
                            opacity: clamp01(cloud * 2) * (1 - 0.6 * dimA),
                        }}
                    >
                        <Timer
                            size={120}
                            turn={c.prog(
                                { line: 4, at: 0.3 },
                                c.at(5) - c.at({ line: 4, at: 0.3 }),
                            )}
                            ring={ringA > 0 ? ringA : undefined}
                        />
                    </div>
                    <Label
                        style={{
                            position: "absolute",
                            left: 1110,
                            top: 330,
                            opacity: c.prog({ line: 4, at: 0.3 }, 0.4) * (1 - 0.6 * dimA),
                        }}
                    >
                        09:00 · anyone accepted?
                    </Label>
                    {timerB > 0 && (
                        <div
                            style={{ position: "absolute", left: 1420, top: mix(110, 420, timerB) }}
                        >
                            <Timer
                                size={120}
                                color={HONEY}
                                turn={labelB > 0 ? run : 0}
                                ring={ringB > 0 ? ringB : undefined}
                            />
                        </div>
                    )}
                    {labelB > 0 && (
                        <Label
                            style={{
                                position: "absolute",
                                left: 1180,
                                top: 565,
                                width: 420,
                                textAlign: "right",
                                opacity: labelB,
                            }}
                        >
                            13:00 + grace · job started?
                        </Label>
                    )}
                </>
            )}

            {/* Track A. */}
            <div style={{ opacity: 1 - 0.6 * dimA }}>
                <Booking
                    id="HH-1042"
                    service={SERVICE}
                    when={WHEN}
                    clock={aClockText}
                    style={{ position: "absolute", left: mix(-300, 300, out), top: ayCard }}
                />
                <Stamp p={stampA} style={{ left: 430, top: ayCard + 60 }} />
                <Jar
                    level={(paid > 0.95 ? 1 : 0) * (1 - backA)}
                    tip={tipA}
                    label={backA > 0.9 ? "returned" : "held · 64.00"}
                    style={{
                        position: "absolute",
                        left: 920,
                        top: mix(240, 40, split),
                        opacity: paid > 0 ? 1 : 0,
                    }}
                />
                {split > 0.5 && !c.after(4) && (
                    <Label
                        color={theme.inkSoft}
                        style={{
                            position: "absolute",
                            left: 310,
                            top: 236,
                            opacity: c.prog(2, 0.4),
                        }}
                    >
                        waiting for a provider…
                    </Label>
                )}
                <CoinsBack p={backA} from={[960, 120]} to={[110, 300]} />
            </div>
            {/* The paid coins moving into the jar (line 0). */}
            {paid > 0 && paid < 1 && (
                <>
                    {[0, 1, 2].map((i) => {
                        const q = clamp01(paid * 1.3 - i * 0.15);
                        return (
                            <Coin
                                key={i}
                                size={44}
                                style={{
                                    position: "absolute",
                                    left: mix(200, 970, q),
                                    top: mix(560, 300, q) - Math.sin(q * Math.PI) * 140,
                                    opacity: q > 0 && q < 1 ? 1 : 0,
                                }}
                            />
                        );
                    })}
                    <Label
                        style={{
                            position: "absolute",
                            left: 520,
                            top: 470,
                            opacity: Math.min(1, paid * 3),
                        }}
                    >
                        paid · 64.00
                    </Label>
                </>
            )}
            {/* Providers walking past track A (line 2). */}
            {c.after(2) &&
                !c.after(4) &&
                [0, 1, 2].map((i) => {
                    const w = c.prog(2, 2.4, i * 0.45);
                    if (w <= 0 || w >= 1) return null;
                    return (
                        <Walker
                            key={i}
                            size={54}
                            walk={c.t * 1.8 + i * 0.3}
                            style={{ position: "absolute", left: mix(290, 1150, w), top: 262 }}
                        />
                    );
                })}

            {/* Track B. */}
            {split > 0.02 && (
                <div style={{ opacity: clamp01(split * 2) }}>
                    <Booking
                        id="HH-1043"
                        service={SERVICE}
                        when={WHEN}
                        clock={bClock}
                        curl={yellow}
                        color={
                            yellow > 0
                                ? `rgb(${247 - 8 * yellow}, ${246 - 22 * yellow}, ${241 - 70 * yellow})`
                                : undefined
                        }
                        style={{ position: "absolute", left: 300, top: byCard }}
                    />
                    <Jar
                        level={1 - backB}
                        tip={tipB}
                        cobweb={yellow}
                        label={backB > 0.9 ? "returned" : "held · 64.00"}
                        style={{ position: "absolute", left: 920, top: mix(240, 400, split) }}
                    />
                    {accepted > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 380,
                                top: byCard - 62,
                                opacity: clamp01(accepted * 2),
                                transform: `translateY(${(1 - accepted) * -40}px) rotate(3deg)`,
                            }}
                        >
                            <Paper
                                seed="sana"
                                style={{ width: 210, height: 64 }}
                                innerStyle={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "0 14px",
                                    ...type.display,
                                    fontSize: 30,
                                }}
                            >
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 17,
                                        background: theme.accent,
                                        flexShrink: 0,
                                    }}
                                />
                                Sana R.
                            </Paper>
                            <div
                                style={{
                                    marginTop: -4,
                                    marginLeft: 70,
                                    display: "inline-block",
                                    background: GOOD,
                                    color: "#fff",
                                    ...type.label,
                                    fontSize: 28,
                                    padding: "2px 14px",
                                    borderRadius: 6,
                                }}
                            >
                                accepted
                            </div>
                        </div>
                    )}
                    {walkOff > 0 && walkOff < 1 && (
                        <Walker
                            size={60}
                            color={theme.accent}
                            walk={c.t * 1.8}
                            style={{
                                position: "absolute",
                                left: mix(800, 1700, walkOff),
                                top: byCard - 120,
                            }}
                        />
                    )}
                    {age > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 1090,
                                top: 420,
                                opacity: Math.min(1, age * 4),
                            }}
                        >
                            <Paper
                                seed="wall-cal"
                                style={{ width: 150, height: 150 }}
                                innerStyle={{ textAlign: "center", overflow: "hidden" }}
                            >
                                <div
                                    style={{
                                        background: theme.accent,
                                        color: "#fffaf2",
                                        ...type.label,
                                        fontSize: 28,
                                        padding: "4px 0",
                                    }}
                                >
                                    Jun
                                </div>
                                <div style={{ ...type.display, fontSize: 72, marginTop: 8 }}>
                                    {day}
                                </div>
                            </Paper>
                            <Label color={theme.inkSoft} style={{ marginTop: 10 }}>
                                still open
                            </Label>
                        </div>
                    )}
                    {bar > 0 && (
                        <div style={{ position: "absolute", left: 300, top: 600 }}>
                            <div
                                style={{
                                    display: "flex",
                                    width: 560 * bar,
                                    overflow: "hidden",
                                    height: 30,
                                }}
                            >
                                <div
                                    style={{
                                        width: 440,
                                        flexShrink: 0,
                                        background: HONEY,
                                        border: `3px solid ${theme.ink}`,
                                        borderRadius: "6px 0 0 6px",
                                    }}
                                />
                                <div
                                    style={{
                                        width: 120,
                                        flexShrink: 0,
                                        background: "#bdbcb4",
                                        border: `3px solid ${theme.ink}`,
                                        borderLeft: "none",
                                        borderRadius: "0 6px 6px 0",
                                    }}
                                />
                            </div>
                            {labelB > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: mix(0, 560, clamp01(run)) - 4,
                                        top: -10,
                                        width: 8,
                                        height: 50,
                                        background: theme.ink,
                                        opacity: c.after(9) ? 1 : 0,
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    position: "relative",
                                    height: 40,
                                    opacity: bar,
                                    fontFamily: MONO,
                                    fontSize: 28,
                                }}
                            >
                                <span style={{ position: "absolute", left: 0, top: 4 }}>09:00</span>
                                <span style={{ position: "absolute", left: 360, top: 4 }}>
                                    13:00
                                </span>
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 456,
                                        top: 4,
                                        color: theme.inkSoft,
                                    }}
                                >
                                    grace
                                </span>
                            </div>
                        </div>
                    )}
                    {bar > 0 && !c.after(10) && (
                        <Label
                            color={theme.inkSoft}
                            style={{ position: "absolute", left: 300, top: 690, opacity: bar }}
                        >
                            asked to start:{" "}
                            <span
                                style={{
                                    border: `3px dashed ${theme.inkSoft}`,
                                    padding: "0 30px",
                                    borderRadius: 6,
                                }}
                            >
                                &nbsp;
                            </span>
                        </Label>
                    )}
                    <Stamp p={stampB} style={{ left: 430, top: byCard + 60 }} />
                    <CoinsBack p={backB} from={[960, 470]} to={[110, 620]} />
                    {score > 0 &&
                        ["Hotel", "Provider"].map((who, i) => (
                            <div
                                key={who}
                                style={{
                                    position: "absolute",
                                    left: 300 + i * 270,
                                    top: 680,
                                    opacity: clamp01(score * 2),
                                    transform: `translateY(${(1 - score) * 30}px)`,
                                }}
                            >
                                <Paper
                                    seed={`score-${who}`}
                                    style={{ width: 250, height: 110 }}
                                    innerStyle={{ padding: "10px 18px", boxSizing: "border-box" }}
                                >
                                    <div style={{ ...type.display, fontSize: 32 }}>{who}</div>
                                    <div style={{ ...type.label, fontSize: 30, color: GOOD }}>
                                        {strike > 0.6 ? "✓ no strike" : "strikes: 0"}
                                    </div>
                                </Paper>
                            </div>
                        ))}
                    {strike > 0 && strike < 1 && (
                        <div
                            style={{
                                position: "absolute",
                                left: mix(500, 640, strike),
                                top: mix(640, 520, strike),
                                ...type.display,
                                fontSize: 80,
                                color: CORAL,
                                opacity: 1 - strike,
                                transform: `rotate(${strike * 40}deg)`,
                            }}
                        >
                            ✗
                        </div>
                    )}
                    {score > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 1100,
                                top: 640,
                                opacity: c.prog({ line: 10, at: 0.35 }, 0.5),
                            }}
                        >
                            <Paper
                                seed="note"
                                style={{ width: 500, height: 170 }}
                                innerStyle={{ padding: "12px 20px", boxSizing: "border-box" }}
                            >
                                <div style={{ fontFamily: MONO, fontSize: 28 }}>
                                    cancelled by:{" "}
                                    <span style={{ color: theme.accent }}>nobody</span>
                                </div>
                                <div
                                    style={{
                                        ...type.body,
                                        fontSize: 28,
                                        marginTop: 6,
                                        lineHeight: 1.25,
                                    }}
                                >
                                    The job was not started before the shift ended.
                                </div>
                            </Paper>
                        </div>
                    )}
                </div>
            )}
            {/* Rewind flutter over track B (line 7). */}
            {rewind > 0 && rewind < 1 && (
                <div
                    style={{
                        position: "absolute",
                        left: 280,
                        top: 380,
                        width: 1320,
                        height: 330,
                        overflow: "hidden",
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                top: i * 115,
                                left: mix(1400, -1500, clamp01(rewind * 1.4 - i * 0.15)),
                                width: 1300,
                                height: 105,
                                background: i % 2 ? theme.paper : theme.paperAlt,
                                boxShadow: `5px 7px 0 ${theme.shadow}`,
                            }}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

/** Lines 11 and 12: the 30-day limit, and the timer that hops. */
function FarAhead() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const x0 = 60;
    const perDay = 17.8;
    const dx = (d: number) => x0 + d * perDay;
    const lineY = 470;
    const tryHang = c.prog({ line: 11, at: 0.35 }, 0.9);
    const snap = c.prog({ line: 11, at: 0.75 }, 0.6);
    const hang29 = c.spr(12, 0.1);
    const hop1 = c.prog({ line: 12, at: 0.45 }, 0.7);
    const hop2 = c.prog({ line: 12, at: 0.72 }, 0.7);
    let tx = dx(29);
    let ty = 250;
    if (hop1 > 0) {
        tx = mix(dx(29), dx(58), hop1);
        ty = 250 - Math.sin(hop1 * Math.PI) * 160;
    }
    if (hop2 > 0) {
        tx = mix(dx(58), dx(80), hop2);
        ty = 250 - Math.sin(hop2 * Math.PI) * 120;
    }
    const arc = (a: number, b: number, h: number, p: number) =>
        p > 0 ? (
            <path
                d={`M ${dx(a)} 300 Q ${(dx(a) + dx(b)) / 2} ${300 - h * 2} ${dx(b)} 300`}
                fill="none"
                stroke={theme.accent}
                strokeWidth={5}
                strokeDasharray="12 10"
                pathLength={1}
                opacity={0.9}
                style={{ strokeDasharray: `${p} 1` }}
            />
        ) : null;
    return (
        <>
            <div style={{ position: "absolute", left: 0, top: -40 }}>
                <Tag text="one more catch" at={11} seed="catch" size={34} />
            </div>
            <svg width={1600} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                <rect
                    x={x0}
                    y={lineY}
                    width={dx(80) - x0}
                    height={14}
                    rx={7}
                    fill={theme.paperAlt}
                    stroke={theme.ink}
                    strokeWidth={3}
                />
                {[0, 29, 58, 80].map((d) => (
                    <path
                        key={d}
                        d={`M ${dx(d)} ${lineY - 12} V ${lineY + 26}`}
                        stroke={theme.ink}
                        strokeWidth={4}
                    />
                ))}
                <rect
                    x={dx(30) - 6}
                    y={150}
                    width={14}
                    height={lineY - 150 + 40}
                    fill={CORAL}
                    opacity={0.85}
                />
                {arc(29, 58, 80, hop1)}
                {arc(58, 80, 60, hop2)}
            </svg>
            <Label style={{ position: "absolute", left: dx(30) + 16, top: 405 }} color={CORAL}>
                30 days
            </Label>
            {[
                [0, "today · 3 Sep"],
                [29, "day 29"],
                [58, "day 58"],
            ].map(([d, t]) => (
                <Label
                    key={String(d)}
                    style={{ position: "absolute", left: dx(Number(d)) - 20, top: lineY + 40 }}
                    color={theme.inkSoft}
                >
                    {t}
                </Label>
            ))}
            <div
                style={{
                    position: "absolute",
                    left: dx(80) - 420,
                    top: lineY + 100,
                    opacity: c.prog(11, 0.5),
                }}
            >
                <Booking
                    id="HH-1107"
                    service="Laundry and linen"
                    when="22 Nov · 08:00 to 12:00"
                    w={420}
                />
            </div>
            {/* The first try: hung at the booking date, its string snaps at the 30-day wall. */}
            {tryHang > 0 && hang29 <= 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: mix(dx(2), dx(30) - 70, tryHang),
                        top: 250 + snap * 260,
                        transform: `rotate(${snap * 70}deg)`,
                        opacity: 1 - clamp01((snap - 0.6) * 2.5),
                    }}
                >
                    <Timer size={150} turn={0} />
                </div>
            )}
            {tryHang > 0 && hang29 <= 0 && snap > 0 && (
                <Label
                    style={{ position: "absolute", left: dx(30) + 16, top: 200, opacity: snap }}
                    color={CORAL}
                >
                    can&apos;t schedule that far
                </Label>
            )}
            {hang29 > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: tx - 75,
                        top: ty - 10 + (1 - hang29) * -80,
                    }}
                >
                    <Timer
                        size={150}
                        turn={hop2 >= 1 ? 1 : 0.2 + 0.8 * hop1}
                        ring={
                            hop1 <= 0
                                ? c.prog({ line: 12, at: 0.25 }, 0.5)
                                : hop2 >= 1
                                  ? c.prog({ line: 12, at: "end" }, 0.8)
                                  : undefined
                        }
                    />
                </div>
            )}
            {hang29 > 0 && hop1 <= 0 && c.after({ line: 12, at: 0.3 }) && (
                <div style={{ position: "absolute", left: dx(29) + 60, top: 170 }}>
                    <Paper
                        seed="not-yet"
                        style={{ width: 190, height: 64 }}
                        innerStyle={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...type.label,
                            fontSize: 32,
                        }}
                    >
                        not yet
                    </Paper>
                </div>
            )}
            {hop1 > 0 && hop2 <= 0 && hop1 >= 1 && (
                <div style={{ position: "absolute", left: dx(58) + 60, top: 170 }}>
                    <Paper
                        seed="not-yet-2"
                        style={{ width: 190, height: 64 }}
                        innerStyle={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...type.label,
                            fontSize: 32,
                        }}
                    >
                        not yet
                    </Paper>
                </div>
            )}
        </>
    );
}

/** Line 13: many bookings, each with its own timer; nothing is stuck. */
function Board() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const items = [
        ["HH-1042", "14 Jun"],
        ["HH-1043", "14 Jun"],
        ["HH-1051", "Today"],
        ["HH-1107", "22 Nov"],
        ["HH-0998", "9 Jun"],
        ["HH-1019", "11 Jun"],
    ];
    return (
        <>
            {items.map(([id, d], i) => {
                const s = c.spr(13, 0.05 + i * 0.1);
                const col = i % 3;
                const row = Math.floor(i / 3);
                return (
                    <div
                        key={id}
                        style={{
                            position: "absolute",
                            left: 40 + col * 520,
                            top: 30 + row * 230,
                            opacity: clamp01(s * 2),
                            transform: `translateY(${(1 - s) * 40}px) rotate(${(i % 2 ? 1 : -1) * 1.2}deg)`,
                        }}
                    >
                        <Paper
                            seed={`board-${id}`}
                            style={{ width: 440, height: 170 }}
                            innerStyle={{ padding: "18px 24px", boxSizing: "border-box" }}
                        >
                            <div style={{ fontFamily: MONO, fontSize: 28, color: theme.inkSoft }}>
                                {id}
                            </div>
                            <div style={{ ...type.display, fontSize: 44, marginTop: 10 }}>{d}</div>
                        </Paper>
                        <div style={{ position: "absolute", left: 330, top: 40 }}>
                            <Timer
                                size={90}
                                turn={(c.t * 0.12 + i * 0.17) % 1}
                                color={i % 2 ? HONEY : undefined}
                            />
                        </div>
                    </div>
                );
            })}
            <div
                style={{
                    position: "absolute",
                    left: 640,
                    top: 500,
                    opacity: c.prog({ line: 13, at: 0.3 }, 0.6),
                }}
            >
                <Jar level={0} label="nothing held" />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 740,
                    width: 1600,
                    textAlign: "center",
                    ...type.display,
                    fontSize: 54,
                    opacity: c.prog({ line: 13, at: 0.5 }, 0.6),
                }}
            >
                A booking that refunds itself.
            </div>
        </>
    );
}

export default function RefundsItself() {
    return (
        <Stage>
            <Shot from={0} to={10}>
                <Tracks />
            </Shot>
            <Shot from={11} to={12}>
                <FarAhead />
            </Shot>
            <Shot from={13}>
                <Board />
            </Shot>
        </Stage>
    );
}
