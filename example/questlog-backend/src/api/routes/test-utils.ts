import { createHttpHandler } from "@nubase/backend";
import { emptySchema, nu } from "@nubase/core";
import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../../db/helpers/drizzle";
import { ticketsTable } from "../../db/schema/ticket";

// Test utility endpoints - only enabled in test environment
const testUtils = new Hono();

// Clear all data from the database - used between tests
export const handleClearDatabase = createHttpHandler({
  endpoint: {
    method: "POST" as const,
    path: "/api/test/clear-database",
    requestParams: emptySchema,
    requestBody: emptySchema,
    responseBody: nu.object({
      success: nu.boolean(),
      message: nu.string(),
    }),
  },
  handler: async () => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Database cleanup is only allowed in test environment");
    }

    const db = getDb();

    // Clear all tickets
    await db.delete(ticketsTable);

    // Reset the ID sequence to start from 1
    await db.execute(sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`);

    return {
      success: true,
      message: "Database cleared successfully",
    };
  },
});

// Seed test data - useful for specific test scenarios
export const handleSeedTestData = createHttpHandler({
  endpoint: {
    method: "POST" as const,
    path: "/api/test/seed",
    requestParams: emptySchema,
    requestBody: nu.object({
      tickets: nu
        .array(
          nu.object({
            title: nu.string(),
            description: nu.string().optional(),
          }),
        )
        .optional(),
    }),
    responseBody: nu.object({
      success: nu.boolean(),
      message: nu.string(),
      data: nu
        .object({
          ticketIds: nu.array(nu.number()),
        })
        .optional(),
    }),
  },
  handler: async ({ body }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Test seeding is only allowed in test environment");
    }

    const db = getDb();
    const insertedTicketIds: number[] = [];

    if (body?.tickets) {
      for (const ticket of body.tickets) {
        const result = await db
          .insert(ticketsTable)
          .values({
            title: ticket.title,
            description: ticket.description,
          })
          .returning();

        if (result[0]) {
          insertedTicketIds.push(result[0].id);
        }
      }
    }

    return {
      success: true,
      message: "Test data seeded successfully",
      data: {
        ticketIds: insertedTicketIds,
      },
    };
  },
});

// Get database statistics - useful for verifying test state
export const handleGetDatabaseStats = createHttpHandler({
  endpoint: {
    method: "GET" as const,
    path: "/api/test/stats",
    requestParams: emptySchema,
    requestBody: emptySchema,
    responseBody: nu.object({
      tickets: nu.object({
        count: nu.number(),
      }),
    }),
  },
  handler: async () => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Database stats are only available in test environment");
    }

    const db = getDb();
    const tickets = await db.select().from(ticketsTable);

    return {
      tickets: {
        count: tickets.length,
      },
    };
  },
});

// Export test utils router
testUtils.post("/api/test/clear-database", handleClearDatabase);
testUtils.post("/api/test/seed", handleSeedTestData);
testUtils.get("/api/test/stats", handleGetDatabaseStats);

export { testUtils };
