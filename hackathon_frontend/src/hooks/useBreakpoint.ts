'use client';

import { BREAKPOINTS } from "@/shared/constants";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

/**
 * Standart breakpoint'ler için boolean bayraklar döner.
 * Örn: `const { isMdUp } = useBreakpoint();`
 */
export function useBreakpoint(initialValue = false) {
  const isXsUp = useMediaQuery(`(min-width: ${BREAKPOINTS.xs}px)`, initialValue);
  const isSmUp = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`, initialValue);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`, initialValue);
  const isLgUp = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`, initialValue);
  const isXlUp = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`, initialValue);

  return {
    isXsUp,
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
  };
}
