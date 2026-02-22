import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  assigneeId: integer("assignee_id"),
});
