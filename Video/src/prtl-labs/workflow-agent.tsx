import React from "react";
import { Shot, Stage, Tag, useTheme, useType, WriteOn, type Cue } from "../kit";
import {
    Along,
    Burst,
    Card,
    Chip,
    Field,
    Hand,
    House,
    Ink,
    Layer,
    Lever,
    Mover,
    Note,
    Stones,
    Tick,
    Title,
    Tree,
    Wire,
    useAfter,
    useProgress,
    type Point,
} from "./shared/town";

// workflow-agent: one agent house in the town that reads a sentence, asks a language model for a
// plan, and starts the right workflows (paths of stepping stones). Lines are numbered from 0.

export const theme = "prtl-labs";
export const poster: Cue = { line: 9, at: "end" };

const TOOLS = ["create a campaign", "scrape product data", "search web trends", "check a job"];
const LANE_Y = [210, 430, 650];
const LEVER_X = 880;
const STONES_X = 965;
const AGENT: Point = [600, 650];
const AGENT_OUT: Point = [705, 580];

/** One of the three things an agent does, as a paper badge with an icon. */
function Badge(props: { icon: "eye" | "pick" | "hammer"; label: string }) {
    const theme = useTheme();
    const ink = theme.ink;
    const s = {
        fill: "none",
        stroke: ink,
        strokeWidth: 6,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    } as const;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Card seed={`badge-${props.icon}`} w={190} h={190} pad={0} style={{ borderRadius: 0 }}>
                <svg width={190} height={190} viewBox="-50 -50 100 100">
                    {props.icon === "eye" && (
                        <g>
                            <path d="M-36 0 Q0 -30 36 0 Q0 30 -36 0 Z" {...s} />
                            <circle r={11} fill={theme.accent} stroke={ink} strokeWidth={5} />
                        </g>
                    )}
                    {props.icon === "pick" && (
                        <g>
                            <rect
                                x={-30}
                                y={-30}
                                width={30}
                                height={40}
                                rx={3}
                                {...s}
                                transform="rotate(-12)"
                            />
                            <rect
                                x={-2}
                                y={-34}
                                width={30}
                                height={40}
                                rx={3}
                                fill={theme.accent}
                                stroke={ink}
                                strokeWidth={6}
                                transform="rotate(10)"
                            />
                            <path d="M6 30 L14 14" {...s} />
                        </g>
                    )}
                    {props.icon === "hammer" && (
                        <g>
                            <path d="M-26 30 L10 -6" {...s} strokeWidth={9} />
                            <rect
                                x={-4}
                                y={-34}
                                width={44}
                                height={22}
                                rx={4}
                                fill={theme.second}
                                stroke={ink}
                                strokeWidth={5}
                                transform="rotate(45 18 -23)"
                            />
                        </g>
                    )}
                </svg>
            </Card>
            <Ink text={props.label} size={42} mono />
        </div>
    );
}

/** The agent: a house with eyes, the same in every shot. */
function Agent(props: {
    keys: { at: Cue; x?: number; y?: number; s?: number }[];
    rise?: Cue;
    orangeAt?: Cue;
    look?: [number, number];
    litAt?: Cue;
    shakeAt?: Cue;
}) {
    const theme = useTheme();
    const orange =
        useAfter(props.orangeAt ?? { line: 0, delay: 1e5 }) && props.orangeAt !== undefined;
    return (
        <Mover keys={props.keys} anchor="bottom" pop={false}>
            <House
                seed="agent"
                label="agent"
                w={260}
                eyes
                roof={theme.second}
                outline={orange ? theme.accent : undefined}
                rise={props.rise}
                look={props.look}
                litAt={props.litAt}
                shakeAt={props.shakeAt}
                labelSize={36}
            />
        </Mover>
    );
}

/** A small settings form that flaps open by a lever. */
function SettingsForm() {
    const theme = useTheme();
    return (
        <Card seed="settings" w={230} pad={18} color={theme.paper}>
            <Ink text="settings" size={28} mono color={theme.ink} />
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}
                >
                    <div
                        style={{ width: 50, height: 6, background: theme.inkSoft, borderRadius: 3 }}
                    />
                    <div
                        style={{
                            flex: 1,
                            height: 26,
                            border: `3px solid ${theme.ink}`,
                            background: "#fffaf0",
                        }}
                    />
                </div>
            ))}
        </Card>
    );
}

/** Three workflow lanes: a lever and a path of stepping stones each. */
function Lanes(props: {
    from: Cue;
    pulls?: (Cue | undefined)[];
    runs?: (Cue | undefined)[];
    loop?: Cue;
    labels?: (string | undefined)[];
    labelAt?: Cue[];
}) {
    return (
        <>
            {LANE_Y.map((y, i) => (
                <React.Fragment key={i}>
                    <Mover keys={[{ at: props.from, x: LEVER_X, y }]} pop={false}>
                        <Lever seed={`lever-${i}`} pull={props.pulls?.[i]} size={120} />
                    </Mover>
                    <Mover keys={[{ at: props.from, x: STONES_X, y }]} anchor="left" pop={false}>
                        <Stones
                            n={6}
                            gap={110}
                            size={84}
                            seed={`lane-${i}`}
                            run={props.runs?.[i]}
                            over={2.6}
                            pins
                            loop={false}
                        />
                    </Mover>
                    {props.loop !== undefined && <LoopLane y={y} i={i} at={props.loop} />}
                    {props.labels?.[i] && props.labelAt?.[i] !== undefined && (
                        <Mover
                            keys={[{ at: props.labelAt[i], x: STONES_X, y: y - 88 }]}
                            anchor="left"
                        >
                            <Ink text={props.labels[i] as string} size={32} mono />
                        </Mover>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}

function LoopLane(props: { y: number; i: number; at: Cue }) {
    const on = useAfter(props.at);
    if (!on) return null;
    return (
        <div style={{ position: "absolute", left: STONES_X, top: props.y - 42 }}>
            <Stones n={6} gap={110} size={84} seed={`lane-${props.i}`} run={props.at} loop />
        </div>
    );
}

/** The JSON plan with its parts underlined in turn. */
function Under(props: { text: string; at?: Cue }) {
    const theme = useTheme();
    const p = useProgress(props.at ?? { line: 0, delay: 1e5 }, 0.5);
    return (
        <span
            style={{
                position: "relative",
                display: "inline-block",
                color: p > 0 ? theme.ink : undefined,
            }}
        >
            {props.text}
            <span
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: -6,
                    height: 7,
                    width: `${p * 100}%`,
                    background: theme.accent,
                    borderRadius: 3,
                }}
            />
        </span>
    );
}

function PlanBig() {
    const theme = useTheme();
    const type = useType();
    const k = (t: string) => <span style={{ color: theme.second }}>{t}</span>;
    const line = (pad: number, ...parts: React.ReactNode[]) => (
        <div style={{ paddingLeft: pad * 30, whiteSpace: "pre" }}>{parts}</div>
    );
    return (
        <Card seed="plan-big" w={1420} pad={40}>
            <div style={{ ...type.label, fontSize: 33, lineHeight: 1.75, color: theme.inkSoft }}>
                {line(0, "{ ", k('"actions"'), ": [")}
                {line(
                    1,
                    "{ ",
                    k('"tool"'),
                    ": ",
                    <Under key="t" text='"create a campaign"' at={{ line: 7, at: 0.12 }} />,
                    ",",
                )}
                {line(
                    2,
                    k('"settings"'),
                    ": ",
                    <Under
                        key="s"
                        text='{ "platform": "instagram", "media": "image" }'
                        at={{ line: 7, at: 0.42 }}
                    />,
                    ",",
                )}
                {line(
                    2,
                    k('"reason"'),
                    ": ",
                    <Under key="r" text='"wants a campaign"' at={{ line: 7, at: 0.74 }} />,
                    " },",
                )}
                {line(1, "{ ", k('"tool"'), ': "search web trends",')}
                {line(2, k('"reason"'), ': "needs fresh topics" }')}
                {line(0, "] }")}
            </div>
        </Card>
    );
}

function PlanSmall(props: { w?: number; size?: number; rows?: boolean }) {
    const theme = useTheme();
    const type = useType();
    return (
        <Card seed="plan-small" w={props.w ?? 720} pad={28}>
            <div
                style={{
                    ...type.label,
                    fontSize: props.size ?? 30,
                    lineHeight: 1.5,
                    whiteSpace: "pre",
                    color: theme.ink,
                }}
            >
                {
                    '{ "actions": [\n  { "tool": "create a campaign", … },\n  { "tool": "search web trends", … }\n] }'
                }
            </div>
        </Card>
    );
}

/** The messy reply sheet: scribbled ink lines around the plan. */
function Scribbles(props: { y: number; rows: number; w: number }) {
    const theme = useTheme();
    return (
        <svg
            width={props.w}
            height={props.rows * 44}
            style={{ position: "absolute", left: 40, top: props.y }}
        >
            {Array.from({ length: props.rows }, (_, i) => {
                const len = props.w * (0.55 + ((i * 37) % 40) / 100);
                let d = `M 0 ${i * 44 + 20}`;
                for (let x = 0; x < len; x += 26)
                    d += ` q 7 ${(i + x) % 3 === 0 ? -14 : -9} 13 0 t 13 0`;
                return (
                    <path
                        key={i}
                        d={d}
                        stroke={theme.inkSoft}
                        strokeWidth={4}
                        fill="none"
                        strokeLinecap="round"
                    />
                );
            })}
        </svg>
    );
}

/** Paper scissors that cut around a rectangle over a span. */
function Scissors(props: { x: number; y: number; w: number; h: number; at: Cue; over: number }) {
    const theme = useTheme();
    const p = useProgress(props.at, props.over);
    if (p <= 0 || p >= 1) return null;
    const per = 2 * (props.w + props.h);
    let d = p * per;
    let x = props.x;
    let y = props.y;
    let ang = 0;
    if (d < props.w) {
        x += d;
        ang = 0;
    } else if ((d -= props.w) < props.h) {
        x += props.w;
        y += d;
        ang = 90;
    } else if ((d -= props.h) < props.w) {
        x += props.w - d;
        y += props.h;
        ang = 180;
    } else {
        d -= props.w;
        y += props.h - d;
        ang = 270;
    }
    const open = Math.abs(Math.sin(p * 40)) * 18;
    return (
        <svg
            width={120}
            height={120}
            viewBox="-60 -60 120 120"
            style={{
                position: "absolute",
                left: x - 60,
                top: y - 60,
                transform: `rotate(${ang}deg)`,
                overflow: "visible",
            }}
        >
            <g transform={`rotate(${-open})`}>
                <path d="M0 0 L50 -6" stroke={theme.ink} strokeWidth={7} strokeLinecap="round" />
                <circle
                    cx={-20}
                    cy={-14}
                    r={13}
                    fill={theme.accent}
                    stroke={theme.ink}
                    strokeWidth={5}
                />
                <path d="M0 0 L-12 -8" stroke={theme.ink} strokeWidth={6} />
            </g>
            <g transform={`rotate(${open})`}>
                <path d="M0 0 L50 6" stroke={theme.ink} strokeWidth={7} strokeLinecap="round" />
                <circle
                    cx={-20}
                    cy={14}
                    r={13}
                    fill={theme.accent}
                    stroke={theme.ink}
                    strokeWidth={5}
                />
                <path d="M0 0 L-12 8" stroke={theme.ink} strokeWidth={6} />
            </g>
        </svg>
    );
}

/** A little robot head (another agent) or a chat bubble (a Claude client). */
function Caller(props: { kind: "robot" | "chat"; label: string }) {
    const theme = useTheme();
    const ink = theme.ink;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width={122} height={100} viewBox="-55 -45 110 90">
                {props.kind === "robot" ? (
                    <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
                        <path d="M0 -26 V-38" strokeLinecap="round" />
                        <circle cx={0} cy={-40} r={6} fill={theme.accent} />
                        <rect
                            x={-38}
                            y={-26}
                            width={76}
                            height={60}
                            rx={12}
                            fill={theme.paperAlt}
                        />
                        <circle cx={-14} cy={0} r={8} fill={theme.paper} />
                        <circle cx={14} cy={0} r={8} fill={theme.paper} />
                        <path d="M-12 20 H12" strokeLinecap="round" />
                    </g>
                ) : (
                    <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
                        <path d="M-44 -30 H44 V18 H-6 L-24 36 V18 H-44 Z" fill={theme.paper} />
                        <path d="M-28 -12 H28 M-28 2 H14" strokeLinecap="round" />
                    </g>
                )}
            </svg>
            <Ink text={props.label} size={28} mono />
        </div>
    );
}

function McpSocket() {
    const theme = useTheme();
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Tag text="MCP" seed="mcp-tag" size={30} />
            <svg width={90} height={110} viewBox="0 0 90 110">
                <rect
                    x={6}
                    y={6}
                    width={78}
                    height={98}
                    rx={14}
                    fill={theme.paper}
                    stroke={theme.ink}
                    strokeWidth={5}
                />
                {[32, 55, 78].map((y) => (
                    <rect key={y} x={30} y={y - 7} width={30} height={14} rx={4} fill={theme.ink} />
                ))}
            </svg>
        </div>
    );
}

export default function WorkflowAgent() {
    const theme = useTheme();
    const L = (line: number, at: number | "end" | "next" = 0, delay = 0): Cue => ({
        line,
        at,
        delay,
    });
    const lever = (i: number): Point => [LEVER_X - 38, LANE_Y[i] + 45];
    const icons = [
        { icon: "eye" as const, label: "reads", x: 480, y: 170, at: 0.12 },
        { icon: "pick" as const, label: "picks", x: 800, y: 130, at: 0.38 },
        { icon: "hammer" as const, label: "uses", x: 1120, y: 170, at: 0.66 },
    ];
    const chipY = (i: number) => 230 + i * 135;
    return (
        <Stage>
            {/* Lines 0 to 3: the agent, the old way, and the sentence. */}
            <Shot from={0} to={3}>
                <Field>
                    <div style={{ position: "absolute", left: 40, top: 600 }}>
                        <Tree seed="t1" size={100} />
                    </div>
                    <div style={{ position: "absolute", left: 200, top: 650 }}>
                        <Tree seed="t4" size={70} />
                    </div>
                    <Mover
                        keys={[{ at: L(0, 0.1), x: 0, y: 0 }]}
                        anchor="left"
                        pop={false}
                        out={L(1)}
                    >
                        <Tag text="What an agent is" seed="kick-0" size={30} />
                    </Mover>
                    {icons.map((b, i) => (
                        <Mover
                            key={b.icon}
                            keys={[
                                { at: L(0, b.at), x: 800, y: 420, s: 0.3 },
                                { at: L(0, b.at + 0.02), x: b.x, y: b.y + 60, s: 1 },
                                { at: L(0, "end", -0.4 + i * 0.08), x: 800, y: 480, s: 0.2, o: 0 },
                            ]}
                        >
                            <Badge icon={b.icon} label={b.label} />
                        </Mover>
                    ))}
                    <Agent
                        rise={L(0, 0)}
                        keys={[
                            { at: L(0, 0), x: 800, y: 700, s: 1.2 },
                            { at: L(1, 0), x: -300 },
                            { at: L(2, 0), x: AGENT[0], y: AGENT[1], s: 1 },
                        ]}
                        orangeAt={L(2, 0.55)}
                        look={[0.4, -0.3]}
                        litAt={L(3, 0.95)}
                    />
                    {/* The old way: three separate pipelines, each started by hand. */}
                    <Mover
                        keys={[{ at: L(1, 0), x: STONES_X, y: 110 }]}
                        anchor="left"
                        pop={false}
                        out={L(2)}
                    >
                        <Ink text="campaign pipelines, started by hand" size={34} mono />
                    </Mover>
                    <Lanes from={L(1, 0)} pulls={[L(1, 0.3), L(1, 0.58), L(1, 0.86)]} />
                    {LANE_Y.map((y, i) => (
                        <Mover
                            key={i}
                            keys={[{ at: L(1, 0.05 + 0.28 * i), x: 600, y: y + 20, r: -3 }]}
                            out={L(2, 0)}
                        >
                            <SettingsForm />
                        </Mover>
                    ))}
                    <Mover
                        keys={[
                            { at: L(1, 0.02), x: 620, y: 900 },
                            ...LANE_Y.map((y, i) => ({
                                at: L(1, 0.12 + 0.28 * i),
                                x: LEVER_X + 30,
                                y: y + 110,
                            })),
                            { at: L(2, 0), y: 1400 },
                        ]}
                        pop={false}
                    >
                        <Hand size={130} />
                    </Mover>
                    <Layer>
                        {LANE_Y.map((_, i) => (
                            <Wire
                                key={i}
                                a={AGENT_OUT}
                                b={lever(i)}
                                at={L(2, 0.35 + 0.1 * i)}
                                bow={-0.06}
                            />
                        ))}
                    </Layer>
                    {/* Line 3: the sentence. */}
                    <Mover
                        keys={[
                            { at: L(3, 0), x: 640, y: 70 },
                            { at: L(3, 0.84), x: AGENT[0], y: 440, s: 0.12, o: 0.3 },
                        ]}
                        out={L(3, 0.95)}
                    >
                        <Card seed="sentence" w={1220} pad={22} color="#fff8e6" lift={1.5}>
                            <WriteOn
                                text="“Schedule a marketing campaign for the next day”"
                                size={46}
                                over={{ until: L(3, 0.7) }}
                                color={theme.ink}
                            />
                        </Card>
                    </Mover>
                </Field>
            </Shot>

            {/* Lines 4 to 6: inside the agent, then the language model. */}
            <Shot from={4} to={6}>
                <Field>
                    <Mover
                        keys={[
                            { at: L(4, 0), x: 20, y: 380 },
                            { at: L(6, 0.3), o: 0.35 },
                        ]}
                        anchor="left"
                        pop={false}
                    >
                        <Card seed="tray" w={1000} h={700} color={theme.paperAlt} pad={26}>
                            <Tag
                                text="inside the agent"
                                seed="inside"
                                size={30}
                                color={theme.second}
                            />
                        </Card>
                    </Mover>
                    <Mover
                        keys={[
                            { at: L(4, 0.05), x: 270, y: 400 },
                            { at: L(6, 0.12), x: 1270, y: 300, s: 0.1, o: 0 },
                        ]}
                    >
                        <Card seed="sentence-in" w={430} pad={26} color="#fff8e6">
                            <Ink text="“Schedule a marketing" size={38} color={theme.ink} />
                            <Ink text="campaign for the" size={38} color={theme.ink} />
                            <Ink text="next day”" size={38} color={theme.ink} />
                        </Card>
                    </Mover>
                    <Mover
                        keys={[{ at: L(4, 0.25), x: 530, y: 130 }]}
                        anchor="left"
                        out={L(6, 0.1)}
                    >
                        <Ink text="its four tools" size={30} mono color={theme.inkSoft} />
                    </Mover>
                    {TOOLS.map((t, i) => (
                        <ChipAt key={t} text={t} i={i} y={chipY(i)} />
                    ))}
                    <Mover keys={[{ at: L(6, 0), x: 1310, y: 330 }]} anchor="bottom" pop={false}>
                        <House
                            seed="llm"
                            label="language model"
                            sign="spark"
                            w={280}
                            roof={theme.third}
                            rise={L(6, 0)}
                            shakeAt={L(6, 0.42)}
                            litAt={L(6, 0.42)}
                        />
                    </Mover>
                    <Mover keys={[{ at: L(6, 0.05), x: 1310, y: 425 }]}>
                        <Ink text="on Cloudflare" size={32} mono color={theme.inkSoft} />
                    </Mover>
                    <Mover
                        keys={[
                            { at: L(6, 0.55), x: 1310, y: 470, s: 0.5 },
                            { at: L(6, 0.57), y: 590, s: 1 },
                        ]}
                    >
                        <Card seed="json-mini" pad={22}>
                            <Ink text='{ "actions": [ … ] }' size={40} mono color={theme.ink} />
                        </Card>
                    </Mover>
                    <Mover keys={[{ at: L(6, 0.62), x: 1310, y: 700 }]}>
                        <Ink text="a plan in JSON" size={34} mono />
                    </Mover>
                </Field>
            </Shot>

            {/* Line 7: the plan, close up. */}
            <Shot from={7} to={7}>
                <Field>
                    <Mover keys={[{ at: L(7, 0), x: 90, y: 40 }]} anchor="left" pop={false}>
                        <Tag text="the plan" seed="plan-tag" size={30} color={theme.second} />
                    </Mover>
                    <Mover keys={[{ at: L(7, 0), x: 800, y: 420 }]} pop={false}>
                        <PlanBig />
                    </Mover>
                </Field>
            </Shot>

            {/* Line 8: cut the plan out of the reply and check each tool name. */}
            <Shot from={8} to={8}>
                <Field>
                    <Mover
                        keys={[
                            { at: L(8, 0), x: 20, y: 380 },
                            { at: L(8, 0.45), o: 0.25 },
                        ]}
                        anchor="left"
                        pop={false}
                    >
                        <Card seed="reply" w={980} h={700} color="#efe6cf" pad={20}>
                            <Ink text="the model's reply" size={30} mono color={theme.inkSoft} />
                            <Scribbles y={70} rows={3} w={880} />
                            <Scribbles y={540} rows={3} w={880} />
                        </Card>
                    </Mover>
                    <Mover
                        keys={[
                            { at: L(8, 0), x: 510, y: 380 },
                            { at: L(8, 0.45), x: 560, y: 360, s: 1.04 },
                        ]}
                        pop={false}
                    >
                        <PlanSmall />
                    </Mover>
                    <Scissors x={150} y={268} w={720} h={224} at={L(8, 0.02)} over={0.42 * 4.36} />
                    {TOOLS.map((t, i) => (
                        <Mover
                            key={t}
                            keys={[{ at: L(8, 0.4 + i * 0.03), x: 1120, y: 160 + i * 150 }]}
                            anchor="left"
                        >
                            <MatchChip text={t} i={i} />
                        </Mover>
                    ))}
                    <Layer>
                        <Wire
                            a={[1000, 325]}
                            b={[1110, 160]}
                            at={L(8, 0.58)}
                            over={0.3}
                            lit={L(8, 0.62)}
                            width={8}
                            bow={0.1}
                        />
                        <Wire
                            a={[1000, 372]}
                            b={[1110, 460]}
                            at={L(8, 0.76)}
                            over={0.3}
                            lit={L(8, 0.8)}
                            width={8}
                            bow={-0.1}
                        />
                        <Tick x={962} y={318} at={L(8, 0.64)} size={36} />
                        <Tick x={962} y={378} at={L(8, 0.82)} size={36} />
                    </Layer>
                </Field>
            </Shot>

            {/* Lines 9 to 13: the agent starts the workflows, reports back, and becomes the hub. */}
            <Shot from={9}>
                <Field>
                    <Title
                        text="One sentence in, the right workflows out."
                        from={L(9, 0)}
                        to={L(10, 0)}
                    />
                    <Mover keys={[{ at: L(9, 0), x: 560, y: 245 }]} pop={false} out={L(10, 0)}>
                        <Card seed="plan-hang" pad={18}>
                            <Ink text="plan" size={30} mono color={theme.second} />
                            <Ink text="create a campaign" size={34} mono color={theme.ink} />
                            <Ink text="search web trends" size={34} mono color={theme.ink} />
                        </Card>
                    </Mover>
                    <Layer>
                        {LANE_Y.map((_, i) => (
                            <Wire
                                key={i}
                                a={AGENT_OUT}
                                b={lever(i)}
                                at={L(9, 0)}
                                over={0.1}
                                bow={-0.06}
                                flash={i < 2 ? [L(9, 0.05 + i * 0.15)] : []}
                            />
                        ))}
                        <Wire
                            a={[560, 330]}
                            b={[590, 410]}
                            at={L(9, 0)}
                            over={0.1}
                            width={4}
                            hideAt={L(10, 0)}
                        />
                    </Layer>
                    <Lanes
                        from={L(9, 0)}
                        pulls={[L(9, 0.3), L(9, 0.45), undefined]}
                        runs={[L(9, 0.36), L(9, 0.5), undefined]}
                        labels={["create a campaign", "search web trends", undefined]}
                        labelAt={[L(9, 0.3), L(9, 0.45), L(9, 0.45)]}
                        loop={L(13, 0.1)}
                    />
                    <Agent
                        keys={[{ at: L(9, 0), x: AGENT[0], y: AGENT[1] }]}
                        orangeAt={L(9, 0)}
                        look={[0.8, -0.2]}
                    />
                    <Along a={AGENT_OUT} b={lever(0)} at={L(9, 0.05)} over={0.8} bow={-0.06} vanish>
                        <Note seed="row1" text="create a campaign" size={32} />
                    </Along>
                    <Along a={AGENT_OUT} b={lever(1)} at={L(9, 0.2)} over={0.8} bow={-0.06} vanish>
                        <Note seed="row2" text="search web trends" size={32} />
                    </Along>
                    {/* Line 10: the decision trail. */}
                    <Mover
                        keys={[
                            { at: L(10, 0), x: 600, y: 560, s: 0.2 },
                            { at: L(10, 0.02), x: 255, y: 380, s: 1, r: -2 },
                        ]}
                        out={L(11, 0)}
                    >
                        <Receipt />
                    </Mover>
                    {/* Lines 11 and 12: the MCP socket and the callers. */}
                    <Mover keys={[{ at: L(11, 0.05), x: 400, y: 545 }]}>
                        <McpSocket />
                    </Mover>
                    <Mover keys={[{ at: L(11, 0.35), x: 0, y: 735 }]} anchor="left" out={L(12, 0)}>
                        <Ink text="a standard way for AI tools to call each other" size={34} mono />
                    </Mover>
                    <Layer>
                        {[
                            { y: 330, tag: "SSE", at: 0.15 },
                            { y: 490, tag: "HTTP", at: 0.35 },
                            { y: 650, tag: "RPC", at: 0.55 },
                        ].map((c, i) => (
                            <React.Fragment key={c.tag}>
                                <Wire
                                    a={[140, c.y]}
                                    b={[365, 590 + (i - 1) * 26]}
                                    at={L(12, c.at)}
                                    over={0.6}
                                    bow={0.12 * (i - 1)}
                                    width={10}
                                    color={theme.paperAlt}
                                />
                                <Burst
                                    x={365}
                                    y={590 + (i - 1) * 26}
                                    at={L(12, c.at, 0.6)}
                                    r={30}
                                />
                            </React.Fragment>
                        ))}
                        <Wire
                            a={[600, 305]}
                            b={[600, 412]}
                            at={L(13, 0.25)}
                            over={0.4}
                            width={10}
                        />
                    </Layer>
                    {[
                        {
                            y: 330,
                            tag: "SSE",
                            at: 0.15,
                            kind: "robot" as const,
                            label: "other agent",
                        },
                        {
                            y: 490,
                            tag: "HTTP",
                            at: 0.35,
                            kind: "robot" as const,
                            label: "other agent",
                        },
                        {
                            y: 650,
                            tag: "RPC",
                            at: 0.55,
                            kind: "chat" as const,
                            label: "Claude client",
                        },
                    ].map((c, i) => (
                        <React.Fragment key={c.tag}>
                            <Mover keys={[{ at: L(12, c.at), x: 80, y: c.y + 10 }]}>
                                <Caller kind={c.kind} label={c.label} />
                            </Mover>
                            <Mover
                                keys={[
                                    {
                                        at: L(12, c.at + 0.08),
                                        x: 235,
                                        y: (c.y + 590 + (i - 1) * 26) / 2 - 30,
                                    },
                                ]}
                            >
                                <Tag
                                    text={c.tag}
                                    seed={`t-${c.tag}`}
                                    size={28}
                                    color={theme.second}
                                />
                            </Mover>
                        </React.Fragment>
                    ))}
                    {/* Line 13: the new scheduler hands its jobs to it too: one wire, one job. */}
                    <Along a={[600, 300]} b={[600, 420]} at={L(13, 0.45)} over={0.9} bow={0} vanish>
                        <Note seed="sched-job" text="a job" size={30} />
                    </Along>
                    <Mover keys={[{ at: L(13, 0.1), x: 600, y: 240 }]} anchor="bottom" pop={false}>
                        <House
                            seed="scheduler"
                            label="scheduler"
                            sign="clock"
                            w={190}
                            roof={theme.third}
                            rise={L(13, 0.1)}
                            labelSize={32}
                        />
                    </Mover>
                </Field>
            </Shot>
        </Stage>
    );
}

function ChipAt(props: { text: string; i: number; y: number }) {
    const starts = [0.02, 0.27, 0.52, 0.75];
    const L = (line: number, at: number): Cue => ({ line, at });
    const on = useAfter(L(5, starts[props.i]));
    const off = useAfter(props.i < 3 ? L(5, starts[props.i + 1]) : L(5, 0.98));
    const lit = on && !off;
    return (
        <Mover
            keys={[
                { at: L(4, 0.28 + props.i * 0.1), x: 535, y: props.y, r: -4 + props.i * 2 },
                { at: L(6, 0.16 + props.i * 0.03), x: 1270, y: 300, s: 0.1, o: 0 },
            ]}
            anchor="left"
        >
            <Chip text={props.text} lit={lit} size={38} />
        </Mover>
    );
}

function MatchChip(props: { text: string; i: number }) {
    const L = (line: number, at: number): Cue => ({ line, at });
    const at = props.i === 0 ? L(8, 0.62) : props.i === 2 ? L(8, 0.8) : undefined;
    const lit = useAfter(at ?? { line: 0, delay: 1e5 }) && at !== undefined;
    const late = useAfter(L(8, 0.9));
    return <Chip text={props.text} lit={lit} size={34} dim={!lit && late} />;
}

function Receipt() {
    const theme = useTheme();
    const type = useType();
    const row = (t: string, c?: string, it?: boolean) => (
        <div style={{ color: c ?? theme.ink, fontStyle: it ? "italic" : "normal" }}>{t}</div>
    );
    return (
        <Card seed="receipt" w={470} pad={26} color="#fffaf0" lift={1.6}>
            <div style={{ ...type.label, fontSize: 29, lineHeight: 1.45 }}>
                {row("decision trail", theme.second)}
                {row("understood:")}
                {row("a campaign for the next day", theme.inkSoft)}
                {row("create a campaign")}
                {row("  why: wants a campaign", theme.accent)}
                {row("search web trends")}
                {row("  why: needs fresh topics", theme.accent)}
                {row("started: 2 workflows", theme.second)}
            </div>
        </Card>
    );
}
