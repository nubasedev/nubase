import { useLocation, useNavigate } from "@tanstack/react-router";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator } from "../components/activity-indicator";
import type { AuthenticationController, AuthenticationState } from "./types";

export interface AuthenticationProviderProps {
  controller: AuthenticationController;
  publicRoutes: string[];
  children: ReactNode;
}

/**
 * AuthenticationProvider wraps the application and handles:
 * 1. Initializing the authentication controller on mount
 * 2. Subscribing to authentication state changes
 * 3. Showing a loading state while authentication is being checked
 * 4. Redirecting unauthenticated users to /signin (unless on a public route)
 */
export const AuthenticationProvider: FC<AuthenticationProviderProps> = ({
  controller,
  publicRoutes,
  children,
}) => {
  const [authState, setAuthState] = useState<AuthenticationState>(
    controller.getState(),
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize the controller on mount
  useEffect(() => {
    const init = async () => {
      try {
        await controller.initialize();
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [controller]);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, [controller]);

  // Handle redirection for unauthenticated users
  useEffect(() => {
    if (!isInitialized) return;
    if (authState.status === "loading") return;

    const currentPath = location.pathname;
    const isPublicRoute = publicRoutes.some((route) =>
      currentPath.startsWith(route),
    );

    if (authState.status === "unauthenticated" && !isPublicRoute) {
      navigate({ to: "/signin" });
    }
  }, [
    authState.status,
    isInitialized,
    location.pathname,
    navigate,
    publicRoutes,
  ]);

  // Show loading state while initializing
  if (!isInitialized || authState.status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <ActivityIndicator size="lg" color="primary" aria-label="Loading..." />
      </div>
    );
  }

  // Check if current route is public
  const currentPath = location.pathname;
  const isPublicRoute = publicRoutes.some((route) =>
    currentPath.startsWith(route),
  );

  // If unauthenticated and not on a public route, don't render children
  // (navigation effect will redirect)
  if (authState.status === "unauthenticated" && !isPublicRoute) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <ActivityIndicator
          size="lg"
          color="primary"
          aria-label="Redirecting..."
        />
      </div>
    );
  }

  return <>{children}</>;
};
