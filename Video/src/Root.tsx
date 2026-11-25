import * as SceneFile from "@scene";
import React, { useEffect, useState } from "react";
import { cancelRender, Composition, continueRender, delayRender, useCurrentFrame } from "remotion";
import { isThemeName, type SceneModule } from "./kit";
import { FONT_FACES } from "./kit/fonts";
import { cueFrame, SceneProvider, type SceneTimeline } from "./kit/timing";

const scene = SceneFile as unknown as SceneModule;

const FONTS = FONT_FACES;

function SceneRoot(props: SceneTimeline) {
    const frame = useCurrentFrame();
    const [handle] = useState(() => delayRender("Loading fonts"));
    useEffect(() => {
        Promise.all(FONTS.map((f) => document.fonts.load(f)))
            .then(() => continueRender(handle))
            .catch((err) => cancelRender(err));
    }, [handle]);
    const Scene = scene.default;
    return (
        <SceneProvider timeline={props} frame={frame}>
            <Scene />
        </SceneProvider>
    );
}

const placeholder: SceneTimeline = {
    slug: "_sample",
    sceneId: "preview",
    fps: 30,
    duration: 6,
    lines: [{ text: "Preview line.", start: 0.8, end: 4, next: 6 }],
};

export function Root() {
    return (
        <Composition
            id="Scene"
            component={SceneRoot}
            fps={30}
            width={1920}
            height={1080}
            durationInFrames={180}
            defaultProps={placeholder}
            calculateMetadata={({ props }) => {
                const theme = scene.theme ?? (isThemeName(props.slug) ? props.slug : undefined);
                if (!theme) {
                    throw new Error(
                        `Scene ${props.slug}/${props.sceneId} needs \`export const theme = "..."\` (qoria, ez-spectrum or prtl-labs).`,
                    );
                }
                const timeline = { ...props, theme };
                const durationInFrames = Math.ceil(props.duration * props.fps);
                const last = props.lines.length - 1;
                const posterFrame = Math.min(
                    durationInFrames - 1,
                    cueFrame(timeline, scene.poster ?? { line: last, at: "end" }),
                );
                return { durationInFrames, fps: props.fps, props: { ...timeline, posterFrame } };
            }}
        />
    );
}
