import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const entityMetadataTable = pgTable("entity_metadata", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  tableName: varchar("table_name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  metadata: jsonb("metadata").notNull().default({}),
});
