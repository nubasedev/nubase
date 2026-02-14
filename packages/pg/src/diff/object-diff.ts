export interface ObjectSetDiff<T> {
  added: Record<string, T>;
  removed: Record<string, T>;
  modified: Record<string, { from: T; to: T }>;
}

export function diffObjectSets<T>(
  from: Record<string, T>,
  to: Record<string, T>,
  isEqual: (a: T, b: T) => boolean,
): ObjectSetDiff<T> {
  const added: Record<string, T> = {};
  const removed: Record<string, T> = {};
  const modified: Record<string, { from: T; to: T }> = {};

  for (const [key, value] of Object.entries(from)) {
    const toValue = to[key];
    if (toValue === undefined) {
      removed[key] = value;
    } else if (!isEqual(value, toValue)) {
      modified[key] = { from: value, to: toValue };
    }
  }

  for (const [key, value] of Object.entries(to)) {
    if (from[key] === undefined) {
      added[key] = value;
    }
  }

  return { added, removed, modified };
}

export function hasChanges<T>(diff: ObjectSetDiff<T>): boolean {
  return (
    Object.keys(diff.added).length > 0 ||
    Object.keys(diff.removed).length > 0 ||
    Object.keys(diff.modified).length > 0
  );
}
