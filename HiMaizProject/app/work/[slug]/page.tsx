import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FlyThrough, type Step } from "@/components/work/FlyThrough";
import {
    COVER_ID,
    CoverSpread,
    END_ID,
    EndSpread,
    SceneSpread,
    sceneId,
} from "@/components/work/Spreads";
import { studyMetadata } from "@/lib/site";
import { getWorkStudies, nextStudy } from "@/lib/work";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return getWorkStudies().map(({ slug }) => ({ slug }));
}

async function findStudy(params: Props["params"]) {
    const { slug } = await params;
    const studies = getWorkStudies();
    const study = studies.find((s) => s.slug === slug);
    if (!study) notFound();
    return { study, next: nextStudy(studies, slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { study } = await findStudy(params);
    return studyMetadata(study);
}

export default async function StudyPage({ params }: Props) {
    const { study, next } = await findStudy(params);
    const steps: Step[] = [
        { id: COVER_ID, label: study.name, mark: "Cover" },
        ...study.scenes.map((scene, i) => ({
            id: sceneId(scene),
            label: scene.title,
            mark: `${i + 1}`,
        })),
        { id: END_ID, label: "Also, and what comes next", mark: "End" },
    ];
    return (
        <div className="work-study" data-kind={study.kind}>
            <div className="mx-auto max-w-6xl page-pad study-header">
                <SiteHeader current="work" />
            </div>
            <main className="mx-auto max-w-6xl page-pad">
                <FlyThrough steps={steps}>
                    <CoverSpread study={study} />
                    {study.scenes.map((scene, i) => (
                        <SceneSpread key={scene.id} study={study} scene={scene} index={i} />
                    ))}
                    <EndSpread study={study} next={next} />
                </FlyThrough>
            </main>
            <div className="mx-auto mt-8 max-w-6xl page-pad">
                <SiteFooter />
            </div>
        </div>
    );
}
