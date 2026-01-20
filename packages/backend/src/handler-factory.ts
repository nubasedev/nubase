import type { RequestSchema } from "@nubase/core";
import type { AuthLevel, BackendUser } from "./auth/types";
import {
  createHttpHandler,
  type HttpHandler,
  type TypedHandler,
} from "./typed-handlers";

/**
 * Options for the handler created by the factory.
 */
export type FactoryHandlerOptions<
  T extends RequestSchema,
  TAuth extends AuthLevel,
  TUser extends BackendUser,
> = {
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
 * Configuration for createHandlerFactory.
 */
export type HandlerFactoryConfig<
  TEndpoints extends Record<string, RequestSchema>,
> = {
  /**
   * The API endpoints object mapping endpoint keys to their schemas.
   */
  endpoints: TEndpoints;
};

/**
 * Endpoint selector function type.
 * Receives the endpoints object and returns a specific endpoint schema.
 */
export type EndpointSelector<
  TEndpoints extends Record<string, RequestSchema>,
  T extends RequestSchema,
> = (endpoints: TEndpoints) => T;

/**
 * Creates a pre-configured handler factory with app-specific endpoint types and user type.
 *
 * This eliminates repetitive boilerplate when creating HTTP handlers by:
 * - Pre-configuring the user type once
 * - Inferring endpoint schema from the selector function
 * - Providing sensible defaults for auth level
 *
 * @example
 * ```typescript
 * // In your app's handler-factory.ts
 * import { createHandlerFactory } from "@nubase/backend";
 * import { apiEndpoints, type ApiEndpoints } from "my-schema";
 * import type { MyUser } from "../auth";
 *
 * export const createHandler = createHandlerFactory<ApiEndpoints, MyUser>({
 *   endpoints: apiEndpoints,
 * });
 *
 * // In your route files - use selector function for autocomplete
 * export const ticketHandlers = {
 *   getTickets: createHandler(e => e.getTickets, {
 *     auth: "required",
 *     handler: async ({ params, user, ctx }) => {
 *       // user is typed as MyUser (guaranteed non-null)
 *       // params is typed based on getTickets schema
 *       return { ... };
 *     },
 *   }),
 *
 *   // Public endpoint (no auth)
 *   getPublicData: createHandler(e => e.getPublicData, {
 *     handler: async ({ params }) => {
 *       return { ... };
 *     },
 *   }),
 * };
 * ```
 */
export function createHandlerFactory<
  TEndpoints extends Record<string, RequestSchema>,
  TUser extends BackendUser = BackendUser,
>(config: HandlerFactoryConfig<TEndpoints>) {
  /**
   * Creates a typed HTTP handler for the specified endpoint.
   *
   * @param selector - A function that selects the endpoint from the endpoints object (e.g., `e => e.getTickets`)
   * @param options - Handler options including auth level and handler function
   * @returns An HttpHandler with endpoint metadata attached for auto-registration
   */
  return function createHandler<
    TSelector extends (endpoints: TEndpoints) => RequestSchema,
    TAuth extends AuthLevel = "none",
  >(
    selector: TSelector,
    options: FactoryHandlerOptions<ReturnType<TSelector>, TAuth, TUser>,
  ): HttpHandler {
    const endpoint = selector(config.endpoints);

    return createHttpHandler({
      endpoint,
      auth: options.auth,
      handler: options.handler as any,
    });
  };
}
