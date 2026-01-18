import { createHttpHandler, HttpError } from "@nubase/backend";
import type { SQL } from "drizzle-orm";
import { and, eq, ilike } from "drizzle-orm";
import { apiEndpoints } from "schema";
import { getDb } from "../../db/helpers/drizzle";
import { users } from "../../db/schema";

export const userHandlers = {
	/** Get all users with optional filters. */
	getUsers: createHttpHandler({
		endpoint: apiEndpoints.getUsers,
		handler: async ({ params }) => {
			const db = getDb();

			// Build filter conditions
			const conditions: SQL[] = [];

			// Filter by displayName (case-insensitive partial match)
			if (params.displayName) {
				conditions.push(ilike(users.displayName, `%${params.displayName}%`));
			}

			// Filter by email (case-insensitive partial match)
			if (params.email) {
				conditions.push(ilike(users.email, `%${params.email}%`));
			}

			const query =
				conditions.length > 0
					? db.select().from(users).where(and(...conditions))
					: db.select().from(users);

			const results = await query;

			return results.map((u) => ({
				id: u.id,
				email: u.email,
				displayName: u.displayName,
			}));
		},
	}),

	/** Get a single user by ID. */
	getUser: createHttpHandler({
		endpoint: apiEndpoints.getUser,
		handler: async ({ params }) => {
			const db = getDb();
			const [user] = await db.select().from(users).where(eq(users.id, params.id));

			if (!user) {
				throw new HttpError(404, "User not found");
			}

			return {
				id: user.id,
				email: user.email,
				displayName: user.displayName,
			};
		},
	}),

	/** Create a new user. */
	postUser: createHttpHandler({
		endpoint: apiEndpoints.postUser,
		handler: async ({ body }) => {
			const db = getDb();

			// Check if user with this email already exists
			const [existing] = await db.select().from(users).where(eq(users.email, body.email));

			if (existing) {
				throw new HttpError(409, "User with this email already exists");
			}

			const [user] = await db
				.insert(users)
				.values({
					email: body.email,
					displayName: body.displayName,
					passwordHash: "placeholder-requires-password-reset",
				})
				.returning();

			if (!user) {
				throw new HttpError(500, "Failed to create user");
			}

			return {
				id: user.id,
				email: user.email,
				displayName: user.displayName,
			};
		},
	}),

	/** Update a user by ID. */
	patchUser: createHttpHandler({
		endpoint: apiEndpoints.patchUser,
		handler: async ({ params, body }) => {
			const db = getDb();

			const updateData: { email?: string; displayName?: string } = {};
			if (body.email !== undefined) {
				updateData.email = body.email;
			}
			if (body.displayName !== undefined) {
				updateData.displayName = body.displayName;
			}

			const [user] = await db
				.update(users)
				.set(updateData)
				.where(eq(users.id, params.id))
				.returning();

			if (!user) {
				throw new HttpError(404, "User not found");
			}

			return {
				id: user.id,
				email: user.email,
				displayName: user.displayName,
			};
		},
	}),

	/** Delete a user by ID. */
	deleteUser: createHttpHandler({
		endpoint: apiEndpoints.deleteUser,
		handler: async ({ params }) => {
			const db = getDb();

			const [deleted] = await db.delete(users).where(eq(users.id, params.id)).returning();

			if (!deleted) {
				throw new HttpError(404, "User not found");
			}

			return { success: true };
		},
	}),

	/** Lookup users for select/autocomplete fields. */
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
