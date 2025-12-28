import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { WorkspaceInfo } from "../../authentication";
import { Button } from "../../components/buttons/Button/Button";
import { showToast } from "../../components/floating/toast";
import { FormValidationErrors } from "../../components/form";
import { TextInput } from "../../components/form-controls/controls/TextInput/TextInput";
import { FormControl } from "../../components/form-controls/FormControl/FormControl";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

/**
 * Sign-in screen with Shortcut-like two-step flow:
 * 1. Enter username and password
 * 2. If user belongs to multiple workspaces, select one
 *
 * This is the root-level signin at /signin.
 * After successful login, redirects to /$workspace.
 */
export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { authentication } = useNubaseContext();
  const navigate = useNavigate();

  // Two-step login state
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      form.setErrorMap({});

      if (!authentication) {
        form.setErrorMap({
          onSubmit: { form: "Authentication is not configured", fields: {} },
        });
        return;
      }

      if (!value.username || !value.password) {
        form.setErrorMap({
          onSubmit: {
            form: "Please enter both username and password",
            fields: {},
          },
        });
        return;
      }

      setIsLoading(true);

      try {
        // Check if auth controller supports two-step login
        if (authentication.loginStart) {
          const result = await authentication.loginStart({
            username: value.username,
            password: value.password,
          });

          if (result.workspaces.length === 1 && result.workspaces[0]) {
            // Single workspace - auto-complete login
            if (!authentication.loginComplete) {
              form.setErrorMap({
                onSubmit: {
                  form: "Authentication not properly configured",
                  fields: {},
                },
              });
              return;
            }
            const singleWorkspace = result.workspaces[0];
            const workspace = await authentication.loginComplete({
              loginToken: result.loginToken,
              workspace: singleWorkspace.slug,
            });
            showToast("Successfully signed in!");
            navigate({
              to: "/$workspace",
              params: { workspace: workspace.slug },
            });
          } else if (result.workspaces.length > 1) {
            // Multiple workspaces - show selection
            setLoginToken(result.loginToken);
            setWorkspaces(result.workspaces);
          }
        } else {
          // Fallback to legacy single-step login (requires workspace)
          form.setErrorMap({
            onSubmit: {
              form: "Please enter your organization slug",
              fields: {},
            },
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign in failed";
        form.setErrorMap({ onSubmit: { form: message, fields: {} } });
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleWorkspaceSelect = async (workspace: WorkspaceInfo) => {
    if (!authentication?.loginComplete || !loginToken) {
      form.setErrorMap({
        onSubmit: { form: "Session expired. Please try again.", fields: {} },
      });
      return;
    }

    setIsLoading(true);
    form.setErrorMap({});

    try {
      const selectedWorkspace = await authentication.loginComplete({
        loginToken,
        workspace: workspace.slug,
      });
      showToast("Successfully signed in!");
      navigate({
        to: "/$workspace",
        params: { workspace: selectedWorkspace.slug },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      form.setErrorMap({ onSubmit: { form: message, fields: {} } });
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setLoginToken(null);
    setWorkspaces([]);
    form.setErrorMap({});
  };

  // Workspace selection screen
  if (loginToken && workspaces.length > 0) {
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

          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => handleWorkspaceSelect(workspace)}
                disabled={isLoading}
                className="w-full p-4 text-left rounded-lg border border-outline bg-surface hover:bg-surfaceContainer transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-foreground">
                  {workspace.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {workspace.slug}
                </div>
              </button>
            ))}
          </div>

          <FormValidationErrors
            form={form}
            className="mt-6"
            testId="signin-error"
          />

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

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Username is required" : undefined,
            }}
          >
            {(field) => (
              <FormControl label="Username" required field={field}>
                <TextInput
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="username"
                  disabled={isLoading}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
              </FormControl>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Password is required" : undefined,
            }}
          >
            {(field) => (
              <FormControl label="Password" required field={field}>
                <TextInput
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="current-password"
                  disabled={isLoading}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
              </FormControl>
            )}
          </form.Field>

          <FormValidationErrors form={form} testId="signin-error" />

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
