import type { DatabaseClient } from "./database-client.js";
import type { EntityMap } from "./entity.js";

// ---------------------------------------------------------------------------
// Computed field types
// ---------------------------------------------------------------------------

export interface ComputedFieldContext<TEntities extends EntityMap, TRow> {
  row: TRow;
  user: { id: number; email: string; displayName: string };
  workspace: { id: number; slug: string };
  db: DatabaseClient<TEntities>;
}

export interface ComputedFieldDefinition<TEntities extends EntityMap, TRow> {
  /** The function that computes the field value from the row. */
  compute: (
    ctx: ComputedFieldContext<TEntities, TRow>,
  ) => Promise<unknown> | unknown;
}

/**
 * Computed fields config. Keys are entity names, values map field names to compute functions.
 */
export type ComputedFieldsConfig<TEntities extends EntityMap> = {
  [E in Extract<keyof TEntities, string>]?: Record<
    string,
    ComputedFieldDefinition<TEntities, TEntities[E]["row"]>
  >;
};
