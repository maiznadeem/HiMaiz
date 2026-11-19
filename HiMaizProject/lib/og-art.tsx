const LEAF = "M18 82C16 50 34 20 76 14 82 46 62 78 18 82Z";
const VEIN = "M23 77C40 58 54 40 71 20";
const PEBBLE = "M70 64c8-4 16 2 14 10-2 8-14 10-18 4-3-5-1-11 4-14z";
const SHADOW = "rgba(0,0,0,.18)";

/**
 * Flat leaf and pebble for the social image and Apple icon. Satori has no filters, so
 * each piece gets a faked shadow: the same path, drawn behind it and offset a fixed 4px
 * right and 6px down at any size (so 4/scale and 6/scale units in the 100 unit box).
 */
export function LeafPebble({ size }: { size: number }) {
    const scale = size / 100;
    const shadow = `translate(${4 / scale} ${6 / scale})`;
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <path d={LEAF} fill={SHADOW} transform={shadow} />
            <path d={LEAF} fill="#191919" />
            <path d={VEIN} stroke="#e7e7e2" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d={PEBBLE} fill={SHADOW} transform={shadow} />
            <path d={PEBBLE} fill="#ff4f1a" />
        </svg>
    );
}
