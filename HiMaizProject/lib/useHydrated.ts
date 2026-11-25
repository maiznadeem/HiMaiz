import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False in the static HTML and during hydration, true once React runs in the browser. */
export function useHydrated(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}
