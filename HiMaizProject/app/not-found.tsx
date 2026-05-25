import Link from "next/link";

export default function NotFound() {
    return (
        <main className="grid min-h-dvh place-items-center bg-[var(--page-bg)] px-6 text-center text-[var(--ink)]">
            <div>
                <p className="eyebrow">404</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-normal">Signal lost.</h1>
                <p className="mt-4 max-w-md text-[var(--muted)]">
                    This route is not part of the current build.
                </p>
                <Link className="contact-link mt-8 inline-flex" href="/">
                    return home
                </Link>
            </div>
        </main>
    );
}
