// npm run media:check: checks every video in content/work/media.json at its public address, the
// way a browser will request it (with the ?v= version the site adds): size, type, caching, byte
// ranges and CORS. One line per file, a summary, and a non-zero exit on any failure.
// Options: --base <origin> (default https://media.himaiz.com), --manifest <file>.
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { CACHE_CONTROL, MANIFEST, PUBLIC_BASE, VIDEO_TYPE } from "./r2.mjs";

const { values } = parseArgs({
    options: {
        base: { type: "string", default: PUBLIC_BASE },
        manifest: { type: "string", default: MANIFEST },
    },
});
const base = values.base.replace(/\/+$/, "");
const ORIGIN = "https://himaiz.com";
const entries = Object.entries(JSON.parse(readFileSync(values.manifest, "utf8")));

async function check(path, { bytes, sha256 }) {
    const url = `${base}${path}?v=${sha256.slice(0, 8)}`;
    const problems = [];
    const expect = (ok, message) => ok || problems.push(message);

    const head = await fetch(url, { method: "HEAD" });
    expect(head.status === 200, `HEAD ${head.status}, want 200`);
    if (head.status !== 200) return problems;
    const h = (name) => head.headers.get(name);
    expect(Number(h("content-length")) === bytes, `size ${h("content-length")}, want ${bytes}`);
    expect(h("content-type") === VIDEO_TYPE, `type ${h("content-type")}, want ${VIDEO_TYPE}`);
    expect(h("cache-control") === CACHE_CONTROL, `cache-control "${h("cache-control")}"`);

    const ranged = async (start, end) => {
        const res = await fetch(url, {
            headers: { Range: `bytes=${start}-${end}`, Origin: ORIGIN },
        });
        const length = (await res.arrayBuffer()).byteLength;
        const want = `bytes ${start}-${end}/${bytes}`;
        expect(res.status === 206, `range ${start}-${end}: ${res.status}, want 206`);
        expect(
            res.headers.get("content-range") === want,
            `content-range "${res.headers.get("content-range")}", want "${want}"`,
        );
        expect(
            length === end - start + 1,
            `range ${start}-${end}: ${length} bytes, want ${end - start + 1}`,
        );
        return res;
    };
    const first = await ranged(0, 99);
    const middle = Math.floor(bytes / 2);
    await ranged(middle, Math.min(middle + 999, bytes - 1));

    const acceptRanges = h("accept-ranges") ?? first.headers.get("accept-ranges");
    expect(acceptRanges === "bytes", `accept-ranges "${acceptRanges}", want "bytes"`);

    const allowOrigin = first.headers.get("access-control-allow-origin");
    expect(allowOrigin === ORIGIN || allowOrigin === "*", `CORS allow-origin "${allowOrigin}"`);
    const exposed = (first.headers.get("access-control-expose-headers") ?? "").toLowerCase();
    expect(
        exposed.includes("content-range"),
        `CORS expose-headers "${exposed}" lacks Content-Range`,
    );

    const preflight = await fetch(url, {
        method: "OPTIONS",
        headers: {
            Origin: ORIGIN,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "range",
        },
    });
    const allowed = (preflight.headers.get("access-control-allow-headers") ?? "").toLowerCase();
    expect(
        preflight.ok &&
            preflight.headers.get("access-control-allow-origin") &&
            allowed.includes("range"),
        `CORS preflight ${preflight.status}, allow-headers "${allowed}"`,
    );
    return problems;
}

let failed = 0;
for (const [path, entry] of entries) {
    let problems;
    try {
        problems = await check(path, entry);
    } catch (error) {
        problems = [`request failed: ${error.message}`];
    }
    if (problems.length) failed += 1;
    console.log(
        `${problems.length ? "FAIL" : "ok  "}  ${path}${problems.length ? "  " + problems.join("; ") : ""}`,
    );
}
console.log(`media:check: ${entries.length - failed} of ${entries.length} ok at ${base}`);
process.exit(failed || entries.length === 0 ? 1 : 0);
