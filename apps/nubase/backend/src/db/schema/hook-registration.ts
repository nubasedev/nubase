import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const hookRegistrationsTable = pgTable("hook_registrations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  deploymentId: integer("deployment_id").notNull(),
  hookKey: varchar("hook_key", { length: 255 }).notNull(),
  entityName: varchar("entity_name", { length: 100 }).notNull(),
  hookType: varchar("hook_type", { length: 50 }).notNull(),
});
