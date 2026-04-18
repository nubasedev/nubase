import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { type Overlay, readOverlay, writeOverlay } from "../utils/overlay-url";

export type UseOverlaysResult = {
  overlay: Overlay | null;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
};

function overlaysEqual(a: Overlay | null, b: Overlay | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.resource !== b.resource || a.operation !== b.operation) return false;
  const aKeys = Object.keys(a.params);
  const bKeys = Object.keys(b.params);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a.params[key] !== b.params[key]) return false;
  }
  return true;
}

export function useOverlays(): UseOverlaysResult {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();
  const location = useLocation();

  const overlay = useMemo(() => readOverlay(search), [search]);

  const navigateTo = useCallback(
    (next: Overlay | null) => {
      const nextSearch = writeOverlay(search, next);
      navigate({ to: location.pathname, search: nextSearch, replace: false });
    },
    [navigate, search, location.pathname],
  );

  const openOverlay = useCallback(
    (next: Overlay) => {
      // Skip the navigation entirely if the target overlay is already active.
      // Without this, clicking the same row twice re-emits the search params,
      // triggering downstream re-renders and a spinner flicker in the drawer.
      if (overlaysEqual(overlay, next)) return;
      navigateTo(next);
    },
    [navigateTo, overlay],
  );

  const closeOverlay = useCallback(() => {
    if (!overlay) return;
    navigateTo(null);
  }, [navigateTo, overlay]);

  return { overlay, openOverlay, closeOverlay };
}
