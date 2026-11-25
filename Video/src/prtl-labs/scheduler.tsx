import React from "react";
import { Shot, Stage, Tag, useTheme, useType, WriteOn, type Cue } from "../kit";
import {
    Along,
    Burst,
    Card,
    Clock,
    Cross,
    Field,
    House,
    Ink,
    Layer,
    Mover,
    Note,
    Stamp,
    Tick,
    Title,
    Wire,
    useAfter,
    useProgress,
    usePulse,
    type Point,
} from "./shared/town";
import { useFrame, useTimeline, cueFrame } from "../kit/timing";

// scheduler: from a key-value list swept by a cron job every minute, to one Durable Object per task,
// each a paper box with its own storage and its one alarm clock. Lines are numbered from 0.

export const theme = "prtl-labs";
export const poster: Cue = { line: 10, at: "end" };

const L = (line: number, at: number | "end" | "next" = 0, delay = 0): Cue => ({ line, at, delay });

/** 0..1: how open a lid is, from open/close cue pairs. */
function useOpen(spans: [Cue, Cue][]): number {
    const frame = useFrame();
    const timeline = useTimeline();
    let v = 0;
    for (const [a, b] of spans) {
        const fa = cueFrame(timeline, a);
        const fb = cueFrame(timeline, b);
        const len = 0.35 * timeline.fps;
        if (frame >= fa && frame < fb) v = Math.max(v, Math.min(1, (frame - fa) / len));
        else if (frame >= fb && frame < fb + len) v = Math.max(v, 1 - (frame - fb) / len);
    }
    return v;
}

/**
 * A Durable Object: a paper box (the program) with a lid over its shelf (its own storage) and one
 * alarm clock on top. `items` are the paper tags stored on the shelf, seen while the lid is open.
 */
function DOBox(props: {
    w?: number;
    name?: string;
    nameAt?: Cue;
    nameFall?: Cue;
    hours: number;
    blank?: boolean;
    single?: boolean;
    ringAt?: Cue[];
    jam?: boolean;
    open?: number;
    items?: number;
    orange?: boolean;
    clockAt?: Cue;
    dim?: boolean;
}) {
    const theme = useTheme();
    const type = useType();
    const w = props.w ?? 240;
    const s = w / 240;
    const open = props.open ?? 0;
    const showName = useAfter(props.nameAt ?? L(0, 0, 1e5)) && props.nameAt !== undefined;
    const fallen = useProgress(props.nameFall ?? L(0, 0, 1e5), 0.6);
    const clockIn = useProgress(props.clockAt ?? L(0, 0, -1), 0.4);
    const outline = props.orange ? theme.accent : theme.ink;
    return (
        <div
            style={{
                position: "relative",
                width: w,
                height: 250 * s,
                opacity: props.dim ? 0.45 : 1,
            }}
        >
            <svg
                width={w}
                height={250 * s}
                viewBox="0 0 240 250"
                style={{
                    overflow: "visible",
                    filter: "drop-shadow(6px 6px 1.5px rgba(60,40,15,0.35))",
                }}
            >
                {/* the shelf inside, seen when the lid lifts */}
                <rect x={14} y={112} width={146} height={22} fill="#3b3326" />
                {open > 0.3 &&
                    Array.from({ length: props.items ?? 0 }, (_, k) => (
                        <rect
                            key={k}
                            x={26 + k * 42}
                            y={88 - (k % 2) * 6}
                            width={34}
                            height={32}
                            fill={[theme.paper, "#fff8e6", theme.paperAlt][k % 3]}
                            stroke={theme.ink}
                            strokeWidth={3}
                            transform={`rotate(${(k - 1) * 7} ${43 + k * 42} 110)`}
                        />
                    ))}
                <rect
                    x={8}
                    y={114}
                    width={224}
                    height={130}
                    rx={6}
                    fill={theme.paper}
                    stroke={outline}
                    strokeWidth={props.orange ? 7 : 5}
                />
                <path d="M8 140 H232" stroke="rgba(0,0,0,0.18)" strokeWidth={4} />
                {/* the lid, hinged at its left end */}
                <g transform={`rotate(${-62 * open} 8 114)`}>
                    <rect
                        x={4}
                        y={96}
                        width={160}
                        height={20}
                        rx={4}
                        fill={theme.paperAlt}
                        stroke={outline}
                        strokeWidth={props.orange ? 6 : 4.5}
                    />
                    <rect x={70} y={90} width={28} height={8} rx={3} fill={theme.ink} />
                </g>
                {/* the stand for the clock */}
                <rect
                    x={180}
                    y={100}
                    width={14}
                    height={16}
                    fill={theme.paperAlt}
                    stroke={theme.ink}
                    strokeWidth={3}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 128 * s,
                    top: (-14 - (1 - clockIn) * 80) * s,
                    opacity: clockIn,
                    transform: `scale(${s})`,
                    transformOrigin: "0 0",
                }}
            >
                <Clock
                    size={118}
                    hours={props.hours}
                    blank={props.blank}
                    singleHand={props.single ?? true}
                    ringAt={props.ringAt}
                    jam={props.jam}
                />
            </div>
            {showName && props.name && (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: 158 * s,
                        transform: `translate(-50%, ${fallen * 220}px) rotate(${-4 + fallen * 40}deg)`,
                        opacity: 1 - fallen,
                    }}
                >
                    <Card seed={`name-${props.name}`} pad={8} color="#fffaf0" lift={0.8}>
                        <div
                            style={{
                                ...type.label,
                                fontSize: 32 * Math.max(0.9, s),
                                color: theme.ink,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {props.name}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

const hoursOf = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
};

function TaskCard(props: { t: string; color?: string }) {
    const theme = useTheme();
    return (
        <Card seed={`task-${props.t}`} pad={12} color={props.color ?? "#fff8e6"} lift={1.3}>
            <Ink text={`post at ${props.t}`} size={34} mono color={theme.ink} />
        </Card>
    );
}

function Broom() {
    const theme = useTheme();
    return (
        <svg
            width={170}
            height={260}
            viewBox="0 0 170 260"
            style={{ overflow: "visible", filter: "drop-shadow(5px 5px 1px rgba(60,40,15,0.35))" }}
        >
            <path d="M120 6 L70 170" stroke="#8a6a3c" strokeWidth={14} strokeLinecap="round" />
            <path
                d="M40 160 L110 182 L96 250 L4 230 Z"
                fill="#e2b866"
                stroke={theme.ink}
                strokeWidth={5}
                strokeLinejoin="round"
            />
            {[20, 38, 56, 74].map((x) => (
                <path key={x} d={`M${x + 22} 176 L${x} 236`} stroke={theme.ink} strokeWidth={3} />
            ))}
        </svg>
    );
}

function Sun(props: { at: Cue; until: Cue }) {
    const p = useProgress(props.at, { until: props.until });
    const on = useAfter(props.at);
    const gone = useAfter(props.until);
    if (!on || gone) return null;
    const x = 40 + p * 1520;
    const y = 70 - Math.sin(p * Math.PI) * 50;
    return (
        <svg
            width={1}
            height={1}
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
            <g transform={`translate(${x} ${y + 20})`}>
                {Array.from({ length: 8 }, (_, k) => (
                    <path
                        key={k}
                        d="M0 -46 V-60"
                        stroke="#e08a1c"
                        strokeWidth={6}
                        strokeLinecap="round"
                        transform={`rotate(${k * 45})`}
                    />
                ))}
                <circle r={34} fill="#f4b23a" stroke="#1d1b18" strokeWidth={4} />
            </g>
        </svg>
    );
}

/** The clock on a box: its hand follows the task cards clipped on in line 4. */
function JamClock(props: { w: number }) {
    const h9 = useAfter(L(4, 0.12));
    const h13 = useAfter(L(4, 0.38));
    const h18 = useAfter(L(4, 0.62));
    const jam = useAfter(L(4, 0.75));
    const hand = useAfter(L(3, 0.1));
    const hours = h18 ? 18 : h13 ? 13 : h9 ? 9 : 12;
    return (
        <DOBox
            w={props.w}
            hours={hours}
            jam={jam && !useAfter(L(5, 0))}
            blank={!hand}
            clockAt={L(2, 0.55)}
            open={useOpen([[L(2, 0.32), L(2, 0.62)]])}
            items={0}
        />
    );
}

function KnockedCard(props: {
    t: string;
    clipAt: Cue;
    knockAt?: Cue;
    from: Point;
    clip: Point;
    dir: number;
}) {
    const frame = useFrame();
    const timeline = useTimeline();
    const p = useProgress(props.clipAt, 0.5);
    const start = cueFrame(timeline, props.clipAt);
    if (frame < start) return null;
    const knock = props.knockAt ? cueFrame(timeline, props.knockAt) : Infinity;
    let x = props.from[0] + (props.clip[0] - props.from[0]) * p;
    let y = props.from[1] + (props.clip[1] - props.from[1]) * p;
    let r = 0;
    let o = 1;
    if (frame >= knock) {
        const t = (frame - knock) / timeline.fps;
        x += props.dir * 160 * t;
        y += 220 * t * t + 60 * t;
        r = props.dir * 120 * t;
        o = Math.max(0, 1 - t / 1.6);
    }
    if (o <= 0) return null;
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${r}deg)`,
                opacity: o,
            }}
        >
            <TaskCard t={props.t} />
        </div>
    );
}

export default function Scheduler() {
    const theme = useTheme();
    const type = useType();
    return (
        <Stage>
            {/* Lines 0 and 1: the old way, a list swept every minute. */}
            <Shot from={0} to={1}>
                <Field>
                    <Mover keys={[{ at: L(0, 0), x: 600, y: 420 }]} pop={false}>
                        <Card seed="drawer" w={760} h={520} color={theme.paperAlt} pad={30}>
                            <Tag text="key-value store" seed="kv" size={34} color={theme.second} />
                        </Card>
                    </Mover>
                    {["9:00", "13:00", "18:00"].map((t, k) => (
                        <Mover
                            key={t}
                            keys={[
                                { at: L(0, 0.15 + k * 0.15), x: 600, y: 330 + k * 120 },
                                ...(k === 0
                                    ? [
                                          { at: L(1, 0.72), x: 1720, y: 420, r: 8 },
                                          { at: L(1, 0.95), o: 0 },
                                      ]
                                    : []),
                            ]}
                        >
                            <Card seed={`row-${t}`} w={520} pad={18} color="#fffaf0">
                                <Ink text={`post at ${t}`} size={44} mono color={theme.ink} />
                            </Card>
                        </Mover>
                    ))}
                    <Mover keys={[{ at: L(1, 0), x: 1240, y: 120 }]} anchor="left">
                        <MinuteClock />
                    </Mover>
                    <SweepingBroom />
                    <Mover keys={[{ at: L(1, 0.05), x: 1100, y: 640 }]} anchor="left">
                        <Card seed="cron-label" pad={14} color="#fffaf0">
                            <Ink text="cron, every minute" size={34} mono color={theme.ink} />
                        </Card>
                    </Mover>
                </Field>
            </Shot>

            {/* Lines 2 to 5: a Durable Object, its one alarm, and why one is not enough. */}
            <Shot from={2} to={5}>
                <Field>
                    <Mover
                        keys={[
                            { at: L(2, 0), x: 800, y: 700 },
                            { at: L(5, 0.2), o: 0 },
                        ]}
                        anchor="bottom"
                        pop={false}
                    >
                        <div style={{ transform: `scaleY(${1})` }}>
                            <JamClock w={330} />
                        </div>
                    </Mover>
                    <Mover keys={[{ at: L(2, 0.05), x: 440, y: 600 }]} anchor="left" out={L(5, 0)}>
                        <Ink text="program" size={40} mono />
                    </Mover>
                    <Mover keys={[{ at: L(2, 0.33), x: 300, y: 420 }]} anchor="left" out={L(5, 0)}>
                        <Ink text="its own storage" size={40} mono />
                    </Mover>
                    <Mover keys={[{ at: L(2, 0.6), x: 1040, y: 330 }]} anchor="left" out={L(3, 0)}>
                        <Ink text="an alarm" size={40} mono />
                    </Mover>
                    <Mover keys={[{ at: L(2, 0.8), x: 800, y: 90 }]} out={L(5, 0)}>
                        <Tag text="Durable Object" seed="do-tag" size={44} color={theme.second} />
                    </Mover>
                    <Layer>
                        <OneRing at={L(3, 0.25)} until={L(4, 0.1)} />
                    </Layer>
                    <Mover keys={[{ at: L(3, 0.35), x: 1110, y: 470 }]} anchor="left" out={L(5, 0)}>
                        <Ink text="one alarm at a time" size={44} />
                    </Mover>
                    <KnockedCard
                        t="9:00"
                        clipAt={L(4, 0.05)}
                        knockAt={L(4, 0.36)}
                        from={[1700, 300]}
                        clip={[870, 320]}
                        dir={-1}
                    />
                    <KnockedCard
                        t="13:00"
                        clipAt={L(4, 0.3)}
                        knockAt={L(4, 0.6)}
                        from={[1700, 420]}
                        clip={[890, 335]}
                        dir={-1}
                    />
                    <KnockedCard
                        t="18:00"
                        clipAt={L(4, 0.55)}
                        knockAt={L(4, 0.8)}
                        from={[1700, 540]}
                        clip={[910, 350]}
                        dir={1}
                    />
                    {/* Line 5: one object per task. */}
                    {[-1, 0, 1].map((d) => (
                        <Mover
                            key={d}
                            keys={[
                                { at: L(5, 0.15), x: 800, y: 700 },
                                { at: L(5, 0.2), x: 800 + d * 470 },
                            ]}
                            anchor="bottom"
                            pop={false}
                        >
                            <DOBox w={300} hours={12} single orange={useAfterLocal(L(5, 0.5))} />
                        </Mover>
                    ))}
                    <Layer>
                        <Burst x={800} y={520} at={L(5, 0.15)} r={90} />
                    </Layer>
                    <Mover keys={[{ at: L(5, 0.35), x: 800, y: 110 }]}>
                        <Ink text="one object per task" size={56} />
                    </Mover>
                </Field>
            </Shot>

            {/* Lines 6 to 8: a request, split by a language model, checked by the scheduler. */}
            <Shot from={6} to={8}>
                <Field>
                    <Mover
                        keys={[
                            { at: L(6, 0), x: 640, y: 80 },
                            { at: L(7, 0.05), x: 230, y: 330, s: 0.12, o: 0 },
                        ]}
                    >
                        <Card seed="ask" w={1100} pad={24} color="#fff8e6" lift={1.5}>
                            <WriteOn
                                text="“Post to Instagram at 9am tomorrow”"
                                size={52}
                                over={{ until: L(6, 0.75) }}
                                color={theme.ink}
                            />
                        </Card>
                    </Mover>
                    <Mover keys={[{ at: L(6, 0.2), x: 230, y: 520 }]} anchor="bottom" pop={false}>
                        <House
                            seed="llm"
                            label="language model"
                            sign="spark"
                            w={240}
                            roof={theme.third}
                            rise={L(6, 0.2)}
                            shakeAt={L(7, 0.12)}
                            litAt={L(7, 0.12)}
                            labelSize={30}
                        />
                    </Mover>
                    {[
                        "agent: workflow",
                        "job: create and post a campaign",
                        "when: tomorrow 09:00",
                    ].map((t, k) => (
                        <Mover
                            key={t}
                            keys={[
                                { at: L(7, 0.25 + k * 0.16), x: 300, y: 420, s: 0.3 },
                                { at: L(7, 0.26 + k * 0.16), x: 420, y: 230 + k * 100, s: 1 },
                                { at: L(8, 0.05 + k * 0.04), x: 960, y: 430, s: 0.2, o: 0 },
                            ]}
                            anchor="left"
                            out={L(9, 0)}
                        >
                            <Card
                                seed={`tag-${k}`}
                                pad={12}
                                color={k === 2 ? "#fff8e6" : theme.paper}
                            >
                                <Ink text={t} size={36} mono color={theme.ink} />
                            </Card>
                        </Mover>
                    ))}
                    <Mover keys={[{ at: L(8, 0), x: 1000, y: 520 }]} anchor="bottom" pop={false}>
                        <House
                            seed="sched"
                            label="scheduler"
                            sign="clock"
                            w={220}
                            roof={theme.second}
                            rise={L(8, 0)}
                            labelSize={30}
                        />
                    </Mover>
                    <FutureCheck />
                    <Mover
                        keys={[
                            { at: L(8, 0.78), x: 1300, y: 440, s: 0.4 },
                            { at: L(8, 0.8), x: 1380, y: 420, s: 1, r: -5 },
                        ]}
                    >
                        <Card seed="ticket" pad={14} color="#fffaf0" lift={1.5}>
                            <Ink text="new task ID" size={28} mono color={theme.inkSoft} />
                            <Ink text="task-A" size={46} mono color={theme.ink} />
                        </Card>
                    </Mover>
                </Field>
            </Shot>

            {/* Lines 9 to 12: one box per task; the alarm wakes the agent; the task is deleted. */}
            <Shot from={9} to={12}>
                <Field>
                    <Title
                        text="One alarm per object, so one object per task."
                        from={L(9, 0.6)}
                        to={L(11, 0)}
                    />
                    <Mover keys={[{ at: L(9, 0.3), x: 1340, y: 300 }]} out={L(11, 0)} pop={false}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <div style={{ opacity: 0.5, filter: "grayscale(1)" }}>
                                <Clock size={110} hours={18} jam />
                            </div>
                            <Ink text="one object: jammed" size={30} mono color={theme.onBgSoft} />
                        </div>
                    </Mover>
                    <Sun at={L(11, 0)} until={L(12, 0.9)} />
                    <TaskBox
                        i={0}
                        name="task-A"
                        t="09:00"
                        x={260}
                        build={L(9, 0)}
                        ring={L(11, 0.15)}
                        del={L(12, 0)}
                    />
                    <TaskBox
                        i={1}
                        name="task-B"
                        t="13:00"
                        x={620}
                        build={L(10, 0.05)}
                        ring={L(11, 0.6)}
                        del={L(12, 0.45)}
                    />
                    <TaskBox i={2} name="task-C" t="18:00" x={980} build={L(10, 0.35)} />
                    {/* line 9: the ticket and the tags go into box A */}
                    <Mover
                        keys={[
                            { at: L(9, 0), x: 700, y: 120 },
                            { at: L(9, 0.18), x: 260, y: 600, s: 0.5, o: 0 },
                        ]}
                    >
                        <Card seed="ticket-2" pad={12} color="#fffaf0">
                            <Ink text="task-A" size={40} mono color={theme.ink} />
                        </Card>
                    </Mover>
                    {[0, 1, 2].map((k) => (
                        <Mover
                            key={k}
                            keys={[
                                {
                                    at: L(9, 0.3 + k * 0.06),
                                    x: 500 + k * 60,
                                    y: 150,
                                    r: -8 + k * 8,
                                },
                                {
                                    at: L(9, 0.42 + k * 0.05),
                                    x: 200 + k * 40,
                                    y: 430,
                                    s: 0.5,
                                    o: 0,
                                },
                            ]}
                        >
                            <Card
                                seed={`tagmini-${k}`}
                                w={90}
                                h={70}
                                pad={0}
                                color={[theme.paper, "#fff8e6", theme.paperAlt][k]}
                            />
                        </Mover>
                    ))}
                    <Mover keys={[{ at: L(9, 0.3), x: 760, y: 220 }]} anchor="left" out={L(9, 0.7)}>
                        <Ink text="the task goes inside" size={34} mono />
                    </Mover>
                    {/* line 11: the agent and the post */}
                    <Mover keys={[{ at: L(11, 0.0), x: 1320, y: 690 }]} anchor="bottom" pop={false}>
                        <House
                            seed="agent"
                            label="agent"
                            w={220}
                            eyes
                            roof={theme.second}
                            outline={theme.accent}
                            rise={L(11, 0)}
                            litAt={L(11, 0.3)}
                            litUntil={L(11, 0.5)}
                            look={[-0.6, -0.3]}
                            labelSize={32}
                        />
                    </Mover>
                    <Mover
                        keys={[{ at: L(11, 0.05), x: 1500, y: 300 }]}
                        anchor="bottom"
                        pop={false}
                    >
                        <House
                            seed="insta"
                            label="Instagram"
                            sign="camera"
                            w={150}
                            roof={theme.accent}
                            rise={L(11, 0.05)}
                            litAt={L(11, 0.42)}
                        />
                    </Mover>
                    <Layer>
                        <Wire
                            a={[260, 712]}
                            b={[1225, 680]}
                            at={L(11, 0.08)}
                            over={0.5}
                            bow={0.02}
                            width={9}
                            flash={[L(11, 0.2)]}
                            hideAt={L(12, 0.3)}
                        />
                        <Wire
                            a={[620, 712]}
                            b={[1225, 680]}
                            at={L(11, 0.1)}
                            over={0.5}
                            bow={0.02}
                            width={9}
                            flash={[L(11, 0.65)]}
                            hideAt={L(12, 0.75)}
                        />
                        <Wire
                            a={[980, 712]}
                            b={[1225, 680]}
                            at={L(11, 0.12)}
                            over={0.4}
                            bow={0.02}
                            width={9}
                        />
                        <Wire
                            a={[1420, 540]}
                            b={[1500, 365]}
                            at={L(11, 0.12)}
                            over={0.4}
                            bow={0.1}
                            width={9}
                        />
                    </Layer>
                    <Along
                        a={[260, 712]}
                        b={[1225, 680]}
                        at={L(11, 0.2)}
                        over={0.8}
                        bow={0.02}
                        vanish
                    >
                        <Note seed="job-a" text="the job" size={30} />
                    </Along>
                    <Along
                        a={[1420, 540]}
                        b={[1500, 370]}
                        at={L(11, 0.34)}
                        over={0.6}
                        bow={0.1}
                        vanish
                    >
                        <Note seed="post-a" text="post" size={30} />
                    </Along>
                    <Along
                        a={[620, 712]}
                        b={[1225, 680]}
                        at={L(11, 0.65)}
                        over={0.8}
                        bow={0.02}
                        vanish
                    >
                        <Note seed="job-b" text="the job" size={30} />
                    </Along>
                    <Along
                        a={[1420, 540]}
                        b={[1500, 370]}
                        at={L(11, 0.8)}
                        over={0.5}
                        bow={0.1}
                        vanish
                    >
                        <Note seed="post-b" text="post" size={30} />
                    </Along>
                    <Mover keys={[{ at: L(12, 0.05), x: 140, y: 120 }]} anchor="left">
                        <Stamp text="done: task deleted" at={L(12, 0.05)} size={34} rot={-4} />
                    </Mover>
                </Field>
            </Shot>

            {/* Lines 13 and 14: the honest split. */}
            <Shot from={13}>
                <Field>
                    <div
                        style={{
                            position: "absolute",
                            left: 795,
                            top: 0,
                            width: 6,
                            height: 760,
                            background: theme.ink,
                            opacity: 0.6,
                            borderRadius: 3,
                        }}
                    />
                    <Mover keys={[{ at: L(13, 0), x: 20, y: 30 }]} anchor="left" pop={false}>
                        <Tag text="through the API" seed="api" size={36} color={theme.second} />
                    </Mover>
                    <Mover keys={[{ at: L(13, 0.05), x: 30, y: 110 }]} anchor="left">
                        <Tag text="my test" seed="my-test" size={30} color={theme.third} />
                    </Mover>
                    <Mover keys={[{ at: L(13, 0.02), x: 560, y: 210 }]} anchor="bottom" pop={false}>
                        <House
                            seed="insta-2"
                            label="Instagram"
                            sign="camera"
                            w={130}
                            roof={theme.accent}
                            litAt={L(13, 0.2)}
                        />
                    </Mover>
                    {["09:00", "13:00", "18:00"].map((t, k) => (
                        <React.Fragment key={t}>
                            <Mover
                                keys={[{ at: L(13, 0), x: 140 + k * 250, y: 700 }]}
                                anchor="bottom"
                                pop={false}
                            >
                                <DOBox
                                    w={190}
                                    hours={hoursOf(t)}
                                    ringAt={[L(13, 0.08 + k * 0.25)]}
                                    name={t}
                                    nameAt={L(13, 0)}
                                />
                            </Mover>
                            <Along
                                a={[140 + k * 250, 480]}
                                b={[560, 230]}
                                at={L(13, 0.12 + k * 0.25)}
                                over={0.6}
                                bow={0.1}
                                vanish
                            >
                                <Note seed={`api-post-${k}`} text="post" size={28} />
                            </Along>
                            <Layer>
                                <Tick
                                    x={140 + k * 250 + 70}
                                    y={440}
                                    at={L(13, 0.3 + k * 0.25)}
                                    size={44}
                                />
                            </Layer>
                        </React.Fragment>
                    ))}
                    <Mover keys={[{ at: L(13, 0.8), x: 400, y: 330 }]}>
                        <Ink text="fired on time" size={40} />
                    </Mover>

                    <Mover keys={[{ at: L(14, 0), x: 830, y: 30 }]} anchor="left" pop={false}>
                        <Tag text="from chat" seed="chat" size={36} color={theme.second} />
                    </Mover>
                    <Mover keys={[{ at: L(14, 0.02), x: 980, y: 170 }]}>
                        <ChatBubble />
                    </Mover>
                    <Mover
                        keys={[{ at: L(14, 0.08), x: 1420, y: 280 }]}
                        anchor="bottom"
                        pop={false}
                    >
                        <House
                            seed="llm-2"
                            label="language model"
                            sign="spark"
                            w={130}
                            roof={theme.third}
                            rise={L(14, 0.08)}
                            labelSize={28}
                        />
                    </Mover>
                    <Layer>
                        <Wire
                            a={[1110, 170]}
                            b={[1350, 210]}
                            at={L(14, 0.1)}
                            over={0.4}
                            bow={-0.1}
                            width={8}
                        />
                        <Wire
                            a={[1420, 345]}
                            b={[1400, 470]}
                            at={L(14, 0.2)}
                            over={0.3}
                            width={8}
                        />
                    </Layer>
                    {["09:00", "?", "18:00"].map((t, k) => (
                        <Mover
                            key={k}
                            keys={[{ at: L(14, 0.25 + k * 0.06), x: 1000 + k * 210, y: 700 }]}
                            anchor="bottom"
                            pop={false}
                        >
                            <DOBox
                                w={170}
                                hours={t === "?" ? 0 : hoursOf(t)}
                                blank={t === "?"}
                                ringAt={t === "?" ? undefined : [L(14, 0.5 + k * 0.1)]}
                            />
                        </Mover>
                    ))}
                    <Mover keys={[{ at: L(14, 0.45), x: 1310, y: 440 }]} sway="q">
                        <Ink text="?" size={90} italic color={theme.accent} />
                    </Mover>
                    <Mover keys={[{ at: L(14, 0.5), x: 1120, y: 470 }]}>
                        <Note seed="no-post" text="post" size={28} />
                    </Mover>
                    <Layer>
                        <Cross x={1062} y={442} w={116} h={56} at={L(14, 0.55)} />
                    </Layer>
                    <Mover
                        keys={[
                            { at: L(14, 0.7), x: 1700, y: 190, r: 6 },
                            { at: L(14, 0.72), x: 1060, y: 330, r: -3 },
                        ]}
                        pop={false}
                    >
                        <Card seed="add-checks" pad={16} color="#fffaf0" lift={1.6}>
                            <div style={{ ...type.label, fontSize: 32, color: theme.accent }}>
                                add checks
                            </div>
                            {[0, 1].map((k) => (
                                <div
                                    key={k}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginTop: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 22,
                                            height: 22,
                                            border: `3px solid ${theme.ink}`,
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: 110,
                                            height: 5,
                                            background: theme.inkSoft,
                                            borderRadius: 3,
                                        }}
                                    />
                                </div>
                            ))}
                        </Card>
                    </Mover>
                </Field>
            </Shot>
        </Stage>
    );
}

function useAfterLocal(at: Cue): boolean {
    return useAfter(at);
}

function MinuteClock() {
    const theme = useTheme();
    const type = useType();
    const t1 = useAfter(L(1, 0.3));
    const t2 = useAfter(L(1, 0.62));
    const text = t2 ? "09:00" : t1 ? "08:59" : "08:58";
    const pulse = usePulse(t2 ? L(1, 0.62) : t1 ? L(1, 0.3) : L(1, 0), 0.4);
    return (
        <Card seed="minute-clock" pad={16} color="#fffaf0">
            <div
                style={{
                    ...type.label,
                    fontSize: 64,
                    color: t2 ? theme.accent : theme.ink,
                    transform: `scale(${1 + pulse * 0.08})`,
                }}
            >
                {text}
            </div>
        </Card>
    );
}

function SweepingBroom() {
    const frame = useFrame();
    const timeline = useTimeline();
    const start = cueFrame(timeline, L(1, 0.02));
    const end = cueFrame(timeline, L(1, "next"));
    if (frame < start || frame > end + 10) return null;
    // One sweep across the drawer every 1.4 s, the "every minute" sped up.
    const period = 1.4 * timeline.fps;
    const ph = ((frame - start) % period) / period;
    const x = 300 + Math.sin(ph * Math.PI) * 620;
    const r = -20 + Math.sin(ph * Math.PI * 2) * 12;
    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: 300,
                transform: `rotate(${r}deg)`,
                transformOrigin: "70% 10%",
            }}
        >
            <Broom />
        </div>
    );
}

function OneRing(props: { at: Cue; until: Cue }) {
    const theme = useTheme();
    const p = useProgress(props.at, 0.6);
    const gone = useAfter(props.until);
    if (p <= 0 || gone) return null;
    return (
        <g>
            <ellipse
                cx={890}
                cy={420}
                rx={120}
                ry={110}
                stroke={theme.accent}
                strokeWidth={8}
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
                transform="rotate(-20 930 430)"
            />
            <text
                x={1010}
                y={320}
                fontFamily="Fraunces"
                fontWeight={600}
                fontSize={80}
                fill={theme.accent}
                opacity={p}
            >
                1
            </text>
        </g>
    );
}

function FutureCheck() {
    const theme = useTheme();
    const draw = useProgress(L(8, 0.05), 0.5);
    const slide = useProgress(L(8, 0.3), 0.6);
    if (draw <= 0) return null;
    const x0 = 700;
    const w = 760;
    const nowX = x0 + 160;
    const whenX = nowX + slide * 420;
    return (
        <div style={{ position: "absolute", left: 0, top: 0 }}>
            <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
                <path
                    d={`M ${x0} 190 H ${x0 + w * draw}`}
                    stroke={theme.ink}
                    strokeWidth={6}
                    strokeLinecap="round"
                />
                <path
                    d={`M ${x0 + w * draw - 18} 178 L ${x0 + w * draw} 190 L ${x0 + w * draw - 18} 202`}
                    stroke={theme.ink}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                />
                <circle
                    cx={nowX}
                    cy={190}
                    r={14}
                    fill={theme.second}
                    stroke={theme.ink}
                    strokeWidth={4}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: nowX,
                    top: 220,
                    transform: "translateX(-50%)",
                }}
            >
                <Ink text="now" size={36} mono />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: whenX,
                    top: 120,
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Card seed="when" pad={10} color="#fff8e6">
                    <Ink text="tomorrow 09:00" size={32} mono color={theme.ink} />
                </Card>
            </div>
            <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
                <Tick x={nowX + 420} y={195} at={L(8, 0.62)} size={50} />
            </svg>
            <ShowAfter at={L(8, 0.64)}>
                <div
                    style={{
                        position: "absolute",
                        left: nowX + 420,
                        top: 222,
                        transform: "translateX(-50%)",
                    }}
                >
                    <Ink text="in the future" size={34} mono color={theme.accent} />
                </div>
            </ShowAfter>
        </div>
    );
}

function ShowAfter(props: { at: Cue; children: React.ReactNode }) {
    return useAfter(props.at) ? <>{props.children}</> : null;
}

function TaskBox(props: {
    i: number;
    name: string;
    t: string;
    x: number;
    build: Cue;
    ring?: Cue;
    del?: Cue;
}) {
    const theme = useTheme();
    const open = useOpen(
        props.i === 0
            ? [
                  [L(9, 0.35), L(9, 0.62)],
                  ...(props.ring
                      ? ([
                            [
                                { ...(props.ring as object), delay: 0.2 } as Cue,
                                { ...(props.ring as object), delay: 1.2 } as Cue,
                            ],
                        ] as [Cue, Cue][])
                      : []),
              ]
            : props.ring
              ? [
                    [
                        { ...(props.ring as object), delay: 0.2 } as Cue,
                        { ...(props.ring as object), delay: 1.2 } as Cue,
                    ],
                ]
              : [],
    );
    const emptied = useAfter(
        props.ring ? ({ ...(props.ring as object), delay: 0.6 } as Cue) : L(0, 0, 1e5),
    );
    const setAt = props.i === 0 ? L(9, 0.78) : { ...(props.build as object), delay: 0.6 };
    const set = useAfter(setAt as Cue);
    const click = usePulse(setAt as Cue, 0.4);
    const fold = useProgress(props.del ?? L(0, 0, 1e5), 0.5);
    const slide = useProgress(
        props.del ? ({ ...(props.del as object), delay: 0.5 } as Cue) : L(0, 0, 1e5),
        0.6,
    );
    if (slide >= 1) return null;
    return (
        <Mover keys={[{ at: props.build, x: props.x, y: 700 }]} anchor="bottom" pop={false}>
            <div
                style={{
                    transform: `translateX(${-slide * 600}px) scaleY(${1 - fold * 0.88}) scale(${1 + click * 0.04})`,
                    transformOrigin: "50% 100%",
                    opacity: 1 - slide,
                }}
            >
                <div
                    style={{
                        transform: `scaleY(${useProgress(props.build, 0.5)})`,
                        transformOrigin: "50% 100%",
                    }}
                >
                    <DOBox
                        w={300}
                        name={props.name}
                        nameAt={props.i === 0 ? L(9, 0.16) : props.build}
                        nameFall={props.del}
                        hours={set ? hoursOf(props.t) : 12}
                        open={open}
                        items={emptied ? 0 : 3}
                        ringAt={props.ring ? [props.ring] : undefined}
                        orange
                    />
                </div>
            </div>
            {set && (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: -64,
                        transform: "translateX(-50%)",
                        opacity: fold > 0 ? 0 : 1,
                    }}
                >
                    <Ink text={props.t} size={40} mono color={theme.accent} />
                </div>
            )}
        </Mover>
    );
}

function ChatBubble() {
    const theme = useTheme();
    return (
        <div style={{ position: "relative" }}>
            <Card seed="chat-bubble" pad={14} color="#fffaf0" w={250}>
                <Ink text="“post at 9am" size={30} color={theme.ink} />
                <Ink text="tomorrow”" size={30} color={theme.ink} />
            </Card>
        </div>
    );
}
