import {
  type BaseSchema,
  BooleanSchema,
  type Infer,
  NumberSchema,
  type ObjectSchema,
  StringSchema,
} from "@nubase/core";
import { useForm } from "@tanstack/react-form";
import type React from "react";
import { useState } from "react";
import { useComputedMetadata } from "../../hooks/useComputedMetadata";
import { useLayout } from "../../hooks/useLayout";
import { Button } from "../buttons/Button/Button";
import { FormControl } from "../form-controls/FormControl/FormControl";
import { FormFieldRenderer } from "./FormFieldRenderer";

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
    const isRequired = fieldSchema?._meta?.required;

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

export const SchemaForm = <TSchema extends ObjectSchema<any>>({
  schema,
  onSubmit,
  submitText = "Submit",
  className = "",
  layoutName,
  computedMetadata,
}: SchemaFormProps<TSchema>) => {
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
        {/* Always render using layout configuration */}
        <div className={`layout-${layout.type} ${layout.className || ""}`}>
          {layout.groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`form-group ${group.className || ""} mb-6`}
            >
              {group.label && (
                <h3 className="text-lg font-medium mb-3 text-onSurface">
                  {group.label}
                </h3>
              )}
              {group.description && (
                <p className="text-sm text-onSurfaceVariant mb-3">
                  {group.description}
                </p>
              )}
              <div className="space-y-4">
                {(() => {
                  // Group fields into rows based on their sizes
                  const rows: Array<typeof group.fields> = [];
                  let currentRow: typeof group.fields = [];
                  let currentRowWidth = 0;

                  for (const field of group.fields) {
                    if (field.hidden) continue;

                    const fieldSize = field.size || 12;

                    // If adding this field would exceed 12, start a new row
                    if (
                      currentRowWidth + fieldSize > 12 &&
                      currentRow.length > 0
                    ) {
                      rows.push([...currentRow]);
                      currentRow = [field];
                      currentRowWidth = fieldSize;
                    } else {
                      currentRow.push(field);
                      currentRowWidth += fieldSize;
                    }

                    // If this field exactly fills the row, start a new row
                    if (currentRowWidth === 12) {
                      rows.push([...currentRow]);
                      currentRow = [];
                      currentRowWidth = 0;
                    }
                  }

                  // Add any remaining fields in the last row
                  if (currentRow.length > 0) {
                    rows.push([...currentRow]);
                  }

                  return rows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid grid-cols-12 gap-4 w-full"
                    >
                      {row.map((field) => {
                        const fieldName = field.name as string;
                        const currentSchema = schema._shape[
                          fieldName
                        ] as BaseSchema<any>;
                        const fieldMetadata =
                          mergedMetadata[fieldName] || currentSchema._meta;
                        const fieldSize = field.size || 12;

                        // Generate the correct col-span class based on size
                        const getColSpanClass = (size: number) => {
                          const colSpanMap: Record<number, string> = {
                            1: "col-span-1",
                            2: "col-span-2",
                            3: "col-span-3",
                            4: "col-span-4",
                            5: "col-span-5",
                            6: "col-span-6",
                            7: "col-span-7",
                            8: "col-span-8",
                            9: "col-span-9",
                            10: "col-span-10",
                            11: "col-span-11",
                            12: "col-span-12",
                          };
                          return colSpanMap[size] || "col-span-12";
                        };

                        // Validation function for submit - includes required field check
                        const validateFieldOnSubmit = ({
                          value,
                        }: { value: any }) => {
                          // Check if field is required and empty
                          if (fieldMetadata.required) {
                            if (
                              value === undefined ||
                              value === null ||
                              value === ""
                            ) {
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
                        const validateFieldOnBlur = ({
                          value,
                        }: { value: any }) => {
                          // Skip validation if field is empty (let submit handle required validation)
                          if (
                            value === undefined ||
                            value === null ||
                            value === ""
                          ) {
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
                          <div
                            key={fieldName}
                            className={`${getColSpanClass(fieldSize)} ${field.className || ""}`}
                          >
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
                                <FormControl
                                  label={fieldMetadata.label || fieldName}
                                  hint={fieldMetadata.description}
                                  field={fieldState}
                                  required={fieldMetadata.required || false}
                                >
                                  <FormFieldRenderer
                                    fieldName={fieldName}
                                    schema={currentSchema}
                                    field={fieldState}
                                    metadata={fieldMetadata}
                                    hasError={
                                      fieldState.state.meta.isTouched &&
                                      !fieldState.state.meta.isValid
                                    }
                                  />
                                </FormControl>
                              )}
                            </form.Field>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>

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
};
