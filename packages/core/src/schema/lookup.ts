import { nu } from "./nu";
import type { RequestSchema } from "./request-schema";
import type { Infer, NumberSchema, StringSchema } from "./schema";

/**
 * Schema type that can be used for lookup IDs.
 * Supports both string IDs (UUIDs) and numeric IDs (auto-increment).
 */
export type LookupIdSchema = StringSchema | NumberSchema;

/**
 * Creates a lookup schema with the specified ID type.
 * This is the standardized format that all lookup endpoints must return.
 *
 * @param idSchema The schema for the ID field (nu.string() or nu.number())
 */
export function createLookupSchema<TIdSchema extends LookupIdSchema>(
  idSchema: TIdSchema,
) {
  return nu.object({
    /** Unique identifier for the entity */
    id: idSchema,
    /** Primary display text (e.g., user's display name) */
    title: nu.string(),
    /** Optional secondary text (e.g., email address) */
    subtitle: nu.string().optional(),
    /** Optional image URL or data URL for avatar display */
    image: nu.string().optional(),
  });
}

/**
 * The default Lookup schema with string IDs.
 * For numeric IDs, use createLookupSchema(nu.number()) instead.
 */
export const lookupSchema = createLookupSchema(nu.string());

/**
 * The Lookup type with string IDs - the display representation of an entity in lookup/select components.
 * For numeric IDs, use Infer<ReturnType<typeof createLookupSchema<NumberSchema>>>.
 */
export type Lookup = Infer<typeof lookupSchema>;

/**
 * Creates a lookup endpoint schema for a resource.
 * Lookup endpoints accept a query string and return an array of Lookup objects.
 *
 * @example
 * ```typescript
 * // For string IDs (UUIDs):
 * export const lookupUsersSchema = createLookupEndpoint("users", nu.string());
 *
 * // For numeric IDs (auto-increment):
 * export const lookupUsersSchema = createLookupEndpoint("users", nu.number());
 *
 * // Creates: GET /lookup/users?q=<query> → Lookup[]
 * ```
 *
 * @param resourceName The name of the resource (used in the path: /lookup/{resourceName})
 * @param idSchema The schema for the ID field - use nu.string() for UUIDs or nu.number() for auto-increment IDs
 * @returns A RequestSchema for the lookup endpoint
 */
export function createLookupEndpoint<TIdSchema extends LookupIdSchema>(
  resourceName: string,
  idSchema: TIdSchema,
): RequestSchema {
  return {
    method: "GET" as const,
    path: `/lookup/${resourceName}`,
    requestParams: nu.object({
      /** The search query string */
      q: nu.string(),
    }),
    responseBody: nu.array(createLookupSchema(idSchema)),
  };
}
