import type { ObjectSchema } from "@nubase/core";
import type { ExpressionBuilder, ExpressionWrapper, SqlBool } from "kysely";
import type { FieldBindings } from "./bindings";
import { compileToExpression } from "./compiler";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";
import type { NqlError, Result } from "./types";
import { validate } from "./validator";

/**
 * A compiled NQL expression, ready to be passed to Kysely's `.where(...)`.
 * Calling it with an `ExpressionBuilder` yields a boolean `ExpressionWrapper`
 * usable directly as a WHERE clause.
 */
export type CompiledNql = (
  eb: ExpressionBuilder<any, any>,
) => ExpressionWrapper<any, any, SqlBool>;

export interface CompileNqlOptions {
  /**
   * Bindings map declaring which schema fields are queryable via NQL, and
   * the Kysely column reference each one resolves to. Only fields whose
   * keys appear here are queryable; anything else in the schema is
   * rejected as an unknown field at validate time.
   *
   * Build this with {@link createNqlBindings} to get end-to-end type
   * safety (schema keys on the key side, Kysely DB columns on the value
   * side).
   */
  fields: FieldBindings;
}

/**
 * End-to-end pipeline: tokenize → parse → validate → compile.
 *
 * Returns a discriminated-union Result. On success the `value` is a function
 * that can be handed directly to `query.where(...)`. On failure the `error`
 * carries a `code` identifying the stage (`TOKENIZE`, `PARSE`, `VALIDATE`)
 * and a 1-based `line`/`column` for surfacing back to the user.
 */
export function compileNql(
  source: string,
  schema: ObjectSchema<any>,
  options: CompileNqlOptions,
): Result<CompiledNql, NqlError> {
  const toks = tokenize(source);
  if (!toks.ok) return { ok: false, error: toks.error };

  const parsed = parse(toks.value);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  // The bindings' keys are the full set of queryable fields — pass them as
  // the validator's allow-set so unknown-field errors appear at validate
  // time with the correct source span.
  const validated = validate(parsed.value, schema, {
    allowFields: Object.keys(options.fields),
  });
  if (!validated.ok) return { ok: false, error: validated.error };

  const node = validated.value;
  const applied: CompiledNql = (eb) =>
    compileToExpression(node, eb, { fields: options.fields });

  return { ok: true, value: applied };
}
