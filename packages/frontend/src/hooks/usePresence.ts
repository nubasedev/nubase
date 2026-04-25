import type { AnimationEvent } from "react";
import { useCallback, useEffect, useState } from "react";

type UsePresenceOptions = {
  onExited?: () => void;
};

export type PresenceState = "open" | "closed";

export type PresenceProps = {
  "data-state": PresenceState;
  onAnimationEnd: (e: AnimationEvent<HTMLElement>) => void;
};

export type UsePresenceResult = {
  shouldRender: boolean;
  presenceProps: PresenceProps;
};

/**
 * Manages enter/exit animation lifecycle for floating surfaces. The returned
 * `presenceProps` are spread onto the animated element, exposing a Radix-style
 * `data-state` attribute that drives `data-[state=open|closed]:animate-in/out`
 * Tailwind classes. Unmount is deferred until the exit animation completes.
 */
export function usePresence(
  open: boolean,
  { onExited }: UsePresenceOptions = {},
): UsePresenceResult {
  const [shouldRender, setShouldRender] = useState(open);
  const isExiting = shouldRender && !open;

  useEffect(() => {
    if (open) setShouldRender(true);
  }, [open]);

  const onAnimationEnd = useCallback(
    (e: AnimationEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return;
      if (isExiting) {
        setShouldRender(false);
        onExited?.();
      }
    },
    [isExiting, onExited],
  );

  return {
    shouldRender,
    presenceProps: {
      "data-state": isExiting ? "closed" : "open",
      onAnimationEnd,
    },
  };
}
