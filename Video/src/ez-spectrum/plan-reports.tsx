// ez-spectrum / plan-reports: "836 reports in about 12 minutes."
// The stack of plans, the database every plan scanned, the slow way (an hourglass that stays in the corner),
// then the fixes one by one and the background job that printed them all. The only legible text is numbers
// and labels; the reports themselves are blurred. Cues are narration lines 0 to 14.
import React from "react";
import { Shot, Stage, type Cue } from "../kit";
import { jitter, seeded } from "../kit/random";
import {
    Big,
    clamp01,
    Cross,
    cutRect,
    Cylinder,
    fmt,
    GREEN,
    GREY,
    Label,
    Layer,
    Mast,
    mix,
    RED,
    roughCircle,
    Stopwatch,
    StudyCard,
    SvgTag,
    Tick,
    useClock,
    Enlarge,
} from "./shared-a/pieces";

export const theme = "ez-spectrum";
export const poster: Cue = { line: 13, at: "end" };

const YELLOW = "#f0c04a";

// ---------------------------------------------------------------- pieces only this scene needs

/** A license-plan report: an A4 sheet with a small contour map and blurred rows. Nothing on it is legible. */
function Sheet(props: {
    x: number;
    y: number;
    w: number;
    seed: string;
    rot?: number;
    opacity?: number;
    rows?: number;
    detail?: boolean;
    fill?: number;
}) {
    const c = useClock();
    const theme = c.theme;
    const w = props.w;
    const h = w * 1.414;
    const detail = props.detail ?? w >= 120;
    const rows = props.rows ?? 7;
    const fill = props.fill ?? 1;
    return (
        <g
            transform={`translate(${props.x} ${props.y}) rotate(${props.rot ?? 0})`}
            opacity={props.opacity ?? 1}
            filter={w >= 60 ? "url(#ps-small)" : undefined}
        >
            <path
                d={cutRect(-w / 2, -h / 2, w, h, props.seed, Math.max(0.8, w / 120))}
                fill={theme.paper}
            />
            {detail && (
                <g>
                    <rect
                        x={-w * 0.38}
                        y={-h * 0.42}
                        width={w * 0.5}
                        height={h * 0.035}
                        rx={2}
                        fill={theme.inkSoft}
                    />
                    <rect
                        x={-w * 0.38}
                        y={-h * 0.36}
                        width={w * 0.76}
                        height={h * 0.3}
                        fill={theme.paperAlt}
                    />
                    <path
                        d={roughCircle(-w * 0.05, -h * 0.21, w * 0.17, `${props.seed}-c1`, 0.06)}
                        fill="rgba(255,79,26,0.18)"
                        stroke={theme.accent}
                        strokeWidth={Math.max(1.5, w / 90)}
                    />
                    <path
                        d={roughCircle(w * 0.16, -h * 0.25, w * 0.09, `${props.seed}-c2`, 0.06)}
                        fill="none"
                        stroke={theme.inkSoft}
                        strokeWidth={Math.max(1.2, w / 120)}
                    />
                    <path
                        d={roughCircle(-w * 0.24, -h * 0.13, w * 0.07, `${props.seed}-c3`, 0.06)}
                        fill="none"
                        stroke={theme.inkSoft}
                        strokeWidth={Math.max(1.2, w / 120)}
                    />
                    {Array.from({ length: rows }, (_, i) => {
                        const on = i < Math.round(rows * fill);
                        const len = 0.45 + 0.3 * Math.abs(jitter(props.seed, i));
                        return (
                            <rect
                                key={i}
                                x={-w * 0.38}
                                y={-h * 0.01 + i * h * 0.06}
                                width={w * 0.76 * len}
                                height={h * 0.025}
                                rx={h * 0.012}
                                fill={on ? theme.inkSoft : theme.paperAlt}
                                opacity={on ? 0.55 : 0.8}
                            />
                        );
                    })}
                </g>
            )}
            {!detail && (
                <g>
                    <rect
                        x={-w * 0.34}
                        y={-h * 0.36}
                        width={w * 0.68}
                        height={h * 0.28}
                        fill={theme.paperAlt}
                    />
                    {Array.from({ length: 4 }, (_, i) => (
                        <rect
                            key={i}
                            x={-w * 0.34}
                            y={h * 0.0 + i * h * 0.1}
                            width={w * 0.6}
                            height={h * 0.04}
                            fill={fill >= 1 ? theme.inkSoft : theme.paperAlt}
                            opacity={0.6}
                        />
                    ))}
                </g>
            )}
        </g>
    );
}

function Magnifier(props: { x: number; y: number; r: number; opacity?: number }) {
    const theme = useClock().theme;
    return (
        <g opacity={props.opacity ?? 1} filter="url(#ps-small)">
            <line
                x1={props.x + props.r * 0.7}
                y1={props.y + props.r * 0.7}
                x2={props.x + props.r * 1.6}
                y2={props.y + props.r * 1.6}
                stroke={theme.accent}
                strokeWidth={props.r * 0.28}
                strokeLinecap="round"
            />
            <circle
                cx={props.x}
                cy={props.y}
                r={props.r}
                fill="rgba(236,234,227,0.25)"
                stroke={theme.paper}
                strokeWidth={props.r * 0.16}
            />
        </g>
    );
}

function Printer(props: { x: number; y: number; busy: boolean; seed: string }) {
    const theme = useClock().theme;
    return (
        <g transform={`translate(${props.x} ${props.y})`} filter="url(#ps-small)">
            <path d={cutRect(-23, -26, 46, 60, props.seed, 1)} fill={theme.paperAlt} />
            <rect x={-16} y={-18} width={32} height={6} rx={2} fill={theme.ink} />
            <circle cx={12} cy={20} r={4} fill={props.busy ? GREEN : theme.inkSoft} />
        </g>
    );
}

function Hourglass(props: {
    x: number;
    y: number;
    s: number;
    sand: number;
    rot?: number;
    t: number;
}) {
    const theme = useClock().theme;
    const w = 150;
    const h = 220;
    const top = 1 - props.sand;
    return (
        <g
            transform={`translate(${props.x} ${props.y}) rotate(${props.rot ?? 0}) scale(${props.s})`}
        >
            <g filter="url(#ps)">
                <rect
                    x={-w / 2 - 14}
                    y={-h / 2 - 22}
                    width={w + 28}
                    height={22}
                    rx={6}
                    fill={theme.paper}
                />
                <rect
                    x={-w / 2 - 14}
                    y={h / 2}
                    width={w + 28}
                    height={22}
                    rx={6}
                    fill={theme.paper}
                />
            </g>
            <path
                d={`M ${-w / 2} ${-h / 2} L ${w / 2} ${-h / 2} L 8 -6 L 8 6 L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} L -8 6 L -8 -6 Z`}
                fill="rgba(236,234,227,0.12)"
                stroke={theme.paper}
                strokeWidth={6}
                strokeLinejoin="round"
            />
            {/* sand above */}
            <path
                d={`M ${(-w / 2) * top * 0.92} ${-6 - (h / 2 - 10) * top} L ${(w / 2) * top * 0.92} ${-6 - (h / 2 - 10) * top} L 6 -8 L -6 -8 Z`}
                fill={YELLOW}
                opacity={top > 0.02 ? 1 : 0}
            />
            {/* sand below */}
            <path
                d={`M ${-w / 2 + 6} ${h / 2 - 4} L ${w / 2 - 6} ${h / 2 - 4} L ${(w / 2 - 6) * (1 - props.sand * 0.6)} ${h / 2 - 4 - (h / 2 - 20) * props.sand} L ${-(w / 2 - 6) * (1 - props.sand * 0.6)} ${h / 2 - 4 - (h / 2 - 20) * props.sand} Z`}
                fill={YELLOW}
            />
            {top > 0.02 && (
                <line
                    x1={0}
                    y1={-4}
                    x2={0}
                    y2={h / 2 - 8 - (h / 2 - 20) * props.sand}
                    stroke={YELLOW}
                    strokeWidth={4}
                    strokeDasharray="6 8"
                    strokeDashoffset={-props.t * 40}
                />
            )}
        </g>
    );
}

// ---------------------------------------------------------------- the hourglass, from line 4 to the end

function SlowWay() {
    const c = useClock();
    if (!c.after({ line: 4, at: 0.5 })) return null;
    const appear = c.pop({ line: 4, at: 0.5 });
    const corner = c.prog(5, 0.9);
    const sand = 0.04 + 0.1 * c.lin({ line: 4, at: 0.5 }, { line: 14, at: 0 });
    const tip = c.span({ line: 14, at: 0 }, { line: 14, at: 0.35 });
    const fall = c.prog({ line: 14, at: 0.35 }, 0.9);
    const cross = c.span({ line: 13, at: 0.35 }, { line: 13, at: 0.6 });
    const x = mix(560, 1530, corner);
    const y = mix(300, 112, corner);
    const s = mix(1, 0.42, corner) * (0.5 + 0.5 * appear);
    const labelsBig = 1 - clamp01(corner * 2);
    const labelsSmall = clamp01(corner * 2 - 1);
    return (
        <Layer>
            <g transform={`translate(0 ${fall * 1100})`} opacity={clamp01(appear * 2) * (1 - fall)}>
                <Hourglass x={x} y={y} s={s} sand={sand} rot={tip * 100} t={c.t} />
                {labelsBig > 0 && (
                    <g opacity={labelsBig}>
                        <Big x={560} y={510} text="about 280 h" size={72} anchor="middle" />
                        <Label
                            x={560}
                            y={560}
                            text="two scans per plan,"
                            size={30}
                            anchor="middle"
                            color={c.theme.onBgSoft}
                        />
                        <Label
                            x={560}
                            y={600}
                            text="one plan at a time"
                            size={30}
                            anchor="middle"
                            color={c.theme.onBgSoft}
                        />
                    </g>
                )}
                {labelsSmall > 0 && tip < 0.2 && (
                    <g opacity={labelsSmall * (1 - tip * 5)}>
                        <Label x={1465} y={70} text="about 280 h" size={30} anchor="end" />
                        <Label
                            x={1465}
                            y={110}
                            text="two scans per plan,"
                            size={28}
                            anchor="end"
                            color={c.theme.onBgSoft}
                        />
                        <Label
                            x={1465}
                            y={146}
                            text="one plan at a time"
                            size={28}
                            anchor="end"
                            color={c.theme.onBgSoft}
                        />
                    </g>
                )}
            </g>
            {cross > 0 && tip <= 0 && (
                <Cross x={1110} y={20} w={490} h={185} p={cross} color={RED} />
            )}
            {tip > 0 && fall < 1 && (
                <g transform={`translate(0 ${fall * 900})`} opacity={1 - tip}>
                    <Cross x={1110} y={20} w={490} h={185} p={1} color={RED} />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the plans and the database (lines 0 to 4)

const STACK_X = 200;
const STACK_BASE = 620;
const STACK_W = 180;
const STACK_N = 12;
const DB = { x: 1180, y: 280, w: 480, h: 330 };
const DOT_ROWS = 11;
const DOT_COLS = 20;

function stackTop(n = STACK_N): [number, number] {
    return [STACK_X, STACK_BASE - (STACK_W * 1.414) / 2 - (n - 1) * 7];
}

function Dots(props: {
    fill: number;
    band?: [number, number];
    dim?: number;
    scan?: number;
    cx: number;
    top: number;
    w: number;
    rows: number;
    cols: number;
}) {
    const theme = useClock().theme;
    const { cx, top, w, rows, cols } = props;
    const gx = (w * 0.8) / (cols - 1);
    const gy = 26;
    const out: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
        for (let k = 0; k < cols; k++) {
            const idx = r * cols + k;
            if (idx / (rows * cols) > props.fill) continue;
            const inBand = props.band ? r >= props.band[0] && r <= props.band[1] : false;
            const scanned = props.scan !== undefined && idx / (rows * cols) < props.scan;
            const color = inBand
                ? theme.accent
                : scanned
                  ? theme.inkSoft
                  : seeded(`dot${idx}`)() < 0.5
                    ? GREEN
                    : theme.inkSoft;
            out.push(
                <circle
                    key={idx}
                    cx={cx - w * 0.4 + k * gx}
                    cy={top + 70 + r * gy}
                    r={6}
                    fill={color}
                    opacity={props.band && !inBand ? 1 - (props.dim ?? 0) * 0.75 : 1}
                />,
            );
        }
    }
    return <g>{out}</g>;
}

/** The results table for every project: a far bigger block than one project's cylinder. */
function ResultsTable(props: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    dim?: number;
    bands?: number[];
    bandP?: number;
    swept?: { row: number; upTo: number };
    rowsTop?: number;
}) {
    const theme = useClock().theme;
    const { x, y, w, h } = props;
    const top = y + (props.rowsTop ?? 80);
    const rowH = 22;
    const rows = Math.floor((y + h - 20 - top) / rowH);
    return (
        <g>
            <path
                d={cutRect(x, y, w, h, "results-table", 3)}
                fill={theme.paperAlt}
                filter="url(#ps)"
            />
            <text
                x={x + 30}
                y={y + 50}
                fill={theme.ink}
                style={{
                    fontFamily: "IBM Plex Mono",
                    fontWeight: 500,
                    fontSize: 28,
                    letterSpacing: "0.06em",
                }}
            >
                {props.label.toUpperCase()}
            </text>
            {Array.from({ length: rows }, (_, r) => {
                const inBand = props.bands?.includes(r) ?? false;
                const sweptRow =
                    props.swept !== undefined &&
                    (r < props.swept.row || (r === props.swept.row && props.swept.upTo > 0));
                return (
                    <g key={r}>
                        <rect
                            x={x + 30}
                            y={top + r * rowH}
                            width={w - 60}
                            height={rowH - 8}
                            rx={4}
                            fill={theme.inkSoft}
                            opacity={
                                (props.dim ? 0.35 - props.dim * 0.25 : 0.35) + (sweptRow ? 0.25 : 0)
                            }
                        />
                        {inBand && (props.bandP ?? 0) > 0 && (
                            <rect
                                x={x + 30}
                                y={top + r * rowH - 2}
                                width={(w - 60) * (props.bandP ?? 0)}
                                height={rowH - 4}
                                rx={5}
                                fill={theme.accent}
                            />
                        )}
                    </g>
                );
            })}
        </g>
    );
}

function PlansAndData() {
    const c = useClock();
    const theme = c.theme;
    const drop = c.pop({ line: 0, at: 0.05 });
    const move = c.prog(1, 0.6);
    const lift = c.span({ line: 1, at: 0.15 }, { line: 1, at: 0.42 });
    const count = c.span({ line: 0, at: 0.15 }, { line: 0, at: 0.7 });
    const back = c.span({ line: 4, at: 0.35 }, { line: 4, at: 0.55 });
    const dbIn = c.pop({ line: 1, at: 0.4 });
    const link = c.span({ line: 1, at: 0.55 }, { line: 1, at: 0.85 });
    const fill = c.span({ line: 2, at: 0.05 }, { line: 2, at: 0.7 });
    const swell = 1 + 0.05 * c.prog({ line: 2, at: 0 }, 0.8);
    const studies = c.span({ line: 2, at: 0.3 }, { line: 2, at: 0.6 });
    const results = c.span({ line: 2, at: 0.62 }, { line: 2, at: 0.92 });
    // Line 3: the whole results table slides in behind the project, and the project steps aside.
    const tableIn = c.prog({ line: 3, at: 0 }, 0.8);
    const shrink = c.prog({ line: 3, at: 0 }, 0.8);
    // Two sweeps of the whole table: one for the PDF, one for the map.
    const pass1 = c.lin({ line: 3, at: 0.1 }, { line: 4, at: 0.02 });
    const pass2 = c.lin({ line: 4, at: 0.05 }, { line: 4, at: 0.6 });
    const scanIn = c.prog({ line: 3, at: 0.05 }, 0.4) * (1 - c.prog({ line: 4, at: 0.62 }, 0.4));
    const watchIn = c.pop({ line: 3, at: 0.05 }) * (1 - c.prog({ line: 4, at: 0.3 }, 0.4));
    const watchRun = c.lin({ line: 3, at: 0.1 }, { line: 3, at: 0.8 });
    const [tx, ty] = stackTop();
    const sheetBig = lift > 0 && back < 1;
    const k = sheetBig ? (back > 0 ? 1 - back : lift) : 0;
    const sx = mix(tx, 640, k);
    const sy = mix(ty, 290, k);
    const sw = mix(STACK_W, 260, k);
    const T = { x: 860, y: 210, w: 740, h: 520 };
    const SWEEP_ROWS = 9;
    const pass = c.after({ line: 4, at: 0.05 }) ? pass2 : pass1;
    const rowsSwept = pass * SWEEP_ROWS;
    const row = Math.min(SWEEP_ROWS - 1, Math.floor(rowsSwept));
    const along = rowsSwept - row;
    const dir = row % 2 === 0 ? along : 1 - along;
    const mx = 1080 + dir * 440;
    const my = 330 + row * 44;
    const passTag = c.after({ line: 4, at: 0.05 }) ? "map" : "PDF";
    // The project cylinder: centre (DB.x, DB.y + DB.h / 2), moving to the table's lower-left corner.
    const dbScale = swell * (0.6 + 0.4 * dbIn) * mix(1, 0.46, shrink);
    const dbCx = mix(DB.x, 900, shrink);
    const dbCy = mix(DB.y + DB.h / 2, 600, shrink);
    return (
        <Layer>
            <g
                transform={`translate(${mix(520, 0, move)} ${(1 - drop) * -560}) translate(${STACK_X} ${STACK_BASE}) scale(${mix(1.4, 1, move)}) translate(${-STACK_X} ${-STACK_BASE})`}
            >
                {Array.from({ length: STACK_N - 1 }, (_, i) => (
                    <Sheet
                        key={i}
                        x={STACK_X + jitter("st", i) * 4}
                        y={STACK_BASE - (STACK_W * 1.414) / 2 - i * 7}
                        w={STACK_W}
                        seed={`st${i}`}
                        rot={jitter("str", i) * 1.5}
                        detail={false}
                    />
                ))}
                {!sheetBig && <Sheet x={tx} y={ty} w={STACK_W} seed="top" detail={false} />}
            </g>
            {move < 1 && count > 0 && (
                <g opacity={1 - move}>
                    <Big
                        x={1000}
                        y={420}
                        text={fmt(Math.round(836 * count))}
                        size={170}
                        color={theme.accent}
                    />
                    <Label x={1006} y={490} text="license-plan reports" size={34} />
                </g>
            )}
            <SvgTag x={70} y={120} text="836 plans" p={c.pop({ line: 1, at: 0.1 })} size={34} />
            {/* the results table of every project, behind this project's cylinder */}
            {tableIn > 0 && (
                <g transform={`translate(${(1 - tableIn) * 900} 0)`}>
                    <ResultsTable
                        x={T.x}
                        y={T.y}
                        w={T.w}
                        h={T.h}
                        label="Results table: over 1 billion rows"
                        swept={scanIn > 0 ? { row, upTo: along } : undefined}
                        rowsTop={90}
                    />
                </g>
            )}
            {/* the project's database */}
            {dbIn > 0 && (
                <g
                    transform={`translate(${dbCx} ${dbCy}) scale(${dbScale}) translate(${-DB.x} ${-(DB.y + DB.h / 2)})`}
                    opacity={clamp01(dbIn * 2)}
                >
                    <Cylinder
                        x={DB.x}
                        y={DB.y}
                        w={DB.w}
                        h={DB.h}
                        id="pr-db"
                        label={shrink > 0 ? undefined : "Study results"}
                    >
                        <Dots
                            fill={fill}
                            cx={DB.x}
                            top={DB.y}
                            w={DB.w}
                            rows={DOT_ROWS}
                            cols={DOT_COLS}
                        />
                    </Cylinder>
                </g>
            )}
            {shrink > 0.5 && (
                <Label
                    x={900}
                    y={760}
                    text="This project"
                    anchor="middle"
                    size={28}
                    opacity={clamp01(shrink * 2 - 1)}
                />
            )}
            {studies > 0 && shrink < 1 && (
                <g opacity={1 - shrink}>
                    <Big
                        x={1040}
                        y={150}
                        text={fmt(Math.round(185161 * studies))}
                        size={60}
                        anchor="middle"
                    />
                    <Label
                        x={1040}
                        y={196}
                        text="studies"
                        size={28}
                        anchor="middle"
                        color={theme.onBgSoft}
                    />
                </g>
            )}
            {results > 0 && shrink < 1 && (
                <g opacity={1 - shrink}>
                    <Big
                        x={1330}
                        y={150}
                        text={`${(8.16 * results).toFixed(2)} M`}
                        size={60}
                        anchor="middle"
                        color={theme.accent}
                    />
                    <Label
                        x={1330}
                        y={196}
                        text="results"
                        size={28}
                        anchor="middle"
                        color={theme.onBgSoft}
                    />
                </g>
            )}
            {/* the link from the report to the results */}
            {link > 0 && shrink < 1 && (
                <path
                    d="M 775 360 C 840 360 860 440 935 440"
                    stroke={theme.onBg}
                    strokeWidth={5}
                    fill="none"
                    strokeDasharray="1 3"
                    pathLength={1}
                    strokeDashoffset={1 - link}
                    opacity={1 - shrink}
                />
            )}
            {sheetBig && (
                <g>
                    <Sheet x={sx} y={sy} w={sw} seed="top" rows={8} />
                    <SvgTag
                        x={sx - 120}
                        y={sy - 205}
                        text="PDF"
                        p={c.pop({ line: 1, at: 0.3 }) * (1 - back) * (1 - shrink)}
                        size={28}
                        color={theme.second}
                    />
                </g>
            )}
            {scanIn > 0 && (
                <g opacity={scanIn}>
                    <Magnifier x={mx} y={my} r={52} />
                    <SvgTag
                        x={mx - 50}
                        y={my - 92}
                        text={passTag}
                        size={28}
                        color={passTag === "PDF" ? theme.second : YELLOW}
                        ink={passTag === "PDF" ? "#fffaf2" : theme.ink}
                    />
                </g>
            )}
            {watchIn > 0 && (
                <g opacity={clamp01(watchIn * 2)}>
                    <Stopwatch
                        x={640}
                        y={590}
                        r={70}
                        angle={watchRun * 3600}
                        readout={watchRun >= 1 ? "10+ min" : `${Math.floor(10 * watchRun)} min`}
                    />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: where the time went (line 5)

function TimeBar() {
    const c = useClock();
    const theme = c.theme;
    const total = 1200;
    const x0 = 280;
    const segs = [
        { label: "load", share: 17 / 20.8, color: theme.accent, at: 0.12 },
        { label: "maps", share: 0.5 / 20.8, color: YELLOW, at: 0.35 },
        { label: "print", share: 3.3 / 20.8, color: GREEN, at: 0.45 },
    ];
    let x = x0;
    const pulse = c.after({ line: 5, at: 0.62 })
        ? 1 + 0.06 * Math.sin((c.t - c.at({ line: 5, at: 0.62 }) / c.fps) * 9)
        : 1;
    return (
        <Layer>
            <SvgTag x={0} y={30} text="Measure first" p={c.pop(5)} size={32} />
            <Sheet x={140} y={400} w={140} seed="one-plan" />
            <Label
                x={140}
                y={540}
                text="one plan"
                anchor="middle"
                size={28}
                color={theme.onBgSoft}
            />
            {segs.map((s, i) => {
                const p = c.prog({ line: 5, at: s.at }, 0.6);
                const w = s.share * total * p;
                const sx = x;
                x += s.share * total;
                const h = i === 0 ? 110 * pulse : 110;
                return (
                    <g key={s.label}>
                        {p > 0 && (
                            <path
                                d={cutRect(sx, 400 - h / 2, Math.max(2, w), h, `seg${i}`, 1.5)}
                                fill={s.color}
                                filter="url(#ps-small)"
                            />
                        )}
                        {p > 0.3 && (
                            <g>
                                <Label
                                    x={i === 1 ? sx + 4 : sx + (s.share * total) / 2}
                                    y={i === 1 ? 560 : 310}
                                    text={s.label}
                                    anchor="middle"
                                    size={i === 0 ? 40 : 32}
                                    color={i === 0 ? theme.accent : theme.onBg}
                                />
                                {i === 1 && (
                                    <line
                                        x1={sx + 6}
                                        y1={462}
                                        x2={sx + 6}
                                        y2={526}
                                        stroke={theme.onBg}
                                        strokeWidth={3}
                                    />
                                )}
                            </g>
                        )}
                    </g>
                );
            })}
            <Label
                x={x0}
                y={680}
                text="Where one plan's time went"
                size={32}
                opacity={c.prog({ line: 5, at: 0.15 }, 0.6)}
            />
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: its studies first, then their results (lines 6, 7)

const PICKED_ROWS = [2, 7, 11, 16];

function NarrowRead() {
    const c = useClock();
    const theme = c.theme;
    const pick = (i: number) => c.prog({ line: 6, at: 0.04 + i * 0.07 }, 0.5);
    const beam = c.prog({ line: 6, at: 0.45 }, 0.6);
    const rewind = c.span({ line: 7, at: 0.05 }, { line: 7, at: 0.4 });
    const fast = c.pop({ line: 7, at: 0.4 });
    const T = { x: 920, y: 170, w: 680, h: 540 };
    const rowY = (r: number) => T.y + 90 + r * 22 + 7;
    const cyl = { x: 600, y: 420, w: 220, h: 170 };
    return (
        <Layer>
            <SvgTag x={0} y={30} text="Read less" p={c.pop(6)} size={32} />
            <Sheet x={300} y={300} w={160} seed="narrow-sheet" />
            <ResultsTable
                x={T.x}
                y={T.y}
                w={T.w}
                h={T.h}
                label="Results table"
                dim={beam}
                bands={PICKED_ROWS}
                bandP={beam}
                rowsTop={90}
            />
            <Cylinder x={cyl.x} y={cyl.y} w={cyl.w} h={cyl.h} id="pr-db2" label="This project">
                <Dots fill={1} cx={cyl.x} top={cyl.y - 30} w={cyl.w} rows={6} cols={9} />
            </Cylinder>
            <Label
                x={790}
                y={150}
                text="its studies"
                anchor="middle"
                size={28}
                opacity={c.prog({ line: 6, at: 0.15 }, 0.4)}
            />
            {PICKED_ROWS.map((r, i) => {
                const p = pick(i);
                if (p <= 0) return null;
                const x = mix(cyl.x, 790, p);
                const y = mix(cyl.y + 40, 210 + i * 66, p) - Math.sin(p * Math.PI) * 80;
                return (
                    <g key={r}>
                        {beam > 0 && (
                            <path
                                d={`M ${x + 44} ${y - 8} L ${T.x + 30} ${rowY(r) - 9} L ${T.x + 30} ${rowY(r) + 9} L ${x + 44} ${y + 8} Z`}
                                fill="rgba(255,79,26,0.3)"
                                opacity={beam}
                            />
                        )}
                        <StudyCard x={x} y={y} w={84} seed={`pick${i}`} />
                    </g>
                );
            })}
            <Label
                x={T.x + T.w / 2}
                y={760}
                text="Only their results, not the whole table"
                anchor="middle"
                size={28}
                opacity={c.prog({ line: 6, at: 0.6 }, 0.5)}
            />
            <g opacity={clamp01(c.pop({ line: 6, at: 0.1 }) * 2)}>
                <Stopwatch
                    x={300}
                    y={560}
                    r={80}
                    angle={rewind > 0 ? (1 - rewind) * 720 + 40 : 3600 + 40}
                    readout={fast > 0 ? "20.8 s" : "10+ min"}
                    color={fast > 0 ? GREEN : theme.accent}
                />
            </g>
            {fast > 0 && (
                <g transform={`translate(300 707) scale(${0.7 + 0.3 * fast}) translate(-300 -707)`}>
                    <rect
                        x={190}
                        y={652}
                        width={220}
                        height={72}
                        rx={10}
                        fill="none"
                        stroke={GREEN}
                        strokeWidth={5}
                        opacity={clamp01(fast * 2)}
                    />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: one pass for every plan (line 8)

const GRID: [number, number][] = [];
for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) GRID.push([880 + k * 125, 310 + r * 132]);
const THREAD_COLORS = [GREEN, "#ff4f1a", YELLOW];

function OnePass() {
    const c = useClock();
    const theme = c.theme;
    const sweep = c.span({ line: 8, at: 0.08 }, { line: 8, at: 0.62 });
    const dbx = 420;
    const left = dbx - 200;
    const sweepX = left + sweep * 400;
    return (
        <Layer>
            <SvgTag x={0} y={30} text="One pass" p={c.pop(8)} size={32} />
            <Cylinder x={dbx} y={230} w={420} h={380} id="pr-db3" label="Study results">
                <Dots fill={1} cx={dbx} top={230} w={420} rows={13} cols={16} />
                {sweep > 0 && sweep < 1 && (
                    <rect x={sweepX - 6} y={200} width={12} height={480} fill={theme.accent} />
                )}
            </Cylinder>
            {GRID.map(([gx, gy], i) => {
                const startAt = 0.1 + (i / GRID.length) * 0.48;
                const p = c.prog({ line: 8, at: startAt }, 0.45);
                const srcX = left + ((startAt - 0.08) / 0.54) * 400;
                const srcY = 300 + seeded(`thr${i}`)() * 300;
                return (
                    <g key={i}>
                        {p > 0 && (
                            <path
                                d={`M ${srcX} ${srcY} C ${srcX + 200} ${srcY} ${gx - 200} ${gy} ${gx - 40} ${gy}`}
                                stroke={THREAD_COLORS[i % 3]}
                                strokeWidth={4}
                                fill="none"
                                pathLength={1}
                                strokeDasharray="1 3"
                                strokeDashoffset={1 - p}
                                opacity={0.85}
                            />
                        )}
                        <Sheet x={gx} y={gy} w={84} seed={`g${i}`} fill={p >= 1 ? 1 : 0} />
                    </g>
                );
            })}
            <Label
                x={1192}
                y={728}
                text="One pass, all 836"
                anchor="middle"
                size={34}
                opacity={c.prog({ line: 8, at: 0.5 }, 0.5)}
                color={theme.accent}
            />
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: each contour prepared once (line 9)

const ANGLES = [150, 210, 262, 322, 30];

function ContourPanel(props: { cx: number; cy: number; mode: "before" | "now" }) {
    const c = useClock();
    const theme = c.theme;
    const R = 120;
    const D = 225;
    const masts = ANGLES.map((a) => [
        props.cx + Math.cos((a * Math.PI) / 180) * D,
        props.cy + Math.sin((a * Math.PI) / 180) * D,
    ]);
    let ring = 0;
    let count = 0;
    const checks: number[] = [];
    if (props.mode === "before") {
        // Prepared again for every licensee: draw, check one, erase, five times.
        const p = c.lin({ line: 9, at: 0.02 }, { line: 9, at: 0.48 });
        const round = Math.min(4, Math.floor(p * 5));
        const local = p * 5 - round;
        ring = p >= 1 ? 1 : clamp01(local / 0.6);
        count = p > 0 ? round + 1 : 0;
        for (let i = 0; i < 5; i++)
            checks.push(i < round ? 1 : i === round ? clamp01((local - 0.6) / 0.3) : 0);
    } else {
        ring = c.span({ line: 9, at: 0.52 }, { line: 9, at: 0.64 });
        count = ring > 0 ? 1 : 0;
        for (let i = 0; i < 5; i++) checks.push(c.prog({ line: 9, at: 0.66 + i * 0.05 }, 0.25));
    }
    return (
        <g>
            {masts.map(([x, y], i) => (
                <g key={i}>
                    <Mast x={x} y={y + 30} h={70} color={GREY} arcs={1} />
                    {checks[i] > 0 && (
                        <line
                            x1={props.cx + ((x - props.cx) / D) * R}
                            y1={props.cy + ((y - props.cy) / D) * R}
                            x2={props.cx + ((x - props.cx) / D) * (D - 40)}
                            y2={props.cy + ((y - props.cy) / D) * (D - 40)}
                            stroke={GREEN}
                            strokeWidth={5}
                            strokeDasharray="10 8"
                            opacity={checks[i]}
                        />
                    )}
                    {checks[i] >= 1 && <Tick x={x + 40} y={y - 30} s={30} p={1} color={GREEN} />}
                </g>
            ))}
            {ring > 0 && (
                <path
                    d={roughCircle(props.cx, props.cy, R, `prep-${props.mode}-${count}`, 0.05)}
                    fill="rgba(255,79,26,0.14)"
                    stroke={theme.accent}
                    strokeWidth={7}
                    pathLength={1}
                    strokeDasharray="1 3"
                    strokeDashoffset={1 - ring}
                />
            )}
            {count > 0 && (
                <Big
                    x={props.cx}
                    y={props.cy + 22}
                    text={`×${count}`}
                    size={64}
                    anchor="middle"
                    color={props.mode === "before" ? theme.accent : GREEN}
                />
            )}
        </g>
    );
}

function PrepareOnce() {
    const c = useClock();
    const theme = c.theme;
    return (
        <Layer>
            <SvgTag x={0} y={30} text="Prepare once" p={c.pop(9)} size={32} />
            <ContourPanel cx={390} cy={420} mode="before" />
            <ContourPanel cx={1130} cy={420} mode="now" />
            <line
                x1={760}
                y1={160}
                x2={760}
                y2={700}
                stroke={theme.onBgSoft}
                strokeWidth={3}
                strokeDasharray="8 12"
            />
            <Label x={390} y={720} text="Before: once per licensee" anchor="middle" size={30} />
            <Label
                x={1130}
                y={720}
                text="Now: once"
                anchor="middle"
                size={30}
                color={GREEN}
                opacity={c.prog({ line: 9, at: 0.5 }, 0.4)}
            />
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the index not added (line 10)

function NoIndex() {
    const c = useClock();
    const theme = c.theme;
    // The proposed index rolls toward the database, stops short, and rolls back out unbuilt.
    const inP = c.span({ line: 10, at: 0 }, { line: 10, at: 0.3 });
    const out = c.span({ line: 10, at: 0.42 }, { line: 10, at: 0.62 });
    const bx = mix(1300, 0, inP) + mix(0, 1300, out);
    const wheel = (inP - out) * 900;
    const bars = c.prog({ line: 10, at: 0.6 }, 0.8);
    const dbFade = 1 - c.prog({ line: 10, at: 0.6 }, 0.4);
    return (
        <Layer>
            <SvgTag x={0} y={30} text="A narrower read" p={c.pop(10)} size={32} />
            {dbFade > 0 && (
                <g opacity={dbFade}>
                    <Cylinder x={220} y={250} w={300} h={300} id="pr-db4" label="Database" />
                </g>
            )}
            {inP > 0 && out < 1 && (
                <g transform={`translate(${bx} 0)`}>
                    <path
                        d={cutRect(520, 190, 620, 360, "index-block", 3)}
                        fill={theme.paperAlt}
                        filter="url(#ps)"
                        strokeDasharray="14 10"
                        stroke={theme.inkSoft}
                        strokeWidth={4}
                    />
                    <text
                        x={830}
                        y={265}
                        textAnchor="middle"
                        fill={theme.inkSoft}
                        style={{
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 34,
                            letterSpacing: "0.08em",
                        }}
                    >
                        PROPOSED
                    </text>
                    <text
                        x={830}
                        y={390}
                        textAnchor="middle"
                        fill={theme.ink}
                        style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 120 }}
                    >
                        8 GB
                    </text>
                    <text
                        x={830}
                        y={460}
                        textAnchor="middle"
                        fill={theme.inkSoft}
                        style={{
                            fontFamily: "IBM Plex Mono",
                            fontWeight: 500,
                            fontSize: 40,
                            letterSpacing: "0.08em",
                        }}
                    >
                        INDEX
                    </text>
                    {[620, 1040].map((wx) => (
                        <g key={wx} transform={`translate(${wx} 590) rotate(${-wheel})`}>
                            <circle r={38} fill={theme.ink} stroke={theme.paper} strokeWidth={5} />
                            <line
                                x1={-30}
                                y1={0}
                                x2={30}
                                y2={0}
                                stroke={theme.paper}
                                strokeWidth={5}
                            />
                            <line
                                x1={0}
                                y1={-30}
                                x2={0}
                                y2={30}
                                stroke={theme.paper}
                                strokeWidth={5}
                            />
                        </g>
                    ))}
                </g>
            )}
            {bars > 0 && (
                <g>
                    <Label x={200} y={310} text="Finding results" size={34} color={theme.onBg} />
                    <path
                        d={cutRect(200, 350, 1000 * bars, 80, "read-old", 1.5)}
                        fill={GREY}
                        filter="url(#ps-small)"
                    />
                    <Big x={200 + 1000 * bars + 30} y={410} text="17 s" size={60} opacity={bars} />
                    <path
                        d={cutRect(200, 470, Math.max(4, 82 * bars), 80, "read-new", 1.2)}
                        fill={GREEN}
                        filter="url(#ps-small)"
                    />
                    <Big
                        x={200 + 82 * bars + 30}
                        y={530}
                        text="1.4 s"
                        size={60}
                        color={GREEN}
                        opacity={bars}
                    />
                    <Label
                        x={200}
                        y={640}
                        text="No schema change"
                        size={32}
                        color={theme.onBgSoft}
                        opacity={c.prog({ line: 10, at: 0.8 }, 0.5)}
                    />
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the background job (lines 11 to 13)

const PRINTERS = Array.from({ length: 16 }, (_, i) => 370 + i * 53);
const PRINT_Y = 440;
const TRAY = { x: 1290, y: PRINT_Y + 10, w: 270 };
const TITLE = "836 reports in about 12 minutes.";

function Job() {
    const c = useClock();
    const theme = c.theme;
    const fan = c.prog(11, 0.6);
    const start = c.at({ line: 11, at: 0.35 }) / c.fps;
    const end = c.at({ line: 13, at: 0.3 }) / c.fps;
    const batchEvery = 0.55;
    const batches = Math.max(0, Math.floor((c.t - start) / batchEvery) + 1);
    const lastBatch = Math.floor((end - start) / batchEvery);
    const progress = clamp01((c.t - start) / (end - start));
    const done = Math.round(836 * progress);
    const panelIn = c.pop({ line: 12, at: 0 });
    const panelOut = c.prog(13, 0.5);
    const titleP = c.lin({ line: 13, at: 0.1 }, { line: 13, at: 0.6 });
    const clockRun = c.lin({ line: 11, at: 0.35 }, { line: 13, at: 0.3 });
    const secs = Math.round(742 * clockRun);
    const clockText = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    const flying: React.ReactNode[] = [];
    for (let b = Math.max(0, batches - 2); b < Math.min(batches, lastBatch + 1); b++) {
        const age = c.t - (start + b * batchEvery);
        if (age < 0) continue;
        PRINTERS.forEach((px, i) => {
            const a = age - i * 0.012;
            if (a < 0) return;
            if (a < 0.35) {
                const p = a / 0.35;
                const [sx, sy] = [170, 470];
                flying.push(
                    <Sheet
                        key={`in${b}-${i}`}
                        x={mix(sx, px, p)}
                        y={mix(sy, PRINT_Y - 40, p) - Math.sin(p * Math.PI) * 140}
                        w={40}
                        seed={`f${i}`}
                    />,
                );
            } else if (a < 0.8) {
                const p = (a - 0.35) / 0.45;
                flying.push(
                    <Sheet
                        key={`out${b}-${i}`}
                        x={mix(px, TRAY.x + 40 + (i % 8) * 25, p)}
                        y={mix(PRINT_Y - 30, TRAY.y - 10, p) - Math.sin(p * Math.PI) * 40}
                        w={40}
                        seed={`o${i}`}
                        fill={1}
                    />,
                );
            }
        });
    }
    const stackLeft = Math.max(0, 1 - progress);
    return (
        <Layer>
            {titleP > 0 && (
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
            )}
            {titleP <= 0 && (
                <SvgTag x={0} y={30} text="One background job" p={c.pop(11)} size={32} />
            )}
            {/* the stack, fanned out and shrinking */}
            {Array.from({ length: 9 }, (_, i) => {
                if (i / 9 > stackLeft + 0.05) return null;
                return (
                    <Sheet
                        key={i}
                        x={170 + (i - 4) * 14 * fan}
                        y={500 - i * 6}
                        w={150}
                        seed={`js${i}`}
                        rot={(i - 4) * 5 * fan}
                        detail={false}
                    />
                );
            })}
            {PRINTERS.map((px, i) => {
                const s = c.prog({ line: 11, at: 0.08 + i * 0.012 }, 0.4);
                return (
                    <g key={i} transform={`translate(0 ${(1 - s) * 300})`} opacity={s}>
                        <Printer
                            x={px}
                            y={PRINT_Y}
                            busy={c.t >= start && progress < 1}
                            seed={`pr${i}`}
                        />
                    </g>
                );
            })}
            <Label
                x={(PRINTERS[0] + PRINTERS[15]) / 2}
                y={PRINT_Y + 90}
                text="16 at a time"
                anchor="middle"
                size={30}
                opacity={c.prog({ line: 11, at: 0.3 }, 0.5)}
            />
            {flying}
            {/* the done tray */}
            <g opacity={c.prog({ line: 11, at: 0.2 }, 0.5)}>
                <path
                    d={cutRect(TRAY.x, TRAY.y, TRAY.w, 70, "tray", 2)}
                    fill={theme.paperAlt}
                    filter="url(#ps)"
                />
                <Label
                    x={TRAY.x + TRAY.w / 2}
                    y={TRAY.y + 250}
                    text="done"
                    anchor="middle"
                    size={30}
                />
                <Big
                    x={TRAY.x + TRAY.w / 2}
                    y={TRAY.y + 200}
                    text={fmt(done)}
                    size={110}
                    anchor="middle"
                    color={done >= 836 ? GREEN : theme.onBg}
                />
            </g>
            {/* the clock */}
            <g opacity={c.prog({ line: 11, at: 0.3 }, 0.5)}>
                <Stopwatch x={700} y={650} r={52} angle={clockRun * 720} readout="" />
                <Big x={775} y={672} text={clockText} size={64} />
            </g>
            {/* the progress panel */}
            {panelIn > 0 && panelOut < 1 && (
                <g transform={`translate(-120 ${(1 - panelIn) * -260})`} opacity={1 - panelOut}>
                    <path
                        d={cutRect(360, 110, 820, 200, "panel", 2)}
                        fill={theme.paper}
                        filter="url(#ps)"
                    />
                    <circle
                        cx={770}
                        cy={124}
                        r={11}
                        fill={theme.accent}
                        stroke={theme.ink}
                        strokeWidth={3}
                    />
                    <rect
                        x={390}
                        y={150}
                        width={760}
                        height={34}
                        rx={8}
                        fill={theme.paperAlt}
                        stroke={theme.ink}
                        strokeWidth={3}
                    />
                    <rect x={392} y={152} width={756 * progress} height={30} rx={7} fill={GREEN} />
                    <g opacity={c.prog({ line: 12, at: 0.3 }, 0.4)}>
                        <circle
                            cx={410}
                            cy={250}
                            r={18}
                            fill={theme.paperAlt}
                            stroke={theme.ink}
                            strokeWidth={3}
                        />
                        <line
                            x1={410}
                            y1={250}
                            x2={410 + Math.cos(-c.t * 3) * 13}
                            y2={250 + Math.sin(-c.t * 3) * 13}
                            stroke={theme.ink}
                            strokeWidth={3}
                        />
                        <text
                            x={440}
                            y={260}
                            fill={theme.ink}
                            style={{
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 28,
                                letterSpacing: "0.06em",
                            }}
                        >
                            TIME LEFT
                        </text>
                    </g>
                    <g opacity={c.prog({ line: 12, at: 0.5 }, 0.4)}>
                        <text
                            x={650}
                            y={260}
                            fill={theme.ink}
                            style={{
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 28,
                                letterSpacing: "0.06em",
                            }}
                        >
                            FAILURES
                        </text>
                        <rect
                            x={800}
                            y={228}
                            width={150}
                            height={44}
                            rx={6}
                            fill="none"
                            stroke={theme.inkSoft}
                            strokeWidth={3}
                            strokeDasharray="8 7"
                        />
                    </g>
                    <g opacity={c.prog({ line: 12, at: 0.72 }, 0.4)}>
                        <rect
                            x={985}
                            y={224}
                            width={170}
                            height={52}
                            rx={26}
                            fill={theme.accent}
                            stroke={theme.ink}
                            strokeWidth={3}
                        />
                        <text
                            x={1070}
                            y={260}
                            textAnchor="middle"
                            fill="#fffaf2"
                            style={{
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 28,
                                letterSpacing: "0.06em",
                            }}
                        >
                            CANCEL
                        </text>
                    </g>
                </g>
            )}
        </Layer>
    );
}

// ---------------------------------------------------------------- shot: the closing card (line 14)

function Closing() {
    const c = useClock();
    const theme = c.theme;
    const cardIn = c.pop(14);
    const breathe = 1 + 0.02 * c.lin({ line: 14, at: 0 }, { line: 14, at: "next" });
    const n836 = c.span({ line: 14, at: 0 }, { line: 14, at: 0.45 });
    const stamp = c.pop({ line: 14, at: 0.55 });
    const underline = c.span({ line: 14, at: 0.7 }, { line: 14, at: 1 });
    const items = [
        { big: fmt(Math.round(836 * n836)), small: "plans", p: c.pop({ line: 14, at: 0 }) },
        {
            big: "about 12",
            small: "minutes",
            p: c.pop({ line: 14, at: 0.15 }),
        },
        { big: "under 1 s", small: "each", p: stamp },
    ];
    return (
        <Layer>
            <g
                transform={`translate(800 390) scale(${(0.85 + 0.15 * cardIn) * breathe}) rotate(${(1 - cardIn) * -3}) translate(-800 -390)`}
                opacity={clamp01(cardIn * 2)}
            >
                <path
                    d={cutRect(80, 200, 1440, 380, "closing", 3)}
                    fill={theme.paper}
                    filter="url(#ps)"
                />
                {items.map((it, i) => {
                    const x = 340 + i * 460;
                    const scale = i === 2 ? 1 + (1 - Math.min(1, it.p)) * 0.8 : 1;
                    return (
                        <g
                            key={i}
                            opacity={clamp01(it.p * 2)}
                            transform={`translate(${x} 370) scale(${scale}) translate(${-x} -370) translate(0 ${i === 2 ? 0 : (1 - it.p) * 30})`}
                        >
                            <text
                                x={x}
                                y={400}
                                textAnchor="middle"
                                fill={i === 2 ? theme.accent : theme.ink}
                                style={{
                                    fontFamily: "Fraunces",
                                    fontWeight: 600,
                                    fontSize: 86,
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {it.big}
                            </text>
                            <text
                                x={x}
                                y={470}
                                textAnchor="middle"
                                fill={theme.inkSoft}
                                style={{
                                    fontFamily: "IBM Plex Mono",
                                    fontWeight: 500,
                                    fontSize: 34,
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {it.small.toUpperCase()}
                            </text>
                        </g>
                    );
                })}
                {[0, 1].map((i) => (
                    <circle
                        key={i}
                        cx={570 + i * 460}
                        cy={372}
                        r={9}
                        fill={theme.inkSoft}
                        opacity={clamp01(c.pop({ line: 14, at: 0.1 + i * 0.25 }) * 2)}
                    />
                ))}
                {underline > 0 && (
                    <path
                        d="M 1120 500 Q 1260 512 1400 496"
                        stroke={theme.accent}
                        strokeWidth={9}
                        strokeLinecap="round"
                        fill="none"
                        pathLength={1}
                        strokeDasharray="1 3"
                        strokeDashoffset={1 - underline}
                    />
                )}
            </g>
        </Layer>
    );
}

// ---------------------------------------------------------------- the scene

export default function PlanReports() {
    return (
        <Stage>
            <Enlarge>
                <Shot from={0} to={4}>
                    <PlansAndData />
                </Shot>
                <Shot from={5} to={5}>
                    <TimeBar />
                </Shot>
                <Shot from={6} to={7}>
                    <NarrowRead />
                </Shot>
                <Shot from={8} to={8}>
                    <OnePass />
                </Shot>
                <Shot from={9} to={9}>
                    <PrepareOnce />
                </Shot>
                <Shot from={10} to={10}>
                    <NoIndex />
                </Shot>
                <Shot from={11} to={13}>
                    <Job />
                </Shot>
                <Shot from={14}>
                    <Closing />
                </Shot>
                <SlowWay />
            </Enlarge>
        </Stage>
    );
}
