---
sidebar_position: 4
---

# Form Layouts

Form layouts in Nubase provide flexible UI organization for forms and interactive interfaces. They allow you to arrange fields in various patterns including traditional forms, responsive grids, tabbed interfaces, and collapsible accordions.

## Overview

Form layouts use the `withFormLayouts()` method and support these layout types:

- **form** - Traditional vertical form with grouped fields
- **grid** - Responsive grid-based layout with configurable columns
- **tabs** - Tabbed interface for organizing complex forms
- **accordion** - Collapsible sections for hierarchical organization

All form layouts work with the same field configuration and are rendered by the `SchemaFormVerticalLayout` component.

## Form Layout

The most common layout type for traditional forms:

```typescript
import { nu } from '@nubase/core';

const userSchema = nu.object({
  firstName: nu.string().withMeta({ label: "First Name" }),
  lastName: nu.string().withMeta({ label: "Last Name" }),
  email: nu.string().withMeta({ label: "Email Address" }),
  phone: nu.string().withMeta({ label: "Phone Number" })
}).withFormLayouts({
  default: {
    type: "form",
    groups: [
      {
        label: "Personal Information",
        fields: [
          { name: "firstName", fieldWidth: 6 },
          { name: "lastName", fieldWidth: 6 },
          { name: "email", fieldWidth: 12 },
          { name: "phone", fieldWidth: 12 }
        ]
      }
    ]
  }
});
```

Form layouts organize fields vertically with proper spacing and semantic grouping.

## Grid Layout

For responsive, grid-based layouts with flexible column arrangements:

```typescript
const productSchema = nu.object({
  name: nu.string(),
  price: nu.number(),
  category: nu.string(),
  description: nu.string(),
  inStock: nu.boolean()
}).withFormLayouts({
  grid: {
    type: "grid",
    config: {
      columns: 12,     // Total grid columns
      gap: "1rem"      // Gap between elements
    },
    groups: [
      {
        fields: [
          { name: "name", fieldWidth: 8 },
          { name: "price", fieldWidth: 4 },
          { name: "category", fieldWidth: 6 },
          { name: "inStock", fieldWidth: 6 },
          { name: "description", fieldWidth: 12 }
        ]
      }
    ]
  }
});
```

Grid layouts provide more control over field positioning and can adapt to different screen sizes.

## Tabs Layout

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
}).withFormLayouts({
  tabbed: {
    type: "tabs",
    groups: [
      {
        label: "Profile",
        description: "Your public profile information",
        fields: [
          { name: "displayName", fieldWidth: 12 },
          { name: "bio", fieldWidth: 12 },
          { name: "avatar", fieldWidth: 12 }
        ]
      },
      {
        label: "Preferences", 
        description: "Application preferences and settings",
        fields: [
          { name: "theme", fieldWidth: 6 },
          { name: "language", fieldWidth: 6 },
          { name: "notifications", fieldWidth: 12 }
        ]
      },
      {
        label: "Privacy",
        description: "Control your privacy settings",
        fields: [
          { name: "publicProfile", fieldWidth: 6 },
          { name: "searchable", fieldWidth: 6 }
        ]
      }
    ]
  }
});
```

Tabs are perfect for forms with distinct sections that don't need to be visible simultaneously.

## Accordion Layout

Collapsible sections for complex forms with hierarchical organization:

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
}).withFormLayouts({
  accordion: {
    type: "accordion",
    groups: [
      {
        label: "Customer Information",
        description: "Basic customer details",
        collapsible: true,
        defaultCollapsed: false,  // Start expanded
        fields: [
          { name: "customerName", fieldWidth: 6 },
          { name: "customerEmail", fieldWidth: 6 }
        ]
      },
      {
        label: "Shipping Details",
        collapsible: true,
        defaultCollapsed: false,
        fields: [
          { name: "shippingAddress", fieldWidth: 12 },
          { name: "shippingMethod", fieldWidth: 12 }
        ]
      },
      {
        label: "Payment Information",
        description: "Secure payment details",
        collapsible: true,
        defaultCollapsed: true,   // Start collapsed
        className: "payment-section",
        fields: [
          { name: "cardNumber", fieldWidth: 8 },
          { name: "expiryDate", fieldWidth: 4 }
        ]
      }
    ]
  }
});
```

Accordions save space and allow users to focus on specific sections while keeping others collapsed.

## Field Configuration

Each field in a form layout can be configured with various options:

```typescript
interface FormLayoutField<TShape extends ObjectShape> {
  name: keyof TShape;      // Required: field name from schema
  fieldWidth?: number;     // Width in grid units (1-12)
  className?: string;      // Additional CSS classes
  hidden?: boolean;        // Hide field conditionally
}
```

### Field Width

Field width uses a 12-column grid system:

```typescript
const fieldSizes = {
  fullWidth: 12,    // Full row
  half: 6,          // Half row
  third: 4,         // Third of row
  quarter: 3,       // Quarter of row
  
  // Common patterns
  shortText: 6,     // Name, title
  longText: 12,     // Description, bio
  number: 4,        // Price, quantity
  date: 6,          // Date fields
  boolean: 3,       // Checkboxes
};

const layoutExample = {
  type: "form" as const,
  groups: [{
    fields: [
      { name: "title", fieldWidth: 8 },      // 8/12 of row
      { name: "priority", fieldWidth: 4 },   // 4/12 of row
      { name: "description", fieldWidth: 12 }, // Full row
      { name: "dueDate", fieldWidth: 6 },    // 6/12 of row
      { name: "completed", fieldWidth: 6 }   // 6/12 of row
    ]
  }]
};
```

## Group Configuration

Layout groups provide structure and organization:

```typescript
interface LayoutGroup<TShape extends ObjectShape> {
  label?: string;              // Group heading
  description?: string;        // Group description/help text
  fields: FormLayoutField<TShape>[];  // Fields in this group
  className?: string;          // Custom CSS class
  collapsible?: boolean;       // Can be collapsed (accordion layouts)
  defaultCollapsed?: boolean;  // Start collapsed (accordion layouts)
}
```

### Advanced Group Configuration

```typescript
const advancedLayout = {
  type: "form" as const,
  className: "advanced-form",
  config: {
    columns: 12,
    gap: "1.5rem"
  },
  groups: [
    {
      label: "Required Information",
      description: "These fields are required to continue",
      className: "required-section",
      fields: [
        { name: "name", fieldWidth: 12 },
        { name: "email", fieldWidth: 12 }
      ]
    },
    {
      label: "Optional Details",
      description: "Additional information (optional)",
      className: "optional-section",
      fields: [
        { name: "phone", fieldWidth: 6 },
        { name: "company", fieldWidth: 6 },
        { name: "notes", fieldWidth: 12 }
      ]
    }
  ]
};
```

## Field Visibility Control

Control field visibility using the `hidden` property:

```typescript
const visibilitySchema = nu.object({
  publicField: nu.string(),
  internalField: nu.string(),
  debugField: nu.number(),
}).withFormLayouts({
  public: {
    type: "form",
    groups: [{
      label: "Public Information",
      fields: [
        { name: "publicField", fieldWidth: 12 },
        { name: "internalField", fieldWidth: 12, hidden: true },  // Hidden
        { name: "debugField", fieldWidth: 12, hidden: true }      // Hidden
      ]
    }]
  },
  debug: {
    type: "form",
    groups: [{
      label: "All Fields (Debug Mode)",
      fields: [
        { name: "publicField", fieldWidth: 4 },
        { name: "internalField", fieldWidth: 4 },
        { name: "debugField", fieldWidth: 4 }  // All visible
      ]
    }]
  }
});
```

## Responsive Field Sizing

Define different field sizes for different breakpoints:

```typescript
const responsiveSchema = nu.object({
  title: nu.string(),
  description: nu.string(),
  image: nu.string()
}).withFormLayouts({
  responsive: {
    type: "form",
    groups: [{
      fields: [
        {
          name: "title",
          fieldWidth: { xs: 12, md: 8, lg: 6 }  // Responsive sizes
        },
        {
          name: "description", 
          fieldWidth: { xs: 12, md: 12, lg: 6 }
        },
        {
          name: "image",
          fieldWidth: 12  // Always full width
        }
      ]
    }]
  }
});
```

## Integration with React Components

### Using Form Layouts

```typescript
import { SchemaForm, SchemaFormBody, SchemaFormButtonBar } from '@nubase/frontend';
import { useSchemaForm } from '@nubase/frontend';

function UserForm() {
  const form = useSchemaForm({
    schema: userSchema,
    onSubmit: async (data) => {
      // Handle form submission
      console.log('User data:', data);
    }
  });

  return (
    <SchemaForm form={form} className="max-w-4xl">
      <SchemaFormBody 
        form={form}
        layoutName="tabbed"  // Use specific layout
        className="space-y-6"
      />
      <SchemaFormButtonBar 
        form={form} 
        submitText="Save User"
        cancelText="Cancel"
      />
    </SchemaForm>
  );
}
```

### Layout-Specific Styling

Target layout types with CSS classes:

```css
/* Layout type classes are automatically added */
.layout-form {
  /* Styles for form layouts */
}

.layout-grid {
  /* Styles for grid layouts */
  display: grid;
  grid-template-columns: repeat(12, 1fr);
}

.layout-tabs {
  /* Styles for tab layouts */
}

.layout-accordion {
  /* Styles for accordion layouts */
}

/* Group and field classes */
.form-group {
  /* Styles for layout groups */
}

.required-section {
  /* Custom group styles */
  border: 1px solid var(--color-primary);
}
```

## Common Patterns

### Master-Detail Forms

```typescript
const orderFormSchema = nu.object({
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
}).withFormLayouts({
  masterDetail: {
    type: "tabs",
    groups: [
      {
        label: "Order Info",
        fields: [
          { name: "orderNumber", fieldWidth: 4 },
          { name: "orderDate", fieldWidth: 4 },
          { name: "customer", fieldWidth: 4 }
        ]
      },
      {
        label: "Items",
        fields: [
          { name: "items", fieldWidth: 12 }
        ]
      },
      {
        label: "Totals",
        fields: [
          { name: "subtotal", fieldWidth: 4 },
          { name: "tax", fieldWidth: 4 },
          { name: "total", fieldWidth: 4 }
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
}).withFormLayouts({
  wizard: {
    type: "accordion",
    groups: [
      {
        label: "Step 1: Basic Information",
        description: "Start by entering your basic details",
        collapsible: true,
        defaultCollapsed: false,  // Current step
        fields: [
          { name: "name", fieldWidth: 12 },
          { name: "email", fieldWidth: 12 }
        ]
      },
      {
        label: "Step 2: Contact Details", 
        description: "Add your contact information",
        collapsible: true,
        defaultCollapsed: true,   // Next step
        fields: [
          { name: "address", fieldWidth: 12 },
          { name: "phone", fieldWidth: 12 }
        ]
      },
      {
        label: "Step 3: Preferences",
        description: "Choose your preferences",
        collapsible: true,
        defaultCollapsed: true,   // Final step
        fields: [
          { name: "notifications", fieldWidth: 6 },
          { name: "newsletter", fieldWidth: 6 }
        ]
      }
    ]
  }
});
```

### Multi-Column Forms

```typescript
const multiColumnSchema = nu.object({
  // Left column
  personalInfo: nu.object({
    firstName: nu.string(),
    lastName: nu.string(),
    dateOfBirth: nu.string()
  }),
  
  // Right column  
  contactInfo: nu.object({
    email: nu.string(),
    phone: nu.string(),
    address: nu.string()
  })
}).withFormLayouts({
  twoColumn: {
    type: "grid",
    config: {
      columns: 12,
      gap: "2rem"
    },
    groups: [
      {
        label: "Personal Information",
        className: "col-span-6",  // Left half
        fields: [
          { name: "firstName", fieldWidth: 12 },
          { name: "lastName", fieldWidth: 12 },
          { name: "dateOfBirth", fieldWidth: 12 }
        ]
      },
      {
        label: "Contact Information", 
        className: "col-span-6",  // Right half
        fields: [
          { name: "email", fieldWidth: 12 },
          { name: "phone", fieldWidth: 12 },
          { name: "address", fieldWidth: 12 }
        ]
      }
    ]
  }
});
```

## Best Practices

### Layout Organization

```typescript
// ✅ Good: Logical grouping with meaningful labels
const goodLayout = {
  type: "form" as const,
  groups: [
    {
      label: "Account Details",
      description: "Your account login information",
      fields: [
        { name: "username", fieldWidth: 6 },
        { name: "email", fieldWidth: 6 },
        { name: "password", fieldWidth: 12 }
      ]
    },
    {
      label: "Profile Information",
      description: "Public profile details",
      fields: [
        { name: "displayName", fieldWidth: 8 },
        { name: "avatar", fieldWidth: 4 },
        { name: "bio", fieldWidth: 12 }
      ]
    }
  ]
};

// ❌ Avoid: Poor grouping and unclear organization
const badLayout = {
  type: "form" as const,
  groups: [
    {
      // No label or organization
      fields: [
        { name: "username", fieldWidth: 3 },   // Too narrow
        { name: "password", fieldWidth: 2 },   // Too narrow
        { name: "bio", fieldWidth: 7 },        // Awkward width
        { name: "email", fieldWidth: 12 },     // Mixed with unrelated fields
      ]
    }
  ]
};
```

### Field Width Guidelines

```typescript
// Recommended field widths for common field types
const fieldWidthGuide = {
  // Text fields
  shortText: 6,        // First name, last name, title
  mediumText: 8,       // Email, username
  longText: 12,        // Description, bio, address
  
  // Numeric fields
  smallNumber: 3,      // Age, quantity (1-2 digits)
  mediumNumber: 4,     // Price, ID (3-5 digits)
  largeNumber: 6,      // Phone, postal code
  
  // Selection fields
  dropdown: 6,         // Categories, countries
  multiSelect: 8,      // Tags, permissions
  
  // Boolean fields
  checkbox: 4,         // Single checkboxes
  radioGroup: 6,       // Radio button groups
  
  // Date/Time fields
  date: 4,             // Date picker
  dateTime: 6,         // Date and time picker
  timeRange: 8,        // Start and end times
  
  // Special fields
  fileUpload: 8,       // File input
  colorPicker: 3,      // Color selection
  slider: 6,           // Range inputs
};
```

### Layout Type Selection

Choose the right layout type for your use case:

- **form** - Simple, linear forms with logical grouping
- **grid** - Complex forms needing precise field positioning
- **tabs** - Forms with distinct sections that don't need simultaneous visibility
- **accordion** - Long forms where sections can be collapsed to save space

### Performance Tips

- Use field visibility (`hidden: true`) instead of conditional rendering for better performance
- Group related fields together to improve form completion rates
- Keep accordion sections focused - each should represent a logical step or category
- Test responsive field widths on different screen sizes

## Next Steps

- **Table Layouts**: Learn about [table layouts](./table-layouts.md) for data grids
- **Layout System**: Understand the overall [layout system](./layouts.md) concepts  
- **Frontend Components**: See how to integrate with [frontend components](./frontend.md)
- **Schema System**: Learn how layouts work with [schemas](./schema.md)