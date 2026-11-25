import Link from "next/link";
import { formatSpan, videoMinutes, type WorkStudy } from "@/lib/work";
import { at, CutPaper, type Tone } from "./CutPaper";

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

/** "Four scenes, about 5 minutes of video" */
export function sceneLine(study: WorkStudy): string {
    const count = study.scenes.length;
    const scenes = `${NUMBER_WORDS[count] ?? count} scene${count === 1 ? "" : "s"}`;
    const minutes = videoMinutes(study);
    if (!minutes) return scenes;
    return `${scenes}, about ${minutes} minute${minutes === 1 ? "" : "s"} of video`;
}

/** The employers, newest first, as stops along a hand-drawn trail. */
export function Journey({ jobs }: { jobs: WorkStudy[] }) {
    return (
        <ol className="journey" data-testid="journey">
            {jobs.map((job, i) => {
                const side = i % 2 === 0 ? "left" : "right";
                return (
                    <li
                        key={job.slug}
                        className="stop"
                        data-side={side}
                        data-pop-root
                        data-slug={job.slug}
                    >
                        <div className="stop-trail" aria-hidden="true">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                    d={
                                        side === "left"
                                            ? "M50 0C50 10 30 22 50 34S78 62 52 80 46 96 50 100"
                                            : "M50 0C50 10 72 22 50 34S22 62 48 80 54 96 50 100"
                                    }
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                            <span className="stop-pebble boing" style={at(120)} />
                        </div>
                        <p className="stop-when pop" style={at(200)}>
                            <span>{formatSpan(job)}</span>
                            {job.place ? <span className="soft">{job.place}</span> : null}
                        </p>
                        <CutPaper
                            as="article"
                            tone={i % 3 === 1 ? "grey" : "sheet"}
                            cut={i}
                            tilt={side === "left" ? -0.8 : 0.7}
                            className="stop-card pop"
                            style={at(280)}
                        >
                            <h3 className="display stop-name">
                                <Link className="stretch" href={`/work/${job.slug}`}>
                                    {job.name}
                                </Link>
                            </h3>
                            <p className="stop-role">{job.role}</p>
                            <p className="stop-summary">{job.summary}</p>
                            <p className="stop-meta soft">{sceneLine(job)}</p>
                        </CutPaper>
                    </li>
                );
            })}
        </ol>
    );
}

/** The Final Year Project: one piece, given more room than a personal project. */
export function FypFeature({ fyp }: { fyp: WorkStudy }) {
    const span = formatSpan(fyp);
    return (
        <div className="fyp" data-pop-root data-slug={fyp.slug}>
            <CutPaper as="article" tone="ink" cut={1} tilt={-0.4} className="fyp-card pop">
                <div>
                    <h3 className="display fyp-name">
                        <Link className="stretch" href={`/work/${fyp.slug}`}>
                            {fyp.name}
                        </Link>
                    </h3>
                    <p className="stop-role">{fyp.role}</p>
                    {span ? <p className="soft">{span}</p> : null}
                </div>
                <div>
                    <p className="fyp-summary">{fyp.summary}</p>
                    <p className="stop-meta soft">{sceneLine(fyp)}</p>
                </div>
            </CutPaper>
        </div>
    );
}

// Each project is its own scrap: a different paper, cut and lean, so the shelf looks gathered
// rather than printed. The order of tones puts one dark and one orange scrap among the first five.
const SCRAPS: { tone: Tone; tilt: number }[] = [
    { tone: "sheet", tilt: -1.4 },
    { tone: "orange", tilt: 1.1 },
    { tone: "grey", tilt: -0.6 },
    { tone: "deep", tilt: 1.6 },
    { tone: "sheet", tilt: -1 },
    { tone: "grey", tilt: 0.8 },
];

/** The personal projects, as a shelf of paper scraps. */
export function ProjectShelf({ projects }: { projects: WorkStudy[] }) {
    return (
        <ul className="shelf" data-count={projects.length}>
            {projects.map((project, i) => {
                const scrap = SCRAPS[i % SCRAPS.length];
                return (
                    <li key={project.slug} data-pop-root data-slug={project.slug}>
                        <CutPaper
                            as="article"
                            tone={scrap.tone}
                            cut={i + 2}
                            tilt={scrap.tilt}
                            className="scrap pop"
                            style={at(i * 90)}
                        >
                            <h3 className="display scrap-name">
                                <Link className="stretch" href={`/work/${project.slug}`}>
                                    {project.name}
                                </Link>
                            </h3>
                            <p className="stop-role">{project.role}</p>
                            <p className="scrap-summary">{project.summary}</p>
                            <p className="stop-meta soft">{sceneLine(project)}</p>
                        </CutPaper>
                    </li>
                );
            })}
        </ul>
    );
}
