import { nu } from "./nu";
import type { ObjectSchema } from "./schema";

/**
 * The standard field name used for global text search.
 * This is the parameter name that frontends will use to send search queries,
 * and backends should handle for full-text search across multiple fields.
 */
export const SEARCH_FIELD_NAME = "q";

/**
 * Base search parameters schema.
 * Contains the standard "q" parameter for global text search.
 *
 * Use this with `.extend()` to add your resource-specific filter fields,
 * or use `withSearchParams()` to add search capability to an existing schema.
 *
 * @example
 * ```typescript
 * // Option 1: Extend base search params with resource fields
 * requestParams: baseSearchParams.extend({
 *   status: nu.string().optional(),
 *   assigneeId: nu.number().optional(),
 * }),
 *
 * // Option 2: Use withSearchParams helper
 * requestParams: withSearchParams(ticketSchema.omit("id").partial()),
 * ```
 */
export const baseSearchParams = nu.object({
  /** Global text search query - searches across multiple text fields */
  q: nu.string().optional(),
});

/**
 * Adds the standard search parameter "q" to an existing ObjectSchema.
 * This is the preferred way to add global text search capability to a resource filter schema.
 *
 * @example
 * ```typescript
 * export const getTicketsSchema = {
 *   method: "GET" as const,
 *   path: "/tickets",
 *   requestParams: withSearchParams(ticketSchema.omit("id").partial()),
 *   responseBody: nu.array(ticketSchema),
 * } satisfies RequestSchema;
 * ```
 *
 * @param schema The ObjectSchema to extend with search params
 * @returns A new ObjectSchema with the "q" field added
 */
export function withSearchParams<TSchema extends ObjectSchema<any>>(
  schema: TSchema,
) {
  return schema.extend({
    /** Global text search query - searches across multiple text fields */
    q: nu.string().optional(),
  });
}
