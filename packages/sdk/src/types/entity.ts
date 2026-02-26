/**
 * Base constraint for entity maps passed to defineApp<TEntities>.
 * Each key is an entity name (e.g. "ticket"), and the value describes its row shape.
 */
export type EntityMap = Record<string, EntityDefinition>;

export interface EntityDefinition {
  row: Record<string, unknown>;
  insert: Record<string, unknown>;
  update: Record<string, unknown>;
}
