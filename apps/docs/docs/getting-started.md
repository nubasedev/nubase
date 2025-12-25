---
sidebar_position: 3
---

# Getting Started

This guide will help you get up and running with Nubase quickly. We'll create a simple application to demonstrate the core concepts.

## Installation

Install both the core schema system and frontend components:

```bash
npm install @nubase/core @nubase/frontend
```

## Core Concepts

Before diving into code, let's understand Nubase's key concepts:

### 1. Schema-First Development
Define your data structure using schemas, and Nubase generates the UI automatically.

### 2. Required by Default
Fields are required unless explicitly made optional with `.optional()` - this ensures type safety.

### 3. Configuration-Driven
Applications are configured rather than coded - define views, resources, and navigation declaratively.

## Quick Start: Simple Form

Let's create a basic user profile form:

```typescript
import React from 'react';
import { nu, type Infer } from '@nubase/core';
import { SchemaForm } from '@nubase/frontend';
import '@nubase/frontend/styles.css';

// 1. Define your schema
const userProfileSchema = nu.object({
  // Required fields (default behavior)
  firstName: nu.string().withMeta({
    label: "First Name",
    description: "Enter your first name"
  }),
  lastName: nu.string().withMeta({
    label: "Last Name", 
    description: "Enter your last name"
  }),
  email: nu.string().withMeta({
    label: "Email Address",
    description: "We'll never share your email"
  }),
  
  // Optional fields (explicitly marked)
  phone: nu.string().optional().withMeta({
    label: "Phone Number",
    description: "Optional contact number"
  }),
  bio: nu.string().optional().withMeta({
    label: "Bio",
    description: "Tell us about yourself"
  })
});

// 2. Extract TypeScript type
type UserProfile = Infer<typeof userProfileSchema>;

// 3. Create your component
function UserProfileForm() {
  const handleSubmit = (data: UserProfile) => {
    console.log('Form submitted:', data);
    // data is properly typed:
    // {
    //   firstName: string;    // Required
    //   lastName: string;     // Required  
    //   email: string;        // Required
    //   phone?: string;       // Optional
    //   bio?: string;         // Optional
    // }
  };

  return (
    <SchemaForm
      schema={userProfileSchema}
      onSubmit={handleSubmit}
      submitText="Save Profile"
    />
  );
}

export default UserProfileForm;
```

This creates a fully functional form with:
- ✅ Automatic field rendering based on schema types
- ✅ Required field validation (firstName, lastName, email)
- ✅ Visual indicators (* for required fields)  
- ✅ TypeScript type safety
- ✅ Accessible markup and keyboard navigation

## Adding Layouts

Organize your form with custom layouts:

```typescript
const userProfileSchema = nu.object({
  firstName: nu.string().withMeta({ label: "First Name" }),
  lastName: nu.string().withMeta({ label: "Last Name" }),
  email: nu.string().withMeta({ label: "Email" }),
  phone: nu.string().optional().withMeta({ label: "Phone" }),
  bio: nu.string().optional().withMeta({ label: "Bio" })
}).withLayouts({
  default: {
    type: "form",
    groups: [
      {
        label: "Personal Information",
        fields: [
          { name: "firstName", size: 6 },  // Half width
          { name: "lastName", size: 6 },   // Half width
          { name: "email", size: 12 },     // Full width
          { name: "phone", size: 12 }      // Full width
        ]
      },
      {
        label: "About You", 
        fields: [
          { name: "bio", size: 12 }        // Full width
        ]
      }
    ]
  }
});
```

## Adding Computed Metadata

Create dynamic form behavior based on user input:

```typescript
const productSchema = nu.object({
  name: nu.string().withMeta({ label: "Product Name" }),
  price: nu.number().withMeta({ label: "Price ($)" }),
  discount: nu.number().withMeta({ label: "Discount %" }),
  category: nu.string().withMeta({ label: "Category" })
}).withComputed({
  name: {
    // Dynamic label based on category
    label: async (data) => 
      data.category ? `${data.category} Product Name` : 'Product Name'
  },
  price: {
    // Dynamic description showing final price
    description: async (data) => {
      if (data.price && data.discount) {
        const finalPrice = data.price * (1 - data.discount / 100);
        return `Final price: $${finalPrice.toFixed(2)} (${data.discount}% off)`;
      }
      return 'Enter the product price';
    }
  }
});
```

## Building a Complete Application

For a full application, use the `NubaseApp` component:

```typescript
import { NubaseApp } from '@nubase/frontend';
import { createView } from '@nubase/frontend';

// 1. Define your views
const createUserView = createView({
  id: "create-user",
  schema: userProfileSchema,
  onSubmit: async (data) => {
    // Handle form submission
    console.log('Creating user:', data);
  }
});

// 2. Define your resources
const userResource = createResource("user")
  .withViews({
    create: createUserView,
    // Add more views: view, edit, list, etc.
  });

// 3. Configure your application
const appConfig = {
  appName: "My Application",
  
  // Main navigation menu
  mainMenu: [
    {
      id: "users",
      label: "Users", 
      icon: "IconUsers",
      children: [
        { 
          id: "create-user", 
          label: "Create User", 
          href: "/r/user/create" 
        }
      ]
    }
  ],
  
  // Views available in your app
  views: {
    [createUserView.id]: createUserView
  },
  
  // Resources (entities with CRUD operations)
  resources: {
    [userResource.id]: userResource
  },
  
  // API configuration
  apiBaseUrl: "http://localhost:3001",
  apiEndpoints: {
    // Define your API endpoints
  },
  
  // Theming
  themeIds: ["light", "dark", "lightHC", "darkHC"],
  defaultThemeId: "light"
};

// 4. Render your application
function App() {
  return <NubaseApp config={appConfig} />;
}

export default App;
```

This creates a complete application with:
- ✅ Automatic routing (`/r/user/create`)
- ✅ Navigation menu with icons
- ✅ Theme switching capability
- ✅ API client setup
- ✅ Modal and dialog systems
- ✅ Type-safe configuration

## Working with APIs

Connect your forms to backend APIs:

```typescript
// Define API endpoints
const apiEndpoints = {
  createUser: {
    method: 'POST' as const,
    path: '/api/users',
    requestSchema: userProfileSchema,
    responseSchema: nu.object({
      id: nu.number(),
      message: nu.string()
    })
  }
};

// Use in your view
const createUserView = createView({
  id: "create-user",
  schema: userProfileSchema,
  onSubmit: async (data, { apiClient }) => {
    try {
      const response = await apiClient.createUser(data);
      console.log('User created with ID:', response.id);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }
});
```

## Best Practices

### 1. Schema Organization

```typescript
// ✅ Good: Compose schemas from smaller pieces
const addressSchema = nu.object({
  street: nu.string().withMeta({ label: "Street" }),
  city: nu.string().withMeta({ label: "City" }),
  zip: nu.string().withMeta({ label: "ZIP Code" })
});

const userSchema = nu.object({
  name: nu.string().withMeta({ label: "Name" }),
  address: addressSchema  // Reuse address schema
});
```

### 2. Required vs Optional

```typescript
// ✅ Good: Be explicit about what's required
const schema = nu.object({
  // Required fields (default) - user must provide these
  name: nu.string(),
  email: nu.string(),
  
  // Optional fields - user can skip these
  phone: nu.string().optional(),
  newsletter: nu.boolean().optional()
});

// ❌ Avoid: Making everything optional without good reason
const badSchema = nu.object({
  name: nu.string().optional(),  // Should name be required?
  email: nu.string().optional()  // Should email be required?
});
```

### 3. Meaningful Metadata

```typescript
// ✅ Good: Provide helpful labels and descriptions
const schema = nu.object({
  email: nu.string().withMeta({
    label: "Email Address",
    description: "We'll use this to send you important updates"
  }),
  password: nu.string().withMeta({
    label: "Password", 
    description: "Must be at least 8 characters long"
  })
});
```

### 4. Layout Design

```typescript
// ✅ Good: Group related fields logically
const layout = {
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
        { name: "email", size: 12 },
        { name: "phone", size: 12 }
      ]
    }
  ]
};
```

## Next Steps

Now that you understand the basics:

1. **Explore the [Schema System](./schema.md)** - Learn about advanced schema features
2. **Study the [Layout System](./layouts.md)** - Master layout concepts, [Form Layouts](./form-layouts.md), and [Table Layouts](./table-layouts.md)  
3. **Read about [Frontend Components](./frontend.md)** - Discover all available UI components
4. **Check out [Computed Metadata](./computed-metadata.md)** - Create dynamic, reactive forms

## Common Patterns

### Settings Page

```typescript
const settingsSchema = nu.object({
  // Profile settings
  displayName: nu.string().withMeta({ label: "Display Name" }),
  bio: nu.string().optional().withMeta({ label: "Bio" }),
  
  // Preferences
  theme: nu.string().withMeta({ label: "Theme" }),
  notifications: nu.boolean().withMeta({ label: "Email Notifications" }),
  
  // Privacy
  publicProfile: nu.boolean().withMeta({ label: "Public Profile" })
}).withLayouts({
  tabbed: {
    type: "tabs",
    groups: [
      {
        label: "Profile",
        fields: [
          { name: "displayName", size: 12 },
          { name: "bio", size: 12 }
        ]
      },
      {
        label: "Preferences",
        fields: [
          { name: "theme", size: 6 },
          { name: "notifications", size: 6 }
        ]
      },
      {
        label: "Privacy",
        fields: [
          { name: "publicProfile", size: 12 }
        ]
      }
    ]
  }
});
```

### CRUD Resource

```typescript
const ticketSchema = nu.object({
  title: nu.string().withMeta({ label: "Title" }),
  description: nu.string().withMeta({ label: "Description" }),
  priority: nu.string().withMeta({ label: "Priority" }),
  status: nu.string().withMeta({ label: "Status" })
});

const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withViews({
    create: {
      type: "resource-create",
      id: "create-ticket",
      title: "Create Ticket",
      schemaPost: (api) => api.postTicket.requestBody,
      onSubmit: async ({ data, context }) => {
        return context.http.postTicket({ data });
      }
    },
    edit: {
      type: "resource-view",
      id: "edit-ticket",
      title: "Edit Ticket",
      schemaGet: (api) => api.getTicket.responseBody,
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
    }
  });
```

With these patterns, you can build sophisticated business applications rapidly while maintaining type safety and consistency.