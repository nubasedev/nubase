/**
 * Process one `.sql` file end-to-end:
 *
 *   source → preprocessor → getTypes(wire) → QueryModel → rendered .ts string
 *
 * This function does NOT open or close the wire connection — the caller
 * (`generate-all.ts`) reuses one long-lived `AsyncQueue` across every
 * query in a generation run.
 *
 * Returns either:
 *   - a `GeneratedQuery` with the final .ts file content, or
 *   - a `GeneratedQueryError` describing what went wrong (parse failure,
 *     malformed @json annotation, etc.)
 */

import type {
  QueryModel,
  QueryParamModel,
  QueryRowFieldModel,
} from "../codegen/render-typescript.js";
import { renderTypescript } from "../codegen/render-typescript.js";
import { mapMappableTypeToTs, wrapNullable } from "../codegen/type-mapping.js";
import type { DiscoveredQuery } from "../discover/find-sql-files.js";
import { hashSource } from "../discover/hash.js";
import { formatParseError } from "../errors/parse-error.js";
import type { JsonAnnotation } from "../preprocess/json-annotations.js";
import { parseJsonAnnotations } from "../preprocess/json-annotations.js";
import type { NamedParamRewrite } from "../preprocess/named-params.js";
import { preprocessNamedParams } from "../preprocess/named-params.js";
import type {
  InterpolatedQuery,
  IParseError,
  IQueryTypes,
} from "../query/actions.js";
import { getTypes } from "../query/actions.js";
import type { MappableType } from "../query/type.js";
import type { AsyncQueue } from "../wire/queue.js";

export interface GeneratedQuery {
  kind: "ok";
  query: DiscoveredQuery;
  /** The full `.ts` file content, ready to write to disk. */
  content: string;
  /** Content hash of the source SQL (embedded in the content header). */
  sourceHash: string;
}

export interface GeneratedQueryError {
  kind: "error";
  query: DiscoveredQuery;
  /** Ready-to-print diagnostic string. */
  diagnostic: string;
  /** Machine-readable error code for programmatic use. */
  code: "PG_PARSE_ERROR" | "JSON_ANNOTATION_ERROR";
}

export type GenerateQueryResult = GeneratedQuery | GeneratedQueryError;

export async function generateQuery(
  query: DiscoveredQuery,
  queue: AsyncQueue,
): Promise<GenerateQueryResult> {
  // 1. Parse JSON annotations from the header.
  const jsonResult = parseJsonAnnotations(query.source);
  if (jsonResult.errors.length > 0) {
    const first = jsonResult.errors[0]!;
    const diagnostic = [
      `✖ ${query.relPath}`,
      `  ${first.code}: ${first.message}`,
      "",
      `  at line ${first.line}, column ${first.column}`,
    ].join("\n");
    return {
      kind: "error",
      query,
      diagnostic,
      code: "JSON_ANNOTATION_ERROR",
    };
  }

  // 2. Preprocess named params.
  const preprocessed = preprocessNamedParams(query.source);

  // 3. Ask Postgres for the types.
  const interp: InterpolatedQuery = {
    query: preprocessed.sql,
    mapping: [],
  };
  const typesResult = await getTypes(interp, queue);

  if ("errorCode" in typesResult) {
    return {
      kind: "error",
      query,
      diagnostic: formatParseError({
        filePath: query.relPath,
        source: query.source,
        rewrites: preprocessed.rewrites,
        error: typesResult,
      }),
      code: "PG_PARSE_ERROR",
    };
  }

  // 4. Build the QueryModel.
  const jsonByName = new Map(
    jsonResult.annotations.map((a: JsonAnnotation) => [a.name, a.tsType]),
  );

  const paramModels: QueryParamModel[] = preprocessed.params.map(
    (paramName, idx) => {
      const override = jsonByName.get(paramName);
      if (override !== undefined) {
        return { name: paramName, tsType: override };
      }
      const pgType: MappableType | undefined =
        typesResult.paramMetadata.params[idx];
      const tsType =
        pgType !== undefined ? mapMappableTypeToTs(pgType) : "unknown";
      return { name: paramName, tsType };
    },
  );

  const rowFields: QueryRowFieldModel[] | null =
    typesResult.returnTypes.length === 0
      ? null
      : typesResult.returnTypes.map((field): QueryRowFieldModel => {
          const override = jsonByName.get(field.returnName);
          const baseTsType =
            override !== undefined ? override : mapMappableTypeToTs(field.type);
          return {
            name: field.returnName,
            tsType:
              override !== undefined
                ? baseTsType // annotation author owns nullability
                : wrapNullable(baseTsType, field.nullable ?? false),
            nullable:
              override !== undefined ? false : (field.nullable ?? false),
          };
        });

  const sourceHash = hashSource(query.source);
  const model: QueryModel = {
    name: query.name,
    sourceBasename: `${query.name}.sql`,
    sourceHash,
    sql: preprocessed.sql,
    params: paramModels,
    rowFields,
  };

  const content = renderTypescript(model);
  return { kind: "ok", query, content, sourceHash };
}

// Avoid an unused-import error if the consumer of this module doesn't
// reference these types directly.
export type { IParseError, IQueryTypes, NamedParamRewrite };
