// Types

export { diffSchemas } from "./diff/diff-schemas";
// Functions
export {
  extractSchema,
  extractSchemaFromClient,
} from "./extract/extract-schema";
export { loadSchema } from "./io/load-schema";
export { saveSchema } from "./io/save-schema";
export type {
  GenerateMigrationOptions,
  MigrationResult,
  MigrationStatement,
} from "./migrate/generate-migration";
export { generateMigration } from "./migrate/generate-migration";
export type {
  ColumnModification,
  ObjectSetDiff,
  SchemaDiff,
  TableDiff,
} from "./types/diff";
export type {
  PgCollation,
  PgColumn,
  PgConstraint,
  PgDomain,
  PgEnum,
  PgExtension,
  PgFunction,
  PgIndex,
  PgMaterializedView,
  PgPrivilege,
  PgRlsPolicy,
  PgSchema,
  PgSequence,
  PgTable,
  PgTrigger,
  PgView,
} from "./types/schema";
