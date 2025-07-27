---
sidebar_position: 2
---

# Schema System

The Nubase schema system is a powerful, type-safe validation and form generation library that serves as the foundation for building business applications. It provides a declarative way to define data structures with validation, metadata, and computed properties.

> **Note:** For information about form layouts and UI organization, see the [Layout System](./layout-system.md) documentation.

## Overview

The schema system consists of two main parts:

- **`nu`** - A factory object that provides convenient methods to create schema instances
- **Schema Classes** - The actual implementation classes that handle validation, parsing, and metadata

## Basic Usage

### Creating Schemas

Use the `nu` factory to create schemas:

```typescript
import { nu } from '@nubase/core';

// Primitive schemas
const nameSchema = nu.string();
const ageSchema = nu.number();
const activeSchema = nu.boolean();

// Object schema
const userSchema = nu.object({
  name: nu.string(),
  age: nu.number(),
  isActive: nu.boolean()
});

// Array schema
const tagsSchema = nu.array(nu.string());
```

### Adding Metadata

All schemas support metadata for form generation and documentation:

```typescript
const userSchema = nu.object({
  name: nu.string().withMeta({
    label: "Full Name",
    description: "Enter your complete name",
    required: true
  }),
  email: nu.string().withMeta({
    label: "Email Address",
    description: "We'll use this to contact you"
  }),
  age: nu.number().withMeta({
    label: "Age",
    defaultValue: 18
  })
});
```

### Parsing and Validation

Schemas validate and parse data:

```typescript
const userSchema = nu.object({
  name: nu.string(),
  age: nu.number()
});

// Valid data
const userData = { name: "John Doe", age: 30 };
const parsed = userSchema.parse(userData);
// Returns: { name: "John Doe", age: 30 }

// Invalid data throws an error
try {
  userSchema.parse({ name: "John", age: "thirty" });
} catch (error) {
  console.log(error.message);
  // "Object validation failed: Property "age": Expected number, received string"
}
```

## Schema Types

### Primitive Schemas

#### StringSchema

```typescript
const nameSchema = nu.string().withMeta({
  label: "Name",
  description: "Enter your name"
});

nameSchema.parse("John"); // ✅ Returns "John"
nameSchema.parse(123);    // ❌ Throws error
```

#### NumberSchema

```typescript
const ageSchema = nu.number().withMeta({
  label: "Age",
  defaultValue: 0
});

ageSchema.parse(25);     // ✅ Returns 25
ageSchema.parse("25");   // ❌ Throws error
ageSchema.parse(NaN);    // ❌ Throws error
ageSchema.parse(Infinity); // ❌ Throws error
```

#### BooleanSchema

```typescript
const activeSchema = nu.boolean().withMeta({
  label: "Active Status",
  defaultValue: true
});

activeSchema.parse(true);    // ✅ Returns true
activeSchema.parse(false);   // ✅ Returns false
activeSchema.parse("true");  // ❌ Throws error
```

### Complex Schemas

#### ObjectSchema

Object schemas define the structure of complex data:

```typescript
const addressSchema = nu.object({
  street: nu.string().withMeta({ label: "Street" }),
  city: nu.string().withMeta({ label: "City" }),
  zip: nu.string().withMeta({ label: "ZIP Code" })
});

const userSchema = nu.object({
  id: nu.number().withMeta({ label: "ID" }),
  name: nu.string().withMeta({ label: "Full Name" }),
  address: addressSchema
}).withMeta({
  description: "User Profile"
});

// Type inference works automatically
type User = typeof userSchema._outputType;
// Inferred as: { id: number; name: string; address: { street: string; city: string; zip: string; } }
```

#### ArraySchema

Array schemas validate collections:

```typescript
const stringArraySchema = nu.array(nu.string());
const userArraySchema = nu.array(userSchema);

stringArraySchema.parse(["a", "b", "c"]); // ✅
stringArraySchema.parse(["a", 123, "c"]); // ❌ Throws error

userArraySchema.parse([
  { id: 1, name: "John", address: { street: "123 Main", city: "NYC", zip: "10001" } }
]); // ✅
```

#### PartialObjectSchema

Makes all properties optional:

```typescript
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string()
});

const partialUserSchema = userSchema.partial();

// All properties are now optional
partialUserSchema.parse({}); // ✅ Returns {}
partialUserSchema.parse({ name: "John" }); // ✅ Returns { name: "John" }
partialUserSchema.parse({ id: 1, email: "john@example.com" }); // ✅
```

## Computed Metadata

Computed metadata allows dynamic metadata based on form data:

```typescript
const productSchema = nu.object({
  name: nu.string().withMeta({ label: "Product Name" }),
  category: nu.string().withMeta({ label: "Category" }),
  price: nu.number().withMeta({ label: "Price" })
}).withComputed({
  name: {
    label: async (obj) => `Product: ${obj.name}`,
    description: async (obj) => `${obj.name} in ${obj.category} category`
  },
  price: {
    description: async (obj) => `Current price: $${obj.price}`
  }
});

// Get computed metadata
const testData = { name: "iPhone", category: "Electronics", price: 999 };
const computedLabel = await productSchema._computedMeta.name?.label?.(testData);
// Returns: "Product: iPhone"

// Get all merged metadata (static + computed)
const mergedMeta = await productSchema.getAllMergedMeta(testData);
console.log(mergedMeta.name.label); // "Product: iPhone"
console.log(mergedMeta.price.description); // "Current price: $999"
```

### Computed Default Values

```typescript
const settingsSchema = nu.object({
  username: nu.string(),
  displayName: nu.string(),
  theme: nu.string()
}).withComputed({
  displayName: {
    defaultValue: async (obj) => obj.username || "Anonymous User"
  },
  theme: {
    defaultValue: async (obj) => 
      obj.username.includes("admin") ? "dark" : "light"
  }
});
```

## Layouts

Schemas support flexible layout definitions for form rendering. For complete layout documentation, see [Layout System](./layout-system.md).

```typescript
const productSchema = nu.object({
  name: nu.string().withMeta({ label: "Product Name" }),
  price: nu.number().withMeta({ label: "Price" })
}).withLayouts({
  default: {
    type: "form",
    groups: [{
      label: "Product Details",
      fields: [
        { name: "name", size: 12 },
        { name: "price", size: 6 }
      ]
    }]
  }
});

// Layout management
const layoutNames = productSchema.getLayoutNames();
const defaultLayout = productSchema.getLayout("default");
const hasLayout = productSchema.hasLayout("default"); // true
```

## Schema Manipulation

### Omit

Remove properties from a schema:

```typescript
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string(),
  password: nu.string()
});

// Create schema without sensitive fields
const publicUserSchema = userSchema.omit("password", "id");
// Type: { name: string; email: string; }

// Layouts and computed metadata are automatically updated
```

### Extend

Add properties to a schema:

```typescript
const baseUserSchema = nu.object({
  name: nu.string(),
  email: nu.string()
});

const extendedUserSchema = baseUserSchema.extend({
  phone: nu.string().withMeta({ label: "Phone Number" }),
  address: nu.object({
    street: nu.string(),
    city: nu.string()
  })
});
// Type: { name: string; email: string; phone: string; address: { street: string; city: string; } }
```

### Chaining Operations

```typescript
const finalSchema = baseUserSchema
  .extend({
    phone: nu.string(),
    age: nu.number(),
    tempField: nu.string()
  })
  .omit("tempField")
  .partial();
// Type: { name?: string; email?: string; phone?: string; age?: number; }
```

## Zod Integration

Convert Nubase schemas to Zod for additional validation:

```typescript
import { toZod } from '@nubase/core';

const userSchema = nu.object({
  name: nu.string(),
  age: nu.number()
});

const zodSchema = toZod(userSchema);
// Returns: z.ZodObject<{ name: z.ZodString; age: z.ZodNumber; }>

// Use with existing Zod-based libraries
zodSchema.parse({ name: "John", age: 30 }); // Works with Zod API
```

## TypeScript Integration

### Type Inference

Nubase provides excellent TypeScript support:

```typescript
const userSchema = nu.object({
  id: nu.number(),
  profile: nu.object({
    name: nu.string(),
    settings: nu.object({
      theme: nu.string(),
      notifications: nu.boolean()
    })
  }),
  tags: nu.array(nu.string())
});

// Automatic type inference
type User = typeof userSchema._outputType;
// Inferred as:
// {
//   id: number;
//   profile: {
//     name: string;
//     settings: {
//       theme: string;
//       notifications: boolean;
//     };
//   };
//   tags: string[];
// }

// Type-safe parsing
const userData = userSchema.parse(data); // userData has the correct type
```

### Generic Helper Types

```typescript
import type { Infer, ObjectShape, ObjectOutput } from '@nubase/core';

// Alternative type inference
type User = Infer<typeof userSchema>;

// For working with object shapes
function processObjectSchema<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>
): ObjectOutput<TShape> {
  // TypeScript knows the exact shape
  return schema.parse(data);
}
```

## Error Handling

Schemas provide detailed error messages:

```typescript
const userSchema = nu.object({
  name: nu.string(),
  age: nu.number(),
  contacts: nu.array(nu.string())
});

try {
  userSchema.parse({
    name: 123,           // Wrong type
    age: "thirty",       // Wrong type
    contacts: ["email", 456, "phone"] // Mixed array with wrong type
  });
} catch (error) {
  console.log(error.message);
  // Object validation failed:
  // Property "name": Expected string, received number
  // Property "age": Expected number, received string
  // Property "contacts": Array validation failed:
  // Element at index 1: Expected string, received number
}
```

## Best Practices

### Schema Organization

```typescript
// Define base schemas
const addressSchema = nu.object({
  street: nu.string(),
  city: nu.string(),
  zip: nu.string()
});

const contactSchema = nu.object({
  email: nu.string(),
  phone: nu.string()
});

// Compose complex schemas
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  address: addressSchema,
  contact: contactSchema
});
```

### Reusable Metadata

```typescript
const requiredField = { required: true };
const optionalField = { required: false };

const userSchema = nu.object({
  name: nu.string().withMeta({ 
    label: "Full Name", 
    ...requiredField 
  }),
  nickname: nu.string().withMeta({ 
    label: "Nickname", 
    ...optionalField 
  })
});
```

### Layout Patterns

```typescript
// Standard form layout
const formLayout = {
  type: "form" as const,
  groups: [
    {
      label: "Personal Information",
      fields: [
        { name: "firstName", size: 6 },
        { name: "lastName", size: 6 },
        { name: "email", size: 12 }
      ]
    }
  ]
};

// Responsive grid layout
const gridLayout = {
  type: "grid" as const,
  config: { columns: 12, gap: "1rem" },
  groups: [/* ... */]
};
```

## Advanced Features

### Computed Metadata with Complex Logic

```typescript
const orderSchema = nu.object({
  items: nu.array(nu.object({
    name: nu.string(),
    price: nu.number(),
    quantity: nu.number()
  })),
  discount: nu.number(),
  tax: nu.number()
}).withComputed({
  items: {
    description: async (obj) => {
      const total = obj.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      const finalTotal = (total - obj.discount) * (1 + obj.tax);
      return `${obj.items.length} items, Total: $${finalTotal.toFixed(2)}`;
    }
  }
});
```

### Schema Composition

```typescript
const userSchema = nu.object({
  userType: nu.string(),
  adminKey: nu.string(),
  normalUserData: nu.string()
});
```

### Nested Schema Composition

```typescript
const personSchema = nu.object({
  name: nu.string(),
  age: nu.number()
});

const companySchema = nu.object({
  name: nu.string(),
  employees: nu.array(personSchema),
  ceo: personSchema,
  headquarters: nu.object({
    address: nu.string(),
    country: nu.string()
  })
});
```

## Common Patterns

### Form with Validation

```typescript
const loginSchema = nu.object({
  email: nu.string().withMeta({
    label: "Email",
    description: "Enter your email address",
    required: true
  }),
  password: nu.string().withMeta({
    label: "Password",
    description: "Enter your password",
    required: true
  }),
  rememberMe: nu.boolean().withMeta({
    label: "Remember me",
    defaultValue: false
  })
});
```

### Settings Page Schema

```typescript
const settingsSchema = nu.object({
  profile: nu.object({
    displayName: nu.string(),
    bio: nu.string(),
    avatar: nu.string()
  }),
  preferences: nu.object({
    theme: nu.string(),
    language: nu.string(),
    notifications: nu.boolean()
  }),
  privacy: nu.object({
    publicProfile: nu.boolean(),
    searchable: nu.boolean()
  })
});
```

This comprehensive schema system provides the foundation for building type-safe, maintainable business applications with automatic form generation and validation. For form layout and UI organization, see the [Layout System](./layout-system.md) documentation.