import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const customEndpointRegistrationsTable = pgTable(
  "custom_endpoint_registrations",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    deploymentId: integer("deployment_id").notNull(),
    method: varchar("method", { length: 10 }).notNull(),
    path: varchar("path", { length: 255 }).notNull(),
  },
);
