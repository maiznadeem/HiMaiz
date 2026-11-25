"use client";

import { useRef, type ReactNode } from "react";
import { usePopUps } from "./usePopUps";

/** A wrapper whose [data-pop-root] children pop up as they scroll into view. */
export function PopUps({ className, children }: { className?: string; children: ReactNode }) {
    const root = useRef<HTMLDivElement>(null);
    usePopUps(root);
    return (
        <div ref={root} className={className}>
            {children}
        </div>
    );
}
