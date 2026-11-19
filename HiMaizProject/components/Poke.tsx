"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

/**
 * An SVG group that plays its poke animation once when the pointer reaches it or taps it, then
 * waits for the next touch. The animation itself is CSS ([data-poked] in globals.css), so with
 * reduced motion a poke does nothing.
 */
export function Poke({
    className,
    style,
    children,
}: {
    className: string;
    style?: CSSProperties;
    children: ReactNode;
}) {
    const [poked, setPoked] = useState(false);
    const poke = () => setPoked(true);
    return (
        <g
            className={className}
            style={style}
            data-poked={poked || undefined}
            onPointerEnter={poke}
            onPointerDown={poke}
            onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) setPoked(false);
            }}
        >
            {children}
        </g>
    );
}
