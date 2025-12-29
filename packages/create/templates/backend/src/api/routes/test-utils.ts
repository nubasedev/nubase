import { createHttpHandler } from "@nubase/backend";
import { emptySchema, nu } from "@nubase/core";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import { getAdminDb } from "../../db/helpers/drizzle";
import { tickets } from "../../db/schema/ticket";
import { users } from "../../db/schema/user";
import { userWorkspaces } from "../../db/schema/user-workspace";
import { workspaces } from "../../db/schema/workspace";

// Default test workspace slug
const DEFAULT_TEST_WORKSPACE = "tavern";

/**
 * Helper to get workspace by slug using admin DB (bypasses RLS).
 * Used by test utilities that don't have auth context.
 */
async function getWorkspaceBySlug(slug: string) {
	const db = getAdminDb();
	const workspaceRows = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.slug, slug));

	if (workspaceRows.length === 0) {
		throw new Error(`Workspace not found: ${slug}`);
	}
	return workspaceRows[0];
}

// Clear all data from the database - used between tests
export const handleClearDatabase = createHttpHandler({
	endpoint: {
		method: "POST" as const,
		path: "/api/test/clear-database",
		requestParams: emptySchema,
		requestBody: nu.object({
			workspace: nu.string().optional(),
		}),
		responseBody: nu.object({
			success: nu.boolean(),
			message: nu.string(),
		}),
	},
	handler: async ({ body }) => {
		// Only allow in test environment
		if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "__TEST_PORT__") {
			throw new Error("Database cleanup is only allowed in test environment");
		}

		const workspaceSlug = body?.workspace || DEFAULT_TEST_WORKSPACE;
		const workspace = await getWorkspaceBySlug(workspaceSlug);
		const db = getAdminDb();

		// Clear ALL tickets (not just for this workspace) to avoid sequence conflicts
		await db.delete(tickets);

		// Reset the ID sequence to start from 1
		await db.execute(sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`);

		// Clear all user_workspaces associations (for all workspaces in test env)
		await db.delete(userWorkspaces);

		// Clear all users (in test env we start fresh each time)
		await db.delete(users);

		// Reset the users ID sequence
		await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);

		// Seed a default test user for this workspace
		const passwordHash = await bcrypt.hash("password123", 12);

		// Create the test user
		const [newUser] = await db
			.insert(users)
			.values({
				email: "admin@example.com",
				displayName: "Admin User",
				passwordHash,
			})
			.returning();

		// Link user to workspace
		await db.insert(userWorkspaces).values({
			userId: newUser.id,
			workspaceId: workspace.id,
		});

		return {
			success: true,
			message: `Database cleared and test user seeded for workspace ${workspace.slug}`,
		};
	},
});

// Seed test data - useful for specific test scenarios
export const handleSeedTestData = createHttpHandler({
	endpoint: {
		method: "POST" as const,
		path: "/api/test/seed",
		requestParams: emptySchema,
		requestBody: nu.object({
			workspace: nu.string().optional(),
			tickets: nu
				.array(
					nu.object({
						title: nu.string(),
						description: nu.string().optional(),
					}),
				)
				.optional(),
		}),
		responseBody: nu.object({
			success: nu.boolean(),
			message: nu.string(),
			data: nu
				.object({
					ticketIds: nu.array(nu.number()),
				})
				.optional(),
		}),
	},
	handler: async ({ body }) => {
		// Only allow in test environment
		if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "__TEST_PORT__") {
			throw new Error("Test seeding is only allowed in test environment");
		}

		const workspaceSlug = body?.workspace || DEFAULT_TEST_WORKSPACE;
		const workspace = await getWorkspaceBySlug(workspaceSlug);
		const db = getAdminDb();
		const insertedTicketIds: number[] = [];

		if (body?.tickets) {
			for (const ticket of body.tickets) {
				const result = await db
					.insert(tickets)
					.values({
						workspaceId: workspace.id,
						title: ticket.title,
						description: ticket.description,
					})
					.returning();

				if (result[0]) {
					insertedTicketIds.push(result[0].id);
				}
			}
		}

		return {
			success: true,
			message: `Test data seeded for workspace ${workspace.slug}`,
			data: {
				ticketIds: insertedTicketIds,
			},
		};
	},
});

// Get database statistics - useful for verifying test state
export const handleGetDatabaseStats = createHttpHandler({
	endpoint: {
		method: "GET" as const,
		path: "/api/test/stats",
		requestParams: nu.object({
			workspace: nu.string().optional(),
		}),
		requestBody: emptySchema,
		responseBody: nu.object({
			tickets: nu.object({
				count: nu.number(),
			}),
		}),
	},
	handler: async ({ params }) => {
		// Only allow in test environment
		if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "__TEST_PORT__") {
			throw new Error("Database stats are only available in test environment");
		}

		const workspaceSlug = params?.workspace || DEFAULT_TEST_WORKSPACE;
		const workspace = await getWorkspaceBySlug(workspaceSlug);
		const db = getAdminDb();
		const ticketRows = await db
			.select()
			.from(tickets)
			.where(eq(tickets.workspaceId, workspace.id));

		return {
			tickets: {
				count: ticketRows.length,
			},
		};
	},
});

// Ensure default workspace exists - called at the start of test runs
export const handleEnsureWorkspace = createHttpHandler({
	endpoint: {
		method: "POST" as const,
		path: "/api/test/ensure-workspace",
		requestParams: emptySchema,
		requestBody: nu.object({
			workspace: nu.string().optional(),
		}),
		responseBody: nu.object({
			success: nu.boolean(),
			workspace: nu.object({
				id: nu.number(),
				slug: nu.string(),
				name: nu.string(),
			}),
		}),
	},
	handler: async ({ body }) => {
		// Only allow in test environment
		if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "__TEST_PORT__") {
			throw new Error(
				"Workspace management is only allowed in test environment",
			);
		}

		const workspaceSlug = body?.workspace || DEFAULT_TEST_WORKSPACE;
		const db = getAdminDb();

		// Check if workspace exists
		const existingWorkspaces = await db
			.select()
			.from(workspaces)
			.where(eq(workspaces.slug, workspaceSlug));

		if (existingWorkspaces.length > 0) {
			return {
				success: true,
				workspace: {
					id: existingWorkspaces[0].id,
					slug: existingWorkspaces[0].slug,
					name: existingWorkspaces[0].name,
				},
			};
		}

		// Create the workspace
		const result = await db
			.insert(workspaces)
			.values({
				slug: workspaceSlug,
				name: workspaceSlug.charAt(0).toUpperCase() + workspaceSlug.slice(1),
			})
			.returning();

		if (result.length === 0) {
			throw new Error("Failed to create workspace");
		}

		return {
			success: true,
			workspace: {
				id: result[0].id,
				slug: result[0].slug,
				name: result[0].name,
			},
		};
	},
});

/**
 * Seed a user with multiple workspaces - for testing workspace selection flow
 */
export const handleSeedMultiWorkspaceUser = createHttpHandler({
	endpoint: {
		method: "POST" as const,
		path: "/api/test/seed-multi-workspace-user",
		requestParams: emptySchema,
		requestBody: nu.object({
			email: nu.string(),
			password: nu.string(),
			displayName: nu.string(),
			workspaces: nu.array(
				nu.object({
					slug: nu.string(),
					name: nu.string(),
				}),
			),
		}),
		responseBody: nu.object({
			success: nu.boolean(),
			message: nu.string(),
			workspaces: nu.array(
				nu.object({
					id: nu.number(),
					slug: nu.string(),
					name: nu.string(),
				}),
			),
		}),
	},
	handler: async ({ body }) => {
		// Only allow in test environment
		if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "__TEST_PORT__") {
			throw new Error(
				"Multi-workspace user seeding is only allowed in test environment",
			);
		}

		const db = getAdminDb();
		const createdWorkspaces: { id: number; slug: string; name: string }[] = [];
		const passwordHash = await bcrypt.hash(body.password, 12);

		// Check if user already exists
		let userId: number;
		const existingUsers = await db
			.select()
			.from(users)
			.where(eq(users.email, body.email));

		if (existingUsers.length > 0) {
			userId = existingUsers[0].id;
		} else {
			// Create user (root-level, no workspace)
			const [newUser] = await db
				.insert(users)
				.values({
					email: body.email,
					displayName: body.displayName,
					passwordHash,
				})
				.returning();
			userId = newUser.id;
		}

		for (const workspaceData of body.workspaces) {
			// Check if workspace exists
			let workspace = await db
				.select()
				.from(workspaces)
				.where(eq(workspaces.slug, workspaceData.slug))
				.then((rows) => rows[0]);

			// Create workspace if it doesn't exist
			if (!workspace) {
				const result = await db
					.insert(workspaces)
					.values({
						slug: workspaceData.slug,
						name: workspaceData.name,
					})
					.returning();
				workspace = result[0];
			}

			// Check if user already has access to this workspace
			const existingAccess = await db
				.select()
				.from(userWorkspaces)
				.where(eq(userWorkspaces.userId, userId))
				.then((rows) => rows.find((uw) => uw.workspaceId === workspace.id));

			// Link user to workspace if not already linked
			if (!existingAccess) {
				await db.insert(userWorkspaces).values({
					userId,
					workspaceId: workspace.id,
				});
			}

			createdWorkspaces.push({
				id: workspace.id,
				slug: workspace.slug,
				name: workspace.name,
			});
		}

		return {
			success: true,
			message: `User ${body.email} seeded in ${createdWorkspaces.length} workspaces`,
			workspaces: createdWorkspaces,
		};
	},
});

// Export test utils handlers object
export const testUtilsHandlers = {
	clearDatabase: handleClearDatabase,
	ensureWorkspace: handleEnsureWorkspace,
	seedTestData: handleSeedTestData,
	getDatabaseStats: handleGetDatabaseStats,
	seedMultiWorkspaceUser: handleSeedMultiWorkspaceUser,
};
