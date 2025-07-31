import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";
import { Label } from "../Label/Label";

export interface FormControlHorizontalLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  displayError?: string;
  hasError?: boolean;
  isValidating?: boolean;
  required?: boolean;
  children: React.ReactElement<{ id?: string }>;
}

const FormControlHorizontalLayout = forwardRef<
  HTMLDivElement,
  FormControlHorizontalLayoutProps
>(
  (
    {
      className,
      label,
      hint,
      displayError,
      hasError,
      isValidating,
      required,
      children,
      ...props
    },
    ref,
  ) => {
    const childId = children.props.id;

    return (
      <div
        ref={ref}
        className={cn("flex items-start gap-4", className)}
        data-component="FormControlHorizontalLayout"
        {...props}
      >
        {label && (
          <div className="w-32 flex-shrink-0 pt-2">
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
              className="mt-1 text-xs text-onSurfaceVariant"
            >
              {hint}
            </div>
          )}
          {isValidating && (
            <div className="mt-1 text-xs text-onSurfaceVariant">
              Validating...
            </div>
          )}
          {hasError && displayError && (
            <div id={`${childId}-error`} className="mt-1 text-xs text-error">
              {displayError}
            </div>
          )}
        </div>
      </div>
    );
  },
);

FormControlHorizontalLayout.displayName = "FormControlHorizontalLayout";

export { FormControlHorizontalLayout };
