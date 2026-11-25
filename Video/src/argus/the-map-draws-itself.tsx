import React from "react";
import { Leaf, Paper, Pebble, Stage, useTheme, type Cue } from "../kit";
import { ARGUS } from "./shared/data";
import { ArgusMark, FullFrame, Sheet } from "./shared/pieces";

// Still: argus / the-map-draws-itself. The Map page redrawn in cut paper from demo-data.md "Map":
// each public address traced through edge, origin, route, container, app and repo; empty steps are
// jumped over; the one address that is not proxied is dashed; two unexplained names sit in their own box.

export const theme = "qoria";
export const poster: Cue = { line: 0, at: "end" };

const COLS = ["Edge", "Origin", "Route / service", "Container", "App", "Repo"];
const COL_X = [690, 905, 1120, 1335, 1550, 1755];
const NODE = { w: 200, h: 86 };
const ROW_Y = [300, 410, 520, 630, 740];

type Lane = { address: string; proxied: boolean; steps: (string | null)[] };

const LANES: Lane[] = [
    {
        address: "app03-orion.example.net",
        proxied: true,
        steps: ["edge-orion", "vm-1", "proxy route /orion", "orion-web", "Orion", "repo-orion"],
    },
    {
        address: "app12-lyra.example.net",
        proxied: true,
        steps: [null, "cloud-a run service lyra", null, null, "Lyra", "repo-lyra"],
    },
    {
        address: "app21-cygnus.example.net",
        proxied: true,
        steps: ["edge-cygnus (static)", null, null, null, "Cygnus", "repo-cygnus"],
    },
    {
        address: "api.app21-cygnus.example.net",
        proxied: true,
        steps: [null, "vm-1", "proxy route /cygnus-api", "cygnus-api", "Cygnus", "repo-cygnus"],
    },
    {
        address: "app30-draco.example.net",
        proxied: false,
        steps: [null, "cloud-b function draco", null, null, "Draco", "repo-draco"],
    },
];

const NODE_COLORS = ["#f6c9b4", "#f7f6f1", "#f7f6f1", "#d9d8d0", "#a9c49a", "#c8c5b8"];
const ADDR = { x: 100, w: 470 };

export default function MapStill() {
    return (
        <Stage ornaments={false}>
            <FullFrame>
                <MapPicture />
            </FullFrame>
        </Stage>
    );
}

function MapPicture() {
    const theme = useTheme();
    return (
        <>
            <Sheet
                seed="map-panel"
                x={60}
                y={40}
                w={1810}
                h={1000}
                color={ARGUS.panel}
                sway={0}
                lift={1.2}
                roughness={0.25}
            />
            <div
                style={{
                    position: "absolute",
                    left: 100,
                    top: 70,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                }}
            >
                <ArgusMark size={76} draw={1} color={ARGUS.onPanel} star={theme.accent} />
                <span
                    style={{
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 60,
                        color: ARGUS.onPanel,
                    }}
                >
                    Map
                </span>
                <span
                    style={{
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 34,
                        color: ARGUS.onPanelSoft,
                        marginLeft: 16,
                    }}
                >
                    every public address, traced to its code
                </span>
            </div>
            <Leaf size={130} seed="map-leaf" style={{ position: "absolute", left: 1760, top: 0 }} />
            <Pebble
                size={70}
                seed="map-pebble"
                style={{ position: "absolute", left: 1700, top: 60 }}
            />

            {/* Column heads */}
            <div
                style={{
                    position: "absolute",
                    left: ADDR.x + 8,
                    top: 196,
                    fontFamily: "Fraunces",
                    fontStyle: "italic",
                    fontSize: 32,
                    color: ARGUS.onPanelSoft,
                }}
            >
                Address
            </div>
            {COLS.map((c, i) => (
                <div
                    key={c}
                    style={{
                        position: "absolute",
                        left: COL_X[i] - 120,
                        width: 240,
                        top: 196,
                        textAlign: "center",
                        fontFamily: "Fraunces",
                        fontStyle: "italic",
                        fontSize: 32,
                        color: ARGUS.onPanelSoft,
                    }}
                >
                    {c}
                </div>
            ))}
            <div
                style={{
                    position: "absolute",
                    left: 100,
                    top: 244,
                    width: 1740,
                    height: 3,
                    background: ARGUS.panelLine,
                }}
            />

            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
                {LANES.map((lane, r) => (
                    <LaneLine key={lane.address} lane={lane} y={ROW_Y[r]} />
                ))}
            </svg>

            {LANES.map((lane, r) => (
                <React.Fragment key={lane.address}>
                    <div style={{ position: "absolute", left: ADDR.x, top: ROW_Y[r] - 32 }}>
                        <Paper
                            seed={`addr-${r}`}
                            color={lane.proxied ? "#f7f6f1" : "#ffe1d4"}
                            roughness={0.8}
                            innerStyle={{
                                padding: "12px 18px",
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 26,
                                color: "#191919",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {lane.address}
                        </Paper>
                    </div>
                    {lane.steps.map((s, i) =>
                        s ? (
                            <Sheet
                                key={i}
                                seed={`node-${r}-${i}`}
                                x={COL_X[i] - NODE.w / 2}
                                y={ROW_Y[r] - NODE.h / 2}
                                w={NODE.w}
                                h={NODE.h}
                                color={NODE_COLORS[i]}
                                innerStyle={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    padding: "0 6px",
                                    fontFamily: i >= 4 ? "Fraunces" : "IBM Plex Mono",
                                    fontWeight: i === 4 ? 600 : 400,
                                    fontSize: i === 4 ? 32 : s.length > 20 ? 22 : 24,
                                    lineHeight: 1.1,
                                    color: "#191919",
                                }}
                            >
                                {s}
                            </Sheet>
                        ) : null,
                    )}
                </React.Fragment>
            ))}

            <Legend />
            <Unexplained />
        </>
    );
}

function LaneLine({ lane, y }: { lane: Lane; y: number }) {
    const pts: { x: number; col: number }[] = [{ x: ADDR.x + 120, col: -1 }];
    lane.steps.forEach((s, i) => {
        if (s) pts.push({ x: COL_X[i], col: i });
    });
    let d = `M ${pts[0].x} ${y}`;
    for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1];
        const b = pts[k];
        const skipped = b.col - a.col - 1;
        if (skipped > 0) {
            // Jump over the empty steps.
            const h = 34 + skipped * 8;
            d += ` C ${a.x + 40} ${y - h * 1.3}, ${b.x - 40} ${y - h * 1.3}, ${b.x} ${y}`;
        } else {
            d += ` L ${b.x} ${y}`;
        }
    }
    return (
        <path
            d={d}
            fill="none"
            stroke={lane.proxied ? ARGUS.onPanel : "#ff8a5c"}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={lane.proxied ? undefined : "16 14"}
        />
    );
}

function Legend() {
    return (
        <div
            style={{
                position: "absolute",
                left: 100,
                top: 840,
                fontFamily: "Fraunces",
                fontSize: 32,
                color: ARGUS.onPanel,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <svg width="90" height="20">
                    <path
                        d="M4 10 H86"
                        stroke={ARGUS.onPanel}
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                </svg>
                proxied through the edge
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
                <svg width="90" height="20">
                    <path
                        d="M4 10 H86"
                        stroke="#ff8a5c"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="16 14"
                    />
                </svg>
                not proxied
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
                <svg width="90" height="40">
                    <path
                        d="M6 34 C 24 2, 66 2, 84 34"
                        stroke={ARGUS.onPanel}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
                jumps over a step that is not there
            </div>
        </div>
    );
}

function Unexplained() {
    const theme = useTheme();
    const items = [
        { name: "old-promo.example.net", note: "nothing claims this address" },
        { name: "mail2.example.net", note: "no service behind it" },
    ];
    return (
        <div style={{ position: "absolute", left: 1010, top: 820 }}>
            <Paper
                seed="unexplained"
                color="#f7f6f1"
                lift={1.3}
                innerStyle={{
                    boxSizing: "border-box",
                    width: 840,
                    height: 196,
                    padding: "16px 28px",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        fontFamily: "Fraunces",
                        fontWeight: 600,
                        fontSize: 40,
                        color: theme.accent,
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            background: theme.accent,
                            color: "#fffaf2",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 32,
                        }}
                    >
                        ?
                    </span>
                    Unexplained
                </div>
                {items.map((it) => (
                    <div
                        key={it.name}
                        style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 12 }}
                    >
                        <span
                            style={{
                                fontFamily: "IBM Plex Mono",
                                fontWeight: 500,
                                fontSize: 27,
                                color: "#191919",
                                background: "#ffe1d4",
                                padding: "2px 12px",
                            }}
                        >
                            {it.name}
                        </span>
                        <span
                            style={{
                                fontFamily: "Fraunces",
                                fontStyle: "italic",
                                fontSize: 30,
                                color: "#55544f",
                            }}
                        >
                            {it.note}
                        </span>
                    </div>
                ))}
            </Paper>
        </div>
    );
}
