import type { NextConfig } from "next";

// A fully static export to `out/`, served by Cloudflare Workers static assets (wrangler.toml).
// Security headers live in public/_headers and the /log redirect in public/_redirects, because
// a static export has no server to apply next.config headers or redirects.

// Where the videos are served from (lib/media.ts): empty, or an https origin with nothing after it.
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE ?? "";
if (mediaBase !== "") {
    let origin = "";
    try {
        const url = new URL(mediaBase);
        if (url.protocol === "https:") origin = url.origin;
    } catch {}
    if (origin !== mediaBase) {
        throw new Error(
            `NEXT_PUBLIC_MEDIA_BASE must be empty or an https:// origin with no path, query or trailing slash, such as https://media.himaiz.com (it is "${mediaBase}")`,
        );
    }
}

const nextConfig: NextConfig = {
    output: "export",
    agentRules: false,
    devIndicators: false,
    reactStrictMode: true,
    poweredByHeader: false,
};

export default nextConfig;
