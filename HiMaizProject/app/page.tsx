import type { CSSProperties } from "react";
import Link from "next/link";
import { SignalLoom } from "@/components/SignalLoom";

const signals = ["craft", "systems", "interfaces", "stories"];

export default function Home() {
    return (
        <main className="site-shell relative overflow-hidden bg-[var(--page-bg)] text-[var(--ink)]">
            <SignalLoom />

            <section className="site-frame relative z-10 flex flex-col justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
                <header className="flex items-center justify-between gap-4">
                    <Link className="brand-lockup" href="/" aria-label="Maiz home">
                        <span className="brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 128 128" focusable="false">
                                <rect width="128" height="128" rx="28" />
                                <path d="M26 94V34H48L64 62L80 34H102V94H86V58L70 86H58L42 58V94H26Z" />
                                <path d="M80 34H102V56H80V34Z" />
                                <path d="M80 56H86V70L70 86H58L80 56Z" />
                            </svg>
                        </span>
                        <span>HiMaiz</span>
                    </Link>
                    <div className="status-pill" aria-label="Website status">
                        <span />
                        online soon
                    </div>
                </header>

                <div className="site-content grid min-w-0 items-end gap-12 pb-8 pt-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-12 lg:pt-28">
                    <div className="min-w-0 max-w-5xl">
                        <p className="eyebrow">personal site in progress</p>
                        <h1
                            className="hero-title mt-5 font-semibold tracking-normal"
                            aria-label="Maiz is tuning the signal."
                        >
                            <span aria-hidden="true">Maiz is</span>
                            <span aria-hidden="true">tuning the</span>
                            <span aria-hidden="true">signal.</span>
                        </h1>
                        <p className="hero-copy mt-7 max-w-2xl text-pretty text-lg leading-8 text-[var(--muted)] sm:text-xl">
                            A compact home for the work, notes, experiments, and useful odd little
                            tools is being shaped here. Until then, this page is the workshop light
                            left on.
                        </p>
                    </div>

                    <aside className="launch-panel min-w-0" aria-label="Launch details">
                        <div>
                            <p className="panel-label">now building</p>
                            <p className="panel-value">portfolio, notes, and experiments</p>
                        </div>
                        <div className="signal-list" aria-label="Areas of focus">
                            {signals.map((signal, index) => (
                                <span key={signal} style={{ "--i": index } as CSSProperties}>
                                    {signal}
                                </span>
                            ))}
                        </div>
                        <a className="contact-link" href="mailto:contact.maiznadeem@gmail.com">
                            contact.maiznadeem@gmail.com
                        </a>
                    </aside>
                </div>
            </section>
        </main>
    );
}
