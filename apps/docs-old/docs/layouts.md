---
sidebar_position: 3
---

# Layout System

The Nubase layout system provides flexible, declarative UI organization for forms and data interfaces. It allows you to define how your schema fields should be arranged and presented without tightly coupling your data structure to your UI.

## Overview

The layout system works hand-in-hand with the [Schema System](./schema.md) to provide:

- **Flexible UI Organization** - Arrange fields in forms, grids, tabs, accordions, and tables
- **Multiple Layout Support** - Define multiple named layouts per schema for different use cases
- **Type-Safe Configuration** - Full TypeScript support ensuring field names are valid
- **React Integration** - Seamless integration with SchemaForm components
- **Responsive Design** - Support for different field sizes and arrangements

## Core Concepts

### Layout Interface

All layouts in Nubase implement the `Layout` interface:

```typescript
interface Layout<TShape extends ObjectShape> {
  type: "form" | "grid" | "tabs" | "accordion" | "custom" | "table";
  groups: LayoutGroup<TShape>[];
  className?: string;
  config?: {
    columns?: number;
    gap?: string | number;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}
```

### Layout Groups

Layouts organize fields into logical groups:

```typescript
interface LayoutGroup<TShape extends ObjectShape> {
  label?: string;              // Group heading
  description?: string;        // Group description
  fields: FormLayoutField<TShape>[];  // Fields in this group
  className?: string;          // Custom CSS class
  collapsible?: boolean;       // Can be collapsed
  defaultCollapsed?: boolean;  // Start collapsed
}
```

### Layout Types

Nubase supports several layout types:

- **form** - Traditional vertical form layout (see [Form Layouts](./form-layouts.md))
- **grid** - Grid-based responsive layout (see [Form Layouts](./form-layouts.md))
- **tabs** - Tabbed interface for complex forms (see [Form Layouts](./form-layouts.md))
- **accordion** - Collapsible sections (see [Form Layouts](./form-layouts.md))
- **table** - Data grid layout for lists (see [Table Layouts](./table-layouts.md))
- **custom** - Custom layout implementations

## Layout Management

### Defining Layouts

Use specialized methods to define layouts:

```typescript
import { nu } from '@nubase/core';

const schema = nu.object({
  name: nu.string().withMeta({ label: "Name" }),
  email: nu.string().withMeta({ label: "Email" }),
  phone: nu.string().withMeta({ label: "Phone" })
});

// For form-based layouts
const schemaWithForms = schema.withFormLayouts({
  default: {
    type: "form",
    groups: [
      {
        label: "Contact Information",
        fields: [
          { name: "name", fieldWidth: 12 },
          { name: "email", fieldWidth: 6 },
          { name: "phone", fieldWidth: 6 }
        ]
      }
    ]
  }
});

// For table-based layouts
const schemaWithTables = schema.withTableLayouts({
  list: {
    fields: [
      { name: "name", columnWidthPx: 200 },
      { name: "email", columnWidthPx: 250 },
      { name: "phone", columnWidthPx: 150 }
    ]
  }
});
```

### Multiple Layouts

Schemas can have multiple named layouts for different contexts:

```typescript
const userSchema = nu.object({
  firstName: nu.string(),
  lastName: nu.string(),
  email: nu.string(),
  bio: nu.string(),
  role: nu.string()
}).withFormLayouts({
  // Compact layout for quick edits
  compact: {
    type: "form",
    groups: [{
      fields: [
        { name: "firstName", fieldWidth: 6 },
        { name: "lastName", fieldWidth: 6 },
        { name: "email", fieldWidth: 12 }
      ]
    }]
  },
  
  // Full layout for detailed editing
  full: {
    type: "form",
    groups: [
      {
        label: "Personal Information",
        fields: [
          { name: "firstName", fieldWidth: 6 },
          { name: "lastName", fieldWidth: 6 },
          { name: "email", fieldWidth: 12 }
        ]
      },
      {
        label: "Additional Details",
        fields: [
          { name: "bio", fieldWidth: 12 },
          { name: "role", fieldWidth: 12 }
        ]
      }
    ]
  }
});
```

### Layout Methods

Every ObjectSchema provides methods for layout management:

```typescript
// Get a specific layout
const layout = userSchema.getLayout("compact");

// Check if a layout exists
const hasLayout = userSchema.hasLayout("compact"); // true

// Get all layout names
const layoutNames = userSchema.getLayoutNames(); // ["compact", "full"]
```

## Layout Selection

The `useLayout` hook determines which layout to use:

```typescript
import { useLayout } from '@nubase/frontend';

function MyForm({ schema, layoutName }) {
  // If layoutName is provided and exists, uses that layout
  // Otherwise creates a default layout with all fields
  const layout = useLayout(schema, layoutName);
  
  return (
    <SchemaFormBody 
      form={form} 
      layoutName={layoutName}  // Optional specific layout
    />
  );
}
```

### Default Layout Behavior

When no layout is specified or the requested layout doesn't exist, Nubase creates a default form layout:

```typescript
// This default layout includes all schema fields
const defaultLayout = {
  type: "form",
  groups: [{
    fields: [
      { name: "firstName", fieldWidth: 12 },
      { name: "lastName", fieldWidth: 12 },
      { name: "email", fieldWidth: 12 }
      // ... all fields with full width
    ]
  }]
};
```

## React Integration

### SchemaForm Components

Layouts integrate seamlessly with SchemaForm components:

```typescript
import { SchemaForm, SchemaFormBody, SchemaFormButtonBar } from '@nubase/frontend';

function ContactForm() {
  const form = useSchemaForm({
    schema: contactSchema,
    onSubmit: handleSubmit
  });

  return (
    <SchemaForm form={form}>
      <SchemaFormBody 
        form={form}
        layoutName="compact"  // Use specific layout
      />
      <SchemaFormButtonBar form={form} />
    </SchemaForm>
  );
}
```

### Layout Rendering

The `SchemaFormVerticalLayout` component handles layout rendering:

- Renders layout groups in order
- Handles group labels and descriptions
- Filters out hidden fields
- Applies CSS classes from layout configuration
- Adds separators between fields

## Migration from Legacy API

The old `withLayouts()` method is deprecated. Use the specialized methods instead:

```typescript
// ❌ Deprecated
const schema = nu.object({ ... }).withLayouts({
  default: { type: "form", groups: [...] }
});

// ✅ Recommended
const schema = nu.object({ ... }).withFormLayouts({
  default: { type: "form", groups: [...] }
});

// ✅ For tables
const schema = nu.object({ ... }).withTableLayouts({
  list: { fields: [...] }
});
```

## Best Practices

### Layout Organization

```typescript
// ✅ Good: Logical grouping with descriptive names
const schema = nu.object({ ... }).withFormLayouts({
  create: { /* optimized for creating new records */ },
  edit: { /* optimized for editing existing records */ },
  readonly: { /* optimized for viewing data */ },
  mobile: { /* optimized for mobile devices */ }
});

// ❌ Avoid: Generic names without clear purpose
const schema = nu.object({ ... }).withFormLayouts({
  layout1: { /* unclear purpose */ },
  layout2: { /* unclear purpose */ }
});
```

### Layout Naming

Use descriptive names that indicate the layout's purpose:
- `create`, `edit`, `readonly` for different interaction modes
- `compact`, `detailed`, `full` for different levels of detail
- `mobile`, `tablet`, `desktop` for responsive designs
- `public`, `admin`, `debug` for different user contexts

### Performance Considerations

- Layouts are processed once when the schema is created
- Multiple layouts don't significantly impact performance
- Field visibility filtering happens at render time
- Use meaningful field groups to improve form organization

## Next Steps

- **Form Layouts**: Learn about [form-specific layouts](./form-layouts.md) including grid, tabs, and accordion layouts
- **Table Layouts**: Explore [table layouts](./table-layouts.md) for data grids and lists
- **Schema System**: Understand how layouts work with [schemas](./schema.md)
- **Frontend Components**: See how to use layouts with [frontend components](./frontend.md)