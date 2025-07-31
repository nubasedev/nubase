import type React from "react";
import { forwardRef } from "react";
import { cn } from "../../../utils";
import { Label } from "../Label/Label";

export interface FormControlVerticalLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  displayError?: string;
  hasError?: boolean;
  isValidating?: boolean;
  required?: boolean;
  children: React.ReactElement<{ id?: string }>;
}

const FormControlVerticalLayout = forwardRef<
  HTMLDivElement,
  FormControlVerticalLayoutProps
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
        className={cn("flex flex-col gap-2", className)}
        data-component="FormControlVerticalLayout"
        {...props}
      >
        {label && (
          <Label htmlFor={childId} required={required}>
            {label}
          </Label>
        )}
        {children}
        {hint && !hasError && !isValidating && (
          <div id={`${childId}-hint`} className="text-xs text-onSurfaceVariant">
            {hint}
          </div>
        )}
        {isValidating && (
          <div className="text-xs text-onSurfaceVariant">Validating...</div>
        )}
        {hasError && displayError && (
          <div id={`${childId}-error`} className="text-xs text-error">
            {displayError}
          </div>
        )}
      </div>
    );
  },
);

FormControlVerticalLayout.displayName = "FormControlVerticalLayout";

export { FormControlVerticalLayout };
