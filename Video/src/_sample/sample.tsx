import React from "react";
import {
    Arrow,
    BeforeAfter,
    Box,
    CountUp,
    DotStream,
    edge,
    LineGrow,
    Place,
    Shot,
    Stage,
    Tag,
    Timeline,
    TitleCard,
    useTheme,
    useType,
    WriteOn,
    type Cue,
} from "../kit";

// The sample scene: one narration, rendered in each of the three looks. Every timing below is a
// narration line (0 to 4) or a point inside one; there is no frame number anywhere.

export const poster: Cue = { line: 2, at: "end" };

function FrameList(props: { items: string[] }) {
    const theme = useTheme();
    const type = useType();
    return (
        <div
            style={{
                ...type.label,
                ...type.mono,
                fontSize: 32,
                color: theme.inkSoft,
            }}
        >
            {props.items.map((t) => (
                <div key={t} style={{ marginTop: 14 }}>
                    {t}
                </div>
            ))}
        </div>
    );
}

/** The sample's five shots, starting at narration line `base`. */
export function SampleShots({ base = 0, last = true }: { base?: number; last?: boolean }) {
    const b = base;
    const theme = useTheme();
    const y = 430;
    const client = 150;
    const edgeX = 570;
    const server = 1010;
    const db = 1440;
    return (
        <>
            <Shot from={b + 0} to={b + 0}>
                <TitleCard kicker="How these videos are made" title="A scene, from a script." />
            </Shot>

            <Shot from={b + 1} to={b + 1}>
                <Place x={40} y={40} w={860}>
                    <Tag text="Line two" at={b + 1} seed="line-two" />
                </Place>
                <Place x={40} y={140} w={860}>
                    <WriteOn
                        text="Every line moves the picture."
                        size={92}
                        over={{ until: { line: b + 1, at: 0.45 } }}
                    />
                </Place>
                <Place x={980} y={40}>
                    <CountUp
                        to={30}
                        at={{ line: b + 1, at: 0.55 }}
                        over={{ until: { line: b + 1, at: "end" } }}
                        label="frames every second"
                    />
                </Place>
                <Place x={60} y={470}>
                    <LineGrow
                        points={[1, 2, 2, 4, 5, 8, 9]}
                        at={{ line: b + 1, at: 0.3 }}
                        over={{ until: { line: b + 1, at: "end" } }}
                        width={1440}
                        height={200}
                    />
                </Place>
            </Shot>

            <Shot from={b + 2} to={b + 2}>
                <Place x={40} y={40}>
                    <Tag text="Requests" at={b + 2} seed="requests" color={theme.second} />
                </Place>
                <DotStream
                    from={edge(client, y, "right")}
                    to={edge(server, y, "left")}
                    at={{ line: b + 2, delay: 0.3 }}
                    rate={7}
                    travel={1.4}
                    block={{
                        at: { line: b + 2, at: 0.55 },
                        share: 0.55,
                        where: 0.27,
                        mode: "drop",
                        label: "Too many",
                    }}
                />
                <Box kind="client" label="Client" x={client} y={y} at={b + 2} />
                <Box
                    kind="edge"
                    label="Edge"
                    x={edgeX}
                    y={y}
                    at={{ line: b + 2, delay: 0.15 }}
                    highlight
                />
                <Box
                    kind="server"
                    label="Server"
                    x={server}
                    y={y}
                    at={{ line: b + 2, delay: 0.3 }}
                />
                <Box kind="database" label="Database" x={db} y={y} at={{ line: b + 2, at: 0.35 }} />
                <Arrow
                    from={edge(server, y, "right")}
                    to={edge(db, y, "left")}
                    at={{ line: b + 2, at: 0.35 }}
                />
                <Arrow
                    from={[edgeX, y - 150]}
                    to={edge(edgeX, y, "top")}
                    at={{ line: b + 2, at: 0.55 }}
                    color={theme.accent}
                    label="limit"
                />
            </Shot>

            <Shot from={b + 3} to={b + 3}>
                <Place x={40} y={60}>
                    <BeforeAfter
                        afterAt={{ line: b + 3, at: 0.55 }}
                        width={1540}
                        height={560}
                        before={
                            <FrameList
                                items={[
                                    "frame 412: show box",
                                    "frame 436: draw arrow",
                                    "frame 471: count",
                                ]}
                            />
                        }
                        after={
                            <FrameList
                                items={[
                                    "{ line: 2 }",
                                    "{ line: 2, at: 0.5 }",
                                    '{ line: 2, at: "end" }',
                                ]}
                            />
                        }
                    />
                </Place>
            </Shot>

            <Shot from={b + 4} to={last ? undefined : b + 4}>
                <Place x={40} y={60}>
                    <WriteOn text="One command." size={104} over={0.8} />
                </Place>
                <Place x={40} y={330}>
                    <Timeline
                        width={1480}
                        at={b + 4}
                        items={[
                            { label: "Script", note: "narration", at: { line: b + 4, at: 0.05 } },
                            { label: "Voice", note: "line by line", at: { line: b + 4, at: 0.3 } },
                            {
                                label: "Picture",
                                note: "timed to it",
                                at: { line: b + 4, at: 0.55 },
                            },
                            { label: "Video", note: "checked", at: { line: b + 4, at: 0.85 } },
                        ]}
                    />
                </Place>
            </Shot>
        </>
    );
}

export function SampleScene() {
    return (
        <Stage>
            <SampleShots />
        </Stage>
    );
}
