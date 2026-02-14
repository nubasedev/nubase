export interface PgSchema {
  pgVersion: string;
  databaseName: string;
  extractedAt: string;
  tables: Record<string, PgTable>;
  enums: Record<string, PgEnum>;
  sequences: Record<string, PgSequence>;
  views: Record<string, PgView>;
  materializedViews: Record<string, PgMaterializedView>;
  functions: Record<string, PgFunction>;
  triggers: Record<string, PgTrigger>;
  extensions: Record<string, PgExtension>;
  domains: Record<string, PgDomain>;
  collations: Record<string, PgCollation>;
  policies: Record<string, PgRlsPolicy>;
  privileges: Record<string, PgPrivilege>;
}

export interface PgTable {
  schema: string;
  name: string;
  columns: Record<string, PgColumn>;
  constraints: Record<string, PgConstraint>;
  indexes: Record<string, PgIndex>;
  rlsEnabled: boolean;
  rlsForced: boolean;
  comment: string | null;
}

export interface PgColumn {
  name: string;
  dataType: string;
  udtName: string;
  isNullable: boolean;
  defaultValue: string | null;
  isIdentity: boolean;
  identityGeneration: string | null;
  characterMaxLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  ordinalPosition: number;
  comment: string | null;
}

export interface PgConstraint {
  schema: string;
  name: string;
  tableName: string;
  type: "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE" | "CHECK" | "EXCLUSION";
  columns: string[];
  referencedTable: string | null;
  referencedColumns: string[] | null;
  onUpdate: string | null;
  onDelete: string | null;
  checkExpression: string | null;
  isDeferrable: boolean;
  isDeferred: boolean;
}

export interface PgIndex {
  schema: string;
  name: string;
  tableName: string;
  columns: string[];
  isUnique: boolean;
  method: string;
  whereClause: string | null;
  definition: string;
  isPrimaryKey: boolean;
}

export interface PgEnum {
  schema: string;
  name: string;
  values: string[];
  comment: string | null;
}

export interface PgSequence {
  schema: string;
  name: string;
  dataType: string;
  startValue: string;
  increment: string;
  minValue: string;
  maxValue: string;
  cacheSize: string;
  isCyclic: boolean;
  ownedBy: string | null;
}

export interface PgView {
  schema: string;
  name: string;
  definition: string;
  columns: string[];
  comment: string | null;
}

export interface PgMaterializedView {
  schema: string;
  name: string;
  definition: string;
  columns: string[];
  indexes: Record<string, PgIndex>;
  comment: string | null;
}

export interface PgFunction {
  schema: string;
  name: string;
  arguments: string;
  returnType: string;
  language: string;
  definition: string;
  volatility: string;
  securityDefiner: boolean;
  isProcedure: boolean;
  comment: string | null;
}

export interface PgTrigger {
  schema: string;
  name: string;
  tableName: string;
  definition: string;
  timing: string;
  events: string[];
  functionName: string;
  level: string;
  comment: string | null;
}

export interface PgExtension {
  name: string;
  schema: string;
  version: string;
  comment: string | null;
}

export interface PgDomain {
  schema: string;
  name: string;
  dataType: string;
  defaultValue: string | null;
  isNullable: boolean;
  checkConstraints: DomainCheckConstraint[];
  comment: string | null;
}

export interface DomainCheckConstraint {
  name: string;
  expression: string;
}

export interface PgCollation {
  schema: string;
  name: string;
  lcCollate: string;
  lcCtype: string;
  provider: string;
  comment: string | null;
}

export interface PgRlsPolicy {
  schema: string;
  name: string;
  tableName: string;
  permissive: boolean;
  roles: string[];
  command: string;
  usingExpression: string | null;
  withCheckExpression: string | null;
}

export interface PgPrivilege {
  objectType: string;
  objectName: string;
  grantee: string;
  privileges: string[];
  withGrantOption: boolean;
}
