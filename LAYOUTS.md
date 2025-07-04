# Layout System Documentation

The nubase layout system allows you to define multiple layout configurations for your object schemas. This enables you to render the same schema in different ways depending on the context (e.g., a compact mobile layout vs. a detailed desktop layout).

## Basic Usage

```typescript
import { nu } from '@nubase/core';

const productSchema = nu.object({
  name: nu.string().meta({
    label: 'Product Name',
    description: 'Enter the name of the product',
  }),
  price: nu.number().meta({
    label: 'Price',
    description: 'Enter the price of the product',
  }),
  inStock: nu.boolean().meta({
    label: 'In Stock',
    description: 'Is the product currently in stock?',
  }),
  description: nu.string().meta({
    label: 'Description',
    description: 'Product description',
  }),
}).withLayouts({
  "default": {
    "type": "form",
    "groups": [
      {
        "label": "Product Details",
        "fields": [
          {
            "name": "name",
            "size": 12
          },
          {
            "name": "price",
            "size": 6
          },
          {
            "name": "inStock",
            "size": 6
          },
          {
            "name": "description",
            "size": 12
          }
        ]
      }
    ]
  },
  "compact": {
    "type": "form",
    "groups": [
      {
        "label": "Basic Info",
        "fields": [
          {
            "name": "name",
            "size": 8
          },
          {
            "name": "price",
            "size": 4
          }
        ]
      },
      {
        "label": "Details",
        "fields": [
          {
            "name": "inStock",
            "size": 3
          },
          {
            "name": "description",
            "size": 9
          }
        ]
      }
    ]
  }
});
```

## Layout API

### Methods

- `withLayouts(layouts)` - Add layout configurations to the schema
- `getLayout(name)` - Get a specific layout by name
- `getLayoutNames()` - Get all available layout names
- `hasLayout(name)` - Check if a layout exists

### Layout Structure

```typescript
interface Layout<TShape extends ObjectShape> {
  type: 'form' | 'grid' | 'tabs' | 'accordion' | 'custom';
  groups: LayoutGroup<TShape>[];
  className?: string;
  config?: {
    columns?: number;
    gap?: string | number;
    [key: string]: any;
  };
}

interface LayoutGroup<TShape extends ObjectShape> {
  label?: string;
  description?: string;
  fields: LayoutField<TShape>[];
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface LayoutField<TShape extends ObjectShape> {
  name: keyof TShape;  // Type-safe field names
  size?: number;       // Grid size (e.g., 12 for full width)
  className?: string;
  hidden?: boolean;
}
```

## Using with React Components

```typescript
import { SchemaForm } from '@nubase/react';

// Use the default layout
<SchemaForm 
  schema={productSchema} 
  layoutName="default"
  onSubmit={handleSubmit} 
/>

// Use the compact layout
<SchemaForm 
  schema={productSchema} 
  layoutName="compact"
  onSubmit={handleSubmit} 
/>

// No layout specified - uses default rendering
<SchemaForm 
  schema={productSchema} 
  onSubmit={handleSubmit} 
/>
```

## Type Safety

The layout system is fully type-safe. Field names in layouts must match the property keys in your object schema:

```typescript
const schema = nu.object({
  validField: nu.string(),
});

// ✅ This will compile
schema.withLayouts({
  myLayout: {
    type: 'form',
    groups: [{
      fields: [{ name: 'validField' }]  // Type-safe
    }]
  }
});

// ❌ This will cause a TypeScript error
schema.withLayouts({
  myLayout: {
    type: 'form',
    groups: [{
      fields: [{ name: 'invalidField' }]  // Error: Property doesn't exist
    }]
  }
});
```

## Advanced Features

### Field Hiding

Fields can be hidden in specific layouts:

```typescript
schema.withLayouts({
  public: {
    type: 'form',
    groups: [{
      fields: [
        { name: 'publicField' },
        { name: 'privateField', hidden: true }
      ]
    }]
  }
});
```

### Complex Configurations

Layouts support various configuration options:

```typescript
schema.withLayouts({
  advanced: {
    type: 'form',
    className: 'advanced-layout',
    config: {
      columns: 12,
      gap: '1rem'
    },
    groups: [
      {
        label: 'Section 1',
        description: 'Important fields',
        className: 'section-1',
        collapsible: true,
        defaultCollapsed: false,
        fields: [
          { 
            name: 'field1', 
            size: 6, 
            className: 'special-field' 
          }
        ]
      }
    ]
  }
});
```

## Integration with Computed Metadata

Layouts work seamlessly with computed metadata:

```typescript
const schema = nu.object({
  firstName: nu.string(),
  lastName: nu.string(),
}).withComputed({
  lastName: {
    label: async (obj) => `Last Name for ${obj.firstName}`
  }
}).withLayouts({
  default: {
    type: 'form',
    groups: [{
      fields: [
        { name: 'firstName', size: 6 },
        { name: 'lastName', size: 6 }  // Will use computed label
      ]
    }]
  }
});
```
