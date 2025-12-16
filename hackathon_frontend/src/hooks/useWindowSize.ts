'use client';

import { useSyncExternalStore } from "react";

type WindowSize = {
  width: number;
  height: number;
};

const defaultSize: WindowSize = { width: 0, height: 0 };
let cachedSize: WindowSize = defaultSize;

const readWindowSize = (): WindowSize => {
  if (typeof window === "undefined") {
    return cachedSize;
  }

  // İlk çağrıda cache doldur.
  if (cachedSize === defaultSize || cachedSize.width === 0) {
    cachedSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  return cachedSize;
};

const updateCachedSize = () => {
  if (typeof window === "undefined") {return false;}
  const next = { width: window.innerWidth, height: window.innerHeight };

  if (
    next.width !== cachedSize.width ||
    next.height !== cachedSize.height
  ) {
    cachedSize = next;
    return true;
  }

  return false;
};

/**
 * Pencere boyutunu dinler; SSR için güvenli fallback sağlar.
 * `useSyncExternalStore` gereği getSnapshot aynı referansı döndürür, değişim
 * olduğunda cache güncellenir.
 */
export function useWindowSize(initialValue: WindowSize = defaultSize) {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      cachedSize = initialValue;
      return () => {};
    }

    const handler = () => {
      const changed = updateCachedSize();
      if (changed) {callback();}
    };

    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  };

  const getSnapshot = () => readWindowSize();
  const getServerSnapshot = () => initialValue;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
