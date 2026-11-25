// npm run setup:voice -- <folder outside the repo>
// One-time setup of the local voice: a Python 3.12 environment (made with uv) holding kokoro-onnx,
// and the Kokoro-82M model files, checked against known SHA-256 hashes. Writes Video/.video-env
// (git-ignored) pointing at the folder. Needs `uv` on the PATH. Nothing here sends text anywhere.
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { REPO_DIR, UserError, VIDEO_DIR } from "./lib/paths";
import { fail } from "./lib/prepare";
import { run } from "./lib/proc";

const BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1";
const FILES = [
    {
        name: "kokoro-v1.0.onnx",
        sha256: "beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a",
    },
    {
        name: "voices-v1.0.bin",
        sha256: "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
    },
];
// faster-whisper gives the word timings that long captions are split at (scripts/words.py).
const PACKAGES = ["kokoro-onnx==0.6.1", "soundfile==0.14.0", "faster-whisper==1.2.1"];

function sha256(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const h = createHash("sha256");
        createReadStream(file)
            .on("data", (d) => h.update(d))
            .on("end", () => resolve(h.digest("hex")))
            .on("error", reject);
    });
}

async function main() {
    const target = process.argv[2];
    if (!target) throw new UserError("Usage: npm run setup:voice -- <folder outside the repo>");
    const dir = path.resolve(target);
    if (dir.toLowerCase().startsWith(REPO_DIR.toLowerCase() + path.sep)) {
        throw new UserError("Put the voice environment outside the repo (it is about 1 GB).");
    }
    mkdirSync(path.join(dir, "models"), { recursive: true });
    const venv = path.join(dir, ".venv");
    if (!existsSync(venv)) await run("uv", ["venv", "-p", "3.12", venv]);
    const python =
        process.platform === "win32"
            ? path.join(venv, "Scripts", "python.exe")
            : path.join(venv, "bin", "python");
    await run("uv", ["pip", "install", "-p", python, ...PACKAGES]);
    for (const f of FILES) {
        const out = path.join(dir, "models", f.name);
        if (!existsSync(out) || (await sha256(out)) !== f.sha256) {
            console.log(`Downloading ${f.name}...`);
            const res = await fetch(`${BASE}/${f.name}`);
            if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
            await writeFile(out, Buffer.from(await res.arrayBuffer()));
        }
        const got = await sha256(out);
        if (got !== f.sha256)
            throw new Error(`${f.name}: SHA-256 ${got} does not match ${f.sha256}`);
    }
    writeFileSync(path.join(VIDEO_DIR, ".video-env"), dir);
    console.log(`Voice environment ready at ${dir} (recorded in Video/.video-env).`);
}

main().catch(fail);
