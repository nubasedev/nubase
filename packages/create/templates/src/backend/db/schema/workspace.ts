import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
	id: serial("id").primaryKey(),
	slug: varchar("slug", { length: 100 }).unique().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
