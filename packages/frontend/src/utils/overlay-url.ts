export type Overlay = {
  resource: string;
  operation: string;
  params: Record<string, string>;
};

const OVERLAY_KEY_PATTERN = /^overlay(\d+)$/;

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

export function readOverlays(
  search: Record<string, unknown> | undefined | null,
): Overlay[] {
  if (!search) return [];

  const indexed: Array<{ index: number; overlay: Overlay }> = [];
  for (const [key, value] of Object.entries(search)) {
    const match = key.match(OVERLAY_KEY_PATTERN);
    if (!match) continue;
    if (typeof value !== "string") continue;
    const overlay = parseOverlayString(value);
    if (!overlay) continue;
    indexed.push({ index: Number(match[1]), overlay });
  }

  indexed.sort((a, b) => a.index - b.index);

  const result: Overlay[] = [];
  let expected = 1;
  for (const { index, overlay } of indexed) {
    if (index !== expected) break;
    result.push(overlay);
    expected += 1;
  }
  return result;
}

export function writeOverlays(
  search: Record<string, unknown> | undefined | null,
  overlays: Overlay[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (OVERLAY_KEY_PATTERN.test(key)) continue;
      result[key] = value;
    }
  }
  overlays.forEach((overlay, i) => {
    result[`overlay${i + 1}`] = stringifyOverlay(overlay);
  });
  return result;
}
