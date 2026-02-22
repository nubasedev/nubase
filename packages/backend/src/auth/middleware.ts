import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { AuthLevel, BackendAuthController, BackendUser } from "./types";

/**
 * Context key for storing the authenticated user.
 * Use `c.get('user')` to retrieve the user in handlers.
 */
export const AUTH_USER_KEY = "user";

/**
 * Context key for storing the auth controller instance.
 */
export const AUTH_CONTROLLER_KEY = "authController";

/**
 * Variables added to Hono context by auth middleware.
 */
export interface AuthVariables<TUser extends BackendUser = BackendUser> {
  user: TUser | null;
  authController: BackendAuthController<TUser>;
}

/**
 * Options for the auth middleware.
 */
export interface AuthMiddlewareOptions<
  TUser extends BackendUser = BackendUser,
> {
  /**
   * The auth controller instance to use for token verification.
   */
  controller: BackendAuthController<TUser>;

  /**
   * Default auth level for all routes.
   * Can be overridden per-route using createHttpHandler's auth option.
   * @default "none"
   */
  defaultAuthLevel?: AuthLevel;
}

/**
 * Create an authentication middleware for Hono.
 *
 * This middleware:
 * 1. Extracts the token from the request
 * 2. Verifies the token using the provided controller
 * 3. Sets the user in the context (or null if not authenticated)
 * 4. Makes the controller available in context for handlers
 *
 * @example
 * ```typescript
 * const authController = new NubaseBackendAuthController();
 * const app = new Hono();
 *
 * // Apply to all routes
 * app.use('*', createAuthMiddleware({ controller: authController }));
 *
 * // Access user in handlers
 * app.get('/me', (c) => {
 *   const user = c.get('user');
 *   if (!user) return c.json({ error: 'Unauthorized' }, 401);
 *   return c.json({ user });
 * });
 * ```
 */
export function createAuthMiddleware<TUser extends BackendUser = BackendUser>(
  options: AuthMiddlewareOptions<TUser>,
) {
  const { controller } = options;

  return createMiddleware<{ Variables: AuthVariables<TUser> }>(
    async (c, next) => {
      // Store the controller in context for use by handlers
      c.set(AUTH_CONTROLLER_KEY, controller);

      // Extract token from request
      const token = controller.extractToken(c);

      // Debug logging
      const cookieHeader = c.req.header("Cookie");
      console.info(
        `[Auth] ${c.req.method} ${c.req.path} - Cookie header: ${cookieHeader ? `${cookieHeader.substring(0, 50)}...` : "(none)"}`,
      );
      console.info(`[Auth] Token extracted: ${token ? "yes" : "no"}`);

      if (!token) {
        // No token present - user is not authenticated
        c.set(AUTH_USER_KEY, null);
        return next();
      }

      // Verify the token
      const result = await controller.verifyToken(token);

      console.info(
        `[Auth] Token verification: ${result.valid ? "valid" : `invalid - ${result.error}`}`,
      );

      if (result.valid) {
        c.set(AUTH_USER_KEY, result.user);
      } else {
        // Invalid token - treat as unauthenticated
        c.set(AUTH_USER_KEY, null);
      }

      return next();
    },
  );
}

/**
 * Middleware to require authentication.
 * Returns 401 if user is not authenticated.
 *
 * @example
 * ```typescript
 * // Protect a single route
 * app.get('/protected', requireAuth(), (c) => {
 *   const user = c.get('user')!; // User is guaranteed to exist
 *   return c.json({ message: `Hello ${user.username}` });
 * });
 *
 * // Protect a group of routes
 * const protected = app.basePath('/api/admin');
 * protected.use('*', requireAuth());
 * ```
 */
export function requireAuth<TUser extends BackendUser = BackendUser>() {
  return createMiddleware<{ Variables: AuthVariables<TUser> }>(
    async (c, next) => {
      const user = c.get(AUTH_USER_KEY);

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return next();
    },
  );
}

/**
 * Helper to get the authenticated user from context.
 * Returns null if not authenticated.
 */
export function getUser<TUser extends BackendUser = BackendUser>(
  c: Context,
): TUser | null {
  return c.get(AUTH_USER_KEY) as TUser | null;
}

/**
 * Helper to get the auth controller from context.
 */
export function getAuthController<TUser extends BackendUser = BackendUser>(
  c: Context,
): BackendAuthController<TUser> {
  return c.get(AUTH_CONTROLLER_KEY) as BackendAuthController<TUser>;
}
