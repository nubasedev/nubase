import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../styling/cn";
import { Label } from "../Label/Label";

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement<{ id?: string }>;
  field?: AnyFieldApi; // Optional field for TanStack form integration
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  (
    { className, label, hint, error, required, children, field, ...props },
    ref,
  ) => {
    // Determine error state - prioritize explicit error, then field errors
    let displayError = error;
    let hasError = !!error;
    let isValidating = false;

    if (field) {
      isValidating = field.state.meta.isValidating;
      if (!error && field.state.meta.isTouched && !field.state.meta.isValid) {
        // Deduplicate errors to avoid showing the same message multiple times
        // TanStack Form can add duplicate errors when multiple validators run
        const uniqueErrors = [...new Set(field.state.meta.errors)].filter(
          (e): e is string => typeof e === "string" && e !== undefined,
        );

        displayError = uniqueErrors.join(", ");
        hasError = true;
      }
    }

    const childId = children.props.id;

    return (
      <div
        ref={ref}
        className={cn("flex items-start gap-4", className)}
        data-component="FormControl"
        {...props}
      >
        {label && (
          <div className="w-32 shrink-0 pt-2">
            <Label htmlFor={childId} required={required}>
              {label}
            </Label>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
          {hint && !hasError && !isValidating && (
            <div
              id={`${childId}-hint`}
              className="mt-1 text-xs text-muted-foreground"
            >
              {hint}
            </div>
          )}
          {isValidating && (
            <div className="mt-1 text-xs text-muted-foreground">
              Validating...
            </div>
          )}
          {hasError && displayError && (
            <div
              id={`${childId}-error`}
              className="mt-1 text-xs text-destructive"
            >
              {displayError}
            </div>
          )}
        </div>
      </div>
    );
  },
);

FormControl.displayName = "FormControl";

export { FormControl };
