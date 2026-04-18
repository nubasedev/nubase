import {
  type BaseSchema,
  type ObjectSchema,
  OptionalSchema,
} from "@nubase/core";
import type {
  ComparisonNode,
  ComparisonOp,
  IdentifierRef,
  InNode,
  Literal,
  LogicalNode,
  NqlError,
  NullCheckNode,
  ParsedNode,
  Result,
  SourceSpan,
  ValidFieldRef,
  ValidFieldType,
  ValidInNode,
  ValidLogicalNode,
  ValidNode,
  ValidNullCheckNode,
} from "./types";

const ALLOWED_OPS_BY_TYPE: Record<ValidFieldType, ReadonlySet<ComparisonOp>> = {
  string: new Set<ComparisonOp>([
    "=",
    "!=",
    "CONTAINS",
    "STARTS_WITH",
    "ENDS_WITH",
  ]),
  number: new Set<ComparisonOp>(["=", "!=", "<", "<=", ">", ">="]),
  boolean: new Set<ComparisonOp>(["=", "!="]),
};

export interface ValidateOptions {
  /**
   * Whitelist of schema field names that are queryable. Lookup is
   * case-insensitive. When omitted, every field in the schema is queryable.
   */
  allowFields?: readonly string[];
}

interface ResolvedField {
  canonical: string;
  /** null when the underlying schema type is not queryable in NQL. */
  baseType: ValidFieldType | null;
  optional: boolean;
  /** Original schema type string — used for error messages. */
  baseTypeRaw: string;
}

export function validate(
  node: ParsedNode,
  schema: ObjectSchema<any>,
  options: ValidateOptions = {},
): Result<ValidNode, NqlError> {
  const fields = buildFieldMap(schema, options.allowFields);
  try {
    return { ok: true, value: visit(node, fields) };
  } catch (e) {
    if (e instanceof ValidateError) {
      return {
        ok: false,
        error: {
          code: "VALIDATE",
          message: e.message,
          line: e.span.line,
          column: e.span.column,
          length: e.span.length,
        },
      };
    }
    throw e;
  }
}

class ValidateError extends Error {
  constructor(
    message: string,
    readonly span: SourceSpan,
  ) {
    super(message);
    this.name = "ValidateError";
  }
}

function buildFieldMap(
  schema: ObjectSchema<any>,
  allowFields: readonly string[] | undefined,
): Map<string, ResolvedField> {
  const map = new Map<string, ResolvedField>();
  const allowSet = allowFields
    ? new Set(allowFields.map((f) => f.toLowerCase()))
    : undefined;

  for (const key of Object.keys(schema._shape)) {
    if (allowSet && !allowSet.has(key.toLowerCase())) continue;
    const fieldSchema = schema._shape[key] as BaseSchema<unknown>;
    const optional = fieldSchema instanceof OptionalSchema;
    const baseTypeRaw = optional ? fieldSchema.baseType : fieldSchema.type;
    map.set(key.toLowerCase(), {
      canonical: key,
      baseType: coerceBaseType(baseTypeRaw),
      optional,
      baseTypeRaw,
    });
  }

  return map;
}

function coerceBaseType(raw: string): ValidFieldType | null {
  if (raw === "string" || raw === "number" || raw === "boolean") {
    return raw;
  }
  return null;
}

function visit(
  node: ParsedNode,
  fields: Map<string, ResolvedField>,
): ValidNode {
  switch (node.type) {
    case "logical":
      return visitLogical(node, fields);
    case "comparison":
      return visitComparison(node, fields);
    case "nullCheck":
      return visitNullCheck(node, fields);
    case "in":
      return visitIn(node, fields);
  }
}

function visitLogical(
  node: LogicalNode,
  fields: Map<string, ResolvedField>,
): ValidLogicalNode {
  return {
    type: "logical",
    op: node.op,
    children: node.children.map((c) => visit(c, fields)),
    span: node.span,
  };
}

function visitComparison(
  node: ComparisonNode,
  fields: Map<string, ResolvedField>,
) {
  const field = resolveField(node.field, fields);
  ensureSupportedBaseType(field, node.field.span);
  ensureOperatorAllowed(field.baseType, node.op, node.field.span);
  ensureLiteralMatchesField(
    node.value,
    field.baseType,
    field.canonical,
    /*allowNull*/ false,
  );
  return {
    type: "comparison" as const,
    field: makeFieldRef(field, node.field.span),
    op: node.op,
    value: node.value,
    span: node.span,
  };
}

function visitNullCheck(
  node: NullCheckNode,
  fields: Map<string, ResolvedField>,
): ValidNullCheckNode {
  const field = resolveField(node.field, fields);
  ensureSupportedBaseType(field, node.field.span);
  if (!field.optional) {
    throw new ValidateError(
      `Field '${field.canonical}' is required and cannot be null`,
      node.span,
    );
  }
  return {
    type: "nullCheck",
    field: makeFieldRef(field, node.field.span),
    negated: node.negated,
    span: node.span,
  };
}

function visitIn(
  node: InNode,
  fields: Map<string, ResolvedField>,
): ValidInNode {
  const field = resolveField(node.field, fields);
  ensureSupportedBaseType(field, node.field.span);
  for (const value of node.values) {
    ensureLiteralMatchesField(
      value,
      field.baseType,
      field.canonical,
      /*allowNull*/ false,
    );
  }
  return {
    type: "in",
    field: makeFieldRef(field, node.field.span),
    negated: node.negated,
    values: node.values,
    span: node.span,
  };
}

function resolveField(
  ref: IdentifierRef,
  fields: Map<string, ResolvedField>,
): ResolvedField {
  const resolved = fields.get(ref.raw.toLowerCase());
  if (!resolved) {
    throw new ValidateError(`Unknown field '${ref.raw}'`, ref.span);
  }
  return resolved;
}

function ensureSupportedBaseType(
  field: ResolvedField,
  span: SourceSpan,
): asserts field is ResolvedField & { baseType: ValidFieldType } {
  if (field.baseType === null) {
    throw new ValidateError(
      `Field '${field.canonical}' of type '${field.baseTypeRaw}' is not queryable`,
      span,
    );
  }
}

function ensureOperatorAllowed(
  baseType: ValidFieldType,
  op: ComparisonOp,
  span: SourceSpan,
): void {
  const allowed = ALLOWED_OPS_BY_TYPE[baseType];
  if (!allowed.has(op)) {
    throw new ValidateError(
      `Operator '${op}' is not supported on ${baseType} fields`,
      span,
    );
  }
}

function ensureLiteralMatchesField(
  literal: Literal,
  baseType: ValidFieldType,
  fieldName: string,
  allowNull: boolean,
): void {
  if (literal.kind === "null") {
    if (!allowNull) {
      throw new ValidateError(
        `Use 'IS NULL' to check for null values on '${fieldName}'`,
        literal.span,
      );
    }
    return;
  }
  if (literal.kind !== baseType) {
    throw new ValidateError(
      `Field '${fieldName}' expects a ${baseType} value, got ${literal.kind}`,
      literal.span,
    );
  }
}

function makeFieldRef(
  field: ResolvedField & { baseType: ValidFieldType },
  span: SourceSpan,
): ValidFieldRef {
  return {
    name: field.canonical,
    baseType: field.baseType,
    optional: field.optional,
    span,
  };
}
