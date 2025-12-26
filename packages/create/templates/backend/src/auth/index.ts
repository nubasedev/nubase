import type {
	BackendAuthController,
	BackendUser,
	TokenPayload,
	VerifyTokenResult,
} from "@nubase/backend";
import { getCookie } from "@nubase/backend";
import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import jwt from "jsonwebtoken";
import { getAdminDb } from "../db/helpers/drizzle";
import { users, userWorkspaces } from "../db/schema";

/**
 * User type for __PROJECT_NAME_PASCAL__ application.
 */
export interface __PROJECT_NAME_PASCAL__User extends BackendUser {
	id: number;
	email: string;
	username: string;
	workspaceId: number;
}

/**
 * Token payload for __PROJECT_NAME_PASCAL__ JWTs.
 */
export interface __PROJECT_NAME_PASCAL__TokenPayload extends TokenPayload {
	userId: number;
	username: string;
	workspaceId: number;
}

// Configuration
const JWT_SECRET =
	process.env.JWT_SECRET || "nubase-dev-secret-change-in-production";
const JWT_EXPIRY = "1h";
const COOKIE_NAME = "nubase_auth";

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
		return getCookie(cookieHeader, COOKIE_NAME);
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
				JWT_SECRET,
			) as __PROJECT_NAME_PASCAL__TokenPayload;

			// Fetch user from database to ensure they still exist
			const [dbUser] = await getAdminDb()
				.select()
				.from(users)
				.where(eq(users.id, decoded.userId));

			if (!dbUser) {
				return { valid: false, error: "User not found" };
			}

			// Verify user still has access to the workspace in the token
			const [access] = await getAdminDb()
				.select()
				.from(userWorkspaces)
				.where(
					and(
						eq(userWorkspaces.userId, decoded.userId),
						eq(userWorkspaces.workspaceId, decoded.workspaceId),
					),
				);

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
					username: dbUser.username,
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
			username: user.username,
			workspaceId: user.workspaceId,
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
	 */
	async validateCredentials(
		username: string,
		password: string,
		workspaceId?: number,
	): Promise<__PROJECT_NAME_PASCAL__User | null> {
		if (workspaceId === undefined) {
			throw new Error(
				"workspaceId is required for multi-workspace authentication",
			);
		}

		// Find user by username
		const [dbUser] = await getAdminDb()
			.select()
			.from(users)
			.where(eq(users.username, username));

		if (!dbUser) {
			return null;
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);
		if (!isValidPassword) {
			return null;
		}

		// Check if user has access to the workspace
		const [access] = await getAdminDb()
			.select()
			.from(userWorkspaces)
			.where(
				and(
					eq(userWorkspaces.userId, dbUser.id),
					eq(userWorkspaces.workspaceId, workspaceId),
				),
			);

		if (!access) {
			return null;
		}

		return {
			id: dbUser.id,
			email: dbUser.email,
			username: dbUser.username,
			workspaceId: workspaceId,
		};
	}
}

/**
 * Singleton instance of the auth controller.
 */
export const __PROJECT_NAME_CAMEL__AuthController =
	new __PROJECT_NAME_PASCAL__AuthController();
