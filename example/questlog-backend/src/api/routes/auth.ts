import {
  createHttpHandler,
  getAuthController,
  HttpError,
} from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { apiEndpoints } from "questlog-schema";
import type { QuestlogUser } from "../../auth";
import { getDb } from "../../db/helpers/drizzle";
import { usersTable } from "../../db/schema/user";

type DbUser = InferSelectModel<typeof usersTable>;

/**
 * Login handler - validates credentials and sets HttpOnly cookie.
 * Uses the auth controller to create tokens and set cookies.
 */
export const handleLogin = createHttpHandler({
  endpoint: apiEndpoints.login,
  handler: async ({ body, ctx }) => {
    const db = getDb();
    const authController = getAuthController<QuestlogUser>(ctx);

    // Find user by username
    const users: DbUser[] = await db
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

    // Create user object for token
    const user: QuestlogUser = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
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
