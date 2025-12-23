import {
  createHttpHandler,
  getAuthController,
  HttpError,
} from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getAdminDb } from "../../db/helpers/drizzle";
import { tenantsTable } from "../../db/schema/tenant";
import { usersTable } from "../../db/schema/user";

type DbUser = InferSelectModel<typeof usersTable>;

/**
 * Login handler - validates credentials and sets HttpOnly cookie.
 * Uses the auth controller to create tokens and set cookies.
 *
 * For path-based multi-tenancy, the tenant slug is provided in the request body.
 * The handler looks up the tenant and validates the user within that tenant.
 */
export const handleLogin = createHttpHandler({
  endpoint: apiEndpoints.login,
  handler: async ({ body, ctx }) => {
    const authController = getAuthController<QuestlogUser>(ctx);

    // Look up tenant from the request body (path-based multi-tenancy)
    // Use admin DB to bypass RLS since we don't have a tenant context yet
    const adminDb = getAdminDb();
    const tenants = await adminDb
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, body.tenant));

    if (tenants.length === 0) {
      throw new HttpError(404, `Tenant not found: ${body.tenant}`);
    }

    const tenant = tenants[0];

    // Find user by username within the tenant
    // Use admin DB since we don't have RLS context set
    const users: DbUser[] = await adminDb
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.username, body.username),
          eq(usersTable.tenantId, tenant.id),
        ),
      );

    if (users.length === 0) {
      throw new HttpError(401, "Invalid username or password");
    }

    const dbUser = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(
      body.password,
      dbUser.passwordHash,
    );
    if (!isValidPassword) {
      throw new HttpError(401, "Invalid username or password");
    }

    // Create user object for token (includes tenantId)
    const user: QuestlogUser = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      tenantId: dbUser.tenantId,
    };

    // Create token using auth controller
    const token = await authController.createToken(user);

    // Set cookie using auth controller
    authController.setTokenInResponse(ctx, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  },
});

/**
 * Logout handler - clears the auth cookie.
 * Uses the auth controller to clear the cookie.
 */
export const handleLogout = createHttpHandler({
  endpoint: apiEndpoints.logout,
  handler: async ({ ctx }) => {
    const authController = getAuthController(ctx);
    authController.clearTokenFromResponse(ctx);
    return { success: true };
  },
});

/**
 * Get current user handler.
 * Uses the auth middleware's user extraction - no manual JWT verification needed.
 */
export const handleGetMe = createHttpHandler<
  typeof apiEndpoints.getMe,
  "optional",
  QuestlogUser
>({
  endpoint: apiEndpoints.getMe,
  // Note: We use auth: 'optional' because we want to return { user: undefined }
  // when not authenticated, not a 401 error
  auth: "optional",
  handler: async ({ user }) => {
    if (!user) {
      return { user: undefined };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  },
});
