import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-[var(--gutter)]">
            <SiteHeader />
            <main className="flex-1 pt-10 md:pt-16">
                <h1 className="display max-w-[16ch] text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.02] text-balance">
                    This page doesn&apos;t exist.
                </h1>
                <p className="mt-6 max-w-[34ch] text-lg text-muted md:text-xl">
                    The link may be old, or the entry may not be published yet.
                </p>
                <p className="mt-8">
                    <Link className="link font-semibold" href="/">
                        Go to the home page
                    </Link>
                </p>
            </main>
            <div className="mt-16">
                <SiteFooter />
            </div>
        </div>
    );
}
