import React from "react";
import { Box, Paper, Shot, Stage, Tag, roughPath, useTheme, useType } from "../kit";
import { clamp01, mix, useClock } from "./shared/motion";
import {
    APPS,
    AppCard,
    CORAL,
    DeployBar,
    Door,
    GOOD,
    Hand,
    Ink,
    Inspector,
    Lock,
    Terminal,
    type SegState,
} from "./shared/pieces";

export const theme = "qoria";
export const poster = { line: 13, at: "end" } as const;

const PROMISES = [
    "only my own flows",
    "exact https return addresses",
    "no app open to every account",
    "exactly one administrator",
];
const OTHERS = [
    "recovery codes retire old ones",
    "policy hooks still exist after upgrade",
    "second factor always",
    "machine client: one grant only",
    "every app is a confidential client",
    "human check uses a real key",
];
const LOCKS = 37;

/** Lines 0 and 1: four apps, one door; the door cracks and every app goes wrong with it. */
function OneDoor() {
    const c = useClock();
    const theme = useTheme();
    const spots = [
        [210, 190],
        [1390, 190],
        [210, 660],
        [1390, 660],
    ];
    const door = { x: 800, y: 400 };
    const crack =
        c.prog({ line: 1, at: 0.05 }, 0.6) * (1 - c.prog({ line: 1, at: "end" }, 0.4, 0.1));
    const wrong =
        c.prog({ line: 1, at: 0.35 }, 0.5) * (1 - c.prog({ line: 1, at: "end" }, 0.4, 0.1));
    return (
        <>
            <svg width={1600} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                {spots.map(([x, y], i) => {
                    const p = c.prog({ line: 0, at: 0.2 }, 0.5, 0.35 + i * 0.25);
                    return (
                        <Ink
                            key={i}
                            from={[
                                door.x + (x < door.x ? -110 : 110),
                                door.y + (y < door.y ? -40 : 90),
                            ]}
                            to={[x + (x < door.x ? 175 : -175), y]}
                            p={p}
                            seed={`l${i}`}
                            color={wrong > 0.05 ? CORAL : theme.ink}
                            width={6}
                        />
                    );
                })}
            </svg>
            {spots.map(([x, y], i) => {
                const s = c.spr({ line: 0, at: 0.15 }, i * 0.25);
                const dx = (x < door.x ? -1 : 1) * (1 - s) * 260;
                return (
                    <AppCard
                        key={i}
                        app={APPS[i]}
                        w={340}
                        h={230}
                        dim={wrong}
                        tilt={wrong * (i % 2 ? 7 : -7)}
                        style={{
                            position: "absolute",
                            left: x - 170 + dx,
                            top: y - 115 + wrong * 30,
                            opacity: clamp01(s * 2),
                        }}
                    />
                );
            })}
            <Door
                w={250}
                label="Sign-in"
                crack={crack}
                style={{
                    position: "absolute",
                    left: door.x - 125,
                    top: door.y - 210,
                    transform: `scale(${0.6 + 0.4 * c.spr(0)})`,
                }}
            />
        </>
    );
}

/** Lines 2 to 4: hand-set toggles drift, an upgrade brings back a second door, then it all goes. */
function ByHand() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const door = { x: 440, y: 330 };
    const rows = [
        "allow sign-up",
        "second factor",
        "session length",
        "return address",
        "admin role",
    ];
    const flipAt = (k: number) => c.at(2) + 0.25 + k * 0.42;
    const drift = c.prog(2, 2.6, 0.4) * 0.6 + c.prog(3, 3) * 0.4;
    const crumple = c.prog({ line: 4, at: 0.05 }, 0.9);
    const day = Math.round(1 + 239 * c.prog(2, 2.4 + (c.at(4) - c.at(3)), 0.2));
    // The cursor hand travels from toggle to toggle.
    const k = Math.max(0, Math.min(rows.length - 1, Math.floor((c.t - c.at(2) - 0.05) / 0.42)));
    const handY = 114 + k * 66;
    const flimsy = c.spr({ line: 3, at: 0.45 });
    const flimsyGone = c.prog({ line: 4, at: 0.45 }, 0.6);
    const box = c.spr({ line: 3, at: 0.05 }, 0, 1.6);
    const chips = APPS.map((a, i) => ({ app: a, x: 100 + i * 222, y: 700 }));
    return (
        <>
            <svg width={1600} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                {chips.map((ch, i) => (
                    <Ink
                        key={i}
                        from={[door.x, door.y + 200]}
                        to={[ch.x, ch.y - 70]}
                        p={c.prog(2, 0.5, i * 0.1)}
                        seed={`b${i}`}
                        width={5}
                    />
                ))}
                {chips.map((ch, i) => (
                    <Ink
                        key={`d${i}`}
                        from={[240, 480]}
                        to={[ch.x, ch.y - 70]}
                        p={c.prog({ line: 3, at: 0.7 }, 0.7, i * 0.08) * (1 - flimsyGone)}
                        seed={`f${i}`}
                        color={CORAL}
                        width={4}
                        dashed
                        opacity={0.75}
                    />
                ))}
            </svg>
            {chips.map((ch, i) => (
                <AppCard
                    key={i}
                    app={ch.app}
                    w={200}
                    h={140}
                    style={{ position: "absolute", left: ch.x - 100, top: ch.y - 70 }}
                />
            ))}
            {flimsy > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: mix(door.x - 70, 170, flimsy),
                        top: 230,
                        opacity: clamp01(flimsy * 2) * (1 - flimsyGone),
                        transform: `rotate(${-6 * flimsy}deg)`,
                    }}
                >
                    <Door w={140} flimsy label="default flow" />
                </div>
            )}
            <Door
                w={200}
                label="Sign-in"
                style={{ position: "absolute", left: door.x - 100, top: door.y - 190 }}
            />
            {box > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: door.x - 95,
                        top: mix(-260, door.y - 275, box),
                        opacity: 1 - flimsyGone,
                    }}
                >
                    <Paper
                        seed="upgrade-box"
                        color="#d8c49a"
                        style={{ width: 190, height: 82 }}
                        innerStyle={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...type.label,
                            fontSize: 34,
                        }}
                    >
                        upgrade
                    </Paper>
                </div>
            )}
            <div
                style={{
                    position: "absolute",
                    left: 880,
                    top: 60,
                    transformOrigin: "0% 0%",
                    transform: `translateY(${crumple * 420}px) rotate(${drift * 4 + crumple * 50}deg) scale(${1.12 * (1 - crumple * 0.75)})`,
                    opacity: 1 - clamp01((crumple - 0.6) * 2.5),
                }}
            >
                <Paper
                    seed="settings"
                    style={{ width: 470, height: 520 }}
                    innerStyle={{ padding: "26px 34px", boxSizing: "border-box" }}
                >
                    <div style={{ ...type.display, fontSize: 44 }}>Settings</div>
                    {rows.map((r, i) => {
                        const on = c.t > flipAt(i) ? 1 : 0;
                        const knob = clamp01((c.t - flipAt(i)) / 0.18);
                        const initial = i % 2 === 0;
                        const state = initial ? 1 - knob : knob;
                        return (
                            <div
                                key={r}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: 26,
                                    ...type.label,
                                    fontSize: 30,
                                    position: "relative",
                                }}
                            >
                                {r}
                                <div
                                    style={{
                                        width: 76,
                                        height: 40,
                                        borderRadius: 20,
                                        background: state > 0.5 ? theme.accent : theme.paperAlt,
                                        border: `3px solid ${theme.ink}`,
                                        position: "relative",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 3,
                                            left: 4 + state * 34,
                                            width: 30,
                                            height: 30,
                                            borderRadius: 15,
                                            background: theme.paper,
                                            border: `2px solid ${theme.ink}`,
                                        }}
                                    />
                                </div>
                                {on > 0 && (
                                    <svg
                                        width={200}
                                        height={40}
                                        style={{
                                            position: "absolute",
                                            left: 10,
                                            top: 30,
                                            opacity: drift,
                                        }}
                                    >
                                        <path
                                            d={roughPath([0, 10], [180, 16], `sc${i}`, 6, 0.1)}
                                            stroke={theme.inkSoft}
                                            strokeWidth={3}
                                            fill="none"
                                        />
                                    </svg>
                                )}
                            </div>
                        );
                    })}
                </Paper>
                {c.t < c.at(3) + 0.3 && (
                    <Hand
                        size={74}
                        style={{
                            position: "absolute",
                            left: 372,
                            top: handY + (Math.sin(c.t * 14) > 0.6 ? 6 : 0),
                        }}
                    />
                )}
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 1420,
                    top: 60,
                    transform: `translateY(${crumple * 420}px) rotate(${crumple * -40}deg) scale(${1 - crumple * 0.7})`,
                    opacity: 1 - clamp01((crumple - 0.6) * 2.5),
                }}
            >
                <Paper
                    seed="calendar"
                    style={{ width: 200, height: 210 }}
                    innerStyle={{ textAlign: "center", overflow: "hidden" }}
                >
                    <div
                        style={{
                            background: theme.accent,
                            color: "#fffaf2",
                            ...type.label,
                            fontSize: 30,
                            padding: "8px 0",
                        }}
                    >
                        day
                    </div>
                    <div style={{ ...type.display, fontSize: 92, marginTop: 14 }}>{day}</div>
                </Paper>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 1420,
                    top: 300,
                    width: 190,
                    opacity: c.prog(2, 0.6, 1.2) * (1 - crumple),
                    ...type.label,
                    fontSize: 32,
                    color: theme.inkSoft,
                }}
            >
                set by hand, one day at a time
            </div>
        </>
    );
}

/** Lines 5 and 6: one long file describes the server; the door is built from it; then it is only intent. */
function OneFile() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const unroll = c.prog({ line: 5, at: 0 }, 1.6);
    const rollUp = c.prog({ line: 6, at: 0 }, 0.8);
    const h = mix(40, 740, unroll) * (1 - rollUp) + 110 * rollUp;
    const heads = ["sign-in flow", "setup flow", "reset flow", "apps allowed to sign people in"];
    const build = c.prog({ line: 5, at: 0.55 }, 1.2);
    const q = c.spr({ line: 6, at: 0.45 });
    return (
        <>
            <div style={{ position: "absolute", left: 120, top: mix(0, 300, rollUp), width: 580 }}>
                <Paper
                    seed="scroll"
                    style={{ width: 580, height: h }}
                    innerStyle={{
                        padding: "26px 36px",
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }}
                    sway={0.3}
                >
                    <div style={{ ...type.display, fontSize: 40, whiteSpace: "nowrap" }}>
                        configuration
                        <span style={{ color: theme.accent }}> · 1,505 lines</span>
                    </div>
                    {heads.map((hd, i) => (
                        <div key={hd} style={{ marginTop: 34, opacity: rollUp > 0.3 ? 0 : 1 }}>
                            <div style={{ ...type.label, fontSize: 32, color: theme.ink }}>
                                {hd}
                            </div>
                            {[0.9, 0.7, 0.8].map((w, j) => (
                                <div
                                    key={j}
                                    style={{
                                        height: 10,
                                        width: `${w * (i % 2 ? 0.92 : 1) * 100}%`,
                                        background: theme.paperAlt,
                                        borderRadius: 5,
                                        marginTop: 12,
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </Paper>
                <div
                    style={{
                        height: 34,
                        marginTop: -14,
                        marginLeft: -16,
                        width: 612,
                        borderRadius: 17,
                        background: theme.paperAlt,
                        border: `3px solid ${theme.ink}`,
                    }}
                />
                {rollUp > 0.5 && (
                    <Tag
                        text="intent"
                        at={{ line: 6, at: 0.25 }}
                        seed="intent"
                        size={40}
                        style={{ position: "absolute", left: 200, top: -70 }}
                    />
                )}
            </div>
            <svg width={1600} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                {[0, 1, 2, 3].map((i) => (
                    <Ink
                        key={i}
                        from={[720, 210 + i * 125]}
                        to={[1080, 260 + i * 70]}
                        p={c.prog({ line: 5, at: 0.45 }, 0.6, i * 0.12) * (1 - rollUp)}
                        seed={`sc${i}`}
                        dashed
                        width={4}
                        color={theme.inkSoft}
                    />
                ))}
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 1120,
                    top: 150,
                    clipPath: `inset(${(1 - build) * 100}% -40px -40px -40px)`,
                }}
            >
                <Door w={240} label="Sign-in server" />
            </div>
            {q > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 820,
                        top: 160,
                        ...type.display,
                        fontSize: 260,
                        color: theme.ink,
                        opacity: 0.3 * q,
                        transform: `scale(${0.6 + 0.4 * q}) rotate(${-8 + 8 * q}deg)`,
                    }}
                >
                    ?
                </div>
            )}
            {q > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 760,
                        top: 560,
                        width: 360,
                        textAlign: "center",
                        ...type.label,
                        fontSize: 36,
                        color: theme.inkSoft,
                        opacity: q,
                    }}
                >
                    is it really true?
                </div>
            )}
        </>
    );
}

/** Line 7: after the deploy, a check walks into the running server, down to the live database. */
function CheckInside() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const walkIn = c.prog({ line: 7, at: 0.2 }, 1.2);
    const walkDown = c.prog({ line: 7, at: 0.55 }, 1.4);
    const inside = c.prog({ line: 7, at: 0.1 }, 0.6);
    const x = walkDown > 0 ? mix(470, 900, walkDown) : mix(-80, 330, walkIn);
    const y = walkDown > 0 ? mix(420, 520, walkDown) : 420;
    const hidden = walkIn >= 1 && walkDown <= 0;
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 200,
                    top: 150,
                    width: 1360,
                    height: 680,
                    border: `4px dashed ${theme.inkSoft}`,
                    borderRadius: 26,
                    opacity: inside,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 230,
                    top: 162,
                    ...type.label,
                    fontSize: 32,
                    color: theme.inkSoft,
                    opacity: inside,
                }}
            >
                inside the server
            </div>
            <Door w={210} label="Sign-in" style={{ position: "absolute", left: 300, top: 250 }} />
            <svg width={1600} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                <Ink
                    from={[500, 720]}
                    to={[960, 720]}
                    p={c.prog({ line: 7, at: 0.5 }, 0.5)}
                    seed="walkpath"
                    dashed
                    width={4}
                    color={theme.inkSoft}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    transform: "scale(1.35)",
                    transformOrigin: "1180px 560px",
                }}
            >
                <Box
                    kind="database"
                    label="live database"
                    x={1180}
                    y={560}
                    at={{ line: 7, at: 0.3 }}
                />
            </div>
            {!hidden && (
                <div style={{ position: "absolute", left: x, top: y - 40 }}>
                    <Inspector size={140} walk={c.t * 1.6} />
                    <div style={{ position: "absolute", left: -10, top: -50 }}>
                        <Tag text="check" at={{ line: 7, at: 0.15 }} size={28} seed="check-tag" />
                    </div>
                </div>
            )}
        </>
    );
}

/** The deploy bar across the top, from line 7 to the end. */
function Deploy() {
    const c = useClock();
    const shut = useShutCount();
    const show = c.prog(7, 0.5);
    if (show <= 0) return null;
    const replay = c.after(14, 0.15);
    const base = replay ? c.at(14) + 0.3 : c.at(7) + 0.2;
    const f = (i: number) => clamp01((c.t - base - i * 0.45) / 0.45);
    let verify: SegState = "idle";
    let vfill = 0;
    if (c.t > base + 1.35) {
        verify = "run";
        vfill = 0.12 + 0.8 * (shut / LOCKS);
    }
    if (!replay && c.after({ line: 13, at: 0.55 })) {
        verify = "ok";
        vfill = 1;
    }
    if (replay && c.after({ line: 15, at: 0.55 })) verify = "fail";
    const seg = (label: string, i: number) => ({
        label,
        fill: f(i),
        state: (f(i) >= 1 ? "ok" : f(i) > 0 ? "run" : "idle") as SegState,
    });
    return (
        <div style={{ position: "absolute", left: 0, top: -20, opacity: show }}>
            <DeployBar
                w={1600}
                segments={[
                    seg("build", 0),
                    seg("ship", 1),
                    seg("containers restarted", 2),
                    { label: "verify", fill: vfill, state: verify },
                ]}
            />
        </div>
    );
}

/** When lock i clicks shut (seconds), or Infinity. */
function useLockTimes() {
    const c = useClock();
    const first = [
        c.at({ line: 9, at: 0.55 }),
        c.at({ line: 10, at: 0.55 }),
        c.at({ line: 11, at: 0.55 }),
        c.at({ line: 12, at: 0.5 }),
    ];
    const ripple = c.at({ line: 12, at: 0.8 });
    const replayOpen = c.at(14) + 0.15;
    const replayRipple = c.at({ line: 14, at: 0.45 });
    return Array.from({ length: LOCKS }, (_, i) => {
        const shutAt = i < 4 ? first[i] : ripple + (i - 4) * 0.035;
        if (c.t < replayOpen) return c.t >= shutAt ? c.t - shutAt : -1;
        if (i === 0) return -1;
        const again = replayRipple + (i - 1) * 0.03;
        return c.t >= again ? c.t - again : -1;
    });
}

function useShutCount() {
    return useLockTimes().filter((x) => x >= 0.15).length;
}

/** Lines 8 to the end: the wall of 37 locks, the promise being checked, the counter. */
function LockWall() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const times = useLockTimes();
    const appear = c.spr(8);
    if (appear <= 0) return null;
    const shut = times.filter((x) => x >= 0.15).length;
    const toSide = c.prog({ line: 13, at: 0 }, 0.8);
    const scale = mix(1, 0.6, toSide);
    const left = mix(10, 0, toSide);
    const top = mix(150, 220, toSide);
    const failing = c.prog({ line: 15, at: 0.3 }, 0.4);
    // Which promise is being read out (lines 9 to 12).
    let featured = -1;
    for (let k = 0; k < 4; k++) if (c.t >= c.at(9 + k) - 0.1) featured = k;
    if (c.t >= c.at({ line: 12, at: 0.8 })) featured = -1;
    const rippleIdx = Math.floor((c.t - c.at({ line: 12, at: 0.8 })) / 0.035) + 4;
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left,
                    top,
                    width: 990,
                    transform: `scale(${scale})`,
                    transformOrigin: "0 0",
                    opacity: clamp01(appear * 2),
                }}
            >
                {times.map((dt, i) => {
                    const col = i % 8;
                    const row = Math.floor(i / 8);
                    const s = dt < 0 ? 0 : clamp01(dt / 0.15);
                    const fail = i === 0 && failing > 0;
                    const pop = c.spr(8, 0.02 * i);
                    const big = i === featured ? 1.18 : 1;
                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: col * 124,
                                top: row * 126,
                                transform: `scale(${pop * big * (fail ? 1 + 0.25 * failing : 1)})`,
                            }}
                        >
                            {(i === featured || fail) && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: -10,
                                        top: -14,
                                        width: 112,
                                        height: 124,
                                        borderRadius: 16,
                                        border: `5px solid ${fail ? CORAL : theme.accent}`,
                                    }}
                                />
                            )}
                            <Lock
                                size={90}
                                shut={fail ? 0 : s}
                                fail={fail}
                                flash={dt >= 0 ? clamp01(dt / 0.45) : 0}
                            />
                        </div>
                    );
                })}
            </div>
            {/* Counter under or beside the wall. */}
            <div
                style={{
                    position: "absolute",
                    left: mix(1080, 110, toSide),
                    top: mix(140, 600, toSide),
                    ...type.display,
                    fontSize: mix(140, 84, toSide),
                    opacity: clamp01(appear * 2),
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                }}
            >
                <span style={{ color: shut === LOCKS ? GOOD : theme.ink }}>{shut}</span>
                <span style={{ color: theme.inkSoft }}> / 37</span>
                <div style={{ ...type.label, fontSize: 34, color: theme.inkSoft, marginTop: 4 }}>
                    promises locked
                </div>
            </div>
            {/* The promise being read out, large on the right. */}
            {toSide < 1 && (
                <div
                    style={{
                        position: "absolute",
                        left: 1080,
                        top: 420,
                        width: 520,
                        opacity: 1 - toSide,
                    }}
                >
                    {featured >= 0 && (
                        <div
                            key={featured}
                            style={{
                                ...type.display,
                                fontSize: 58,
                                transform: `translateY(${(1 - c.spr(9 + featured, -0.1)) * 30}px)`,
                                opacity: clamp01(c.spr(9 + featured, -0.1) * 2),
                            }}
                        >
                            <span style={{ color: theme.accent }}>{featured + 1}.</span>{" "}
                            {PROMISES[featured]}
                        </div>
                    )}
                    {featured < 0 && rippleIdx >= 4 && rippleIdx < LOCKS + 6 && (
                        <div
                            style={{
                                ...type.label,
                                fontSize: 38,
                                color: theme.inkSoft,
                                lineHeight: 1.4,
                            }}
                        >
                            {OTHERS.slice(
                                0,
                                Math.min(OTHERS.length, Math.floor((rippleIdx - 4) / 5) + 1),
                            ).map((o) => (
                                <div key={o}>· {o}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {failing > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 140,
                        opacity: failing,
                        transform: `translateY(${(1 - failing) * 20}px)`,
                    }}
                >
                    <Tag text="only my own flows: open" color={CORAL} size={34} seed="fail-tag" />
                </div>
            )}
        </>
    );
}

/** Line 13: the verdict. Lines 14 and 15: the default flow slips back in and the deploy fails. */
function Verdict() {
    const c = useClock();
    const theme = useTheme();
    const type = useType();
    const show = c.prog({ line: 13, at: 0.1 }, 0.6);
    if (show <= 0) return null;
    const replay = c.after(14, 0.15);
    const down = c.prog({ line: 14, at: 0.1 }, 0.7);
    const typed = (cue: { line: number; at?: number }, dur: number, delay = 0) =>
        c.prog(cue, dur, delay);
    const lines = !replay
        ? [
              { text: "$ verify.py", p: typed({ line: 13, at: 0.1 }, 0.4) },
              {
                  text: "checked 37 promises against",
                  p: typed({ line: 13, at: 0.1 }, 0.7, 0.4),
                  color: "#bdbcb4",
              },
              {
                  text: "the live database",
                  p: typed({ line: 13, at: 0.1 }, 0.4, 1.1),
                  color: "#bdbcb4",
              },
              {
                  text: "INVARIANTS OK",
                  p: c.after({ line: 13, at: 0.6 }) ? 1 : 0,
                  color: "#9fd48c",
                  size: 76,
                  weight: 500,
              },
          ]
        : [
              { text: "$ verify.py", p: typed({ line: 14, at: 0.5 }, 0.4) },
              {
                  text: "PROBLEM: a flow exists that",
                  p: typed({ line: 15, at: 0.3 }, 0.5),
                  color: "#ff9b86",
              },
              {
                  text: "should not:",
                  p: typed({ line: 15, at: 0.3 }, 0.3, 0.4),
                  color: "#ff9b86",
              },
              {
                  text: "  default-source-authentication",
                  p: typed({ line: 15, at: 0.3 }, 0.5, 0.65),
                  color: "#ff9b86",
              },
              { text: "1 problem", p: typed({ line: 15, at: 0.3 }, 0.2, 1.15) },
              {
                  text: "deploy failed",
                  p: c.after({ line: 15, at: 0.3 }, 1.4) ? 1 : 0,
                  color: "#ff8a73",
                  size: 52,
                  weight: 500,
              },
          ];
    const doors = c.spr({ line: 14, at: 0.05 }, 0.3);
    const slip = c.spr({ line: 14, at: 0.3 }, 0.3);
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 85,
                    width: 1600,
                    whiteSpace: "nowrap",
                    ...type.display,
                    fontSize: 68,
                    opacity: show * (1 - c.prog(14, 0.3)),
                }}
            >
                A deploy that checks its own locks.
            </div>
            <Terminal
                w={920}
                h={mix(420, 410, down)}
                lines={lines}
                style={{ position: "absolute", left: 680, top: mix(210, 410, down), opacity: show }}
            />
            {replay && (
                <>
                    <Door
                        w={110}
                        label="Sign-in"
                        style={{
                            position: "absolute",
                            left: 800,
                            top: 100,
                            opacity: clamp01(doors * 2),
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: mix(1700, 1000, slip),
                            top: 120,
                            transform: `rotate(${-5 * slip}deg)`,
                        }}
                    >
                        <Door w={100} flimsy label="default flow" />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            left: 1170,
                            top: 170,
                            width: 400,
                            ...type.label,
                            fontSize: 36,
                            color: CORAL,
                            opacity: clamp01(slip * 2),
                        }}
                    >
                        slipped back in
                    </div>
                </>
            )}
        </>
    );
}

/** A quick paper flutter as the story rewinds (line 14). */
function Rewind() {
    const c = useClock();
    const theme = useTheme();
    const p = c.prog(14, 0.5, -0.15);
    if (p <= 0 || p >= 1) return null;
    return (
        <div style={{ position: "absolute", left: -120, top: -70, width: 1920, height: 1080 }}>
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: i * 270,
                        left: mix(1920, -2100, clamp01(p * 1.3 - i * 0.1)),
                        width: 1900,
                        height: 250,
                        background: i % 2 ? theme.paper : theme.paperAlt,
                        transform: `rotate(-4deg)`,
                        boxShadow: `6px 9px 0 ${theme.shadow}`,
                    }}
                />
            ))}
        </div>
    );
}

export default function DeployChecksItsLocks() {
    return (
        <Stage>
            <Shot from={0} to={1}>
                <div style={{ position: "absolute", left: 0, top: -30 }}>
                    <Tag text="Central Auth" at={0} seed="kicker" size={34} />
                </div>
                <OneDoor />
            </Shot>
            <Shot from={2} to={4}>
                <ByHand />
            </Shot>
            <Shot from={5} to={6}>
                <OneFile />
            </Shot>
            <Shot from={7} to={7}>
                <CheckInside />
            </Shot>
            <Deploy />
            <LockWall />
            <Verdict />
            <Rewind />
        </Stage>
    );
}
