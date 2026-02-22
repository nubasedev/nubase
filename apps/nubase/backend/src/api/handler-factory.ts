import { createHandlerFactory } from "@nubase/backend";
import { type ApiEndpoints, apiEndpoints } from "nubase-schema";
import type { NubaseUser } from "../auth";

/**
 * Pre-configured handler factory for Nubase.
 *
 * This factory pre-binds:
 * - The apiEndpoints object for endpoint schema inference
 * - The NubaseUser type for authenticated handlers
 *
 * @example
 * ```typescript
 * // Required auth - user is guaranteed to be NubaseUser
 * getTickets: createHandler((e) => e.getTickets, {
 *   auth: "required",
 *   handler: async ({ params, user, ctx }) => { ... },
 * }),
 *
 * // No auth (default) - no user in handler
 * loginStart: createHandler((e) => e.loginStart, {
 *   handler: async ({ body }) => { ... },
 * }),
 *
 * // Optional auth - user may be null
 * getMe: createHandler((e) => e.getMe, {
 *   auth: "optional",
 *   handler: async ({ user }) => { ... },
 * }),
 * ```
 */
export const createHandler = createHandlerFactory<ApiEndpoints, NubaseUser>({
  endpoints: apiEndpoints,
});
