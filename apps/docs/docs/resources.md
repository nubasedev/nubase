# Resources

Resources are the core building blocks of Nubase applications. They define the views and operations available for your application entities (users, tickets, orders, etc.). This guide explains how to create and configure resources.

## What are Resources?

A resource represents an entity in your application and defines all the views users can interact with for that entity. For example, a "ticket" resource might have views for creating, viewing, editing, and searching tickets.

## Basic Resource Structure

Resources are defined using the `createResource` factory function:

```typescript
import { createResource, createViewFactory } from "@nubase/frontend";
import { apiEndpoints } from "your-schema";

// Create a factory pre-configured with your API endpoints
const viewFactory = createViewFactory(apiEndpoints);

export const ticketResource = createResource({
  id: "ticket",
  views: {
    create: createTicketView,
    view: viewTicketView,
    search: searchTicketsView,
    // Add more views as needed
  },
});
```

## Resource Properties

### `id` (required)
- **Type**: `string`
- **Purpose**: Unique identifier for the resource
- **Usage**: Used in URLs (`/r/{id}/{view}`) and configuration references

```typescript
const userResource = createResource({
  id: "user", // Will generate URLs like /r/user/create
  views: { /* ... */ }
});
```

### `views` (required)
- **Type**: `Record<string, View>`
- **Purpose**: Maps view names to view configurations
- **Usage**: Each key becomes a route segment in URLs

## View Types

Nubase provides three main view types through the view factory:

### Create Views (`createCreate`)

Used for creating new resource instances:

```typescript
create: viewFactory.createCreate({
  id: "create-ticket",
  title: "Create Ticket",
  schemaPost: (api) => api.postTicket.requestBody,
  breadcrumbs: [
    { label: "Tickets", to: "/r/ticket/search" },
    "Create Ticket",
  ],
  onSubmit: async ({ data, context }) => {
    return context.http.postTicket({ data });
  },
}),
```

**Key Properties:**
- `schemaPost`: Defines the form fields and validation for data to be posted
- `onSubmit`: Handler for form submission
- `breadcrumbs`: Navigation trail (optional)

### View Views (`createView`)

Used for viewing and editing existing resource instances:

```typescript
view: viewFactory.createView({
  id: "view-ticket",
  title: "View Ticket",
  schemaGet: (api) => api.getTicket.responseBody.omit("id"),
  schemaParams: (api) => api.getTicket.requestParams,
  breadcrumbs: ({ context, data }) => [
    { label: "Tickets", to: "/r/ticket/search" },
    {
      label: data?.title || `Ticket #${context.params?.id || "Unknown"}`,
    },
  ],
  onLoad: async ({ context }) => {
    return context.http.getTicket({
      params: { id: context.params.id },
    });
  },
  onPatch: async ({ data, context }) => {
    return context.http.patchTicket({
      params: { id: context.params.id },
      data: data,
    });
  },
}),
```

**Key Properties:**
- `schemaGet`: Defines the displayed/editable fields from server response
- `schemaParams`: URL parameters the view expects (e.g., `?id=123`)
- `onLoad`: Fetches the resource data
- `onPatch`: Handler for field updates (optional)
- `breadcrumbs`: Can be dynamic based on loaded data

### Search Views (`createSearch`)

Used for listing and searching resource instances:

```typescript
search: viewFactory.createSearch({
  id: "search-tickets",
  title: "Search Tickets",
  schemaGet: (api) => api.getTickets.responseBody,
  breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
  onLoad: async ({ context }) => {
    return context.http.getTickets({
      params: {},
    });
  },
  onDelete: async ({ data, context }) => {
    return context.http.deleteTicket({
      params: { id: data.id },
    });
  },
}),
```

**Key Properties:**
- `schemaGet`: Defines the structure of search results from server response
- `onLoad`: Fetches the list of resources
- `onDelete`: Handler for deleting items (optional)

## Complete Example

Here's a complete resource definition from the Nubase example application:

```typescript
import { createResource, createViewFactory } from "@nubase/frontend";
import { apiEndpoints } from "questlog-schema";

// Create a factory pre-configured with API endpoints
const viewFactory = createViewFactory(apiEndpoints);

export const ticketResource = createResource({
  id: "ticket",
  views: {
    create: viewFactory.createCreate({
      id: "create-ticket",
      title: "Create Ticket",
      schemaPost: (api) => api.postTicket.requestBody,
      breadcrumbs: [
        { label: "Tickets", to: "/r/ticket/search" },
        "Create Ticket",
      ],
      onSubmit: async ({ data, context }) => {
        return context.http.postTicket({ data });
      },
    }),
    
    view: viewFactory.createView({
      id: "view-ticket",
      title: "View Ticket",
      schemaGet: (api) => api.getTicket.responseBody.omit("id"),
      schemaParams: (api) => api.getTicket.requestParams,
      breadcrumbs: ({ context, data }) => [
        { label: "Tickets", to: "/r/ticket/search" },
        {
          label: data?.title || `Ticket #${context.params?.id || "Unknown"}`,
        },
      ],
      onLoad: async ({ context }) => {
        return context.http.getTicket({
          params: { id: context.params.id },
        });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchTicket({
          params: { id: context.params.id },
          data: data,
        });
      },
    }),
    
    search: viewFactory.createSearch({
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,
      breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
      onLoad: async ({ context }) => {
        return context.http.getTickets({
          params: {},
        });
      },
      onDelete: async ({ data, context }) => {
        return context.http.deleteTicket({
          params: { id: data.id },
        });
      },
    }),
  },
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

## Schema Integration

Resources leverage your API schema definitions for type safety and automatic form generation. The view factory uses these schemas to:

1. **Generate Forms**: Create forms with proper field types and validation
2. **Type Safety**: Ensure API calls match expected data structures  
3. **URL Parameter Coercion**: Automatically convert string URL parameters to typed values

## Advanced Features

### Dynamic Breadcrumbs

Breadcrumbs can be functions that receive context and data:

```typescript
breadcrumbs: ({ context, data }) => [
  { label: "Tickets", to: "/r/ticket/search" },
  {
    label: data?.title || `Ticket #${context.params?.id}`,
  },
],
```

### Custom View Names

You can use any string as a view key:

```typescript
views: {
  create: createTicketView,
  details: viewTicketView,      // Custom name
  browse: searchTicketsView,    // Custom name
  edit: editTicketView,         // Additional view
}
```

### Error Handling

All view handlers should return HTTP responses. The framework automatically handles errors and displays appropriate messages to users.

## Best Practices

1. **Consistent Naming**: Use descriptive, consistent names for resource IDs
2. **Schema Reuse**: Leverage your API schemas for type safety
3. **Breadcrumb Navigation**: Always provide breadcrumbs for better UX
4. **Error Handling**: Let handlers throw errors; the framework will catch them
5. **View Organization**: Group related views logically (create, view, edit, search)

## Next Steps

- Learn about [Schema System](./schema.md) for form customization and validation
- Explore [Form Layouts](./form-layouts.md) for customizing form presentation
- Check out [Frontend Components](./frontend.md) for component integration