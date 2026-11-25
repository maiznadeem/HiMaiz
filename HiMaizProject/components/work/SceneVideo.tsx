"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/media";
import { useHydrated } from "@/lib/useHydrated";
import type { WorkVideo } from "@/lib/work";

/** "74" -> "1 min 14 s" */
export function formatSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (!minutes) return `${rest} s`;
    return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/**
 * A scene's video: the poster first, nothing loads or plays until asked, captions on from the
 * start, and the narration as text behind "Read it instead". The native controls stay, so the
 * keyboard and screen readers work as they do on any video. Only one video plays at a time, and
 * a video pauses when its scene leaves the screen.
 */
export function SceneVideo({ video, title }: { video: WorkVideo; title: string }) {
    const ref = useRef<HTMLVideoElement>(null);
    const transcript = useRef<HTMLDetailsElement>(null);
    const hydrated = useHydrated();
    const [started, setStarted] = useState(false);
    const [failed, setFailed] = useState(false);

    // A missing or broken file must not leave a dead player: say so and point to the words.
    const fail = () => {
        setFailed(true);
        setStarted(true);
    };

    const play = () => {
        const element = ref.current;
        if (!element) return;
        element.play().catch((error: DOMException) => {
            // A refused autoplay policy is not a broken file; anything else is.
            if (error.name !== "NotAllowedError" && error.name !== "AbortError") fail();
        });
    };

    const readInstead = () => {
        const details = transcript.current;
        if (!details) return;
        details.open = true;
        details.querySelector("summary")?.focus();
    };

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        // `default` on the track asks for captions; some browsers still start with them hidden.
        const track = element.textTracks[0];
        if (track) track.mode = "showing";
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting && !element.paused) element.pause();
            },
            { threshold: 0.25 },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const onPlay = () => {
        setStarted(true);
        document.querySelectorAll("video").forEach((other) => {
            if (other !== ref.current && !other.paused) other.pause();
        });
    };

    return (
        <figure className="scene-video">
            <div className="video-frame cut tone-ink">
                <span className="paper" aria-hidden="true" />
                <video
                    ref={ref}
                    controls
                    playsInline
                    preload="none"
                    // The video comes from the media host (lib/media.ts) in CORS mode, so the
                    // bucket's policy (infra/r2-cors.json) must list the page's origin.
                    crossOrigin="anonymous"
                    poster={video.poster}
                    aria-label={`Video: ${title}`}
                    onPlay={onPlay}
                    onError={fail}
                >
                    <source src={mediaUrl(video.src)} type="video/mp4" onError={fail} />
                    <track
                        kind="captions"
                        src={video.captions}
                        srcLang="en"
                        label="English"
                        default
                    />
                </video>
                {hydrated && !started ? (
                    <button
                        type="button"
                        className="play-pebble"
                        onClick={play}
                        aria-label={`Play the video: ${title}`}
                    >
                        <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                            <path
                                className="play-stone"
                                d="M30 18c24-14 58 0 62 28 4 30-26 50-52 44C14 84 4 60 12 40c3-9 9-17 18-22z"
                            />
                            <path
                                className="play-mark"
                                d="M41 33c13 6 23 12 30 17-8 5-18 11-30 17z"
                            />
                        </svg>
                    </button>
                ) : null}
                {failed ? (
                    <p className="video-failed" role="status">
                        This video didn&rsquo;t load.{" "}
                        <button type="button" onClick={readInstead}>
                            Read it instead.
                        </button>
                    </p>
                ) : null}
            </div>
            <figcaption className="video-caption">
                <span className="soft">Video, {formatSeconds(video.seconds)}, with captions</span>
                <details
                    ref={transcript}
                    className="transcript"
                    onToggle={(event) => {
                        if (event.currentTarget.open) ref.current?.pause();
                    }}
                >
                    <summary>Read it instead</summary>
                    <div className="transcript-text">
                        {video.transcript.split(/\n\s*\n/).map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                </details>
            </figcaption>
        </figure>
    );
}
