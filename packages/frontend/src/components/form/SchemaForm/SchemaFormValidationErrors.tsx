import type React from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import { FormValidationErrors } from "../FormValidationErrors";

export type SchemaFormValidationErrorsProps = {
  form: SchemaFormConfiguration<any>;
  className?: string;
};

/**
 * Component to display form-level validation errors for SchemaForm.
 * Only renders in edit/create modes, not in view mode.
 */
export const SchemaFormValidationErrors: React.FC<
  SchemaFormValidationErrorsProps
> = ({ form, className = "" }) => {
  const { mode } = form;

  if (mode === "view") return null;

  return <FormValidationErrors form={form.api} className={className} />;
};
