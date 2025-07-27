# @nubase/core

Core schema system with Zod-inspired API and TypeScript-first design for the nubase ecosystem.

## Installation

```bash
npm install @nubase/core
```

## Features

- **Type-safe schema definitions** with proper TypeScript inference
- **Required by default** - fields are required unless explicitly made optional
- **Zod-compatible** - convert schemas to Zod with `toZod()`
- **Rich metadata system** - labels, descriptions, default values, and computed metadata
- **Layout system** - flexible form layouts (form, grid, tabs, accordion)
- **Schema composition** - extend, omit, and partial operations
- **Validation** - runtime validation with detailed error messages

## Basic Usage

### Primitive Schemas

```typescript
import { nu } from '@nubase/core';

// Create primitive schemas
const nameSchema = nu.string();
const ageSchema = nu.number();
const activeSchema = nu.boolean();

// Parse and validate
const name = nameSchema.parse("John"); // "John"
const age = ageSchema.parse(25); // 25
```

### Object Schemas

```typescript
// All fields are required by default
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string(),
});

type User = Infer<typeof userSchema>;
// User = { id: number; name: string; email: string }

const user = userSchema.parse({
  id: 1,
  name: "John Doe",
  email: "john@example.com"
});
```

### Optional Fields

**Important**: Fields are **required by default** for type-safety reasons. Use `.optional()` to make fields optional.

```typescript
const userSchema = nu.object({
  id: nu.number(),                    // Required
  name: nu.string(),                  // Required  
  email: nu.string().optional(),      // Optional
  phone: nu.string().optional(),      // Optional
});

type User = Infer<typeof userSchema>;
// User = { 
//   id: number; 
//   name: string; 
//   email?: string | undefined; 
//   phone?: string | undefined; 
// }

// Valid - only required fields needed
const user = userSchema.parse({
  id: 1,
  name: "John Doe"
});

// Also valid - optional fields can be included
const userWithEmail = userSchema.parse({
  id: 1,
  name: "John Doe",
  email: "john@example.com"
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
- **Zod conversion is accurate** - `toZod()` produces correct optional fields

### Array Schemas

```typescript
const tagsSchema = nu.array(nu.string());
const numbersSchema = nu.array(nu.number());

// Optional arrays
const optionalTagsSchema = nu.array(nu.string()).optional();

// Arrays of optional elements  
const mixedArraySchema = nu.array(nu.string().optional());
```

### Schema Composition

```typescript
const baseUserSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
});

// Extend with new fields
const extendedUserSchema = baseUserSchema.extend({
  email: nu.string(),
  role: nu.string().optional(),
});

// Omit fields
const publicUserSchema = extendedUserSchema.omit("id");

// Make all fields optional
const partialUserSchema = baseUserSchema.partial();
```

## Metadata System

Add rich metadata to your schemas:

```typescript
const userSchema = nu.object({
  name: nu.string().withMeta({
    label: "Full Name",
    description: "Enter your complete name",
    defaultValue: "Anonymous"
  }),
  email: nu.string().optional().withMeta({
    label: "Email Address", 
    description: "We'll never share your email"
  })
});
```

## Computed Metadata

Create dynamic metadata based on form data:

```typescript
const profileSchema = nu.object({
  firstName: nu.string(),
  lastName: nu.string(),
  company: nu.string(),
  title: nu.string().optional()
}).withComputed({
  title: {
    label: async (data) => `Role at ${data.company}`,
    description: async (data) => `${data.firstName}'s position`
  }
});
```

## Zod Integration

Convert nubase schemas to Zod schemas:

```typescript
import { toZod } from '@nubase/core';

const nuSchema = nu.object({
  name: nu.string(),
  age: nu.number().optional()
});

const zodSchema = toZod(nuSchema);
// Creates: z.object({ name: z.string(), age: z.number().optional() })
```

## API Reference

### `nu` Factory Functions

- `nu.string()` - String schema
- `nu.number()` - Number schema  
- `nu.boolean()` - Boolean schema
- `nu.object(shape)` - Object schema
- `nu.array(elementSchema)` - Array schema

### Schema Methods

- `.optional()` - Make schema optional (affects TypeScript types)
- `.withMeta(metadata)` - Add static metadata
- `.parse(data)` - Validate and parse data

### Object Schema Methods

- `.extend(shape)` - Add new fields
- `.omit(...keys)` - Remove fields
- `.partial()` - Make all fields optional
- `.withComputed(computedMeta)` - Add computed metadata
- `.withLayouts(layouts)` - Add layout configurations

### Utility Types

- `Infer<T>` - Extract TypeScript type from schema
- `ObjectOutput<T>` - Get object schema output type
- `SchemaMetadata<T>` - Metadata interface

## Contributing

Please see the main repository for contributing guidelines.

## License

MIT
