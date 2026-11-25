import manifest from "@/content/work/media.json";

/** content/work/media.json: every uploaded video, written by `npm run media:upload`. */
export type MediaManifest = Record<string, { bytes: number; sha256: string; seconds: number }>;

export const MEDIA_MANIFEST: MediaManifest = manifest;

/** "https://media.himaiz.com" in production, "" locally. Read once at build (NEXT_PUBLIC_ is inlined). */
export const MEDIA_BASE: string = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/+$/, "");

export const mediaIsRemote: boolean = MEDIA_BASE !== "";

/**
 * "/work/qoria/side-door.mp4" -> "https://media.himaiz.com/work/qoria/side-door.mp4?v=3f9a1c2b"
 * (or unchanged locally). Only videos live on the media host: any other path is returned unchanged.
 * The `?v=` is the start of the video's sha256 from content/work/media.json, so a re-rendered video
 * gets a new address while the object keeps its path and its immutable caching.
 */
export function mediaUrl(contentPath: string): string {
    if (!contentPath.startsWith("/work/")) {
        throw new Error(`mediaUrl: "${contentPath}" does not start with /work/`);
    }
    if (!mediaIsRemote || !contentPath.endsWith(".mp4")) return contentPath;
    const entry = MEDIA_MANIFEST[contentPath];
    if (!entry) {
        throw new Error(
            `${contentPath} is not in content/work/media.json: upload it with npm run media:upload`,
        );
    }
    return `${MEDIA_BASE}${contentPath}?v=${entry.sha256.slice(0, 8)}`;
}
