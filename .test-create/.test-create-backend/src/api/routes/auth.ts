import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { .testCreateAuthController } from "../../auth";
import { adminDb, db } from "../../db/helpers/drizzle";
import { userWorkspaces, users, workspaces } from "../../db/schema";

const authController = new .testCreateAuthController();

export const authHandlers = {
	async loginStart(c: Context) {
		const { email, password } = await c.req.json();

		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (!user) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		// Get user's workspaces
		const userWs = await db
			.select({
				id: workspaces.id,
				slug: workspaces.slug,
				name: workspaces.name,
			})
			.from(userWorkspaces)
			.innerJoin(workspaces, eq(userWorkspaces.workspaceId, workspaces.id))
			.where(eq(userWorkspaces.userId, user.id));

		return c.json({ workspaces: userWs });
	},

	async loginComplete(c: Context) {
		const { email, password, workspaceId } = await c.req.json();

		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (!user) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const [workspace] = await db
			.select()
			.from(workspaces)
			.where(eq(workspaces.id, workspaceId));

		if (!workspace) {
			return c.json({ error: "Workspace not found" }, 404);
		}

		const token = authController.generateToken({
			userId: user.id,
			workspaceId: workspace.id,
			email: user.email,
		});

		return c.json({
			token,
			user: { id: user.id, email: user.email, username: user.username },
			workspace: { id: workspace.id, slug: workspace.slug, name: workspace.name },
		});
	},

	async login(c: Context) {
		const { email, password } = await c.req.json();

		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (!user) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		// Get first workspace for simple login
		const [userWs] = await db
			.select({
				id: workspaces.id,
				slug: workspaces.slug,
				name: workspaces.name,
			})
			.from(userWorkspaces)
			.innerJoin(workspaces, eq(userWorkspaces.workspaceId, workspaces.id))
			.where(eq(userWorkspaces.userId, user.id));

		if (!userWs) {
			return c.json({ error: "No workspace found" }, 404);
		}

		const token = authController.generateToken({
			userId: user.id,
			workspaceId: userWs.id,
			email: user.email,
		});

		return c.json({
			token,
			user: { id: user.id, email: user.email, username: user.username },
			workspace: userWs,
		});
	},

	async logout(c: Context) {
		// Client-side token removal
		return c.json({ success: true });
	},

	async getMe(c: Context) {
		const authHeader = c.req.header("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const token = authHeader.slice(7);
		const payload = authController.verifyToken(token);

		if (!payload) {
			return c.json({ error: "Invalid token" }, 401);
		}

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.userId));

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const [workspace] = await db
			.select()
			.from(workspaces)
			.where(eq(workspaces.id, payload.workspaceId));

		return c.json({
			user: { id: user.id, email: user.email, username: user.username },
			workspace: workspace
				? { id: workspace.id, slug: workspace.slug, name: workspace.name }
				: null,
		});
	},

	async signup(c: Context) {
		const { email, username, password, workspaceName } = await c.req.json();

		// Check if user exists
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, email));

		if (existingUser) {
			return c.json({ error: "Email already registered" }, 400);
		}

		// Create user
		const passwordHash = await bcrypt.hash(password, 10);
		const [user] = await adminDb
			.insert(users)
			.values({ email, username, passwordHash })
			.returning();

		// Create or get workspace
		const wsSlug = workspaceName?.toLowerCase().replace(/\s+/g, "-") || "default";
		let [workspace] = await db
			.select()
			.from(workspaces)
			.where(eq(workspaces.slug, wsSlug));

		if (!workspace) {
			[workspace] = await adminDb
				.insert(workspaces)
				.values({ slug: wsSlug, name: workspaceName || "Default Workspace" })
				.returning();
		}

		// Link user to workspace
		await adminDb.insert(userWorkspaces).values({
			userId: user.id,
			workspaceId: workspace.id,
		});

		const token = authController.generateToken({
			userId: user.id,
			workspaceId: workspace.id,
			email: user.email,
		});

		return c.json({
			token,
			user: { id: user.id, email: user.email, username: user.username },
			workspace: { id: workspace.id, slug: workspace.slug, name: workspace.name },
		});
	},
};
