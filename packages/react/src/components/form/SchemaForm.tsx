import {
  type BaseSchema,
  BooleanSchema,
  type Infer,
  type LayoutField,
  NumberSchema,
  type ObjectSchema,
  StringSchema,
} from "@nubase/core";
import { OptionalSchema } from "@nubase/core";
import { type ReactFormExtendedApi, useForm } from "@tanstack/react-form";
import type React from "react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useComputedMetadata } from "../../hooks/useComputedMetadata";
import { useLayout } from "../../hooks/useLayout";
import { Button } from "../buttons/Button/Button";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { SchemaFormLayout } from "./SchemaFormLayout";

export type SchemaFormProps<
  TSchema extends ObjectSchema<any>,
  TData extends Infer<TSchema> = Infer<TSchema>,
> = {
  schema: TSchema;
  onSubmit: (data: TData) => void | Promise<void>;
  submitText?: string;
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
  ReactFormExtendedApi<
    Infer<TSchema>,
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

// Helper function to get the default value for a schema
function getDefaultValue(schema: BaseSchema<any>): any {
  if (schema._meta?.defaultValue !== undefined) {
    return schema._meta.defaultValue;
  }
  if (schema instanceof StringSchema) {
    return "";
  }
  if (schema instanceof NumberSchema) {
    return 0;
  }
  if (schema instanceof BooleanSchema) {
    return false;
  }
  // For complex types, return undefined and let the form handle it
  return undefined;
}

// Helper function to transform empty values to null AFTER validation
function transformEmptyToNull(
  values: Record<string, any>,
  schema: ObjectSchema<any>,
): Record<string, any> {
  const transformed = { ...values };

  for (const [key, value] of Object.entries(transformed)) {
    const fieldSchema = schema._shape[key];
    const isRequired = fieldSchema && !(fieldSchema instanceof OptionalSchema);

    // Convert empty values to null for consistency, but only for non-required fields
    if (!isRequired) {
      if (value === "" || (typeof value === "string" && value.trim() === "")) {
        transformed[key] = null;
      } else if (value === 0 && fieldSchema instanceof NumberSchema) {
        // Only convert 0 to null if it's not a required field and you want this behavior
        // transformed[key] = null;
      }
    }
    // Note: We don't transform false to null for booleans as false is a valid value
  }

  return transformed;
}

// Helper function to process form data - validate first, then transform
function processFormData(
  values: Record<string, any>,
  schema: ObjectSchema<any>,
): Record<string, any> {
  // First, validate the raw values with the schema
  const validatedValues = schema.parse(values);

  // Then apply transformations to the validated data
  const processedValues = transformEmptyToNull(validatedValues, schema);

  // Future transformations can be added here
  // processedValues = someOtherTransformation(processedValues);

  return processedValues;
}

export const SchemaForm = forwardRef(
  <TSchema extends ObjectSchema<any>>(
    {
      schema,
      onSubmit,
      submitText = "Submit",
      className = "",
      layoutName,
      computedMetadata,
    }: SchemaFormProps<TSchema>,
    ref: React.Ref<SchemaFormRef<TSchema>>,
  ) => {
    // Create default values from schema
    const defaultValues = Object.entries(schema._shape).reduce(
      (acc, [key, fieldSchema]) => {
        acc[key] = getDefaultValue(fieldSchema as BaseSchema<any>);
        return acc;
      },
      {} as any,
    );

    // Initialize form state that will be updated when the form changes
    const [formState, setFormState] = useState(defaultValues);

    const form = useForm({
      defaultValues,
      listeners: {
        onChange: (formStateEvent) => {
          setFormState(formStateEvent.formApi.state.values);
        },
        onChangeDebounceMs: 200,
      },
      onSubmit: async ({ value }) => {
        try {
          // Process form data (validate and transform empty values to null, etc.)
          const processedData = processFormData(value, schema);
          await onSubmit(processedData);
        } catch (error) {
          console.error("Form validation error:", error);
          // In a real app, you might want to handle this error differently
          throw error;
        }
      },
    });

    // Use computed metadata hook to get merged metadata
    const {
      metadata: mergedMetadata,
      isComputing,
      error: metadataError,
    } = useComputedMetadata(schema, formState, computedMetadata);

    // Use layout hook to get the layout (either specified or default)
    const layout = useLayout(schema, layoutName);

    // Expose form API through ref
    useImperativeHandle(ref, () => form, [form]);

    return (
      <div className={className}>
        {metadataError && (
          <div className="mb-4 p-3 bg-errorContainer border border-error rounded-md text-onErrorContainer text-sm">
            <strong>Metadata Error:</strong> {metadataError.message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <SchemaFormLayout
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

                try {
                  currentSchema.parse(value);
                  return undefined;
                } catch (error) {
                  return error instanceof Error
                    ? error.message
                    : "Invalid value";
                }
              };

              // Validation function for blur - only schema validation, no required check
              const validateFieldOnBlur = ({ value }: { value: any }) => {
                // Skip validation if field is empty (let submit handle required validation)
                if (value === undefined || value === null || value === "") {
                  return undefined;
                }

                try {
                  currentSchema.parse(value);
                  return undefined;
                } catch (error) {
                  return error instanceof Error
                    ? error.message
                    : "Invalid value";
                }
              };

              return (
                <form.Field
                  name={fieldName}
                  validators={{
                    // Validate format on blur, but allow empty values
                    onBlur: validateFieldOnBlur,
                    // Full validation (including required) only on submit
                    onSubmit: validateFieldOnSubmit,
                  }}
                >
                  {(fieldState) => (
                    <FormFieldRenderer
                      schema={currentSchema}
                      fieldState={fieldState}
                      metadata={fieldMetadata}
                    />
                  )}
                </form.Field>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isComputing}>
                {isSubmitting
                  ? "Submitting..."
                  : isComputing
                    ? "Computing..."
                    : submitText}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    );
  },
) as <TSchema extends ObjectSchema<any>>(
  props: SchemaFormProps<TSchema> & { ref?: React.Ref<SchemaFormRef<TSchema>> },
) => React.ReactElement;
