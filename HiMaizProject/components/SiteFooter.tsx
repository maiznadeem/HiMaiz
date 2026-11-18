import { CopyEmail } from "@/components/CopyEmail";
import { EMAIL } from "@/lib/site";

export function SiteFooter() {
    return (
        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-ink/25 py-6 text-[0.9375rem] sm:text-base">
            <div className="flex min-w-0 items-center gap-1">
                <a className="link min-w-0 [overflow-wrap:anywhere]" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                </a>
                <CopyEmail email={EMAIL} />
            </div>
            <a className="link" href="/log/rss.xml">
                RSS
            </a>
        </footer>
    );
}
