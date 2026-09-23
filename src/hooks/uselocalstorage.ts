import { useCallback, useEffect, useState } from "react";

/**
 * useState, but persisted to localStorage.
 *
 * Handles SSR, JSON parse errors, and cross-tab sync via the storage event.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  // ---------------------------------------------------------------------------
  // Read once on mount
  // ---------------------------------------------------------------------------
  const readValue = useCallback((): T => {
    if (typeof window === "undefined")
      return initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null)
        return initialValue;
      return JSON.parse(raw) as T;
    }
    catch (error) {
      console.warn(`useLocalStorage: could not read "${key}"`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [stored, setStored] = useState<T>(readValue);

  // ---------------------------------------------------------------------------
  // Write
  // ---------------------------------------------------------------------------
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      try {
        const valueToStore = typeof next === "function"
          ? (next as (prev: T) => T)(stored)
          : next;

        setStored(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Notify other tabs
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue: JSON.stringify(valueToStore),
            }),
          );
        }
      }
      catch (error) {
        console.warn(`useLocalStorage: could not write "${key}"`, error);
      }
    },
    [key, stored],
  );

  // ---------------------------------------------------------------------------
  // Remove
  // ---------------------------------------------------------------------------
  const remove = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: null }),
        );
      }
      setStored(initialValue);
    }
    catch (error) {
      console.warn(`useLocalStorage: could not remove "${key}"`, error);
    }
  }, [key, initialValue]);

  // ---------------------------------------------------------------------------
  // Listen for other tabs
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key)
        return;

      if (e.newValue === null) {
        setStored(initialValue);
        return;
      }

      try {
        setStored(JSON.parse(e.newValue) as T);
      }
      catch {
        /* ignore */
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, initialValue]);

  return [stored, setValue, remove];
}
