import { getAuthController, HttpError } from "@nubase/backend";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { QuestlogUser } from "../auth";
import { getDb } from "../db/helpers/kysely";
import { createHandler } from "./handler-factory";

// Short-lived secret for login tokens (in production, use a proper secret)
const LOGIN_TOKEN_SECRET =
  process.env.LOGIN_TOKEN_SECRET ||
  "nubase-login-token-secret-change-in-production";
const LOGIN_TOKEN_EXPIRY = "5m"; // 5 minutes to complete workspace selection

interface LoginTokenPayload {
  userId: number;
  email: string;
}

/**
 * Auth endpoints.
 */
export const authHandlers = {
  /**
   * Login Start handler - Step 1 of two-step auth.
   * Validates credentials (email + password) at root level.
   * Returns a temporary login token and list of workspaces the user belongs to.
   */
  loginStart: createHandler((e) => e.loginStart, {
    handler: async ({ body }) => {
      const db = getDb();

      // Find user by email (users are root-level now)
      const user = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", body.email)
        .executeTakeFirst();

      if (!user) {
        throw new HttpError(401, "Invalid email or password");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        body.password,
        user.passwordHash,
      );
      if (!isValidPassword) {
        throw new HttpError(401, "Invalid email or password");
      }

      // Get all workspaces this user belongs to via user_workspaces table
      const userWorkspaceRows = await db
        .selectFrom("userWorkspaces")
        .selectAll()
        .where("userId", "=", user.id)
        .execute();

      if (userWorkspaceRows.length === 0) {
        throw new HttpError(401, "User has no workspace access");
      }

      // Fetch workspace details
      const workspaceIds = userWorkspaceRows.map((uw) => uw.workspaceId);
      const workspaces = await db
        .selectFrom("workspaces")
        .selectAll()
        .where("id", "in", workspaceIds)
        .execute();

      // Create a short-lived login token containing the user ID
      const loginToken = jwt.sign(
        {
          userId: user.id,
          email: body.email,
        } satisfies LoginTokenPayload,
        LOGIN_TOKEN_SECRET,
        { expiresIn: LOGIN_TOKEN_EXPIRY },
      );

      return {
        loginToken,
        email: body.email,
        workspaces: workspaces.map((w) => ({
          id: w.id,
          slug: w.slug,
          name: w.name,
        })),
      };
    },
  }),

  /**
   * Login Complete handler - Step 2 of two-step auth.
   * Validates the login token and selected workspace, then issues the full auth token.
   */
  loginComplete: createHandler((e) => e.loginComplete, {
    handler: async ({ body, ctx }) => {
      const authController = getAuthController<QuestlogUser>(ctx);
      const db = getDb();

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

      // Look up the selected workspace
      const workspace = await db
        .selectFrom("workspaces")
        .selectAll()
        .where("slug", "=", body.workspace)
        .executeTakeFirst();

      if (!workspace) {
        throw new HttpError(404, `Workspace not found: ${body.workspace}`);
      }

      // Verify user has access to this workspace
      const userWorkspaceAccess = await db
        .selectFrom("userWorkspaces")
        .selectAll()
        .where("userId", "=", decoded.userId)
        .where("workspaceId", "=", workspace.id)
        .executeTakeFirst();

      if (!userWorkspaceAccess) {
        throw new HttpError(403, "You do not have access to this workspace");
      }

      // Fetch the user
      const dbUser = await db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", decoded.userId)
        .executeTakeFirst();

      if (!dbUser) {
        throw new HttpError(401, "User not found");
      }

      // Create user object for token (includes selected workspaceId)
      const user: QuestlogUser = {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        workspaceId: workspace.id,
      };

      // Create and set the full auth token
      const token = await authController.createToken(user);
      authController.setTokenInResponse(ctx, token);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        workspace: {
          id: workspace.id,
          slug: workspace.slug,
          name: workspace.name,
        },
      };
    },
  }),

  /**
   * Legacy Login handler - validates credentials and sets HttpOnly cookie.
   * @deprecated Use loginStart and loginComplete for two-step flow
   */
  login: createHandler((e) => e.login, {
    handler: async ({ body, ctx }) => {
      const authController = getAuthController<QuestlogUser>(ctx);

      // Look up workspace from the request body (path-based multi-workspace)
      const db = getDb();
      const workspace = await db
        .selectFrom("workspaces")
        .selectAll()
        .where("slug", "=", body.workspace)
        .executeTakeFirst();

      if (!workspace) {
        throw new HttpError(404, `Workspace not found: ${body.workspace}`);
      }

      // Find user by email (users are root-level)
      const dbUser = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", body.email)
        .executeTakeFirst();

      if (!dbUser) {
        throw new HttpError(401, "Invalid email or password");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        body.password,
        dbUser.passwordHash,
      );
      if (!isValidPassword) {
        throw new HttpError(401, "Invalid email or password");
      }

      // Verify user has access to this workspace
      const userWorkspaceAccess = await db
        .selectFrom("userWorkspaces")
        .selectAll()
        .where("userId", "=", dbUser.id)
        .where("workspaceId", "=", workspace.id)
        .executeTakeFirst();

      if (!userWorkspaceAccess) {
        throw new HttpError(403, "You do not have access to this workspace");
      }

      // Create user object for token (includes selected workspaceId)
      const user: QuestlogUser = {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        workspaceId: workspace.id,
      };

      // Create token using auth controller
      const token = await authController.createToken(user);

      // Set cookie using auth controller
      authController.setTokenInResponse(ctx, token);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      };
    },
  }),

  /** Logout handler - clears the auth cookie. */
  logout: createHandler((e) => e.logout, {
    handler: async ({ ctx }) => {
      const authController = getAuthController(ctx);
      authController.clearTokenFromResponse(ctx);
      return { success: true };
    },
  }),

  /** Get current user handler. */
  getMe: createHandler((e) => e.getMe, {
    auth: "optional",
    handler: async ({ user }) => {
      if (!user) {
        return { user: undefined, workspaces: [] };
      }

      const db = getDb();
      const userWorkspaceRows = await db
        .selectFrom("userWorkspaces")
        .selectAll()
        .where("userId", "=", user.id)
        .execute();

      const workspaceIds = userWorkspaceRows.map((uw) => uw.workspaceId);
      const workspaces = workspaceIds.length
        ? await db
            .selectFrom("workspaces")
            .selectAll()
            .where("id", "in", workspaceIds)
            .execute()
        : [];

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        workspaces: workspaces.map((w) => ({
          id: w.id,
          slug: w.slug,
          name: w.name,
        })),
      };
    },
  }),

  /** Signup handler - creates a new workspace and admin user. */
  signup: createHandler((e) => e.signup, {
    handler: async ({ body, ctx }) => {
      const authController = getAuthController<QuestlogUser>(ctx);
      const db = getDb();

      // Validate workspace slug format
      if (!/^[a-z0-9-]+$/.test(body.workspace)) {
        throw new HttpError(
          400,
          "Workspace slug must be lowercase and contain only letters, numbers, and hyphens",
        );
      }

      // Check if workspace slug already exists
      const existingWorkspace = await db
        .selectFrom("workspaces")
        .selectAll()
        .where("slug", "=", body.workspace)
        .executeTakeFirst();

      if (existingWorkspace) {
        throw new HttpError(409, "Organization slug is already taken");
      }

      // Check if email already exists
      const existingEmail = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", body.email)
        .executeTakeFirst();

      if (existingEmail) {
        throw new HttpError(409, "Email is already registered");
      }

      // Validate password length
      if (body.password.length < 8) {
        throw new HttpError(400, "Password must be at least 8 characters long");
      }

      // Create the workspace
      const newWorkspace = await db
        .insertInto("workspaces")
        .values({
          slug: body.workspace,
          name: body.workspaceName,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Hash the password
      const passwordHash = await bcrypt.hash(body.password, 10);

      // Create the admin user (root-level, no workspaceId)
      const newUser = await db
        .insertInto("users")
        .values({
          email: body.email,
          displayName: body.displayName,
          passwordHash,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // Link user to workspace via user_workspaces table
      await db
        .insertInto("userWorkspaces")
        .values({
          userId: newUser.id,
          workspaceId: newWorkspace.id,
        })
        .execute();

      // Create user object for token (includes selected workspaceId)
      const user: QuestlogUser = {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        workspaceId: newWorkspace.id,
      };

      // Create and set the auth token
      const token = await authController.createToken(user);
      authController.setTokenInResponse(ctx, token);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        workspace: {
          id: newWorkspace.id,
          slug: newWorkspace.slug,
          name: newWorkspace.name,
        },
      };
    },
  }),
};
