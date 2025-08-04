---
sidebar_position: 6
---

# API Reference

This page provides comprehensive API documentation for both `@nubase/core` and `@nubase/frontend` packages.

## @nubase/core

### Factory Functions (`nu`)

The `nu` factory provides convenient methods to create schema instances:

#### `nu.string()`
Creates a string schema.

```typescript
const nameSchema = nu.string();
type NameType = Infer<typeof nameSchema>; // string
```

#### `nu.number()`
Creates a number schema. Validates finite numbers (rejects NaN and Infinity by default).

```typescript
const ageSchema = nu.number();
type AgeType = Infer<typeof ageSchema>; // number
```

#### `nu.boolean()`
Creates a boolean schema.

```typescript
const activeSchema = nu.boolean();
type ActiveType = Infer<typeof activeSchema>; // boolean
```

#### `nu.object(shape)`
Creates an object schema from a shape definition.

```typescript
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string().optional()
});
type User = Infer<typeof userSchema>; // { id: number; name: string; email?: string }
```

**Parameters:**
- `shape: ObjectShape` - Object defining the schema properties

#### `nu.array(elementSchema)`
Creates an array schema with the specified element type.

```typescript
const tagsSchema = nu.array(nu.string());
type Tags = Infer<typeof tagsSchema>; // string[]
```

**Parameters:**
- `elementSchema: BaseSchema` - Schema for array elements

### Schema Methods

All schemas inherit from `BaseSchema` and support these methods:

#### `.optional()`
Makes the schema optional, affecting TypeScript type inference.

```typescript
const optionalName = nu.string().optional();
type OptionalName = Infer<typeof optionalName>; // string | undefined
```

**Returns:** `OptionalSchema<T>` - Wrapped schema marked as optional

#### `.withMeta(metadata)`
Adds static metadata to the schema.

```typescript
const nameSchema = nu.string().withMeta({
  label: "Full Name",
  description: "Enter your complete name",
  defaultValue: "Anonymous"
});
```

**Parameters:**
- `metadata: SchemaMetadata<T>` - Metadata object

**SchemaMetadata Interface:**
```typescript
interface SchemaMetadata<T> {
  label?: string;           // Field label for forms
  description?: string;     // Help text
  defaultValue?: T;         // Default value
  placeholder?: string;     // Input placeholder
  [key: string]: any;      // Additional custom metadata
}
```

#### `.toZod()`
Converts the nubase schema to a Zod schema for validation and parsing.

```typescript
const userSchema = nu.object({
  name: nu.string(),
  age: nu.number()
});

const zodSchema = userSchema.toZod();
const user = zodSchema.parse({ name: "John", age: 30 });
// Returns: { name: "John", age: 30 }

// Throws error for invalid data
userSchema.toZod().parse({ name: "John", age: "thirty" }); // ValidationError
```

**Parameters:** None

**Returns:** `ZodSchema<T>` - A Zod schema for validation

**Throws:** `ValidationError` - When validation fails

#### `.toZod()`
Converts the schema to a Zod schema for interoperability.

```typescript
const nuSchema = nu.object({
  name: nu.string(),
  age: nu.number().optional()
});

const zodSchema = nuSchema.toZod();
// Returns: z.ZodObject<{ name: z.ZodString; age: z.ZodOptional<z.ZodNumber>; }>
```

**Returns:** `z.ZodSchema<T>` - Equivalent Zod schema

### Object Schema Methods

Object schemas have additional methods for composition:

#### `.extend(shape)`
Adds new properties to an existing object schema.

```typescript
const baseUser = nu.object({
  id: nu.number(),
  name: nu.string()
});

const extendedUser = baseUser.extend({
  email: nu.string(),
  role: nu.string().optional()
});
// Result: { id: number; name: string; email: string; role?: string }
```

**Parameters:**
- `shape: ObjectShape` - Additional properties to add

**Returns:** `ObjectSchema<TShape & TExtension>` - Extended schema

#### `.omit(...keys)`
Removes specified properties from an object schema.

```typescript
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  password: nu.string(),
  email: nu.string()
});

const publicUser = userSchema.omit("password", "id");
// Result: { name: string; email: string }
```

**Parameters:**
- `keys: (keyof TShape)[]` - Property names to remove

**Returns:** `ObjectSchema<Omit<TShape, K>>` - Schema without specified properties

#### `.partial()`
Makes all properties in an object schema optional.

```typescript
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string()
});

const partialUser = userSchema.partial();
// Result: { id?: number; name?: string; email?: string }
```

**Returns:** `PartialObjectSchema<TShape>` - Schema with all optional properties

#### `.withComputed(computedMeta)`
Adds computed metadata that updates based on form data.

```typescript
const productSchema = nu.object({
  name: nu.string(),
  price: nu.number(),
  discount: nu.number()
}).withComputed({
  name: {
    label: async (data) => data.category ? `${data.category} Name` : 'Product Name'
  },
  price: {
    description: async (data) => {
      const final = data.price * (1 - data.discount / 100);
      return `Final price: $${final.toFixed(2)}`;
    }
  }
});
```

**Parameters:**
- `computedMeta: ObjectComputedMetadata<TShape>` - Computed metadata functions

**ObjectComputedMetadata Interface:**
```typescript
type ObjectComputedMetadata<TShape extends ObjectShape> = {
  [K in keyof TShape]?: {
    label?: (data: Partial<ObjectOutput<TShape>>) => Promise<string>;
    description?: (data: Partial<ObjectOutput<TShape>>) => Promise<string>;
    defaultValue?: (data: Partial<ObjectOutput<TShape>>) => Promise<TShape[K]['_outputType']>;
  };
};
```

#### `.withLayouts(layouts)`
Adds layout configurations for form rendering.

```typescript
const userSchema = nu.object({
  firstName: nu.string(),
  lastName: nu.string(),
  email: nu.string()
}).withLayouts({
  default: {
    type: "form",
    groups: [{
      label: "Personal Info",
      fields: [
        { name: "firstName", size: 6 },
        { name: "lastName", size: 6 },
        { name: "email", size: 12 }
      ]
    }]
  },
  compact: {
    type: "form", 
    groups: [{
      fields: [
        { name: "firstName", size: 12 },
        { name: "email", size: 12 }
      ]
    }]
  }
});
```

**Parameters:**
- `layouts: Record<string, Layout<TShape>>` - Named layout configurations

#### `.getLayout(name)`
Retrieves a specific layout by name.

```typescript
const defaultLayout = userSchema.getLayout("default");
const compactLayout = userSchema.getLayout("compact");
```

**Parameters:**
- `name: string` - Layout name

**Returns:** `Layout<TShape> | undefined` - Layout configuration or undefined if not found

#### `.getLayoutNames()`
Gets all available layout names.

```typescript
const layoutNames = userSchema.getLayoutNames();
// Returns: ["default", "compact"]
```

**Returns:** `string[]` - Array of layout names

#### `.hasLayout(name)`
Checks if a layout exists.

```typescript
const hasDefault = userSchema.hasLayout("default"); // true
const hasMobile = userSchema.hasLayout("mobile");   // false
```

**Parameters:**
- `name: string` - Layout name to check

**Returns:** `boolean` - Whether the layout exists

#### `.getAllMergedMeta(data)`
Gets merged metadata (static + computed) for all properties.

```typescript
const schema = nu.object({
  name: nu.string().withMeta({ label: "Name" })
}).withComputed({
  name: {
    description: async (data) => `Hello, ${data.name}!`
  }
});

const merged = await schema.getAllMergedMeta({ name: "John" });
// Returns: { name: { label: "Name", description: "Hello, John!" } }
```

**Parameters:**
- `data: Partial<ObjectOutput<TShape>>` - Current form data

**Returns:** `Promise<Record<keyof TShape, SchemaMetadata<any>>>` - Merged metadata for all properties

### Type Utilities

#### `Infer<T>`
Extracts the TypeScript type from a schema.

```typescript
const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string().optional()
});

type User = Infer<typeof userSchema>;
// Result: { id: number; name: string; email?: string | undefined }
```

#### `ObjectOutput<T>`
Gets the output type of an object schema.

```typescript
type UserOutput = ObjectOutput<typeof userSchema>;
// Equivalent to Infer<typeof userSchema>
```

#### `ObjectShape`
Type constraint for object schema shapes.

```typescript
function processSchema<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>
): ObjectOutput<TShape> {
  // Implementation
}
```

## @nubase/frontend

### Components

#### `<SchemaForm>`
Schema-driven form component with automatic field rendering and validation.

```typescript
interface SchemaFormProps<TShape extends ObjectShape> {
  schema: ObjectSchema<TShape>;
  onSubmit: (data: ObjectOutput<TShape>) => void | Promise<void>;
  submitText?: string;
  data?: Partial<ObjectOutput<TShape>>;
  layout?: string;
  computedMetadata?: {
    debounceMs?: number; // Default: 300ms
  };
}
```

**Usage:**
```typescript
<SchemaForm
  schema={userSchema}
  onSubmit={handleSubmit}
  submitText="Save User"
  data={initialData}
  layout="compact"
  computedMetadata={{ debounceMs: 500 }}
/>
```

#### `<NubaseApp>`
Application shell component that provides complete application infrastructure.

```typescript
interface NubaseFrontendConfig {
  appName: string;
  mainMenu: NavigationItem[];
  views: Record<string, ViewDescriptor>;
  resources: Record<string, ResourceDescriptor>;
  apiEndpoints?: Record<string, ApiEndpointDefinition>;
  apiBaseUrl?: string;
  themeIds: string[];
  defaultThemeId: string;
}
```

**Usage:**
```typescript
<NubaseApp config={appConfig} />
```

#### `<Button>`
Primary button component with variants and sizes.

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

#### `<FormControl>`
Form field wrapper with label, validation, and error display.

```typescript
interface FormControlProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

#### `<Modal>`
Modal dialog component with multiple sizes.

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}
```

### Hooks

#### `useDialog()`
Hook for programmatic dialog control.

```typescript
interface DialogOptions {
  title: string;
  message: string;
  type?: "info" | "warning" | "danger";
  confirmText?: string;
  cancelText?: string;
}

const { showDialog } = useDialog();
const confirmed = await showDialog({
  title: "Confirm Delete",
  message: "Are you sure?",
  type: "danger"
});
```

#### `useModal()`
Hook for programmatic modal control.

```typescript
interface ModalOptions {
  title: string;
  content: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const { openModal, closeModal } = useModal();
openModal({
  title: "Edit Profile",
  content: <ProfileForm />,
  size: "lg"
});
```

#### `useComputedMetadata()`
Hook for debounced computed metadata in forms.

```typescript
interface UseComputedMetadataOptions {
  debounceMs?: number; // Default: 300ms
}

interface UseComputedMetadataResult<TShape extends ObjectShape> {
  metadata: Record<keyof TShape, SchemaMetadata<any>>;
  isComputing: boolean;
  error: Error | null;
}

const result = useComputedMetadata(schema, formData, { debounceMs: 500 });
```

### Configuration Factories

#### `createView()`
Factory function for creating type-safe view configurations.

```typescript
interface ViewConfig<TShape extends ObjectShape> {
  id: string;
  schema: ObjectSchema<TShape>;
  onSubmit?: (data: ObjectOutput<TShape>, context: ViewContext) => void | Promise<void>;
  layout?: string;
}

const createUserView = createView({
  id: "create-user",
  schema: userSchema,
  onSubmit: async (data, { apiClient }) => {
    await apiClient.createUser(data);
  }
});
```

#### `createResource()`
Factory function for creating type-safe resource configurations.

```typescript
interface ResourceConfig {
  id: string;
  operations: Record<string, ResourceOperation>;
}

const userResource = createResource({
  id: "user",
  operations: {
    create: { view: createUserView },
    edit: { view: editUserView },
    view: { view: viewUserView }
  }
});
```

### Utility Functions

#### `showToast()`
Function for displaying toast notifications.

```typescript
// Basic usage
showToast(message: string, type: "success" | "error" | "info" | "warning" | "loading" | "default");

// Promise toast
showToast(promise: Promise<any>, {
  loading: string;
  success: string;
  error: string;
});
```

**Examples:**
```typescript
showToast("Operation completed!", "success");
showToast("Something went wrong", "error");

showToast(saveUser(), {
  loading: "Saving...",
  success: "User saved!",
  error: "Failed to save"
});
```

## Layout System Types

### `Layout<TShape>`
Interface for layout configurations.

```typescript
interface Layout<TShape extends ObjectShape> {
  type: "form" | "grid" | "tabs" | "accordion" | "custom";
  groups: LayoutGroup<TShape>[];
  className?: string;
  config?: {
    columns?: number;
    gap?: string | number;
    [key: string]: any;
  };
}
```

### `LayoutGroup<TShape>`
Interface for layout groups.

```typescript
interface LayoutGroup<TShape extends ObjectShape> {
  label?: string;
  description?: string;
  fields: LayoutField<TShape>[];
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
```

### `LayoutField<TShape>`
Interface for layout fields.

```typescript
interface LayoutField<TShape extends ObjectShape> {
  name: keyof TShape;
  size?: number;        // Grid size (1-12)
  className?: string;
  hidden?: boolean;
}
```

## Error Types

### `ValidationError`
Thrown when schema validation fails.

```typescript
class ValidationError extends Error {
  constructor(message: string, path?: string[]);
}
```

**Usage:**
```typescript
try {
  const user = userSchema.toZod().parse(invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:", error.message);
  }
}
```

This API reference covers the core functionality of both packages. For more examples and patterns, see the other documentation pages.