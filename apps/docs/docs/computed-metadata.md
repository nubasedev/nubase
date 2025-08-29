# Computed Metadata in Forms

This document explains how to use computed metadata in nubase forms. Computed metadata allows you to dynamically generate field labels, descriptions, and default values based on the current form state.

## Overview

Computed metadata enables you to:
- Dynamically update field labels based on other field values
- Provide context-aware descriptions that change as users type
- Set default values that depend on other form fields
- Create rich, interactive form experiences

## Basic Usage

### 1. Define a Schema with Computed Metadata

```typescript
import { nu } from '@nubase/core';

const productSchema = nu.object({
  name: nu.string().withMeta({
    label: 'Product Name',
    description: 'Enter the name of the product',
  }),
  category: nu.string().withMeta({
    label: 'Category',
  }),
  price: nu.number().withMeta({
    label: 'Price',
  }),
  discount: nu.number().withMeta({
    label: 'Discount %',
  }),
}).withComputed({
  name: {
    label: async (obj) => `Product: ${obj.name || 'Unnamed Product'}`,
    description: async (obj) => `Product "${obj.name}" in ${obj.category || 'Uncategorized'} category`,
  },
  price: {
    description: async (obj) => {
      const finalPrice = obj.price * (1 - (obj.discount || 0) / 100);
      return `Original: $${obj.price}, Final: $${finalPrice.toFixed(2)} (${obj.discount || 0}% off)`;
    },
  }
});
```

### 2. Use the Schema in a Form

```tsx
import { SchemaForm } from '@nubase/frontend';

const ProductForm = () => {
  const handleSubmit = async (data) => {
    console.log('Product data:', data);
  };
  
  return (
    <SchemaForm
      schema={productSchema}
      onSubmit={handleSubmit}
      submitText="Save Product"
      computedMetadata={{
        debounceMs: 500 // Optional: custom debounce delay
      }}
    />
  );
};
```

## Advanced Features

### Async Computed Functions

All computed metadata functions are async, allowing you to:
- Fetch data from APIs
- Perform complex calculations
- Access external resources

```typescript
const userSchema = nu.object({
  username: nu.string().withMeta({ label: 'Username' }),
  email: nu.string().withMeta({ label: 'Email' }),
}).withComputed({
  username: {
    description: async (obj) => {
      // Example: Check username availability
      if (obj.username) {
        try {
          const available = await checkUsernameAvailability(obj.username);
          return available ? 'Username is available' : 'Username is taken';
        } catch {
          return 'Checking availability...';
        }
      }
      return 'Enter a username';
    },
  }
});
```

### Debounced Updates

The form automatically debounces computed metadata updates to prevent excessive recalculation:

```tsx
<SchemaForm
  schema={mySchema}
  onSubmit={handleSubmit}
  computedMetadata={{
    debounceMs: 300 // Default: 300ms
  }}
/>
```

### Error Handling

The form gracefully handles errors in computed metadata:

```typescript
const schema = nu.object({
  data: nu.string().withMeta({ label: 'Data' }),
}).withComputed({
  data: {
    description: async (obj) => {
      // If this throws an error, the form will fall back to static metadata
      return await processData(obj.data);
    },
  }
});
```

## How It Works

### 1. Metadata Merging

The system merges static metadata with computed metadata:
- Static metadata provides the base values
- Computed metadata overrides specific properties
- The result is a complete metadata object for each field

### 2. Debounced Computation

To optimize performance:
- Form changes trigger a debounced computation (default: 300ms)
- Only the latest form state is used for computation
- Multiple rapid changes don't cause multiple computations

### 3. Form Integration

The `SchemaForm` component:
- Uses the `useComputedMetadata` hook internally
- Automatically updates field labels and descriptions
- Shows loading states during computation
- Displays error messages if computation fails

## API Reference

### ObjectSchema.withComputed()

```typescript
withComputed(computedMeta: ObjectComputedMetadata<TShape>): this
```

Adds computed metadata to an object schema.

**Parameters:**
- `computedMeta`: Object mapping property keys to computed metadata functions

**Returns:** The schema instance for chaining

### ObjectSchema.getAllMergedMeta()

```typescript
async getAllMergedMeta(data: Partial<ObjectOutput<TShape>>): Promise<Record<keyof TShape, SchemaMetadata<any>>>
```

Gets merged metadata (static + computed) for all properties.

**Parameters:**
- `data`: Current form data to pass to computed functions

**Returns:** Promise resolving to merged metadata for all properties

### useComputedMetadata Hook

```typescript
function useComputedMetadata<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>,
  formData: Partial<ObjectOutput<TShape>>,
  options?: UseComputedMetadataOptions
): UseComputedMetadataResult<TShape>
```

React hook for debounced computed metadata.

**Parameters:**
- `schema`: The ObjectSchema with computed metadata
- `formData`: Current form data
- `options`: Configuration options

**Returns:**
- `metadata`: Merged metadata for all properties
- `isComputing`: Whether metadata is currently being computed
- `error`: Error that occurred during computation, if any

### SchemaForm computedMetadata Prop

```typescript
computedMetadata?: {
  debounceMs?: number; // Debounce delay in milliseconds (default: 300ms)
}
```

## Best Practices

### 1. Use Reasonable Debounce Times
- For simple computations: 200-300ms
- For API calls: 500-1000ms
- For complex calculations: 300-500ms

### 2. Handle Loading States
The form automatically shows "Computing..." in the submit button when metadata is being calculated.

### 3. Provide Fallbacks
Always provide static metadata as fallbacks in case computed metadata fails.

### 4. Optimize Computations
- Cache expensive calculations when possible
- Use early returns for incomplete data
- Avoid side effects in computed functions

### 5. Error Handling
Computed functions should handle their own errors gracefully and return meaningful fallback values.

## Examples

### E-commerce Product Form

```typescript
const productSchema = nu.object({
  name: nu.string().withMeta({ label: 'Product Name' }),
  category: nu.string().withMeta({ label: 'Category' }),
  basePrice: nu.number().withMeta({ label: 'Base Price' }),
  discountPercent: nu.number().withMeta({ label: 'Discount %' }),
  taxRate: nu.number().withMeta({ label: 'Tax Rate %' }),
}).withComputed({
  name: {
    label: async (obj) => obj.category ? `${obj.category} Product Name` : 'Product Name',
  },
  basePrice: {
    description: async (obj) => {
      const discount = (obj.discountPercent || 0) / 100;
      const tax = (obj.taxRate || 0) / 100;
      const discountedPrice = obj.basePrice * (1 - discount);
      const finalPrice = discountedPrice * (1 + tax);
      return `Final price: $${finalPrice.toFixed(2)} (after ${obj.discountPercent || 0}% discount + ${obj.taxRate || 0}% tax)`;
    },
  }
});
```

### User Profile Form

```typescript
const userSchema = nu.object({
  firstName: nu.string().withMeta({ label: 'First Name' }),
  lastName: nu.string().withMeta({ label: 'Last Name' }),
  email: nu.string().withMeta({ label: 'Email' }),
  role: nu.string().withMeta({ label: 'Role' }),
}).withComputed({
  email: {
    label: async (obj) => `Email for ${obj.firstName || ''} ${obj.lastName || ''}`.trim() || 'Email',
    description: async (obj) => {
      if (obj.role === 'admin') {
        return 'Admin email - will receive system notifications';
      }
      return 'Primary contact email address';
    },
  }
});
``` 