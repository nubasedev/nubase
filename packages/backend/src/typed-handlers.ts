import type {
  InferRequestBody,
  InferRequestParams,
  InferResponseBody,
  RequestSchema,
} from "@nubase/core";
import type { Context } from "hono";

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
      // Parse and validate request parameters
      let params: InferRequestParams<T>;
      try {
        const rawParams = c.req.param();
        params = schema.requestParams.parse(rawParams) as InferRequestParams<T>;
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
        const rawBody = schema.method === "GET" ? {} : await c.req.json();
        body = schema.requestBody.parse(rawBody) as InferRequestBody<T>;
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
        const validatedResult = schema.responseBody.parse(result);

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
