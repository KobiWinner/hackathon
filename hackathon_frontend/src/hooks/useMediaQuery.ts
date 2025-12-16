'use client';

import { useSyncExternalStore } from "react";

/**
 * `matchMedia` tabanlı medya sorgusunu dinler; eşleşiyorsa `true` döner.
 *
 * - `query`: CSS media query ifadesi. Örn: `(min-width: 1024px)`
 * - `initialValue`: SSR veya test ortamında varsayılan değer; hydrate sonrası gerçek değerle senkronlar.
 *
 * `useSyncExternalStore`, DOM'dan gelen değişiklikleri React state'ine güvenli ve performanslı taşır.
 */
export function useMediaQuery(query: string, initialValue = false) {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {return () => {};}

    const mediaQuery = window.matchMedia(query);
    const handler = () => callback();

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  };

  const getSnapshot = () =>
    typeof window !== "undefined"
      ? window.matchMedia(query).matches
      : initialValue;

  const getServerSnapshot = () => initialValue;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
