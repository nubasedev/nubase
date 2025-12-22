import type { Context } from "hono";
import { Hono } from "hono";
import { AUTH_USER_KEY } from "./middleware";
import type { BackendAuthController, BackendUser } from "./types";

/**
 * Options for creating auth handlers.
 */
export interface CreateAuthHandlersOptions<
  TUser extends BackendUser = BackendUser,
> {
  /**
   * The auth controller instance.
   */
  controller: BackendAuthController<TUser>;
}

/**
 * Auth handlers returned by createAuthHandlers.
 */
export interface AuthHandlers {
  /**
   * Login handler - validates credentials and sets auth cookie.
   * Expects JSON body: { username: string, password: string }
   * Returns: { user: { id, email, username } }
   */
  login: (ctx: Context) => Promise<Response>;

  /**
   * Logout handler - clears the auth cookie.
   * Returns: { success: true }
   */
  logout: (ctx: Context) => Promise<Response>;

  /**
   * Get current user handler - returns the authenticated user or undefined.
   * Returns: { user?: { id, email, username } }
   */
  getMe: (ctx: Context) => Promise<Response>;

  /**
   * Pre-configured Hono router with all auth routes.
   * Mount this at /auth to get /auth/login, /auth/logout, /auth/me
   */
  routes: Hono;
}

/**
 * Create standard authentication handlers from a BackendAuthController.
 *
 * This utility reduces boilerplate by providing pre-built handlers for
 * login, logout, and get-current-user endpoints.
 *
 * @example
 * ```typescript
 * import { createAuthHandlers, createAuthMiddleware } from "@nubase/backend";
 *
 * const authController = new MyBackendAuthController();
 * const authHandlers = createAuthHandlers({ controller: authController });
 *
 * const app = new Hono();
 * app.use("*", createAuthMiddleware({ controller: authController }));
 *
 * // Option 1: Register routes individually
 * app.post("/auth/login", authHandlers.login);
 * app.post("/auth/logout", authHandlers.logout);
 * app.get("/auth/me", authHandlers.getMe);
 *
 * // Option 2: Mount the pre-configured router
 * app.route("/auth", authHandlers.routes);
 * ```
 */
export function createAuthHandlers<TUser extends BackendUser = BackendUser>(
  options: CreateAuthHandlersOptions<TUser>,
): AuthHandlers {
  const { controller } = options;

  const login = async (ctx: Context): Promise<Response> => {
    try {
      const body = await ctx.req.json<{ username: string; password: string }>();

      if (!body.username || !body.password) {
        return ctx.json({ error: "Username and password are required" }, 400);
      }

      const user = await controller.validateCredentials(
        body.username,
        body.password,
      );

      if (!user) {
        return ctx.json({ error: "Invalid username or password" }, 401);
      }

      const token = await controller.createToken(user);
      controller.setTokenInResponse(ctx, token);

      return ctx.json({ user }, 201);
    } catch (error) {
      console.error("Login error:", error);
      return ctx.json({ error: "Login failed" }, 500);
    }
  };

  const logout = async (ctx: Context): Promise<Response> => {
    controller.clearTokenFromResponse(ctx);
    return ctx.json({ success: true }, 200);
  };

  const getMe = async (ctx: Context): Promise<Response> => {
    const user = ctx.get(AUTH_USER_KEY) as TUser | null;

    if (!user) {
      return ctx.json({ user: undefined }, 200);
    }

    return ctx.json({ user }, 200);
  };

  // Create pre-configured router
  const routes = new Hono();
  routes.post("/login", login);
  routes.post("/logout", logout);
  routes.get("/me", getMe);

  return {
    login,
    logout,
    getMe,
    routes,
  };
}
