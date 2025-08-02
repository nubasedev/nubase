import {
  type BaseSchema,
  type Infer,
  type LayoutField,
  type ObjectSchema,
  OptionalSchema,
} from "@nubase/core";
import type React from "react";
import { forwardRef, useImperativeHandle } from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import { useComputedMetadata } from "../../../hooks/useComputedMetadata";
import { useLayout } from "../../../hooks/useLayout";
import { Callout } from "../../callout/Callout";
import { FormFieldRenderer } from "../FormFieldRenderer/FormFieldRenderer";
import { SchemaFormVerticalLayout } from "./SchemaFormVerticalLayout";

export type SchemaFormProps<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TData extends Infer<TSchema> = Infer<TSchema>,
> = {
  /** Form configuration from useSchemaForm hook */
  form: SchemaFormConfiguration<TSchema>;
  className?: string;
  /** Specify which layout to use (if schema has layouts defined) */
  layoutName?: string;
  /** Options for computed metadata behavior */
  computedMetadata?: {
    /** Debounce delay in milliseconds for computed metadata updates (default: 300ms) */
    debounceMs?: number;
  };
};

export type SchemaFormRef<TSchema extends ObjectSchema<any>> =
  SchemaFormConfiguration<TSchema>;

export const SchemaForm = forwardRef(
  <TSchema extends ObjectSchema<any>>(
    {
      form,
      className = "",
      layoutName,
      computedMetadata,
    }: SchemaFormProps<TSchema>,
    ref: React.Ref<SchemaFormRef<TSchema>>,
  ) => {
    // Get schema and other properties from the form configuration
    const { schema, mode, onPatch, formState } = form;

    // Use computed metadata hook to get merged metadata
    const {
      metadata: mergedMetadata,
      isComputing,
      error: metadataError,
    } = useComputedMetadata(schema, formState, computedMetadata);

    // Use layout hook to get the layout (either specified or default)
    const layout = useLayout(schema, layoutName);

    // Expose form configuration through ref
    useImperativeHandle(ref, () => form, [form]);

    return (
      <div className={`flex flex-col ${className}`}>
        {metadataError && (
          <div className="mb-4 p-3 bg-errorContainer border border-error rounded-md text-onErrorContainer text-sm">
            <strong>Metadata Error:</strong> {metadataError.message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.api.handleSubmit();
          }}
          className="flex-1 space-y-4"
        >
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
                  const error =
                    await fieldMetadata.validateOnSubmitAsync(value);
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

              const handleFieldPatch = async (value: any) => {
                if (mode === "patch" && onPatch) {
                  try {
                    await onPatch(fieldName, value);
                  } catch (error) {
                    console.error(`Error patching field ${fieldName}:`, error);
                    throw error;
                  }
                }
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
        </form>

        {/* Callout to show form-level errors */}
        {form.api.state?.errors?.length > 0 && mode !== "view" && (
          <Callout variant="danger" className="mt-4">
            <ul>
              {form.api.state.errors.map((error, index) => (
                <li key={`${index}-${error}`}>{error}</li>
              ))}
            </ul>
          </Callout>
        )}
      </div>
    );
  },
);

SchemaForm.displayName = "SchemaForm";
