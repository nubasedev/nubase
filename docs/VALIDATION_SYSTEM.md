# Field Validation System for Patch Operations

## Overview

This document describes the field validation system implemented to prevent empty values from being patched and to provide proper validation messaging to users.

## Problem Statement

The original issue was that when users visited `http://localhost:3000/r/ticket/view?id=37` and tried to patch the title field with empty values, the system would:
- Allow empty strings to be sent to the network
- Not provide validation feedback to the user
- Not respect field requirement metadata

## Solution Architecture

The validation system consists of several coordinated components:

### 1. Field Validation Utilities (`src/utils/field-validation.ts`)

#### `coerceEmptyToNull(value: any): any`
Converts empty values to null before network operations:
- Empty strings (`""`) → `null`
- Whitespace-only strings (`"   "`) → `null`  
- `null` and `undefined` → `null`
- Preserves all other values unchanged

#### `validateFieldForPatch(fieldName: string, value: any, schema: ObjectSchema): FieldValidationResult`
Validates individual fields for patch operations:
- Checks if field exists in schema
- Determines if field is required (not wrapped in `OptionalSchema`)
- Validates that required fields are not being set to null
- Runs custom field-level validation if present in schema metadata
- Returns structured validation result with errors

#### `transformEmptyToNullForAllFields(values: Record<string, any>, schema: ObjectSchema): Record<string, any>`
Enhanced version of the original transformation that works for ALL fields, not just optional ones.

#### `validateFieldsForPatch(values: Record<string, any>, schema: ObjectSchema)`
Batch validation for multiple fields with comprehensive error reporting.

### 2. ResourceViewViewRenderer Integration

The `ResourceViewViewRenderer` component now validates fields before sending patch requests:

```typescript
onPatch: async (fieldName: string, value: any) => {
  try {
    // Validate field before sending to network
    const validationResult = validateFieldForPatch(fieldName, value, view.schema);
    
    if (!validationResult.isValid) {
      // Throw error to be caught by PatchWrapper
      const errorMessage = validationResult.errors.join(', ');
      throw new Error(errorMessage);
    }
    
    const patchData = { [fieldName]: validationResult.transformedValue };
    // ... rest of patch logic
  } catch (error) {
    onError?.(error as Error);
  }
}
```

### 3. Enhanced PatchWrapper Error Handling

The `PatchWrapper` component now provides better error messaging:

```typescript
catch (error) {
  const errorMessage = (error as Error).message;
  
  // If it's a validation error (contains field requirement info), show it directly
  if (errorMessage.includes('is required') || errorMessage.includes('cannot be empty')) {
    setValidationErrors([errorMessage]);
  } else {
    // Generic error for other types of failures
    setValidationErrors(["An unexpected error occurred. Please try again."]);
  }
}
```

## Validation Flow

1. **User attempts to patch a field** with an empty value
2. **Field validation utility** coerces empty values to null
3. **Schema validation** checks if the field is required
4. **If field is required and null**: Validation fails with descriptive error message
5. **If field is optional or has valid value**: Validation passes, transformed value used
6. **PatchWrapper** receives validation error and displays it to the user
7. **User sees clear message** like "title is required and cannot be empty"

## Key Features

### Empty Value Coercion
- All empty strings, whitespace, null, and undefined values are coerced to null
- This happens BEFORE network requests are made
- Consistent handling across all field types

### Field-Level Validation
- Only validates the specific field being patched
- Does not run form-level validation (as per requirements)
- Respects schema metadata for custom validation rules

### Required Field Detection
- Automatically detects required fields (not wrapped in `OptionalSchema`)
- Provides clear error messages for required field violations
- Allows optional fields to be set to null

### Error Messaging
- Descriptive error messages: "fieldName is required and cannot be empty"
- Distinguishes between validation errors and network errors
- Errors are cleared when user starts modifying the field

## Testing

Comprehensive test suite with 15 test cases covering:
- Empty value coercion logic
- Required vs optional field validation
- Single field and batch field validation
- Error message formatting
- Schema metadata integration

All tests pass successfully.

## Usage Examples

### Required Field Validation
```typescript
// Schema definition
const schema = new ObjectSchema({
  title: new StringSchema(), // Required
  description: new OptionalSchema(new StringSchema()) // Optional
});

// Validation results
validateFieldForPatch("title", "", schema)
// → { isValid: false, transformedValue: null, errors: ["title is required and cannot be empty"] }

validateFieldForPatch("description", "", schema)  
// → { isValid: true, transformedValue: null, errors: [] }
```

### Integration with PatchWrapper
When a user tries to save an empty required field, they see:
- Clear error message below the input field
- Red error styling
- Ability to modify the field to clear the error
- Prevention of the network request until validation passes

## Benefits

1. **User Experience**: Clear, immediate feedback on validation errors
2. **Data Integrity**: Prevents invalid data from reaching the backend
3. **Consistency**: Uniform handling of empty values across all fields
4. **Performance**: Client-side validation prevents unnecessary network requests
5. **Maintainability**: Centralized validation logic with comprehensive test coverage

## Future Enhancements

- Async field validation support
- Custom validation message templates
- Integration with form-level validation when needed
- Advanced schema metadata support