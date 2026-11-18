# HiMaiz Leaf and Pebble Assets

The identity is a warm paper cut-out: a pointed ink leaf with a thin vein cut through it
(the page colour showing through) and a small orange pebble just below and right of it.

## Files

- `leaf-pebble.svg` - master mark on stone (light).
- `leaf-pebble-dark.svg` - master mark on dark stone.
- `leaf-pebble-mono.svg` - single-colour version (ink on stone, pebble in ink).
- `leaf-pebble-app-icon.svg` - square, rounded app icon on stone, with padding.
- `leaf-pebble-preview.png` - the four SVGs side by side.
- `archive/monolith-m/` - the previous Monolith M identity, kept for reference.

The site favicon is `HiMaizProject/app/icon.svg`. It has no background and switches colours
with `prefers-color-scheme`.

## Palette

| Token  | Light     | Dark      |
| ------ | --------- | --------- |
| Stone  | `#e7e7e2` | `#22211e` |
| Ink    | `#191919` | `#ecebe5` |
| Orange | `#ff4f1a` | `#ff6a3d` |
| Muted  | `#6b6b66` | `#a3a29a` |

Orange is for shapes, rules and focus rings only, never body-size text (contrast about 2.9:1).

## Geometry (100 x 100 viewBox)

- Leaf: `M18 82C16 50 34 20 76 14 82 46 62 78 18 82Z`, filled ink.
- Vein: `M23 77C40 58 54 40 71 20`, stroke in the page colour, width 3, round caps.
- Pebble: `M70 64c8-4 16 2 14 10-2 8-14 10-18 4-3-5-1-11 4-14z`, filled orange.

## Paper effect

On the page, the mark uses the `#paper` SVG filter (`PaperFilter`): `feTurbulence`
fractalNoise at 0.06, 2 octaves, seed 4, into `feDisplacementMap` at scale 0.8 for softly
irregular edges, then `feDropShadow` (dx 0.8, dy 1.6, blur 0.9) for the shadow. The files in
this folder and the favicon are flat, with no filter.
