import { createHttpHandler } from "@nubase/backend";
import { ilike } from "drizzle-orm";
import { apiEndpoints } from "schema";
import { getDb } from "../../db/helpers/drizzle";
import { users } from "../../db/schema";

export const userHandlers = {
	lookupUsers: createHttpHandler({
		endpoint: apiEndpoints.lookupUsers,
		handler: async ({ params }) => {
			const db = getDb();

			// Build query with optional search filter
			let query = db
				.select({
					id: users.id,
					displayName: users.displayName,
					email: users.email,
				})
				.from(users);

			// Filter by query if provided (case-insensitive partial match on displayName)
			if (params.q) {
				query = query.where(ilike(users.displayName, `%${params.q}%`));
			}

			const results = await query.limit(20);

			// Transform to Lookup format
			return results.map((u) => ({
				id: u.id,
				title: u.displayName,
				subtitle: u.email,
			}));
		},
	}),
};
