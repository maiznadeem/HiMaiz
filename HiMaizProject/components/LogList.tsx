import Link from "next/link";
import { InkRule } from "@/components/InkRule";
import { formatMonth } from "@/lib/dates";
import type { LogEntry } from "@/lib/log";

export function LogList({ entries }: { entries: LogEntry[] }) {
    if (entries.length === 0) return null;
    return (
        <section aria-labelledby="log-heading">
            <InkRule draw className="mb-4 text-ink [--d:1100ms] [--rule-weight:2.5px]" />
            <h2 id="log-heading" className="sr-only">
                Work log
            </h2>
            <ol className="grid gap-3">
                {entries.map((entry) => (
                    <li
                        key={entry.slug}
                        className="grid gap-x-8 gap-y-0.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] [&>time]:text-muted [&>time]:tabular-nums"
                    >
                        <time dateTime={entry.date}>{formatMonth(entry.date)}</time>
                        <span className="min-w-0 break-words">
                            {entry.hasPage ? (
                                <Link className="link" href={`/log/${entry.slug}`}>
                                    {entry.summary}
                                </Link>
                            ) : (
                                entry.summary
                            )}
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
