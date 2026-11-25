// Page texture layers, as CSS background images. Each look picks its layers and their colours in its
// own theme file; nothing here decides a colour.

function svgUrl(svg: string): string {
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/** Fine paper grain. `light` 1 makes light specks (for a dark page), 0 dark specks. */
export function grain(light: 0 | 1, alpha: number): string {
    return svgUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" stitchTiles="stitch" seed="7"/><feColorMatrix values="0 0 0 0 ${light}  0 0 0 0 ${light}  0 0 0 0 ${light}  0 0 0 ${alpha} 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
    );
}

/** A faint square grid, like graph paper. */
export function grid(stroke: string, size = 64): string {
    return svgUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><path d="M${size} 0H0V${size}" fill="none" stroke="${stroke}" stroke-width="1.5"/></svg>`,
    );
}

/** A dot grid. */
export function dots(fill: string, size = 48): string {
    return svgUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="2" fill="${fill}"/></svg>`,
    );
}

/** Long paper fibres, tinted [r, g, b] (0 to 1) at `alpha`. */
export function fibres(rgb: [number, number, number], alpha: number): string {
    const [r, g, b] = rgb;
    return svgUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.18" numOctaves="3" seed="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 ${alpha} 0"/></filter><rect width="100%" height="100%" filter="url(#f)"/></svg>`,
    );
}
