---
sidebar_position: 3
---

# Layout System

The Nubase layout system provides flexible, declarative UI organization for forms and complex data interfaces. It allows you to define how your schema fields should be arranged and presented without tightly coupling your data structure to your UI.

## Overview

The layout system works hand-in-hand with the [Schema System](./schema.md) to provide:

- **Flexible UI Organization** - Arrange fields in forms, grids, tabs, and accordions
- **Responsive Design** - Size and organize fields across different screen sizes
- **Grouping & Sections** - Logically group related fields together
- **Dynamic Layouts** - Multiple layout configurations per schema

## Basic Layout Types

### Form Layout

The most common layout type for traditional forms:

```typescript
import { nu } from '@nubase/core';

const userSchema = nu.object({
  firstName: nu.string().withMeta({ label: "First Name" }),
  lastName: nu.string().withMeta({ label: "Last Name" }),
  email: nu.string().withMeta({ label: "Email Address" }),
  phone: nu.string().withMeta({ label: "Phone Number" })
}).withLayouts({
  default: {
    type: "form",
    groups: [
      {
        label: "Personal Information",
        fields: [
          { name: "firstName", size: 6 },
          { name: "lastName", size: 6 },
          { name: "email", size: 12 },
          { name: "phone", size: 12 }
        ]
      }
    ]
  }
});
```

### Grid Layout

For more flexible, grid-based layouts:

```typescript
const productSchema = nu.object({
  name: nu.string(),
  price: nu.number(),
  category: nu.string(),
  description: nu.string(),
  inStock: nu.boolean()
}).withLayouts({
  grid: {
    type: "grid",
    config: {
      columns: 12,
      gap: "1rem"
    },
    groups: [
      {
        fields: [
          { name: "name", size: 8 },
          { name: "price", size: 4 },
          { name: "category", size: 6 },
          { name: "inStock", size: 6 },
          { name: "description", size: 12 }
        ]
      }
    ]
  }
});
```

### Tabs Layout

Organize complex forms into tabbed sections:

```typescript
const settingsSchema = nu.object({
  // Profile fields
  displayName: nu.string(),
  bio: nu.string(),
  avatar: nu.string(),
  
  // Preferences fields
  theme: nu.string(),
  language: nu.string(),
  notifications: nu.boolean(),
  
  // Privacy fields
  publicProfile: nu.boolean(),
  searchable: nu.boolean()
}).withLayouts({
  tabbed: {
    type: "tabs",
    groups: [
      {
        label: "Profile",
        fields: [
          { name: "displayName", size: 12 },
          { name: "bio", size: 12 },
          { name: "avatar", size: 12 }
        ]
      },
      {
        label: "Preferences", 
        fields: [
          { name: "theme", size: 6 },
          { name: "language", size: 6 },
          { name: "notifications", size: 12 }
        ]
      },
      {
        label: "Privacy",
        fields: [
          { name: "publicProfile", size: 6 },
          { name: "searchable", size: 6 }
        ]
      }
    ]
  }
});
```

### Accordion Layout

Collapsible sections for complex forms:

```typescript
const orderSchema = nu.object({
  // Customer info
  customerName: nu.string(),
  customerEmail: nu.string(),
  
  // Shipping info
  shippingAddress: nu.string(),
  shippingMethod: nu.string(),
  
  // Payment info
  cardNumber: nu.string(),
  expiryDate: nu.string()
}).withLayouts({
  accordion: {
    type: "accordion",
    groups: [
      {
        label: "Customer Information",
        collapsible: true,
        fields: [
          { name: "customerName", size: 6 },
          { name: "customerEmail", size: 6 }
        ]
      },
      {
        label: "Shipping Details",
        collapsible: true,
        fields: [
          { name: "shippingAddress", size: 12 },
          { name: "shippingMethod", size: 12 }
        ]
      },
      {
        label: "Payment Information",
        collapsible: true,
        collapsed: true, // Start collapsed
        fields: [
          { name: "cardNumber", size: 8 },
          { name: "expiryDate", size: 4 }
        ]
      }
    ]
  }
});
```

## Field Configuration

Each field in a layout can be configured with various options:

```typescript
const fieldConfig = {
  name: "fieldName",     // Required: field name from schema
  size: 6,               // Grid size (1-12)
  offset: 1,             // Grid offset
  className: "custom-field", // Custom CSS class
  hidden: false,         // Hide field conditionally
  readonly: false        // Make field read-only
};
```

## Layout Management

### Multiple Layouts

Schemas can have multiple named layouts:

```typescript
const userSchema = nu.object({
  name: nu.string(),
  email: nu.string(),
  role: nu.string(),
  department: nu.string()
}).withLayouts({
  // Compact layout for quick edits
  compact: {
    type: "form",
    groups: [{
      fields: [
        { name: "name", size: 6 },
        { name: "email", size: 6 }
      ]
    }]
  },
  
  // Full layout for detailed editing
  full: {
    type: "form", 
    groups: [{
      label: "User Details",
      fields: [
        { name: "name", size: 12 },
        { name: "email", size: 12 },
        { name: "role", size: 6 },
        { name: "department", size: 6 }
      ]
    }]
  }
});

// Access different layouts
const compactLayout = userSchema.getLayout("compact");
const fullLayout = userSchema.getLayout("full");
const allLayouts = userSchema.getLayoutNames(); // ["compact", "full"]
```

### Layout Utilities

```typescript
// Check if layout exists
const hasLayout = userSchema.hasLayout("compact"); // true

// Get all layout names
const layoutNames = userSchema.getLayoutNames(); // string[]

// Get specific layout
const layout = userSchema.getLayout("compact"); // Layout object or undefined
```

## Advanced Features

### Conditional Fields

Fields can be shown/hidden based on data:

```typescript
const applicationSchema = nu.object({
  applicationType: nu.string(),
  individualName: nu.string(),
  companyName: nu.string(),
  companySize: nu.number()
}).withLayouts({
  conditional: {
    type: "form",
    groups: [{
      fields: [
        { name: "applicationType", size: 12 },
        { 
          name: "individualName", 
          size: 12,
          // Show only if applicationType is "individual"
          condition: (data) => data.applicationType === "individual"
        },
        {
          name: "companyName",
          size: 8,
          condition: (data) => data.applicationType === "company"
        },
        {
          name: "companySize", 
          size: 4,
          condition: (data) => data.applicationType === "company"
        }
      ]
    }]
  }
});
```

### Responsive Sizing

Define different sizes for different breakpoints:

```typescript
const responsiveSchema = nu.object({
  title: nu.string(),
  description: nu.string(),
  image: nu.string()
}).withLayouts({
  responsive: {
    type: "form",
    groups: [{
      fields: [
        {
          name: "title",
          size: { xs: 12, md: 8, lg: 6 } // Responsive sizes
        },
        {
          name: "description", 
          size: { xs: 12, md: 12, lg: 6 }
        },
        {
          name: "image",
          size: 12
        }
      ]
    }]
  }
});
```

### Custom Group Configuration

Groups can have additional configuration:

```typescript
const groupConfig = {
  label: "Section Title",        // Group heading
  description: "Section help",   // Group description
  collapsible: true,            // Can be collapsed
  collapsed: false,             // Start collapsed
  className: "custom-group",    // Custom CSS class
  fields: [/* field configs */]
};
```

## Integration with React Components

When using with @nubase/frontend, layouts automatically drive form rendering:

```tsx
import { SchemaForm } from '@nubase/frontend';

function UserForm() {
  return (
    <SchemaForm
      schema={userSchema}
      layout="compact"  // Use specific layout
      data={userData}
      onChange={handleChange}
    />
  );
}

// Layout is automatically applied to form rendering
```

## Best Practices

### Layout Organization

```typescript
// ✅ Good: Logical grouping
const goodSchema = nu.object({
  // Personal info
  firstName: nu.string(),
  lastName: nu.string(),
  
  // Contact info  
  email: nu.string(),
  phone: nu.string()
}).withLayouts({
  default: {
    type: "form",
    groups: [
      {
        label: "Personal Information",
        fields: [
          { name: "firstName", size: 6 },
          { name: "lastName", size: 6 }
        ]
      },
      {
        label: "Contact Information", 
        fields: [
          { name: "email", size: 6 },
          { name: "phone", size: 6 }
        ]
      }
    ]
  }
});
```

### Size Guidelines

```typescript
// Common size patterns
const sizePatterns = {
  fullWidth: 12,      // Full row
  half: 6,            // Half row
  third: 4,           // Third of row
  quarter: 3,         // Quarter of row
  
  // For different field types
  shortText: 6,       // Name, title
  longText: 12,       // Description, bio
  number: 4,          // Price, quantity
  date: 6,            // Date fields
  boolean: 3,         // Checkboxes
};
```

### Layout Naming

```typescript
// ✅ Good: Descriptive layout names
const schema = nu.object({...}).withLayouts({
  compact: { /* minimal fields */ },
  detailed: { /* all fields */ },
  mobile: { /* mobile-optimized */ },
  readonly: { /* display-only */ }
});

// ❌ Avoid: Generic names
const badSchema = nu.object({...}).withLayouts({
  layout1: { /* unclear purpose */ },
  layout2: { /* unclear purpose */ }
});
```

## Common Patterns

### Master-Detail Forms

```typescript
const orderSchema = nu.object({
  // Order header
  orderNumber: nu.string(),
  orderDate: nu.string(),
  customer: nu.string(),
  
  // Order details
  items: nu.array(nu.object({
    product: nu.string(),
    quantity: nu.number(),
    price: nu.number()
  })),
  
  // Order totals
  subtotal: nu.number(),
  tax: nu.number(),
  total: nu.number()
}).withLayouts({
  masterDetail: {
    type: "tabs",
    groups: [
      {
        label: "Order Info",
        fields: [
          { name: "orderNumber", size: 4 },
          { name: "orderDate", size: 4 },
          { name: "customer", size: 4 }
        ]
      },
      {
        label: "Items",
        fields: [
          { name: "items", size: 12 }
        ]
      },
      {
        label: "Totals",
        fields: [
          { name: "subtotal", size: 4 },
          { name: "tax", size: 4 },
          { name: "total", size: 4 }
        ]
      }
    ]
  }
});
```

### Wizard-Style Forms

```typescript
const wizardSchema = nu.object({
  // Step 1: Basic info
  name: nu.string(),
  email: nu.string(),
  
  // Step 2: Details
  address: nu.string(),
  phone: nu.string(),
  
  // Step 3: Preferences
  notifications: nu.boolean(),
  newsletter: nu.boolean()
}).withLayouts({
  wizard: {
    type: "accordion",
    groups: [
      {
        label: "Step 1: Basic Information",
        fields: [
          { name: "name", size: 12 },
          { name: "email", size: 12 }
        ]
      },
      {
        label: "Step 2: Contact Details",
        fields: [
          { name: "address", size: 12 },
          { name: "phone", size: 12 }
        ]
      },
      {
        label: "Step 3: Preferences",
        fields: [
          { name: "notifications", size: 6 },
          { name: "newsletter", size: 6 }
        ]
      }
    ]
  }
});
```

The layout system provides powerful, flexible UI organization while maintaining separation between your data structure and presentation. Combined with the schema system, it enables rapid development of complex, maintainable forms and interfaces.