import React from "react";
import { Shot, Stage, Tag, useTheme, useType } from "../kit";
import { clamp01, mix, useClock } from "./shared/motion";
import {
    CORAL,
    CREAM,
    Card,
    Check,
    EXPORT_A,
    EXPORT_B,
    GOOD,
    MISREAD_RUN,
    RIGHT_RUN,
    Row,
    STATEMENT,
    Scissors,
    Stamp,
} from "./shared/pieces";

export const theme = "qoria";
export const poster = { line: 7, at: "end" } as const;

const MISREAD = "−4.62";
const HL = "rgba(255, 79, 26, 0.22)";
const GLOW = "rgba(255, 79, 26, 0.13)";

/** The printed statement on the left, from line 0 until line 5 ends. */
function Statement() {
    const c = useClock();
    const type = useType();
    const theme = useTheme();
    const lit = c.prog({ line: 4, at: 0.1 }, 0.5);
    const scan = (i: number) => c.at({ line: 0, at: 0.15 }) + i * 0.32;
    const beamRow = Math.floor((c.t - scan(0)) / 0.32);
    const beamOn = beamRow >= 0 && beamRow < 8;
    const s = c.spr(0);
    const balRow = (label: string, value: string) => (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                height: 54,
                alignItems: "center",
                padding: "0 14px",
                margin: "0 -14px",
                borderRadius: 6,
                background: lit > 0 ? `rgba(255, 79, 26, ${0.85 * lit})` : undefined,
                color: lit > 0.5 ? "#fffaf2" : theme.ink,
                ...type.display,
                fontSize: 32,
            }}
        >
            <span>{label}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
        </div>
    );
    return (
        <div
            style={{
                position: "absolute",
                left: mix(-700, 20, s),
                top: 40,
            }}
        >
            <Card seed="statement" w={720} h={640} title="Bramblewood Bank · Everyday ···· 0417">
                {balRow("Opening balance", "2,140.00")}
                {STATEMENT.map((l, i) => (
                    <Row
                        key={i}
                        line={l}
                        h={54}
                        size={30}
                        hl={beamOn && beamRow === i ? HL : undefined}
                    />
                ))}
                {balRow("Closing balance", "1,871.35")}
            </Card>
        </div>
    );
}

/** Lines 0 to 5: the copy, the slip, the shelf, the stamp, the running total. */
function Copy() {
    const c = useClock();
    const type = useType();
    const theme = useTheme();
    const scan = (i: number) => c.at({ line: 0, at: 0.15 }) + i * 0.32;
    const close = c.prog({ line: 1, at: 0.75 }, 0.5);
    const reopen = c.prog({ line: 3, at: 0.15 }, 0.6);
    const open = 1 - close + reopen;
    const shelf = c.prog({ line: 1, at: 0.9 }, 0.4) * (1 - c.prog({ line: 3, at: 0.1 }, 0.4));
    const circle = c.prog({ line: 1, at: 0.3 }, 0.5) * (1 - close);
    const meter = c.spr(5);
    const tick = (i: number) => c.at({ line: 5, at: 0.25 }) + i * 0.33;
    const step = Math.max(-1, Math.min(7, Math.floor((c.t - tick(0)) / 0.33)));
    const q = c.prog({ line: 2, at: 0.3 }, 0.5);
    return (
        <>
            {/* The beam that copies each line across. */}
            <svg width={1600} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                {STATEMENT.map((_, i) => {
                    const p = clamp01((c.t - scan(i)) / 0.32);
                    if (p <= 0 || p >= 1) return null;
                    const y = 40 + 68 + 54 + i * 54 + 27;
                    return (
                        <path
                            key={i}
                            d={`M 740 ${y} L ${mix(740, 880, p)} ${y}`}
                            stroke={theme.accent}
                            strokeWidth={5}
                            strokeDasharray="10 8"
                        />
                    );
                })}
            </svg>
            {open > 0.01 && (
                <div
                    style={{
                        position: "absolute",
                        left: 880,
                        top: 40,
                        transform: `scaleX(${Math.min(1, open)})`,
                        transformOrigin: "0 50%",
                    }}
                >
                    <Card
                        seed="ledger"
                        w={720}
                        h={640}
                        title="Summa ledger"
                        head={CORAL}
                        color={CREAM}
                    >
                        <div style={{ height: 54 }} />
                        {STATEMENT.map((l, i) => {
                            const shown = c.t >= scan(i) + 0.3;
                            const ticked = step >= i && c.after(5);
                            return (
                                <Row
                                    key={i}
                                    line={l}
                                    h={54}
                                    size={30}
                                    amt={i === 4 ? MISREAD : undefined}
                                    opacity={shown ? 1 : 0}
                                    hl={ticked && step === i ? HL : undefined}
                                />
                            );
                        })}
                    </Card>
                    {circle > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 560,
                                top: 68 + 54 + 4 * 54 - 2,
                                width: 140,
                                height: 54,
                                border: `4px solid ${theme.inkSoft}`,
                                borderRadius: "50%",
                                opacity: 0.7 * circle,
                            }}
                        />
                    )}
                    <div style={{ position: "absolute", left: 120, top: 210 }}>
                        <Stamp text="unverified" p={c.prog({ line: 3, at: 0.6 }, 0.35)} size={64} />
                    </div>
                </div>
            )}
            {open > 0.01 && circle > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 1180,
                        top: 690,
                        ...type.label,
                        fontSize: 34,
                        color: theme.inkSoft,
                        opacity: circle,
                    }}
                >
                    read as 4.62, really 46.20
                </div>
            )}
            {shelf > 0 && (
                <div style={{ position: "absolute", left: 880, top: 200, opacity: shelf }}>
                    {[0, 1, 2, 3, 4].map((i) => {
                        const ours = i === 3;
                        const lift = ours ? c.prog({ line: 3, at: 0 }, 0.3) * -80 : 0;
                        return (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    left: i * 130,
                                    top: 40 + (i % 2) * 20 + lift,
                                    width: 110,
                                    height: 380 - (i % 2) * 20,
                                    background: ours
                                        ? CORAL
                                        : ["#cfcabc", "#b9c4b0", "#d8c49a", "", "#c3c6cc"][i],
                                    border: `3px solid ${theme.ink}`,
                                    borderRadius: 6,
                                    boxShadow: `5px 7px 0 ${theme.shadow}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        transform: "rotate(-90deg)",
                                        whiteSpace: "nowrap",
                                        ...type.display,
                                        fontSize: 32,
                                        color: ours ? "#fffaf2" : theme.ink,
                                    }}
                                >
                                    {["Dec", "Jan", "Feb", "Mar · 1,912.93", "Apr"][i]}
                                </div>
                            </div>
                        );
                    })}
                    <div
                        style={{
                            position: "absolute",
                            left: -20,
                            top: 420,
                            width: 690,
                            height: 26,
                            background: "#a88b62",
                            border: `3px solid ${theme.ink}`,
                            borderRadius: 4,
                        }}
                    />
                    {q > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 410,
                                top: -110,
                                ...type.display,
                                fontSize: 120,
                                color: theme.inkSoft,
                                opacity: q * (1 - c.prog({ line: 2, at: "end" }, 0.4)),
                            }}
                        >
                            ?
                        </div>
                    )}
                    {q > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 480,
                                width: 660,
                                ...type.label,
                                fontSize: 36,
                                color: theme.inkSoft,
                                opacity: q,
                            }}
                        >
                            the total looks normal
                        </div>
                    )}
                </div>
            )}
            {meter > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 880,
                        top: 668,
                        opacity: clamp01(meter * 2),
                        transform: `translateY(${(1 - meter) * 30}px)`,
                    }}
                >
                    <Card seed="meter" w={720} h={130} color={CREAM}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ ...type.label, fontSize: 34, color: theme.inkSoft }}>
                                {step < 0 ? "start at opening" : `after line ${step + 1}`}
                            </div>
                            <div
                                style={{
                                    ...type.display,
                                    fontSize: 84,
                                    fontVariantNumeric: "tabular-nums",
                                    color: step === 7 ? CORAL : theme.ink,
                                }}
                            >
                                {MISREAD_RUN[step + 1]}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}

/** Lines 6 and 7: the same statement read right and read with one slip. */
function Verdicts() {
    const c = useClock();
    const type = useType();
    const theme = useTheme();
    const col = (bad: boolean) => {
        const startCue = bad ? 7 : 6;
        const appear = c.spr(startCue);
        const tick = (i: number) => c.at({ line: startCue, at: 0.05 }) + i * 0.18;
        const step = Math.max(-1, Math.min(7, Math.floor((c.t - tick(0)) / 0.18)));
        const run = bad ? MISREAD_RUN : RIGHT_RUN;
        const landed = step === 7;
        const verdict = c.prog({ line: startCue, at: bad ? 0.55 : 0.6 }, 0.35);
        const bounce = bad ? c.prog({ line: 7, at: 0.65 }, 0.5) : 0;
        const x = bad ? 830 : 0;
        return (
            <div
                key={String(bad)}
                style={{
                    position: "absolute",
                    left: x,
                    top: 100,
                    opacity: clamp01(appear * 2),
                    transform: `translateY(${(1 - appear) * 40}px)`,
                }}
            >
                <div
                    style={{
                        transform: `translate(${bounce * 30}px, ${-Math.sin(bounce * Math.PI) * 60 - bounce * 10}px) rotate(${bounce * 3}deg)`,
                        opacity: 1 - bounce * 0.35,
                    }}
                >
                    <Card
                        seed={`copy-${bad}`}
                        w={770}
                        h={470}
                        title={bad ? "Copy with one line misread" : "Copy read right"}
                        head={bad ? CORAL : GOOD}
                        color={CREAM}
                    >
                        {STATEMENT.map((l, i) => (
                            <Row
                                key={i}
                                line={l}
                                h={46}
                                amt={bad && i === 4 ? MISREAD : undefined}
                                amtColor={bad && i === 4 ? CORAL : undefined}
                                hl={step === i ? HL : undefined}
                            />
                        ))}
                    </Card>
                </div>
                <div style={{ position: "absolute", left: 0, top: 490 }}>
                    <Card seed={`sum-${bad}`} w={770} h={190} color={theme.paper}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                ...type.body,
                                fontSize: 34,
                            }}
                        >
                            <span>opening + every line</span>
                            <span
                                style={{
                                    ...type.display,
                                    fontSize: 64,
                                    fontVariantNumeric: "tabular-nums",
                                    color: landed ? (bad ? CORAL : GOOD) : theme.ink,
                                }}
                            >
                                {run[step + 1]}
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                ...type.body,
                                fontSize: 34,
                                marginTop: 8,
                            }}
                        >
                            <span>printed closing</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                {verdict > 0.5 && !bad && <Check size={48} />}
                                <span
                                    style={{
                                        ...type.display,
                                        fontSize: 52,
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    1,871.35
                                </span>
                            </span>
                        </div>
                    </Card>
                </div>
                <div style={{ position: "absolute", left: bad ? 90 : 300, top: 200 }}>
                    <Stamp
                        text={bad ? "rejected · off by 41.58" : "trusted"}
                        color={bad ? CORAL : GOOD}
                        p={verdict}
                        size={bad ? 58 : 72}
                        rot={bad ? -7 : -5}
                    />
                </div>
            </div>
        );
    };
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    ...type.display,
                    fontSize: 64,
                    whiteSpace: "nowrap",
                    opacity: c.prog(6, 0.6),
                }}
            >
                A statement that doesn&apos;t add up is rejected.
            </div>
            {col(false)}
            {c.after(7, -0.3) && col(true)}
        </>
    );
}

/** Lines 8 to 11: two overlapping exports, the wrong cut, the right cut. */
function Overlap() {
    const c = useClock();
    const type = useType();
    const theme = useTheme();
    const a = c.spr(8, 0.2);
    const b = c.spr(8, 0.5);
    const glow = c.prog({ line: 9, at: 0.5 }, 0.5);
    const ghosts = c.prog({ line: 10, at: 0.35 }, 0.4) * (1 - c.prog(11, 0.3));
    const match = c.prog({ line: 11, at: 0.35 }, 0.5);
    const cut = c.prog({ line: 11, at: 0.75 }, 0.4);
    const flick = Math.floor(c.t * 2.5) % 2;
    const tryCut = c.after(10) && !c.after(11);
    const rowY = (i: number) => 120 + 58 + 10 + 52 + i * 52;
    const scissorY = tryCut
        ? flick
            ? rowY(2) - 4
            : rowY(5) - 4
        : mix(rowY(2) - 4, rowY(3) - 4, match);
    return (
        <>
            <div style={{ position: "absolute", left: 0, top: -30 }}>
                <Tag text="a second trap" at={8} seed="trap" size={36} />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: mix(-800, 0, a),
                    top: 80,
                    transform: "rotate(-1.5deg)",
                    zIndex: 1,
                }}
            >
                <Card seed="exportA" w={790} h={300} title="Export A">
                    {EXPORT_A.map((l, i) => (
                        <Row
                            key={i}
                            line={l}
                            showBal
                            h={52}
                            size={30}
                            hl={glow > 0 ? `rgba(255,79,26,${0.13 * glow})` : undefined}
                        />
                    ))}
                    <div
                        style={{
                            marginTop: 12,
                            ...type.label,
                            fontSize: 32,
                            color: glow > 0.5 ? theme.accent : theme.inkSoft,
                        }}
                    >
                        ends 14 Mar, 12:10 · balance{" "}
                        <span
                            style={{
                                fontStyle: "normal",
                                fontWeight: 600,
                                background:
                                    match > 0 ? `rgba(255,79,26,${0.3 * match})` : undefined,
                                padding: "0 6px",
                            }}
                        >
                            1,503.80
                        </span>
                    </div>
                </Card>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: mix(1700, 780, b),
                    top: 120,
                    transform: "rotate(1.2deg)",
                    zIndex: 2,
                }}
            >
                <Card seed="exportB" w={820} h={470} title="Export B">
                    <div
                        style={{
                            height: 52,
                            display: "flex",
                            alignItems: "center",
                            ...type.body,
                            fontSize: 28,
                            color: theme.inkSoft,
                        }}
                    >
                        opening 1,611.30
                    </div>
                    {EXPORT_B.map((l, i) => {
                        const inA = i < 3;
                        const dropped = inA && cut > 0;
                        let hl: string | undefined;
                        if (inA && glow > 0) hl = `rgba(255,79,26,${0.13 * glow})`;
                        if (i === 2 && match > 0) hl = `rgba(255,79,26,${0.13 + 0.3 * match})`;
                        return (
                            <Row
                                key={i}
                                line={l}
                                showBal
                                h={52}
                                size={30}
                                hl={hl}
                                opacity={dropped ? 1 - 0.65 * cut : 1}
                            />
                        );
                    })}
                </Card>
                {(tryCut || match > 0) && (
                    <>
                        <div
                            style={{
                                position: "absolute",
                                left: -10,
                                top: scissorY - 120 + 2,
                                width: 840,
                                borderTop: `4px dashed ${tryCut ? CORAL : theme.accent}`,
                                opacity: tryCut ? 0.8 : cut,
                            }}
                        />
                        <Scissors
                            size={110}
                            style={{
                                position: "absolute",
                                left: tryCut ? -90 : mix(-90, 760, cut),
                                top: scissorY - 120 - 38,
                            }}
                        />
                    </>
                )}
            </div>
            {match > 0 && (
                <svg
                    width={1600}
                    height={800}
                    style={{ position: "absolute", left: 0, top: 0, zIndex: 3 }}
                >
                    <path
                        d={`M 660 335 C 730 335 700 ${rowY(2) + 30} 780 ${rowY(2) + 26}`}
                        stroke={theme.accent}
                        strokeWidth={5}
                        fill="none"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - match}
                    />
                </svg>
            )}
            {match > 0 && (
                <div
                    style={{
                        position: "absolute",
                        left: 780,
                        top: 620,
                        width: 820,
                        ...type.display,
                        fontSize: 42,
                        opacity: match,
                    }}
                >
                    Same balance, <span style={{ color: theme.accent }}>1,503.80</span>: cut right
                    after this line.
                </div>
            )}
            {ghosts > 0 && (
                <>
                    {[0, 1].map((g) => (
                        <div
                            key={g}
                            style={{
                                position: "absolute",
                                left: g === 0 ? 0 : 0,
                                top: g === 0 ? 400 : 615,
                                opacity: ghosts * (flick === g ? 1 : 0.45),
                                zIndex: 4,
                            }}
                        >
                            <Card
                                seed={`ghost${g}`}
                                w={740}
                                h={g === 0 ? 190 : 200}
                                color="#f6eeee"
                            >
                                <div
                                    style={{
                                        ...type.label,
                                        fontSize: 32,
                                        color: CORAL,
                                        marginBottom: 4,
                                    }}
                                >
                                    {g === 0
                                        ? "cut by date, keep 14 Mar: counted twice"
                                        : "cut by date, skip 14 Mar: lost"}
                                </div>
                                {g === 0 ? (
                                    <>
                                        <Row line={EXPORT_A[2]} />
                                        <Row
                                            line={EXPORT_A[2]}
                                            style={{
                                                color: CORAL,
                                                textDecoration: "underline wavy",
                                            }}
                                        />
                                    </>
                                ) : (
                                    [EXPORT_B[3], EXPORT_B[4]].map((l, i) => (
                                        <Row
                                            key={i}
                                            line={l}
                                            style={{
                                                border: `3px dashed ${CORAL}`,
                                                color: "transparent",
                                                marginTop: 6,
                                                height: 40,
                                            }}
                                        />
                                    ))
                                )}
                            </Card>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}

/** Line 12: the kept part of Export B joins Export A; the afternoon is in, once. */
function Joined() {
    const c = useClock();
    const type = useType();
    const theme = useTheme();
    const rows = [...EXPORT_A, ...EXPORT_B.slice(3)];
    return (
        <div style={{ position: "absolute", left: 260, top: 40 }}>
            <Card seed="joined" w={1080} h={540} title="Summa ledger" head={CORAL} color={CREAM}>
                {rows.map((l, i) => {
                    const fromB = i >= 3;
                    const drop = c.spr(12, fromB ? 0.25 + (i - 3) * 0.12 : 0);
                    const once = i === 3 || i === 4;
                    return (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                transform: `translateY(${(1 - drop) * 50}px)`,
                                opacity: clamp01(drop * 2),
                            }}
                        >
                            <div
                                style={{
                                    ...type.label,
                                    fontSize: 28,
                                    width: 36,
                                    color: fromB ? theme.accent : theme.inkSoft,
                                }}
                            >
                                {fromB ? "B" : "A"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <Row
                                    line={l}
                                    showBal
                                    h={66}
                                    size={34}
                                    hl={once ? "rgba(79,125,69,0.16)" : undefined}
                                />
                            </div>
                            <div style={{ width: 150, ...type.label, fontSize: 30, color: GOOD }}>
                                {once && c.after({ line: 12, at: 0.5 }) ? "✓ once" : ""}
                            </div>
                        </div>
                    );
                })}
            </Card>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 580,
                    width: 1080,
                    textAlign: "center",
                    ...type.display,
                    fontSize: 56,
                    opacity: c.prog({ line: 12, at: 0.4 }, 0.5),
                }}
            >
                Nothing twice. Nothing lost.
            </div>
        </div>
    );
}

/** Line 13: every statement behind the ledger added up. */
function Shelf() {
    const c = useClock();
    const type = useType();
    const theme = useTheme();
    return (
        <>
            {[0, 1, 2, 3, 4].map((i) => {
                const s = c.spr(13, 0.1 + i * 0.15);
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: 60 + i * 310,
                            top: 120 + (i % 2) * 24,
                            transform: `rotate(${(i - 2) * 2}deg) translateY(${(1 - s) * 60}px)`,
                            opacity: clamp01(s * 2),
                        }}
                    >
                        <Card
                            seed={`st${i}`}
                            w={260}
                            h={330}
                            title={["Dec", "Jan", "Feb", "Mar", "Apr"][i]}
                        >
                            {[0.9, 0.7, 0.8, 0.6, 0.85].map((w, j) => (
                                <div
                                    key={j}
                                    style={{
                                        height: 12,
                                        width: `${w * 100}%`,
                                        background: theme.paperAlt,
                                        borderRadius: 6,
                                        marginTop: 20,
                                    }}
                                />
                            ))}
                        </Card>
                        <div style={{ position: "absolute", right: -18, bottom: -18 }}>
                            <Check size={70} />
                        </div>
                    </div>
                );
            })}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 560,
                    width: 1600,
                    textAlign: "center",
                    ...type.display,
                    fontSize: 64,
                    opacity: c.prog({ line: 13, at: 0.5 }, 0.6),
                }}
            >
                A statement that doesn&apos;t add up is rejected.
            </div>
        </>
    );
}

export default function StatementMustAddUp() {
    const c = useClock();
    return (
        <Stage>
            {c.t < c.at({ line: 5, at: "next" }) + 0.4 && (
                <div style={{ opacity: 1 - c.prog({ line: 5, at: "next" }, 0.4) }}>
                    <div style={{ position: "absolute", left: 0, top: -40 }}>
                        <Tag text="Summa" at={0} seed="kicker" size={32} color={CORAL} />
                    </div>
                    <Statement />
                    <Copy />
                </div>
            )}
            <Shot from={6} to={7}>
                <Verdicts />
            </Shot>
            <Shot from={8} to={11}>
                <Overlap />
            </Shot>
            <Shot from={12} to={12}>
                <Joined />
            </Shot>
            <Shot from={13}>
                <Shelf />
            </Shot>
        </Stage>
    );
}
