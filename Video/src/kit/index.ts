// Everything a scene file needs. See Video/README.md for what each piece does.
export { THEMES, THEME_NAMES, isThemeName, type Theme, type ThemeName } from "./themes";
export {
    cueFrame,
    cueSeconds,
    useFrame,
    useProgress,
    useSpringIn,
    useTheme,
    useTimeline,
    useWobble,
    type Cue,
    type SceneTimeline,
    type Span,
    type TimedLine,
} from "./timing";
export { SAFE, CAPTION_BAND_TOP, Place, Shot, Stage, useType } from "./stage";
export { Leaf, Paper, Pebble, cutEdge, paperShadow } from "./paper";
export { hashString, jitter, seeded } from "./random";
export { Tag, TitleCard, WriteOn } from "./pieces/text";
export { CountUp, GrowBar, LineGrow } from "./pieces/numbers";
export { Arrow, BOX, Box, DotStream, edge, type BoxKind } from "./pieces/diagram";
export { BeforeAfter, Timeline } from "./pieces/compare";
export { lerpPoint, roughPath, type Point } from "./pieces/rough";

import type { ComponentType } from "react";
import type { ThemeName } from "./themes";
import type { Cue } from "./timing";

/** What a scene file (src/<slug>/<scene-id>.tsx) exports. */
export type SceneModule = {
    default: ComponentType;
    /** The look. Optional when the slug is itself a theme name (qoria, ez-spectrum, prtl-labs). */
    theme?: ThemeName;
    /** The moment used for the poster. Default: the end of the last line. */
    poster?: Cue;
};
