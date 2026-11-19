import type { CSSProperties } from "react";

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

// Each piece is two groups: the outer one animates in on load (see .piece in globals.css), the
// inner one carries the paper filter, so the animation never replaces the paper edge and shadow.
const piece = (i: number) => ({ "--i": i }) as CSSProperties;

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
            </defs>
            <g className="piece" style={piece(0)}>
                <g filter="url(#paper)">
                    <circle cx={138 * GRID} cy={100 * GRID} r={76 * GRID} style={tint(18)} />
                </g>
            </g>
            <g className="piece" style={piece(1)}>
                <g filter="url(#paper)">
                    <path d={LEAF} transform={SIDE_LEAF} style={tint(45)} />
                </g>
            </g>
            <g className="piece" style={piece(2)}>
                <g filter="url(#paper)">
                    <g mask="url(#paper-art-vein)">
                        <path d={LEAF} transform={LOGO} fill="var(--ink)" />
                    </g>
                </g>
            </g>
            <g className="piece" style={piece(3)}>
                <g filter="url(#paper)">
                    <path d={PEBBLE} transform={LOGO} fill="var(--orange)" />
                </g>
            </g>
            <g className="piece" style={piece(4)}>
                <g filter="url(#paper)">
                    <circle cx={76 * GRID} cy={44 * GRID} r={6 * GRID} fill="var(--orange)" />
                </g>
            </g>
        </svg>
    );
}
