import type { ReactFormExtendedApi } from "@tanstack/react-form";
import type React from "react";
import { Callout } from "../../callout/Callout";

export type FormValidationErrorsProps = {
  form: ReactFormExtendedApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  className?: string;
  testId?: string;
};

/**
 * Extracts the error message from onSubmit error which can be:
 * - A string (from validators)
 * - A GlobalFormValidationError object with { form?: string, fields: {} }
 * - undefined/null
 */
function extractErrorMessage(onSubmitError: unknown): string | string[] | null {
  if (!onSubmitError) return null;

  // Handle GlobalFormValidationError format: { form: "message", fields: {} }
  if (
    typeof onSubmitError === "object" &&
    "form" in onSubmitError &&
    onSubmitError.form
  ) {
    const formError = onSubmitError.form;
    if (typeof formError === "string") return formError;
    if (Array.isArray(formError)) return formError;
  }

  // Handle direct string/string array
  if (typeof onSubmitError === "string") return onSubmitError;
  if (Array.isArray(onSubmitError)) return onSubmitError;

  return null;
}

/**
 * Component to display form-level validation errors.
 * Subscribes to form state and displays onSubmit errors.
 */
export const FormValidationErrors: React.FC<FormValidationErrorsProps> = ({
  form,
  className = "",
  testId,
}) => {
  return (
    <form.Subscribe selector={(state) => [state.errorMap]}>
      {([errorMap]) => {
        const errors = extractErrorMessage(errorMap?.onSubmit);

        if (!errors) return null;

        const errorArray = Array.isArray(errors) ? errors : [errors];

        if (errorArray.length === 0) return null;

        return (
          <Callout variant="danger" className={className} data-testid={testId}>
            {errorArray.length === 1 ? (
              errorArray[0]
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {errorArray.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </Callout>
        );
      }}
    </form.Subscribe>
  );
};
