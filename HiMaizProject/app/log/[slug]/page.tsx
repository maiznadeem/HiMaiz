import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatFullDate } from "@/lib/dates";
import { getLogEntries, getLogEntry, renderMarkdown } from "@/lib/log";
import { entryMetadata } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return getLogEntries()
        .filter((entry) => entry.hasPage)
        .map(({ slug }) => ({ slug }));
}

async function findEntry(params: Props["params"]) {
    const { slug } = await params;
    const entry = getLogEntry(slug);
    if (!entry?.hasPage) notFound();
    return entry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const entry = await findEntry(params);
    return entryMetadata(entry);
}

export default async function LogEntryPage({ params }: Props) {
    const entry = await findEntry(params);
    return (
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col page-pad">
            <SiteHeader />
            <main className="flex-1 pt-8 pb-8 md:pt-14">
                <article>
                    <time className="text-muted" dateTime={entry.date}>
                        {formatFullDate(entry.date)}
                    </time>
                    <h1 className="display mt-3 max-w-[22ch] [overflow-wrap:anywhere] text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.08] text-balance">
                        {entry.summary}
                    </h1>
                    <div
                        className="prose mt-10"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.body) }}
                    />
                </article>
                <p className="mt-14">
                    <Link className="link font-semibold" href="/">
                        Back to the log
                    </Link>
                </p>
            </main>
            <div className="mt-16">
                <SiteFooter />
            </div>
        </div>
    );
}
