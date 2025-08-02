import {
  type BaseSchema,
  BooleanSchema,
  type Infer,
  NumberSchema,
  type ObjectSchema,
  OptionalSchema,
  StringSchema,
} from "@nubase/core";
import { type ReactFormExtendedApi, useForm } from "@tanstack/react-form";
import { useState } from "react";

export interface SchemaFormConfiguration<
  TSchema extends ObjectSchema<any> = ObjectSchema<any>,
  TData = any,
> {
  api: ReactFormExtendedApi<TData, any, any, any, any, any, any, any, any, any>;
  schema: TSchema;
  mode: "edit" | "view" | "patch";
  onPatch?: (fieldName: string, value: any) => Promise<void>;
  formState: Record<string, any>;
}

export type UseSchemaFormOptions<
  TSchema extends ObjectSchema<any>,
  TData extends Infer<TSchema> = Infer<TSchema>,
> = {
  schema: TSchema;
  onSubmit: (data: TData) => void | Promise<void>;
  /** Form mode - edit, view, or patch. Defaults to edit. When patch mode is used, onPatch is required. */
  mode?: "edit" | "view" | "patch";
  /** Callback for patching individual fields in patch mode */
  onPatch?: (fieldName: string, value: any) => Promise<void>;
};

// Helper function to transform empty strings and 0 to null for optional fields
function transformEmptyToNull(
  values: Record<string, any>,
  schema: ObjectSchema<any>,
): Record<string, any> {
  const transformed = { ...values };

  for (const [key, value] of Object.entries(values)) {
    const fieldSchema = schema._shape[key] as BaseSchema<any>;

    // Check if the field is optional
    if (fieldSchema instanceof OptionalSchema) {
      // Transform empty strings to null for optional fields
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

export function useSchemaForm<
  TSchema extends ObjectSchema<any>,
  TData extends Infer<TSchema> = Infer<TSchema>,
>(
  options: UseSchemaFormOptions<TSchema, TData>,
): SchemaFormConfiguration<TSchema> {
  const { schema, onSubmit, mode = "edit", onPatch } = options;

  // Validate mode and onPatch combination
  if (mode === "patch" && !onPatch) {
    throw new Error("onPatch is required when mode is 'patch'");
  }

  // Create default values from schema
  const defaultValues = Object.entries(schema._shape).reduce(
    (acc, [key, fieldSchema]) => {
      const baseFieldSchema = fieldSchema as BaseSchema<any>;
      const defaultValue = baseFieldSchema._meta?.defaultValue;
      acc[key] =
        defaultValue ?? (baseFieldSchema instanceof BooleanSchema ? false : "");
      return acc;
    },
    {} as Record<string, any>,
  ) as TData;

  // Keep track of form state for computed metadata
  const [formState, setFormState] =
    useState<Record<string, any>>(defaultValues);

  // Create validators for the form level
  const formValidators = {
    onSubmit: async ({ value }: { value: TData }) => {
      // Run form-level sync validation
      if (schema._meta?.validateOnSubmit) {
        const error = schema._meta.validateOnSubmit(value);
        if (error) {
          return error;
        }
      }

      // Run form-level async validation
      if (schema._meta?.validateOnSubmitAsync) {
        const error = await schema._meta.validateOnSubmitAsync(value);
        if (error) {
          return error;
        }
      }

      return undefined;
    },
  };

  const form = useForm({
    defaultValues,
    listeners: {
      onChange: (formStateEvent) => {
        setFormState(formStateEvent.formApi.state.values);
      },
      onChangeDebounceMs: 200,
    },
    validators: formValidators,
    onSubmit: async ({ value }) => {
      try {
        // Process form data (validate and transform empty values to null, etc.)
        const processedData = processFormData(value, schema) as TData;
        await onSubmit(processedData);
      } catch (error) {
        console.error("Form validation error:", error);
        // In a real app, you might want to handle this error differently
        throw error;
      }
    },
  });

  // Return a clean configuration object with the form API
  return {
    api: form,
    schema,
    mode,
    onPatch,
    formState,
  };
}
