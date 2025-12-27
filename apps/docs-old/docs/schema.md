---
sidebar_position: 2
---

# Schema System

The Nubase schema system is a powerful, type-safe validation and form generation library that serves as the foundation for building business applications. It provides a declarative way to define data structures with validation, metadata, and computed properties.

> **Note:** For information about form layouts and UI organization, see the [Layout System](./layouts.md) documentation. For specific layout types, see [Form Layouts](./form-layouts.md) and [Table Layouts](./table-layouts.md).

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
    description: "Enter your complete name"
  }),
  email: nu.string().withMeta({
    label: "Email Address", 
    description: "We'll use this to contact you"
  }),
  age: nu.number().optional().withMeta({
    label: "Age",
    description: "Optional age field",
    defaultValue: 18
  })
});
```

### Required vs Optional Fields

**Important**: Fields are **required by default** for type-safety reasons. Use `.optional()` to make fields optional:

```typescript
const userSchema = nu.object({
  name: nu.string(),              // Required - TypeScript enforces this
  email: nu.string(),             // Required - TypeScript enforces this
  phone: nu.string().optional(), // Optional - TypeScript allows undefined
  bio: nu.string().optional()    // Optional - TypeScript allows undefined
});

type User = Infer<typeof userSchema>;
// User = { 
//   name: string; 
//   email: string; 
//   phone?: string | undefined; 
//   bio?: string | undefined; 
// }

// Valid - only required fields needed
userSchema.toZod().parse({ name: "John", email: "john@example.com" });

// Also valid - optional fields can be included
userSchema.toZod().parse({ 
  name: "John", 
  email: "john@example.com",
  phone: "555-1234" 
});
```

### Why `.optional()` is Not Metadata

Unlike some schema libraries, `optional()` is **not metadata** - it's a schema transformer that affects TypeScript type inference:

```typescript
// ❌ Wrong - this would not affect TypeScript types
const badSchema = nu.object({
  name: nu.string().withMeta({ required: false }) // This doesn't work!
});

// ✅ Correct - this properly affects TypeScript types  
const goodSchema = nu.object({
  name: nu.string().optional() // TypeScript knows this is optional
});
```

This design ensures that:
- **Type inference works correctly** - TypeScript automatically knows which fields are optional
- **Runtime validation matches types** - required/optional behavior is consistent
- **Form rendering is accurate** - required fields show asterisks (*), optional fields don't

### Parsing and Validation

Schemas can be converted to Zod schemas for validation and parsing:

```typescript
const userSchema = nu.object({
  name: nu.string(),
  age: nu.number()
});

// Valid data
const userData = { name: "John Doe", age: 30 };
const parsed = userSchema.toZod().parse(userData);
// Returns: { name: "John Doe", age: 30 }

// Invalid data throws an error
try {
  userSchema.toZod().parse({ name: "John", age: "thirty" });
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

nameSchema.toZod().parse("John"); // ✅ Returns "John"
nameSchema.toZod().parse(123);    // ❌ Throws error
```

#### NumberSchema

```typescript
const ageSchema = nu.number().withMeta({
  label: "Age",
  defaultValue: 0
});

ageSchema.toZod().parse(25);     // ✅ Returns 25
ageSchema.toZod().parse("25");   // ❌ Throws error
ageSchema.toZod().parse(NaN);    // ❌ Throws error
ageSchema.toZod().parse(Infinity); // ❌ Throws error
```

#### BooleanSchema

```typescript
const activeSchema = nu.boolean().withMeta({
  label: "Active Status",
  defaultValue: true
});

activeSchema.toZod().parse(true);    // ✅ Returns true
activeSchema.toZod().parse(false);   // ✅ Returns false
activeSchema.toZod().parse("true");  // ❌ Throws error
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
type User = Infer<typeof userSchema>;
// Inferred as: { id: number; name: string; address: { street: string; city: string; zip: string; } }
```

#### ArraySchema

Array schemas validate collections:

```typescript
const stringArraySchema = nu.array(nu.string());
const userArraySchema = nu.array(userSchema);

stringArraySchema.toZod().parse(["a", "b", "c"]); // ✅
stringArraySchema.toZod().parse(["a", 123, "c"]); // ❌ Throws error

userArraySchema.toZod().parse([
  { id: 1, name: "John", address: { street: "123 Main", city: "NYC", zip: "10001" } }
]); // ✅
```

#### RecordSchema

Record schemas validate dictionary/map types with string keys and values of a specific type:

```typescript
// Simple record with number values
const scoresSchema = nu.record(nu.number());

scoresSchema.toZod().parse({ math: 95, english: 87, science: 92 }); // ✅
scoresSchema.toZod().parse({ math: "A+" }); // ❌ Throws error - value must be number
scoresSchema.toZod().parse({}); // ✅ Empty records are valid

// Record with object values
const usersById = nu.record(nu.object({
  name: nu.string(),
  age: nu.number()
}));

usersById.toZod().parse({
  "user-1": { name: "Alice", age: 30 },
  "user-2": { name: "Bob", age: 25 }
}); // ✅

// Type inference
type Scores = Infer<typeof scoresSchema>;
// Inferred as: Record<string, number>
```

#### ObjectSchema with Catchall

Use `.catchall()` to allow additional properties beyond the defined shape, validated against a schema. This is useful for dynamic data like chart series:

```typescript
// Chart data point with dynamic numeric fields
const dataPointSchema = nu.object({
  category: nu.string()  // Required field
}).catchall(nu.number()); // Extra fields must be numbers

// Valid - extra fields are numbers
dataPointSchema.toZod().parse({
  category: "January",
  desktop: 186,
  mobile: 80
}); // ✅ Returns { category: "January", desktop: 186, mobile: 80 }

// Invalid - extra field is not a number
dataPointSchema.toZod().parse({
  category: "January",
  desktop: "not a number"
}); // ❌ Throws error

// Without catchall, extra fields are stripped
const strictSchema = nu.object({ category: nu.string() });
strictSchema.toZod().parse({ category: "Jan", desktop: 186 });
// Returns: { category: "Jan" } - desktop is stripped!

// With catchall, extra fields are preserved and validated
const flexibleSchema = nu.object({ category: nu.string() }).catchall(nu.number());
flexibleSchema.toZod().parse({ category: "Jan", desktop: 186 });
// Returns: { category: "Jan", desktop: 186 } - desktop is preserved!
```

**Note on TypeScript types:** When using `.catchall()`, the TypeScript output type remains `ObjectOutput<TShape>`. TypeScript cannot express "extra keys have type X" without conflicting with defined keys. The catchall provides runtime validation and passthrough behavior, but dynamic keys should be accessed via type assertion if needed.

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
partialUserSchema.toZod().parse({}); // ✅ Returns {}
partialUserSchema.toZod().parse({ name: "John" }); // ✅ Returns { name: "John" }
partialUserSchema.toZod().parse({ id: 1, email: "john@example.com" }); // ✅
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

Schemas support flexible layout definitions for form rendering. For complete layout documentation, see [Layout System](./layouts.md), [Form Layouts](./form-layouts.md), and [Table Layouts](./table-layouts.md).

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
const userSchema = nu.object({
  name: nu.string(),
  age: nu.number().optional()
});

const zodSchema = userSchema.toZod();
// Returns: z.ZodObject<{ name: z.ZodString; age: z.ZodOptional<z.ZodNumber>; }>

// Use with existing Zod-based libraries  
zodSchema.parse({ name: "John" }); // Works - age is optional
zodSchema.parse({ name: "John", age: 30 }); // Also works
```

### Important: Nubase Schemas Don't Have `.parse()`

Unlike Zod, **nubase schemas do not have a `.parse()` method**. Nubase schemas are primarily for:
- Type inference
- Form generation
- Layout definition
- Metadata management

For validation and parsing, you must first convert to Zod:

```typescript
// ❌ This won't work - nubase schemas don't have .parse()
userSchema.parse(data); 

// ✅ This works - convert to Zod first
userSchema.toZod().parse(data);

// ✅ Or store the Zod schema for reuse
const zodSchema = userSchema.toZod();
zodSchema.parse(data);
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
type User = Infer<typeof userSchema>;
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
const userData = userSchema.toZod().parse(data); // userData has the correct type
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
  return schema.toZod().parse(data);
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
  userSchema.toZod().parse({
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
const commonLabelStyle = { 
  label: "Standard Field",
  description: "Enter a value"
};

const userSchema = nu.object({
  name: nu.string().withMeta({ 
    ...commonLabelStyle,
    label: "Full Name"
  }),
  nickname: nu.string().optional().withMeta({ 
    ...commonLabelStyle,
    label: "Nickname"
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
    description: "Enter your email address"
  }),
  password: nu.string().withMeta({
    label: "Password", 
    description: "Enter your password"
  }),
  rememberMe: nu.boolean().optional().withMeta({
    label: "Remember me",
    description: "Keep me logged in (optional)",
    defaultValue: false
  })
});
```

### Settings Page Schema

```typescript
const settingsSchema = nu.object({
  profile: nu.object({
    displayName: nu.string(),
    bio: nu.string().optional(),
    avatar: nu.string().optional()
  }),
  preferences: nu.object({
    theme: nu.string(),
    language: nu.string(),
    notifications: nu.boolean().optional()
  }),
  privacy: nu.object({
    publicProfile: nu.boolean(),
    searchable: nu.boolean().optional()
  })
});
```

This comprehensive schema system provides the foundation for building type-safe, maintainable business applications with automatic form generation and validation. For form layout and UI organization, see the [Layout System](./layouts.md), [Form Layouts](./form-layouts.md), and [Table Layouts](./table-layouts.md) documentation.