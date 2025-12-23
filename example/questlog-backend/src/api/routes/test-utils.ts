import { createHttpHandler } from "@nubase/backend";
import { emptySchema, nu } from "@nubase/core";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getAdminDb } from "../../db/helpers/drizzle";
import { tenantsTable } from "../../db/schema/tenant";
import { ticketsTable } from "../../db/schema/ticket";
import { usersTable } from "../../db/schema/user";
import { userTenantsTable } from "../../db/schema/user-tenant";

// Default test tenant slug
const DEFAULT_TEST_TENANT = "tavern";

// Test utility endpoints - only enabled in test environment
const testUtils = new Hono();

/**
 * Helper to get tenant by slug using admin DB (bypasses RLS).
 * Used by test utilities that don't have auth context.
 */
async function getTenantBySlug(slug: string) {
  const db = getAdminDb();
  const tenants = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.slug, slug));

  if (tenants.length === 0) {
    throw new Error(`Tenant not found: ${slug}`);
  }
  return tenants[0];
}

// Clear all data from the database - used between tests
export const handleClearDatabase = createHttpHandler({
  endpoint: {
    method: "POST" as const,
    path: "/api/test/clear-database",
    requestParams: emptySchema,
    requestBody: nu.object({
      tenant: nu.string().optional(),
    }),
    responseBody: nu.object({
      success: nu.boolean(),
      message: nu.string(),
    }),
  },
  handler: async ({ body }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Database cleanup is only allowed in test environment");
    }

    const tenantSlug = body?.tenant || DEFAULT_TEST_TENANT;
    const tenant = await getTenantBySlug(tenantSlug);
    const db = getAdminDb();

    // Clear all tickets for this tenant
    await db.delete(ticketsTable).where(eq(ticketsTable.tenantId, tenant.id));

    // Reset the ID sequence to start from 1
    await db.execute(sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`);

    // Clear all user_tenants associations (for all tenants in test env)
    await db.delete(userTenantsTable);

    // Clear all users (in test env we start fresh each time)
    await db.delete(usersTable);

    // Reset the users ID sequence
    await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);

    // Seed a default test user for this tenant
    const passwordHash = await bcrypt.hash("password123", 12);

    // Create the test user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: "testuser@example.com",
        username: "testuser",
        passwordHash,
      })
      .returning();

    // Link user to tenant
    await db.insert(userTenantsTable).values({
      userId: newUser.id,
      tenantId: tenant.id,
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
      tenant: nu.string().optional(),
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

    const tenantSlug = body?.tenant || DEFAULT_TEST_TENANT;
    const tenant = await getTenantBySlug(tenantSlug);
    const db = getAdminDb();
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
    requestParams: nu.object({
      tenant: nu.string().optional(),
    }),
    requestBody: emptySchema,
    responseBody: nu.object({
      tickets: nu.object({
        count: nu.number(),
      }),
    }),
  },
  handler: async ({ params }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Database stats are only available in test environment");
    }

    const tenantSlug = params?.tenant || DEFAULT_TEST_TENANT;
    const tenant = await getTenantBySlug(tenantSlug);
    const db = getAdminDb();
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
    requestBody: nu.object({
      tenant: nu.string().optional(),
    }),
    responseBody: nu.object({
      success: nu.boolean(),
      tenant: nu.object({
        id: nu.number(),
        slug: nu.string(),
        name: nu.string(),
      }),
    }),
  },
  handler: async ({ body }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error("Tenant management is only allowed in test environment");
    }

    const tenantSlug = body?.tenant || DEFAULT_TEST_TENANT;
    const db = getAdminDb();

    // Check if tenant exists
    const existingTenants = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, tenantSlug));

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
        slug: tenantSlug,
        name: tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1),
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

/**
 * Seed a user with multiple tenants - for testing tenant selection flow
 */
export const handleSeedMultiTenantUser = createHttpHandler({
  endpoint: {
    method: "POST" as const,
    path: "/api/test/seed-multi-tenant-user",
    requestParams: emptySchema,
    requestBody: nu.object({
      username: nu.string(),
      password: nu.string(),
      email: nu.string(),
      tenants: nu.array(
        nu.object({
          slug: nu.string(),
          name: nu.string(),
        }),
      ),
    }),
    responseBody: nu.object({
      success: nu.boolean(),
      message: nu.string(),
      tenants: nu.array(
        nu.object({
          id: nu.number(),
          slug: nu.string(),
          name: nu.string(),
        }),
      ),
    }),
  },
  handler: async ({ body }) => {
    // Only allow in test environment
    if (process.env.NODE_ENV !== "test" && process.env.DB_PORT !== "5435") {
      throw new Error(
        "Multi-tenant user seeding is only allowed in test environment",
      );
    }

    const db = getAdminDb();
    const createdTenants: { id: number; slug: string; name: string }[] = [];
    const passwordHash = await bcrypt.hash(body.password, 12);

    // Check if user already exists
    let userId: number;
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, body.username));

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      // Create user (root-level, no tenant)
      const [newUser] = await db
        .insert(usersTable)
        .values({
          email: body.email,
          username: body.username,
          passwordHash,
        })
        .returning();
      userId = newUser.id;
    }

    for (const tenantData of body.tenants) {
      // Check if tenant exists
      let tenant = await db
        .select()
        .from(tenantsTable)
        .where(eq(tenantsTable.slug, tenantData.slug))
        .then((rows) => rows[0]);

      // Create tenant if it doesn't exist
      if (!tenant) {
        const result = await db
          .insert(tenantsTable)
          .values({
            slug: tenantData.slug,
            name: tenantData.name,
          })
          .returning();
        tenant = result[0];
      }

      // Check if user already has access to this tenant
      const existingAccess = await db
        .select()
        .from(userTenantsTable)
        .where(eq(userTenantsTable.userId, userId))
        .then((rows) => rows.find((ut) => ut.tenantId === tenant.id));

      // Link user to tenant if not already linked
      if (!existingAccess) {
        await db.insert(userTenantsTable).values({
          userId,
          tenantId: tenant.id,
        });
      }

      createdTenants.push({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      });
    }

    return {
      success: true,
      message: `User ${body.username} seeded in ${createdTenants.length} tenants`,
      tenants: createdTenants,
    };
  },
});

// Export test utils router
testUtils.post("/api/test/clear-database", handleClearDatabase);
testUtils.post("/api/test/seed", handleSeedTestData);
testUtils.get("/api/test/stats", handleGetDatabaseStats);
testUtils.post("/api/test/ensure-tenant", handleEnsureTenant);
testUtils.post("/api/test/seed-multi-tenant-user", handleSeedMultiTenantUser);

export { testUtils };
