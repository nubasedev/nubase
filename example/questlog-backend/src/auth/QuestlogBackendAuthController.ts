import type {
  BackendAuthController,
  BackendUser,
  TokenPayload,
  VerifyTokenResult,
} from "@nubase/backend";
import { getCookie } from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import jwt from "jsonwebtoken";
import { getDb } from "../db/helpers/drizzle";
import { usersTable } from "../db/schema/user";

type DbUser = InferSelectModel<typeof usersTable>;

/**
 * User type for Questlog application.
 * This is what gets passed to handlers when auth is required/optional.
 */
export interface QuestlogUser extends BackendUser {
  id: number;
  email: string;
  username: string;
  tenantId: number;
}

/**
 * Token payload for Questlog JWTs.
 */
export interface QuestlogTokenPayload extends TokenPayload {
  userId: number;
  username: string;
  tenantId: number;
}

// Configuration
const JWT_SECRET =
  process.env.JWT_SECRET || "nubase-dev-secret-change-in-production";
const JWT_EXPIRY = "1h";
const COOKIE_NAME = "nubase_auth";

/**
 * Get the debug token secret for development/testing.
 * Read lazily to ensure environment variables are loaded.
 *
 * When set, enables debug authentication via Bearer tokens in the format:
 *   debug:<userId>:<secret>
 *
 * Set DEBUG_AUTH_TOKEN in your .env file to enable this feature.
 * Example: DEBUG_AUTH_TOKEN=dev-secret-123
 *
 * Usage with curl:
 *   curl -H "Authorization: Bearer debug:1:dev-secret-123" http://tavern.localhost:3001/tickets
 *
 * To authenticate as different users, just change the user ID:
 *   debug:1:dev-secret-123  -> User ID 1
 *   debug:2:dev-secret-123  -> User ID 2
 *   debug:42:dev-secret-123 -> User ID 42
 *
 * The user must exist in the current tenant (determined by subdomain via RLS).
 */
function getDebugAuthToken(): string | undefined {
  return process.env.DEBUG_AUTH_TOKEN;
}

/**
 * Questlog-specific implementation of BackendAuthController.
 * Handles JWT-based authentication using HttpOnly cookies.
 */
export class QuestlogBackendAuthController
  implements BackendAuthController<QuestlogUser, QuestlogTokenPayload>
{
  /**
   * Extract the authentication token from the request.
   *
   * Checks in order of priority:
   * 1. Authorization header (Bearer token) - for API-first apps and curl testing
   * 2. Cookie header (nubase_auth) - for browser-based auth
   *
   * Debug token format: debug:<userId>:<secret>
   * Example: debug:1:dev-secret-123
   */
  extractToken(ctx: Context): string | null {
    // Check Authorization header first (Bearer token)
    const authHeader = ctx.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7); // Remove "Bearer " prefix

      // Check if this is a debug token (format: debug:<userId>:<secret>)
      const debugToken = getDebugAuthToken();
      if (debugToken && token.startsWith("debug:")) {
        const parts = token.split(":");
        // Expected: ["debug", "<userId>", "<secret>"]
        if (parts.length === 3) {
          const [, userId, secret] = parts;
          if (secret === debugToken) {
            // Return internal format for verifyToken to process
            return `debug:${userId}`;
          }
        }
      }

      return token;
    }

    // Fall back to cookie
    const cookieHeader = ctx.req.header("Cookie") || "";
    return getCookie(cookieHeader, COOKIE_NAME);
  }

  /**
   * Verify a JWT token and return the authenticated user.
   * Optionally validates that the user belongs to the specified tenant.
   *
   * Special handling for debug tokens (prefixed with "debug:<userId>"):
   * - Authenticates as the specified user ID in the current tenant (via RLS)
   * - Only works when DEBUG_AUTH_TOKEN is set in environment
   */
  async verifyToken(
    token: string,
    requestTenantId?: number,
  ): Promise<VerifyTokenResult<QuestlogUser>> {
    // Handle debug token (format: "debug:<userId>")
    if (token.startsWith("debug:") && getDebugAuthToken()) {
      const userIdStr = token.slice(6); // Remove "debug:" prefix
      const userId = Number.parseInt(userIdStr, 10);
      if (Number.isNaN(userId)) {
        return { valid: false, error: "Invalid user ID in debug token" };
      }
      return this.authenticateAsUserId(userId);
    }

    try {
      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, JWT_SECRET) as QuestlogTokenPayload;

      // Validate tenant if provided
      if (
        requestTenantId !== undefined &&
        decoded.tenantId !== requestTenantId
      ) {
        return { valid: false, error: "User does not belong to this tenant" };
      }

      // Fetch user from database to ensure they still exist
      const db = getDb();
      const users: DbUser[] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, decoded.userId));

      if (users.length === 0) {
        return { valid: false, error: "User not found" };
      }

      const dbUser = users[0];
      return {
        valid: true,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.username,
          tenantId: dbUser.tenantId,
        },
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: "Token expired" };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: "Invalid token" };
      }
      return {
        valid: false,
        error:
          error instanceof Error ? error.message : "Token verification failed",
      };
    }
  }

  /**
   * Authenticate as a specific user ID.
   * Used for debug token authentication.
   * Relies on RLS context being set by tenant middleware - if the user
   * doesn't belong to the current tenant, RLS will return no results.
   */
  private async authenticateAsUserId(
    userId: number,
  ): Promise<VerifyTokenResult<QuestlogUser>> {
    const db = getDb();

    // RLS will filter to current tenant automatically
    const users: DbUser[] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (users.length === 0) {
      return { valid: false, error: "User not found in tenant" };
    }

    const dbUser = users[0];
    return {
      valid: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        tenantId: dbUser.tenantId,
      },
    };
  }

  /**
   * Create a JWT token for a user.
   */
  async createToken(
    user: QuestlogUser,
    additionalPayload?: Partial<QuestlogTokenPayload>,
  ): Promise<string> {
    const payload: QuestlogTokenPayload = {
      userId: user.id,
      username: user.username,
      tenantId: user.tenantId,
      ...additionalPayload,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Set the authentication token in an HttpOnly cookie.
   * For subdomain-based multi-tenancy, the cookie is set without a Domain attribute
   * so it's sent only to the exact host that set it. Each tenant subdomain
   * (e.g., tavern.localhost) gets its own session.
   */
  setTokenInResponse(ctx: Context, token: string): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`,
    );
  }

  /**
   * Clear the authentication cookie.
   */
  clearTokenFromResponse(ctx: Context): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    );
  }

  /**
   * Validate user credentials during login.
   * Looks up the user by username within the specified tenant and verifies the password.
   * Note: tenantId is required for multi-tenant validation but optional in the interface
   * for compatibility with the base BackendAuthController type.
   */
  async validateCredentials(
    username: string,
    password: string,
    tenantId?: number,
  ): Promise<QuestlogUser | null> {
    if (tenantId === undefined) {
      throw new Error("tenantId is required for multi-tenant authentication");
    }
    const db = getDb();

    // Find user by username within the tenant
    const users: DbUser[] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.username, username),
          eq(usersTable.tenantId, tenantId),
        ),
      );

    if (users.length === 0) {
      return null;
    }

    const dbUser = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      tenantId: dbUser.tenantId,
    };
  }
}

/**
 * Singleton instance of the auth controller.
 * Use this in your Hono app setup.
 */
export const questlogAuthController = new QuestlogBackendAuthController();
