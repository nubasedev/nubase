import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
export const ticketsTable = pgTable("tickets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
});
