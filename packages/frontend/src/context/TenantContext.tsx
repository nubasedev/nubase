import { createContext, useContext } from "react";

/**
 * Tenant context for path-based multi-tenancy.
 * This file is intentionally separate from routes/root.tsx to avoid circular dependencies.
 * Components can safely import from here without creating import cycles.
 */
export interface TenantContext {
  slug: string;
}

export const TenantContextValue = createContext<TenantContext | null>(null);

/**
 * Hook to get the current tenant context.
 * Must be used within a route nested under /$tenant.
 * @throws Error if used outside of tenant route
 */
export function useTenant(): TenantContext {
  const context = useContext(TenantContextValue);
  if (!context) {
    throw new Error(
      "useTenant must be used within a TenantProvider (inside /$tenant route)",
    );
  }
  return context;
}

/**
 * Hook to optionally get the current tenant context.
 * Returns null if not within a tenant route.
 */
export function useTenantOptional(): TenantContext | null {
  return useContext(TenantContextValue);
}

/**
 * Extract tenant slug from router state.
 * Use this in commands and other non-React contexts where hooks aren't available.
 */
export function getTenantFromRouter(router: {
  state: { matches: Array<{ params: Record<string, string> }> };
}): string | null {
  // Find the tenant param from route matches
  for (const match of router.state.matches) {
    if (match.params && "tenant" in match.params) {
      return match.params.tenant;
    }
  }
  return null;
}
