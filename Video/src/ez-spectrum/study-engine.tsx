// ez-spectrum / study-engine: "The same studies, 33 times faster."
// One study up close, the project of thousands, the replaced web tool's 96 minutes, then the parts of the rebuild
// (queue in the database, leases, one pool, the cut-up border, data next to the engine) and the result.
// All maps, sites and channels are invented. Cues are narration lines 0 to 14.
import React from "react";
import { Shot, Stage, type Cue } from "../kit";
import { jitter, seeded } from "../kit/random";
import {
    Big,
    clamp01,
    Cross,
    Cylinder,
    fmt,
    GREEN,
    GREY,
    Label,
    Layer,
    makeLand,
    Mast,
    mix,
    RED,
    roughCircle,
    scatter,
    ServerBox,
    Stamp,
    Stopwatch,
    StudyCard,
    SvgTag,
    Tick,
    useClock,
    Worker,
    cutRect,
    type CardState,
    Enlarge,
} from "./shared-a/pieces";

export const theme = "ez-spectrum";
export const poster: Cue = { line: 13, at: "end" };

// ---------------------------------------------------------------- shot 1: one study (lines 0 to 2)

const SITE: [number, number] = [800, 500];
const REACH = 225;
const LICENSEES: { x: number; y: number; r: number; near?: boolean }[] = [
    { x: 420, y: 290, r: 120 },
    { x: 1190, y: 290, r: 125 },
    { x: 1330, y: 560, r: 115 },
    { x: 290, y: 600, r: 120 },
    { x: 1010, y: 610, r: 120, near: true },
];

function OneStudy() {
    const c = useClock();
    const theme = c.theme;
    const sweepR = c.span({ line: 2, at: 0 }, { line: 2, at: 0.22 }) * 640;
    const greyRing = c.span({ line: 2, at: 0.18 }, { line: 2, at: 0.38 });
    const orangeRing = c.span({ line: 2, at: 0.38 }, { line: 2, at: 0.52 });
    const overlap = c.prog({ line: 2, at: 0.55 }, 0.5);
    const blocked = c.pop({ line: 2, at: 0.6 });
    const flip = c.span({ line: 2, at: 0.74 }, { line: 2, at: 0.8 });
    const ch13 = flip >= 0.5;
    const nearFade = c.prog({ line: 2, at: 0.78 }, 0.5);
    const available = c.pop({ line: 2, at: 0.88 });
    const question = c.prog({ line: 1, at: 0.45 }, 0.7);
    const questionOut = c.prog({ line: 2, at: 0.55 }, 0.3);
    const [sx, sy] = SITE;
    const mastH = 190;
    const tagFlipScale = Math.abs(Math.cos(flip * Math.PI));
    return (
        <Layer>
            <SvgTag x={0} y={30} text="One frequency study" p={c.pop(0)} size={32} />
            {/* search sweep */}
            {sweepR > 0 && sweepR < 640 && (
                <circle
                    cx={sx}
                    cy={sy}
                    r={sweepR}
                    fill="none"
                    stroke={theme.onBgSoft}
                    strokeWidth={4}
                    strokeDasharray="14 14"
                    opacity={1 - sweepR / 700}
                />
            )}
            {/* protected areas of the licensees */}
            {greyRing > 0 &&
                LICENSEES.map((l, i) => {
                    const fade = l.near ? 1 - nearFade * 0.8 : 1;
                    return (
                        <path
                            key={`ring${i}`}
                            d={roughCircle(l.x, l.y, l.r, `lic${i}`)}
                            fill="rgba(201,211,214,0.13)"
                            stroke={GREY}
                            strokeWidth={5}
                            pathLength={1}
                            strokeDasharray="1 3"
                            strokeDashoffset={1 - greyRing}
                            fillOpacity={greyRing}
                            opacity={fade}
                        />
                    );
                })}
            {/* the new site's reach */}
            {orangeRing > 0 && (
                <path
                    d={roughCircle(sx, sy, REACH, "reach")}
                    fill="rgba(255,79,26,0.12)"
                    fillOpacity={orangeRing}
                    stroke={theme.accent}
                    strokeWidth={6}
                    pathLength={1}
                    strokeDasharray="1 3"
                    strokeDashoffset={1 - orangeRing}
                />
            )}
            {/* the overlap */}
            <defs>
                <clipPath id="near-clip">
                    <circle cx={LICENSEES[4].x} cy={LICENSEES[4].y} r={LICENSEES[4].r} />
                </clipPath>
            </defs>
            <circle
                cx={sx}
                cy={sy}
                r={REACH}
                fill="url(#hatch)"
                clipPath="url(#near-clip)"
                opacity={overlap * (1 - nearFade)}
            />
            {/* licensee masts */}
            {LICENSEES.map((l, i) => {
                const rise = c.pop({ line: 1, at: 0.05 + i * 0.07 });
                const reached =
                    sweepR >= Math.hypot(l.x - sx, l.y - sy) - 10 || c.after({ line: 2, at: 0.22 });
                const fade = l.near ? 1 - nearFade * 0.7 : 1;
                return (
                    <g key={`m${i}`} opacity={fade}>
                        <Mast x={l.x} y={l.y + 40} h={96} color={GREY} rise={rise} arcs={1} />
                        {reached && (
                            <Tick
                                x={l.x + 52}
                                y={l.y - 40}
                                s={40}
                                p={c.prog(
                                    {
                                        line: 2,
                                        at: 0.02 + (Math.hypot(l.x - sx, l.y - sy) / 640) * 0.2,
                                    },
                                    0.3,
                                )}
                                color={GREEN}
                            />
                        )}
                    </g>
                );
            })}
            {/* the new site */}
            <Mast
                x={sx}
                y={sy + 70}
                h={mastH}
                color={theme.accent}
                rise={c.pop({ line: 0, at: 0.05 })}
            />
            <g
                transform={`translate(${sx + 66} ${sy - 30}) scale(${tagFlipScale} 1)`}
                opacity={clamp01(c.pop({ line: 0, at: 0.5 }) * 2)}
            >
                <line x1={-66} y1={-50} x2={0} y2={0} stroke={theme.onBg} strokeWidth={3} />
                <StudyCard x={52} y={10} w={120} text={ch13 ? "CH 13" : "CH 12"} seed="site-tag" />
            </g>
            {/* the question, then the answer */}
            {question > 0 && questionOut < 1 && (
                <text
                    x={sx}
                    y={sy - mastH - 70 + (1 - question) * 30}
                    textAnchor="middle"
                    fill={theme.onBg}
                    opacity={question * (1 - questionOut)}
                    style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 150 }}
                >
                    ?
                </text>
            )}
            {!ch13 && <Stamp x={sx} y={92} text="Blocked · CH 12" color={RED} p={blocked} />}
            {ch13 && <Stamp x={sx} y={92} text="Available · CH 13" color={GREEN} p={available} />}
        </Layer>
    );
}

// ---------------------------------------------------------------- the network (lines 3, 4, 12, 13)

const LAND = makeLand(0, 0, 400, 290, "network-land", 1);
// The number of masts drawn is not the real network's size (that is a client's and stays off screen).
const MASTS = scatter(
    58,
    { x: -480, y: -350, w: 960, h: 700 },
    (x, y) => LAND.inside(x, y, 0.86),
    "masts",
    52,
);
const CARDS_PER_MAST = 3;
const RESULT: CardState[] = MASTS.flatMap((_, i) =>
    Array.from({ length: CARDS_PER_MAST }, (_, j) =>
        seeded(`res${i}-${j}`)() < 0.68 ? "ok" : "no",
    ),
);
const ORDER = RESULT.map((_, k) => k).sort((a, b) => seeded(`ord${a}`)() - seeded(`ord${b}`)());
const RANK = new Map(ORDER.map((k, i) => [k, i]));

function NetworkMap(props: {
    state: (k: number, x: number, y: number) => CardState;
    sprout: (i: number) => number;
    rise?: (i: number) => number;
    stamps?: (x: number, y: number) => number;
}) {
    const theme = useClock().theme;
    return (
        <g>
            <path
                d={LAND.d}
                fill="rgba(236,234,227,0.07)"
                stroke={theme.paperAlt}
                strokeWidth={4}
            />
            {MASTS.map(([x, y], i) => (
                <Mast
                    key={i}
                    x={x}
                    y={y + 14}
                    h={34}
                    color={theme.accent}
                    rise={props.rise ? props.rise(i) : 1}
                    arcs={0}
                />
            ))}
            {MASTS.map(([x, y], i) => {
                const s = props.sprout(i);
                if (s <= 0) return null;
                return (
                    <g key={`c${i}`}>
                        {Array.from({ length: CARDS_PER_MAST }, (_, j) => (
                            <StudyCard
                                key={j}
                                x={x + 22}
                                y={y + 8 - j * 13}
                                w={18}
                                state={props.state(i * CARDS_PER_MAST + j, x, y)}
                                scale={clamp01(s * 1.2 - j * 0.1)}
                                shadow={false}
                            />
                        ))}
                    </g>
                );
            })}
            {props.stamps &&
                MASTS.map(([x, y], i) => {
                    const p = props.stamps!(x, y);
                    if (p <= 0) return null;
                    return (
                        <g
                            key={`s${i}`}
                            transform={`translate(${x - 2} ${y - 28}) scale(${0.4 + 0.6 * clamp01(p)})`}
                        >
                            <circle r={13} fill={GREEN} stroke={theme.ink} strokeWidth={2} />
                            <Tick x={0} y={0} s={14} p={1} color="#fffaf2" width={3} />
                        </g>
                    );
                })}
        </g>
    );
}

function Network() {
    const c = useClock();
    const theme = c.theme;
    const zoom = c.prog(3, 1.1);
    const [m0x, m0y] = MASTS[0];
    const cx = 1150;
    const cy = 420;
    const s = mix(3.4, 1, zoom);
    const px = mix(SITE[0], cx + m0x, zoom);
    const py = mix(SITE[1], cy + m0y, zoom);
    const tx = px - s * m0x;
    const ty = py - s * m0y;
    const textOut = c.prog(4, 0.4);
    const trickleStart = c.at({ line: 4, at: 0.25 });
    const trickled = Math.max(0, (c.frame - trickleStart) / (c.fps * 0.17));
    const nSite = c.pop({ line: 3, at: 0.15 });
    const nChannel = c.pop({ line: 3, at: 0.4 });
    const total = c.prog({ line: 3, at: 0.62 }, 1.1);
    return (
        <Layer>
            <g transform={`translate(${tx} ${ty}) scale(${s})`}>
                <NetworkMap
                    sprout={(i) => c.prog({ line: 3, at: 0.25 + (i / MASTS.length) * 0.35 }, 0.4)}
                    state={(k) => (RANK.get(k)! < trickled ? RESULT[k] : "idle")}
                />
            </g>
            <Label
                x={cx}
                y={36}
                text="One project: 7,630 studies"
                anchor="middle"
                opacity={c.prog(4, 0.5)}
            />
            <g opacity={1 - textOut}>
                <Big x={0} y={230} text="every site" size={84} opacity={clamp01(nSite * 2)} />
                <Big
                    x={0}
                    y={350}
                    text="× every channel"
                    size={84}
                    opacity={clamp01(nChannel * 2)}
                />
                <path
                    d={cutRect(0, 395, 560 * clamp01(total * 3), 10, "rule", 1)}
                    fill={theme.onBgSoft}
                    opacity={total > 0 ? 1 : 0}
                />
                {total > 0 && (
                    <>
                        <Big
                            x={0}
                            y={510}
                            text={fmt(Math.round(7630 * total))}
                            size={110}
                            color={theme.accent}
                        />
                        <Big x={0} y={590} text="studies" size={64} />
                    </>
                )}
            </g>
        </Layer>
    );
}

// ------------------------------------------------- the replaced web tool's stopwatch (lines 4 to 13)

function OldWatch() {
    const c = useClock();
    if (!c.after(4) || c.after({ line: 14, at: 0, delay: 0.5 })) return null;
    const appear = c.pop({ line: 4, at: 0.05 });
    const toCorner = c.prog(5, 0.9);
    const toResult = c.prog(12, 0.8);
    const out = c.prog(14, 0.4);
    const run = c.lin({ line: 4, at: 0.3 }, { line: 4, at: 0.93 });
    const stopped = c.after({ line: 4, at: 0.93 });
    const thud = stopped ? 1 + 0.08 * Math.exp(-(c.frame - c.at({ line: 4, at: 0.93 })) / 4) : 1;
    const minutes = Math.round(96 * run);
    const angle = stopped ? 216 : (c.t - c.at(4) / c.fps) * 900;
    let x = 300;
    let y = 400;
    let r = 170;
    x = mix(x, 1490, toCorner);
    y = mix(y, 108, toCorner);
    r = mix(r, 48, toCorner);
    x = mix(x, 130, toResult);
    y = mix(y, 280, toResult);
    r = mix(r, 100, toResult);
    return (
        <Layer>
            <g
                transform={`translate(${x} ${y}) scale(${(0.5 + 0.5 * appear) * thud}) translate(${-x} ${-y})`}
                opacity={clamp01(appear * 2) * (1 - out)}
            >
                <Stopwatch
                    x={x}
                    y={y}
                    r={r}
                    angle={angle}
                    readout={`${minutes} min`}
                    label={["Web tool", "it replaced"]}
                    color={c.theme.inkSoft}
                    dim
                />
            </g>
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the parity gate (line 5)

function Gate() {
    const c = useClock();
    const theme = c.theme;
    const gateIn = c.pop({ line: 5, at: 0.15 });
    const travel = c.span({ line: 5, at: 0.4 }, { line: 5, at: 0.66 });
    const equal = c.pop({ line: 5, at: 0.68 });
    const lift = c.span({ line: 5, at: 0.76 }, { line: 5, at: 0.86 });
    const through = c.span({ line: 5, at: 0.86 }, { line: 5, at: 1, delay: 0.4 });
    const gx = 1060;
    const gy = 280;
    const drop = (1 - gateIn) * -420;
    const cardX = mix(470, 760, travel) + through * 600;
    return (
        <Layer>
            <SvgTag x={0} y={30} text="The rebuild" p={c.pop(5)} size={32} />
            <g opacity={clamp01(c.pop({ line: 5, at: 0.05 }) * 2)}>
                <path
                    d={cutRect(150, 330, 300, 240, "engine-slab", 2)}
                    fill={theme.paperAlt}
                    filter="url(#ps)"
                />
                <Worker x={230} y={420} size={90} spin={c.t * 120} seed="e1" />
                <Worker x={370} y={420} size={90} spin={-c.t * 120} seed="e2" />
                <text
                    x={300}
                    y={540}
                    textAnchor="middle"
                    fill={theme.ink}
                    style={{
                        fontFamily: "IBM Plex Mono",
                        fontWeight: 500,
                        fontSize: 30,
                        letterSpacing: "0.08em",
                    }}
                >
                    NEW ENGINE
                </text>
            </g>
            {/* the answers, old and new */}
            {c.after({ line: 5, at: 0.38 }) && (
                <g>
                    <StudyCard x={cardX} y={400} w={150} state="ok" text="OLD" seed="ans-old" />
                    <StudyCard x={cardX} y={500} w={150} state="ok" text="NEW" seed="ans-new" />
                    {equal > 0 && (
                        <text
                            x={cardX + 110}
                            y={472}
                            fill={theme.onBg}
                            opacity={clamp01(equal * 2) * (1 - through)}
                            style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 80 }}
                        >
                            =
                        </text>
                    )}
                </g>
            )}
            {/* the gate */}
            <g transform={`translate(0 ${drop})`} opacity={clamp01(gateIn * 3)}>
                <Label
                    x={gx}
                    y={gy + 440}
                    text="Must match the old tool"
                    anchor="middle"
                    size={32}
                />
                <path
                    d={cutRect(gx - 120, gy, 34, 380, "post-l", 1.5)}
                    fill={theme.paper}
                    filter="url(#ps)"
                />
                <path
                    d={cutRect(gx + 86, gy, 34, 380, "post-r", 1.5)}
                    fill={theme.paper}
                    filter="url(#ps)"
                />
                <g transform={`rotate(${-lift * 80} ${gx - 103} ${gy + 40})`}>
                    <path
                        d={cutRect(gx - 120, gy + 22, 240, 34, "bar", 1.5)}
                        fill={theme.accent}
                        filter="url(#ps)"
                    />
                </g>
            </g>
            {lift > 0 && (
                <g>
                    <circle
                        cx={gx + 230}
                        cy={gy + 10}
                        r={50 * c.pop({ line: 5, at: 0.78 })}
                        fill={GREEN}
                        filter="url(#ps)"
                    />
                    <Tick
                        x={gx + 230}
                        y={gy + 10}
                        s={56}
                        p={c.prog({ line: 5, at: 0.8 }, 0.4)}
                        color="#fffaf2"
                        width={9}
                    />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: queue and leases (lines 6, 7)

const QX = 560;
const QTOP = 150;
const ROW = 54;
const GEARS: [number, number][] = [
    [1010, 340],
    [1150, 340],
    [1290, 340],
    [1010, 580],
    [1150, 580],
    [1290, 580],
];

function Queue() {
    const c = useClock();
    const theme = c.theme;
    const open = c.pop({ line: 6, at: 0.05 });
    const pileOut = c.prog({ line: 6, at: 0.75 }, 0.4);
    // Pulls: every 0.45 s from the start of line 7 into machine 1, then every 0.28 s into both machines.
    const t7 = c.at({ line: 7, at: 0.12 }) / c.fps;
    const t7b = c.at({ line: 7, at: 0.58 }) / c.fps;
    const pulls: { k: number; time: number; gear: number }[] = [];
    {
        let time = t7;
        let k = 0;
        while (time < c.t + 0.5 && time < 46) {
            const both = time >= t7b + 0.3;
            const gear = both ? k % 6 : k % 3;
            pulls.push({ k, time, gear });
            time += both ? 0.28 : 0.45;
            k++;
        }
    }
    const done = pulls.filter((p) => p.time <= c.t);
    const pulled = done.length;
    const lastPull = done.length ? done[done.length - 1].time : 0;
    const shift = pulled - 1 + clamp01((c.t - lastPull) / 0.25);
    const queueShift = pulled === 0 ? 0 : shift;
    const m1 = c.pop({ line: 7, at: 0.0 });
    const m2 = c.pop({ line: 7, at: 0.5 });
    const leaseTag = c.pop({ line: 7, at: 0.3 });
    return (
        <Layer>
            <SvgTag x={0} y={30} text="A queue in the database" p={c.pop(6)} size={32} />
            {/* the pile of studies, poured into the database */}
            <g opacity={1 - pileOut}>
                {Array.from({ length: 6 }, (_, i) => (
                    <StudyCard
                        key={i}
                        x={170 + jitter("pile", i) * 6}
                        y={470 - i * 22}
                        w={130}
                        seed={`pile${i}`}
                        rot={jitter("pile-r", i) * 4}
                    />
                ))}
                <Label x={170} y={560} text="7,630 studies" anchor="middle" size={30} />
            </g>
            <Cylinder
                x={QX}
                y={QTOP}
                w={300}
                h={470 * Math.min(1, open)}
                id="q-db"
                label="Database"
                fill="#c9d3d6"
            >
                {Array.from({ length: 22 }, (_, i) => {
                    const land = c.prog({ line: 6, at: 0.12 + (8 - Math.min(i, 8)) * 0.06 }, 0.35);
                    const yRow = QTOP + 70 + (i - queueShift) * ROW;
                    if (yRow < QTOP + 20) return null;
                    const y = i < 9 ? mix(QTOP - 40, yRow, land) : yRow;
                    if (i < 9 && land <= 0) return null;
                    return <StudyCard key={i} x={QX} y={y} w={140} seed={`q${i}`} shadow={false} />;
                })}
            </Cylinder>
            {/* cards flying in from the pile */}
            {Array.from({ length: 6 }, (_, i) => {
                const p = c.prog({ line: 6, at: 0.08 + i * 0.07 }, 0.4);
                if (p <= 0 || p >= 1) return null;
                const x = mix(170, QX, p);
                const y = mix(470 - i * 22, QTOP - 30, p) - Math.sin(p * Math.PI) * 120;
                return (
                    <StudyCard key={`fly${i}`} x={x} y={y} w={110} seed={`fly${i}`} rot={p * 40} />
                );
            })}
            <SvgTag
                x={QX + 180}
                y={QTOP + 100}
                text="Queue"
                p={c.pop({ line: 6, at: 0.55 })}
                size={30}
                color={theme.second}
            />
            {/* the machines */}
            {[m1, m2].map((m, mi) => (
                <g key={mi} transform={`translate(${(1 - m) * 700} 0)`} opacity={m > 0 ? 1 : 0}>
                    <path
                        d={cutRect(920, 250 + mi * 240, 460, 200, `tray${mi}`, 2)}
                        fill={theme.paperAlt}
                        filter="url(#ps)"
                    />
                    <text
                        x={940}
                        y={430 + mi * 240}
                        fill={theme.ink}
                        style={{
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 28,
                            letterSpacing: "0.08em",
                        }}
                    >
                        {`MACHINE ${mi + 1}`}
                    </text>
                    {GEARS.slice(mi * 3, mi * 3 + 3).map(([gx, gy], gi) => (
                        <Worker
                            key={gi}
                            x={gx}
                            y={gy + 10}
                            size={74}
                            spin={c.t * 150 + gi * 20}
                            seed={`w${mi}${gi}`}
                        />
                    ))}
                </g>
            ))}
            {/* claimed cards, each with a lease */}
            {pulls.map((p) => {
                const age = c.t - p.time;
                if (age < 0) return null;
                const next = pulls.find((q) => q.gear === p.gear && q.time > p.time);
                if (next && c.t > next.time + 0.25) return null;
                const [gx, gy] = GEARS[p.gear];
                const fly = clamp01(age / 0.35);
                const e = 1 - Math.pow(1 - fly, 3);
                const x = mix(QX, gx, e);
                const y = mix(QTOP + 70, gy - 62, e) - Math.sin(e * Math.PI) * 90;
                const lock = clamp01((age - 0.3) / 0.15);
                return (
                    <g key={`p${p.k}`}>
                        <StudyCard x={x} y={y} w={96} seed={`pc${p.k}`} />
                        {lock > 0 && (
                            <g transform={`translate(${x + 52} ${y - 18}) scale(${lock})`}>
                                <path
                                    d="M -9 0 V -8 A 9 9 0 0 1 9 -8 V 0"
                                    stroke={theme.ink}
                                    strokeWidth={4}
                                    fill="none"
                                />
                                <rect
                                    x={-13}
                                    y={-2}
                                    width={26}
                                    height={22}
                                    rx={4}
                                    fill={theme.third}
                                    stroke={theme.ink}
                                    strokeWidth={3}
                                />
                                <circle
                                    cx={22}
                                    cy={14}
                                    r={11}
                                    fill={theme.paper}
                                    stroke={theme.ink}
                                    strokeWidth={2.5}
                                />
                                <line
                                    x1={22}
                                    y1={14}
                                    x2={22 + Math.cos(age * 6) * 8}
                                    y2={14 + Math.sin(age * 6) * 8}
                                    stroke={theme.ink}
                                    strokeWidth={2.5}
                                />
                            </g>
                        )}
                    </g>
                );
            })}
            {leaseTag > 0 && (
                <g>
                    <SvgTag
                        x={1060}
                        y={190}
                        text="Lease"
                        p={leaseTag}
                        size={30}
                        color={theme.third}
                        ink={theme.ink}
                    />
                    <path
                        d="M 1110 212 Q 1090 240 1062 262"
                        stroke={theme.onBg}
                        strokeWidth={4}
                        fill="none"
                        opacity={clamp01(leaseTag)}
                    />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: one shared pool (line 8)

const POOL_LOAD = [5, 0, 3, 0, 6, 1, 0, 4];

function Pools() {
    const c = useClock();
    const theme = c.theme;
    const merge = c.span({ line: 8, at: 0.4 }, { line: 8, at: 0.72 });
    const poolFade = c.prog({ line: 8, at: 0.38 }, 0.4);
    const pw = 150;
    const gap = 18;
    const laneW = 1520 / 24;
    return (
        <Layer>
            <Label
                x={0}
                y={70}
                text="Before: a pool per group"
                size={32}
                opacity={1 - poolFade * 0.6}
            />
            {POOL_LOAD.map((load, pi) => {
                const x = 40 + pi * (pw + gap);
                const idle = load === 0;
                return (
                    <g key={pi} opacity={1 - poolFade * 0.85}>
                        <path
                            d={cutRect(x, 110, pw, 230, `pool${pi}`, 2)}
                            fill="rgba(201,211,214,0.16)"
                            stroke={theme.paperAlt}
                            strokeWidth={3}
                        />
                        {Array.from({ length: load }, (_, j) => (
                            <StudyCard
                                key={j}
                                x={x + pw / 2}
                                y={262 - j * 22}
                                w={70}
                                seed={`pl${pi}${j}`}
                                shadow={false}
                            />
                        ))}
                        {idle && (
                            <Label
                                x={x + pw / 2}
                                y={220}
                                text="idle"
                                anchor="middle"
                                size={28}
                                color={theme.onBgSoft}
                            />
                        )}
                    </g>
                );
            })}
            <Label
                x={0}
                y={690}
                text="Now: one shared pool"
                size={32}
                opacity={c.prog({ line: 8, at: 0.5 }, 0.4)}
                color={theme.accent}
            />
            <path
                d={cutRect(40, 500, 1520, 120, "bar-pool", 2)}
                fill={theme.paperAlt}
                filter="url(#ps)"
                opacity={c.prog({ line: 8, at: 0.42 }, 0.4)}
            />
            {/* cards flowing evenly into every lane */}
            {merge >= 1 &&
                Array.from({ length: 24 }, (_, li) => {
                    const phase = (c.t * 1.6 + li * 0.37) % 1;
                    return (
                        <StudyCard
                            key={`f${li}`}
                            x={40 + laneW * (li + 0.5)}
                            y={mix(420, 520, phase)}
                            w={34}
                            opacity={1 - phase * 0.8}
                            shadow={false}
                        />
                    );
                })}
            {Array.from({ length: 24 }, (_, i) => {
                const pi = Math.floor(i / 3);
                const fromX = 40 + pi * (pw + gap) + pw / 2 + ((i % 3) - 1) * 46;
                const fromY = 312;
                const toX = 40 + laneW * (i + 0.5);
                const toY = 560;
                const m = clamp01(merge * 1.4 - (i / 24) * 0.4);
                const idle = POOL_LOAD[pi] === 0 && m < 1;
                return (
                    <Worker
                        key={i}
                        x={mix(fromX, toX, m)}
                        y={mix(fromY, toY, m) - Math.sin(m * Math.PI) * 60}
                        size={mix(46, 52, m)}
                        busy={!idle}
                        spin={idle ? 0 : c.t * 160 + i * 15}
                        seed={`pw${i}`}
                    />
                );
            })}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the cut-up border (lines 9, 10)

const BORDER = makeLand(590, 400, 500, 300, "border-shape", 1.7);
const TILE = 58;
const TILES: [number, number][] = [];
for (let y = 400 - 420; y < 400 + 420; y += TILE) {
    for (let x = 590 - 700; x < 590 + 700; x += TILE) {
        if (BORDER.inside(x + TILE / 2, y + TILE / 2, 0.92)) TILES.push([x, y]);
    }
}
const PROBE: [number, number] = [470, 360];

function Border() {
    const c = useClock();
    const theme = c.theme;
    const crawl = c.lin({ line: 9, at: 0.05 }, { line: 10, at: 0 });
    const crawlOut = c.prog(10, 0.4);
    const pts = BORDER.pts;
    const idx = Math.min(pts.length - 1, Math.floor(crawl * pts.length));
    const head = pts[idx];
    const slow = c.lin({ line: 9, at: 0.15 }, { line: 9, at: 0.85 });
    const snapped = c.after({ line: 10, at: 0.55 });
    const snap = c.pop({ line: 10, at: 0.55 });
    const dot = c.prog({ line: 10, at: 0.38 }, 0.35);
    const glow = c.prog({ line: 10, at: 0.48 }, 0.3);
    return (
        <Layer>
            <SvgTag x={0} y={30} text="Search a state's border" p={c.pop(9)} size={32} />
            {TILES.map(([x, y], i) => {
                const p = c.prog({ line: 10, at: 0.02 + ((x - 90) / 1000) * 0.3 }, 0.3);
                if (p <= 0) return null;
                const near = Math.hypot(x + TILE / 2 - PROBE[0], y + TILE / 2 - PROBE[1]) < 100;
                const fill = near && glow > 0 ? GREEN : theme.paperAlt;
                const dim = !near && glow > 0 ? 1 - glow * 0.55 : 1;
                return (
                    <rect
                        key={i}
                        x={x + 3 + jitter("tile", i) * 1.5}
                        y={y + 3 + jitter("tile-y", i) * 1.5}
                        width={(TILE - 6) * p}
                        height={(TILE - 6) * p}
                        fill={fill}
                        opacity={dim}
                        rx={3}
                    />
                );
            })}
            <path
                d={BORDER.d}
                fill={c.after(10) ? "none" : "rgba(236,234,227,0.07)"}
                stroke={theme.paper}
                strokeWidth={6}
            />
            {crawl > 0 && (
                <g opacity={1 - crawlOut}>
                    <path
                        d={BORDER.d}
                        fill="none"
                        stroke={theme.accent}
                        strokeWidth={12}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1 3"
                        strokeDashoffset={1 - crawl}
                    />
                    <circle
                        cx={head[0]}
                        cy={head[1]}
                        r={16}
                        fill={theme.accent}
                        stroke={theme.ink}
                        strokeWidth={3}
                    />
                </g>
            )}
            {dot > 0 && (
                <g>
                    <circle
                        cx={PROBE[0]}
                        cy={mix(PROBE[1] - 300, PROBE[1], dot)}
                        r={18}
                        fill={theme.accent}
                        stroke={theme.ink}
                        strokeWidth={4}
                        filter="url(#ps-small)"
                    />
                    {glow > 0 && (
                        <circle
                            cx={PROBE[0]}
                            cy={PROBE[1]}
                            r={100 * glow}
                            fill="none"
                            stroke={GREEN}
                            strokeWidth={4}
                            strokeDasharray="10 10"
                        />
                    )}
                </g>
            )}
            <Label x={1240} y={260} text="Border search" size={30} color={theme.onBgSoft} />
            {!snapped && (
                <Big
                    x={1240}
                    y={390}
                    text={`${(26.6 * slow).toFixed(1)} s`}
                    size={120}
                    opacity={clamp01(c.pop({ line: 9, at: 0.1 }) * 2)}
                />
            )}
            {snapped && (
                <g
                    transform={`translate(1240 390) scale(${0.7 + 0.3 * snap}) translate(-1240 -390)`}
                >
                    <Big x={1240} y={390} text="0.34 s" size={120} color={GREEN} />
                </g>
            )}
            {snapped && (
                <g opacity={c.prog({ line: 10, at: 0.65 }, 0.4)}>
                    <Label x={1240} y={470} text="79× faster" size={34} color={theme.onBg} />
                    <Label
                        x={1240}
                        y={520}
                        text="identical rows"
                        size={30}
                        color={theme.onBgSoft}
                    />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: data next to the engine (line 11)

function cloudPath(cx: number, cy: number, w: number, h: number): string {
    const bumps: [number, number, number][] = [
        [-0.32, 0.12, 0.26],
        [-0.12, -0.12, 0.32],
        [0.16, -0.16, 0.3],
        [0.34, 0.06, 0.24],
        [0.1, 0.2, 0.26],
        [-0.14, 0.22, 0.24],
    ];
    return bumps
        .map(([bx, by, r]) =>
            roughCircle(cx + bx * w, cy + by * h * 1.6, r * w * 0.62, `cloud${bx}`, 0.03),
        )
        .join(" ");
}

function Cloud() {
    const c = useClock();
    const theme = c.theme;
    const left = c.pop({ line: 11, at: 0.02 });
    const cross = c.span({ line: 11, at: 0.52 }, { line: 11, at: 0.64 });
    const right = c.pop({ line: 11, at: 0.62 });
    const day = c.after({ line: 11, at: 0.46 }) ? 3 : c.after({ line: 11, at: 0.34 }) ? 2 : 1;
    const dayFlip = c.pop({ line: 11, at: day === 1 ? 0.18 : day === 2 ? 0.34 : 0.46 });
    const lineFrom: [number, number] = [420, 300];
    const lineTo: [number, number] = [600, 560];
    const trip = ((c.t - c.at(11) / c.fps) / 1.4) % 2;
    const tp = trip < 1 ? trip : 2 - trip;
    const px = mix(lineFrom[0], lineTo[0], tp);
    const py = mix(lineFrom[1], lineTo[1], tp) - Math.sin(tp * Math.PI) * 40;
    const fast = (c.t * 2.6) % 1;
    return (
        <Layer>
            <g opacity={clamp01(left * 2)} transform={`translate(0 ${(1 - left) * 30})`}>
                <path d={cloudPath(240, 250, 420, 200)} fill={theme.paperAlt} filter="url(#ps)" />
                <Cylinder x={240} y={200} w={120} h={110} id="cloud-db" />
                <Label x={240} y={430} text="Cloud database" anchor="middle" size={30} />
                <path
                    d={`M ${lineFrom[0]} ${lineFrom[1]} Q ${lineFrom[0] + 150} ${lineFrom[1] + 40} ${lineTo[0]} ${lineTo[1]}`}
                    stroke={theme.onBg}
                    strokeWidth={5}
                    strokeDasharray="4 16"
                    strokeLinecap="round"
                    fill="none"
                />
                <circle
                    cx={px}
                    cy={py}
                    r={14}
                    fill={theme.accent}
                    stroke={theme.ink}
                    strokeWidth={3}
                />
                <Label x={90} y={560} text="≈ 0.2 s each trip" size={30} color={theme.onBg} />
                <Worker x={600} y={630} size={84} spin={c.t * 20} seed="cw1" />
                <Label
                    x={600}
                    y={720}
                    text="Engine"
                    anchor="middle"
                    size={28}
                    color={theme.onBgSoft}
                />
                {/* calendar */}
                <g transform={`translate(640 170)`}>
                    <Label
                        x={0}
                        y={-118}
                        text="A 10-min run"
                        anchor="middle"
                        size={28}
                        color={theme.onBgSoft}
                    />
                    <path
                        d={cutRect(-90, -90, 180, 180, "cal", 2)}
                        fill={theme.paper}
                        filter="url(#ps)"
                    />
                    <rect x={-90} y={-90} width={180} height={44} fill={theme.accent} />
                    <g transform={`scale(1 ${0.4 + 0.6 * clamp01(dayFlip)})`}>
                        <text
                            x={0}
                            y={-2}
                            textAnchor="middle"
                            fill={theme.ink}
                            style={{
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 30,
                                letterSpacing: "0.08em",
                            }}
                        >
                            DAY
                        </text>
                        <text
                            x={0}
                            y={72}
                            textAnchor="middle"
                            fill={theme.ink}
                            style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 76 }}
                        >
                            {day}
                        </text>
                    </g>
                </g>
            </g>
            <Cross x={30} y={70} w={720} h={640} p={cross} color={RED} />
            <g opacity={clamp01(right * 2)} transform={`translate(${(1 - right) * 80} 0)`}>
                <Label
                    x={1220}
                    y={250}
                    text="Next to its data"
                    anchor="middle"
                    size={32}
                    color={theme.accent}
                />
                <path
                    d={cutRect(880, 300, 680, 330, "slab", 2.5)}
                    fill={theme.paper}
                    filter="url(#ps)"
                />
                <text
                    x={910}
                    y={606}
                    fill={theme.ink}
                    style={{
                        fontFamily: "IBM Plex Mono",
                        fontWeight: 500,
                        fontSize: 30,
                        letterSpacing: "0.08em",
                    }}
                >
                    ONE SERVER · 96 CORES
                </text>
                <Cylinder x={1050} y={360} w={150} h={150} id="slab-db" />
                <line x1={1140} y1={450} x2={1290} y2={450} stroke={theme.ink} strokeWidth={5} />
                <circle cx={mix(1145, 1285, fast)} cy={450} r={11} fill={theme.accent} />
                <circle
                    cx={mix(1145, 1285, (fast + 0.5) % 1)}
                    cy={450}
                    r={11}
                    fill={theme.accent}
                />
                <Worker x={1360} y={410} size={80} spin={c.t * 180} seed="sw1" />
                <Worker x={1470} y={410} size={80} spin={-c.t * 180} seed="sw2" />
                <Worker x={1360} y={510} size={80} spin={-c.t * 180} seed="sw3" />
                <Worker x={1470} y={510} size={80} spin={c.t * 180} seed="sw4" />
            </g>
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the result (lines 12, 13)

const TITLE = "The same studies, 33 times faster.";

function Result() {
    const c = useClock();
    const theme = c.theme;
    const newIn = c.pop({ line: 12, at: 0.05 });
    const run = c.span({ line: 12, at: 0.4 }, { line: 12, at: 0.62 });
    const stopped = run >= 1;
    const angle = stopped ? 17 : (c.t - c.at(12) / c.fps) * 900;
    const mapIn = c.prog(12, 0.6);
    const waveStart = 0.55;
    const ms = 0.74;
    const mcx = 1235;
    const mcy = 450;
    const titleP = c.lin({ line: 13, at: 0 }, { line: 13, at: 0.5 });
    const greyBar = c.span({ line: 13, at: 0.05 }, { line: 13, at: 0.3 });
    const orangeBar = c.prog({ line: 13, at: 0.3 }, 0.3);
    const big = c.pop({ line: 13, at: 0.25 });
    const stampStart = c.at({ line: 13, at: 0.45 });
    return (
        <Layer>
            <text
                x={0}
                y={62}
                fill={theme.onBg}
                style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 60 }}
            >
                {Array.from(TITLE).map((ch, i) => (
                    <tspan key={i} opacity={clamp01(titleP * TITLE.length - i)}>
                        {ch}
                    </tspan>
                ))}
            </text>
            <g
                transform={`translate(390 280) scale(${0.5 + 0.5 * newIn}) translate(-390 -280)`}
                opacity={clamp01(newIn * 2)}
            >
                <Stopwatch
                    x={390}
                    y={280}
                    r={100}
                    angle={angle}
                    readout={`${(2.9 * run).toFixed(1)} min`}
                    label="New engine"
                />
            </g>
            <g opacity={mapIn} transform={`translate(${mcx} ${mcy}) scale(${ms})`}>
                <NetworkMap
                    sprout={() => 1}
                    state={(k, x) => {
                        const p = c.lin(
                            { line: 12, at: waveStart + ((x + 450) / 900) * 0.35 },
                            { line: 12, at: waveStart + ((x + 450) / 900) * 0.35 + 0.04 },
                        );
                        return p >= 1 ? RESULT[k] : "idle";
                    }}
                    stamps={(x, y) => {
                        const d = Math.hypot(x, y) / 450;
                        return clamp01((c.frame - stampStart - d * 0.9 * c.fps) / (0.25 * c.fps));
                    }}
                />
            </g>
            {greyBar > 0 && (
                <g>
                    <path
                        d={cutRect(20, 500, 640 * greyBar, 52, "gbar", 1.5)}
                        fill={GREY}
                        filter="url(#ps-small)"
                    />
                    <Label
                        x={20}
                        y={488}
                        text="Web tool it replaced · 96 min"
                        size={28}
                        color={theme.onBgSoft}
                        opacity={greyBar}
                    />
                </g>
            )}
            {orangeBar > 0 && (
                <g>
                    <path
                        d={cutRect(20, 585, Math.max(4, 19 * orangeBar), 52, "obar", 1)}
                        fill={theme.accent}
                        filter="url(#ps-small)"
                    />
                    <Label
                        x={60}
                        y={621}
                        text="New · 2.9 min"
                        size={28}
                        color={theme.onBg}
                        opacity={orangeBar}
                    />
                </g>
            )}
            {big > 0 && (
                <g
                    transform={`translate(520 400) scale(${0.6 + 0.4 * big}) translate(-520 -400)`}
                    opacity={clamp01(big * 2)}
                >
                    <text
                        x={520}
                        y={400}
                        fill={theme.accent}
                        style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 180 }}
                    >
                        33×
                    </text>
                </g>
            )}
            {c.after({ line: 13, at: 0.5 }) && (
                <Stamp
                    x={330}
                    y={712}
                    text="Same answers"
                    color={GREEN}
                    p={c.pop({ line: 13, at: 0.5 })}
                    size={36}
                    rot={-3}
                />
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: production (line 14)

const BIGLAND = makeLand(1215, 390, 370, 300, "big-land", 1.1);
const CLUSTERS = scatter(
    14,
    { x: 760, y: 50, w: 900, h: 690 },
    (x, y) => BIGLAND.inside(x, y, 0.78),
    "clusters",
    120,
);
const SITES = CLUSTERS.flatMap(([cx, cy], ci) =>
    Array.from({ length: 11 }, (_, j): [number, number, number] => {
        const r = seeded(`site${ci}-${j}`);
        const a = r() * Math.PI * 2;
        const d = 12 + r() * 46;
        return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, ci];
    }),
);
const LANE_TARGETS = Array.from(
    { length: 96 },
    (_, i) => SITES[Math.floor(seeded(`lane${i}`)() * SITES.length)],
);

function Production() {
    const c = useClock();
    const theme = c.theme;
    const zoom = c.prog(14, 1.2);
    const s = mix(2.4, 1, zoom);
    const [fx, fy] = CLUSTERS[0];
    const lit = Math.round(96 * c.span({ line: 14, at: 0.04 }, { line: 14, at: 0.22 }));
    const lanes = c.span({ line: 14, at: 0.16 }, { line: 14, at: 0.36 });
    const count = c.span({ line: 14, at: 0.3 }, { line: 14, at: 0.78 });
    const clock = c.span({ line: 14, at: 0.3 }, { line: 14, at: 0.92 });
    const serverIn = c.pop({ line: 14, at: 0.02 });
    return (
        <Layer>
            <g transform={`translate(${fx} ${fy}) scale(${s}) translate(${-fx} ${-fy})`}>
                <path
                    d={BIGLAND.d}
                    fill="rgba(236,234,227,0.07)"
                    stroke={theme.paperAlt}
                    strokeWidth={4 / s}
                />
                {SITES.map(([x, y], i) => {
                    const doneAt = seeded(`sd${i}`)();
                    const state =
                        count > doneAt ? (seeded(`sr${i}`)() < 0.68 ? GREEN : RED) : theme.paper;
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={7}
                            fill={state}
                            stroke={theme.ink}
                            strokeWidth={2}
                        />
                    );
                })}
            </g>
            {lanes > 0 &&
                LANE_TARGETS.map(([x, y], i) => {
                    const y0 = 150 + (i / 95) * 340;
                    const lp = clamp01(lanes * 1.5 - (i / 96) * 0.5);
                    if (lp <= 0) return null;
                    return (
                        <path
                            key={i}
                            d={`M 520 ${y0} C 600 ${y0} ${x - 120} ${y} ${x} ${y}`}
                            stroke={theme.accent}
                            strokeWidth={2}
                            fill="none"
                            opacity={0.45}
                            pathLength={1}
                            strokeDasharray="1 3"
                            strokeDashoffset={1 - lp}
                        />
                    );
                })}
            <g opacity={clamp01(serverIn * 2)} transform={`translate(${(1 - serverIn) * -80} 0)`}>
                <ServerBox
                    x={0}
                    y={110}
                    w={520}
                    h={420}
                    cores={96}
                    cols={12}
                    lit={lit}
                    label="One server · 96 cores"
                    labelSize={30}
                />
            </g>
            {count > 0 && (
                <g>
                    <Big
                        x={0}
                        y={650}
                        text={fmt(Math.round(151214 * count))}
                        size={104}
                        color={theme.accent}
                    />
                    <Label x={0} y={712} text="studies" size={32} />
                </g>
            )}
            {clock > 0 && (
                <g>
                    <circle
                        cx={500}
                        cy={630}
                        r={50}
                        fill={theme.paperAlt}
                        stroke={theme.ink}
                        strokeWidth={4}
                        filter="url(#ps-small)"
                    />
                    <path
                        d={`M 500 630 L 500 580 A 50 50 0 ${clock > 0.5 ? 1 : 0} 1 ${500 + Math.sin(clock * Math.PI * 2 * 0.999) * 50} ${630 - Math.cos(clock * Math.PI * 2 * 0.999) * 50} Z`}
                        fill={theme.accent}
                    />
                    <Big x={566} y={650} text="~40 min" size={56} opacity={clamp01(clock * 3)} />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- the scene

export default function StudyEngine() {
    return (
        <Stage>
            <Enlarge>
                <Shot from={0} to={2}>
                    <OneStudy />
                </Shot>
                <Shot from={3} to={4}>
                    <Network />
                </Shot>
                <Shot from={5} to={5}>
                    <Gate />
                </Shot>
                <Shot from={6} to={7}>
                    <Queue />
                </Shot>
                <Shot from={8} to={8}>
                    <Pools />
                </Shot>
                <Shot from={9} to={10}>
                    <Border />
                </Shot>
                <Shot from={11} to={11}>
                    <Cloud />
                </Shot>
                <Shot from={12} to={13}>
                    <Result />
                </Shot>
                <Shot from={14}>
                    <Production />
                </Shot>
                <OldWatch />
            </Enlarge>
        </Stage>
    );
}
