// Shared helpers for media-upload.mjs and media-check.mjs: the bucket, the manifest and a small
// signed client for R2's S3 API. The S3 keys are derived from a Cloudflare API token with R2 write
// access, as Cloudflare documents: access key id = the token's id, secret = sha256 of the token.
import { createHash, createHmac } from "node:crypto";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const BUCKET = process.env.MEDIA_BUCKET || "himaiz-media";
export const PUBLIC_BASE = "https://media.himaiz.com";
export const PUBLIC_DIR = "public";
export const MANIFEST = "content/work/media.json";
export const VIDEO_TYPE = "video/mp4";
export const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Every `public/work/**\/*.mp4`, as content paths ("/work/<slug>/<scene-id>.mp4"), sorted. */
export function localVideos(root = PUBLIC_DIR) {
    const found = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const path = join(dir, entry.name);
            if (entry.isDirectory()) walk(path);
            else if (entry.name.endsWith(".mp4"))
                found.push("/" + relative(root, path).split(sep).join("/"));
        }
    };
    walk(join(root, "work"));
    return found.sort();
}

export const sha256 = (data) => createHash("sha256").update(data).digest("hex");

/** Fails with a clear message, never echoing a value, when a required variable is missing. */
export function requireEnv(name, why) {
    const value = process.env[name];
    if (!value) {
        console.error(`${name} is not set. ${why}`);
        process.exit(2);
    }
    return value;
}

const hmac = (key, data) => createHmac("sha256", key).update(data).digest();

/** A signed S3 client for one bucket. Only PUT and HEAD; it never deletes. */
export async function r2Client({ token, accountId }) {
    const verify = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
        headers: { Authorization: `Bearer ${token}` },
    });
    const body = await verify.json().catch(() => ({}));
    if (!verify.ok || !body.result?.id) {
        throw new Error(
            `Cloudflare refused the API token (HTTP ${verify.status} from /user/tokens/verify).`,
        );
    }
    const accessKey = body.result.id;
    const secret = sha256(token);
    const host = `${accountId}.r2.cloudflarestorage.com`;

    async function send(method, key, { headers = {}, body, payloadHash } = {}) {
        const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
        const date = now.slice(0, 8);
        const path = `/${BUCKET}/${key.split("/").map(encodeURIComponent).join("/")}`;
        const all = {
            ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])),
            host,
            "x-amz-content-sha256": payloadHash ?? sha256(""),
            "x-amz-date": now,
        };
        const names = Object.keys(all).sort();
        const canonical = [
            method,
            path,
            "",
            ...names.map((n) => `${n}:${String(all[n]).trim()}`),
            "",
            names.join(";"),
            all["x-amz-content-sha256"],
        ].join("\n");
        const scope = `${date}/auto/s3/aws4_request`;
        const toSign = ["AWS4-HMAC-SHA256", now, scope, sha256(canonical)].join("\n");
        let signingKey = hmac(`AWS4${secret}`, date);
        for (const part of ["auto", "s3", "aws4_request"]) signingKey = hmac(signingKey, part);
        const signature = createHmac("sha256", signingKey).update(toSign).digest("hex");
        all.authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${names.join(";")}, Signature=${signature}`;
        delete all.host;
        return fetch(`https://${host}${path}`, { method, headers: all, body });
    }

    return {
        /** The object's stored sha256 metadata, or null when there is no object. */
        async storedSha256(key) {
            const res = await send("HEAD", key);
            if (res.status === 404) return null;
            if (!res.ok) throw new Error(`HEAD ${key}: HTTP ${res.status}`);
            return res.headers.get("x-amz-meta-sha256");
        },
        async put(key, data, hash) {
            const res = await send("PUT", key, {
                body: data,
                payloadHash: hash,
                headers: {
                    "content-type": VIDEO_TYPE,
                    "cache-control": CACHE_CONTROL,
                    "x-amz-meta-sha256": hash,
                },
            });
            if (!res.ok) throw new Error(`PUT ${key}: HTTP ${res.status} ${await res.text()}`);
        },
    };
}
