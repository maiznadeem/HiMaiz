# HiMaiz

Personal site for Maiz Nadeem at [himaiz.com](https://himaiz.com): a short home
page, a work log and an RSS feed. Built with Next.js App Router and deployed on
Vercel.

## Stack

- Next.js 16 (App Router, static generation)
- React 19
- Tailwind CSS 4
- TypeScript
- Vitest for tests
- Fraunces, loaded through `next/font/google`
- `gray-matter`, `marked` and `zod` for the work log
- npm

There is no 3D, canvas, analytics or animation library. The paper look is SVG
shapes with an SVG filter and CSS.

## Identity

A warm paper cut-out look: a leaf and a pebble, cut from paper, on stone.

| Token  | Light     | Dark      |
| ------ | --------- | --------- |
| stone  | `#e7e7e2` | `#22211e` |
| ink    | `#191919` | `#ecebe5` |
| orange | `#ff4f1a` | `#ff6a3d` |
| muted  | `#5f5f5a` | `#a3a29a` |

Dark values apply under `prefers-color-scheme: dark`. Orange is for shapes,
rules, focus rings and large display type, never body-size text.

Fraunces is the only typeface. Display is 700 with `SOFT` 100, `WONK` 1 and
`opsz` 144; body is 400 with `SOFT` 50 and `WONK` 0.

The social image (`app/opengraph-image.tsx`) and Apple icon
(`app/apple-icon.tsx`) are rendered with `next/og`. Satori cannot use variable
font axes, so they load a static instance of Fraunces from
`assets/fonts/Fraunces-Soft-700.ttf` (SIL OFL, see `assets/fonts/OFL.txt`). It
was made from the Google Fonts variable file with:

```bash
python -m fontTools.varLib.instancer "Fraunces[SOFT,WONK,opsz,wght].ttf" \
  wght=700 opsz=144 SOFT=100 WONK=1 -o assets/fonts/Fraunces-Soft-700.ttf
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm audit
```

`npm test` runs the Vitest suite (log parsing, dates, RSS, clipboard). `npm audit`
should report no high or critical findings.

## Adding a log entry

Each entry is a Markdown file in `content/log/`.

**File name.** The name is the entry's URL slug, so `my-entry.md` becomes
`/log/my-entry`. Use lowercase letters, digits and hyphens only. A name such as
`My Entry.md` or `foo_bar.md` fails the build and the error names the file. So
does a `.MD` or `.markdown` extension: use a lowercase `.md` file name.

**Frontmatter.** `date` and `summary` are required; `draft` is optional and
defaults to `false`.

```md
---
date: "2026-11-19"
summary: Moved the site to a paper cut-out look.
draft: false
---

Optional body in Markdown. Leave it empty for a one-line entry.
```

- `date` is a real calendar date, `YYYY-MM-DD`.
- Body headings start at `##`. The summary is the page's `h1`, so a `#` in the body is rendered as `##`.
- `summary` is one line of plain text. It is the text shown in the log, the
  entry page title and the RSS item title.

**Drafts.** Entries with `draft: true` show up in `npm run dev` and in Vercel
preview deploys (`VERCEL_ENV=preview`). They are hidden in production
(`VERCEL_ENV=production`) and in a plain local `npm run build`.

**Entry pages.** An entry gets its own page at `/log/<slug>`, and appears in the
sitemap, when its body is not empty. An entry with no body only appears in the
log list and in the feed.

## Deployment

Vercel auto-detects the Next.js app. `next.config.ts` adds baseline security
headers. The RSS feed is served at `/log/rss.xml`.
