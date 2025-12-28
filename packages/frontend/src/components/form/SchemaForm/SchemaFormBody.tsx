import {
  type BaseSchema,
  type FormLayoutField,
  OptionalSchema,
} from "@nubase/core";
import type React from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import { useComputedMetadata } from "../../../hooks/useComputedMetadata";
import { useLayout } from "../../../hooks/useLayout";
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
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive-foreground text-sm">
          <strong>Metadata Error:</strong> {metadataError.message}
        </div>
      )}

      <div className="flex-1 space-y-4">
        <SchemaFormVerticalLayout
          layout={layout}
          renderField={(field: FormLayoutField<any>) => {
            const fieldName = field.name as string;
            const currentSchema = schema._shape[fieldName] as BaseSchema<any>;
            const fieldMetadata =
              mergedMetadata[fieldName] ?? currentSchema._meta;

            // TanStack Form validation function
            const validateFieldOnSubmit = ({ value }: { value: any }) => {
              // Check if field is required and empty
              const isFieldRequired =
                currentSchema && !(currentSchema instanceof OptionalSchema);
              if (isFieldRequired) {
                if (value === undefined || value === null || value === "") {
                  return `${fieldName} is required and cannot be empty`;
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

            // Use TanStack Form validation for all scenarios
            fieldValidators.onSubmit = validateFieldOnSubmit;
            // Also validate on blur for immediate feedback
            fieldValidators.onBlur = validateFieldOnSubmit;

            // Add async validators if they exist
            if (fieldMetadata?.validateOnSubmitAsync) {
              fieldValidators.onSubmitAsync = validateFieldOnSubmitAsync;
            }
            // Add custom onBlur validation if specified in metadata
            if (fieldMetadata?.validateOnBlur) {
              const customBlurValidation = fieldMetadata.validateOnBlur;
              fieldValidators.onBlur = ({ value }: { value: any }) => {
                // Run base validation first
                const baseError = validateFieldOnSubmit({ value });
                if (baseError) return baseError;

                // Then run custom blur validation
                return customBlurValidation(value);
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
              fieldState?: any, // Will receive fieldState from FormFieldRenderer
            ): Promise<PatchResult> => {
              if (mode === "patch" && onPatch && fieldState) {
                // Force validation to run on the current value
                await fieldState.validate("submit");

                // Check TanStack Form's validation state
                // Don't return validation errors - FormControl already shows them
                if (fieldState.state.meta.errors.length > 0) {
                  // Just prevent the network call, don't return errors for PatchWrapper to show
                  return { success: false, errors: [] };
                }

                try {
                  // Transform empty values to null for network call
                  const transformedValue =
                    value === "" || value === undefined ? null : value;
                  await onPatch(fieldName, transformedValue);
                  return { success: true };
                } catch (error) {
                  return {
                    success: false,
                    errors: [
                      `Failed to update ${fieldName}: ${(error as Error).message}`,
                    ],
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
    </div>
  );
};
