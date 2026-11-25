// npm run scene -- <slug> <scene-id>
// Renders one scene end to end and writes <scene-id>.mp4, .jpg and .vtt into
// HiMaizProject/public/work/<slug>/, then checks them against the media contract.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { THEMES } from "../src/kit/themes";
import { buildCues, toVtt } from "./lib/captions";
import { lineWords } from "./lib/words";
import { encodeFinal, encodePoster } from "./lib/encode";
import { mixAudio } from "./lib/mix";
import { synthMusic } from "./lib/music";
import { formatHits, lintNarration } from "./lib/lint";
import { loadNarration } from "./lib/narration";
import { sceneArgs, scenePaths, UserError } from "./lib/paths";
import { fail, prepare } from "./lib/prepare";
import { timed } from "./lib/proc";
import { bundleScene, pickComposition, renderFrame, renderSilentVideo } from "./lib/render";
import { checkScene, report } from "./lib/spec";
import { takeSlot } from "./lib/slots";
import { writeWav } from "./lib/wav";

async function main() {
    const { slug, sceneId } = sceneArgs(
        process.argv.slice(2),
        "npm run scene -- <slug> <scene-id>",
    );
    const started = performance.now();
    const times: Record<string, number> = {};
    console.log(`Scene ${slug}/${sceneId}`);
    lintOrFail(scenePaths(slug, sceneId).narration);
    const { paths, lines, timeline, track, voiceWav, voiceFiles, sceneFile } = await prepare(
        slug,
        sceneId,
        times,
    );
    const work = paths.work;

    const serveUrl = await timed("bundle", times, () => bundleScene(sceneFile, slug, sceneId));
    const composition = await pickComposition(serveUrl, timeline);
    const props = composition.props as typeof timeline;
    const theme = THEMES[props.theme ?? "qoria"];
    const posterFrame = props.posterFrame ?? composition.durationInFrames - 1;
    console.log(
        `  look: ${theme.name}, ${composition.durationInFrames} frames, poster at frame ${posterFrame}`,
    );

    const audio = timed("music and mix", times, async () => {
        const music = synthMusic(theme, timeline.duration, `${slug}/${sceneId}`);
        const musicWav = path.join(work, "music.wav");
        writeWav(musicWav, music);
        return mixAudio({
            voiceWav,
            musicWav,
            voice: track,
            music,
            premixWav: path.join(work, "premix.wav"),
            outWav: path.join(work, "mix.wav"),
            duration: timeline.duration,
        });
    });
    const mix = await audio;
    console.log(
        `  music set ${mix.musicGainDb.toFixed(1)} dB; pre-normalisation ${mix.loudnorm.input_i} LUFS`,
    );

    // The heavy part waits for one of the machine's render slots.
    const release = await takeSlot("render", `scene ${slug}/${sceneId}`);
    const silent = path.join(work, "video.mp4");
    await timed("render", times, () =>
        renderSilentVideo({ serveUrl, composition, timeline: props, out: silent }),
    );
    const posterPng = path.join(work, "poster.png");
    await timed("poster", times, () =>
        renderFrame({ serveUrl, composition, timeline: props, frame: posterFrame, out: posterPng }),
    );

    const finalMp4 = path.join(work, "final.mp4");
    const enc = await timed("encode", times, () =>
        encodeFinal({
            video: silent,
            audio: path.join(work, "mix.wav"),
            out: finalMp4,
            duration: timeline.duration,
            work,
        }),
    );
    release();
    console.log(`  ${enc.bytes} bytes in ${enc.passes} pass(es)`);
    const finalJpg = path.join(work, "poster.jpg");
    await encodePoster(posterPng, finalJpg);
    const words = await timed("word timings", times, () => lineWords(lines, voiceFiles));
    const vttText = toVtt(buildCues(timeline.lines, words));

    mkdirSync(paths.outDir, { recursive: true });
    copyFileSync(finalMp4, paths.mp4);
    copyFileSync(finalJpg, paths.jpg);
    writeFileSync(paths.vtt, vttText);
    times.total = Math.round((performance.now() - started) / 100) / 10;
    writeFileSync(
        path.join(work, "timings.json"),
        JSON.stringify({ duration: timeline.duration, ...times }, null, 2),
    );
    console.log(`Wrote ${paths.mp4}\n      ${paths.jpg}\n      ${paths.vtt}`);

    console.log("Check:");
    const ok = report(await checkScene({ slug, sceneId, ...paths }));
    console.log(`Times (s): ${JSON.stringify(times)}`);
    if (!ok) {
        console.error(
            `\nFAILED: ${slug}/${sceneId} does not meet the media spec (see FAIL lines above).`,
        );
        process.exit(1);
    }
    console.log(`\nOK: ${slug}/${sceneId} (${timeline.duration.toFixed(1)} s video)`);
}

/** The narration lint runs first, so a unit read as letters never reaches a render. */
function lintOrFail(file: string) {
    const hits = lintNarration(loadNarration(file));
    if (hits.length) {
        throw new UserError(
            `${formatHits(file, hits)}
${hits.length} form(s) the voice reads badly; see npm run lint:narration.`,
        );
    }
}

main().catch(fail);
