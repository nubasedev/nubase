import type {
  InferRequestBody,
  InferRequestParams,
  InferResponseBody,
  RequestSchema,
} from "@nubase/core";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AUTH_USER_KEY } from "./auth/middleware";
import type { AuthLevel, BackendUser } from "./auth/types";

/**
 * Custom HTTP error class that allows handlers to throw errors with specific status codes.
 * Use this to return proper HTTP error responses instead of generic 500 errors.
 *
 * @example
 * throw new HttpError(401, "Invalid username or password");
 * throw new HttpError(404, "Resource not found");
 * throw new HttpError(403, "Access denied");
 */
export class HttpError extends Error {
  constructor(
    public statusCode: ContentfulStatusCode,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * URL Parameter Coercion System (Backend)
 *
 * **The Problem:**
 * URL path parameters always arrive as strings from HTTP requests,
 * but schemas expect typed values (numbers, booleans).
 *
 * **The Solution:**
 * We use the schema's `toZodWithCoercion()` method which leverages Zod's
 * built-in coercion to automatically convert string values to expected types.
 *
 * **Example:**
 * - URL: `/tickets/37` → params: { id: "37" }
 * - Schema expects: { id: number }
 * - toZodWithCoercion() converts: { id: 37 }
 */

/**
 * Context provided to typed handlers.
 *
 * @template T - The request schema type
 * @template TUser - The user type (when auth is required/optional)
 */
export type TypedHandlerContext<
  T extends RequestSchema,
  TUser extends BackendUser | null = null,
> = {
  params: InferRequestParams<T>;
  body: InferRequestBody<T>;
  ctx: Context;
  /**
   * The authenticated user.
   * - When auth is 'required': TUser (guaranteed to exist)
   * - When auth is 'optional': TUser | null
   * - When auth is 'none': not present (null)
   */
  user: TUser;
};

/**
 * Handler function type for typed HTTP handlers.
 */
export type TypedHandler<
  T extends RequestSchema,
  TUser extends BackendUser | null = null,
> = (context: TypedHandlerContext<T, TUser>) => Promise<InferResponseBody<T>>;

// Overloaded function signatures for better ergonomics
export function createTypedHandler<T extends RequestSchema>(
  schema: T,
  handler: TypedHandler<T>,
): ReturnType<typeof createTypedHandlerInternal>;

export function createTypedHandler<T extends RequestSchema>(
  endpointRef: T, // Can be apiEndpoints.ticketsGetTickets
  handler: TypedHandler<T>,
): ReturnType<typeof createTypedHandlerInternal>;

export function createTypedHandler<T extends RequestSchema>(
  schemaOrEndpoint: T,
  handler: TypedHandler<T>,
) {
  return createTypedHandlerInternal(schemaOrEndpoint, handler);
}

// Internal implementation
function createTypedHandlerInternal<
  T extends RequestSchema,
  TUser extends BackendUser | null = null,
>(schema: T, handler: TypedHandler<T, TUser>, options?: { auth?: AuthLevel }) {
  const authLevel = options?.auth ?? "none";

  return async (c: Context) => {
    try {
      // Check authentication if required
      const user = c.get(AUTH_USER_KEY) as TUser | null;

      if (authLevel === "required" && !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Parse and validate request parameters using schema's built-in coercion
      let params: InferRequestParams<T>;
      try {
        const rawParams = c.req.param();

        // Use toZodWithCoercion() to automatically convert string params to expected types
        params = schema.requestParams
          .toZodWithCoercion()
          .parse(rawParams) as InferRequestParams<T>;
      } catch (error) {
        return c.json(
          {
            error: "Invalid request parameters",
            details: error instanceof Error ? error.message : String(error),
          },
          400,
        );
      }

      // Parse and validate request body
      let body: InferRequestBody<T>;
      try {
        if (schema.requestBody) {
          // Only parse body if schema defines one
          const rawBody = schema.method === "GET" ? {} : await c.req.json();
          body = schema.requestBody
            .toZod()
            .parse(rawBody) as InferRequestBody<T>;
        } else {
          // No request body expected
          body = undefined as InferRequestBody<T>;
        }
      } catch (error) {
        return c.json(
          {
            error: "Invalid request body",
            details: error instanceof Error ? error.message : String(error),
          },
          400,
        );
      }

      // Call the handler with typed context
      // For 'required' auth, user is guaranteed to be non-null
      // For 'optional' auth, user may be null
      // For 'none' auth, user is null
      const result = await handler({
        params,
        body,
        ctx: c,
        user: (authLevel === "required" ? user : (user ?? null)) as TUser,
      });

      // Validate response body (optional, for development safety)
      // Use passthrough() to preserve unknown properties in the response
      // This is important for dynamic data like chart series values (e.g., { category: "Jan", desktop: 186, mobile: 80 })
      try {
        const responseZod = schema.responseBody.toZod();
        // Apply passthrough if it's an object schema to preserve dynamic fields
        const passthroughZod =
          "passthrough" in responseZod
            ? responseZod.passthrough()
            : responseZod;
        const validatedResult = passthroughZod.parse(result);

        // Return appropriate status code based on method
        const statusCode = schema.method === "POST" ? 201 : 200;
        return c.json(validatedResult, statusCode);
      } catch (error) {
        console.error("Response validation failed:", error);
        // In production, you might want to return the result anyway
        // For development, this helps catch schema mismatches
        return c.json(
          {
            error: "Internal server error",
            details: "Response validation failed",
          },
          500,
        );
      }
    } catch (error) {
      // Check if it's an HttpError with a specific status code
      if (error instanceof HttpError) {
        return c.json(
          {
            error: error.message,
          },
          error.statusCode,
        );
      }

      console.error("Handler error:", error);
      return c.json(
        {
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  };
}

export type TypedRouteDefinition<T extends RequestSchema> = {
  schema: T;
  handler: TypedHandler<T>;
};

export type TypedRoutes = Record<string, TypedRouteDefinition<any>>;

export function createTypedRoutes<T extends TypedRoutes>(routes: T) {
  const honoHandlers: Record<
    string,
    ReturnType<typeof createTypedHandler>
  > = {};

  for (const [routeName, { schema, handler }] of Object.entries(routes)) {
    honoHandlers[routeName] = createTypedHandler(schema, handler);
  }

  return honoHandlers;
}

/**
 * A handler created by createHttpHandler with endpoint metadata attached.
 * This allows registerHandlers to auto-register routes based on the endpoint's path and method.
 */
export type HttpHandler = ((c: Context) => Promise<Response>) & {
  __endpoint: RequestSchema;
};

/**
 * Options for createHttpHandler.
 */
export type CreateHttpHandlerOptions<
  T extends RequestSchema,
  TAuth extends AuthLevel = "none",
  TUser extends BackendUser = BackendUser,
> = {
  /**
   * The endpoint schema defining request/response types.
   */
  endpoint: T;

  /**
   * Authentication level for this route.
   * - 'required': Request must be authenticated. Returns 401 if not. User is guaranteed in handler.
   * - 'optional': Authentication is optional. User may be null in handler.
   * - 'none': No authentication check. User is always null. (default)
   */
  auth?: TAuth;

  /**
   * The handler function.
   * When auth is 'required', user is guaranteed to be non-null.
   * When auth is 'optional', user may be null.
   * When auth is 'none', user is null.
   */
  handler: TypedHandler<
    T,
    TAuth extends "required"
      ? TUser
      : TAuth extends "optional"
        ? TUser | null
        : null
  >;
};

/**
 * Create a typed HTTP handler with optional authentication.
 *
 * @example
 * ```typescript
 * // No auth (default)
 * export const handleGetPublicData = createHttpHandler({
 *   endpoint: apiEndpoints.getPublicData,
 *   handler: async ({ body }) => {
 *     return { data: 'public' };
 *   },
 * });
 *
 * // Required auth - user is guaranteed
 * export const handleGetProfile = createHttpHandler({
 *   endpoint: apiEndpoints.getProfile,
 *   auth: 'required',
 *   handler: async ({ body, user }) => {
 *     // user is guaranteed to exist here
 *     return { userId: user.id };
 *   },
 * });
 *
 * // Optional auth - user may be null
 * export const handleGetContent = createHttpHandler({
 *   endpoint: apiEndpoints.getContent,
 *   auth: 'optional',
 *   handler: async ({ body, user }) => {
 *     if (user) {
 *       return { content: 'personalized', userId: user.id };
 *     }
 *     return { content: 'generic' };
 *   },
 * });
 * ```
 */
export function createHttpHandler<
  T extends RequestSchema,
  TAuth extends AuthLevel = "none",
  TUser extends BackendUser = BackendUser,
>(options: CreateHttpHandlerOptions<T, TAuth, TUser>): HttpHandler {
  const { endpoint, handler, auth } = options;
  const honoHandler = createTypedHandlerInternal(
    endpoint,
    handler as TypedHandler<T, any>,
    {
      auth,
    },
  );

  // Attach endpoint metadata to the handler for auto-registration
  return Object.assign(honoHandler, { __endpoint: endpoint }) as HttpHandler;
}

/**
 * A record of handlers to be registered with registerHandlers.
 */
export type HttpHandlers = Record<string, HttpHandler>;

/**
 * Register multiple HTTP handlers with a Hono app.
 * Automatically extracts path and method from each handler's endpoint metadata.
 *
 * @example
 * ```typescript
 * // In dashboard.ts
 * export const dashboardHandlers = {
 *   getRevenueChart: createHttpHandler({
 *     endpoint: apiEndpoints.getRevenueChart,
 *     auth: "required",
 *     handler: async () => ({ ... }),
 *   }),
 *   getBrowserStats: createHttpHandler({
 *     endpoint: apiEndpoints.getBrowserStats,
 *     auth: "required",
 *     handler: async () => ({ ... }),
 *   }),
 * };
 *
 * // In index.ts
 * registerHandlers(app, dashboardHandlers);
 * // Automatically registers:
 * // app.get("/dashboard/revenue-chart", handler)
 * // app.get("/dashboard/browser-stats", handler)
 * ```
 */
export function registerHandlers<
  TApp extends { get: any; post: any; put: any; patch: any; delete: any },
>(app: TApp, handlers: HttpHandlers): void {
  for (const handler of Object.values(handlers)) {
    const { method, path } = handler.__endpoint;
    const methodLower = method.toLowerCase() as
      | "get"
      | "post"
      | "put"
      | "patch"
      | "delete";
    app[methodLower](path, handler);
  }
}
