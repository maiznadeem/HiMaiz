/**
 * A hand-drawn ink line in place of a straight border, in `currentColor`. The viewBox stretches
 * only sideways, so the nearly flat line keeps its --rule-weight thickness at any width.
 */
export function InkRule({ className = "", draw = false }: { className?: string; draw?: boolean }) {
    return (
        <svg
            className={`block h-3 w-full overflow-visible ${className}`}
            viewBox="0 0 1000 12"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path
                className={draw ? "ink-line" : undefined}
                d="M1 6.6C150 4.6 330 7.8 500 6.1S830 4.9 999 7"
                pathLength={1}
                fill="none"
                stroke="currentColor"
                style={{ strokeWidth: "var(--rule-weight, 2px)" }}
                strokeLinecap="round"
            />
        </svg>
    );
}
