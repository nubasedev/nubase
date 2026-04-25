import { HttpError } from "@nubase/backend";
import { getDb } from "../../db/helpers/kysely";
import { createHandler } from "../handler-factory";

export const userHandlers = {
  /** Get all users with optional filters. */
  getUsers: createHandler((e) => e.getUsers, {
    handler: async ({ params }) => {
      const db = getDb();

      let query = db
        .selectFrom("users")
        .select(["users.id", "users.email", "users.displayName"]);

      // Global text search - OR across searchable text fields
      if (params.q) {
        const searchTerm = `%${params.q}%`;
        query = query.where((eb) =>
          eb.or([
            eb("users.displayName", "ilike", searchTerm),
            eb("users.email", "ilike", searchTerm),
          ]),
        );
      }

      // Filter by displayName (case-insensitive partial match)
      if (params.displayName) {
        query = query.where(
          "users.displayName",
          "ilike",
          `%${params.displayName}%`,
        );
      }

      // Filter by email (case-insensitive partial match)
      if (params.email) {
        query = query.where("users.email", "ilike", `%${params.email}%`);
      }

      const results = await query.execute();

      return results.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
      }));
    },
  }),

  /** Get a single user by ID. */
  getUser: createHandler((e) => e.getUser, {
    handler: async ({ params }) => {
      const db = getDb();
      const user = await db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", params.id)
        .executeTakeFirst();

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
  postUser: createHandler((e) => e.postUser, {
    handler: async ({ body }) => {
      const db = getDb();

      // Check if user with this email already exists
      const existing = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", body.email)
        .executeTakeFirst();

      if (existing) {
        throw new HttpError(409, "User with this email already exists");
      }

      const user = await db
        .insertInto("users")
        .values({
          email: body.email,
          displayName: body.displayName,
          passwordHash: "placeholder-requires-password-reset",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      };
    },
  }),

  /** Update a user by ID. */
  patchUser: createHandler((e) => e.patchUser, {
    handler: async ({ params, body }) => {
      const db = getDb();

      const updateData: Record<string, unknown> = {};
      if (body.email !== undefined) {
        updateData.email = body.email;
      }
      if (body.displayName !== undefined) {
        updateData.displayName = body.displayName;
      }

      const user = await db
        .updateTable("users")
        .set(updateData)
        .where("id", "=", params.id)
        .returningAll()
        .executeTakeFirst();

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
  deleteUser: createHandler((e) => e.deleteUser, {
    handler: async ({ params }) => {
      const db = getDb();

      const deleted = await db
        .deleteFrom("users")
        .where("id", "=", params.id)
        .returningAll()
        .executeTakeFirst();

      if (!deleted) {
        throw new HttpError(404, "User not found");
      }

      return { success: true };
    },
  }),

  /** Lookup users for select/autocomplete fields. */
  lookupUsers: createHandler((e) => e.lookupUsers, {
    handler: async ({ params }) => {
      const db = getDb();

      let query = db
        .selectFrom("users")
        .select(["users.id", "users.displayName", "users.email"]);

      // Filter by query if provided (case-insensitive partial match on displayName)
      if (params.q) {
        query = query.where("users.displayName", "ilike", `%${params.q}%`);
      }

      const results = await query.limit(20).execute();

      // Transform to Lookup format
      return results.map((u) => ({
        id: u.id,
        title: u.displayName,
        subtitle: u.email,
      }));
    },
  }),
};
