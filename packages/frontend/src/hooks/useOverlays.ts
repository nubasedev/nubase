import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { type Overlay, readOverlay, writeOverlay } from "../utils/overlay-url";

export type UseOverlaysResult = {
  overlay: Overlay | null;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
};

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
      navigateTo(next);
    },
    [navigateTo],
  );

  const closeOverlay = useCallback(() => {
    if (!overlay) return;
    navigateTo(null);
  }, [navigateTo, overlay]);

  return { overlay, openOverlay, closeOverlay };
}
