# Resources

Resources are the core building blocks of Nubase applications. They define the views, actions, and operations available for your application entities (users, tickets, orders, etc.). This guide explains how to create and configure resources using the chained builder API.

## What are Resources?

A resource represents an entity in your application and defines all the views and actions users can interact with for that entity. For example, a "ticket" resource might have views for creating, viewing, editing, and searching tickets, along with actions like delete or archive.

## Chained Builder API

Resources are defined using the `createResource` chained builder pattern, which provides excellent type safety through sequential type inference:

```typescript
import { createResource, showToast } from "@nubase/frontend";
import { TrashIcon } from "lucide-react";
import { apiEndpoints } from "your-schema";

export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive",
      onExecute: async ({ selectedIds, context }) => {
        // Full type safety on context.http based on apiEndpoints
        await Promise.all(
          selectedIds.map((id) =>
            context.http.deleteTicket({ params: { id: Number(id) } })
          )
        );
        showToast("Tickets deleted successfully", "success");
      }
    }
  })
  .withViews({
    create: {
      type: "resource-create",
      id: "create-ticket",
      title: "Create Ticket",
      schemaPost: (api) => api.postTicket.requestBody,
      breadcrumbs: [
        { label: "Tickets", to: "/r/ticket/search" },
        "Create Ticket"
      ],
      onSubmit: async ({ data, context }) => {
        return context.http.postTicket({ data });
      }
    },
    view: {
      type: "resource-view",
      id: "view-ticket",
      title: "View Ticket",
      schemaGet: (api) => api.getTicket.responseBody.omit("id"),
      schemaParams: (api) => api.getTicket.requestParams,
      onLoad: async ({ context }) => {
        return context.http.getTicket({ params: { id: context.params.id } });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchTicket({
          params: { id: context.params.id },
          data
        });
      }
    },
    search: {
      type: "resource-search",
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,
      tableActions: ["delete"],  // References action keys from withActions()
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getTickets({ params: {} });
      }
    }
  });
```

## Builder Methods

### 1. `createResource(id: string)`

Creates a new resource builder with the specified resource ID.

```typescript
const ticketResource = createResource("ticket");
```

**Properties:**
- `id`: Unique identifier used in URLs (`/r/{id}/{view}`) and configuration

### 2. `.withApiEndpoints(endpoints)`

Configures API endpoints for type-safe HTTP client access in actions and views.

```typescript
import { apiEndpoints } from "example-schema";

createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  // Now context.http is fully typed with apiEndpoints
```

**Why this matters:**
- Enables full TypeScript autocomplete for `context.http` methods
- Ensures API calls match your schema definitions
- Provides compile-time safety for request/response types

### 3. `.withActions(actions)`

Defines reusable actions that can be referenced in view configurations.

```typescript
.withActions({
  delete: {
    label: "Delete",
    icon: TrashIcon,
    variant: "destructive",
    onExecute: async ({ selectedIds, context }) => {
      // context.http is typed based on apiEndpoints from previous step
      await context.http.deleteTicket({ params: { id: selectedIds[0] } });
    }
  },
  archive: {
    label: "Archive",
    icon: ArchiveIcon,
    variant: "default",
    onExecute: async ({ selectedIds, context }) => {
      await context.http.archiveTickets({ ids: selectedIds });
    }
  }
})
```

**Action Properties:**
- `label`: Display text for the action button
- `icon`: Optional React component for the icon
- `variant`: Button style (`"default"` or `"destructive"`)
- `onExecute`: Handler function with access to selected IDs and context

### 4. `.withViews(views)`

Defines the views available for this resource. Views can reference action keys from the previous step.

```typescript
.withViews({
  create: { /* create view config */ },
  view: { /* view view config */ },
  search: {
    /* search view config */
    tableActions: ["delete", "archive"],  // Type-safe action references
    rowActions: ["delete"]
  }
})
```

## View Types

### Create Views (`type: "resource-create"`)

Used for creating new resource instances:

```typescript
create: {
  type: "resource-create",
  id: "create-ticket",
  title: "Create Ticket",
  schemaPost: (api) => api.postTicket.requestBody,
  breadcrumbs: [
    { label: "Tickets", to: "/r/ticket/search" },
    "Create Ticket"
  ],
  onSubmit: async ({ data, context }) => {
    return context.http.postTicket({ data });
  }
}
```

**Key Properties:**
- `type`: Must be `"resource-create"`
- `schemaPost`: Function receiving API endpoints, returns schema for form data
- `onSubmit`: Handler for form submission
- `breadcrumbs`: Navigation trail (optional)

### View Views (`type: "resource-view"`)

Used for viewing and editing existing resource instances:

```typescript
view: {
  type: "resource-view",
  id: "view-ticket",
  title: "View Ticket",
  schemaGet: (api) => api.getTicket.responseBody.omit("id"),
  schemaParams: (api) => api.getTicket.requestParams,
  breadcrumbs: ({ context, data }) => [
    { label: "Tickets", to: "/r/ticket/search" },
    { label: data?.title || `Ticket #${context.params?.id}` }
  ],
  onLoad: async ({ context }) => {
    return context.http.getTicket({ params: { id: context.params.id } });
  },
  onPatch: async ({ data, context }) => {
    return context.http.patchTicket({
      params: { id: context.params.id },
      data
    });
  }
}
```

**Key Properties:**
- `type`: Must be `"resource-view"`
- `schemaGet`: Defines displayed/editable fields
- `schemaParams`: URL parameters the view expects
- `onLoad`: Fetches the resource data
- `onPatch`: Handler for field updates
- `breadcrumbs`: Can be dynamic based on loaded data

### Search Views (`type: "resource-search"`)

Used for listing and searching resource instances:

```typescript
search: {
  type: "resource-search",
  id: "search-tickets",
  title: "Search Tickets",
  schemaGet: (api) => api.getTickets.responseBody,
  breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
  tableActions: ["delete"],  // Bulk actions for selected rows
  rowActions: ["delete"],     // Actions available per row
  onLoad: async ({ context }) => {
    return context.http.getTickets({ params: {} });
  }
}
```

**Key Properties:**
- `type`: Must be `"resource-search"`
- `schemaGet`: Defines the structure of search results (must be ArraySchema)
- `tableActions`: Actions available for bulk operations on selected rows
- `rowActions`: Actions available in dropdown menu for each row
- `onLoad`: Fetches the list of resources

## Complete Example

Here's a complete resource definition from the Nubase example application:

```typescript
import { createResource, showToast } from "@nubase/frontend";
import { TrashIcon } from "lucide-react";
import { apiEndpoints } from "example-schema";

export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive",
      onExecute: async ({ selectedIds, context }) => {
        if (!selectedIds || selectedIds.length === 0) {
          showToast("No tickets selected for deletion", "error");
          return;
        }

        const ticketCount = selectedIds.length;
        const ticketLabel = ticketCount === 1 ? "ticket" : "tickets";

        // Show confirmation dialog
        const confirmed = await new Promise<boolean>((resolve) => {
          context.dialog.openDialog({
            title: "Delete Tickets",
            content: `Are you sure you want to delete ${ticketCount} ${ticketLabel}?`,
            confirmText: "Delete",
            confirmVariant: "destructive",
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });

        if (!confirmed) return;

        try {
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteTicket({ params: { id: Number(id) } })
            )
          );
          showToast(`${ticketCount} ${ticketLabel} deleted successfully`, "success");
        } catch (error) {
          showToast(`Failed to delete ${ticketLabel}`, "error");
        }
      }
    }
  })
  .withViews({
    create: {
      type: "resource-create",
      id: "create-ticket",
      title: "Create Ticket",
      schemaPost: (api) => api.postTicket.requestBody,
      breadcrumbs: [
        { label: "Tickets", to: "/r/ticket/search" },
        "Create Ticket"
      ],
      onSubmit: async ({ data, context }) => {
        return context.http.postTicket({ data });
      }
    },

    view: {
      type: "resource-view",
      id: "view-ticket",
      title: "View Ticket",
      schemaGet: (api) => api.getTicket.responseBody.omit("id"),
      schemaParams: (api) => api.getTicket.requestParams,
      breadcrumbs: ({ context, data }) => [
        { label: "Tickets", to: "/r/ticket/search" },
        { label: data?.title || `Ticket #${context.params?.id || "Unknown"}` }
      ],
      onLoad: async ({ context }) => {
        return context.http.getTicket({ params: { id: context.params.id } });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchTicket({
          params: { id: context.params.id },
          data
        });
      }
    },

    search: {
      type: "resource-search",
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,
      breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
      tableActions: ["delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getTickets({ params: {} });
      }
    }
  });
```

## Registering Resources

Once you've defined your resource, register it in your application configuration:

```typescript
// In your config file
import { ticketResource } from "./resources/ticket";

export const config: NubaseFrontendConfig = {
  appName: "My Application",
  resources: {
    [ticketResource.id]: ticketResource, // Key must match resource.id
  },
  // ... other config
};
```

## URL Routing

Resources automatically generate URL routes based on their configuration:

- Create view: `/r/ticket/create`
- View view: `/r/ticket/view?id=123`
- Search view: `/r/ticket/search`

The pattern is always `/r/{resourceId}/{viewId}` with optional query parameters.

## Type Safety Benefits

The chained builder API provides excellent type safety through sequential inference:

### 1. API Endpoint Types Flow Through
```typescript
createResource("ticket")
  .withApiEndpoints(apiEndpoints)  // ← TApiEndpoints captured here
  .withActions({
    delete: {
      onExecute: async ({ context }) => {
        // context.http is fully typed with apiEndpoints ✓
        await context.http.deleteTicket({ params: { id: 1 } });
      }
    }
  })
```

### 2. Action Keys Are Type-Safe
```typescript
  .withActions({
    delete: { /* ... */ },
    archive: { /* ... */ }
  })
  .withViews({
    search: {
      tableActions: ["delete", "archive"],  // ✓ Autocomplete works
      tableActions: ["invalid"],            // ✗ Type error
    }
  })
```

### 3. Schema Functions Receive Typed API
```typescript
  .withViews({
    create: {
      // api parameter is fully typed from withApiEndpoints()
      schemaPost: (api) => api.postTicket.requestBody,  // ✓ Autocomplete
      schemaParams: (api) => api.getTicket.requestParams // ✓ Type-safe
    }
  })
```

## Advanced Features

### Dynamic Breadcrumbs

Breadcrumbs can be functions that receive context and data:

```typescript
breadcrumbs: ({ context, data }) => [
  { label: "Tickets", to: "/r/ticket/search" },
  { label: data?.title || `Ticket #${context.params?.id}` }
]
```

### Custom View Names

You can use any string as a view key:

```typescript
.withViews({
  create: createTicketView,
  details: viewTicketView,      // Custom name
  browse: searchTicketsView,    // Custom name
  edit: editTicketView          // Additional view
})
```

### Conditional Actions

Actions can be conditionally enabled based on permissions:

```typescript
.withActions({
  delete: {
    label: "Delete",
    disabled: !userHasPermission("tickets.delete"),
    onExecute: async ({ selectedIds, context }) => {
      // ...
    }
  }
})
```

### Error Handling

All view handlers should return HTTP responses. The framework automatically handles errors and displays appropriate messages to users.

## Resources Without Actions

If your resource doesn't need actions, you can skip the `.withActions()` step:

```typescript
const simpleResource = createResource("note")
  .withApiEndpoints(apiEndpoints)
  .withViews({
    create: { /* ... */ },
    view: { /* ... */ }
  });
```

## Best Practices

1. **Use the Chained Builder** - Always use the chained API for better type inference
2. **Define Actions First** - Actions should be defined before views that reference them
3. **Type-Safe API Endpoints** - Always provide typed API endpoints via `.withApiEndpoints()`
4. **Consistent Naming** - Use descriptive, consistent names for resource IDs
5. **Breadcrumb Navigation** - Always provide breadcrumbs for better UX
6. **Error Handling** - Let handlers throw errors; the framework will catch them
7. **View Organization** - Group related views logically (create, view, edit, search)

## Migration from Old API

If you're migrating from the old object-based API:

```typescript
// ❌ Old API (no longer supported)
const oldResource = createResource({
  id: "ticket",
  apiEndpoints,
  actions: { /* ... */ },
  views: { /* ... */ }
});

// ✅ New Chained API
const newResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({ /* ... */ })
  .withViews({ /* ... */ });
```

## Next Steps

- Learn about [Schema System](./schema.md) for form customization and validation
- Explore [Form Layouts](./form-layouts.md) for customizing form presentation
- Check out [Table Layouts](./table-layouts.md) for configuring search view tables
- Review [Frontend Components](./frontend.md) for component integration
