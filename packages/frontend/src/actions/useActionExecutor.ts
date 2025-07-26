import { useContext } from "react";
import { NubaseContext } from "../components/nubase-app/NubaseContextProvider";
import { useResourceContext } from "../context/ResourceContext";
import { executeAction as executeActionUtil } from "./executeAction";
import type { Action } from "./types";

/**
 * Hook for executing actions in a standardized way.
 * Gracefully handles missing Nubase context (for Storybook compatibility).
 * Also handles resource context for resource actions.
 *
 * @returns An object with an executeAction function
 */
export function useActionExecutor() {
  // Use useContext directly - this won't throw, just return undefined if context not provided
  const context = useContext(NubaseContext);
  const resourceContext = useResourceContext();

  const executeAction = async (action: Action): Promise<void> => {
    await executeActionUtil(action, context, resourceContext);
  };

  return {
    executeAction,
    /**
     * Whether command execution is available (context is present).
     * Useful for components that want to show different UI based on availability.
     */
    hasCommandSupport: !!context,
    /**
     * Whether resource execution is available (both contexts are present).
     * Useful for components that want to show different UI based on availability.
     */
    hasResourceSupport: !!context && !!resourceContext,
  };
}
