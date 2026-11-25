// After `next build`: when the videos are served from the media host (NEXT_PUBLIC_MEDIA_BASE set,
// read from the same env files Next read), deletes out/work/**/*.mp4 so they are not also shipped
// as static assets. Posters, stills, captions and the /work pages stay.
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });
const remote = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "") !== "";
const DIR = join("out", "work");

let removed = 0;
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.name.endsWith(".mp4")) {
            rmSync(path);
            removed += 1;
        }
    }
};
if (remote) walk(DIR);
console.log(
    remote
        ? `strip-media: ${removed} video(s) removed from out/work, served from ${process.env.NEXT_PUBLIC_MEDIA_BASE}`
        : "strip-media: no media host, videos kept in out/work",
);
