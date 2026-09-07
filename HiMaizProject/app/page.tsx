"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Pause, Play } from "lucide-react";
import { motion, useSpring } from "motion/react";
import { Monolith } from "@/components/Monolith";

const email = "contact.maiznadeem@gmail.com";

function subscribeReducedMotion(onChange: () => void) {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", onChange);
    return () => preference.removeEventListener("change", onChange);
}

function getReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotion() {
    return false;
}

export default function Home() {
    const reducedMotion = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotion,
        getServerReducedMotion,
    );
    const [paused, setPaused] = useState(false);
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const x = useSpring(0, { stiffness: 180, damping: 16, mass: 0.4 });
    const y = useSpring(0, { stiffness: 180, damping: 16, mass: 0.4 });
    const motionPaused = paused || Boolean(reducedMotion);

    useEffect(
        () => () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        },
        [],
    );

    useEffect(() => {
        if (motionPaused) {
            x.jump(0);
            y.jump(0);
        }
    }, [motionPaused, x, y]);

    function followPointer(event: PointerEvent<HTMLAnchorElement>) {
        if (motionPaused || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - bounds.left - bounds.width / 2) * 0.12);
        y.set((event.clientY - bounds.top - bounds.height / 2) * 0.2);
    }

    async function copyEmail() {
        if (resetTimer.current) clearTimeout(resetTimer.current);
        try {
            await navigator.clipboard.writeText(email);
            setCopyStatus("copied");
        } catch {
            setCopyStatus("error");
        }
        resetTimer.current = setTimeout(() => setCopyStatus("idle"), 2600);
    }

    return (
        <main className="site-shell" data-motion={motionPaused ? "paused" : "running"}>
            <header className="site-header">
                <Link className="brand-lockup" href="/" aria-label="HiMaiz home">
                    <svg className="brand-mark" viewBox="0 0 128 128" aria-hidden="true">
                        <path
                            d="M26 94V34H48L64 62L80 34H102V94H86V58L70 86H58L42 58V94H26Z"
                            fill="currentColor"
                        />
                        <path d="M80 34H102V56H80V34Z" fill="#7ff0d7" />
                    </svg>
                    <span>
                        HiMaiz<span className="brand-period">.</span>
                    </span>
                </Link>
                <p className="header-note">An independent point of view.</p>
                <a className="header-contact" href={`mailto:${email}`}>
                    Say hello <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </a>
            </header>

            <section className="hero" aria-labelledby="hero-title">
                <div className="composition-guides" aria-hidden="true">
                    <span className="guide guide-one" />
                    <span className="guide guide-two" />
                    <span className="guide guide-three" />
                    <span className="registration registration-one">+</span>
                    <span className="registration registration-two">+</span>
                </div>
                <Monolith paused={motionPaused} />
                <div className="hero-intro">
                    <p className="eyebrow reveal reveal-one">
                        <span className="index-number">01 /</span> A personal space, taking shape
                    </p>
                    <h1 id="hero-title" className="hero-title">
                        <span className="title-line">
                            <span>Maiz</span>
                        </span>
                        <span className="title-line">
                            <span>
                                Nadeem<span className="title-period">.</span>
                            </span>
                        </span>
                    </h1>
                    <div className="hero-description reveal reveal-three">
                        <span className="description-rule" aria-hidden="true" />
                        <p>
                            Thoughtful code. Curious experiments.
                            <br />A new home for everything in between.
                        </p>
                    </div>
                </div>
                <div className="hero-bottom reveal reveal-four">
                    <p className="coming-soon">
                        <span aria-hidden="true" /> Good things are in the making.
                    </p>
                    <div className="art-caption">
                        <div className="art-caption-copy">
                            <span>MONOLITH / M</span>
                            <span>A study in becoming.</span>
                        </div>
                        <button
                            className="icon-button motion-toggle"
                            type="button"
                            aria-label={motionPaused ? "Play animation" : "Pause animation"}
                            aria-pressed={motionPaused}
                            disabled={Boolean(reducedMotion)}
                            onClick={() => setPaused((value) => !value)}
                        >
                            {motionPaused ? (
                                <Play size={16} aria-hidden="true" />
                            ) : (
                                <Pause size={16} aria-hidden="true" />
                            )}
                            <span className="tooltip">
                                {reducedMotion
                                    ? "Reduced motion enabled"
                                    : motionPaused
                                      ? "Play animation"
                                      : "Pause animation"}
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            <footer className="site-footer reveal reveal-four">
                <div className="footer-invitation">
                    <p className="eyebrow">The website can wait.</p>
                    <p className="footer-heading">A good conversation can&apos;t.</p>
                </div>
                <div className="contact-area">
                    <motion.a
                        className="contact-link"
                        href={`mailto:${email}`}
                        style={{ x, y }}
                        onPointerMove={followPointer}
                        onPointerLeave={() => {
                            x.set(0);
                            y.set(0);
                        }}
                    >
                        <span>{email}</span>
                        <ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" />
                    </motion.a>
                    <button
                        className="icon-button copy-button"
                        type="button"
                        onClick={copyEmail}
                        aria-label={copyStatus === "copied" ? "Email copied" : "Copy email address"}
                    >
                        {copyStatus === "copied" ? (
                            <Check size={16} aria-hidden="true" />
                        ) : (
                            <Copy size={16} aria-hidden="true" />
                        )}
                        <span className="tooltip">
                            {copyStatus === "copied"
                                ? "Copied"
                                : copyStatus === "error"
                                  ? "Use the email link"
                                  : "Copy email"}
                        </span>
                    </button>
                    <span className="sr-only" role="status">
                        {copyStatus === "copied"
                            ? "Email address copied to clipboard."
                            : copyStatus === "error"
                              ? "Couldn't copy. Please use the email link."
                              : ""}
                    </span>
                </div>
                <div className="footer-colophon">
                    <span>Made with intent.</span>
                    <span className="launch-status">
                        <span aria-hidden="true" /> Portfolio coming soon
                    </span>
                </div>
            </footer>
        </main>
    );
}
