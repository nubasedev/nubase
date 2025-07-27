---
sidebar_position: 4
---

# Layout System

The Nubase layout system provides a flexible, declarative way to define how forms are rendered. Instead of manually creating form UIs, you define layouts that specify how schema fields should be organized, grouped, and displayed.

## Overview

Layouts are attached to object schemas using the `.withLayouts()` method and define:

- **Layout type** - How the overall form is structured (form, grid, tabs, etc.)
- **Groups** - Logical sections containing related fields
- **Fields** - Individual form elements with positioning and styling
- **Configuration** - Layout-specific options like columns and spacing

## Basic Layout Definition

```typescript
import { nu } from '@nubase/core';

const productSchema = nu.object({
  name: nu.string().withMeta({ label: "Product Name" }),
  price: nu.number().withMeta({ label: "Price" }),
  inStock: nu.boolean().withMeta({ label: "In Stock" }),
  description: nu.string().withMeta({ label: "Description" })
}).withLayouts({
  default: {
    type: "form",
    groups: [
      {
        label: "Product Details",
        description: "Basic product information",
        fields: [
          { name: "name", size: 12 },
          { name: "price", size: 6 },
          { name: "inStock", size: 6 },
          { name: "description", size: 12 }
        ]
      }
    ]
  }
});
```

## Layout Types

### Form Layout

Traditional vertical form layout - the most common type for business applications.

```typescript
const formLayout = {
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
    },
    {
      label: "Address",
      fields: [
        { name: "street", size: 12 },
        { name: "city", size: 8 },
        { name: "zip", size: 4 }
      ]
    }
  ]
};
```

### Grid Layout

Responsive grid-based layout with configurable columns.

```typescript
const gridLayout = {
  type: "grid",
  config: {
    columns: 12,
    gap: "1rem"
  },
  groups: [
    {
      label: "Basic Info",
      fields: [
        { name: "name", size: 8 },
        { name: "price", size: 4 },
        { name: "category", size: 6 },
        { name: "tags", size: 6 }
      ]
    }
  ]
};
```

### Tabs Layout

Organize content into tabbed sections for complex forms.

```typescript
const tabsLayout = {
  type: "tabs",
  groups: [
    {
      label: "Profile",
      description: "Personal information",
      fields: [
        { name: "name", size: 12 },
        { name: "email", size: 12 },
        { name: "bio", size: 12 }
      ]
    },
    {
      label: "Settings",
      description: "Account preferences",
      fields: [
        { name: "theme", size: 6 },
        { name: "language", size: 6 },
        { name: "notifications", size: 12 }
      ]
    },
    {
      label: "Privacy",
      description: "Privacy controls",
      fields: [
        { name: "publicProfile", size: 12 },
        { name: "searchable", size: 12 }
      ]
    }
  ]
};
```

### Accordion Layout

Collapsible sections for organizing large forms.

```typescript
const accordionLayout = {
  type: "accordion",
  groups: [
    {
      label: "Basic Information",
      collapsible: true,
      defaultCollapsed: false,
      fields: [
        { name: "name", size: 12 },
        { name: "description", size: 12 }
      ]
    },
    {
      label: "Advanced Settings",
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        { name: "advancedOption1", size: 6 },
        { name: "advancedOption2", size: 6 }
      ]
    }
  ]
};
```

### Custom Layout

For specialized layout requirements.

```typescript
const customLayout = {
  type: "custom",
  className: "my-custom-layout",
  config: {
    variant: "sidebar",
    sidebarWidth: "300px"
  },
  groups: [
    {
      label: "Main Content",
      className: "main-content",
      fields: [
        { name: "title", size: 12 },
        { name: "content", size: 12 }
      ]
    },
    {
      label: "Sidebar",
      className: "sidebar",
      fields: [
        { name: "tags", size: 12 },
        { name: "category", size: 12 }
      ]
    }
  ]
};
```

## Layout Configuration

### Layout Interface

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

### Group Configuration

```typescript
interface LayoutGroup<TShape extends ObjectShape> {
  label?: string;              // Group title
  description?: string;        // Group description
  fields: LayoutField<TShape>[]; // Fields in this group
  className?: string;          // CSS classes for the group
  collapsible?: boolean;       // Can be collapsed/expanded
  defaultCollapsed?: boolean;  // Initially collapsed state
}
```

### Field Configuration

```typescript
interface LayoutField<TShape extends ObjectShape> {
  name: keyof TShape;    // Field name (must match schema property)
  size?: number;         // Size in grid columns (e.g., 12 for full width)
  className?: string;    // CSS classes for the field
  hidden?: boolean;      // Hide the field conditionally
}
```

## Layout Management

### Accessing Layouts

```typescript
const userSchema = nu.object({
  name: nu.string(),
  email: nu.string()
}).withLayouts({
  default: { /* ... */ },
  compact: { /* ... */ },
  mobile: { /* ... */ }
});

// Get all layout names
const layoutNames = userSchema.getLayoutNames();
// Returns: ["default", "compact", "mobile"]

// Get specific layout
const defaultLayout = userSchema.getLayout("default");
const compactLayout = userSchema.getLayout("compact");

// Check if layout exists
const hasLayout = userSchema.hasLayout("mobile"); // true
const hasOther = userSchema.hasLayout("nonexistent"); // false
```

### Multiple Layouts

Define different layouts for different contexts:

```typescript
const productSchema = nu.object({
  name: nu.string(),
  description: nu.string(),
  price: nu.number(),
  category: nu.string(),
  tags: nu.array(nu.string()),
  inStock: nu.boolean(),
  weight: nu.number(),
  dimensions: nu.object({
    length: nu.number(),
    width: nu.number(),
    height: nu.number()
  })
}).withLayouts({
  // Full form for admin users
  admin: {
    type: "form",
    groups: [
      {
        label: "Basic Information",
        fields: [
          { name: "name", size: 12 },
          { name: "description", size: 12 },
          { name: "category", size: 6 },
          { name: "tags", size: 6 }
        ]
      },
      {
        label: "Pricing & Inventory",
        fields: [
          { name: "price", size: 6 },
          { name: "inStock", size: 6 }
        ]
      },
      {
        label: "Shipping",
        fields: [
          { name: "weight", size: 4 },
          { name: "dimensions", size: 8 }
        ]
      }
    ]
  },
  
  // Simplified form for regular users
  basic: {
    type: "form",
    groups: [
      {
        label: "Product Details",
        fields: [
          { name: "name", size: 12 },
          { name: "description", size: 12 },
          { name: "price", size: 6 },
          { name: "inStock", size: 6 }
        ]
      }
    ]
  },
  
  // Compact grid for mobile
  mobile: {
    type: "grid",
    config: { columns: 12, gap: "0.5rem" },
    groups: [
      {
        fields: [
          { name: "name", size: 12 },
          { name: "price", size: 6 },
          { name: "inStock", size: 6 },
          { name: "description", size: 12 }
        ]
      }
    ]
  }
});
```

## Advanced Layout Features

### Conditional Field Visibility

```typescript
const userSchema = nu.object({
  userType: nu.string(),
  adminKey: nu.string(),
  regularField: nu.string(),
  advancedField: nu.string()
}).withLayouts({
  conditional: {
    type: "form",
    groups: [
      {
        label: "User Information",
        fields: [
          { name: "userType", size: 12 },
          { name: "regularField", size: 12 },
          // Hide admin fields for non-admin users
          { name: "adminKey", size: 12, hidden: false }, 
          { name: "advancedField", size: 12, hidden: false }
        ]
      }
    ]
  }
});

// Layout visibility can be controlled programmatically
// based on form state or user permissions
```

### Responsive Layouts

```typescript
const responsiveSchema = nu.object({
  title: nu.string(),
  subtitle: nu.string(),
  content: nu.string(),
  sidebar: nu.string()
}).withLayouts({
  desktop: {
    type: "grid",
    config: { columns: 12, gap: "2rem" },
    groups: [
      {
        label: "Main Content",
        fields: [
          { name: "title", size: 8 },
          { name: "subtitle", size: 8 },
          { name: "content", size: 8 }
        ]
      },
      {
        label: "Sidebar",
        fields: [
          { name: "sidebar", size: 4 }
        ]
      }
    ]
  },
  
  mobile: {
    type: "form",
    groups: [
      {
        label: "Content",
        fields: [
          { name: "title", size: 12 },
          { name: "subtitle", size: 12 },
          { name: "content", size: 12 },
          { name: "sidebar", size: 12 }
        ]
      }
    ]
  }
});
```

### Complex Layout Composition

```typescript
const articleSchema = nu.object({
  title: nu.string(),
  subtitle: nu.string(),
  content: nu.string(),
  published: nu.boolean(),
  publishDate: nu.string(),
  tags: nu.array(nu.string()),
  category: nu.string(),
  featured: nu.boolean(),
  seoTitle: nu.string(),
  seoDescription: nu.string(),
  socialImage: nu.string()
}).withLayouts({
  editor: {
    type: "tabs",
    className: "article-editor",
    groups: [
      {
        label: "Content",
        description: "Article content and basic information",
        fields: [
          { name: "title", size: 12, className: "title-field" },
          { name: "subtitle", size: 12 },
          { name: "content", size: 12, className: "content-editor" }
        ]
      },
      {
        label: "Publishing",
        description: "Publication settings",
        fields: [
          { name: "published", size: 4 },
          { name: "publishDate", size: 8 },
          { name: "featured", size: 4 },
          { name: "category", size: 8 },
          { name: "tags", size: 12 }
        ]
      },
      {
        label: "SEO",
        description: "Search engine optimization",
        collapsible: true,
        defaultCollapsed: true,
        fields: [
          { name: "seoTitle", size: 12 },
          { name: "seoDescription", size: 12 },
          { name: "socialImage", size: 12 }
        ]
      }
    ]
  },
  
  quickEdit: {
    type: "accordion",
    groups: [
      {
        label: "Essential",
        collapsible: false,
        fields: [
          { name: "title", size: 12 },
          { name: "content", size: 12 }
        ]
      },
      {
        label: "Publishing",
        collapsible: true,
        defaultCollapsed: false,
        fields: [
          { name: "published", size: 6 },
          { name: "featured", size: 6 }
        ]
      },
      {
        label: "Metadata",
        collapsible: true,
        defaultCollapsed: true,
        fields: [
          { name: "category", size: 6 },
          { name: "tags", size: 6 }
        ]
      }
    ]
  }
});
```

## Layout Styling and CSS

### CSS Classes

Layouts support CSS classes at multiple levels:

```typescript
const styledSchema = nu.object({
  field1: nu.string(),
  field2: nu.string(),
  field3: nu.string()
}).withLayouts({
  styled: {
    type: "form",
    className: "custom-form-layout",  // Layout-level class
    groups: [
      {
        label: "Section 1",
        className: "section-primary",   // Group-level class
        fields: [
          { 
            name: "field1", 
            size: 12, 
            className: "highlight-field"  // Field-level class
          },
          { name: "field2", size: 6 },
          { name: "field3", size: 6, className: "compact-field" }
        ]
      }
    ]
  }
});
```

### Grid System

The layout system uses a 12-column grid by default:

```typescript
const gridExample = {
  type: "grid",
  config: {
    columns: 12,    // Total columns
    gap: "1rem"     // Spacing between fields
  },
  groups: [
    {
      fields: [
        { name: "field1", size: 12 },  // Full width
        { name: "field2", size: 6 },   // Half width
        { name: "field3", size: 6 },   // Half width
        { name: "field4", size: 4 },   // One third
        { name: "field5", size: 4 },   // One third
        { name: "field6", size: 4 }    // One third
      ]
    }
  ]
};
```

## Schema Integration

### Layout with Schema Manipulation

Layouts are automatically updated when schemas are modified:

```typescript
const baseSchema = nu.object({
  name: nu.string(),
  email: nu.string(),
  password: nu.string(),
  confirmPassword: nu.string()
}).withLayouts({
  default: {
    type: "form",
    groups: [{
      fields: [
        { name: "name", size: 12 },
        { name: "email", size: 12 },
        { name: "password", size: 6 },
        { name: "confirmPassword", size: 6 }
      ]
    }]
  }
});

// Omit sensitive fields - layout automatically updates
const publicSchema = baseSchema.omit("password", "confirmPassword");
const layout = publicSchema.getLayout("default");
// Layout now only contains name and email fields

// Extend with new fields - layout preserves existing structure
const extendedSchema = baseSchema.extend({
  phone: nu.string(),
  address: nu.string()
});
// Original layout is preserved, new fields not automatically included
```

### Type Safety

Layouts are fully type-safe with schema field names:

```typescript
const userSchema = nu.object({
  firstName: nu.string(),
  lastName: nu.string(),
  email: nu.string()
});

const layout = userSchema.withLayouts({
  default: {
    type: "form",
    groups: [{
      fields: [
        { name: "firstName", size: 6 },    // ✅ Valid field name
        { name: "lastName", size: 6 },     // ✅ Valid field name
        { name: "email", size: 12 },       // ✅ Valid field name
        // { name: "phone", size: 12 }     // ❌ TypeScript error - field doesn't exist
      ]
    }]
  }
});
```

## Best Practices

### Layout Organization

```typescript
// 1. Define layouts based on user context
const userSchema = nu.object({
  // ... fields
}).withLayouts({
  admin: { /* Full access layout */ },
  editor: { /* Limited editing layout */ },
  viewer: { /* Read-only layout */ }
});

// 2. Create responsive layouts
const schema = nu.object({
  // ... fields  
}).withLayouts({
  desktop: { type: "grid", config: { columns: 12 } },
  tablet: { type: "grid", config: { columns: 8 } },
  mobile: { type: "form" }
});

// 3. Use semantic group names
const layout = {
  type: "form",
  groups: [
    { label: "Personal Information", fields: [/* ... */] },
    { label: "Contact Details", fields: [/* ... */] },
    { label: "Preferences", fields: [/* ... */] }
  ]
};
```

### Field Sizing

```typescript
// Common sizing patterns
const commonSizes = {
  fullWidth: 12,
  halfWidth: 6,
  thirdWidth: 4,
  quarterWidth: 3,
  twoThirds: 8,
  threeQuarters: 9
};

const layout = {
  type: "grid",
  groups: [{
    fields: [
      { name: "title", size: commonSizes.fullWidth },
      { name: "firstName", size: commonSizes.halfWidth },
      { name: "lastName", size: commonSizes.halfWidth },
      { name: "phone", size: commonSizes.thirdWidth },
      { name: "email", size: commonSizes.twoThirds }
    ]
  }]
};
```

### Layout Reusability

```typescript
// Create reusable layout fragments
const personalInfoGroup = {
  label: "Personal Information",
  fields: [
    { name: "firstName", size: 6 },
    { name: "lastName", size: 6 },
    { name: "email", size: 12 }
  ]
};

const addressGroup = {
  label: "Address",
  fields: [
    { name: "street", size: 12 },
    { name: "city", size: 8 },
    { name: "zip", size: 4 }
  ]
};

// Compose layouts from reusable groups
const userSchema = nu.object({
  // ... fields
}).withLayouts({
  registration: {
    type: "form",
    groups: [personalInfoGroup, addressGroup]
  },
  profile: {
    type: "tabs",
    groups: [
      { ...personalInfoGroup, label: "Profile" },
      { ...addressGroup, label: "Location" }
    ]
  }
});
```

## Common Layout Patterns

### Registration Form

```typescript
const registrationLayout = {
  type: "form",
  groups: [
    {
      label: "Account Information",
      fields: [
        { name: "username", size: 6 },
        { name: "email", size: 6 },
        { name: "password", size: 6 },
        { name: "confirmPassword", size: 6 }
      ]
    },
    {
      label: "Personal Details",
      fields: [
        { name: "firstName", size: 6 },
        { name: "lastName", size: 6 },
        { name: "dateOfBirth", size: 4 },
        { name: "phone", size: 8 }
      ]
    }
  ]
};
```

### Settings Page

```typescript
const settingsLayout = {
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
        { name: "timezone", size: 12 },
        { name: "notifications", size: 12 }
      ]
    },
    {
      label: "Privacy",
      fields: [
        { name: "publicProfile", size: 12 },
        { name: "searchable", size: 12 },
        { name: "showEmail", size: 12 }
      ]
    }
  ]
};
```

### Dashboard Configuration

```typescript
const dashboardLayout = {
  type: "accordion",
  groups: [
    {
      label: "Widget Settings",
      collapsible: false,
      fields: [
        { name: "title", size: 12 },
        { name: "refreshInterval", size: 6 },
        { name: "autoRefresh", size: 6 }
      ]
    },
    {
      label: "Data Source",
      collapsible: true,
      defaultCollapsed: false,
      fields: [
        { name: "dataSource", size: 12 },
        { name: "filters", size: 12 }
      ]
    },
    {
      label: "Appearance",
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        { name: "theme", size: 6 },
        { name: "colorScheme", size: 6 },
        { name: "customCSS", size: 12 }
      ]
    }
  ]
};
```

The layout system provides the flexibility to create intuitive, well-organized forms that adapt to different use cases and user needs while maintaining type safety and integration with the schema system.