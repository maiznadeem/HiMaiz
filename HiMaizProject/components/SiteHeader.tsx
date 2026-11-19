import Link from "next/link";
import { LeafMark } from "@/components/LeafMark";
import { EMAIL } from "@/lib/site";

export function SiteHeader() {
    return (
        <header className="flex items-center justify-between gap-4 py-6">
            <Link
                href="/"
                className="brand -m-1 inline-flex items-center gap-2.5 rounded-sm p-1 text-lg font-semibold"
            >
                <LeafMark size={28} />
                Maiz Nadeem
            </Link>
            <a className="link font-semibold" href={`mailto:${EMAIL}`}>
                Email
            </a>
        </header>
    );
}
