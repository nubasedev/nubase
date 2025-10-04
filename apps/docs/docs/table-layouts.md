---
sidebar_position: 5
---

# Table Layouts

Table layouts in Nubase provide declarative configuration for data grids and tabular views. They allow you to define column widths, pinning behavior, visibility, and interactive features for displaying collections of data.

## Overview

Table layouts use the `withTableLayouts()` method and are specifically designed for:

- **Data Grids** - Displaying collections of records in tables
- **List Views** - Showing searchable, filterable lists of items  
- **Column Control** - Precise control over column widths, pinning, and visibility
- **Link Fields** - Making specific columns clickable for navigation
- **Resource Views** - Integration with Nubase resource operations

Table layouts are rendered by the `ResourceSearchViewRenderer` component and integrate with the DataGrid component.

## Basic Table Layout

Define table layouts using the simplified `withTableLayouts()` API:

```typescript
import { nu } from '@nubase/core';

const userSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  email: nu.string(),
  role: nu.string(),
  createdAt: nu.string(),
  isActive: nu.boolean()
}).withTableLayouts({
  default: {
    fields: [
      { name: "id", columnWidthPx: 80 },
      { name: "name", columnWidthPx: 200 },
      { name: "email", columnWidthPx: 250 },
      { name: "role", columnWidthPx: 120 },
      { name: "createdAt", columnWidthPx: 140 },
      { name: "isActive", columnWidthPx: 100 }
    ],
    metadata: {
      linkFields: ["name"]  // Make name column clickable
    }
  }
});
```

## TableLayoutField Interface

Each table field supports specific properties for column configuration:

```typescript
interface TableLayoutField<TShape extends ObjectShape> {
  name: keyof TShape;          // Required: field name from schema
  columnWidthPx?: number;      // Column width in pixels
  pinned?: boolean;            // Pin/freeze column to the left
  hidden?: boolean;            // Hide column from view
  className?: string;          // Custom CSS class for column
}
```

### Field Properties

```typescript
const exampleField = {
  name: "productName",         // Must match schema field name
  columnWidthPx: 250,         // Fixed width in pixels (not grid units)
  pinned: true,               // Freeze column to left side
  hidden: false,              // Show/hide column
  className: "product-name-col" // Custom styling
};
```

## Column Width Configuration

Unlike form layouts which use grid units (1-12), table layouts use pixel widths for precise control:

```typescript
const productTableSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  price: nu.number(),
  category: nu.string(),
  inStock: nu.boolean(),
  description: nu.string()
}).withTableLayouts({
  list: {
    fields: [
      { name: "id", columnWidthPx: 80 },           // Narrow ID column
      { name: "name", columnWidthPx: 200 },        // Medium name column
      { name: "price", columnWidthPx: 100 },       // Small price column
      { name: "category", columnWidthPx: 150 },    // Category dropdown width
      { name: "inStock", columnWidthPx: 80 },      // Boolean checkbox width
      { name: "description", columnWidthPx: 300 }  // Wide description column
    ]
  }
});
```

### Default Column Widths

When `columnWidthPx` is not specified, Nubase applies intelligent defaults based on field types:

```typescript
// Default widths by field type
const DEFAULT_COLUMN_WIDTHS = {
  number: 100,    // For IDs, counts, prices
  boolean: 80,    // Compact for checkmarks
  string: 200,    // General text fields  
  object: 250,    // Complex data
  array: 200,     // Lists
  optional: 200   // Uses wrapped type's width
};
```

## Column Pinning

Use the `pinned` property to freeze columns to the left side of the table:

```typescript
const ticketTableSchema = nu.object({
  id: nu.number(),
  title: nu.string(),
  status: nu.string(),
  assignee: nu.string(),
  priority: nu.string(),
  createdAt: nu.string(),
  description: nu.string()
}).withTableLayouts({
  default: {
    fields: [
      // Pinned columns - always visible when scrolling
      { name: "id", columnWidthPx: 80, pinned: true },
      { name: "title", columnWidthPx: 250, pinned: true },
      
      // Scrollable columns
      { name: "status", columnWidthPx: 120 },
      { name: "assignee", columnWidthPx: 150 },
      { name: "priority", columnWidthPx: 100 },
      { name: "createdAt", columnWidthPx: 140 },
      { name: "description", columnWidthPx: 400 }
    ],
    metadata: {
      linkFields: ["title"]
    }
  }
});
```

### Pinning Best Practices

```typescript
// ✅ Good: Pin key identifying columns
const goodPinning = {
  fields: [
    { name: "id", columnWidthPx: 80, pinned: true },      // Always show ID
    { name: "name", columnWidthPx: 200, pinned: true },   // Always show name
    { name: "email", columnWidthPx: 250 },                // Scrollable
    { name: "department", columnWidthPx: 150 },           // Scrollable
    { name: "lastLogin", columnWidthPx: 140 }             // Scrollable
  ]
};

// ❌ Avoid: Pinning too many columns
const badPinning = {
  fields: [
    { name: "id", columnWidthPx: 80, pinned: true },
    { name: "name", columnWidthPx: 200, pinned: true },
    { name: "email", columnWidthPx: 250, pinned: true },     // Too many pinned
    { name: "department", columnWidthPx: 150, pinned: true }, // Too many pinned
    { name: "role", columnWidthPx: 120, pinned: true },      // Too many pinned
    { name: "lastLogin", columnWidthPx: 140 }                // Little space left
  ]
};
```

## Column Visibility Control

Control column visibility using the `hidden` property:

```typescript
const userAdminSchema = nu.object({
  id: nu.number(),
  username: nu.string(),
  email: nu.string(),
  internalId: nu.string(),
  debugInfo: nu.string(),
  isActive: nu.boolean()
}).withTableLayouts({
  // Public view - hide sensitive fields
  public: {
    fields: [
      { name: "id", columnWidthPx: 80 },
      { name: "username", columnWidthPx: 150 },
      { name: "email", columnWidthPx: 200 },
      { name: "internalId", columnWidthPx: 120, hidden: true },  // Hidden
      { name: "debugInfo", columnWidthPx: 200, hidden: true },   // Hidden
      { name: "isActive", columnWidthPx: 80 }
    ]
  },
  
  // Admin view - show all fields
  admin: {
    fields: [
      { name: "id", columnWidthPx: 80, pinned: true },
      { name: "username", columnWidthPx: 150 },
      { name: "email", columnWidthPx: 200 },
      { name: "internalId", columnWidthPx: 120 },    // Visible for admins
      { name: "debugInfo", columnWidthPx: 200 },     // Visible for admins
      { name: "isActive", columnWidthPx: 80 }
    ]
  }
});
```

## Link Fields

Make columns clickable for navigation using the `linkFields` metadata:

```typescript
const orderTableSchema = nu.object({
  id: nu.number(),
  orderNumber: nu.string(),
  customerName: nu.string(),
  total: nu.number(),
  status: nu.string(),
  createdAt: nu.string()
}).withTableLayouts({
  list: {
    fields: [
      { name: "id", columnWidthPx: 80 },
      { name: "orderNumber", columnWidthPx: 150 },
      { name: "customerName", columnWidthPx: 200 },
      { name: "total", columnWidthPx: 100 },
      { name: "status", columnWidthPx: 120 },
      { name: "createdAt", columnWidthPx: 140 }
    ],
    metadata: {
      // These columns will be clickable links
      linkFields: ["orderNumber", "customerName"]
    }
  }
});
```

### Link Field Behavior

Link fields automatically:
- Render as clickable buttons with hover states
- Navigate to the resource's view operation
- Pass the row's ID as a search parameter
- Apply primary color styling to indicate they're interactive

```typescript
// When a link field is clicked:
// Navigate to: `/r/{resourceName}/view?id={rowId}`
```

## Multiple Table Layouts

Define different table layouts for different contexts:

```typescript
const productSchema = nu.object({
  id: nu.number(),
  name: nu.string(),
  sku: nu.string(),
  price: nu.number(),
  category: nu.string(),
  inStock: nu.boolean(),
  description: nu.string(),
  internalNotes: nu.string()
}).withTableLayouts({
  // Compact view for mobile or tight spaces
  compact: {
    fields: [
      { name: "id", columnWidthPx: 60, pinned: true },
      { name: "name", columnWidthPx: 200, pinned: true },
      { name: "price", columnWidthPx: 80 },
      { name: "inStock", columnWidthPx: 60 }
    ],
    metadata: {
      linkFields: ["name"]
    }
  },
  
  // Detailed view for wide screens
  detailed: {
    fields: [
      { name: "id", columnWidthPx: 80, pinned: true },
      { name: "name", columnWidthPx: 250, pinned: true },
      { name: "sku", columnWidthPx: 120 },
      { name: "price", columnWidthPx: 100 },
      { name: "category", columnWidthPx: 150 },
      { name: "inStock", columnWidthPx: 80 },
      { name: "description", columnWidthPx: 300 }
    ],
    metadata: {
      linkFields: ["name", "sku"]
    }
  },
  
  // Admin view with internal fields
  admin: {
    fields: [
      { name: "id", columnWidthPx: 80, pinned: true },
      { name: "name", columnWidthPx: 200, pinned: true },
      { name: "sku", columnWidthPx: 120 },
      { name: "price", columnWidthPx: 100 },
      { name: "category", columnWidthPx: 150 },
      { name: "inStock", columnWidthPx: 80 },
      { name: "internalNotes", columnWidthPx: 250 }  // Admin-only field
    ],
    metadata: {
      linkFields: ["name"],
      adminView: true,
      sortable: true
    }
  }
});
```

## Custom Metadata

Table layouts support custom metadata for additional configuration:

```typescript
const advancedTableSchema = nu.object({
  // ... fields
}).withTableLayouts({
  advanced: {
    fields: [
      { name: "id", columnWidthPx: 80 },
      { name: "title", columnWidthPx: 200 }
    ],
    metadata: {
      linkFields: ["title"],
      
      // Custom metadata for table behavior
      sortable: true,           // Enable column sorting
      filterable: true,         // Enable column filtering
      searchable: true,         // Enable global search
      paginated: true,          // Enable pagination
      pageSize: 25,            // Default page size
      exportable: true,         // Enable export functionality
      
      // Custom styling
      zebra: true,             // Alternate row colors
      bordered: true,          // Add borders
      compact: false,          // Row spacing
      
      // Custom behaviors
      doubleClickAction: "edit", // Double-click behavior
      contextMenu: true,        // Right-click menu
      multiSelect: true,        // Allow row selection
      
      // Integration settings
      refreshInterval: 30000,   // Auto-refresh every 30 seconds
      virtualScrolling: true    // Enable virtual scrolling for large datasets
    }
  }
});
```

## Integration with Resource Views

Table layouts integrate seamlessly with Nubase resource operations:

```typescript
// In your resource configuration
const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withViews({
    search: {
      type: "resource-search",
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,  // Array schema with element having table layout
      onLoad: async ({ context }) => {
        return context.http.getTickets({ params: {} });
      }
    },
    view: { /* view view config */ },
    edit: { /* edit view config */ }
  });

// The ResourceSearchViewRenderer automatically:
// 1. Gets the element schema from the array schema
// 2. Looks for table layout ("default" or "table")
// 3. Renders columns based on TableLayoutField configuration
// 4. Applies pinning, widths, and link behaviors
// 5. Integrates with DataGrid component
```

### Resource Integration Example

```typescript
// Schema with table layout
const ticketBaseSchema = nu.object({
  id: nu.number(),
  title: nu.string(),
  status: nu.string(),
  priority: nu.string(),
  assignee: nu.string(),
  createdAt: nu.string()
}).withTableLayouts({
  default: {
    fields: [
      { name: "id", columnWidthPx: 80, pinned: true },
      { name: "title", columnWidthPx: 300, pinned: true },
      { name: "status", columnWidthPx: 120 },
      { name: "priority", columnWidthPx: 100 },
      { name: "assignee", columnWidthPx: 150 },
      { name: "createdAt", columnWidthPx: 140 }
    ],
    metadata: {
      linkFields: ["title"]
    }
  }
});

// Array schema for search results
const ticketArraySchema = nu.array(ticketBaseSchema);

// Resource with search view using the array schema
const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withViews({
    search: {
      type: "resource-search",
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,  // Uses ticketArraySchema
      onLoad: async ({ context }) => {
        return context.http.getTickets({ params: {} });
      }
    }
  });
```

## DataGrid Integration

Table layouts are rendered using the DataGrid component with automatic integration:

```typescript
// ResourceSearchViewRenderer creates DataGrid columns like this:
const columns = tableLayout.groups[0].fields
  .filter(field => !field.hidden)
  .map(field => ({
    name: field.name,
    key: field.name,
    width: field.columnWidthPx || getDefaultColumnWidth(fieldSchema),
    resizable: true,
    frozen: field.pinned === true,  // Uses pinned property
    renderCell: isLinkField ? 
      renderLinkCell :      // Clickable link
      renderDefaultCell     // Regular cell
  }));
```

### DataGrid Features

Table layouts automatically enable these DataGrid features:

- **Column Resizing** - All columns are resizable by default
- **Column Pinning** - Based on `pinned` property
- **Row Selection** - When delete operations are available
- **Link Navigation** - Based on `linkFields` metadata
- **Virtualization** - For large datasets
- **Keyboard Navigation** - Full keyboard support

## Column Sizing Guidelines

Recommended column widths for different field types:

```typescript
const columnSizingGuide = {
  // Identifiers
  id: 80,              // Short numeric IDs
  uuid: 120,           // UUIDs and long IDs
  
  // Text fields
  shortName: 150,      // First name, last name
  mediumName: 200,     // Full name, username
  longName: 250,       // Company name, product name
  email: 250,          // Email addresses
  url: 300,            // URLs
  
  // Descriptive text
  shortDescription: 200,  // Brief descriptions
  description: 300,       // Medium descriptions
  longDescription: 400,   // Detailed descriptions
  notes: 350,            // Comments and notes
  
  // Numbers
  smallNumber: 80,     // Quantities, counts
  price: 100,          // Prices, amounts
  percentage: 90,      // Percentages
  
  // Dates and times
  date: 100,           // Date only (MM/DD/YYYY)
  datetime: 140,       // Date and time
  timestamp: 160,      // Full timestamp
  
  // Status and categories
  status: 120,         // Status indicators
  category: 150,       // Category names
  priority: 100,       // Priority levels
  
  // Boolean fields
  boolean: 80,         // Checkboxes, toggles
  
  // Actions
  actions: 80,         // Action buttons (edit, delete)
};

// Example usage
const userTableLayout = {
  fields: [
    { name: "id", columnWidthPx: 80 },              // ID
    { name: "fullName", columnWidthPx: 200 },       // Medium name
    { name: "email", columnWidthPx: 250 },          // Email
    { name: "role", columnWidthPx: 150 },           // Category
    { name: "isActive", columnWidthPx: 80 },        // Boolean
    { name: "lastLogin", columnWidthPx: 140 },      // DateTime
    { name: "notes", columnWidthPx: 350 }           // Notes
  ]
};
```

## Performance Considerations

### Column Count

Limit visible columns for better performance:

```typescript
// ✅ Good: 6-8 columns for optimal performance
const optimizedLayout = {
  fields: [
    { name: "id", columnWidthPx: 80, pinned: true },
    { name: "name", columnWidthPx: 200, pinned: true },
    { name: "status", columnWidthPx: 120 },
    { name: "assignee", columnWidthPx: 150 },
    { name: "dueDate", columnWidthPx: 140 },
    { name: "priority", columnWidthPx: 100 }
  ]
};

// ❌ Avoid: Too many visible columns
const overloadedLayout = {
  fields: [
    // 15+ columns will impact scrolling performance
    { name: "field1", columnWidthPx: 100 },
    // ... many more fields
  ]
};
```

### Virtual Scrolling

Enable virtual scrolling for large datasets:

```typescript
const largeDatasetLayout = {
  fields: [...],
  metadata: {
    virtualScrolling: true,    // Enable for 1000+ rows
    pageSize: 50,             // Reasonable page size
    lazyLoading: true         // Load data as needed
  }
};
```

### Pinned Column Limits

Limit pinned columns to avoid layout issues:

```typescript
// ✅ Good: 1-3 pinned columns
const goodPinning = {
  fields: [
    { name: "id", columnWidthPx: 80, pinned: true },
    { name: "title", columnWidthPx: 200, pinned: true },
    // ... other scrollable columns
  ]
};

// ❌ Avoid: Too many pinned columns (>40% of table width)
```

## Common Patterns

### Master List View

```typescript
const masterListLayout = {
  fields: [
    { name: "id", columnWidthPx: 80, pinned: true },
    { name: "title", columnWidthPx: 250, pinned: true },
    { name: "status", columnWidthPx: 120 },
    { name: "owner", columnWidthPx: 150 },
    { name: "updatedAt", columnWidthPx: 140 },
    { name: "priority", columnWidthPx: 100 }
  ],
  metadata: {
    linkFields: ["title"],
    sortable: true,
    filterable: true
  }
};
```

### Audit Log View

```typescript
const auditLogLayout = {
  fields: [
    { name: "timestamp", columnWidthPx: 160, pinned: true },
    { name: "user", columnWidthPx: 150, pinned: true },
    { name: "action", columnWidthPx: 120 },
    { name: "resource", columnWidthPx: 150 },
    { name: "details", columnWidthPx: 300 },
    { name: "ipAddress", columnWidthPx: 120 }
  ],
  metadata: {
    linkFields: ["user", "resource"],
    readonly: true,
    exportable: true
  }
};
```

### Financial Data View

```typescript
const financialLayout = {
  fields: [
    { name: "date", columnWidthPx: 100, pinned: true },
    { name: "description", columnWidthPx: 200, pinned: true },
    { name: "category", columnWidthPx: 150 },
    { name: "amount", columnWidthPx: 100, className: "text-right" },
    { name: "balance", columnWidthPx: 100, className: "text-right font-bold" },
    { name: "reference", columnWidthPx: 120 }
  ],
  metadata: {
    linkFields: ["reference"],
    sortable: true,
    numericFields: ["amount", "balance"]
  }
};
```

## Migration from Legacy API

The old `withLayouts()` method supported table layouts but with more verbose syntax:

```typescript
// ❌ Old: Verbose table layout definition
const legacySchema = nu.object({ ... }).withLayouts({
  table: {
    type: "table",
    groups: [{
      fields: [
        { name: "id", columnWidthPx: 80 },
        { name: "title", columnWidthPx: 200 }
      ]
    }],
    metadata: {
      linkFields: ["title"]
    }
  }
});

// ✅ New: Simplified table layout API
const modernSchema = nu.object({ ... }).withTableLayouts({
  default: {
    fields: [
      { name: "id", columnWidthPx: 80 },
      { name: "title", columnWidthPx: 200 }
    ],
    metadata: {
      linkFields: ["title"]
    }
  }
});
```

## Best Practices

### Column Organization

```typescript
// ✅ Good: Logical column order
const logicalLayout = {
  fields: [
    // 1. Identifiers first (pinned)
    { name: "id", columnWidthPx: 80, pinned: true },
    { name: "name", columnWidthPx: 200, pinned: true },
    
    // 2. Primary data
    { name: "status", columnWidthPx: 120 },
    { name: "priority", columnWidthPx: 100 },
    
    // 3. Relationships
    { name: "assignee", columnWidthPx: 150 },
    { name: "project", columnWidthPx: 150 },
    
    // 4. Timestamps last
    { name: "createdAt", columnWidthPx: 140 },
    { name: "updatedAt", columnWidthPx: 140 }
  ]
};

// ❌ Avoid: Random column order
const randomLayout = {
  fields: [
    { name: "updatedAt", columnWidthPx: 140 },
    { name: "name", columnWidthPx: 200 },
    { name: "createdAt", columnWidthPx: 140 },
    { name: "id", columnWidthPx: 80 },
    { name: "status", columnWidthPx: 120 }
  ]
};
```

### Responsive Design

Consider different screen sizes when defining column widths:

```typescript
// Multiple layouts for different screen sizes
const responsiveSchema = nu.object({ ... }).withTableLayouts({
  mobile: {
    fields: [
      { name: "id", columnWidthPx: 60, pinned: true },
      { name: "title", columnWidthPx: 200, pinned: true },
      { name: "status", columnWidthPx: 80 }
    ]
  },
  desktop: {
    fields: [
      { name: "id", columnWidthPx: 80, pinned: true },
      { name: "title", columnWidthPx: 250, pinned: true },
      { name: "status", columnWidthPx: 120 },
      { name: "assignee", columnWidthPx: 150 },
      { name: "dueDate", columnWidthPx: 140 },
      { name: "priority", columnWidthPx: 100 }
    ]
  }
});
```

## Next Steps

- **Layout System**: Understand the overall [layout system](./layouts.md) concepts
- **Form Layouts**: Learn about [form layouts](./form-layouts.md) for input forms
- **Frontend Components**: See how to integrate with [frontend components](./frontend.md)
- **DataGrid**: Explore the underlying DataGrid component features in the Storybook documentation