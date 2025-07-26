import type {
  InferRequestBody,
  InferRequestParams,
  InferResponseBody,
  RequestSchema,
} from "@nubase/core";
import type { Context } from "hono";

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

export type TypedHandlerContext<T extends RequestSchema> = {
  params: InferRequestParams<T>;
  body: InferRequestBody<T>;
  ctx: Context;
};

export type TypedHandler<T extends RequestSchema> = (
  context: TypedHandlerContext<T>,
) => Promise<InferResponseBody<T>>;

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
function createTypedHandlerInternal<T extends RequestSchema>(
  schema: T,
  handler: TypedHandler<T>,
) {
  return async (c: Context) => {
    try {
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
      const result = await handler({
        params,
        body,
        ctx: c,
      });

      // Validate response body (optional, for development safety)
      try {
        const validatedResult = schema.responseBody.toZod().parse(result);

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

// New improved API with object parameters
export function createHttpHandler<T extends RequestSchema>({
  endpoint,
  handler,
}: {
  endpoint: T;
  handler: TypedHandler<T>;
}): ReturnType<typeof createTypedHandlerInternal> {
  return createTypedHandlerInternal(endpoint, handler);
}
