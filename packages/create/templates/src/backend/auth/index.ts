import type {
  BackendAuthController,
  BackendUser,
  NubaseBackendAuthConfig,
  TokenPayload,
  VerifyTokenResult,
} from "@nubase/backend";
import { getCookie } from "@nubase/backend";
import bcrypt from "bcryptjs";
import type { Context } from "hono";
import jwt from "jsonwebtoken";
import { config } from "../backend-config";
import { getDb } from "../db/helpers/kysely";

/**
 * User type for __PROJECT_NAME_PASCAL__ application.
 */
export interface __PROJECT_NAME_PASCAL__User extends BackendUser {
  id: number;
  email: string;
  displayName: string;
  workspaceId: number;
}

/**
 * Token payload for __PROJECT_NAME_PASCAL__ JWTs.
 */
export interface __PROJECT_NAME_PASCAL__TokenPayload extends TokenPayload {
  userId: number;
  email: string;
  workspaceId: number;
}

/**
 * __PROJECT_NAME_PASCAL__-specific implementation of BackendAuthController.
 * Handles JWT-based authentication using HttpOnly cookies.
 */
export class __PROJECT_NAME_PASCAL__AuthController
  implements
    BackendAuthController<
      __PROJECT_NAME_PASCAL__User,
      __PROJECT_NAME_PASCAL__TokenPayload
    >
{
  constructor(private readonly config: NubaseBackendAuthConfig) {}

  /**
   * Extract the authentication token from the request.
   */
  extractToken(ctx: Context): string | null {
    // Check Authorization header first (Bearer token)
    const authHeader = ctx.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }

    // Fall back to cookie
    const cookieHeader = ctx.req.header("Cookie") || "";
    return getCookie(cookieHeader, this.config.cookieName);
  }

  /**
   * Verify a JWT token and return the authenticated user.
   */
  async verifyToken(
    token: string,
  ): Promise<VerifyTokenResult<__PROJECT_NAME_PASCAL__User>> {
    try {
      // Verify JWT signature and expiration
      const decoded = jwt.verify(
        token,
        this.config.jwtSecret,
      ) as __PROJECT_NAME_PASCAL__TokenPayload;

      const db = getDb();

      // Fetch user from database to ensure they still exist
      const dbUser = await db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", decoded.userId)
        .executeTakeFirst();

      if (!dbUser) {
        return { valid: false, error: "User not found" };
      }

      // Verify user still has access to the workspace in the token
      const access = await db
        .selectFrom("userWorkspaces")
        .selectAll()
        .where("userId", "=", decoded.userId)
        .where("workspaceId", "=", decoded.workspaceId)
        .executeTakeFirst();

      if (!access) {
        return {
          valid: false,
          error: "User no longer has access to this workspace",
        };
      }

      return {
        valid: true,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          displayName: dbUser.displayName,
          workspaceId: decoded.workspaceId,
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
   * Create a JWT token for a user.
   */
  async createToken(
    user: __PROJECT_NAME_PASCAL__User,
    additionalPayload?: Partial<__PROJECT_NAME_PASCAL__TokenPayload>,
  ): Promise<string> {
    const payload: __PROJECT_NAME_PASCAL__TokenPayload = {
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
      ...additionalPayload,
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.sessionMaxAgeSeconds,
    });
  }

  /**
   * Set the authentication token in an HttpOnly cookie.
   */
  setTokenInResponse(ctx: Context, token: string): void {
    ctx.header(
      "Set-Cookie",
      `${this.config.cookieName}=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${this.config.sessionMaxAgeSeconds}`,
    );
  }

  /**
   * Clear the authentication cookie.
   */
  clearTokenFromResponse(ctx: Context): void {
    ctx.header(
      "Set-Cookie",
      `${this.config.cookieName}=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
    );
  }

  /**
   * Validate user credentials during login.
   */
  async validateCredentials(
    email: string,
    password: string,
    workspaceId?: number,
  ): Promise<__PROJECT_NAME_PASCAL__User | null> {
    if (workspaceId === undefined) {
      throw new Error(
        "workspaceId is required for multi-workspace authentication",
      );
    }

    const db = getDb();

    // Find user by email
    const dbUser = await db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();

    if (!dbUser) {
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Check if user has access to the workspace
    const access = await db
      .selectFrom("userWorkspaces")
      .selectAll()
      .where("userId", "=", dbUser.id)
      .where("workspaceId", "=", workspaceId)
      .executeTakeFirst();

    if (!access) {
      return null;
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
 */
export const __PROJECT_NAME_CAMEL__AuthController =
  new __PROJECT_NAME_PASCAL__AuthController(config.auth);
