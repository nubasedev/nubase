import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { AuthenticationState } from "../../authentication/types";
import { ActivityIndicator } from "../../components/activity-indicator";
import { buttonVariants } from "../../components/buttons/Button/Button";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

export default function HomeScreen() {
  const { config, authentication } = useNubaseContext();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthenticationState | null>(
    authentication?.getState() ?? null,
  );
  const [isInitialized, setIsInitialized] = useState(!authentication);

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

  useEffect(() => {
    if (!authentication) return;

    const unsubscribe = authentication.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, [authentication]);

  useEffect(() => {
    if (!authentication || !isInitialized || !authState) return;
    if (authState.status !== "authenticated") return;
    const firstWorkspace = authState.workspaces[0];
    if (!firstWorkspace) return;
    navigate({
      to: "/$workspace",
      params: { workspace: firstWorkspace.slug },
    });
  }, [authentication, authState, isInitialized, navigate]);

  const isResolving =
    authentication &&
    (!isInitialized ||
      authState?.status === "loading" ||
      (authState?.status === "authenticated" &&
        authState.workspaces.length > 0));

  if (isResolving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ActivityIndicator size="lg" color="primary" aria-label="Loading..." />
      </div>
    );
  }

  const showCtas = !!authentication && authState?.status === "unauthenticated";
  const tagline = config.homeScreen?.tagline;
  const description = config.homeScreen?.description;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-xl px-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">{config.appName}</h1>
        {tagline && (
          <p className="text-lg text-muted-foreground mt-4">{tagline}</p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-4">{description}</p>
        )}
        {showCtas && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Link to="/signin" className={buttonVariants()}>
              Sign in
            </Link>
            <Link
              to="/signup"
              className={buttonVariants({ variant: "outline" })}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
