import type { DatabaseClient } from "./database-client.js";
import type { EntityMap } from "./entity.js";

// ---------------------------------------------------------------------------
// Validation context
// ---------------------------------------------------------------------------

export interface ValidationContext<TEntities extends EntityMap> {
  isCreate: boolean;
  isUpdate: boolean;
  user: { id: number; email: string; displayName: string };
  workspace: { id: number; slug: string };
  db: DatabaseClient<TEntities>;
}

// ---------------------------------------------------------------------------
// Validation return types
// ---------------------------------------------------------------------------

export interface FieldError {
  field: string;
  message: string;
}

export type FieldValidationResult = string | undefined;
export type EntityValidationResult = FieldError[] | undefined;

// ---------------------------------------------------------------------------
// Validation config per entity
// ---------------------------------------------------------------------------

export interface EntityValidationConfig<TEntities extends EntityMap, TRow> {
  /** Per-field validators. Each receives the field value and returns an error string or undefined. */
  fields?: {
    [K in keyof TRow]?: (
      value: TRow[K],
      ctx: ValidationContext<TEntities>,
    ) => FieldValidationResult | Promise<FieldValidationResult>;
  };

  /** Entity-level validator. Receives the full row and can return multiple field errors. */
  entity?: (
    data: TRow,
    ctx: ValidationContext<TEntities>,
  ) => EntityValidationResult | Promise<EntityValidationResult>;
}

/**
 * Validations config object. Keys are entity names, values define field and entity validators.
 */
export type ValidationsConfig<TEntities extends EntityMap> = {
  [E in Extract<keyof TEntities, string>]?: EntityValidationConfig<
    TEntities,
    TEntities[E]["row"]
  >;
};
