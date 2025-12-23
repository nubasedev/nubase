import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { TenantInfo } from "../../authentication";
import { Button } from "../../components/buttons/Button/Button";
import { showToast } from "../../components/floating/toast";
import { TextInput } from "../../components/form-controls/controls/TextInput/TextInput";
import { FormControl } from "../../components/form-controls/FormControl/FormControl";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

/**
 * Sign-in screen with Shortcut-like two-step flow:
 * 1. Enter username and password
 * 2. If user belongs to multiple tenants, select one
 *
 * This is the root-level signin at /signin.
 * After successful login, redirects to /$tenant.
 */
export default function SignInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authentication } = useNubaseContext();
  const navigate = useNavigate();

  // Two-step login state
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authentication) {
      setError("Authentication is not configured");
      return;
    }

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      // Check if auth controller supports two-step login
      if (authentication.loginStart) {
        const result = await authentication.loginStart({ username, password });

        if (result.tenants.length === 1 && result.tenants[0]) {
          // Single tenant - auto-complete login
          if (!authentication.loginComplete) {
            setError("Authentication not properly configured");
            return;
          }
          const singleTenant = result.tenants[0];
          const tenant = await authentication.loginComplete({
            loginToken: result.loginToken,
            tenant: singleTenant.slug,
          });
          showToast("Successfully signed in!");
          navigate({ to: "/$tenant", params: { tenant: tenant.slug } });
        } else if (result.tenants.length > 1) {
          // Multiple tenants - show selection
          setLoginToken(result.loginToken);
          setTenants(result.tenants);
        }
      } else {
        // Fallback to legacy single-step login (requires tenant)
        setError("Please enter your organization slug");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSelect = async (tenant: TenantInfo) => {
    if (!authentication?.loginComplete || !loginToken) {
      setError("Session expired. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedTenant = await authentication.loginComplete({
        loginToken,
        tenant: tenant.slug,
      });
      showToast("Successfully signed in!");
      navigate({ to: "/$tenant", params: { tenant: selectedTenant.slug } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setLoginToken(null);
    setTenants([]);
    setError(null);
  };

  // Tenant selection screen
  if (loginToken && tenants.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Select Organization
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Choose the organization you want to sign in to
            </p>
          </div>

          {error && (
            <div
              data-testid="signin-error"
              className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-6"
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => handleTenantSelect(tenant)}
                disabled={isLoading}
                className="w-full p-4 text-left rounded-lg border border-outline bg-surface hover:bg-surfaceContainer transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-foreground">{tenant.name}</div>
                <div className="text-sm text-muted-foreground">
                  {tenant.slug}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToCredentials}
              className="text-sm text-primary hover:underline"
            >
              Sign in with a different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Credentials screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
          {error && (
            <div
              data-testid="signin-error"
              className="p-3 text-sm text-destructive bg-destructive/10 rounded-md"
            >
              {error}
            </div>
          )}

          <FormControl label="Username" required>
            <TextInput
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
            />
          </FormControl>

          <FormControl label="Password" required>
            <TextInput
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
            />
          </FormControl>

          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
