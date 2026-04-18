import type { ExpressionBuilder, ExpressionWrapper, SqlBool } from "kysely";
import type { FieldBindings } from "./bindings";
import type {
  Literal,
  ValidComparisonNode,
  ValidFieldType,
  ValidInNode,
  ValidLogicalNode,
  ValidNode,
  ValidNullCheckNode,
} from "./types";

export interface CompileOptions {
  /**
   * Map of schema field name to Kysely column reference (e.g. `"tickets.title"`
   * or `"users.displayName"`). Values here are trusted to be valid Kysely
   * refs — type safety is enforced at binding-creation time, usually via
   * {@link createNqlBindings}.
   */
  fields: FieldBindings;
}

/**
 * Compile a validated NQL node into a Kysely `SqlBool` expression suitable
 * for passing to `.where(eb => compileToExpression(node, eb, options))`.
 */
export function compileToExpression(
  node: ValidNode,
  eb: ExpressionBuilder<any, any>,
  options: CompileOptions,
): ExpressionWrapper<any, any, SqlBool> {
  const ctx: Ctx = {
    eb,
    resolveColumn: (field) => {
      const column = options.fields[field];
      if (column === undefined) {
        // Should be unreachable: the validator's allow-set is derived from
        // the same bindings, so it would have rejected the field.
        throw new Error(
          `NQL compile bug: no binding for schema field '${field}'`,
        );
      }
      return column;
    },
  };
  return visit(node, ctx);
}

interface Ctx {
  eb: ExpressionBuilder<any, any>;
  resolveColumn: (schemaField: string) => string;
}

function visit(
  node: ValidNode,
  ctx: Ctx,
): ExpressionWrapper<any, any, SqlBool> {
  switch (node.type) {
    case "logical":
      return visitLogical(node, ctx);
    case "comparison":
      return visitComparison(node, ctx);
    case "nullCheck":
      return visitNullCheck(node, ctx);
    case "in":
      return visitIn(node, ctx);
  }
}

function visitLogical(
  node: ValidLogicalNode,
  ctx: Ctx,
): ExpressionWrapper<any, any, SqlBool> {
  const children = node.children.map((c) => visit(c, ctx));
  if (node.op === "AND") return ctx.eb.and(children);
  if (node.op === "OR") return ctx.eb.or(children);
  // NOT always has exactly one child.
  return ctx.eb.not(children[0] as ExpressionWrapper<any, any, SqlBool>);
}

function visitComparison(
  node: ValidComparisonNode,
  ctx: Ctx,
): ExpressionWrapper<any, any, SqlBool> {
  const col = ctx.resolveColumn(node.field.name);
  const { op } = node;
  const baseType: ValidFieldType = node.field.baseType;
  const rawValue = literalValue(node.value);

  // String fields: all comparisons are case-insensitive via ILIKE, so that
  // `=`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH` share the same semantics.
  if (baseType === "string") {
    const str = rawValue as string;
    switch (op) {
      case "=":
        return ctx.eb(col, "ilike", escapeLike(str));
      case "!=":
        return ctx.eb(col, "not ilike", escapeLike(str));
      case "CONTAINS":
        return ctx.eb(col, "ilike", `%${escapeLike(str)}%`);
      case "STARTS_WITH":
        return ctx.eb(col, "ilike", `${escapeLike(str)}%`);
      case "ENDS_WITH":
        return ctx.eb(col, "ilike", `%${escapeLike(str)}`);
    }
  }

  // number/boolean: straight binary ops.
  switch (op) {
    case "=":
      return ctx.eb(col, "=", rawValue);
    case "!=":
      return ctx.eb(col, "!=", rawValue);
    case "<":
      return ctx.eb(col, "<", rawValue);
    case "<=":
      return ctx.eb(col, "<=", rawValue);
    case ">":
      return ctx.eb(col, ">", rawValue);
    case ">=":
      return ctx.eb(col, ">=", rawValue);
    default:
      // Validator guarantees we never reach this branch for non-string types.
      throw new Error(
        `NQL compile bug: operator '${op}' not expected on ${baseType}`,
      );
  }
}

function visitNullCheck(
  node: ValidNullCheckNode,
  ctx: Ctx,
): ExpressionWrapper<any, any, SqlBool> {
  const col = ctx.resolveColumn(node.field.name);
  return ctx.eb(col, node.negated ? "is not" : "is", null);
}

function visitIn(
  node: ValidInNode,
  ctx: Ctx,
): ExpressionWrapper<any, any, SqlBool> {
  const col = ctx.resolveColumn(node.field.name);
  const values = node.values.map(literalValue);
  return ctx.eb(col, node.negated ? "not in" : "in", values);
}

function literalValue(literal: Literal): string | number | boolean | null {
  switch (literal.kind) {
    case "string":
      return literal.value;
    case "number":
      return literal.value;
    case "boolean":
      return literal.value;
    case "null":
      return null;
  }
}

/**
 * Escape `%`, `_`, and `\` so that a literal user-supplied value does not
 * act as an ILIKE wildcard.
 */
function escapeLike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
