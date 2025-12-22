import {
  createRootRoute,
  createRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MainNav } from "@/components/navigation/main-nav/MainNav";
import type { AuthenticationState } from "../authentication/types";
import { ActivityIndicator, Dock, TopBar } from "../components";
import { useNubaseContext } from "../components/nubase-app/NubaseContextProvider";

function RootComponent() {
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
    const isPublicRoute = publicRoutes.some((route) =>
      currentPath.startsWith(route),
    );

    if (authState.status === "unauthenticated" && !isPublicRoute) {
      navigate({ to: "/signin" });
    }
  }, [
    authentication,
    authState,
    isInitialized,
    location.pathname,
    navigate,
    publicRoutes,
  ]);

  // Check if current route is public
  const currentPath = location.pathname;
  const isPublicRoute = publicRoutes.some((route) =>
    currentPath.startsWith(route),
  );

  // If authentication is configured, show loading while initializing
  // But only for non-public routes - public routes (like signin) should render immediately
  if (authentication && !isPublicRoute) {
    if (!isInitialized || authState?.status === "loading") {
      return (
        <div className="bg-background text-text h-screen w-screen flex items-center justify-center">
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
        <div className="bg-background text-text h-screen w-screen flex items-center justify-center">
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
    <div className="bg-background text-text h-screen w-screen">
      <Outlet />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
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
  getParentRoute: () => rootRoute,
  id: "app-shell",
  component: AppShellComponent,
});
