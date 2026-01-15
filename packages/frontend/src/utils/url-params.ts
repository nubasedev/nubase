/**
 * Utility functions for handling URL path and query parameters.
 *
 * These functions help with:
 * - Extracting path parameter keys from URL patterns (e.g., "/tickets/:id" → ["id"])
 * - Building URLs by replacing path parameters with values
 * - Separating path params from query params
 */

/**
 * Extracts path parameter keys from a URL path pattern.
 *
 * @example
 * extractPathParamKeys("/tickets/:id") // → ["id"]
 * extractPathParamKeys("/users/:userId/posts/:postId") // → ["userId", "postId"]
 * extractPathParamKeys("/static/path") // → []
 */
export function extractPathParamKeys(path: string): string[] {
  const matches = path.match(/:(\w+)/g);
  return matches ? matches.map((p) => p.slice(1)) : [];
}

/**
 * Builds a URL by replacing path parameter placeholders with actual values.
 * Values are URL-encoded for safety.
 *
 * @example
 * buildUrlWithPathParams("/tickets/:id", { id: "123" }) // → "/tickets/123"
 * buildUrlWithPathParams("/users/:id", { id: "hello world" }) // → "/users/hello%20world"
 * buildUrlWithPathParams("/tickets/:id", {}) // → "/tickets/:id" (unchanged if missing)
 */
export function buildUrlWithPathParams(
  path: string,
  params: Record<string, string | number | boolean>,
): string {
  return path.replace(/:(\w+)/g, (match, key) => {
    const value = params[key];
    return value !== undefined && value !== ""
      ? encodeURIComponent(String(value))
      : match;
  });
}

/**
 * Result of separating URL parameters into path and query params.
 */
export type SeparatedParams = {
  /** The URL path with path parameters replaced */
  path: string;
  /** Parameters that were not path parameters (to be used as query string) */
  queryParams: Record<string, unknown>;
};

/**
 * Separates parameters into path params (replaced in URL) and query params.
 * Path parameters are identified by `:key` patterns in the URL path.
 *
 * @example
 * separateUrlParams("/tickets/:id", { id: 123, status: "open" })
 * // → { path: "/tickets/123", queryParams: { status: "open" } }
 *
 * separateUrlParams("/users/:userId/posts", { userId: 1, page: 2, limit: 10 })
 * // → { path: "/users/1/posts", queryParams: { page: 2, limit: 10 } }
 */
export function separateUrlParams(
  pathPattern: string,
  params: Record<string, unknown> | undefined | null,
): SeparatedParams {
  let path = pathPattern;
  const queryParams: Record<string, unknown> = {};

  if (params && typeof params === "object") {
    for (const [key, value] of Object.entries(params)) {
      if (path.includes(`:${key}`)) {
        // This is a path parameter - replace in URL
        path = path.replace(`:${key}`, encodeURIComponent(String(value)));
      } else {
        // This is a query parameter - add to query string
        queryParams[key] = value;
      }
    }
  }

  return { path, queryParams };
}
