import type { Metadata } from "next";
import { InkUnderline } from "@/components/InkUnderline";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PageStack } from "@/components/work/PaperBits";
import { PopUps } from "@/components/work/PopUps";
import { FypFeature, Journey, ProjectShelf } from "@/components/work/WorkIndex";
import { workIndexMetadata } from "@/lib/site";
import { getWorkStudies } from "@/lib/work";

export const metadata: Metadata = workIndexMetadata();

export default function WorkPage() {
    const studies = getWorkStudies();
    const jobs = studies.filter((study) => study.kind === "job");
    const fyp = studies.find((study) => study.kind === "fyp");
    const projects = studies.filter((study) => study.kind === "project");
    return (
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col page-pad work-index">
            <SiteHeader current="work" />
            <main className="flex-1">
                <section className="grid items-center gap-x-12 gap-y-8 pt-8 pb-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:pt-14 md:pb-16">
                    <div>
                        <h1 className="display text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.02] text-balance">
                            The work, <InkUnderline delay={500}>page by page.</InkUnderline>
                        </h1>
                        <p className="mt-6 max-w-[38ch] text-lg text-muted md:text-xl">
                            Where I have worked, and the things I made on my own. Each one opens as
                            a few short scenes you can flip through.
                        </p>
                    </div>
                    <PageStack className="w-full max-w-[18rem] justify-self-center md:max-w-[24rem] md:justify-self-end" />
                </section>
                <PopUps>
                    {jobs.length > 0 ? (
                        <section aria-labelledby="journey-heading" className="work-section">
                            <h2 id="journey-heading" className="display section-title">
                                Where I have worked
                            </h2>
                            <Journey jobs={jobs} />
                        </section>
                    ) : null}
                    {fyp ? (
                        <section aria-labelledby="fyp-heading" className="work-section">
                            <h2 id="fyp-heading" className="display section-title">
                                Final Year Project
                            </h2>
                            <FypFeature fyp={fyp} />
                        </section>
                    ) : null}
                    {projects.length > 0 ? (
                        <section aria-labelledby="projects-heading" className="work-section">
                            <h2 id="projects-heading" className="display section-title">
                                Things I made on my own
                            </h2>
                            <p className="section-lede">
                                Personal projects. Their pages show demo data, never real data.
                            </p>
                            <ProjectShelf projects={projects} />
                        </section>
                    ) : null}
                    {studies.length === 0 ? (
                        <p className="text-lg text-muted">The case studies are on their way.</p>
                    ) : null}
                </PopUps>
            </main>
            <div className="mt-16">
                <SiteFooter />
            </div>
        </div>
    );
}
