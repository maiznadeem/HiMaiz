import Link from "next/link";
import { CutPaper } from "@/components/work/CutPaper";
import type { WorkStudy } from "@/lib/work";

const TAB_TONES = ["sheet", "orange", "sheet", "deep"] as const;

/**
 * The home page's way into /work: one line of invitation and the names as small paper tabs.
 * No roles or dates here, so the home page stays a home page.
 */
export function WorkInvite({ studies }: { studies: WorkStudy[] }) {
    if (studies.length === 0) return null;
    return (
        <section aria-labelledby="work-invite-heading" className="mb-16">
            <CutPaper tone="grey" cut={2} tilt={-0.4} className="invite">
                <div className="invite-text">
                    <h2 id="work-invite-heading" className="display invite-title">
                        See the work, a page at a time.
                    </h2>
                    <p className="invite-lede">
                        Where I have worked and what I made on my own, told in short scenes you can
                        flip through.
                    </p>
                    <p>
                        <Link className="link font-semibold" href="/work">
                            Open the work
                        </Link>
                    </p>
                </div>
                <ul className="invite-tabs" aria-label="Case studies">
                    {studies.map((study, i) => (
                        <li key={study.slug}>
                            <CutPaper
                                as="span"
                                tone={TAB_TONES[i % TAB_TONES.length]}
                                cut={i}
                                tilt={[-2, 1.5, -0.5, 2.2][i % 4]}
                                className="invite-tab"
                            >
                                <Link className="stretch" href={`/work/${study.slug}`}>
                                    {study.name}
                                </Link>
                            </CutPaper>
                        </li>
                    ))}
                </ul>
            </CutPaper>
        </section>
    );
}
