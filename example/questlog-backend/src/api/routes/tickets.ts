import type { Context } from "hono";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/tickets";

export const postTickets = async (c: Context) => {
  const input = await c.req.json();
  console.log("Received ticket data:", input);
  const ticket = input as typeof ticketsTable.$inferInsert;
  const db = getDb();
  const result = await db.insert(ticketsTable).values(ticket);
  return c.json(result, 201);
};

export const getTickets = async (c: Context) => {
  const db = getDb();
  const tickets = await db.select().from(ticketsTable);
  console.log("Fetched tickets:", tickets);
  return c.json(tickets, 200);
};
