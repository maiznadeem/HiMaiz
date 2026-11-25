import type { CSSProperties } from "react";

// The logo's shapes (100-unit grid), reused so the work pages are cut from the same paper.
export const LEAF = "M18 82C16 50 34 20 76 14 82 46 62 78 18 82Z";
export const VEIN = "M23 77C40 58 54 40 71 20";
export const PEBBLE = "M70 64c8-4 16 2 14 10-2 8-14 10-18 4-3-5-1-11 4-14z";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** A small orange pebble, for list bullets and labels. */
export function Pebble({ className = "" }: { className?: string }) {
    return (
        <svg
            className={`pebble ${className}`}
            viewBox="64 60 22 22"
            aria-hidden="true"
            focusable="false"
        >
            <path d={PEBBLE} fill="var(--orange)" />
        </svg>
    );
}

/** A hand-drawn orange ring that draws itself round a number when its scene opens. */
export function Ring({ start }: { start: number }) {
    return (
        <svg
            className="stat-ring"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path
                style={delay(start)}
                d="M118 8C70 2 14 14 8 46c-5 30 44 48 102 44 52-4 86-22 82-48-3-22-40-36-96-34"
                pathLength={1}
                fill="none"
                stroke="var(--orange)"
                strokeWidth="4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

// Three arrangements of the same few pieces, so scenes without media do not all look alike.
const STAND_INS = [
    {
        circle: [140, 120, 92],
        leaf: "translate(180 250) rotate(-14) scale(2.3) translate(-18 -82)",
        pebble: [262, 206],
        dot: [70, 60],
    },
    {
        circle: [250, 140, 88],
        leaf: "translate(110 236) rotate(10) scale(2.1) translate(-18 -82)",
        pebble: [96, 222],
        dot: [316, 52],
    },
    {
        circle: [200, 160, 100],
        leaf: "translate(150 268) rotate(-30) scale(2.5) translate(-18 -82)",
        pebble: [300, 236],
        dot: [82, 236],
    },
];

/**
 * A paper composition that stands in for media when a scene has neither video nor image. Each
 * piece pops up off the page on its own beat. Decorative only.
 */
export function StandIn({
    variant,
    start = 0,
    onInk = false,
}: {
    variant: number;
    start?: number;
    /** On an ink page the leaf is cut from stone instead, so it still shows. */
    onInk?: boolean;
}) {
    const v = STAND_INS[variant % STAND_INS.length];
    const leaf = onInk ? "var(--stone)" : "var(--ink)";
    const vein = onInk ? "var(--ink)" : "var(--stone)";
    return (
        <svg className="stand-in" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
            <g className="pop" style={delay(start)}>
                <circle
                    cx={v.circle[0]}
                    cy={v.circle[1]}
                    r={v.circle[2]}
                    filter="url(#paper)"
                    style={{ fill: "color-mix(in srgb, var(--muted) 30%, var(--stone))" }}
                />
            </g>
            <g className="pop" style={delay(start + 140)}>
                <g filter="url(#paper)">
                    <path d={LEAF} transform={v.leaf} fill={leaf} />
                    <path
                        d={VEIN}
                        transform={v.leaf}
                        stroke={vein}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>
            </g>
            <g className="boing" style={delay(start + 300)}>
                <path
                    d={PEBBLE}
                    transform={`translate(${v.pebble[0]} ${v.pebble[1]}) scale(2.2) translate(-76 -71)`}
                    fill="var(--orange)"
                    filter="url(#paper)"
                />
            </g>
            <g className="boing" style={delay(start + 420)}>
                <circle
                    cx={v.dot[0]}
                    cy={v.dot[1]}
                    r="9"
                    fill="var(--orange)"
                    filter="url(#paper)"
                />
            </g>
        </svg>
    );
}

/** A stack of three cut pages and a pebble: the /work emblem, laid down once on load. */
export function PageStack({ className = "" }: { className?: string }) {
    const page = (fill: string, rotate: number, d: number, dx: number) => (
        <g className="enter-lay" style={delay(d)}>
            <path
                d="M62 40 L330 30 L338 236 L60 246 Z"
                transform={`translate(${dx} 0) rotate(${rotate} 200 140)`}
                filter="url(#paper)"
                style={{ fill }}
            />
        </g>
    );
    return (
        <svg className={className} viewBox="0 0 400 300" aria-hidden="true" focusable="false">
            {page("color-mix(in srgb, var(--muted) 42%, var(--stone))", -9, 0, -6)}
            {page("color-mix(in srgb, var(--muted) 18%, var(--stone))", 4, 160, 8)}
            {page("var(--sheet)", -2, 320, 0)}
            <g className="enter-drop" style={delay(620)}>
                <path
                    d={PEBBLE}
                    transform="translate(318 236) scale(3) translate(-76 -71)"
                    fill="var(--orange)"
                    filter="url(#paper)"
                />
            </g>
            <g
                className="enter-sprout"
                style={
                    {
                        ...delay(460),
                        "--ox": "150px",
                        "--oy": "214px",
                        "--sway": "4deg",
                    } as CSSProperties
                }
            >
                <g filter="url(#paper)">
                    <path
                        d={LEAF}
                        transform="translate(150 214) rotate(-20) scale(1.7) translate(-18 -82)"
                        fill="var(--ink)"
                    />
                </g>
            </g>
        </svg>
    );
}
