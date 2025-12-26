import {
	createHttpHandler,
	getAuthController,
	HttpError,
} from "@nubase/backend";
import bcrypt from "bcrypt";
import { and, eq, inArray } from "drizzle-orm";
import { apiEndpoints } from "schema";
import jwt from "jsonwebtoken";
import type { __PROJECT_NAME_PASCAL__User } from "../../auth";
import { getAdminDb } from "../../db/helpers/drizzle";
import { users, userWorkspaces, workspaces } from "../../db/schema";

// Short-lived secret for login tokens (in production, use a proper secret)
const LOGIN_TOKEN_SECRET =
	process.env.LOGIN_TOKEN_SECRET ||
	"nubase-login-token-secret-change-in-production";
const LOGIN_TOKEN_EXPIRY = "5m"; // 5 minutes to complete workspace selection

interface LoginTokenPayload {
	userId: number;
	username: string;
}

export const authHandlers = {
	/**
	 * Login Start handler - Step 1 of two-step auth.
	 * Validates credentials and returns list of workspaces.
	 */
	loginStart: createHttpHandler({
		endpoint: apiEndpoints.loginStart,
		handler: async ({ body }) => {
			// Find user by username
			const [user] = await getAdminDb()
				.select()
				.from(users)
				.where(eq(users.username, body.username));

			if (!user) {
				throw new HttpError(401, "Invalid username or password");
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(
				body.password,
				user.passwordHash,
			);
			if (!isValidPassword) {
				throw new HttpError(401, "Invalid username or password");
			}

			// Get all workspaces this user belongs to
			const userWorkspaceRows = await getAdminDb()
				.select()
				.from(userWorkspaces)
				.where(eq(userWorkspaces.userId, user.id));

			if (userWorkspaceRows.length === 0) {
				throw new HttpError(401, "User has no workspace access");
			}

			// Fetch workspace details
			const workspaceIds = userWorkspaceRows.map((uw) => uw.workspaceId);
			const workspaceList = await getAdminDb()
				.select()
				.from(workspaces)
				.where(inArray(workspaces.id, workspaceIds));

			// Create a short-lived login token
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
				workspaces: workspaceList.map((w) => ({
					id: w.id,
					slug: w.slug,
					name: w.name,
				})),
			};
		},
	}),

	/**
	 * Login Complete handler - Step 2 of two-step auth.
	 * Validates the login token and selected workspace.
	 */
	loginComplete: createHttpHandler({
		endpoint: apiEndpoints.loginComplete,
		handler: async ({ body, ctx }) => {
			const authController = getAuthController<__PROJECT_NAME_PASCAL__User>(ctx);

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
			const [workspace] = await getAdminDb()
				.select()
				.from(workspaces)
				.where(eq(workspaces.slug, body.workspace));

			if (!workspace) {
				throw new HttpError(404, `Workspace not found: ${body.workspace}`);
			}

			// Verify user has access to this workspace
			const [access] = await getAdminDb()
				.select()
				.from(userWorkspaces)
				.where(
					and(
						eq(userWorkspaces.userId, decoded.userId),
						eq(userWorkspaces.workspaceId, workspace.id),
					),
				);

			if (!access) {
				throw new HttpError(403, "You do not have access to this workspace");
			}

			// Fetch the user
			const [dbUser] = await getAdminDb()
				.select()
				.from(users)
				.where(eq(users.id, decoded.userId));

			if (!dbUser) {
				throw new HttpError(401, "User not found");
			}

			// Create user object for token
			const user: __PROJECT_NAME_PASCAL__User = {
				id: dbUser.id,
				email: dbUser.email,
				username: dbUser.username,
				workspaceId: workspace.id,
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
			const authController = getAuthController<__PROJECT_NAME_PASCAL__User>(ctx);

			// Look up workspace
			const [workspace] = await getAdminDb()
				.select()
				.from(workspaces)
				.where(eq(workspaces.slug, body.workspace));

			if (!workspace) {
				throw new HttpError(404, `Workspace not found: ${body.workspace}`);
			}

			// Find user by username
			const [dbUser] = await getAdminDb()
				.select()
				.from(users)
				.where(eq(users.username, body.username));

			if (!dbUser) {
				throw new HttpError(401, "Invalid username or password");
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(
				body.password,
				dbUser.passwordHash,
			);
			if (!isValidPassword) {
				throw new HttpError(401, "Invalid username or password");
			}

			// Verify user has access to this workspace
			const [access] = await getAdminDb()
				.select()
				.from(userWorkspaces)
				.where(
					and(
						eq(userWorkspaces.userId, dbUser.id),
						eq(userWorkspaces.workspaceId, workspace.id),
					),
				);

			if (!access) {
				throw new HttpError(403, "You do not have access to this workspace");
			}

			// Create user object for token
			const user: __PROJECT_NAME_PASCAL__User = {
				id: dbUser.id,
				email: dbUser.email,
				username: dbUser.username,
				workspaceId: workspace.id,
			};

			// Create and set token
			const token = await authController.createToken(user);
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
	getMe: createHttpHandler<
		typeof apiEndpoints.getMe,
		"optional",
		__PROJECT_NAME_PASCAL__User
	>({
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
	}),

	/** Signup handler - creates a new workspace and admin user. */
	signup: createHttpHandler({
		endpoint: apiEndpoints.signup,
		handler: async ({ body, ctx }) => {
			const authController = getAuthController<__PROJECT_NAME_PASCAL__User>(ctx);

			// Validate workspace slug format
			if (!/^[a-z0-9-]+$/.test(body.workspace)) {
				throw new HttpError(
					400,
					"Workspace slug must be lowercase and contain only letters, numbers, and hyphens",
				);
			}

			// Check if workspace slug already exists
			const [existingWorkspace] = await getAdminDb()
				.select()
				.from(workspaces)
				.where(eq(workspaces.slug, body.workspace));

			if (existingWorkspace) {
				throw new HttpError(409, "Organization slug is already taken");
			}

			// Check if username already exists
			const [existingUser] = await getAdminDb()
				.select()
				.from(users)
				.where(eq(users.username, body.username));

			if (existingUser) {
				throw new HttpError(409, "Username is already taken");
			}

			// Check if email already exists
			const [existingEmail] = await getAdminDb()
				.select()
				.from(users)
				.where(eq(users.email, body.email));

			if (existingEmail) {
				throw new HttpError(409, "Email is already registered");
			}

			// Validate password length
			if (body.password.length < 8) {
				throw new HttpError(400, "Password must be at least 8 characters long");
			}

			// Create the workspace
			const [newWorkspace] = await getAdminDb()
				.insert(workspaces)
				.values({
					slug: body.workspace,
					name: body.workspaceName,
				})
				.returning();

			// Hash the password
			const passwordHash = await bcrypt.hash(body.password, 10);

			// Create the admin user
			const [newUser] = await getAdminDb()
				.insert(users)
				.values({
					email: body.email,
					username: body.username,
					passwordHash,
				})
				.returning();

			// Link user to workspace
			await getAdminDb().insert(userWorkspaces).values({
				userId: newUser.id,
				workspaceId: newWorkspace.id,
			});

			// Create user object for token
			const user: __PROJECT_NAME_PASCAL__User = {
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
