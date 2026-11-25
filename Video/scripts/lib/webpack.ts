import path from "node:path";
import type { WebpackOverrideFn } from "@remotion/bundler";

type WebpackConfig = Parameters<WebpackOverrideFn>[0];

/** Point the `@scene` import in src/Root.tsx at one scene file, so each bundle holds one scene. */
export function withScene(config: WebpackConfig, sceneFile: string): WebpackConfig {
    if (!sceneFile) {
        throw new Error("No scene chosen. Use `npm run studio -- <slug> <scene-id>`.");
    }
    return {
        ...config,
        resolve: {
            ...config.resolve,
            alias: {
                ...(config.resolve?.alias as Record<string, string> | undefined),
                "@scene": path.resolve(sceneFile),
            },
        },
    };
}
