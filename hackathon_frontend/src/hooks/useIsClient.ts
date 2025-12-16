'use client';

import { useSyncExternalStore } from "react";

/**
 * Bileşenin client ortamında çalışıp çalışmadığını bildirir.
 * `useSyncExternalStore` ile render sırasında `window` varlığını okur,
 * ekstra state güncellemesi yapmaz.
 */
export function useIsClient() {
  const subscribe = () => () => {};
  const getSnapshot = () => typeof window !== "undefined";
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
