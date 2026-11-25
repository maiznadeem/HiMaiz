import type { CSSProperties, ReactNode } from "react";

/**
 * Hand-cut outlines, as clip-path polygons: edges that wander a little, like paper cut with
 * scissors. Percentages, so a cut keeps its character at any size.
 */
export const CUTS = [
    "polygon(0.6% 1.8%, 24% 0.4%, 51% 1.4%, 77% 0, 99.4% 1.2%, 100% 34%, 99.2% 68%, 99.8% 98.6%, 72% 99.6%, 47% 98.8%, 21% 100%, 0.4% 99%, 1% 63%, 0 31%)",
    "polygon(1.2% 0, 33% 1.6%, 64% 0.2%, 98.8% 1%, 99.6% 27%, 98.6% 59%, 100% 99.2%, 66% 98.4%, 38% 100%, 0 98.8%, 0.8% 71%, 0 40%)",
    "polygon(0 0.8%, 46% 0, 100% 1.6%, 99% 51%, 100% 100%, 54% 98.6%, 1.4% 100%, 0.4% 48%)",
    "polygon(2% 0.4%, 97% 0, 100% 3%, 99.2% 50%, 99.6% 97%, 96% 100%, 50% 99%, 3% 100%, 0 96%, 0.8% 46%, 0 4%)",
];

/** Paper colours. Paper is opaque, so tints are mixes of tokens, never see-through. */
export type Tone = "sheet" | "grey" | "deep" | "ink" | "orange";

type Tag = "div" | "article" | "section" | "li" | "figure" | "span";

/**
 * A piece of cut paper holding content. The paper itself is an aria-hidden layer behind the
 * content: its outline is clipped and its parent casts the shadow, so the shadow follows the
 * cut and the text stays crisp (see .cut and .paper in work.css).
 */
export function CutPaper({
    as: Element = "div",
    tone = "sheet",
    cut = 0,
    tilt = 0,
    className = "",
    style,
    id,
    children,
}: {
    as?: Tag;
    tone?: Tone;
    /** Which outline, wrapping round CUTS. */
    cut?: number;
    /** Degrees; the piece lies a little crooked, as paper does. */
    tilt?: number;
    className?: string;
    style?: CSSProperties;
    id?: string;
    children?: ReactNode;
}) {
    const vars = {
        "--cut": CUTS[cut % CUTS.length],
        "--tilt": `${tilt}deg`,
        ...style,
    } as CSSProperties;
    return (
        <Element id={id} className={`cut tone-${tone} ${className}`} style={vars}>
            <span className="paper" aria-hidden="true" />
            {children}
        </Element>
    );
}

/** A delay for the pop-up motion, in ms (see .pop in work.css). */
export const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
