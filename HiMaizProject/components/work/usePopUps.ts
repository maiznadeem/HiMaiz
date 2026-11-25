"use client";

import { useEffect, type RefObject } from "react";

/**
 * Opens each [data-pop-root] inside `root` once it scrolls into view, so its pieces pop up
 * (CSS in work.css, keyed on [data-open]). The closed state only applies when the root layout's
 * inline script has marked the page `js`; `fly-ready` tells the CSS this hook is running, which
 * turns off the fallback that opens everything if the scripts never start.
 */
export function usePopUps(root: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const element = root.current;
        if (!element) return;
        document.documentElement.classList.add("fly-ready");
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    (entry.target as HTMLElement).dataset.open = "";
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.15 },
        );
        element.querySelectorAll("[data-pop-root]").forEach((target) => observer.observe(target));
        return () => observer.disconnect();
    }, [root]);
}
