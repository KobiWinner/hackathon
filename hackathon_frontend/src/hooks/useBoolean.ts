'use client';

import { useCallback, useState } from "react";

/**
 * Basit boolean state yönetimi: true/false setter'lar ve toggle döner.
 */
export function useBoolean(initialState = false) {
  const [value, setValue] = useState(initialState);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setValue, setTrue, setFalse, toggle };
}
