import {
  createRootRoute,
  createRoute,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MainNav } from "@/components/navigation/main-nav/MainNav";
import type { AuthenticationState } from "../authentication/types";
import { ActivityIndicator, Dock, TopBar } from "../components";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";
import {
  getTenantFromRouter,
  type TenantContext,
  TenantContextValue,
  useTenant,
  useTenantOptional,
} from "../context/TenantContext";

// Re-export tenant hooks for backwards compatibility
export {
  getTenantFromRouter,
  useTenant,
  useTenantOptional,
  type TenantContext,
};

function RootComponent() {
  return (
    <div className="bg-background text-text h-screen w-screen">
      <Outlet />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});

/**
 * Tenant route component that extracts the tenant slug from the URL path.
 * All routes are nested under /:tenant (e.g., /tavern/r/ticket/create).
 */
function TenantComponent() {
  const { tenant } = useParams({ from: "/$tenant" });
  const { authentication, config } = useNubaseContext();
  const publicRoutes = config.publicRoutes ?? ["/signin"];
  const location = useLocation();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthenticationState | null>(
    authentication?.getState() ?? null,
  );
  const [isInitialized, setIsInitialized] = useState(!authentication);

  // Initialize authentication on mount
  useEffect(() => {
    if (!authentication) return;

    const init = async () => {
      try {
        await authentication.initialize();
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [authentication]);

  // Subscribe to auth state changes
  useEffect(() => {
    if (!authentication) return;

    const unsubscribe = authentication.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, [authentication]);

  // Handle redirection for unauthenticated users
  useEffect(() => {
    if (!authentication || !isInitialized || !authState) return;
    if (authState.status === "loading") return;

    const currentPath = location.pathname;
    // Check if route is public (accounting for tenant prefix)
    // e.g., /tavern/signin should match /signin in publicRoutes
    const pathWithoutTenant = currentPath.replace(`/${tenant}`, "");
    const isPublicRoute = publicRoutes.some((route) =>
      pathWithoutTenant.startsWith(route),
    );

    if (authState.status === "unauthenticated" && !isPublicRoute) {
      // Redirect to root-level signin (not tenant-specific)
      navigate({ to: "/signin" });
    }
  }, [
    authentication,
    authState,
    isInitialized,
    location.pathname,
    navigate,
    publicRoutes,
    tenant,
  ]);

  // Check if current route is public
  const currentPath = location.pathname;
  const pathWithoutTenant = currentPath.replace(`/${tenant}`, "");
  const isPublicRoute = publicRoutes.some((route) =>
    pathWithoutTenant.startsWith(route),
  );

  // If authentication is configured, show loading while initializing
  // But only for non-public routes - public routes (like signin) should render immediately
  if (authentication && !isPublicRoute) {
    if (!isInitialized || authState?.status === "loading") {
      return (
        <div className="flex items-center justify-center h-full">
          <ActivityIndicator
            size="lg"
            color="primary"
            aria-label="Loading..."
          />
        </div>
      );
    }

    // If unauthenticated and not on a public route, show loading (redirect will happen)
    if (authState?.status === "unauthenticated") {
      return (
        <div className="flex items-center justify-center h-full">
          <ActivityIndicator
            size="lg"
            color="primary"
            aria-label="Redirecting..."
          />
        </div>
      );
    }
  }

  return (
    <TenantContextValue.Provider value={{ slug: tenant }}>
      <Outlet />
    </TenantContextValue.Provider>
  );
}

export const tenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$tenant",
  component: TenantComponent,
});

function AppShellComponent() {
  const context = useNubaseContext();

  return (
    <Dock
      top={<TopBar context={context} />}
      left={<MainNav items={context.config.mainMenu} />}
      center={<Outlet />}
    />
  );
}

export const appShellRoute = createRoute({
  getParentRoute: () => tenantRoute,
  id: "app-shell",
  component: AppShellComponent,
});
