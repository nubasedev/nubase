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
import { getAdminDb } from "../db/helpers/drizzle";
import { usersTable } from "../db/schema/user";
import { userWorkspacesTable } from "../db/schema/user-workspace";

type DbUser = InferSelectModel<typeof usersTable>;

/**
 * User type for Questlog application.
 * This is what gets passed to handlers when auth is required/optional.
 *
 * Note: Users exist at root level (no workspace). The workspaceId here represents
 * the currently selected workspace for this session.
 */
export interface QuestlogUser extends BackendUser {
  id: number;
  email: string;
  displayName: string;
  workspaceId: number; // The selected workspace for this session
}

/**
 * Token payload for Questlog JWTs.
 */
export interface QuestlogTokenPayload extends TokenPayload {
  userId: number;
  email: string;
  workspaceId: number; // The selected workspace for this session
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
 *   debug:<userId>:<workspaceId>:<secret>
 *
 * Set DEBUG_AUTH_TOKEN in your .env file to enable this feature.
 * Example: DEBUG_AUTH_TOKEN=dev-secret-123
 *
 * Usage with curl:
 *   curl -H "Authorization: Bearer debug:1:1:dev-secret-123" http://localhost:3001/tickets
 *
 * To authenticate as different users/workspaces, change the IDs:
 *   debug:1:1:dev-secret-123  -> User ID 1, Workspace ID 1
 *   debug:2:1:dev-secret-123  -> User ID 2, Workspace ID 1
 *   debug:1:2:dev-secret-123  -> User ID 1, Workspace ID 2
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
   * Debug token format: debug:<userId>:<workspaceId>:<secret>
   * Example: debug:1:1:dev-secret-123
   */
  extractToken(ctx: Context): string | null {
    // Check Authorization header first (Bearer token)
    const authHeader = ctx.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7); // Remove "Bearer " prefix

      // Check if this is a debug token (format: debug:<userId>:<workspaceId>:<secret>)
      const debugToken = getDebugAuthToken();
      if (debugToken && token.startsWith("debug:")) {
        const parts = token.split(":");
        // Expected: ["debug", "<userId>", "<workspaceId>", "<secret>"]
        if (parts.length === 4) {
          const [, userId, workspaceId, secret] = parts;
          if (secret === debugToken) {
            // Return internal format for verifyToken to process
            return `debug:${userId}:${workspaceId}`;
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
   * Optionally validates that the user belongs to the specified workspace.
   *
   * Special handling for debug tokens (prefixed with "debug:<userId>:<workspaceId>"):
   * - Authenticates as the specified user ID with the specified workspace
   * - Only works when DEBUG_AUTH_TOKEN is set in environment
   */
  async verifyToken(
    token: string,
    requestWorkspaceId?: number,
  ): Promise<VerifyTokenResult<QuestlogUser>> {
    // Handle debug token (format: "debug:<userId>:<workspaceId>")
    if (token.startsWith("debug:") && getDebugAuthToken()) {
      const parts = token.slice(6).split(":"); // Remove "debug:" prefix
      if (parts.length !== 2) {
        return { valid: false, error: "Invalid debug token format" };
      }
      const [userIdStr, workspaceIdStr] = parts;
      const userId = Number.parseInt(userIdStr, 10);
      const workspaceId = Number.parseInt(workspaceIdStr, 10);
      if (Number.isNaN(userId) || Number.isNaN(workspaceId)) {
        return {
          valid: false,
          error: "Invalid user/workspace ID in debug token",
        };
      }
      return this.authenticateAsUserId(userId, workspaceId);
    }

    try {
      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, JWT_SECRET) as QuestlogTokenPayload;

      // Validate workspace if provided
      if (
        requestWorkspaceId !== undefined &&
        decoded.workspaceId !== requestWorkspaceId
      ) {
        return {
          valid: false,
          error: "User does not belong to this workspace",
        };
      }

      // Fetch user from database to ensure they still exist
      // Users are root-level, no RLS
      const adminDb = getAdminDb();
      const users: DbUser[] = await adminDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, decoded.userId));

      if (users.length === 0) {
        return { valid: false, error: "User not found" };
      }

      // Verify user still has access to the workspace in the token
      const userWorkspaces = await adminDb
        .select()
        .from(userWorkspacesTable)
        .where(
          and(
            eq(userWorkspacesTable.userId, decoded.userId),
            eq(userWorkspacesTable.workspaceId, decoded.workspaceId),
          ),
        );

      if (userWorkspaces.length === 0) {
        return {
          valid: false,
          error: "User no longer has access to this workspace",
        };
      }

      const dbUser = users[0];
      return {
        valid: true,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          displayName: dbUser.displayName,
          workspaceId: decoded.workspaceId, // Use workspace from token
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
   * Authenticate as a specific user ID with a specific workspace.
   * Used for debug token authentication.
   */
  private async authenticateAsUserId(
    userId: number,
    workspaceId: number,
  ): Promise<VerifyTokenResult<QuestlogUser>> {
    const adminDb = getAdminDb();

    // Fetch user (no RLS on users table)
    const users: DbUser[] = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (users.length === 0) {
      return { valid: false, error: "User not found" };
    }

    // Verify user has access to the workspace
    const userWorkspaces = await adminDb
      .select()
      .from(userWorkspacesTable)
      .where(
        and(
          eq(userWorkspacesTable.userId, userId),
          eq(userWorkspacesTable.workspaceId, workspaceId),
        ),
      );

    if (userWorkspaces.length === 0) {
      return {
        valid: false,
        error: "User does not have access to this workspace",
      };
    }

    const dbUser = users[0];
    return {
      valid: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        workspaceId: workspaceId,
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
      email: user.email,
      workspaceId: user.workspaceId,
      ...additionalPayload,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Set the authentication token in an HttpOnly cookie.
   * For path-based multi-workspace, the cookie is set without a Domain attribute.
   * The workspace is identified from the URL path in the frontend and from the
   * JWT token in the backend.
   *
   * Cookie settings:
   * - HttpOnly: Prevents JavaScript access (XSS protection)
   * - Path=/: Cookie is sent for all paths
   * - SameSite=None: Required for cross-origin requests (frontend on different port)
   * - Secure: Required when SameSite=None (localhost is treated as secure by browsers)
   */
  setTokenInResponse(ctx: Context, token: string): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=3600`,
    );
  }

  /**
   * Clear the authentication cookie.
   */
  clearTokenFromResponse(ctx: Context): void {
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
    );
  }

  /**
   * Validate user credentials during login.
   * Looks up the user by email (root-level) and verifies the password.
   * Then checks if user has access to the specified workspace.
   */
  async validateCredentials(
    email: string,
    password: string,
    workspaceId?: number,
  ): Promise<QuestlogUser | null> {
    if (workspaceId === undefined) {
      throw new Error(
        "workspaceId is required for multi-workspace authentication",
      );
    }
    const adminDb = getAdminDb();

    // Find user by email (users are root-level, no workspace filter)
    const users: DbUser[] = await adminDb
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      return null;
    }

    const dbUser = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Check if user has access to the workspace
    const userWorkspaces = await adminDb
      .select()
      .from(userWorkspacesTable)
      .where(
        and(
          eq(userWorkspacesTable.userId, dbUser.id),
          eq(userWorkspacesTable.workspaceId, workspaceId),
        ),
      );

    if (userWorkspaces.length === 0) {
      return null; // User doesn't have access to this workspace
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      workspaceId: workspaceId,
    };
  }
}

/**
 * Singleton instance of the auth controller.
 * Use this in your Hono app setup.
 */
export const questlogAuthController = new QuestlogBackendAuthController();
