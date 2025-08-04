import {
  type BaseSchema,
  type LayoutField,
  OptionalSchema,
} from "@nubase/core";
import type React from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import { useComputedMetadata } from "../../../hooks/useComputedMetadata";
import { useLayout } from "../../../hooks/useLayout";
import { Callout } from "../../callout/Callout";
import { FormFieldRenderer } from "../FormFieldRenderer/FormFieldRenderer";
import type { PatchResult } from "../FormFieldRenderer/PatchWrapper";
import { SchemaFormVerticalLayout } from "./SchemaFormVerticalLayout";

export interface SchemaFormBodyProps {
  form: SchemaFormConfiguration<any>;
  className?: string;
  layoutName?: string;
  computedMetadata?: {
    debounceMs?: number;
  };
}

// Body component - renders the form fields
export const SchemaFormBody: React.FC<SchemaFormBodyProps> = ({
  form,
  className = "",
  layoutName,
  computedMetadata,
}) => {
  const { schema, mode, onPatch } = form;

  // Use computed metadata hook to get merged metadata
  const { metadata: mergedMetadata, error: metadataError } =
    useComputedMetadata(schema, form.formState, computedMetadata);

  // Use layout hook to get the layout (either specified or default)
  const layout = useLayout(schema, layoutName);

  return (
    <div className={`flex flex-col ${className}`}>
      {metadataError && (
        <div className="mb-4 p-3 bg-errorContainer border border-error rounded-md text-onErrorContainer text-sm">
          <strong>Metadata Error:</strong> {metadataError.message}
        </div>
      )}

      <div className="flex-1 space-y-4">
        <SchemaFormVerticalLayout
          layout={layout}
          renderField={(field: LayoutField<any>) => {
            const fieldName = field.name as string;
            const currentSchema = schema._shape[fieldName] as BaseSchema<any>;
            const fieldMetadata =
              mergedMetadata[fieldName] ?? currentSchema._meta;

            // Validation function for submit - includes required field check
            const validateFieldOnSubmit = ({ value }: { value: any }) => {
              // Check if field is required and empty
              const isFieldRequired =
                currentSchema && !(currentSchema instanceof OptionalSchema);
              if (isFieldRequired) {
                if (value === undefined || value === null || value === "") {
                  return "This field is required";
                }
              }

              // Then run schema validation
              if (fieldMetadata?.validateOnSubmit) {
                const error = fieldMetadata.validateOnSubmit(value);
                if (error) {
                  return error;
                }
              }

              return undefined;
            };

            // Async validation function for submit
            const validateFieldOnSubmitAsync = async ({
              value,
            }: {
              value: any;
            }) => {
              if (fieldMetadata?.validateOnSubmitAsync) {
                const error = await fieldMetadata.validateOnSubmitAsync(value);
                if (error) {
                  return error;
                }
              }
              return undefined;
            };

            // Build field validators object
            const fieldValidators: any = {};

            // Always include submit validators
            fieldValidators.onSubmit = validateFieldOnSubmit;

            // Add async validators if they exist
            if (fieldMetadata?.validateOnSubmitAsync) {
              fieldValidators.onSubmitAsync = validateFieldOnSubmitAsync;
            }
            if (fieldMetadata?.validateOnBlur) {
              fieldValidators.onBlur = ({ value }: { value: any }) => {
                return fieldMetadata.validateOnBlur?.(value);
              };
            }
            if (fieldMetadata?.validateOnBlurAsync) {
              fieldValidators.onBlurAsync = async ({
                value,
              }: {
                value: any;
              }) => {
                return fieldMetadata.validateOnBlurAsync?.(value);
              };
            }

            const handleFieldPatch = async (
              value: any,
            ): Promise<PatchResult> => {
              if (mode === "patch" && onPatch) {
                try {
                  await onPatch(fieldName, value);
                  return { success: true };
                } catch (error) {
                  console.error(`Error patching field ${fieldName}:`, error);
                  return {
                    success: false,
                    errors: [`Failed to update ${fieldName}`],
                  };
                }
              }
              return { success: true };
            };

            return (
              <form.api.Field
                key={fieldName}
                name={fieldName}
                validators={fieldValidators}
              >
                {(fieldState) => (
                  <FormFieldRenderer
                    schema={currentSchema}
                    fieldState={fieldState}
                    metadata={fieldMetadata}
                    mode={mode}
                    onPatch={handleFieldPatch}
                  />
                )}
              </form.api.Field>
            );
          }}
        />
      </div>

      {/* Callout to show form-level errors */}
      <form.api.Subscribe selector={(state) => [state.errorMap]}>
        {([errorMap]) =>
          errorMap?.onSubmit && mode !== "view" ? (
            <Callout variant="danger" className="mt-4">
              {errorMap.onSubmit}
            </Callout>
          ) : null
        }
      </form.api.Subscribe>
    </div>
  );
};
