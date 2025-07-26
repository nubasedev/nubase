import type { ResourceContextData } from "../context/ResourceContext";
import type { NubaseContextData } from "../context/types";
import type {
  Action,
  CommandAction,
  HandlerAction,
  ResourceAction,
} from "./types";

/**
 * Standalone action executor that can be used outside of React components.
 * This is the core logic extracted from useActionExecutor for use in KeybindingManager.
 *
 * @param action - The action to execute
 * @param context - The Nubase context (optional, required for command actions)
 * @param resourceContext - The resource context (optional, required for resource actions)
 * @returns Promise that resolves when action completes
 */
export async function executeAction(
  action: Action,
  context?: NubaseContextData | null,
  resourceContext?: ResourceContextData | null,
): Promise<void> {
  if (action.disabled) {
    return;
  }

  switch (action.type) {
    case "handler": {
      const handlerAction = action as HandlerAction;
      try {
        await handlerAction.onExecute();
      } catch (error) {
        console.error(`Error executing handler action "${action.id}":`, error);
      }
      break;
    }
    case "command": {
      const commandAction = action as CommandAction;

      // Check if context is available for command execution
      if (!context) {
        throw new Error(
          `Cannot execute command "${commandAction.command}" - NubaseContext not available. Make sure you're running within a NubaseApp or provide a handler action for standalone usage.`,
        );
      }

      try {
        await context.commands.execute(
          commandAction.command,
          commandAction.commandArgs,
        );
      } catch (error) {
        console.error(`Error executing command action "${action.id}":`, error);
      }
      break;
    }
    case "resource": {
      const resourceAction = action as ResourceAction;

      // Check if context is available for resource execution
      if (!context) {
        throw new Error(
          `Cannot execute resource action "${resourceAction.id}" - NubaseContext not available. Make sure you're running within a NubaseApp.`,
        );
      }

      // Check if resource context is available for resource execution
      if (!resourceContext) {
        throw new Error(
          `Cannot execute resource action "${resourceAction.id}" - ResourceContext not available. Make sure you're running within a ResourceContextProvider.`,
        );
      }

      try {
        const selectedIds = Array.from(resourceContext.selectedIds);
        await context.resourceActions.execute(
          resourceAction,
          resourceContext.resourceType,
          selectedIds,
        );
      } catch (error) {
        console.error(`Error executing resource action "${action.id}":`, error);
      }
      break;
    }
    default: {
      // TypeScript exhaustiveness check - this should never be reached
      const _exhaustiveCheck: never = action;
      console.error(`Unknown action type:`, _exhaustiveCheck);
      break;
    }
  }
}
