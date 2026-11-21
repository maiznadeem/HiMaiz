import type { NextConfig } from "next";

// A fully static export to `out/`, served by Cloudflare Workers static assets (wrangler.toml).
// Security headers live in public/_headers and the /log redirect in public/_redirects, because
// a static export has no server to apply next.config headers or redirects.
const nextConfig: NextConfig = {
    output: "export",
    agentRules: false,
    devIndicators: false,
    reactStrictMode: true,
    poweredByHeader: false,
};

export default nextConfig;
