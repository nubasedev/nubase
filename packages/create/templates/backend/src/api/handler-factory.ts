import { createHandlerFactory } from "@nubase/backend";
import { apiEndpoints, type ApiEndpoints } from "schema";
import type { __PROJECT_NAME_PASCAL__User } from "../auth";

/**
 * Pre-configured handler factory for __PROJECT_NAME_PASCAL__.
 *
 * This factory pre-binds:
 * - The apiEndpoints object for endpoint schema inference
 * - The __PROJECT_NAME_PASCAL__User type for authenticated handlers
 *
 * @example
 * ```typescript
 * // Required auth - user is guaranteed to be __PROJECT_NAME_PASCAL__User
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
export const createHandler = createHandlerFactory<ApiEndpoints, __PROJECT_NAME_PASCAL__User>({
	endpoints: apiEndpoints,
});
