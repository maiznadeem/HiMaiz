import React from "react";
import { Stage, Tag, useTheme, useType, type Cue } from "../kit";
import {
    Along,
    Bracket,
    Card,
    Cross,
    Field,
    House,
    Ink,
    Layer,
    Mover,
    Pin,
    Stamp,
    Title,
    Wire,
    useAfter,
    useProgress,
    usePulse,
    type Point,
    type Sign,
} from "./shared/town";

// campaign-pipeline: one Cloudflare Workflow drawn as a conveyor belt of ten stations through the
// town. A campaign folder rides it and collects a trend, a post, a photo and a film strip. Outside
// services are the buildings behind the belt. Lines are numbered from 0.

export const theme = "prtl-labs";
export const poster: Cue = { line: 11, at: 0.68 };

const L = (line: number, at: number | "end" | "next" = 0, delay = 0): Cue => ({ line, at, delay });
const SX = (i: number) => 80 + i * 160; // station i (0-based) centre x
const TILE_Y = 600;
const FOLDER_Y = 490;
const HOUSE_Y = 360;
const LABELS = [
    ["check", "request"],
    ["recent", "campaigns"],
    ["local", "trends"],
    ["write", "post"],
    ["image"],
    ["video"],
    ["save per", "store"],
    ["Instagram"],
    ["X"],
    ["record", "results"],
];
/** When each station is done on the first run. */
const DONE: Cue[] = [
    L(2, 0.6),
    L(3, 0.8),
    L(4, 0.8),
    L(5, 0.85),
    L(6, 0.45),
    L(6, 0.88),
    L(7, 0.8),
    L(8, 0.45),
    L(8, 0.85),
    L(9, 0.6),
];

type Service = {
    key: string;
    label: string;
    x: number;
    station: number;
    sign: Sign;
    roof?: "second" | "third" | "accent";
};
const SERVICES: Service[] = [
    { key: "db", label: "database", x: 200, station: 1, sign: "db" },
    { key: "web", label: "web search", x: 400, station: 2, sign: "search", roof: "third" },
    { key: "llm", label: "language model", x: 560, station: 3, sign: "spark", roof: "third" },
    { key: "img", label: "image model", x: 720, station: 4, sign: "camera", roof: "third" },
    { key: "vid", label: "video model", x: 880, station: 5, sign: "film", roof: "third" },
    { key: "ig", label: "Instagram", x: 1200, station: 7, sign: "camera", roof: "accent" },
    { key: "x", label: "X", x: 1360, station: 8, sign: "x", roof: "accent" },
];
const svc = (k: string) => SERVICES.find((s) => s.key === k) as Service;
const HOUSE_TOP = (x: number): Point => [x, HOUSE_Y - 70];
const WIRE_TOP = (x: number): Point => [x, HOUSE_Y + 80];

/** A station tile on the belt: its number, "step" once the belt joins them, orange when done. */
function Station(props: { i: number }) {
    const theme = useTheme();
    const type = useType();
    const i = props.i;
    const stepped = useAfter(L(1, 0.5));
    const done = useAfter(DONE[i]);
    const isRetry = i === 7;
    const redA = useAfter(L(11, 0.12));
    const redB = useAfter(L(11, 0.8));
    const flashRed = usePulse(L(11, 0.37), 0.4);
    const lit = usePulse(L(12, 0.1), 4.2);
    const red = isRetry && ((redA && !redB) || flashRed > 0.3);
    const color = red ? "#d8452f" : done ? theme.accent : theme.paper;
    const ink = done || red ? "#fffaf2" : theme.ink;
    return (
        <div
            style={{
                position: "relative",
                width: 124,
                height: 110,
                transform:
                    isRetry && lit > 0
                        ? `scale(${1 + 0.06 * Math.sin(lit * Math.PI * 6)})`
                        : undefined,
            }}
        >
            <Card seed={`station-${i}`} w={124} h={110} color={color} pad={8} sway={0.4}>
                <div style={{ textAlign: "center", color: ink }}>
                    <div
                        style={{
                            ...type.label,
                            fontSize: 28,
                            height: 32,
                            opacity: stepped ? 1 : 0,
                        }}
                    >
                        step
                    </div>
                    <div style={{ ...type.display, fontSize: 52, lineHeight: 1 }}>{i + 1}</div>
                </div>
            </Card>
            <div
                style={{
                    position: "absolute",
                    top: 118,
                    left: "50%",
                    transform: "translateX(-50%)",
                    textAlign: "center",
                }}
            >
                {LABELS[i].map((t) => (
                    <Ink key={t} text={t} size={28} mono style={{ lineHeight: 1.1 }} />
                ))}
            </div>
        </div>
    );
}

/** Small things the campaign folder collects. */
function Thing(props: { kind: "trend" | "post" | "photo" | "film"; size?: number }) {
    const theme = useTheme();
    const s = props.size ?? 1;
    const ink = theme.ink;
    if (props.kind === "trend")
        return (
            <svg width={60 * s} height={44 * s} viewBox="0 0 60 44">
                <rect
                    x={2}
                    y={2}
                    width={56}
                    height={40}
                    fill="#fff8e6"
                    stroke={ink}
                    strokeWidth={3}
                />
                <path
                    d="M10 30 L22 18 L30 26 L48 10"
                    stroke={theme.accent}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        );
    if (props.kind === "post")
        return (
            <svg width={60 * s} height={46 * s} viewBox="0 0 60 46">
                <path
                    d="M2 2 H58 V32 H22 L10 44 V32 H2 Z"
                    fill={theme.paper}
                    stroke={ink}
                    strokeWidth={3}
                    strokeLinejoin="round"
                />
                <path
                    d="M10 12 H50 M10 22 H40"
                    stroke={ink}
                    strokeWidth={3}
                    strokeLinecap="round"
                />
            </svg>
        );
    if (props.kind === "photo")
        return (
            <svg width={56 * s} height={48 * s} viewBox="0 0 56 48">
                <rect
                    x={2}
                    y={2}
                    width={52}
                    height={44}
                    fill="#fffaf0"
                    stroke={ink}
                    strokeWidth={3}
                />
                <rect x={8} y={8} width={40} height={28} fill={theme.second} />
                <path d="M8 36 L20 22 L30 32 L38 24 L48 36 Z" fill={theme.third} />
                <circle cx={38} cy={15} r={4} fill={theme.accent} />
            </svg>
        );
    return (
        <svg width={70 * s} height={40 * s} viewBox="0 0 70 40">
            <rect x={2} y={2} width={66} height={36} fill="#3b3326" stroke={ink} strokeWidth={3} />
            {[8, 22, 36, 50].map((x) => (
                <rect key={x} x={x} y={10} width={12} height={20} fill={theme.paperAlt} />
            ))}
            {[6, 18, 30, 42, 54, 64].map((x) => (
                <rect key={x} x={x - 2} y={4} width={4} height={3} fill={theme.paper} />
            ))}
        </svg>
    );
}

/** The campaign folder, holding whatever it has collected by now. */
function Folder(props: {
    items?: ("trend" | "post" | "photo" | "film")[];
    full?: boolean;
    label?: string;
}) {
    const theme = useTheme();
    const hasTrend = useAfter(DONE[2]);
    const hasPost = useAfter(DONE[3]);
    const hasPhoto = useAfter(DONE[4]);
    const hasFilm = useAfter(DONE[5]);
    const items =
        props.items ??
        (props.full
            ? ["trend", "post", "photo", "film"]
            : [
                  hasTrend && "trend",
                  hasPost && "post",
                  hasPhoto && "photo",
                  hasFilm && "film",
              ].filter(Boolean));
    return (
        <div style={{ position: "relative", width: 130, height: 96 }}>
            <div style={{ position: "absolute", left: 12, top: 0, display: "flex", gap: 0 }}>
                {(items as string[]).map((k, i) => (
                    <div
                        key={k}
                        style={{
                            transform: `translateY(${4 + (i % 2) * 6}px) rotate(${(i - 1.5) * 8}deg)`,
                            marginLeft: i ? -14 : 0,
                        }}
                    >
                        <Thing kind={k as "trend"} size={0.75} />
                    </div>
                ))}
            </div>
            <svg
                width={130}
                height={86}
                viewBox="0 0 130 86"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 18,
                    filter: "drop-shadow(5px 5px 1px rgba(60,40,15,0.35))",
                }}
            >
                <path
                    d="M4 14 H44 L52 4 H86 L92 14 H126 V82 H4 Z"
                    fill="#e9b864"
                    stroke={theme.ink}
                    strokeWidth={4}
                    strokeLinejoin="round"
                />
                <path d="M4 28 H126" stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
                {props.label && (
                    <text
                        x={65}
                        y={64}
                        textAnchor="middle"
                        fontFamily="IBM Plex Mono"
                        fontWeight={500}
                        fontSize={28}
                        fill={theme.ink}
                    >
                        {props.label}
                    </text>
                )}
            </svg>
        </div>
    );
}

/** The question mark that wobbles over a service that can fail. */
function Doubt() {
    const theme = useTheme();
    return <Ink text="?" size={56} color={theme.accent} italic weight={600} />;
}

function Checklist() {
    const theme = useTheme();
    return (
        <Card seed="checklist" w={160} pad={16} color="#fffaf0">
            {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                    <div style={{ width: 20, height: 20, border: `3px solid ${theme.ink}` }} />
                    <div
                        style={{ flex: 1, height: 5, background: theme.inkSoft, borderRadius: 3 }}
                    />
                </div>
            ))}
        </Card>
    );
}

function Hourglass(props: { at: Cue; seconds: number; width: number; label: string }) {
    const theme = useTheme();
    const p = useProgress(props.at, props.seconds);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Ink text={props.label} size={30} mono color="#d8452f" />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width={30} height={40} viewBox="0 0 30 40">
                    <path
                        d="M3 2 H27 L15 20 L27 38 H3 L15 20 Z"
                        fill={theme.paper}
                        stroke={theme.ink}
                        strokeWidth={3}
                        strokeLinejoin="round"
                    />
                    <path
                        d={`M${8 + 7 * p} ${6 + 10 * p} H${22 - 7 * p} L15 18 Z`}
                        fill={theme.accent}
                    />
                    <path
                        d={`M15 ${36 - 12 * p} L${15 + 9 * p} 36 H${15 - 9 * p} Z`}
                        fill={theme.accent}
                    />
                </svg>
                <div
                    style={{
                        width: props.width,
                        height: 16,
                        border: `3px solid ${theme.ink}`,
                        background: theme.paper,
                    }}
                >
                    <div
                        style={{ width: `${p * 100}%`, height: "100%", background: theme.accent }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function CampaignPipeline() {
    const theme = useTheme();
    const sandbox = useAfter(L(14, 0));
    const afterSandbox = useAfter(L(15, 0));
    const roofs = { second: theme.second, third: theme.third, accent: theme.accent };
    const foldersToDb = [0, 1, 2];
    return (
        <Stage>
            <Field>
                {/* Line 1: the belt slides in under the tiles. */}
                <Mover
                    keys={[
                        { at: L(1, 0), x: -1700, y: TILE_Y + 10 },
                        { at: L(1, 0.02), x: 0 },
                    ]}
                    anchor="left"
                    pop={false}
                >
                    <svg
                        width={1600}
                        height={80}
                        viewBox="0 0 1600 80"
                        style={{
                            display: "block",
                            filter: "drop-shadow(5px 6px 1px rgba(60,40,15,0.3))",
                        }}
                    >
                        <rect
                            x={0}
                            y={8}
                            width={1600}
                            height={60}
                            rx={30}
                            fill={theme.paperAlt}
                            stroke={theme.ink}
                            strokeWidth={4}
                        />
                        {Array.from({ length: 20 }, (_, k) => (
                            <circle
                                key={k}
                                cx={40 + k * 80}
                                cy={38}
                                r={12}
                                fill={theme.paper}
                                stroke={theme.ink}
                                strokeWidth={3}
                            />
                        ))}
                    </svg>
                </Mover>
                <HideAfter at={L(2, 0)}>
                    <Bracket
                        x1={20}
                        x2={1580}
                        y={200}
                        at={L(1, 0.3)}
                        label="one Cloudflare Workflow"
                        size={36}
                    />
                </HideAfter>

                {/* Wires from stations to the outside services. */}
                <Layer>
                    {SERVICES.map((s) => (
                        <ServiceWire key={s.key} s={s} sandbox={sandbox && !afterSandbox} />
                    ))}
                </Layer>

                {/* The outside services, behind the belt. */}
                {SERVICES.map((s, i) => (
                    <React.Fragment key={s.key}>
                        <Mover
                            keys={[{ at: L(0, 0.15 + i * 0.05), x: s.x, y: HOUSE_Y }]}
                            anchor="bottom"
                            pop={false}
                        >
                            <House
                                seed={`svc-${s.key}`}
                                label={undefined}
                                sign={s.sign}
                                w={150}
                                roof={roofs[s.roof ?? "second"]}
                                rise={L(0, 0.15 + i * 0.05)}
                                litAt={
                                    s.key === "ig"
                                        ? L(8, 0.35)
                                        : s.key === "x"
                                          ? L(8, 0.8)
                                          : undefined
                                }
                                shakeAt={s.key === "ig" ? L(11, 0.12) : undefined}
                            />
                        </Mover>
                        <Mover
                            keys={[{ at: L(0, 0.2 + i * 0.05), x: s.x, y: HOUSE_Y + 8 }]}
                            anchor="left"
                            pop={false}
                            style={{ transform: "translateX(-50%)" }}
                        >
                            <div style={{ textAlign: "center" }}>
                                {(s.label.includes(" ") ? s.label.split(" ") : [s.label]).map(
                                    (t) => (
                                        <Ink
                                            key={t}
                                            text={t}
                                            size={28}
                                            mono
                                            style={{ lineHeight: 1.05 }}
                                        />
                                    ),
                                )}
                            </div>
                        </Mover>
                        <Mover
                            keys={[{ at: L(0, 0.55 + i * 0.04), x: s.x + 78, y: HOUSE_Y - 150 }]}
                            out={L(1, 0.2)}
                            sway={`doubt-${i}`}
                        >
                            <Doubt />
                        </Mover>
                    </React.Fragment>
                ))}

                {/* The ten stations. */}
                {Array.from({ length: 10 }, (_, i) => (
                    <Mover
                        key={i}
                        keys={[
                            { at: L(0, 0.02 + i * 0.03), x: SX(i), y: -200 },
                            { at: L(0, 0.03 + i * 0.03), y: TILE_Y },
                        ]}
                        pop={false}
                    >
                        <Station i={i} />
                    </Mover>
                ))}
                {/* Line 10: every finished step saves its result. */}
                {Array.from({ length: 10 }, (_, i) => (
                    <Mover
                        key={`pin-${i}`}
                        keys={[{ at: L(10, 0.05 + i * 0.075), x: SX(i) + 42, y: TILE_Y - 52 }]}
                        pop={false}
                    >
                        <Pin at={L(10, 0.05 + i * 0.075)} color={theme.second} />
                    </Mover>
                ))}
                <Mover
                    keys={[{ at: L(10, 0.1), x: SX(0) - 50, y: 150 }]}
                    anchor="left"
                    out={L(11, 0)}
                >
                    <Ink text="each pin: a saved result" size={34} mono />
                </Mover>
                <Mover
                    keys={[{ at: L(5, 0.3), x: SX(3) + 46, y: TILE_Y - 46, r: 8 }]}
                    out={L(14, 0)}
                >
                    <Tag text="mine" seed="mine" size={28} />
                </Mover>

                {/* Line 2: step one checks the request. */}
                <Mover keys={[{ at: L(2, 0.05), x: SX(0) + 40, y: 120, r: -4 }]} out={L(3, 0)}>
                    <Checklist />
                </Mover>
                <Layer>
                    {[0, 1, 2].map((k) => (
                        <TickAt
                            key={k}
                            x={SX(0) - 20}
                            y={82 + k * 34}
                            at={L(2, 0.3 + k * 0.1)}
                            until={L(3, 0)}
                        />
                    ))}
                </Layer>

                {/* Line 3: recent campaigns from the database, one crossed out. */}
                {[0, 1, 2].map((k) => (
                    <Mover
                        key={k}
                        keys={[
                            { at: L(3, 0.05 + k * 0.08), x: svc("db").x, y: 260, s: 0.3 },
                            {
                                at: L(3, 0.06 + k * 0.08),
                                x: 70 + k * 130,
                                y: 110,
                                s: 1,
                                r: -6 + k * 6,
                            },
                        ]}
                        out={L(4, 0)}
                    >
                        <Card seed={`past-${k}`} w={110} h={120} pad={12} color="#fffaf0">
                            <Ink text="past" size={28} mono color={theme.inkSoft} />
                            <div
                                style={{
                                    height: 5,
                                    background: theme.inkSoft,
                                    margin: "14px 0 10px",
                                    borderRadius: 3,
                                }}
                            />
                            <div
                                style={{
                                    height: 5,
                                    width: "70%",
                                    background: theme.inkSoft,
                                    borderRadius: 3,
                                }}
                            />
                        </Card>
                    </Mover>
                ))}
                <Layer>
                    <CrossUntil x={330} y={60} w={100} h={110} at={L(3, 0.5)} until={L(4, 0)} />
                </Layer>
                <Mover keys={[{ at: L(3, 0.55), x: 560, y: 110 }]} pop={false} out={L(4, 0)}>
                    <Stamp text="no repeats" at={L(3, 0.55)} size={34} />
                </Mover>

                {/* Line 4: the web search comes back with a trend. */}
                <Mover
                    keys={[
                        { at: L(4, 0.3), x: svc("web").x, y: 250, s: 0.3 },
                        { at: L(4, 0.31), x: 400, y: 100, s: 1 },
                        { at: L(4, 0.78), x: SX(2), y: FOLDER_Y, s: 0.15, o: 0 },
                    ]}
                >
                    <TrendCard />
                </Mover>

                {/* Line 5: a topical post, not a sales pitch. */}
                <Mover keys={[{ at: L(5, 0.08), x: 300, y: 95, r: -3 }]} out={L(6, 0)}>
                    <Bubble text="20% OFF TODAY!!" loud />
                </Mover>
                <Layer>
                    <CrossUntil x={130} y={45} w={340} h={100} at={L(5, 0.4)} until={L(6, 0)} />
                </Layer>
                <Mover
                    keys={[
                        { at: L(5, 0.3), x: 880, y: 95, r: 2 },
                        { at: L(5, 0.8), x: SX(3), y: FOLDER_Y, s: 0.12, o: 0 },
                    ]}
                >
                    <Bubble text="Street fair this weekend. We'll be the ones with the good playlist." />
                </Mover>

                {/* Line 6: an image and a short video, stored. */}
                <Mover
                    keys={[
                        { at: L(6, 0.1), x: svc("img").x, y: 240, s: 0.3 },
                        { at: L(6, 0.11), x: 640, y: 100, s: 2 },
                        { at: L(6, 0.4), x: SX(4), y: FOLDER_Y, s: 0.3, o: 0 },
                    ]}
                >
                    <Thing kind="photo" />
                </Mover>
                <Mover
                    keys={[
                        { at: L(6, 0.5), x: svc("vid").x, y: 240, s: 0.3 },
                        { at: L(6, 0.51), x: 960, y: 100, s: 2 },
                        { at: L(6, 0.82), x: SX(5), y: FOLDER_Y, s: 0.3, o: 0 },
                    ]}
                >
                    <Thing kind="film" />
                </Mover>
                <Mover keys={[{ at: L(6, 0.25), x: 760, y: 105 }]} anchor="left" out={L(7, 0)}>
                    <Pin at={L(6, 0.25)} text="stored" size={30} />
                </Mover>
                <Mover keys={[{ at: L(6, 0.66), x: 1080, y: 105 }]} anchor="left" out={L(7, 0)}>
                    <Pin at={L(6, 0.66)} text="stored" size={30} />
                </Mover>

                {/* Line 7: one campaign for each store, into the database. */}
                {foldersToDb.map((k) => (
                    <Mover
                        key={k}
                        keys={[
                            { at: L(7, 0.1), x: SX(6), y: FOLDER_Y, s: 0.8 },
                            { at: L(7, 0.12 + k * 0.05), x: 880 + k * 160, y: 110, s: 0.9 },
                            {
                                at: L(7, 0.62 + k * 0.06),
                                x: svc("db").x - 40 + k * 40,
                                y: 250,
                                s: 0.45,
                            },
                        ]}
                        out={L(8, 0)}
                    >
                        <Folder full label="store" />
                    </Mover>
                ))}

                {/* Lines 8 and 9: post to Instagram (Reels included) and X, then record where it went. */}
                <Along
                    a={[SX(7), FOLDER_Y]}
                    b={HOUSE_TOP(svc("ig").x)}
                    at={L(8, 0.1)}
                    over={0.7}
                    bow={0.2}
                    hideAfter={L(8, 0.5)}
                >
                    <div style={{ display: "flex", gap: 6 }}>
                        <Thing kind="post" />
                        <Thing kind="photo" />
                    </div>
                </Along>
                <Along
                    a={[SX(7), FOLDER_Y]}
                    b={HOUSE_TOP(svc("ig").x)}
                    at={L(8, 0.2)}
                    over={0.7}
                    bow={-0.2}
                    hideAfter={L(8, 0.55)}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <Thing kind="film" />
                        <Tag text="Reels" seed="reels" size={28} color={theme.second} />
                    </div>
                </Along>
                <Mover keys={[{ at: L(8, 0.3), x: svc("ig").x, y: 110 }]} out={L(9, 0.05)}>
                    <Tag text="Reels" seed="reels-2" size={30} color={theme.second} />
                </Mover>
                <Along
                    a={[SX(8), FOLDER_Y]}
                    b={HOUSE_TOP(svc("x").x)}
                    at={L(8, 0.55)}
                    over={0.7}
                    bow={0.2}
                    hideAfter={L(8, 0.95)}
                >
                    <Thing kind="post" />
                </Along>
                <PostedTag x={svc("ig").x} at={L(9, 0.05)} />
                <PostedTag x={svc("x").x} at={L(9, 0.15)} />
                {/* receipts fly back to the database */}
                <Along
                    a={HOUSE_TOP(svc("ig").x)}
                    b={[svc("db").x, 250]}
                    at={L(9, 0.1)}
                    over={1.1}
                    bow={0.12}
                    hideAfter={L(10, 0)}
                >
                    <Receipt />
                </Along>
                <Along
                    a={HOUSE_TOP(svc("x").x)}
                    b={[svc("db").x + 30, 270]}
                    at={L(9, 0.2)}
                    over={1.1}
                    bow={0.12}
                    hideAfter={L(10, 0)}
                >
                    <Receipt />
                </Along>

                {/* The campaign folder riding the belt, first run. */}
                <Mover
                    keys={[
                        { at: L(2, 0), x: SX(0), y: 100, s: 1 },
                        { at: L(2, 0.01), y: FOLDER_Y },
                        { at: L(3, 0), x: SX(1) },
                        { at: L(4, 0), x: SX(2) },
                        { at: L(5, 0), x: SX(3) },
                        { at: L(6, 0), x: SX(4) },
                        { at: L(6, 0.5), x: SX(5) },
                        { at: L(7, 0), x: SX(6) },
                        { at: L(8, 0), x: SX(7) },
                        { at: L(8, 0.5), x: SX(8) },
                        { at: L(9, 0), x: SX(9) },
                    ]}
                    pop={false}
                    out={L(10, 0)}
                    z={5}
                >
                    <Folder />
                </Mover>

                {/* Line 11: run again; Instagram fails, the step retries on its own. */}
                <Mover
                    keys={[
                        { at: L(11, 0), x: SX(0), y: FOLDER_Y },
                        { at: L(11, 0.03), x: SX(3) },
                        { at: L(11, 0.06), x: SX(6) },
                        { at: L(11, 0.09), x: SX(7) },
                    ]}
                    pop={false}
                    out={L(14, 0)}
                    z={5}
                >
                    <Folder full />
                </Mover>
                <Title
                    text="Ten steps from a local trend to a posted campaign."
                    from={L(11, 0)}
                    to={L(13, 0)}
                />
                <Mover
                    keys={[{ at: L(11, 0.2), x: 960, y: 135 }]}
                    anchor="left"
                    out={L(13, 0)}
                    pop={false}
                >
                    <div style={{ display: "flex", flexDirection: "row", gap: 44 }}>
                        <Hourglass at={L(11, 0.2)} seconds={0.8} width={70} label="retry 1" />
                        <ShowFrom at={L(11, 0.42)}>
                            <Hourglass
                                at={L(11, 0.42)}
                                seconds={1.9}
                                width={200}
                                label="retry 2: longer wait"
                            />
                        </ShowFrom>
                    </div>
                </Mover>

                <Mover keys={[{ at: L(11, 0.45), x: 530, y: 150 }]} anchor="left" out={L(13, 0)}>
                    <Ink text="at most 2 for this step" size={30} mono color="#d8452f" />
                </Mover>

                {/* Line 12: only that step runs again. */}
                <HideAfter at={L(13, 0)}>
                    <Bracket x1={10} x2={1090} y={505} at={L(12, 0.1)} label="kept" size={34} />
                </HideAfter>

                {/* Line 13: nothing made twice. */}
                {(["trend", "post", "photo", "film"] as const).map((k, n) => (
                    <Mover
                        key={k}
                        keys={[
                            { at: L(13, 0.05 + n * 0.08), x: SX(2 + n), y: TILE_Y, s: 0.5 },
                            { at: L(13, 0.06 + n * 0.08), x: 260 + n * 290, y: 110, s: 1.4 },
                            { at: L(13, 0.86), x: SX(2 + n), y: TILE_Y, s: 0.4, o: 0 },
                        ]}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Thing kind={k} />
                            <div style={{ marginTop: -10 }}>
                                <Stamp
                                    text="not again"
                                    at={L(13, 0.18 + n * 0.08)}
                                    size={26}
                                    rot={-10 + n * 5}
                                />
                            </div>
                        </div>
                    </Mover>
                ))}

                {/* Line 14: sandbox mode. */}
                <Mover
                    keys={[{ at: L(14, 0), x: 0, y: TILE_Y + 45, o: 1 }]}
                    anchor="left"
                    out={L(15, 0)}
                    pop={false}
                >
                    <div
                        style={{
                            width: 1600,
                            height: 225,
                            background: "rgba(45, 75, 125, 0.18)",
                            border: `5px dashed ${theme.second}`,
                            borderRadius: 18,
                        }}
                    />
                </Mover>
                <Mover keys={[{ at: L(14, 0.02), x: 0, y: 40 }]} anchor="left" out={L(15, 0)}>
                    <Tag
                        text="sandbox mode: for testing"
                        seed="sandbox"
                        size={34}
                        color={theme.second}
                    />
                </Mover>
                <Layer>
                    <JumpArrow at={L(14, 0.15)} until={L(15, 0)} />
                </Layer>
                <Mover
                    keys={[
                        { at: L(14, 0.12), x: SX(0), y: FOLDER_Y - 40, s: 0.9 },
                        { at: L(14, 0.25), x: SX(4), y: FOLDER_Y },
                        { at: L(14, 0.45), x: SX(5) },
                        { at: L(14, 0.62), x: SX(7) },
                        { at: L(14, 0.78), x: SX(8) },
                    ]}
                    out={L(15, 0)}
                    z={5}
                >
                    <Folder items={["photo", "film"]} label="test" />
                </Mover>
                <TestTag x={svc("ig").x} at={L(14, 0.66)} />
                <TestTag x={svc("x").x} at={L(14, 0.82)} />

                {/* Line 15: what I reworked. */}
                <Bracket
                    x1={SX(2) - 70}
                    x2={SX(8) + 70}
                    y={205}
                    at={L(15, 0.1)}
                    label="reworked by me"
                    color={theme.accent}
                    size={38}
                />
                <Mover keys={[{ at: L(15, 0.3), x: SX(9), y: 440 }]}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Thing kind="post" size={1.5} />
                        <Thing kind="film" size={1.4} />
                    </div>
                </Mover>
                <Mover keys={[{ at: L(15, 0.3), x: SX(3) + 46, y: TILE_Y - 46, r: 8 }]} pop={false}>
                    <Tag text="mine" seed="mine" size={28} />
                </Mover>
            </Field>
        </Stage>
    );
}

function HideAfter(props: { at: Cue; children: React.ReactNode }) {
    return useAfter(props.at) ? null : <>{props.children}</>;
}

function ShowFrom(props: { at: Cue; children: React.ReactNode }) {
    return useAfter(props.at) ? <>{props.children}</> : null;
}

function TickAt(props: { x: number; y: number; at: Cue; until: Cue }) {
    const theme = useTheme();
    const p = useProgress(props.at, 0.3);
    const gone = useAfter(props.until);
    if (p <= 0 || gone) return null;
    const { x, y } = props;
    return (
        <path
            d={`M ${x - 12} ${y} L ${x - 2} ${y + 10} L ${x + 16} ${y - 12}`}
            stroke={theme.accent}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
        />
    );
}

function CrossUntil(props: { x: number; y: number; w: number; h: number; at: Cue; until: Cue }) {
    const gone = useAfter(props.until);
    if (gone) return null;
    return <Cross x={props.x} y={props.y} w={props.w} h={props.h} at={props.at} />;
}

function ServiceWire(props: { s: Service; sandbox: boolean }) {
    const theme = useTheme();
    const s = props.s;
    const a: Point = [SX(s.station), TILE_Y - 58];
    const b = WIRE_TOP(s.x);
    const usedAt: Record<string, Cue[]> = {
        db: [L(3, 0.05), L(7, 0.55)],
        web: [L(4, 0.1)],
        llm: [L(5, 0.1)],
        img: [L(6, 0.05)],
        vid: [L(6, 0.48)],
        ig: [L(8, 0.08), L(11, 0.8)],
        x: [L(8, 0.52)],
    };
    const dashed = props.sandbox && (s.key === "ig" || s.key === "x");
    return (
        <Wire
            a={a}
            b={b}
            at={L(0, "end", -0.3)}
            over={0.5}
            bow={0}
            width={9}
            flash={usedAt[s.key]}
            dashed={dashed}
            color={theme.paper}
            snap={s.key === "ig" ? { at: L(11, 0.12), until: L(11, 0.8) } : undefined}
        />
    );
}

function TrendCard() {
    const theme = useTheme();
    return (
        <Card seed="trend" pad={18} color="#fff8e6" lift={1.4}>
            <Ink text="local trend" size={28} mono color={theme.second} />
            <Ink text="Street fair this weekend" size={36} color={theme.ink} />
        </Card>
    );
}

function Bubble(props: { text: string; loud?: boolean }) {
    const theme = useTheme();
    const type = useType();
    return (
        <div style={{ position: "relative" }}>
            <Card
                seed={`bubble-${props.loud ? "loud" : "calm"}`}
                w={props.loud ? 360 : 560}
                pad={20}
                color={props.loud ? theme.paperAlt : "#fffaf0"}
                lift={1.3}
            >
                <div
                    style={
                        props.loud
                            ? {
                                  ...type.label,
                                  fontSize: 40,
                                  fontWeight: 500,
                                  letterSpacing: "0.04em",
                                  color: theme.ink,
                              }
                            : { ...type.body, fontSize: 34, color: theme.ink, lineHeight: 1.2 }
                    }
                >
                    {props.text}
                </div>
            </Card>
            <svg width={40} height={30} style={{ position: "absolute", left: 40, bottom: -24 }}>
                <path
                    d="M0 0 L14 26 L30 0 Z"
                    fill={props.loud ? theme.paperAlt : "#fffaf0"}
                    stroke={theme.ink}
                    strokeWidth={0}
                />
            </svg>
        </div>
    );
}

function Receipt() {
    const theme = useTheme();
    return (
        <Card seed="posted-receipt" pad={10} color="#fffaf0">
            <Ink text="posted" size={28} mono color={theme.ink} />
        </Card>
    );
}

function PostedTag(props: { x: number; at: Cue }) {
    const theme = useTheme();
    const sandbox = useAfter(L(14, 0));
    return (
        <Mover
            keys={[{ at: props.at, x: props.x, y: props.x > 1300 ? 60 : 130 }]}
            out={sandbox ? L(14, 0) : L(10, 0)}
        >
            <Tag text="posted" seed={`posted-${props.x}`} size={28} color={theme.third} />
        </Mover>
    );
}

function TestTag(props: { x: number; at: Cue }) {
    const theme = useTheme();
    return (
        <Mover keys={[{ at: props.at, x: props.x, y: props.x > 1300 ? 60 : 130 }]} out={L(15, 0)}>
            <Tag text="test only" seed={`test-${props.x}`} size={28} color={theme.second} />
        </Mover>
    );
}

function JumpArrow(props: { at: Cue; until: Cue }) {
    const theme = useTheme();
    const p = useProgress(props.at, 0.6);
    const gone = useAfter(props.until);
    if (p <= 0 || gone) return null;
    const a: Point = [SX(0), FOLDER_Y - 70];
    const b: Point = [SX(4) - 40, FOLDER_Y - 60];
    const c: Point = [(a[0] + b[0]) / 2, 300];
    return (
        <g>
            <path
                d={`M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`}
                stroke={theme.second}
                strokeWidth={7}
                fill="none"
                strokeDasharray="18 14"
                strokeLinecap="round"
                opacity={p}
            />
            {p > 0.9 && (
                <path
                    d={`M ${b[0] - 26} ${b[1] - 16} L ${b[0]} ${b[1]} L ${b[0] - 6} ${b[1] - 30}`}
                    stroke={theme.second}
                    strokeWidth={7}
                    fill="none"
                    strokeLinecap="round"
                />
            )}
        </g>
    );
}
