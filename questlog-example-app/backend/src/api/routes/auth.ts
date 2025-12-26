import {
  createHttpHandler,
  getAuthController,
  HttpError,
} from "@nubase/backend";
import bcrypt from "bcrypt";
import type { InferSelectModel } from "drizzle-orm";
import { and, eq, inArray } from "drizzle-orm";
import { apiEndpoints } from "example-schema";
import jwt from "jsonwebtoken";
import type { QuestlogUser } from "../../auth";
import { getAdminDb } from "../../db/helpers/drizzle";
import { usersTable } from "../../db/schema/user";
import { userWorkspacesTable } from "../../db/schema/user-workspace";
import { workspacesTable } from "../../db/schema/workspace";

type DbUser = InferSelectModel<typeof usersTable>;
type DbWorkspace = InferSelectModel<typeof workspacesTable>;

// Short-lived secret for login tokens (in production, use a proper secret)
const LOGIN_TOKEN_SECRET =
  process.env.LOGIN_TOKEN_SECRET ||
  "nubase-login-token-secret-change-in-production";
const LOGIN_TOKEN_EXPIRY = "5m"; // 5 minutes to complete workspace selection

interface LoginTokenPayload {
  userId: number;
  username: string;
}

/**
 * Auth endpoints.
 */
export const authHandlers = {
  /**
   * Login Start handler - Step 1 of two-step auth.
   * Validates credentials (username + password) at root level.
   * Returns a temporary login token and list of workspaces the user belongs to.
   */
  loginStart: createHttpHandler({
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

      // Get all workspaces this user belongs to via user_workspaces table
      const userWorkspaceRows = await adminDb
        .select()
        .from(userWorkspacesTable)
        .where(eq(userWorkspacesTable.userId, user.id));

      if (userWorkspaceRows.length === 0) {
        throw new HttpError(401, "User has no workspace access");
      }

      // Fetch workspace details
      const workspaceIds = userWorkspaceRows.map((uw) => uw.workspaceId);
      const workspaces: DbWorkspace[] = await adminDb
        .select()
        .from(workspacesTable)
        .where(inArray(workspacesTable.id, workspaceIds));

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
  loginComplete: createHttpHandler({
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

      // Look up the selected workspace
      const workspaces = await adminDb
        .select()
        .from(workspacesTable)
        .where(eq(workspacesTable.slug, body.workspace));

      if (workspaces.length === 0) {
        throw new HttpError(404, `Workspace not found: ${body.workspace}`);
      }

      const workspace = workspaces[0];

      // Verify user has access to this workspace
      const userWorkspaceAccess = await adminDb
        .select()
        .from(userWorkspacesTable)
        .where(
          and(
            eq(userWorkspacesTable.userId, decoded.userId),
            eq(userWorkspacesTable.workspaceId, workspace.id),
          ),
        );

      if (userWorkspaceAccess.length === 0) {
        throw new HttpError(403, "You do not have access to this workspace");
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

      // Create user object for token (includes selected workspaceId)
      const user: QuestlogUser = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        workspaceId: workspace.id,
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
  login: createHttpHandler({
    endpoint: apiEndpoints.login,
    handler: async ({ body, ctx }) => {
      const authController = getAuthController<QuestlogUser>(ctx);

      // Look up workspace from the request body (path-based multi-workspace)
      const adminDb = getAdminDb();
      const workspaces = await adminDb
        .select()
        .from(workspacesTable)
        .where(eq(workspacesTable.slug, body.workspace));

      if (workspaces.length === 0) {
        throw new HttpError(404, `Workspace not found: ${body.workspace}`);
      }

      const workspace = workspaces[0];

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

      // Verify user has access to this workspace
      const userWorkspaceAccess = await adminDb
        .select()
        .from(userWorkspacesTable)
        .where(
          and(
            eq(userWorkspacesTable.userId, dbUser.id),
            eq(userWorkspacesTable.workspaceId, workspace.id),
          ),
        );

      if (userWorkspaceAccess.length === 0) {
        throw new HttpError(403, "You do not have access to this workspace");
      }

      // Create user object for token (includes selected workspaceId)
      const user: QuestlogUser = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
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
          username: user.username,
        },
      };
    },
  }),

  /** Logout handler - clears the auth cookie. */
  logout: createHttpHandler({
    endpoint: apiEndpoints.logout,
    handler: async ({ ctx }) => {
      const authController = getAuthController(ctx);
      authController.clearTokenFromResponse(ctx);
      return { success: true };
    },
  }),

  /** Get current user handler. */
  getMe: createHttpHandler<typeof apiEndpoints.getMe, "optional", QuestlogUser>(
    {
      endpoint: apiEndpoints.getMe,
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
    },
  ),

  /** Signup handler - creates a new workspace and admin user. */
  signup: createHttpHandler({
    endpoint: apiEndpoints.signup,
    handler: async ({ body, ctx }) => {
      const authController = getAuthController<QuestlogUser>(ctx);
      const adminDb = getAdminDb();

      // Validate workspace slug format
      if (!/^[a-z0-9-]+$/.test(body.workspace)) {
        throw new HttpError(
          400,
          "Workspace slug must be lowercase and contain only letters, numbers, and hyphens",
        );
      }

      // Check if workspace slug already exists
      const existingWorkspaces = await adminDb
        .select()
        .from(workspacesTable)
        .where(eq(workspacesTable.slug, body.workspace));

      if (existingWorkspaces.length > 0) {
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

      // Create the workspace
      const [newWorkspace] = await adminDb
        .insert(workspacesTable)
        .values({
          slug: body.workspace,
          name: body.workspaceName,
        })
        .returning();

      // Hash the password
      const passwordHash = await bcrypt.hash(body.password, 10);

      // Create the admin user (root-level, no workspaceId)
      const [newUser] = await adminDb
        .insert(usersTable)
        .values({
          email: body.email,
          username: body.username,
          passwordHash,
        })
        .returning();

      // Link user to workspace via user_workspaces table
      await adminDb.insert(userWorkspacesTable).values({
        userId: newUser.id,
        workspaceId: newWorkspace.id,
      });

      // Create user object for token (includes selected workspaceId)
      const user: QuestlogUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        workspaceId: newWorkspace.id,
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
        workspace: {
          id: newWorkspace.id,
          slug: newWorkspace.slug,
          name: newWorkspace.name,
        },
      };
    },
  }),
};
