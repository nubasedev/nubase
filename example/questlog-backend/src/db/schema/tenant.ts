import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
