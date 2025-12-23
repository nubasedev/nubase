import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/buttons/Button/Button";
import { showToast } from "../../components/floating/toast";
import { TextInput } from "../../components/form-controls/controls/TextInput/TextInput";
import { FormControl } from "../../components/form-controls/FormControl/FormControl";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

/**
 * Sign-up screen for creating a new user and tenant.
 * This is the root-level signup at /signup.
 * After successful signup, redirects to /$tenant.
 */
export default function SignUpScreen() {
  const [tenant, setTenant] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authentication } = useNubaseContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authentication) {
      setError("Authentication is not configured");
      return;
    }

    if (!tenant) {
      setError("Please enter an organization slug");
      return;
    }

    // Validate tenant slug format (lowercase, alphanumeric, hyphens)
    if (!/^[a-z0-9-]+$/.test(tenant)) {
      setError(
        "Organization slug must be lowercase and contain only letters, numbers, and hyphens",
      );
      return;
    }

    if (!username) {
      setError("Please enter a username");
      return;
    }

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Call the signup method on the authentication controller
      if (!authentication.signup) {
        setError("Signup is not configured");
        setIsLoading(false);
        return;
      }
      await authentication.signup({
        tenant,
        tenantName: tenantName || tenant,
        username,
        email,
        password,
      });
      showToast("Account created successfully!");
      navigate({ to: "/$tenant", params: { tenant } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Create an Account
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Set up your organization and create your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              data-testid="signup-error"
              className="p-3 text-sm text-destructive bg-destructive/10 rounded-md"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">
              Organization
            </h2>

            <FormControl
              label="Organization Slug"
              hint="A unique identifier for your organization (e.g., my-company)"
              required
            >
              <TextInput
                id="tenant"
                type="text"
                placeholder="my-organization"
                value={tenant}
                onChange={(e) => setTenant(e.target.value.toLowerCase())}
                disabled={isLoading}
              />
            </FormControl>

            <FormControl
              label="Organization Name"
              hint="Display name for your organization"
            >
              <TextInput
                id="tenantName"
                type="text"
                placeholder="My Organization"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                disabled={isLoading}
              />
            </FormControl>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">
              Admin Account
            </h2>

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

            <FormControl label="Email" required>
              <TextInput
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="new-password"
                disabled={isLoading}
              />
            </FormControl>

            <FormControl label="Confirm Password" required>
              <TextInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
              />
            </FormControl>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
