import { CamelCasePlugin, Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import type { DB } from "../db-types";

declare global {
	var db: Kysely<DB> | undefined;
}

/**
 * Get the database connection.
 */
export function getDb(): Kysely<DB> {
	if (!global.db) {
		if (!process.env.DATABASE_URL) {
			throw new Error(
				"DATABASE_URL is not defined in the environment variables.",
			);
		}
		global.db = new Kysely<DB>({
			dialect: new PostgresDialect({
				pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
			}),
			plugins: [new CamelCasePlugin()],
		});
	}

	return global.db;
}

/**
 * Set the current workspace context for Row Level Security (RLS).
 * This must be called before any database operations that involve
 * workspace-scoped tables (tickets, user_workspaces).
 */
export async function setWorkspaceContext(workspaceId: number) {
	const db = getDb();
	await sql`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, false)`.execute(
		db,
	);
}

/**
 * Clear the workspace context. Call this after completing workspace-scoped operations
 * to prevent context leakage between requests.
 */
export async function clearWorkspaceContext() {
	const db = getDb();
	await sql`RESET app.current_workspace_id`.execute(db);
}
