import type { TypedCommandDefinition } from "../commands/types";
import type { ActionLayout } from "../config/action-layout";
import type {
  Action,
  ActionOrSeparator,
  BaseAction,
  CommandAction,
  HandlerAction,
} from "./types";

/**
 * Resolves an action layout (list of action id strings + separators) against
 * a resource's action map, producing fully-resolved `ActionOrSeparator[]`.
 * Unknown ids are silently dropped.
 */
export function resolveActionLayout(
  actionLayout: ActionLayout<string> | undefined,
  resourceActions: Record<string, any> | undefined,
): ActionOrSeparator[] {
  if (!actionLayout || !resourceActions) return [];
  return actionLayout
    .map((actionId) => {
      if (actionId === "separator") return "separator" as const;
      return resourceActions[actionId];
    })
    .filter(Boolean);
}

/**
 * Type guard to check if an action is a HandlerAction.
 */
export function isHandlerAction(action: Action): action is HandlerAction {
  return action.type === "handler";
}

/**
 * Type guard to check if an action is a CommandAction.
 */
export function isCommandAction(action: Action): action is CommandAction {
  return action.type === "command";
}

/**
 * Factory function for creating handler-based actions.
 */
export function createHandlerAction(
  base: BaseAction,
  onExecute: () => void | Promise<void>,
): HandlerAction {
  return {
    ...base,
    type: "handler",
    onExecute,
  };
}

/**
 * Factory function for creating type-safe command-based actions.
 * Supports both typed command definitions and legacy string commands.
 */
export function createCommandAction<
  TCommand extends TypedCommandDefinition<any>,
>(
  base: BaseAction,
  command: TCommand,
  commandArgs?: TCommand extends TypedCommandDefinition<infer TSchema>
    ? TSchema extends import("@nubase/core").BaseSchema<any>
      ? import("@nubase/core").Infer<TSchema>
      : undefined
    : never,
): CommandAction<TCommand>;

export function createCommandAction(
  base: BaseAction,
  command: string,
  commandArgs?: Record<string, unknown>,
): CommandAction<any>;

export function createCommandAction(
  base: BaseAction,
  command: string | TypedCommandDefinition<any>,
  commandArgs?: any,
): CommandAction<any> {
  const commandId = typeof command === "string" ? command : command.id;

  return {
    ...base,
    type: "command",
    command: commandId,
    commandArgs,
  };
}

/**
 * Strips structurally-meaningless separators from an action list:
 * leading separators, trailing separators, and runs of consecutive
 * separators (collapsed to one). Used when filtering an action list
 * (e.g. dropping global actions to build a per-row dropdown) can leave
 * the remaining separators orphaned.
 */
export function normalizeActionSeparators(
  actions: ActionOrSeparator[],
): ActionOrSeparator[] {
  const result: ActionOrSeparator[] = [];
  for (const item of actions) {
    if (item === "separator") {
      // Skip leading separators and runs of consecutive separators.
      if (result.length === 0 || result[result.length - 1] === "separator") {
        continue;
      }
    }
    result.push(item);
  }
  // Trim a trailing separator.
  if (result[result.length - 1] === "separator") result.pop();
  return result;
}

/**
 * Utility to convert a list of actions with separators into grouped structure.
 * Splits actions at "separator" markers into separate arrays.
 */
export function groupActionsBySeparators(
  actionsConfig: ActionOrSeparator[],
): Action[][] {
  const groups: Action[][] = [];
  let currentGroup: Action[] = [];

  for (const item of actionsConfig) {
    if (item === "separator") {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else {
      currentGroup.push(item);
    }
  }

  // Add remaining actions as the last group
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
