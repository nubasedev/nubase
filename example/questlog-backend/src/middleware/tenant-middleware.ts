import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import {
  clearTenantContext,
  getDb,
  setTenantContext,
} from "../db/helpers/drizzle";
import { tenantsTable } from "../db/schema/tenant";

export interface Tenant {
  id: number;
  slug: string;
  name: string;
}

// Paths that don't require a tenant to exist (for bootstrapping and health checks)
const TENANT_BYPASS_PATHS = ["/", "/api/test/ensure-tenant"];

// Paths where tenant comes from request body (login) instead of JWT
const TENANT_FROM_BODY_PATHS = ["/auth/login"];

/**
 * Tenant middleware for path-based multi-tenancy.
 *
 * For most authenticated requests, the tenant is identified from the JWT token.
 * For login requests, the tenant slug is provided in the request body.
 *
 * This middleware sets the tenant in the Hono context and establishes the RLS context
 * for database queries.
 */
export function createTenantMiddleware() {
  return createMiddleware<{ Variables: { tenant: Tenant } }>(
    async (c, next) => {
      const path = c.req.path;

      // Allow certain paths to bypass tenant check (for bootstrapping)
      if (TENANT_BYPASS_PATHS.includes(path)) {
        return next();
      }

      // For login, tenant will be handled by the login handler itself
      // Skip tenant middleware for these paths
      if (TENANT_FROM_BODY_PATHS.includes(path)) {
        return next();
      }

      // For other paths, tenant will be set from JWT by auth middleware
      // The auth middleware runs after this and sets user with tenantId
      // We'll set up RLS context after auth middleware identifies the user
      return next();
    },
  );
}

/**
 * Post-auth middleware that sets RLS context based on authenticated user's tenant.
 * This should run after the auth middleware.
 */
export function createPostAuthTenantMiddleware() {
  return createMiddleware<{
    Variables: { tenant: Tenant; user: { tenantId: number } | null };
  }>(async (c, next) => {
    const path = c.req.path;

    // Skip for bypass paths and login (already handled)
    if (
      TENANT_BYPASS_PATHS.includes(path) ||
      TENANT_FROM_BODY_PATHS.includes(path)
    ) {
      return next();
    }

    // If tenant is already set (e.g., from login path), skip
    const existingTenant = c.get("tenant");
    if (existingTenant) {
      return next();
    }

    // Get user from auth middleware
    const user = c.get("user");

    if (!user || !user.tenantId) {
      // No authenticated user - proceed without tenant context
      // Protected routes will fail at the auth level
      return next();
    }

    // Look up tenant from user's tenantId
    const db = getDb();
    const tenants = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, user.tenantId));

    if (tenants.length === 0) {
      return c.json({ error: "User's tenant not found" }, 500);
    }

    const tenant = {
      id: tenants[0].id,
      slug: tenants[0].slug,
      name: tenants[0].name,
    };

    c.set("tenant", tenant);
    await setTenantContext(tenant.id);

    try {
      return await next();
    } finally {
      await clearTenantContext();
    }
  });
}
