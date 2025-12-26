import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var db: NodePgDatabase | undefined;
	// eslint-disable-next-line no-var
	var dbAdmin: NodePgDatabase | undefined;
}

/**
 * Get the application database connection.
 * This connection is subject to Row Level Security policies.
 */
export function getDb() {
	if (!global.db) {
		if (!process.env.DATABASE_URL) {
			throw new Error(
				"DATABASE_URL is not defined in the environment variables.",
			);
		}
		const databaseUrl = process.env.DATABASE_URL;
		const client = new Client({ connectionString: databaseUrl });
		client.connect().catch((err) => {
			console.error("Failed to connect to database:", err);
			throw err;
		});
		global.db = drizzle(client);
	}

	return global.db;
}

/**
 * Get the admin database connection.
 * This connection bypasses Row Level Security - use for migrations and seeding only.
 */
export function getAdminDb() {
	if (!global.dbAdmin) {
		const databaseUrl =
			process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL;
		if (!databaseUrl) {
			throw new Error(
				"DATABASE_URL_ADMIN or DATABASE_URL is not defined in the environment variables.",
			);
		}
		const client = new Client({ connectionString: databaseUrl });
		client.connect().catch((err) => {
			console.error("Failed to connect to admin database:", err);
			throw err;
		});
		global.dbAdmin = drizzle(client);
	}

	return global.dbAdmin;
}

/**
 * Set the current workspace context for Row Level Security (RLS).
 * This must be called before any database operations that involve
 * workspace-scoped tables (tickets, user_workspaces).
 */
export async function setWorkspaceContext(workspaceId: number) {
	const db = getDb();
	// Use sql.raw for the value since SET doesn't support parameterized queries
	await db.execute(
		sql`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, false)`,
	);
}

/**
 * Clear the workspace context. Call this after completing workspace-scoped operations
 * to prevent context leakage between requests.
 */
export async function clearWorkspaceContext() {
	const db = getDb();
	await db.execute(sql`RESET app.current_workspace_id`);
}
