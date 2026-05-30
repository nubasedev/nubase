import { useEffect, useRef } from "react";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";
import type { EventListener, NubaseEventType } from "../events/types";

/**
 * Subscribe a component to a Nubase event for its lifetime.
 *
 * The listener is kept in a ref so it always sees the latest closure without
 * re-subscribing on every render.
 */
export function useNubaseEvent<T extends NubaseEventType>(
  type: T,
  listener: EventListener<T>,
) {
  const { events } = useNubaseContext();
  const ref = useRef(listener);
  ref.current = listener;

  useEffect(
    () =>
      events.on(type, ((payload: Parameters<EventListener<T>>[0]) =>
        ref.current(payload)) as EventListener<T>),
    [events, type],
  );
}
