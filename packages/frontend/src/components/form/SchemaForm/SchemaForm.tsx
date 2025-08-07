import type React from "react";
import { forwardRef } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";

export interface SchemaFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  form: SchemaFormConfiguration<any>;
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

// Form component - wraps the form element
export const SchemaForm = forwardRef<HTMLFormElement, SchemaFormProps>(
  ({ form, className = "", children, onSubmit, ...formProps }, ref) => {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSubmit) {
        onSubmit(e);
      } else {
        await form.api.handleSubmit();
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={className}
        {...formProps}
      >
        {children}
      </form>
    );
  },
);
