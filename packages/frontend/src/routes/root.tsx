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
  getWorkspaceFromRouter,
  useWorkspace,
  useWorkspaceOptional,
  type WorkspaceContext,
  WorkspaceContextValue,
} from "../context/WorkspaceContext";

// Re-export workspace hooks for backwards compatibility
export {
  getWorkspaceFromRouter,
  useWorkspace,
  useWorkspaceOptional,
  type WorkspaceContext,
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
 * Workspace route component that extracts the workspace slug from the URL path.
 * All routes are nested under /:workspace (e.g., /tavern/r/ticket/create).
 */
function WorkspaceComponent() {
  const { workspace } = useParams({ from: "/$workspace" });
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
    // Check if route is public (accounting for workspace prefix)
    // e.g., /tavern/signin should match /signin in publicRoutes
    const pathWithoutWorkspace = currentPath.replace(`/${workspace}`, "");
    const isPublicRoute = publicRoutes.some((route) =>
      pathWithoutWorkspace.startsWith(route),
    );

    if (authState.status === "unauthenticated" && !isPublicRoute) {
      // Redirect to root-level signin (not workspace-specific)
      navigate({ to: "/signin" });
    }
  }, [
    authentication,
    authState,
    isInitialized,
    location.pathname,
    navigate,
    publicRoutes,
    workspace,
  ]);

  // Check if current route is public
  const currentPath = location.pathname;
  const pathWithoutWorkspace = currentPath.replace(`/${workspace}`, "");
  const isPublicRoute = publicRoutes.some((route) =>
    pathWithoutWorkspace.startsWith(route),
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
    <WorkspaceContextValue.Provider value={{ slug: workspace }}>
      <Outlet />
    </WorkspaceContextValue.Provider>
  );
}

export const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$workspace",
  component: WorkspaceComponent,
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
  getParentRoute: () => workspaceRoute,
  id: "app-shell",
  component: AppShellComponent,
});
