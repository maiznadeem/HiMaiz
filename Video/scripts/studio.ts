// npm run studio -- <slug> <scene-id>
// Opens Remotion Studio on one scene with its real voice timing and the caption band drawn in pink.
// Scrub the timeline to see any moment. (No sound in the Studio; render the scene to hear it.)
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { sceneArgs, VIDEO_DIR } from "./lib/paths";
import { fail, prepare } from "./lib/prepare";

async function main() {
    const { slug, sceneId } = sceneArgs(
        process.argv.slice(2),
        "npm run studio -- <slug> <scene-id>",
    );
    const { timeline, sceneFile, paths } = await prepare(slug, sceneId, {});
    const props = path.join(paths.work, "studio-props.json");
    writeFileSync(props, JSON.stringify({ ...timeline, guides: true }));
    const child = spawn(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["remotion", "studio", "src/index.ts", `--props=${props}`],
        {
            cwd: VIDEO_DIR,
            stdio: "inherit",
            shell: process.platform === "win32",
            env: { ...process.env, VIDEO_SCENE_FILE: sceneFile },
        },
    );
    child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch(fail);
