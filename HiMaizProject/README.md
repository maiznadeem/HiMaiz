# HiMaiz

Personal coming-soon site for Maiz, built with Next.js App Router and designed
for Vercel deployment.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript
- npm
- Three.js for the custom Monolith M sculpture
- Motion for spring-driven pointer interactions
- Lucide for interface icons

## Design References

The homepage combines the editorial scale and negative space of
[Design Prompts: Bold Typography](https://www.designprompts.dev/bold-typography)
with the pointer-driven depth interaction demonstrated by
[Aceternity UI](https://ui.aceternity.com/components/3d-card-effect).
Both resources were identified in the supplied design reel. The layout and
Monolith sculpture are original implementations, not copied paid templates.

`components/Monolith.tsx` derives its geometry from the selected Monolith M logo.
It lazy-loads Three.js, caps pixel density, pauses when the page is hidden,
respects live reduced-motion settings, and falls back to the brand SVG if
WebGL is unavailable. No third-party images, tracking, or runtime asset requests
are required by the artwork.

The page uses dynamic viewport height and safe-area padding. Normal mobile
sizes fit in one screen; very short viewports or enlarged text may scroll so
the contact information remains accessible.

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
npm run build
npm audit
```

## Deployment

Vercel auto-detects the Next.js app. `next.config.ts` adds baseline security
headers.
