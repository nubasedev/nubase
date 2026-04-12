import { createHttpHandler } from "@nubase/backend";
import { emptySchema, nu } from "@nubase/core";
import bcrypt from "bcryptjs";
import { sql } from "kysely";
import { getDb } from "../../db/helpers/kysely";

// Default test workspace slug
const DEFAULT_TEST_WORKSPACE = "tavern";

/**
 * Helper to get workspace by slug.
 * Used by test utilities that don't have auth context.
 */
async function getWorkspaceBySlug(slug: string) {
	const db = getDb();
	const workspace = await db
		.selectFrom("workspaces")
		.selectAll()
		.where("slug", "=", slug)
		.executeTakeFirst();

	if (!workspace) {
		throw new Error(`Workspace not found: ${slug}`);
	}
	return workspace;
}

// Clear all data from the database - used between tests
export const handleClearDatabase = createHttpHandler({
	endpoint: {
		method: "POST" as const,
		path: "/test/clear-database",
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
		const db = getDb();

		// Clear ALL tickets (not just for this workspace) to avoid sequence conflicts
		await db.deleteFrom("tickets").execute();

		// Reset the ID sequence to start from 1
		await sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`.execute(db);

		// Clear all user_workspaces associations (for all workspaces in test env)
		await db.deleteFrom("userWorkspaces").execute();

		// Clear all users (in test env we start fresh each time)
		await db.deleteFrom("users").execute();

		// Reset the users ID sequence
		await sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`.execute(db);

		// Seed a default test user for this workspace
		const passwordHash = await bcrypt.hash("password123", 12);

		// Create the test user
		const newUser = await db
			.insertInto("users")
			.values({
				email: "admin@example.com",
				displayName: "Admin User",
				passwordHash,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		// Link user to workspace
		await db
			.insertInto("userWorkspaces")
			.values({
				userId: newUser.id,
				workspaceId: workspace.id,
			})
			.execute();

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
		path: "/test/seed",
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
		const db = getDb();
		const insertedTicketIds: number[] = [];

		if (body?.tickets) {
			for (const ticket of body.tickets) {
				const result = await db
					.insertInto("tickets")
					.values({
						workspaceId: workspace.id,
						title: ticket.title,
						description: ticket.description,
					})
					.returningAll()
					.executeTakeFirstOrThrow();

				insertedTicketIds.push(result.id);
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
		path: "/test/stats",
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
		const db = getDb();
		const ticketRows = await db
			.selectFrom("tickets")
			.selectAll()
			.where("workspaceId", "=", workspace.id)
			.execute();

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
		path: "/test/ensure-workspace",
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
		const db = getDb();

		// Check if workspace exists
		const existing = await db
			.selectFrom("workspaces")
			.selectAll()
			.where("slug", "=", workspaceSlug)
			.executeTakeFirst();

		if (existing) {
			return {
				success: true,
				workspace: {
					id: existing.id,
					slug: existing.slug,
					name: existing.name,
				},
			};
		}

		// Create the workspace
		const created = await db
			.insertInto("workspaces")
			.values({
				slug: workspaceSlug,
				name: workspaceSlug.charAt(0).toUpperCase() + workspaceSlug.slice(1),
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return {
			success: true,
			workspace: {
				id: created.id,
				slug: created.slug,
				name: created.name,
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
		path: "/test/seed-multi-workspace-user",
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

		const db = getDb();
		const createdWorkspaces: { id: number; slug: string; name: string }[] = [];
		const passwordHash = await bcrypt.hash(body.password, 12);

		// Check if user already exists
		let userId: number;
		const existingUser = await db
			.selectFrom("users")
			.selectAll()
			.where("email", "=", body.email)
			.executeTakeFirst();

		if (existingUser) {
			userId = existingUser.id;
		} else {
			// Create user (root-level, no workspace)
			const newUser = await db
				.insertInto("users")
				.values({
					email: body.email,
					displayName: body.displayName,
					passwordHash,
				})
				.returningAll()
				.executeTakeFirstOrThrow();
			userId = newUser.id;
		}

		for (const workspaceData of body.workspaces) {
			// Check if workspace exists
			let workspace = await db
				.selectFrom("workspaces")
				.selectAll()
				.where("slug", "=", workspaceData.slug)
				.executeTakeFirst();

			// Create workspace if it doesn't exist
			if (!workspace) {
				workspace = await db
					.insertInto("workspaces")
					.values({
						slug: workspaceData.slug,
						name: workspaceData.name,
					})
					.returningAll()
					.executeTakeFirstOrThrow();
			}

			// Check if user already has access to this workspace
			const existingAccess = await db
				.selectFrom("userWorkspaces")
				.selectAll()
				.where("userId", "=", userId)
				.where("workspaceId", "=", workspace.id)
				.executeTakeFirst();

			// Link user to workspace if not already linked
			if (!existingAccess) {
				await db
					.insertInto("userWorkspaces")
					.values({
						userId,
						workspaceId: workspace.id,
					})
					.execute();
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
