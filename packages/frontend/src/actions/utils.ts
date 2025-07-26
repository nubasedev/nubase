import type { TypedCommandDefinition } from "../commands/types";
import type {
  Action,
  ActionOrSeparator,
  BaseAction,
  CommandAction,
  HandlerAction,
} from "./types";

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
