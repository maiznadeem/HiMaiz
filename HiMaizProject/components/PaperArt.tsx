import type { CSSProperties, ReactNode } from "react";

import { Poke } from "./Poke";

const LEAF = "M18 82C16 50 34 20 76 14 82 46 62 78 18 82Z";
const VEIN = "M23 77C40 58 54 40 71 20";
const PEBBLE = "M70 64c8-4 16 2 14 10-2 8-14 10-18 4-3-5-1-11 4-14z";

// The shapes are drawn on a 204-unit grid, scaled up so that one unit of the shared #paper
// filter is about one screen pixel: the same edge and shadow the logo has in the mockups.
const GRID = 2;
const at = (transform: string) => `scale(${GRID}) ${transform}`;

// The logo's leaf and pebble, scaled up together so they keep the logo's relationship.
const LOGO = at("translate(116 204) rotate(-8) scale(2) translate(-18 -82)");
// A smaller, mirrored leaf growing from the same point, leaning the other way.
const SIDE_LEAF = at("translate(110 200) rotate(16) scale(-1.2 1.2) translate(-18 -82)");

// Paper is opaque, so tints are mixes of two tokens rather than see-through opacity.
const tint = (percent: number) => ({
    fill: `color-mix(in srgb, var(--muted) ${percent}%, var(--stone))`,
});

const startAt = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// Where each leaf meets the stem, in svg units: the point the leaves sprout, sway and rustle around.
const LOGO_STEM = [232, 408];
const SIDE_STEM = [220, 400];

type Motion = "lay" | "sprout" | "drop" | "pop";

/**
 * One cut piece, in layers so its animations never fight over one transform (see globals.css):
 * - the outer group enters once on load, starting at `start` ms;
 * - the next one moves gently forever after (leaves sway, the pebble rocks, the dot floats);
 * - the next one reacts when poked (leaves rustle, the pebble hops, the dot bounces);
 * - the inner one carries the #paper filter, so motion never replaces the paper edge and shadow.
 */
function Piece({
    motion,
    start,
    stem,
    sway = [0, 0],
    children,
}: {
    motion: Motion;
    start: number;
    stem?: number[];
    /** How far, in degrees, and how slowly, in seconds, a leaf sways. */
    sway?: [number, number];
    children: ReactNode;
}) {
    const paper = <g filter="url(#paper)">{children}</g>;
    const vars = {
        ...startAt(start),
        ...(stem && { "--ox": `${stem[0]}px`, "--oy": `${stem[1]}px` }),
        "--sway": `${sway[0]}deg`,
        "--sway-t": `${sway[1]}s`,
    } as CSSProperties;
    return (
        <g className={`piece enter-${motion}`} style={vars}>
            {motion === "lay" ? (
                paper
            ) : (
                <g className={`idle idle-${motion}`}>
                    <Poke className={`poke poke-${motion}`}>{paper}</Poke>
                </g>
            )}
        </g>
    );
}

// Hand-drawn ink marks over the paper, in svg units. Each draws itself in after the pieces land
// (--d is its start, see .ink-line in globals.css). Several strokes in one path draw in turn.
const TRAIL =
    "M452 128C462 96 452 64 424 56 396 48 378 70 392 84 406 98 428 80 412 62 386 34 306 30 246 40 206 47 182 60 170 72";
const MARKS = [
    // The pebble's drop lines, as if it had just fallen into place.
    { d: "M466 292 462 279M481 289 482 275M495 296 501 284", at: 1330 },
    // Pops around the small dot where the trail ends.
    { d: "M133 71 122 60M151 63 150 48M131 92 116 95", at: 1900 },
    // A curled stem under the two leaves. It draws first and the leaves sprout from it.
    {
        d: "M228 404C222 420 206 430 188 428 172 426 170 410 182 408 194 406 197 421 185 430",
        at: 120,
    },
];
/** The hero composition: the logo's leaf and pebble scaled up, with a few more cut pieces. */
export function PaperArt({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="100 28 408 408"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                {/* The vein is a cut: whatever lies under the leaf shows through it. */}
                {/* The id is fixed because the art renders once per page. */}
                <mask
                    id="paper-art-vein"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="560"
                    height="480"
                >
                    <rect width="560" height="480" fill="white" />
                    <path
                        d={VEIN}
                        transform={LOGO}
                        stroke="black"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        fill="none"
                    />
                </mask>
                {/* The dashed trail draws in through a solid copy of itself. */}
                <mask
                    id="paper-art-trail"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="560"
                    height="480"
                >
                    <path
                        className="ink-line"
                        style={startAt(1250)}
                        d={TRAIL}
                        pathLength={1}
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />
                </mask>
            </defs>
            <Piece motion="lay" start={0}>
                <circle cx={138 * GRID} cy={100 * GRID} r={76 * GRID} style={tint(18)} />
            </Piece>
            <Piece motion="sprout" start={420} stem={SIDE_STEM} sway={[-2.4, 6.4]}>
                <path d={LEAF} transform={SIDE_LEAF} style={tint(45)} />
            </Piece>
            <Piece motion="sprout" start={560} stem={LOGO_STEM} sway={[1.6, 5.4]}>
                <g mask="url(#paper-art-vein)">
                    <path d={LEAF} transform={LOGO} fill="var(--ink)" />
                </g>
            </Piece>
            <Piece motion="drop" start={880}>
                <path d={PEBBLE} transform={LOGO} fill="var(--orange)" />
            </Piece>
            <Piece motion="pop" start={1720}>
                <circle cx={76 * GRID} cy={44 * GRID} r={6 * GRID} fill="var(--orange)" />
            </Piece>
            <g
                className="ink"
                pointerEvents="none"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d={TRAIL} strokeDasharray="5 8" mask="url(#paper-art-trail)" />
                {MARKS.map((mark) => (
                    <path
                        key={mark.d}
                        className="ink-line"
                        style={startAt(mark.at)}
                        d={mark.d}
                        pathLength={1}
                    />
                ))}
            </g>
        </svg>
    );
}
