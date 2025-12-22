import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/buttons/Button/Button";
import { showToast } from "../../components/floating/toast";
import { TextInput } from "../../components/form-controls/controls/TextInput/TextInput";
import { FormControl } from "../../components/form-controls/FormControl/FormControl";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

export default function SignInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      await authentication.login({ username, password });
      showToast("Successfully signed in!");
      navigate({ to: "/" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
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
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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
        </form>
      </div>
    </div>
  );
}
