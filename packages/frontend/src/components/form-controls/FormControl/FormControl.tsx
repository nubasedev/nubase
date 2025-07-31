import type { AnyFieldApi } from "@tanstack/react-form";
import type React from "react";
import { forwardRef } from "react";
import { FormControlHorizontalLayout } from "./FormControlHorizontalLayout";
import { FormControlVerticalLayout } from "./FormControlVerticalLayout";

export type FormControlLayout = "vertical" | "horizontal";

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement<{ id?: string }>;
  field?: AnyFieldApi; // Optional field for TanStack form integration
  layout?: FormControlLayout; // Layout option, defaults to vertical
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  (
    {
      className,
      label,
      hint,
      error,
      required,
      children,
      field,
      layout = "vertical",
      ...props
    },
    ref,
  ) => {
    // Determine error state - prioritize explicit error, then field errors
    let displayError = error;
    let hasError = !!error;
    let isValidating = false;

    if (field) {
      isValidating = field.state.meta.isValidating;
      if (!error && field.state.meta.isTouched && !field.state.meta.isValid) {
        displayError = field.state.meta.errors
          .filter((e): e is string => typeof e === "string" && e !== undefined)
          .join(", ");
        hasError = true;
      }
    }

    const layoutProps = {
      ref,
      className,
      label,
      hint,
      displayError,
      hasError,
      isValidating,
      required,
      children,
      ...props,
    };

    if (layout === "horizontal") {
      return <FormControlHorizontalLayout {...layoutProps} />;
    }

    return <FormControlVerticalLayout {...layoutProps} />;
  },
);

FormControl.displayName = "FormControl";

export { FormControl };
