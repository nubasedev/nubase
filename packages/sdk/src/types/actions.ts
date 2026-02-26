import type { DatabaseClient } from "./database-client.js";
import type { EntityMap } from "./entity.js";

// ---------------------------------------------------------------------------
// Custom action types
// ---------------------------------------------------------------------------

export type ActionScope = "single" | "bulk" | "global";

export interface ActionContext<TEntities extends EntityMap> {
  user: { id: number; email: string; displayName: string };
  workspace: { id: number; slug: string };
  db: DatabaseClient<TEntities>;
  log: (...args: unknown[]) => void;
  /** The selected entity IDs (for single or bulk scope). */
  selectedIds: (number | string)[];
}

export interface ActionResult {
  success: boolean;
  message?: string;
  /** Entity names to refresh in the UI after the action completes. */
  refreshEntities?: string[];
}

export interface ActionDefinition<TEntities extends EntityMap> {
  entity: Extract<keyof TEntities, string>;
  label: string;
  scope: ActionScope;
  handler: (
    ctx: ActionContext<TEntities>,
  ) => Promise<ActionResult> | ActionResult;
}

/**
 * Custom actions config. Keys are action names, values define entity, scope, and handler.
 */
export type ActionsConfig<TEntities extends EntityMap> = Record<
  string,
  ActionDefinition<TEntities>
>;
