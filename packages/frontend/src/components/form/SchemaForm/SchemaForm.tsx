import type React from "react";
import { forwardRef } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import {
  SchemaFormLayoutProvider,
  useSchemaFormLayout,
} from "./SchemaFormLayoutContext";

export interface SchemaFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  form: SchemaFormConfiguration<any>;
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

const SchemaFormInner = forwardRef<HTMLFormElement, SchemaFormProps>(
  ({ form, className = "", children, onSubmit, style, ...formProps }, ref) => {
    const { labelWidth } = useSchemaFormLayout();

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
        style={
          {
            ...style,
            "--schema-form-label-width": `${labelWidth}px`,
          } as React.CSSProperties
        }
        {...formProps}
      >
        {children}
      </form>
    );
  },
);
SchemaFormInner.displayName = "SchemaFormInner";

export const SchemaForm = forwardRef<HTMLFormElement, SchemaFormProps>(
  (props, ref) => {
    return (
      <SchemaFormLayoutProvider>
        <SchemaFormInner ref={ref} {...props} />
      </SchemaFormLayoutProvider>
    );
  },
);
SchemaForm.displayName = "SchemaForm";
