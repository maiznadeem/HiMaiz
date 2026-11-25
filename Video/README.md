# Video: narrated explainer scenes for the work case studies

One command turns a narration script and a scene file into the three files the site needs: a 1080p video with
a voiceover and a quiet music bed, a poster and WebVTT captions. It then checks them against the media
contract and fails loudly if anything is off.

```
npm run scene -- <slug> <scene-id>
```

reads `narration/<slug>/<scene-id>.json` and `src/<slug>/<scene-id>.tsx`, and writes
`HiMaizProject/public/work/<slug>/<scene-id>.mp4`, `.jpg` and `.vtt`. Sample slugs (starting with `_`) write
to `Video/samples/<slug>/` instead, so they never ship with the site (only their posters are in git), and
`--out <folder>` sends the three files anywhere.

This folder is its own npm project. Nothing here is part of the site build.

## Setup (once per checkout)

1. `npm ci` in `Video/`.
2. The voice. It runs locally (Kokoro-82M on the CPU) from a Python environment that lives outside the repo,
   because it is about 1 GB:
    - If the environment already exists (on this machine it does, in the run folder's `video-env`), only record
      where it is: `npm run setup:voice -- <that folder>`. It checks the packages and the model hashes and
      writes the git-ignored `Video/.video-env`; it does not download anything that is already there.
    - Otherwise the same command builds it: a Python 3.12 environment made with `uv`, `kokoro-onnx` 0.6.1,
      `faster-whisper` 1.2.1 (word timings for long captions), and the two model files, checked against
      pinned SHA-256 hashes. The Whisper model (`small.en`) downloads on first use into the folder.
    - Or set `VIDEO_ENV` to the folder instead.
3. FFmpeg 8 (with `ffprobe`) on the PATH. The first render downloads Chrome Headless Shell for Remotion.

## Adding a scene

### 1. The narration: `narration/<slug>/<scene-id>.json`

```json
[
    { "text": "The site slowed down when many people arrived at once.", "pauseAfterMs": 350 },
    { "text": "p95 fell to 0.17 s.", "say": "p ninety-five fell to zero point one seven seconds." }
]
```

- `text` is what the captions show, word for word.
- `say` (optional) is what the voice reads when it should differ from the caption: numbers, units, acronyms,
  names the voice says badly. Without it the voice reads `text`.
- `pauseAfterMs` (optional, default 300) is the silence after the line.

**Units and symbols.** The voice reads many abbreviations as letters: "22 ms" comes out "twenty-two M S".
`npm run lint:narration -- <slug> [<scene-id>]` lists every such line, and `npm run scene` runs the same lint
first and stops on a hit. The fix is a `say` with the words spelled out. Tested with the voice and Whisper
(2026-11-25):

| Read badly (needs `say`)                                                                         | Read fine (no `say` needed)                                                |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `ms`, `s`, `h`, `min`, `GB`, `MB`, `kB`, `TB`, `Hz`, `kHz`, `km`, `fps`, `kbit/s` after a number | `40%`, `0.01%`, `99.9%`                                                    |
| `10x`, `1.5x` ("ten X")                                                                          | `10×` ("ten times")                                                        |
| `1/3` ("one slash three"), `→` ("right arrow"), `9:00` ("nine zero zero")                        | `350,794`, `10,000`, `p95`, `12:22`, `10:30 pm`, `9am`, `v2.3.1`, `4 CPUs` |

Long lines are fine: a line over 84 characters is split into several caption cues, and each cue starts when
its first word is spoken (word timings from Whisper on the line's own voice clip, cached).

Each line is voiced on its own and cached by a hash of what is spoken plus the voice settings, in
`Video/.cache/voice/`. Changing the animation never re-makes the voice; changing one line re-makes only that
line.

### 2. The scene: `src/<slug>/<scene-id>.tsx`

There is nothing to register: the render points the bundler at this file by its path, so scene authors never
edit a shared file.

```tsx
import React from "react";
import { Arrow, Box, CountUp, edge, Place, Shot, Stage, TitleCard } from "../kit";

// The look. Optional when the slug is a theme name (qoria, ez-spectrum, prtl-labs).
export const theme = "qoria";
// The poster frame (optional; default the end of the last line).
export const poster = { line: 1, at: "end" } as const;

export default function LoadTest() {
    return (
        <Stage>
            <Shot from={0} to={0}>
                <TitleCard kicker="Load testing" title="Ten thousand users at once." />
            </Shot>
            <Shot from={1}>
                <Box kind="client" label="Phones" x={200} y={380} at={1} />
                <Box kind="server" label="API" x={800} y={380} at={{ line: 1, at: 0.3 }} />
                <Arrow
                    from={edge(200, 380, "right")}
                    to={edge(800, 380, "left")}
                    at={{ line: 1, at: 0.4 }}
                />
                <Place x={1100} y={200}>
                    <CountUp to={10000} at={{ line: 1, at: 0.5 }} label="users at once" />
                </Place>
            </Shot>
        </Stage>
    );
}
```

Personal projects use `export const theme` to pick one of the three looks. Pieces that only one scene needs
go in that scene's folder (`src/<slug>/`), next to the scene.

### 3. Render it

`npm run scene -- <slug> <scene-id>`, then look at the frames (see Previewing).

## How timing works

The voice is made first, line by line, and the real length of each line sets the timeline: 1.2 s of music,
then line 0, its pause, line 1, and so on, then 2 s of music to close. The animation reads that timeline, so
**a scene never contains a frame number**. Everything is placed against the narration with a `Cue`:

| Cue                                 | Means                                     |
| ----------------------------------- | ----------------------------------------- |
| `2`                                 | the moment line 2 starts                  |
| `{ line: 2, at: 0.5 }`              | halfway through line 2's speech           |
| `{ line: 2, at: "end" }`            | when the voice finishes line 2            |
| `{ line: 2, at: "next" }`           | when line 3 starts (after line 2's pause) |
| `{ line: 2, at: 0.5, delay: -0.2 }` | 0.2 s before halfway through line 2       |

Lines are numbered from 0. A `Span` says how long something takes: a number of seconds, or
`{ until: <cue> }`. If the wording changes, everything moves with it on the next render.

- `<Shot from={cue} to={cue}>` groups pieces that are on screen together. `to={2}` means until line 3 starts.
  Leave `to` out on the last shot. Shots enter and leave in the look's motion style and cross-fade.
- Inside a shot, a piece without `at` starts with the shot.
- `useProgress(at, span)` and `useSpringIn(at)` give 0 to 1 values for your own pieces, in the look's motion
  feel. `useFrame()` is the frame, held on the look's step (the prtl-labs look moves on twos).

## The caption-safe area

The site's player draws the captions over the bottom of the video, so the kit keeps that band empty.
`<Stage>` puts its children in `SAFE`, a 1600 x 850 box starting 120 px from the left and 70 px from the top.
All positions you give (`x`, `y`, `Place`) are inside that box, from its top-left corner. Below it, **the
bottom 160 px of the frame (y 920 to 1080)**, keep nothing important. The top-right corner outside the box
holds each look's ornaments (the leaf and the orange pebble). `npm run frame -- ... --guides` draws the band
in pink so you can check.

How the band was sized: the site plays the videos in a native `<video controls>` with a default caption
track and no caption styling, so the browser's default caption style applies. Measured in headless Chrome
with a two-line caption at player widths of 335 px (phone), 700, 912 (the desktop column) and 1920: while the
video plays, the captions take the bottom 11.5% of the frame (top at y 955 of 1080) at every size. The band
is that plus a 35 px margin. While the player's controls are showing (paused, or hovered) the captions rise
above the control bar, to about y 800 on desktop and mid-frame on a phone, but the control bar then covers
the bottom of the picture anyway. Firefox and Safari were not measured.

## The kit (`src/kit`)

Import everything from `../kit`. Props marked `?` are optional; `at` is a `Cue` (default: when the shot
starts), `over` a `Span`. Positions are pixels in the safe area.

| Piece            | Props                                                                                                                                                               | What it does                                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Stage`          | children, `ornaments?` (default true)                                                                                                                               | The page: the look's paper colour and texture, its ornaments, and the caption-safe area. Wrap every scene in it.                                                                                                                                                                                                      |
| `Shot`           | `from`, `to?`, children, `style?`                                                                                                                                   | A group of pieces on screen from one cue to another, with the look's enter and exit. `to={2}` means until line 3 starts.                                                                                                                                                                                              |
| `Place`          | `x`, `y`, `w?`, `h?`, `center?`, children, `style?`                                                                                                                 | Puts a piece at `x`, `y` in the safe area; `center` centres it on that point.                                                                                                                                                                                                                                         |
| `TitleCard`      | `title`, `kicker?`, `at?`, `width?` (1300)                                                                                                                          | The opening card: a kicker tag, a big title whose words drop in, a hand-drawn underline.                                                                                                                                                                                                                              |
| `WriteOn`        | `text`, `at?`, `over?`, `size?` (64), `color?`, `italic?`, `weight?` (600), `width?`, `style?`                                                                      | Text that writes itself in letter by letter over a span (default: about the time it takes to say).                                                                                                                                                                                                                    |
| `Tag`            | `text`, `at?`, `color?` (orange), `ink?`, `size?` (30), `seed?`, `style?`                                                                                           | A small cut-paper label (kicker, sticker).                                                                                                                                                                                                                                                                            |
| `CountUp`        | `to`, `from?` (0), `at?`, `over?`, `decimals?`, `prefix?`, `suffix?`, `label?`, `size?` (150), `style?`                                                             | A number on a paper card that counts up over a span, with an optional label.                                                                                                                                                                                                                                          |
| `GrowBar`        | `value`, `max`, `label`, `at?`, `over?`, `width?` (900), `color?`, `format?(v)`, `style?`                                                                           | A paper strip that grows to a value, with its label and the number. Stack several for a bar chart.                                                                                                                                                                                                                    |
| `LineGrow`       | `points`, `at?`, `over?`, `width?` (900), `height?` (360), `color?`, `labels?`, `style?`                                                                            | A hand-drawn line chart that draws itself left to right; values scale to fit; optional labels under the points.                                                                                                                                                                                                       |
| `Box`            | `kind`, `label`, `x`, `y` (its centre), `at?`, `color?`, `highlight?`                                                                                               | A system-diagram box with an icon: `client`, `edge`, `server`, `database`, `queue` or `plain`. `BOX` is its size; `edge(x, y, side)` gives the point on its edge, for arrows.                                                                                                                                         |
| `Arrow`          | `from`, `to` (`[x, y]`), `at?`, `over?`, `color?`, `label?`, `dashed?`, `width?` (6)                                                                                | A hand-drawn arrow that draws itself from one point to the other.                                                                                                                                                                                                                                                     |
| `DotStream`      | `from`, `to`, `at?`, `until?`, `rate?` (6 a second), `travel?` (1.8 s), `lane?`, `size?`, `color?`, `seed?`, `block?: { at, share, where?, mode?, color?, label? }` | Requests as dots flowing from one point to another. With `block`, a paper wall goes up at `block.at` (at `where`, 0 to 1 along the path) and a `share` of the dots stops there: `drop` (fall away) or `block` (bounce back).                                                                                          |
| `BeforeAfter`    | `before`, `after` (any content), `afterAt`, `at?`, `labels?` (`["Before", "After"]`), `width?` (1600), `height?` (600)                                              | A before and after split: the before sheet first, the after sheet laid down at `afterAt`.                                                                                                                                                                                                                             |
| `Timeline`       | `items: { label, note?, at }[]`, `at?`, `width?` (1500)                                                                                                             | A line that draws across, with a marker and label popping in at each item's cue.                                                                                                                                                                                                                                      |
| `Paper`          | `seed`, `color?`, `style?`, `innerStyle?`, `lift?`, `sway?`, `roughness?`, children                                                                                 | A raw piece of cut paper, for your own pieces. Its children count as being on a sheet (see below).                                                                                                                                                                                                                    |
| `Leaf`, `Pebble` | `size`, `color?`, `seed?`, `style?`                                                                                                                                 | The site's leaf and orange pebble.                                                                                                                                                                                                                                                                                    |
| Helpers          |                                                                                                                                                                     | `roughPath(a, b, seed)` (a hand-drawn SVG line), `lerpPoint`, `cueFrame(timeline, cue)`, `cueSeconds`, `paperShadow(theme)`, `cutEdge(seed)`, `jitter`, `seeded`, `hashString`, `useTheme`, `useType` (text styles `display`, `body`, `label`), `useTimeline`, `useFrame`, `useProgress`, `useSpringIn`, `useWobble`. |

**On a sheet.** Anything placed inside a `Paper` (a `BeforeAfter` sheet, your own card) is drawn on that sheet. Where the look's page text colour would not stand out against the sheet (the light text of the dark ez-spectrum page on a stone sheet), `useTheme()` there gives the ink colours instead, so charts, labels and arrows stay readable. Where it already stood out (qoria, prtl-labs), nothing changes.

## The three looks (`src/kit/themes`)

All three share the site's family: cut paper with hard paper shadows, ink, the orange `#ff4f1a`, Fraunces.

Everything a look decides lives in its theme file: colours, page texture (`themes/texture.ts` helpers), vignette, tape and vein colours, fonts, label weight and style, motion and music. Pieces only read the theme. Fonts are loaded in `src/kit/fonts.ts`; a new typeface is one import there plus its name in the theme. A new look is a new file in `themes/`, added to `THEME_NAMES` and `THEMES`.

| Look          | Page                                               | Own colour            | Type                            | Motion                               | Music                                  |
| ------------- | -------------------------------------------------- | --------------------- | ------------------------------- | ------------------------------------ | -------------------------------------- |
| `qoria`       | stone `#e7e7e2`, fine grain                        | sage leaf             | Fraunces, italic labels         | smooth, eased, a slow sway           | warm electric piano, 72 bpm, soft kick |
| `ez-spectrum` | night blue with a faint graph grid, stone cut-outs | signal teal, amber    | Fraunces, uppercase mono labels | snappy with a little overshoot       | glassy pad and bells, 84 bpm, no drums |
| `prtl-labs`   | kraft paper with fibres and a dot grid             | blueprint blue, olive | Fraunces, mono labels           | stop-motion on twos, lines that boil | reed organ, 66 bpm, soft kick          |

## Previewing without a full render

While working on a scene, look at single frames; they take seconds.

- `npm run frame -- <slug> <scene-id>` writes PNGs to `Video/.cache/frames/<slug>/<scene-id>/`: one early
  and one late in every line, plus the poster. About 10 s for a five-line scene.
- `npm run frame -- <slug> <scene-id> --at 3.5,12,20.25` renders those moments (seconds).
- Add `--guides` to draw the caption band in pink.
- `npm run studio -- <slug> <scene-id>` opens Remotion Studio on the scene with its real timing, to scrub
  through it (no sound there).

## Image-only scenes (stills)

`npm run still -- <slug> <scene-id>` renders one frame of `src/<slug>/<scene-id>.tsx` (its `poster` cue) to
`HiMaizProject/public/work/<slug>/<scene-id>.jpg` (or `--out`): 1920x1080 JPEG, at most 300 kB, checked. A narration file is
optional; without one the scene gets a single silent three-second line, so use cues on line 0. Takes about
12 s.

## All commands

| Command                                                    | What it does                                                                                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm run scene -- <slug> <scene-id> [--concurrency N]`     | The whole thing: voice, timing, music, mix, render, encode, poster, captions, copy into the site, check. Exits 1 on any failure. |
| `npm run check -- <slug> <scene-id>`                       | Only the check, on the files already there.                                                                                      |
| `npm run lint:narration -- <slug> [<scene-id>]`            | The units and symbols lint (also takes a folder or a .json path).                                                                |
| `npm run frame -- <slug> <scene-id> [--at s,s] [--guides]` | Preview PNGs.                                                                                                                    |
| `npm run still -- <slug> <scene-id>`                       | An image-only scene to a JPEG.                                                                                                   |
| `npm run studio -- <slug> <scene-id>`                      | Remotion Studio on one scene.                                                                                                    |
| `npm run setup:voice -- <folder>`                          | Build or record the voice environment.                                                                                           |
| `npm run typecheck`, `npm run format:check`                | TypeScript and Prettier.                                                                                                         |

**Concurrency.** A render uses 6 browser tabs by default (`--concurrency N` or `VIDEO_CONCURRENCY` to change
it). The machine is shared, so keep it at 6 or less.

**The render queue.** The machine runs at most **two full renders and one frame-or-still job** at a time,
whoever starts them. `scene` takes a render slot for its render and encode; `frame` and `still` take the
frame slot for their frames; the voice and the bundle run freely. A job that finds the slots taken waits
(it costs nothing) and prints every 30 seconds whom it is queued behind. Slots are lock files in
`render-slots/` inside the voice environment's folder (or `$VIDEO_RENDER_SLOTS`); each records the holder's
PID and process start time, so a slot whose process died, or whose PID now belongs to another process, is
taken back. On a machine without that folder's parent there is no queue.

## What the check enforces

From the contract's media section, on the files in the site folder:

- MP4 at most 8,000,000 bytes; H.264 High, `yuv420p`, 1920x1080, 30 fps; AAC stereo at 128 kbit/s; `moov`
  before `mdat` (faststart); 45 to 90 seconds (not enforced for sample slugs starting with `_`).
- Integrated loudness from -17 to -15 LUFS, true peak under -1 dBTP, not silent (FFmpeg's EBU R128 meter).
- The music at least 12 dB under the voice: the level during the captions against the level in the gaps
  between them (music only), with every caption at least 6 dB over the music.
- The music bed is there: the music-only level at most 24 dB under the voice and at least -45 dBFS (the kit
  sets it about 16 dB under). A voice-only file fails this.
- Poster: 1920x1080 JPEG, at most 250 kB.
- Captions: valid WebVTT whose text is exactly the narration's `text`, in order, inside the video's length.

## How long it takes (this machine: 24 cores, CPU only)

Measured on the 27 s sample and a 75 s test, 6 tabs:

| Stage                                 | 27 s scene                       | 75 s scene           |
| ------------------------------------- | -------------------------------- | -------------------- |
| Voice (only for new or changed lines) | 7 s                              | about 20 s           |
| Bundle                                | 7 s                              | 16 s                 |
| Music and mix                         | 3 to 4 s                         | 9 s                  |
| Render                                | 27 s                             | 69 s                 |
| Encode                                | 6 s                              | 14 s                 |
| Whole command                         | 44 s (voice cached), 90 s (cold) | 109 s (voice cached) |

So about **1.5 minutes of wall time per minute of video**, plus about 20 s per minute of new narration.

Several at once, each with 6 tabs: two scenes barely slow each other (render 29 to 31 s each against 27 s
alone). Three take about 1.6 times as long each (whole command 65 to 71 s, render 46 to 48 s), which is
still 1.8 times the throughput of one after another. Beyond three, each one slows badly; for a shared machine,
three at once is the ceiling.

A 75 s scene came out at 5.6 MB, so a 90 s scene lands near 7 MB. If a scene ever goes over 8 MB, the encoder
retries with a two-pass bitrate that fits; if quality suffers, simplify what moves all the time (big areas
that sway, dense dot streams), not the encode.

## Sound

- **Voice:** Kokoro-82M, voice `am_michael`, speed 1.0, US English, CPU. Chosen by reading the same paragraph
  with five male voices and comparing a Whisper transcript (all but one word-perfect), pace and pitch range:
  `am_michael` was the calmest and plainest (167 words a minute, moderate intonation), not flat and not an
  advert voice. It is also the voice the owner already liked in an earlier video.
- **Music:** generated, not sampled (`scripts/lib/music.ts`): a soft lo-fi bed per look (chords, tempo and
  timbre in the theme file), seeded by the scene so a re-render sounds the same. It is set 16 dB under the
  voice, ducked a few dB more by a sidechain compressor while the voice speaks, then the mix is brought to
  -16 LUFS with true peak under -1.5 dBTP (two-pass `loudnorm`).

## Files

```
narration/<slug>/<scene-id>.json  the script
src/<slug>/<scene-id>.tsx         the scene
src/kit/                          the kit and the three looks
src/Root.tsx                      the one Remotion composition; reads timing, look and poster
scripts/                          scene, check, frame, still, studio, setup-voice
scripts/lib/                      voice, music, mix, captions, render, encode, spec check
scripts/voice.py                  the Kokoro call (run in the voice environment)
scripts/words.py                  Whisper word timings for long caption lines
samples/<slug>/                   sample renders; only the posters are tracked
.cache/                           voice cache, intermediate audio and video, frames (git-ignored)
```
