import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True once running in the browser. Portals wait for this. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}
