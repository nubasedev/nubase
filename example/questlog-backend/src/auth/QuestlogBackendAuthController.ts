import type {
  BackendAuthController,
  BackendUser,
  TokenPayload,
  VerifyTokenResult,
} from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
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
}

/**
 * Token payload for Questlog JWTs.
 */
export interface QuestlogTokenPayload extends TokenPayload {
  userId: number;
  username: string;
}

// Configuration
const JWT_SECRET =
  process.env.JWT_SECRET || "nubase-dev-secret-change-in-production";
const JWT_EXPIRY = "1h";
const COOKIE_NAME = "nubase_auth";

/**
 * Questlog-specific implementation of BackendAuthController.
 * Handles JWT-based authentication using HttpOnly cookies.
 */
export class QuestlogBackendAuthController
  implements BackendAuthController<QuestlogUser, QuestlogTokenPayload>
{
  /**
   * Extract the authentication token from the request.
   * Looks in the Cookie header for the nubase_auth cookie.
   */
  extractToken(ctx: Context): string | null {
    const cookieHeader = ctx.req.header("Cookie") || "";
    const cookies = this.parseCookies(cookieHeader);
    return cookies[COOKIE_NAME] || null;
  }

  /**
   * Verify a JWT token and return the authenticated user.
   */
  async verifyToken(token: string): Promise<VerifyTokenResult<QuestlogUser>> {
    try {
      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, JWT_SECRET) as QuestlogTokenPayload;

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
    user: QuestlogUser,
    additionalPayload?: Partial<QuestlogTokenPayload>,
  ): Promise<string> {
    const payload: QuestlogTokenPayload = {
      userId: user.id,
      username: user.username,
      ...additionalPayload,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Set the authentication token in an HttpOnly cookie.
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
   * Looks up the user by username and verifies the password.
   */
  async validateCredentials(
    username: string,
    password: string,
  ): Promise<QuestlogUser | null> {
    const db = getDb();

    // Find user by username
    const users: DbUser[] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));

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
    };
  }

  /**
   * Simple cookie parser helper.
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      if (name) {
        cookies[name.trim()] = rest.join("=").trim();
      }
    });
    return cookies;
  }
}

/**
 * Singleton instance of the auth controller.
 * Use this in your Hono app setup.
 */
export const questlogAuthController = new QuestlogBackendAuthController();
