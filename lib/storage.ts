'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'fs-';

/**
 * useState that is saved to localStorage under `fs-<key>`.
 * The first render always uses `initial` (so server and client HTML match);
 * the saved value is loaded right after mount. `loaded` turns true once that has happened.
 * Changes made in another browser tab are picked up too.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const storageKey = PREFIX + key;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const validateRef = useRef(validate);

  const read = useCallback((raw: string | null): T | undefined => {
    if (raw === null) return undefined;
    try {
      const parsed = JSON.parse(raw);
      if (validateRef.current && !validateRef.current(parsed)) return undefined;
      return parsed as T;
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    try {
      const saved = read(localStorage.getItem(storageKey));
      if (saved !== undefined) setValue(saved);
    } catch {}
    setLoaded(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      const next = read(e.newValue);
      setValue(next === undefined ? initial : next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, read]);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (value === null || value === undefined) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {}
  }, [loaded, storageKey, value]);

  return [value, setValue, loaded];
}

/** Remove every value this app has saved in the browser. */
export function clearSavedData() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
}
