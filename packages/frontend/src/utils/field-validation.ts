import {
  type BaseSchema,
  type ObjectSchema,
  OptionalSchema,
} from "@nubase/core";

/**
 * Field validation utilities for patch operations
 * Handles empty value coercion and required field validation
 */

export interface FieldValidationResult {
  isValid: boolean;
  transformedValue: any;
  errors: string[];
}

/**
 * Coerces empty values (empty string, null, undefined) to null
 * for all fields before network operations
 */
export function coerceEmptyToNull(value: any): any {
  // Coerce empty strings, null, and undefined to null
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  // Trim strings and coerce if empty after trim
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}

/**
 * Validates a field value for patch operations
 * Checks if required fields are being set to null/empty
 */
export function validateFieldForPatch(
  fieldName: string,
  value: any,
  schema: ObjectSchema<any>,
): FieldValidationResult {
  const fieldSchema = schema._shape[fieldName] as BaseSchema<any>;

  // Transform the value first
  const transformedValue = coerceEmptyToNull(value);

  // Check if field exists in schema
  if (!fieldSchema) {
    return {
      isValid: false,
      transformedValue,
      errors: [`Field "${fieldName}" is not defined in the schema`],
    };
  }

  // Check if field is required (not wrapped in OptionalSchema)
  const isRequired = !(fieldSchema instanceof OptionalSchema);

  // If field is required and we're trying to set it to null, that's an error
  if (isRequired && transformedValue === null) {
    return {
      isValid: false,
      transformedValue,
      errors: [`${fieldName} is required and cannot be empty`],
    };
  }

  // Field-level validation from schema metadata
  if (fieldSchema._meta?.validateOnSubmit) {
    try {
      const validationError =
        fieldSchema._meta.validateOnSubmit(transformedValue);
      if (validationError) {
        return {
          isValid: false,
          transformedValue,
          errors: [validationError],
        };
      }
    } catch (error) {
      return {
        isValid: false,
        transformedValue,
        errors: [`Validation error: ${(error as Error).message}`],
      };
    }
  }

  // Async validation would need to be handled separately
  // We're focusing on sync validation for patch operations

  return {
    isValid: true,
    transformedValue,
    errors: [],
  };
}

/**
 * Enhanced version of transformEmptyToNull that works for ALL fields
 * regardless of OptionalSchema wrapper
 */
export function transformEmptyToNullForAllFields(
  values: Record<string, any>,
  _schema: ObjectSchema<any>,
): Record<string, any> {
  const transformed = { ...values };

  for (const [key, value] of Object.entries(values)) {
    transformed[key] = coerceEmptyToNull(value);
  }

  return transformed;
}

/**
 * Validates multiple fields for patch operations
 */
export function validateFieldsForPatch(
  values: Record<string, any>,
  schema: ObjectSchema<any>,
): {
  isValid: boolean;
  transformedValues: Record<string, any>;
  errors: Record<string, string[]>;
} {
  const transformedValues: Record<string, any> = {};
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [fieldName, value] of Object.entries(values)) {
    const result = validateFieldForPatch(fieldName, value, schema);
    transformedValues[fieldName] = result.transformedValue;

    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
  }

  return {
    isValid,
    transformedValues,
    errors,
  };
}
