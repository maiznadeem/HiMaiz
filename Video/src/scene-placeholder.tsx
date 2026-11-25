// Type-checking stand-in for the `@scene` import in Root.tsx. At render time the bundler points
// `@scene` at the real scene file (src/<slug>/<scene-id>.tsx); see scripts/lib/webpack.ts.
export const theme = "qoria";

export default function Placeholder() {
    return null;
}
