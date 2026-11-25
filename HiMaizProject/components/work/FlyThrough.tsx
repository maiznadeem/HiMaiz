"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { usePopUps } from "./usePopUps";

/** One page of the fly-through: the element id of its spread, and its name in the progress rail. */
export type Step = { id: string; label: string; mark: string };

// Keys that move between spreads. Space and Shift+Space follow the browser's own paging.
const FORWARD = new Set(["ArrowDown", "PageDown", "ArrowRight"]);
const BACK = new Set(["ArrowUp", "PageUp", "ArrowLeft"]);

/** Inside these, keys belong to the control: arrows seek a video, space presses a button. */
const OWNS_KEYS = "input, textarea, select, video, audio, [contenteditable]";
const OWNS_SPACE = "button, summary, a, [role=button]";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Turns a stack of full-screen spreads into a fly-through: scroll, swipe (CSS snap), arrow keys,
 * Page Up/Down or space move a page at a time; a rail of page tabs (wide screens) or a meter
 * (narrow ones) shows where you are and how much is left. Without JavaScript the spreads are a
 * plain readable page and the rail tabs are ordinary anchor links.
 */
export function FlyThrough({ steps, children }: { steps: Step[]; children: ReactNode }) {
    const root = useRef<HTMLDivElement>(null);
    const hydrated = useHydrated();
    const [current, setCurrent] = useState(0);
    const [announcement, setAnnouncement] = useState("");
    usePopUps(root);

    const spreads = useCallback(
        () =>
            steps
                .map((step) => document.getElementById(step.id))
                .filter((el): el is HTMLElement => el !== null),
        [steps],
    );

    // The current spread is the one crossing a line just under the middle of the screen.
    useEffect(() => {
        const elements = spreads();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting)
                        setCurrent(elements.indexOf(entry.target as HTMLElement));
                }
            },
            { rootMargin: "-45% 0px -54% 0px" },
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [spreads]);

    const go = useCallback(
        (direction: 1 | -1) => {
            const elements = spreads();
            const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
            const tops = elements.map((el) => el.getBoundingClientRect().top);
            // The spread being read is the last one whose top has reached the top of the screen;
            // above the cover (the header still showing) counts as the cover.
            const index = Math.max(
                0,
                tops.findLastIndex((top) => top <= 40),
            );
            // A key always lands on a spread's top: forward on the next one, back on the top of
            // this one if it has been scrolled into, else the one before. Inside a spread taller
            // than the screen the reader scrolls as on any page.
            const target = direction === 1 ? index + 1 : tops[index] < -40 ? index : index - 1;
            if (target < 0) {
                window.scrollTo({ top: 0, behavior });
                return;
            }
            const next = elements[target];
            if (!next) {
                // Past the last spread: on to the footer at the bottom of the page.
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
                return;
            }
            next.scrollIntoView({ behavior, block: "start" });
            const step = steps[target];
            setAnnouncement(`${step.mark}. ${step.label}`);
        },
        [spreads, steps],
    );

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
            const target = event.target instanceof Element ? event.target : null;
            if (target?.closest(OWNS_KEYS)) return;
            let direction: 1 | -1 | 0 = 0;
            if (FORWARD.has(event.key)) direction = 1;
            else if (BACK.has(event.key)) direction = -1;
            else if (event.key === " " && !target?.closest(OWNS_SPACE)) {
                direction = event.shiftKey ? -1 : 1;
            }
            if (!direction) return;
            event.preventDefault();
            go(direction);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go]);

    const last = steps.length - 1;
    return (
        <div ref={root} className="flythrough">
            {/* The page tabs and the meter come first, so keyboard users meet them before the content. */}
            <nav className="fly-rail" aria-label="Pages of this case study">
                <ol>
                    {steps.map((step, i) => (
                        <li key={step.id}>
                            <a
                                className="fly-tab cut"
                                href={`#${step.id}`}
                                aria-current={hydrated && i === current ? "step" : undefined}
                                data-done={hydrated && i < current ? "" : undefined}
                            >
                                <span className="paper" aria-hidden="true" />
                                <span aria-hidden="true">{step.mark}</span>
                                <span className="fly-tab-label">{step.label}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
            {hydrated ? (
                <div className="fly-meter cut tone-sheet">
                    <span className="paper" aria-hidden="true" />
                    <button
                        type="button"
                        className="fly-step"
                        onClick={() => go(-1)}
                        disabled={current === 0}
                        aria-label="Previous page"
                    >
                        <Chevron up />
                    </button>
                    <span className="fly-dots" aria-hidden="true">
                        {steps.map((step, i) => (
                            <span
                                key={step.id}
                                data-done={i < current ? "" : undefined}
                                data-current={i === current ? "" : undefined}
                            />
                        ))}
                    </span>
                    <span className="fly-count">
                        {current + 1} of {steps.length}
                    </span>
                    <button
                        type="button"
                        className="fly-step"
                        onClick={() => go(1)}
                        disabled={current === last}
                        aria-label="Next page"
                    >
                        <Chevron />
                    </button>
                </div>
            ) : null}
            {children}
            <p className="sr-only" aria-live="polite">
                {announcement}
            </p>
        </div>
    );
}

function Chevron({ up = false }: { up?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            focusable="false"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={up ? { rotate: "180deg" } : undefined}
        >
            <path d="M6 9.5c2 2 4 4 6 5.5 2-1.5 4-3.5 6-5.5" />
        </svg>
    );
}
