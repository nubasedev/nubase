import type { BaseSchema, Infer } from "@nubase/core";
import type React from "react";
import type { TypedCommandDefinition } from "../commands/types";
import type { DialogConfirmConfig } from "../components/floating/dialog";

/**
 * Base action interface with common properties shared by all action types.
 */
export interface BaseAction {
  id: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

/**
 * Context provided to handler actions when executed from row-level components
 */
export interface ActionExecutionContext {
  rowData?: any;
  context?: any;
}

/**
 * Context provided to resource actions when executed on selected resources
 */
export interface ResourceActionExecutionContext {
  resourceType: string;
  selectedIds: (string | number)[];
  context?: any;
}

/**
 * Handler-based action that executes a function directly.
 * Best for simple actions and Storybook examples.
 * Can optionally receive execution context for row-level actions.
 */
export interface HandlerAction extends BaseAction {
  type: "handler";
  onExecute: (
    executionContext?: ActionExecutionContext,
  ) => void | Promise<void>;
}

/**
 * Command-based action that executes through the command registry.
 * Best for application-wide actions that need to be consistent and type-safe.
 * @template TCommand - The command definition type for type-safe argument inference
 */
export interface CommandAction<TCommand = any> extends BaseAction {
  type: "command";
  command: string;
  commandArgs?: TCommand extends TypedCommandDefinition<infer TSchema>
    ? TSchema extends BaseSchema<any>
      ? Infer<TSchema>
      : undefined
    : Record<string, unknown>;
}

/**
 * Function returning a confirmation-dialog config to gate a resource action's
 * execution. May be sync or async — the executor awaits it, so you can perform
 * server checks (permissions, business rules) before deciding whether to
 * confirm.
 *
 * Returning a config opens a dialog; the action runs only if the user
 * confirms. Returning `false` aborts the action entirely (no dialog, no
 * `onExecute`). Throwing also aborts.
 *
 * The framework defaults `confirmText` to the action's label and
 * `confirmVariant` to the action's variant when not provided in the returned
 * config; user-supplied fields always win.
 *
 * @example
 * confirm: async ({ context, selectedIds }) => {
 *   const me = await context.http.getCurrentUser();
 *   if (!me.data.isAdmin) return false; // silently abort
 *   return {
 *     title: `Delete ${selectedIds.length} item(s)`,
 *     content: "This cannot be undone.",
 *   };
 * }
 */
export type ResourceActionConfirm = (
  ctx: ResourceActionExecutionContext,
) => DialogConfirmConfig | false | Promise<DialogConfirmConfig | false>;

/**
 * Resource-based action that executes on selected resources.
 * Best for bulk operations on multiple selected items (e.g., delete multiple tickets).
 * Requires ResourceContext to provide selected resource IDs.
 */
export interface ResourceAction extends BaseAction {
  type: "resource";
  /**
   * When true (default), the action is disabled in table toolbars unless at
   * least one row is selected. Set to false for actions that don't operate on
   * the current selection (e.g. "Create").
   */
  requiresSelection?: boolean;
  /**
   * Optional confirmation gate. When defined, the framework opens a
   * confirmation dialog before invoking `onExecute`. See `ResourceActionConfirm`.
   */
  confirm?: ResourceActionConfirm;
  onExecute: (
    executionContext: ResourceActionExecutionContext,
  ) => void | Promise<void>;
}

/**
 * Union type for all supported action types.
 */
export type Action = HandlerAction | CommandAction<any> | ResourceAction;

/**
 * Type for action or separator - used consistently across all action components.
 */
export type ActionOrSeparator = Action | "separator";
