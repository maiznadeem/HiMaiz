// npm run check -- <slug> <scene-id>
// Checks the three media files that already exist for a scene against the media contract.
import { existsSync } from "node:fs";
import { missingSceneMessage } from "./lib/narration";
import { sceneArgs, scenePaths, UserError } from "./lib/paths";
import { fail } from "./lib/prepare";
import { checkScene, report } from "./lib/spec";

async function main() {
    const { slug, sceneId } = sceneArgs(
        process.argv.slice(2),
        "npm run check -- <slug> <scene-id>",
    );
    const paths = scenePaths(slug, sceneId);
    if (!existsSync(paths.narration)) throw new UserError(missingSceneMessage(paths.narration));
    console.log(`Check ${slug}/${sceneId}`);
    const ok = report(await checkScene({ slug, sceneId, ...paths }));
    if (!ok) {
        console.error(`\nFAILED: ${slug}/${sceneId} does not meet the media spec.`);
        process.exit(1);
    }
    console.log(`\nOK: ${slug}/${sceneId}`);
}

main().catch(fail);
