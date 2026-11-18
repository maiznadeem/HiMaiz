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
            </defs>
        </svg>
    );
}
