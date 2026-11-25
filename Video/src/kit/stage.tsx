import React, { type CSSProperties } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Leaf, Pebble, textureLayers } from "./paper";
import {
    ShotContext,
    cueFrame,
    useFrame,
    useSpringIn,
    useTheme,
    useTimeline,
    type Cue,
} from "./timing";
import type { Theme } from "./themes";

/**
 * The caption-safe area. Everything a scene draws goes inside this box (1600 x 850, starting 120 px
 * from the left and 70 px from the top). The band under it, the bottom 160 px of the frame (y 920 to
 * 1080), is left for the captions the site's player draws. Measured in headless Chrome with the site's
 * default caption style: while a video plays, two caption lines take the bottom 11.5% of the frame (top
 * at y 955 of 1080) at every player size; the band adds a 35 px margin. When the player's controls are
 * showing (paused or hovered) the captions rise above the control bar, and that bar covers the bottom
 * of the picture anyway. The look's ornaments live in the top-right margin, outside the box.
 */
export const SAFE = { left: 120, top: 70, width: 1600, height: 850 } as const;
export const CAPTION_BAND_TOP = SAFE.top + SAFE.height;

/** Text styles for the current look. */
export function useType() {
    const theme = useTheme();
    return {
        display: {
            fontFamily: theme.fonts.display,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
        } satisfies CSSProperties,
        body: {
            fontFamily: theme.fonts.body,
            fontWeight: 400,
            lineHeight: 1.25,
        } satisfies CSSProperties,
        mono: {
            fontFamily: theme.fonts.mono,
            fontWeight: 400,
            fontStyle: "normal",
        } satisfies CSSProperties,
        label: {
            fontFamily: theme.fonts.label,
            fontWeight: theme.labelWeight,
            fontStyle: theme.labelStyle,
            textTransform: theme.labelTransform,
            letterSpacing: theme.labelTransform === "uppercase" ? "0.08em" : "0",
        } satisfies CSSProperties,
    };
}

function Ornaments({ theme }: { theme: Theme }) {
    if (theme.name === "qoria") {
        return (
            <>
                <Leaf
                    size={150}
                    seed="orn-leaf"
                    style={{ position: "absolute", right: 24, top: 22 }}
                />
                <Pebble
                    size={74}
                    seed="orn-pebble"
                    style={{ position: "absolute", right: 62, top: 190 }}
                />
            </>
        );
    }
    if (theme.name === "ez-spectrum") {
        return (
            <>
                <svg
                    width="180"
                    height="180"
                    viewBox="0 0 220 220"
                    style={{ position: "absolute", right: 14, top: 14, opacity: 0.55 }}
                >
                    {[50, 90, 130].map((r) => (
                        <path
                            key={r}
                            d={`M ${190 - r} 190 A ${r} ${r} 0 0 1 190 ${190 - r}`}
                            fill="none"
                            stroke={theme.second}
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    ))}
                </svg>
                <Pebble
                    size={60}
                    seed="orn-pebble"
                    style={{ position: "absolute", right: 30, top: 30 }}
                />
            </>
        );
    }
    return (
        <>
            <Leaf
                size={120}
                seed="orn-leaf"
                color={theme.third}
                style={{ position: "absolute", right: 40, top: 30 }}
            />
            <div
                style={{
                    position: "absolute",
                    right: 70,
                    top: 40,
                    width: 110,
                    height: 30,
                    background: theme.tape,
                    transform: "rotate(-24deg)",
                }}
            />
            <Pebble
                size={56}
                seed="orn-pebble"
                style={{ position: "absolute", right: 60, top: 180 }}
            />
        </>
    );
}

/** The page every scene sits on: the look's paper and texture, its ornaments, and the safe area. */
export function Stage(props: { children: React.ReactNode; ornaments?: boolean }) {
    const theme = useTheme();
    const timeline = useTimeline();
    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.bg,
                backgroundImage: textureLayers(theme).join(", "),
                color: theme.onBg,
                fontFamily: theme.fonts.body,
                overflow: "hidden",
            }}
        >
            <AbsoluteFill
                style={{
                    background: theme.vignette,
                }}
            />
            {props.ornaments !== false && <Ornaments theme={theme} />}
            <div style={{ position: "absolute", ...SAFE }}>{props.children}</div>
            {timeline.guides && (
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: CAPTION_BAND_TOP,
                        bottom: 0,
                        background: "rgba(255, 0, 80, 0.18)",
                        borderTop: "2px dashed rgba(255, 0, 80, 0.8)",
                    }}
                />
            )}
        </AbsoluteFill>
    );
}

/**
 * A shot: a group of pieces on screen from one cue until another. Pieces inside start when the shot
 * starts unless they have their own `at`. The shot enters and leaves in the look's motion feel.
 * `to` as a line number means "until that line has finished and its pause is over".
 */
export function Shot(props: {
    from: Cue;
    to?: Cue;
    children: React.ReactNode;
    style?: CSSProperties;
}) {
    const timeline = useTimeline();
    const theme = useTheme();
    const frame = useFrame();
    const start = cueFrame(timeline, props.from);
    const totalFrames = Math.ceil(timeline.duration * timeline.fps);
    const end =
        props.to === undefined
            ? totalFrames
            : typeof props.to === "number"
              ? cueFrame(timeline, { line: props.to, at: "next" })
              : cueFrame(timeline, props.to);
    const enter = useSpringIn(props.from);
    // The shot leaves over the first moments of the next one, so the two cross-fade.
    const exitFrames = Math.round(0.4 * timeline.fps);
    if (frame < start || frame >= end + exitFrames) return null;

    const isLast = end >= totalFrames;
    const exit = isLast
        ? 0
        : interpolate(frame, [end, end + exitFrames], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
          });

    let transform = "";
    if (theme.motion.enter === "rise") transform = `translateY(${(1 - enter) * 40 - exit * 30}px)`;
    if (theme.motion.enter === "snap") transform = `scale(${0.92 + 0.08 * enter - exit * 0.04})`;
    if (theme.motion.enter === "drop")
        transform = `translateY(${(1 - enter) * -70 + exit * 50}px) rotate(${(1 - enter) * -2}deg)`;
    const opacity = Math.min(1, enter * 1.6) * (1 - exit);

    return (
        <ShotContext.Provider value={{ start, end }}>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity,
                    transform,
                    transformOrigin: "50% 60%",
                    ...props.style,
                }}
            >
                {props.children}
            </div>
        </ShotContext.Provider>
    );
}

/** Put a piece at a position inside the safe area (pixels from its top-left corner). */
export function Place(props: {
    x: number;
    y: number;
    w?: number;
    h?: number;
    center?: boolean;
    children: React.ReactNode;
    style?: CSSProperties;
}) {
    return (
        <div
            style={{
                position: "absolute",
                left: props.x,
                top: props.y,
                width: props.w,
                height: props.h,
                transform: props.center ? "translate(-50%, -50%)" : undefined,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
}
