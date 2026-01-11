import { nu } from "./nu";
import type { RequestSchema } from "./request-schema";
import type { Infer } from "./schema";

/**
 * The Lookup schema defines the display representation of an entity in lookup/select components.
 * This is the standardized format that all lookup endpoints must return.
 */
export const lookupSchema = nu.object({
  /** Unique identifier for the entity */
  id: nu.string(),
  /** Primary display text (e.g., user's display name) */
  title: nu.string(),
  /** Optional secondary text (e.g., email address) */
  subtitle: nu.string().optional(),
  /** Optional image URL or data URL for avatar display */
  image: nu.string().optional(),
});

/**
 * The Lookup type - the display representation of an entity in lookup/select components.
 */
export type Lookup = Infer<typeof lookupSchema>;

/**
 * Creates a lookup endpoint schema for a resource.
 * Lookup endpoints accept a query string and return an array of Lookup objects.
 *
 * @example
 * ```typescript
 * // In your endpoints file
 * export const lookupUsersSchema = createLookupEndpoint("users");
 * // Creates: GET /lookup/users?q=<query> → Lookup[]
 * ```
 *
 * @param resourceName The name of the resource (used in the path: /lookup/{resourceName})
 * @returns A RequestSchema for the lookup endpoint
 */
export function createLookupEndpoint(resourceName: string): RequestSchema {
  return {
    method: "GET" as const,
    path: `/lookup/${resourceName}`,
    requestParams: nu.object({
      /** The search query string */
      q: nu.string(),
    }),
    responseBody: nu.array(lookupSchema),
  };
}
