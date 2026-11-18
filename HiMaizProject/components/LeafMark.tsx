type LeafMarkProps = {
    size?: number;
    flat?: boolean;
    title?: string;
};

export function LeafMark({ size = 28, flat = false, title }: LeafMarkProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 100 100"
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            focusable="false"
        >
            {title ? <title>{title}</title> : null}
            <g filter={flat ? undefined : "url(#paper)"}>
                <path d="M18 82C16 50 34 20 76 14 82 46 62 78 18 82Z" fill="var(--ink)" />
                <path
                    d="M23 77C40 58 54 40 71 20"
                    stroke="var(--stone)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M70 64c8-4 16 2 14 10-2 8-14 10-18 4-3-5-1-11 4-14z"
                    fill="var(--orange)"
                />
            </g>
        </svg>
    );
}
