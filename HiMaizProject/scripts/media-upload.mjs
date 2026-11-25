// npm run media:upload: uploads every public/work/**/*.mp4 to the R2 bucket at the same path
// (work/<slug>/<scene-id>.mp4), skips objects whose stored sha256 matches, then rewrites
// content/work/media.json. Posters, stills and captions stay on the site's own origin.
// Needs CLOUDFLARE_API_TOKEN (R2 write on the bucket) and CLOUDFLARE_ACCOUNT_ID in the environment,
// and ffprobe on the PATH. It never deletes an object: removing one is a separate, manual act.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BUCKET, MANIFEST, PUBLIC_DIR, localVideos, r2Client, requireEnv, sha256 } from "./r2.mjs";

const token = requireEnv(
    "CLOUDFLARE_API_TOKEN",
    "Set it to a Cloudflare API token with R2 write access to the bucket, for this command only.",
);
const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID", "Set it to the Cloudflare account's id.");

function seconds(file) {
    const out = execFileSync(
        "ffprobe",
        ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
        { encoding: "utf8" },
    );
    const value = Number.parseFloat(out);
    if (!Number.isFinite(value)) throw new Error(`ffprobe gave no duration for ${file}`);
    return Math.round(value);
}

const client = await r2Client({ token, accountId });
const videos = localVideos();
if (videos.length === 0) {
    console.error(`No videos under ${PUBLIC_DIR}/work.`);
    process.exit(1);
}

const manifest = {};
let uploaded = 0;
for (const path of videos) {
    const file = join(PUBLIC_DIR, path);
    const data = readFileSync(file);
    const hash = sha256(data);
    const key = path.slice(1);
    if ((await client.storedSha256(key)) === hash) {
        console.log(`same      ${path}`);
    } else {
        await client.put(key, data, hash);
        uploaded += 1;
        console.log(`uploaded  ${path} (${data.length} bytes)`);
    }
    manifest[path] = { bytes: data.length, sha256: hash, seconds: seconds(file) };
}

// The repo's JSON style: 4-space indent, CRLF, final newline (see .editorconfig).
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 4).replace(/\n/g, "\r\n") + "\r\n");
console.log(
    `media:upload: ${videos.length} video(s), ${uploaded} uploaded to ${BUCKET}, ${MANIFEST} written`,
);
