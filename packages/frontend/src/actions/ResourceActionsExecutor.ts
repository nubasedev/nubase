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

    try {
      const executionContext: ResourceActionExecutionContext = {
        resourceType,
        selectedIds,
        context: this.context,
      };

      await action.onExecute(executionContext);
    } catch (error) {
      console.error(`Error executing resource action "${action.id}":`, error);
      throw error;
    }
  }
}

export const resourceActionsExecutor = new ResourceActionsExecutorImpl();
