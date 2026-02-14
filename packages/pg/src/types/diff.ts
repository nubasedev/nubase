import type { PgColumn, PgConstraint, PgIndex } from "./schema";

export interface ObjectSetDiff<T> {
  added: Record<string, T>;
  removed: Record<string, T>;
  modified: Record<string, { from: T; to: T }>;
}

export interface ColumnModification {
  from: PgColumn;
  to: PgColumn;
  changedProperties: Array<keyof PgColumn>;
}

export interface TableDiff {
  from: import("./schema").PgTable;
  to: import("./schema").PgTable;
  columns: {
    added: Record<string, PgColumn>;
    removed: Record<string, PgColumn>;
    modified: Record<string, ColumnModification>;
  };
  constraints: ObjectSetDiff<PgConstraint>;
  indexes: ObjectSetDiff<PgIndex>;
  rlsChanged: boolean;
}

export interface SchemaDiff {
  hasDifferences: boolean;
  tables: {
    added: Record<string, import("./schema").PgTable>;
    removed: Record<string, import("./schema").PgTable>;
    modified: Record<string, TableDiff>;
  };
  enums: ObjectSetDiff<import("./schema").PgEnum>;
  sequences: ObjectSetDiff<import("./schema").PgSequence>;
  views: ObjectSetDiff<import("./schema").PgView>;
  materializedViews: ObjectSetDiff<import("./schema").PgMaterializedView>;
  functions: ObjectSetDiff<import("./schema").PgFunction>;
  triggers: ObjectSetDiff<import("./schema").PgTrigger>;
  extensions: ObjectSetDiff<import("./schema").PgExtension>;
  domains: ObjectSetDiff<import("./schema").PgDomain>;
  collations: ObjectSetDiff<import("./schema").PgCollation>;
  policies: ObjectSetDiff<import("./schema").PgRlsPolicy>;
  privileges: ObjectSetDiff<import("./schema").PgPrivilege>;
}
