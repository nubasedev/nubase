import type { ActionOrSeparator, CommandAction } from "../actions/types";

/**
 * Legacy export for backward compatibility.
 * @deprecated Use CommandAction from '../actions/types' instead.
 */
export type Action = CommandAction;

/**
 * Global actions configuration type that supports separators for grouping.
 * Uses the standardized ActionOrSeparator which supports both command and handler actions.
 */
export type GlobalActionsConfig = ActionOrSeparator[];
