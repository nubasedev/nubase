import type {
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
  PgSequence,
  PgTrigger,
  PgView,
} from "../types/schema";

export function columnsEqual(a: PgColumn, b: PgColumn): boolean {
  return (
    a.name === b.name &&
    a.dataType === b.dataType &&
    a.udtName === b.udtName &&
    a.isNullable === b.isNullable &&
    a.defaultValue === b.defaultValue &&
    a.isIdentity === b.isIdentity &&
    a.identityGeneration === b.identityGeneration &&
    a.characterMaxLength === b.characterMaxLength &&
    a.numericPrecision === b.numericPrecision &&
    a.numericScale === b.numericScale &&
    a.ordinalPosition === b.ordinalPosition &&
    a.comment === b.comment
  );
}

export function constraintsEqual(a: PgConstraint, b: PgConstraint): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.tableName === b.tableName &&
    a.type === b.type &&
    JSON.stringify(a.columns) === JSON.stringify(b.columns) &&
    a.referencedTable === b.referencedTable &&
    JSON.stringify(a.referencedColumns) ===
      JSON.stringify(b.referencedColumns) &&
    a.onUpdate === b.onUpdate &&
    a.onDelete === b.onDelete &&
    a.checkExpression === b.checkExpression &&
    a.isDeferrable === b.isDeferrable &&
    a.isDeferred === b.isDeferred
  );
}

export function indexesEqual(a: PgIndex, b: PgIndex): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.tableName === b.tableName &&
    JSON.stringify(a.columns) === JSON.stringify(b.columns) &&
    a.isUnique === b.isUnique &&
    a.method === b.method &&
    a.whereClause === b.whereClause &&
    a.definition === b.definition &&
    a.isPrimaryKey === b.isPrimaryKey
  );
}

export function enumsEqual(a: PgEnum, b: PgEnum): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    JSON.stringify(a.values) === JSON.stringify(b.values) &&
    a.comment === b.comment
  );
}

export function sequencesEqual(a: PgSequence, b: PgSequence): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.dataType === b.dataType &&
    a.startValue === b.startValue &&
    a.increment === b.increment &&
    a.minValue === b.minValue &&
    a.maxValue === b.maxValue &&
    a.cacheSize === b.cacheSize &&
    a.isCyclic === b.isCyclic &&
    a.ownedBy === b.ownedBy
  );
}

export function viewsEqual(a: PgView, b: PgView): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.definition === b.definition &&
    JSON.stringify(a.columns) === JSON.stringify(b.columns) &&
    a.comment === b.comment
  );
}

export function materializedViewsEqual(
  a: PgMaterializedView,
  b: PgMaterializedView,
): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.definition === b.definition &&
    JSON.stringify(a.columns) === JSON.stringify(b.columns) &&
    JSON.stringify(a.indexes) === JSON.stringify(b.indexes) &&
    a.comment === b.comment
  );
}

export function functionsEqual(a: PgFunction, b: PgFunction): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.arguments === b.arguments &&
    a.returnType === b.returnType &&
    a.language === b.language &&
    a.definition === b.definition &&
    a.volatility === b.volatility &&
    a.securityDefiner === b.securityDefiner &&
    a.isProcedure === b.isProcedure &&
    a.comment === b.comment
  );
}

export function triggersEqual(a: PgTrigger, b: PgTrigger): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.tableName === b.tableName &&
    a.definition === b.definition &&
    a.timing === b.timing &&
    JSON.stringify(a.events) === JSON.stringify(b.events) &&
    a.functionName === b.functionName &&
    a.level === b.level &&
    a.comment === b.comment
  );
}

export function extensionsEqual(a: PgExtension, b: PgExtension): boolean {
  return (
    a.name === b.name &&
    a.schema === b.schema &&
    a.version === b.version &&
    a.comment === b.comment
  );
}

export function domainsEqual(a: PgDomain, b: PgDomain): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.dataType === b.dataType &&
    a.defaultValue === b.defaultValue &&
    a.isNullable === b.isNullable &&
    JSON.stringify(a.checkConstraints) === JSON.stringify(b.checkConstraints) &&
    a.comment === b.comment
  );
}

export function collationsEqual(a: PgCollation, b: PgCollation): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.lcCollate === b.lcCollate &&
    a.lcCtype === b.lcCtype &&
    a.provider === b.provider &&
    a.comment === b.comment
  );
}

export function policiesEqual(a: PgRlsPolicy, b: PgRlsPolicy): boolean {
  return (
    a.schema === b.schema &&
    a.name === b.name &&
    a.tableName === b.tableName &&
    a.permissive === b.permissive &&
    JSON.stringify(a.roles) === JSON.stringify(b.roles) &&
    a.command === b.command &&
    a.usingExpression === b.usingExpression &&
    a.withCheckExpression === b.withCheckExpression
  );
}

export function privilegesEqual(a: PgPrivilege, b: PgPrivilege): boolean {
  return (
    a.objectType === b.objectType &&
    a.objectName === b.objectName &&
    a.grantee === b.grantee &&
    JSON.stringify(a.privileges) === JSON.stringify(b.privileges) &&
    a.withGrantOption === b.withGrantOption
  );
}
