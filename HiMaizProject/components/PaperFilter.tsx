export function PaperFilter() {
    return (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <defs>
                <filter id="paper" x="-15%" y="-15%" width="130%" height="130%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.06"
                        numOctaves="2"
                        seed="4"
                        result="n"
                    />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" result="cut" />
                    <feDropShadow
                        in="cut"
                        dx="0.8"
                        dy="1.6"
                        stdDeviation="0.9"
                        style={{ floodColor: "var(--paper-shadow)" }}
                    />
                </filter>
                {/* Ink: three roughened versions of the same line. Cycling between them makes
                    hand-drawn marks "boil" like frame-by-frame animation (see .ink in globals.css).
                    The region is in PaperArt's units, because a straight line has a zero-height
                    bounding box. */}
                {[3, 11, 23].map((seed, i) => (
                    <filter
                        key={seed}
                        id={`ink-${i}`}
                        filterUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="600"
                        height="500"
                    >
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.07"
                            numOctaves="2"
                            seed={seed}
                            result="n"
                        />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
                    </filter>
                ))}
            </defs>
        </svg>
    );
}
