# HiMaiz

Personal coming-soon site for Maiz, built with Next.js App Router and designed
for Vercel deployment.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript
- npm

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
npm run build
```

## Deployment

Vercel auto-detects the Next.js app. `next.config.ts` adds baseline security
headers.
