// After `next build` with output: "export", copies nested segment payloads to the flat names the
// client router requests. For example, out/log/x/__next.log/$d$slug/__PAGE__.txt is also written
// as out/log/x/__next.log.$d$slug.__PAGE__.txt. Without it, client-side navigation to an entry
// gets a 404 for that payload and falls back to a slower full fetch.
import { copyFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";

function walk(dir, onFile) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path, onFile);
        else onFile(path);
    }
}

let copied = 0;
walk(OUT, (file) => {
    const parts = relative(OUT, file).split(sep);
    // The first folder named __next.* below the page folder starts the nested segment path.
    const start = parts.findIndex((part, i) => part.startsWith("__next.") && i < parts.length - 1);
    if (start === -1) return;
    const flat = join(OUT, ...parts.slice(0, start), parts.slice(start).join("."));
    copyFileSync(file, flat);
    copied += 1;
});
console.log(`flatten-segments: ${copied} file(s)`);
