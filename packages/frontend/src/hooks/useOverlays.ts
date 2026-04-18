import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import {
  type Overlay,
  readOverlays,
  writeOverlays,
} from "../utils/overlay-url";

export type UseOverlaysResult = {
  overlays: Overlay[];
  openOverlay: (overlay: Overlay) => void;
  closeTopOverlay: () => void;
  closeOverlay: (depth: number) => void;
  closeAllOverlays: () => void;
};

export function useOverlays(): UseOverlaysResult {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();
  const location = useLocation();

  const overlays = useMemo(() => readOverlays(search), [search]);

  const navigateTo = useCallback(
    (nextOverlays: Overlay[]) => {
      const nextSearch = writeOverlays(search, nextOverlays);
      navigate({ to: location.pathname, search: nextSearch, replace: false });
    },
    [navigate, search, location.pathname],
  );

  const openOverlay = useCallback(
    (overlay: Overlay) => {
      navigateTo([...overlays, overlay]);
    },
    [navigateTo, overlays],
  );

  const closeTopOverlay = useCallback(() => {
    if (overlays.length === 0) return;
    navigateTo(overlays.slice(0, -1));
  }, [navigateTo, overlays]);

  const closeOverlay = useCallback(
    (depth: number) => {
      if (depth < 0 || depth >= overlays.length) return;
      navigateTo(overlays.slice(0, depth));
    },
    [navigateTo, overlays],
  );

  const closeAllOverlays = useCallback(() => {
    if (overlays.length === 0) return;
    navigateTo([]);
  }, [navigateTo, overlays]);

  return {
    overlays,
    openOverlay,
    closeTopOverlay,
    closeOverlay,
    closeAllOverlays,
  };
}
