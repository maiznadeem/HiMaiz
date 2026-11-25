import { ezSpectrum } from "./ez-spectrum";
import { prtlLabs } from "./prtl-labs";
import { qoria } from "./qoria";
import type { Theme, ThemeName } from "./types";

export * from "./types";

export const THEMES: Record<ThemeName, Theme> = {
    qoria,
    "ez-spectrum": ezSpectrum,
    "prtl-labs": prtlLabs,
};
