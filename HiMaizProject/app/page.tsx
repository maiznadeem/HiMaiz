import { InkUnderline } from "@/components/InkUnderline";
import { LogList } from "@/components/LogList";
import { PaperArt } from "@/components/PaperArt";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getLogEntries } from "@/lib/log";
import { TAGLINE } from "@/lib/site";

export default function Home() {
    const entries = getLogEntries();
    return (
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col page-pad">
            <SiteHeader />
            <main className="flex-1">
                <section className="grid items-center gap-x-12 gap-y-10 pt-10 pb-16 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:pt-16 md:pb-20">
                    <div>
                        <h1 className="display text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.02] text-balance">
                            Building things, and writing{" "}
                            <InkUnderline delay={500}>it down.</InkUnderline>
                        </h1>
                        <p className="mt-6 max-w-[34ch] text-lg text-muted md:text-xl">{TAGLINE}</p>
                    </div>
                    <PaperArt className="w-full max-w-[22rem] md:max-w-[30rem] md:justify-self-end" />
                </section>
                <LogList entries={entries} />
            </main>
            <div className="mt-16">
                <SiteFooter />
            </div>
        </div>
    );
}
