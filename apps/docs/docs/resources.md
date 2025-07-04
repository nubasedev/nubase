---
sidebar_position: 2
---

# Resources

This page contains helpful resources, examples, and references for working with Nubase.

## Quick Reference

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Schema** | Defines the structure and validation rules for your data |
| **Resource** | A collection of related data managed by a schema |
| **Computed Metadata** | Properties automatically derived from schema definitions |
| **Layout** | UI structure and field arrangements |

### Common Field Types

```typescript
// Basic field types
const basicFields = {
  text: { type: 'string' },
  number: { type: 'number' },
  email: { type: 'email' },
  date: { type: 'date' },
  boolean: { type: 'boolean' },
  json: { type: 'json' }
};

// Field with validation
const validatedFields = {
  username: { 
    type: 'string', 
    required: true, 
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  age: { 
    type: 'number', 
    min: 0, 
    max: 150 
  }
};
```

## Schema Examples

### Basic User Schema

```typescript
import { defineSchema } from '@nubase/core';

export const userSchema = defineSchema({
  name: 'User',
  fields: {
    id: { type: 'string', required: true },
    email: { type: 'email', required: true },
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    age: { type: 'number', min: 0, max: 150 },
    isActive: { type: 'boolean', default: true },
    createdAt: { type: 'date', default: () => new Date() },
    profile: {
      type: 'object',
      properties: {
        bio: { type: 'string', maxLength: 500 },
        avatar: { type: 'string' },
        preferences: { type: 'json' }
      }
    }
  }
});
```

### Product Schema with Computed Fields

```typescript
import { defineSchema } from '@nubase/core';

export const productSchema = defineSchema({
  name: 'Product',
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    price: { type: 'number', required: true, min: 0 },
    quantity: { type: 'number', required: true, min: 0 },
    category: { type: 'string', required: true },
    description: { type: 'string', maxLength: 1000 },
    isActive: { type: 'boolean', default: true }
  },
  computed: {
    totalValue: (data) => data.price * data.quantity,
    isExpensive: (data) => data.price > 1000,
    displayName: (data) => `${data.name} (${data.category})`
  }
});
```

## React Integration

### Using Schema Forms

```typescript
import { SchemaForm } from '@nubase/react';
import { userSchema } from './schemas/user';

export function UserForm() {
  const handleSubmit = (data) => {
    console.log('User data:', data);
  };

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
      initialData={{ isActive: true }}
    />
  );
}
```

### Custom Field Components

```typescript
import { useField } from '@nubase/react';

export function CustomTextField({ name, label, ...props }) {
  const { value, onChange, error } = useField(name);

  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

## Advanced Features

### Conditional Fields

```typescript
const conditionalSchema = defineSchema({
  name: 'ConditionalExample',
  fields: {
    userType: { 
      type: 'string', 
      enum: ['individual', 'business'],
      required: true 
    },
    personalInfo: {
      type: 'object',
      condition: (data) => data.userType === 'individual',
      properties: {
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true }
      }
    },
    businessInfo: {
      type: 'object',
      condition: (data) => data.userType === 'business',
      properties: {
        companyName: { type: 'string', required: true },
        taxId: { type: 'string', required: true }
      }
    }
  }
});
```

### Custom Validation

```typescript
const customValidationSchema = defineSchema({
  name: 'CustomValidation',
  fields: {
    password: { type: 'string', required: true },
    confirmPassword: { type: 'string', required: true }
  },
  validation: {
    passwordMatch: (data) => {
      if (data.password !== data.confirmPassword) {
        return 'Passwords do not match';
      }
      return null;
    }
  }
});
```

## Best Practices

### Schema Organization

```typescript
// schemas/index.ts
export { userSchema } from './user';
export { productSchema } from './product';
export { orderSchema } from './order';

// Keep schemas in separate files
// Use consistent naming conventions
// Document complex validation rules
```

### Error Handling

```typescript
import { validateSchema } from '@nubase/core';

try {
  const result = validateSchema(userSchema, userData);
  if (!result.isValid) {
    console.error('Validation errors:', result.errors);
  }
} catch (error) {
  console.error('Schema validation failed:', error);
}
```

### Performance Tips

- Use computed fields for derived values instead of calculating on every render
- Implement field-level validation for better UX
- Use conditional fields to reduce form complexity
- Cache schema definitions when possible

## Community Resources

- [GitHub Repository](https://github.com/your-org/nubase)
- [Example Projects](https://github.com/your-org/nubase-examples)
- [API Reference](https://docs.nubase.dev/api)
- [Community Discord](https://discord.gg/nubase)

---

Need help with something specific? Check out our [GitHub Issues](https://github.com/your-org/nubase/issues) or join our community discussions! 