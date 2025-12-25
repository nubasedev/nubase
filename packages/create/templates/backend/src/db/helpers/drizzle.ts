import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../schema";

const { Pool } = pg;

// Main app pool (uses RLS-restricted user)
const appPool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// Admin pool (bypasses RLS for setup operations)
const adminPool = new Pool({
	connectionString: process.env.DATABASE_URL_ADMIN,
});

export const db = drizzle(appPool, { schema });
export const adminDb = drizzle(adminPool, { schema });

// Set workspace context for RLS
export async function withWorkspaceContext<T>(
	workspaceId: number,
	fn: () => Promise<T>,
): Promise<T> {
	const client = await appPool.connect();
	try {
		await client.query(`SET app.current_workspace_id = '${workspaceId}'`);
		const result = await fn();
		return result;
	} finally {
		await client.query("RESET app.current_workspace_id");
		client.release();
	}
}
