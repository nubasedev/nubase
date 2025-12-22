import { createHttpHandler, HttpError } from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { apiEndpoints } from "questlog-schema";
import { getDb } from "../../db/helpers/drizzle";
import { usersTable } from "../../db/schema/user";

type User = InferSelectModel<typeof usersTable>;

// JWT secret - in production, use environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || "nubase-dev-secret-change-in-production";
const JWT_EXPIRY = "1h";
const COOKIE_NAME = "nubase_auth";

/**
 * Login handler - validates credentials and sets HttpOnly cookie
 */
export const handleLogin = createHttpHandler({
  endpoint: apiEndpoints.login,
  handler: async ({ body, ctx }) => {
    const db = getDb();

    // Find user by username
    const users: User[] = await db
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    // Set HttpOnly cookie
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`,
    );

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
 * Logout handler - clears the auth cookie
 */
export const handleLogout = createHttpHandler({
  endpoint: apiEndpoints.logout,
  handler: async ({ ctx }) => {
    // Clear the cookie by setting it to expire immediately
    ctx.header(
      "Set-Cookie",
      `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    );

    return { success: true };
  },
});

/**
 * Get current user handler - validates JWT from cookie
 */
export const handleGetMe = createHttpHandler({
  endpoint: apiEndpoints.getMe,
  handler: async ({ ctx }) => {
    // Get cookie from request
    const cookieHeader = ctx.req.header("Cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const token = cookies[COOKIE_NAME];

    if (!token) {
      return { user: undefined };
    }

    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        username: string;
      };

      // Fetch user from database
      const db = getDb();
      const users: User[] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, decoded.userId));

      if (users.length === 0) {
        return { user: undefined };
      }

      const user = users[0];
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch {
      // Invalid or expired token
      return { user: undefined };
    }
  },
});

/**
 * Simple cookie parser
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    if (name) {
      cookies[name.trim()] = rest.join("=").trim();
    }
  });
  return cookies;
}
