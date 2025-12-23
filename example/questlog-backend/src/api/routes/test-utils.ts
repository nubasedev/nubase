import { createHttpHandler } from "@nubase/backend";
import { emptySchema, nu } from "@nubase/core";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../../db/helpers/drizzle";
import { tenantsTable } from "../../db/schema/tenant";
import { ticketsTable } from "../../db/schema/ticket";
import { usersTable } from "../../db/schema/user";
import type { Tenant } from "../../middleware/tenant-middleware";

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
  handler: async ({ ctx }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Database cleanup is only allowed in test environment");
    }

    const db = getDb();
    const tenant = ctx.get("tenant") as Tenant;

    // Clear all tickets for this tenant
    await db.delete(ticketsTable).where(eq(ticketsTable.tenantId, tenant.id));

    // Reset the ID sequence to start from 1
    await db.execute(sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`);

    // Clear all users for this tenant
    await db.delete(usersTable).where(eq(usersTable.tenantId, tenant.id));

    // Reset the users ID sequence
    await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);

    // Seed a default test user for this tenant
    const passwordHash = await bcrypt.hash("password123", 12);
    await db.insert(usersTable).values({
      tenantId: tenant.id,
      email: "testuser@example.com",
      username: "testuser",
      passwordHash,
    });

    return {
      success: true,
      message: `Database cleared and test user seeded for tenant ${tenant.slug}`,
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
  handler: async ({ body, ctx }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Test seeding is only allowed in test environment");
    }

    const db = getDb();
    const tenant = ctx.get("tenant") as Tenant;
    const insertedTicketIds: number[] = [];

    if (body?.tickets) {
      for (const ticket of body.tickets) {
        const result = await db
          .insert(ticketsTable)
          .values({
            tenantId: tenant.id,
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
      message: `Test data seeded for tenant ${tenant.slug}`,
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
  handler: async ({ ctx }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Database stats are only available in test environment");
    }

    const db = getDb();
    const tenant = ctx.get("tenant") as Tenant;
    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.tenantId, tenant.id));

    return {
      tickets: {
        count: tickets.length,
      },
    };
  },
});

// Ensure default tenant exists - called at the start of test runs
export const handleEnsureTenant = createHttpHandler({
  endpoint: {
    method: "POST" as const,
    path: "/api/test/ensure-tenant",
    requestParams: emptySchema,
    requestBody: emptySchema,
    responseBody: nu.object({
      success: nu.boolean(),
      tenant: nu.object({
        id: nu.number(),
        slug: nu.string(),
        name: nu.string(),
      }),
    }),
  },
  handler: async ({ ctx }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Tenant management is only allowed in test environment");
    }

    // Get the tenant slug from the subdomain (already extracted by tenant middleware)
    // For test setup, we need to create the tenant if it doesn't exist
    const host = ctx.req.header("Host") || "";
    const subdomain = host.split(":")[0].split(".")[0];

    if (!subdomain) {
      throw new Error("No subdomain provided");
    }

    const db = getDb();

    // Check if tenant exists
    const existingTenants = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, subdomain));

    if (existingTenants.length > 0) {
      return {
        success: true,
        tenant: {
          id: existingTenants[0].id,
          slug: existingTenants[0].slug,
          name: existingTenants[0].name,
        },
      };
    }

    // Create the tenant
    const result = await db
      .insert(tenantsTable)
      .values({
        slug: subdomain,
        name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
      })
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to create tenant");
    }

    return {
      success: true,
      tenant: {
        id: result[0].id,
        slug: result[0].slug,
        name: result[0].name,
      },
    };
  },
});

// Export test utils router
testUtils.post("/api/test/clear-database", handleClearDatabase);
testUtils.post("/api/test/seed", handleSeedTestData);
testUtils.get("/api/test/stats", handleGetDatabaseStats);
testUtils.post("/api/test/ensure-tenant", handleEnsureTenant);

export { testUtils };
