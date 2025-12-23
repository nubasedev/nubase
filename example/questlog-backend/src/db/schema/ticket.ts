import { sql } from "drizzle-orm";
import {
  integer,
  pgPolicy,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenant";

export const ticketsTable = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenantsTable.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
  },
  (table) => [
    // RLS policy for multi-tenant isolation
    // Only allow access to rows where tenant_id matches the current session's tenant
    pgPolicy("tickets_tenant_isolation", {
      as: "permissive",
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id', true)::integer`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id', true)::integer`,
    }),
  ],
);
