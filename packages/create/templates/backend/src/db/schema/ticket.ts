import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { workspaces } from "./workspace";

export const tickets = pgTable("tickets", {
	id: serial("id").primaryKey(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
