import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VIDEO_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const REPO_DIR = path.resolve(VIDEO_DIR, "..");
export const SITE_PUBLIC = path.join(REPO_DIR, "HiMaizProject", "public");
export const CACHE_DIR = path.join(VIDEO_DIR, ".cache");
export const VOICE_CACHE = path.join(CACHE_DIR, "voice");

const SLUG = /^_?[a-z0-9]+(-[a-z0-9]+)*$/;

export class UserError extends Error {}

export function sceneArgs(argv: string[], usage: string): { slug: string; sceneId: string } {
    const [slug, sceneId] = argv.filter(
        (a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"),
    );
    if (!slug || !sceneId) throw new UserError(`Usage: ${usage}`);
    if (!SLUG.test(slug)) throw new UserError(`"${slug}" is not a valid slug (lowercase-kebab).`);
    if (!SLUG.test(sceneId))
        throw new UserError(`"${sceneId}" is not a valid scene id (lowercase-kebab).`);
    return { slug, sceneId };
}

/** Sample slugs (starting with "_") never go to the site: they land in Video/samples/<slug>/. */
export const SAMPLES_DIR = path.join(VIDEO_DIR, "samples");

/** Where the three media files go: `--out <dir>` if given, else the site (or samples for "_" slugs). */
export function outputDir(slug: string): string {
    const i = process.argv.indexOf("--out");
    if (i >= 0) {
        const dir = process.argv[i + 1];
        if (!dir || dir.startsWith("--")) throw new UserError("--out needs a folder");
        return path.resolve(dir);
    }
    if (slug.startsWith("_")) return path.join(SAMPLES_DIR, slug);
    return path.join(SITE_PUBLIC, "work", slug);
}

export function scenePaths(slug: string, sceneId: string) {
    const srcBase = path.join(VIDEO_DIR, "src", slug, sceneId);
    const sceneFile = [".tsx", ".ts", ".jsx"].map((e) => srcBase + e).find((f) => existsSync(f));
    const outDir = outputDir(slug);
    return {
        narration: path.join(VIDEO_DIR, "narration", slug, `${sceneId}.json`),
        sceneFile,
        sceneFileExpected: srcBase + ".tsx",
        work: path.join(CACHE_DIR, "work", slug, sceneId),
        outDir,
        mp4: path.join(outDir, `${sceneId}.mp4`),
        jpg: path.join(outDir, `${sceneId}.jpg`),
        vtt: path.join(outDir, `${sceneId}.vtt`),
    };
}
