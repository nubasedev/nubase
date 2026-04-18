export type Overlay = {
  resource: string;
  operation: string;
  params: Record<string, string>;
};

export const OVERLAY_KEY = "overlay";

export function parseOverlayString(input: string): Overlay | null {
  if (!input) return null;
  const segments = input.split("/");
  if (segments.length < 2) return null;

  const [resource, operation, ...paramSegments] = segments;
  if (!resource || !operation) return null;

  const params: Record<string, string> = {};
  for (const segment of paramSegments) {
    const colonIdx = segment.indexOf(":");
    if (colonIdx <= 0) continue;
    const key = segment.slice(0, colonIdx);
    const value = segment.slice(colonIdx + 1);
    params[key] = value;
  }

  return { resource, operation, params };
}

export function stringifyOverlay(overlay: Overlay): string {
  const segments = [overlay.resource, overlay.operation];
  for (const [key, value] of Object.entries(overlay.params)) {
    segments.push(`${key}:${String(value)}`);
  }
  return segments.join("/");
}

export function readOverlay(
  search: Record<string, unknown> | undefined | null,
): Overlay | null {
  if (!search) return null;
  const raw = search[OVERLAY_KEY];
  if (typeof raw !== "string") return null;
  return parseOverlayString(raw);
}

export function writeOverlay(
  search: Record<string, unknown> | undefined | null,
  overlay: Overlay | null,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (key === OVERLAY_KEY) continue;
      result[key] = value;
    }
  }
  if (overlay) {
    result[OVERLAY_KEY] = stringifyOverlay(overlay);
  }
  return result;
}
