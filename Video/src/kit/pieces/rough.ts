import { jitter } from "../random";

export type Point = [number, number];

/**
 * A hand-drawn line from `a` to `b`: a slight bow plus small seeded wiggles, smoothed into curves.
 * `amp` is the wiggle in pixels, `bow` the sideways bend as a share of the length.
 */
export function roughPath(a: Point, b: Point, seed: string, amp = 3, bow = 0.04): string {
    const [x1, y1] = a;
    const [x2, y2] = b;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const steps = Math.max(3, Math.round(len / 80));
    // Always bend the same way, so a boiling line wiggles but never flips from frame to frame.
    const bend = bow * len;
    const pts: Point[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const edge = i === 0 || i === steps ? 0.3 : 1;
        const off = Math.sin(Math.PI * t) * bend + jitter(seed, i) * amp * edge;
        pts.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off]);
    }
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2;
        const my = (pts[i][1] + pts[i + 1][1]) / 2;
        d += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
    return d;
}

/** A point part of the way along a straight segment. */
export function lerpPoint(a: Point, b: Point, t: number): Point {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
