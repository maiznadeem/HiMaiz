import type { CSSProperties, ReactNode } from "react";

/** Wraps a few words with an orange, hand-drawn double underline that draws itself in on load. */
export function InkUnderline({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    const style = (extra: number) => ({ "--d": `${delay + extra}ms` }) as CSSProperties;
    return (
        <span className="relative whitespace-nowrap">
            {children}
            <svg
                className="pointer-events-none absolute -bottom-[0.2em] -left-[3%] h-[0.3em] w-[106%] overflow-visible"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
                fill="none"
                stroke="var(--orange)"
                strokeLinecap="round"
                strokeWidth="5"
            >
                <path
                    className="ink-line"
                    style={style(0)}
                    d="M3 8C46 3 118 2 197 6"
                    pathLength={1}
                />
                <path
                    className="ink-line"
                    style={style(260)}
                    d="M22 16C70 11 128 10 172 13"
                    pathLength={1}
                />
            </svg>
        </span>
    );
}
