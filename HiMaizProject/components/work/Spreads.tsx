import type { CSSProperties } from "react";
import Link from "next/link";
import { formatSpan, renderWorkMarkdown, type WorkScene, type WorkStudy } from "@/lib/work";
import { at, CutPaper } from "./CutPaper";
import { Pebble, Ring, StandIn } from "./PaperBits";
import { SceneVideo } from "./SceneVideo";

/** The element id of a scene's spread. */
export const sceneId = (scene: Pick<WorkScene, "id">) => `scene-${scene.id}`;
export const COVER_ID = "cover";
export const END_ID = "the-end";

const KIND_LABEL = { job: "", fyp: "Final Year Project", project: "Personal project" } as const;

/** The cover of the book: the name large, then the role, the dates and the opening lines. */
export function CoverSpread({ study }: { study: WorkStudy }) {
    const span = formatSpan(study);
    const facts = [KIND_LABEL[study.kind], study.role, span, study.place].filter(Boolean);
    return (
        // Served open: the cover is the first thing a visitor sees, so its text must paint from
        // the HTML, never wait for a script to reveal it (it was the page's LCP).
        <section
            id={COVER_ID}
            className="spread"
            data-pop-root
            data-open=""
            aria-labelledby="cover-title"
        >
            <CutPaper tone="ink" cut={3} tilt={-0.5} className="page page-cover lay">
                <div className="cover-grid">
                    <div>
                        <h1 id="cover-title" className="display cover-title pop" style={at(120)}>
                            {study.name}
                        </h1>
                        <p className="cover-facts pop" style={at(260)}>
                            {facts.map((fact) => (
                                <span key={fact}>{fact}</span>
                            ))}
                        </p>
                        <p className="cover-intro pop" style={at(380)}>
                            {study.intro}
                        </p>
                        {study.stack.length > 0 ? (
                            <ul className="cover-stack pop" style={at(500)} aria-label="Tools">
                                {study.stack.map((tool) => (
                                    <li key={tool}>{tool}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    <div className="cover-art">
                        <StandIn variant={study.order} start={300} onInk />
                    </div>
                </div>
                <p className="cover-hint pop" style={at(700)}>
                    <Pebble className="hint-pebble" />
                    Scroll, swipe or use the arrow keys to turn the page.
                </p>
            </CutPaper>
        </section>
    );
}

/** One scene: the hook large, a short body, up to three numbers, and the video, still or art. */
export function SceneSpread({
    study,
    scene,
    index,
}: {
    study: WorkStudy;
    scene: WorkScene;
    index: number;
}) {
    const id = sceneId(scene);
    const flip = index % 2 === 1;
    // A video or a still is the centrepiece: it takes the wide column under the hook. Without
    // either, the hook and text lead and the paper art sits beside them.
    const media = scene.video || scene.image ? "has-media" : "no-media";
    return (
        <section
            id={id}
            className="spread"
            data-pop-root
            // The first scene can share the first screen with the cover, so it is served open too.
            data-open={index === 0 ? "" : undefined}
            data-media={media}
            aria-labelledby={`${id}-title`}
        >
            <CutPaper
                tone="sheet"
                cut={index}
                tilt={flip ? 0.45 : -0.35}
                className={`page lay ${media} ${flip ? "flip" : ""}`}
            >
                <div className="scene-grid">
                    <div className="scene-head">
                        {scene.kicker ? (
                            <p className="kicker pop" style={at(80)}>
                                <Pebble />
                                {scene.kicker}
                            </p>
                        ) : null}
                        <h2 id={`${id}-title`} className="display scene-title pop" style={at(160)}>
                            {scene.title}
                        </h2>
                    </div>
                    <div className="scene-media pop" style={at(300)}>
                        <SceneMedia study={study} scene={scene} index={index} />
                    </div>
                    <div
                        className="prose scene-body pop"
                        style={at(420)}
                        dangerouslySetInnerHTML={{
                            __html: renderWorkMarkdown(scene.body, study.kind),
                        }}
                    />
                    {scene.stats.length > 0 ? (
                        <dl className="stats" data-count={scene.stats.length}>
                            {scene.stats.map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="stat pop"
                                    style={at(520 + i * 140)}
                                >
                                    <dt>{stat.label}</dt>
                                    <dd
                                        style={
                                            { "--chars": [...stat.value].length } as CSSProperties
                                        }
                                    >
                                        <span
                                            className="stat-value boing"
                                            style={at(620 + i * 140)}
                                        >
                                            {stat.value}
                                        </span>
                                        <Ring start={820 + i * 140} />
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}
                </div>
                <span className="folio" aria-hidden="true">
                    {index + 1}
                </span>
            </CutPaper>
        </section>
    );
}

function SceneMedia({
    study,
    scene,
    index,
}: {
    study: WorkStudy;
    scene: WorkScene;
    index: number;
}) {
    if (scene.video) return <SceneVideo video={scene.video} title={scene.title} />;
    if (scene.image) {
        return (
            <CutPaper
                as="figure"
                tone="ink"
                cut={index + 1}
                tilt={index % 2 ? 1.2 : -1.2}
                className="still-frame"
            >
                {/* A static export serves files as they are, so next/image has nothing to optimise. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={scene.image.src}
                    alt={scene.image.alt}
                    width={scene.image.width}
                    height={scene.image.height}
                    loading="lazy"
                    decoding="async"
                />
            </CutPaper>
        );
    }
    return <StandIn variant={index + study.order} start={420} />;
}

/** After the last scene: the smaller things, the closing note and the way on. */
export function EndSpread({ study, next }: { study: WorkStudy; next?: WorkStudy }) {
    const heading = study.kind === "job" ? `Also at ${study.name}` : `Also in ${study.name}`;
    return (
        <section
            id={END_ID}
            className="spread spread-end"
            data-pop-root
            aria-labelledby="end-title"
        >
            <CutPaper tone="grey" cut={2} tilt={0.3} className="page lay">
                <div className="end-grid">
                    <div>
                        <h2 id="end-title" className="display end-title pop" style={at(100)}>
                            {study.more.length || study.note ? heading : "That is the whole story."}
                        </h2>
                        {study.more.length > 0 ? (
                            <ul className="more pop" style={at(240)}>
                                {study.more.map((item) => (
                                    <li key={item}>
                                        <Pebble />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                        {study.note ? (
                            <div
                                className="prose end-note pop"
                                style={at(360)}
                                dangerouslySetInnerHTML={{
                                    __html: renderWorkMarkdown(study.note, study.kind),
                                }}
                            />
                        ) : null}
                    </div>
                    <nav className="end-nav" aria-label="Keep going">
                        {next ? (
                            <CutPaper
                                tone="orange"
                                cut={1}
                                tilt={-1.6}
                                className="next-tab pop"
                                style={at(480)}
                            >
                                <span className="next-label">Next</span>
                                <Link className="next-link stretch" href={`/work/${next.slug}`}>
                                    {next.name}
                                </Link>
                                <span className="next-role">{next.role}</span>
                            </CutPaper>
                        ) : null}
                        <p className="pop" style={at(600)}>
                            <Link className="link font-semibold" href="/work">
                                All work
                            </Link>
                        </p>
                    </nav>
                </div>
            </CutPaper>
        </section>
    );
}
