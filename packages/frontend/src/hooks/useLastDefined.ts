import { useEffect, useState } from "react";

/**
 * "Sticky" value hook: returns `value` when it is defined, otherwise the
 * most recent defined value this hook has seen. Useful when rendering
 * data from a source that may transiently go `undefined` — e.g. a
 * TanStack Query that errored out and dropped its `placeholderData` —
 * and you'd rather show the last good snapshot than an empty state.
 *
 * @example
 * ```ts
 * const data = useLastDefined(response?.data) ?? [];
 * // On error: keeps the last successful rows instead of flashing empty.
 * ```
 */
export function useLastDefined<T>(value: T | undefined | null): T | undefined {
  const [last, setLast] = useState<T | undefined>(undefined);
  useEffect(() => {
    if (value !== undefined && value !== null) setLast(value);
  }, [value]);
  return value ?? last;
}
