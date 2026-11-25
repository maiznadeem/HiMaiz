import Link from "next/link";
import { LeafMark } from "@/components/LeafMark";
import { EMAIL } from "@/lib/site";

export function SiteHeader({ current }: { current?: "work" }) {
    return (
        <header className="flex items-center justify-between gap-4 py-6">
            <Link
                href="/"
                className="brand -m-1 inline-flex items-center gap-2.5 rounded-sm p-1 text-lg font-semibold"
            >
                <LeafMark size={28} />
                Maiz Nadeem
            </Link>
            <nav aria-label="Site" className="flex items-center gap-6">
                <Link
                    className="link font-semibold"
                    href="/work"
                    aria-current={current === "work" ? "page" : undefined}
                >
                    Work
                </Link>
                <a className="link font-semibold" href={`mailto:${EMAIL}`}>
                    Email
                </a>
            </nav>
        </header>
    );
}
