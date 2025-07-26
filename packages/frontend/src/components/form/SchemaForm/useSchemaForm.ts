import {
  type BaseSchema,
  BooleanSchema,
  type Infer,
  NumberSchema,
  type ObjectSchema,
  OptionalSchema,
} from "@nubase/core";
import { type ReactFormExtendedApi, useForm } from "@tanstack/react-form";
import { useMemo, useState } from "react";

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
  /** Initial values for the form fields */
  initialValues?: Partial<TData>;
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
  const validatedValues = schema.toZod().parse(values);

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
  const { schema, onSubmit, mode = "edit", onPatch, initialValues } = options;

  // Validate mode and onPatch combination
  if (mode === "patch" && !onPatch) {
    throw new Error("onPatch is required when mode is 'patch'");
  }

  // Create default values from schema and merge with initial values
  const defaultValues = Object.entries(schema._shape).reduce(
    (acc, [key, fieldSchema]) => {
      const baseFieldSchema = fieldSchema as BaseSchema<any>;
      const defaultValue = baseFieldSchema._meta?.defaultValue;

      // Use initial value if provided, otherwise use schema default or type default
      acc[key] =
        initialValues?.[key as keyof TData] ??
        defaultValue ??
        (baseFieldSchema instanceof BooleanSchema ? false : "");

      return acc;
    },
    {} as Record<string, any>,
  ) as TData;

  // Keep track of form state for computed metadata
  const [formState, setFormState] =
    useState<Record<string, any>>(defaultValues);

  // Create validators for the form level
  const formValidators: any = {};

  // Only add validators if they exist
  if (schema._meta?.validateOnSubmit || schema._meta?.validateOnSubmitAsync) {
    formValidators.onSubmit = ({ value }: { value: TData }) => {
      // Run form-level sync validation
      if (schema._meta?.validateOnSubmit) {
        const error = schema._meta.validateOnSubmit(value);
        if (error) {
          return error;
        }
      }
      return undefined;
    };

    const validateOnSubmitAsync = schema._meta?.validateOnSubmitAsync;
    if (validateOnSubmitAsync) {
      formValidators.onSubmitAsync = async ({ value }: { value: TData }) => {
        const error = await validateOnSubmitAsync(value);
        if (error) {
          return error;
        }
        return undefined;
      };
    }
  }

  const form = useForm({
    defaultValues,
    listeners: {
      onChange: (formStateEvent) => {
        setFormState(formStateEvent.formApi.state.values);
      },
      onChangeDebounceMs: 200,
    },
    validators:
      Object.keys(formValidators).length > 0 ? formValidators : undefined,
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

  // Return the configuration object
  return useMemo(
    (): SchemaFormConfiguration<TSchema> => ({
      api: form,
      schema,
      mode,
      onPatch,
      formState,
    }),
    [form, schema, mode, onPatch, formState],
  );
}
