import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildVoiceTrack } from "./mix";
import { loadNarration } from "./narration";
import { scenePaths, UserError } from "./paths";
import { timed } from "./proc";
import { makeVoice } from "./voice";
import { writeWav } from "./wav";

/** Shared first half of every command: read the narration, make the voice, lay out the timeline. */
export async function prepare(slug: string, sceneId: string, times: Record<string, number>) {
    const paths = scenePaths(slug, sceneId);
    const lines = loadNarration(paths.narration);
    if (!paths.sceneFile) {
        throw new UserError(
            `No scene file. Create ${paths.sceneFileExpected} (see Video/README.md).`,
        );
    }
    mkdirSync(paths.work, { recursive: true });
    const voice = await timed("voice", times, () => makeVoice(lines));
    const { timeline, voice: track } = buildVoiceTrack(lines, voice.files, slug, sceneId);
    const voiceWav = path.join(paths.work, "voice.wav");
    writeWav(voiceWav, track);
    writeFileSync(path.join(paths.work, "timeline.json"), JSON.stringify(timeline, null, 2));
    console.log(
        `  ${lines.length} lines, ${voice.made} voiced now, ${lines.length - voice.made} from cache; ` +
            `${timeline.duration.toFixed(2)} s long`,
    );
    return {
        paths,
        lines,
        timeline,
        track,
        voiceWav,
        voiceFiles: voice.files,
        sceneFile: paths.sceneFile,
    };
}

export function exists(file: string): boolean {
    return existsSync(file);
}

export function fail(err: unknown): never {
    if (err instanceof UserError) console.error(`\nERROR: ${err.message}`);
    else console.error(`\nERROR: ${(err as Error)?.stack ?? err}`);
    process.exit(1);
}
