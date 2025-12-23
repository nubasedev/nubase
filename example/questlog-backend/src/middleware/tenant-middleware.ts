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

export function createTenantMiddleware() {
  return createMiddleware<{ Variables: { tenant: Tenant } }>(
    async (c, next) => {
      const path = c.req.path;

      // Allow certain paths to bypass tenant check (for bootstrapping)
      if (TENANT_BYPASS_PATHS.includes(path)) {
        return next();
      }

      const host = c.req.header("Host") || "";

      const subdomain = extractSubdomain(host);

      if (!subdomain) {
        return c.json({ error: "Invalid tenant: no subdomain provided" }, 400);
      }

      const db = getDb();
      const tenants = await db
        .select()
        .from(tenantsTable)
        .where(eq(tenantsTable.slug, subdomain));

      if (tenants.length === 0) {
        return c.json({ error: `Tenant not found: ${subdomain}` }, 404);
      }

      const tenant = {
        id: tenants[0].id,
        slug: tenants[0].slug,
        name: tenants[0].name,
      };

      c.set("tenant", tenant);

      // Set the RLS context for this request
      await setTenantContext(tenant.id);

      try {
        return await next();
      } finally {
        // Clear the RLS context after the request completes
        await clearTenantContext();
      }
    },
  );
}

function extractSubdomain(host: string): string | null {
  // Remove port if present (e.g., "tavern.localhost:3001" -> "tavern.localhost")
  const hostWithoutPort = host.split(":")[0];

  // Split by dots
  const parts = hostWithoutPort.split(".");

  // For "tavern.localhost" -> ["tavern", "localhost"] -> return "tavern"
  // For "localhost" -> ["localhost"] -> return null (no subdomain)
  // For "tavern.example.com" -> ["tavern", "example", "com"] -> return "tavern"
  if (parts.length >= 2) {
    return parts[0];
  }

  return null;
}
