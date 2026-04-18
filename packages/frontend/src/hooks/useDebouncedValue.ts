import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value`: every change to `value` resets a
 * timer, and the debounced result updates only after `delayMs` have
 * elapsed without further changes.
 *
 * The component re-renders with `value` immediately (for live display)
 * while the returned value lags, which is the usual pattern for
 * "react-to-typing" APIs like search or query filters.
 *
 * @example
 * ```ts
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebouncedValue(query, 300);
 * useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
