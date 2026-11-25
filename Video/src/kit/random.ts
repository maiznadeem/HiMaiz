/** Small seeded helpers so every frame renders the same way on every machine. */

export function hashString(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/** mulberry32: a fast deterministic generator returning numbers in [0, 1). */
export function seeded(seed: number | string): () => number {
    let a = typeof seed === "string" ? hashString(seed) : seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A single repeatable random number in [-1, 1] for a seed and an index. */
export function jitter(seed: string, index: number): number {
    return seeded(`${seed}:${index}`)() * 2 - 1;
}
