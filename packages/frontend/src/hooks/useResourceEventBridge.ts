import { useEffect } from "react";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";
import { useResourceInvalidation } from "./useNubaseMutation";

/**
 * Bridges resource mutation events to TanStack Query cache invalidation.
 *
 * This is the single place where resource events trigger invalidation;
 * mutation sites only emit events and never invalidate directly.
 */
export function useResourceEventBridge() {
  const { events } = useNubaseContext();
  const { invalidateResource } = useResourceInvalidation();

  useEffect(
    () =>
      events.onMany(
        ["resource.created", "resource.patched", "resource.deleted"],
        (payload) => {
          const resourceName = (payload as { resourceName?: string })
            .resourceName;
          if (resourceName) {
            void invalidateResource(resourceName);
          }
        },
      ),
    [events, invalidateResource],
  );
}
