import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/buttons/Button/Button";
import { FormValidationErrors } from "../../components/form";
import { TextInput } from "../../components/form-controls/controls/TextInput/TextInput";
import { FormControl } from "../../components/form-controls/FormControl/FormControl";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { emitEvent } from "../../events";

/**
 * Sign-up screen for creating a new user and workspace.
 * This is the root-level signup at /signup.
 * After successful signup, redirects to /$workspace.
 */
export default function SignUpScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { authentication } = useNubaseContext();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      workspace: "",
      workspaceName: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      form.setErrorMap({});

      if (!authentication) {
        form.setErrorMap({
          onSubmit: { form: "Authentication is not configured", fields: {} },
        });
        return;
      }

      setIsLoading(true);

      try {
        // Call the signup method on the authentication controller
        if (!authentication.signup) {
          form.setErrorMap({
            onSubmit: { form: "Signup is not configured", fields: {} },
          });
          setIsLoading(false);
          return;
        }
        await authentication.signup({
          workspace: value.workspace,
          workspaceName: value.workspaceName || value.workspace,
          displayName: value.displayName,
          email: value.email,
          password: value.password,
        });
        emitEvent("auth.signedUp", {
          email: value.email,
          workspace: value.workspace,
        });
        navigate({ to: "/$workspace", params: { workspace: value.workspace } });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign up failed";
        form.setErrorMap({ onSubmit: { form: message, fields: {} } });
        emitEvent("auth.signUpFailed", { email: value.email, error: message });
      } finally {
        setIsLoading(false);
      }
    },
  });

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

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">
              Organization
            </h2>

            <form.Field
              name="workspace"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) return "Organization slug is required";
                  if (!/^[a-z0-9-]+$/.test(value)) {
                    return "Must be lowercase letters, numbers, and hyphens only";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormControl
                  label="Organization Slug"
                  hint="A unique identifier for your organization (e.g., my-company)"
                  required
                  field={field}
                >
                  <TextInput
                    id="workspace"
                    type="text"
                    placeholder="my-organization"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase())
                    }
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormControl>
              )}
            </form.Field>

            <form.Field name="workspaceName">
              {(field) => (
                <FormControl
                  label="Organization Name"
                  hint="Display name for your organization"
                  field={field}
                >
                  <TextInput
                    id="workspaceName"
                    type="text"
                    placeholder="My Organization"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormControl>
              )}
            </form.Field>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">
              Admin Account
            </h2>

            <form.Field
              name="email"
              validators={{
                // Note: no onBlur validator - password managers (1Password) blur the field
                // BEFORE filling it, which would trigger a false "required" error
                onChange: ({ value }) => {
                  if (!value) return "Email is required";
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return "Please enter a valid email address";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormControl label="Email" required field={field}>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="email"
                    disabled={isLoading}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormControl>
              )}
            </form.Field>

            <form.Field
              name="displayName"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Display name is required" : undefined,
              }}
            >
              {(field) => (
                <FormControl label="Display Name" required field={field}>
                  <TextInput
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="name"
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
                // Note: no onBlur validator - password managers (1Password) blur the field
                // BEFORE filling it, which would trigger a false "required" error
                onChange: ({ value }) => {
                  if (!value) return "Password is required";
                  if (value.length < 8) {
                    return "Password must be at least 8 characters";
                  }
                  return undefined;
                },
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
                    autoComplete="new-password"
                    disabled={isLoading}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormControl>
              )}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                // Note: no onBlur validator - password managers (1Password) blur the field
                // BEFORE filling it, which would trigger a false "required" error
                onChange: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue("password");
                  if (!value) return "Please confirm your password";
                  if (value !== password) return "Passwords do not match";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormControl label="Confirm Password" required field={field}>
                  <TextInput
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="new-password"
                    disabled={isLoading}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormControl>
              )}
            </form.Field>
          </div>

          <FormValidationErrors form={form} />

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
