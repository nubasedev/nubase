import type { NubaseContextData } from "../context/types";
import type { ResourceAction, ResourceActionExecutionContext } from "./types";

/**
 * Interface for resource actions executor
 */
export interface ResourceActionsExecutor {
  execute: (
    action: ResourceAction,
    resourceType: string,
    selectedIds: (string | number)[],
  ) => Promise<void>;
}

/**
 * Implementation of resource actions executor
 */
class ResourceActionsExecutorImpl implements ResourceActionsExecutor {
  private context: NubaseContextData | null = null;

  setContext(context: NubaseContextData) {
    this.context = context;
  }

  async execute(
    action: ResourceAction,
    resourceType: string,
    selectedIds: (string | number)[],
  ): Promise<void> {
    if (action.disabled) {
      return;
    }

    const executionContext: ResourceActionExecutionContext = {
      resourceType,
      selectedIds,
      context: this.context,
    };

    if (action.confirm) {
      let confirmConfig: Awaited<ReturnType<typeof action.confirm>>;
      try {
        confirmConfig = await action.confirm(executionContext);
      } catch (error) {
        console.error(
          `Error in confirm handler for resource action "${action.id}":`,
          error,
        );
        return;
      }

      if (confirmConfig === false) {
        // confirm explicitly opted out — proceed without dialog.
      } else {
        const dialog = this.context?.dialog;
        if (!dialog) {
          console.error(
            `Resource action "${action.id}" has confirm but no dialog provider available on context.`,
          );
          return;
        }

        const confirmed = await dialog.confirm({
          confirmText: action.label,
          confirmVariant: action.variant,
          ...confirmConfig,
        });
        if (!confirmed) {
          return;
        }
      }
    }

    try {
      await action.onExecute(executionContext);
    } catch (error) {
      console.error(`Error executing resource action "${action.id}":`, error);
      throw error;
    }
  }
}

export const resourceActionsExecutor = new ResourceActionsExecutorImpl();
