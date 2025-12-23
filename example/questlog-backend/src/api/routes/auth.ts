import {
  createHttpHandler,
  getAuthController,
  HttpError,
} from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { and, eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getAdminDb } from "../../db/helpers/drizzle";
import { tenantsTable } from "../../db/schema/tenant";
import { usersTable } from "../../db/schema/user";
import { userTenantsTable } from "../../db/schema/user-tenant";

type DbUser = InferSelectModel<typeof usersTable>;
type DbTenant = InferSelectModel<typeof tenantsTable>;

// Short-lived secret for login tokens (in production, use a proper secret)
const LOGIN_TOKEN_SECRET =
  process.env.LOGIN_TOKEN_SECRET ||
  "nubase-login-token-secret-change-in-production";
const LOGIN_TOKEN_EXPIRY = "5m"; // 5 minutes to complete tenant selection

interface LoginTokenPayload {
  userId: number;
  username: string;
}

/**
 * Login Start handler - Step 1 of two-step auth.
 * Validates credentials (username + password) at root level.
 * Returns a temporary login token and list of tenants the user belongs to.
 */
export const handleLoginStart = createHttpHandler({
  endpoint: apiEndpoints.loginStart,
  handler: async ({ body }) => {
    const adminDb = getAdminDb();

    // Find user by username (users are root-level now)
    const users: DbUser[] = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, body.username));

    if (users.length === 0) {
      throw new HttpError(401, "Invalid username or password");
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(
      body.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new HttpError(401, "Invalid username or password");
    }

    // Get all tenants this user belongs to via user_tenants table
    const userTenantRows = await adminDb
      .select()
      .from(userTenantsTable)
      .where(eq(userTenantsTable.userId, user.id));

    if (userTenantRows.length === 0) {
      throw new HttpError(401, "User has no tenant access");
    }

    // Fetch tenant details
    const tenantIds = userTenantRows.map((ut) => ut.tenantId);
    const tenants: DbTenant[] = await adminDb
      .select()
      .from(tenantsTable)
      .where(inArray(tenantsTable.id, tenantIds));

    // Create a short-lived login token containing the user ID
    const loginToken = jwt.sign(
      {
        userId: user.id,
        username: body.username,
      } satisfies LoginTokenPayload,
      LOGIN_TOKEN_SECRET,
      { expiresIn: LOGIN_TOKEN_EXPIRY },
    );

    return {
      loginToken,
      username: body.username,
      tenants: tenants.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
      })),
    };
  },
});

/**
 * Login Complete handler - Step 2 of two-step auth.
 * Validates the login token and selected tenant, then issues the full auth token.
 */
export const handleLoginComplete = createHttpHandler({
  endpoint: apiEndpoints.loginComplete,
  handler: async ({ body, ctx }) => {
    const authController = getAuthController<QuestlogUser>(ctx);
    const adminDb = getAdminDb();

    // Verify the login token
    let decoded: LoginTokenPayload;
    try {
      decoded = jwt.verify(
        body.loginToken,
        LOGIN_TOKEN_SECRET,
      ) as LoginTokenPayload;
    } catch {
      throw new HttpError(401, "Invalid or expired login token");
    }

    // Look up the selected tenant
    const tenants = await adminDb
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, body.tenant));

    if (tenants.length === 0) {
      throw new HttpError(404, `Tenant not found: ${body.tenant}`);
    }

    const tenant = tenants[0];

    // Verify user has access to this tenant
    const userTenantAccess = await adminDb
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, decoded.userId),
          eq(userTenantsTable.tenantId, tenant.id),
        ),
      );

    if (userTenantAccess.length === 0) {
      throw new HttpError(403, "You do not have access to this tenant");
    }

    // Fetch the user
    const users: DbUser[] = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId));

    if (users.length === 0) {
      throw new HttpError(401, "User not found");
    }

    const dbUser = users[0];

    // Create user object for token (includes selected tenantId)
    const user: QuestlogUser = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      tenantId: tenant.id,
    };

    // Create and set the full auth token
    const token = await authController.createToken(user);
    authController.setTokenInResponse(ctx, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
    };
  },
});

/**
 * Legacy Login handler - validates credentials and sets HttpOnly cookie.
 * Uses the auth controller to create tokens and set cookies.
 *
 * For path-based multi-tenancy, the tenant slug is provided in the request body.
 * The handler looks up the tenant and validates the user has access to it.
 *
 * @deprecated Use handleLoginStart and handleLoginComplete for two-step flow
 */
export const handleLogin = createHttpHandler({
  endpoint: apiEndpoints.login,
  handler: async ({ body, ctx }) => {
    const authController = getAuthController<QuestlogUser>(ctx);

    // Look up tenant from the request body (path-based multi-tenancy)
    const adminDb = getAdminDb();
    const tenants = await adminDb
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, body.tenant));

    if (tenants.length === 0) {
      throw new HttpError(404, `Tenant not found: ${body.tenant}`);
    }

    const tenant = tenants[0];

    // Find user by username (users are root-level)
    const users: DbUser[] = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, body.username));

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

    // Verify user has access to this tenant
    const userTenantAccess = await adminDb
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.userId, dbUser.id),
          eq(userTenantsTable.tenantId, tenant.id),
        ),
      );

    if (userTenantAccess.length === 0) {
      throw new HttpError(403, "You do not have access to this tenant");
    }

    // Create user object for token (includes selected tenantId)
    const user: QuestlogUser = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      tenantId: tenant.id,
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

/**
 * Signup handler - creates a new tenant and admin user.
 * After successful signup, the user is automatically logged in.
 */
export const handleSignup = createHttpHandler({
  endpoint: apiEndpoints.signup,
  handler: async ({ body, ctx }) => {
    const authController = getAuthController<QuestlogUser>(ctx);
    const adminDb = getAdminDb();

    // Validate tenant slug format
    if (!/^[a-z0-9-]+$/.test(body.tenant)) {
      throw new HttpError(
        400,
        "Tenant slug must be lowercase and contain only letters, numbers, and hyphens",
      );
    }

    // Check if tenant slug already exists
    const existingTenants = await adminDb
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, body.tenant));

    if (existingTenants.length > 0) {
      throw new HttpError(409, "Organization slug is already taken");
    }

    // Check if username already exists (users are root-level, unique globally)
    const existingUsers = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, body.username));

    if (existingUsers.length > 0) {
      throw new HttpError(409, "Username is already taken");
    }

    // Check if email already exists
    const existingEmails = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (existingEmails.length > 0) {
      throw new HttpError(409, "Email is already registered");
    }

    // Validate password length
    if (body.password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters long");
    }

    // Create the tenant
    const [newTenant] = await adminDb
      .insert(tenantsTable)
      .values({
        slug: body.tenant,
        name: body.tenantName,
      })
      .returning();

    // Hash the password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Create the admin user (root-level, no tenantId)
    const [newUser] = await adminDb
      .insert(usersTable)
      .values({
        email: body.email,
        username: body.username,
        passwordHash,
      })
      .returning();

    // Link user to tenant via user_tenants table
    await adminDb.insert(userTenantsTable).values({
      userId: newUser.id,
      tenantId: newTenant.id,
    });

    // Create user object for token (includes selected tenantId)
    const user: QuestlogUser = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      tenantId: newTenant.id,
    };

    // Create and set the auth token
    const token = await authController.createToken(user);
    authController.setTokenInResponse(ctx, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      tenant: {
        id: newTenant.id,
        slug: newTenant.slug,
        name: newTenant.name,
      },
    };
  },
});
