---
sidebar_position: 5
---

# Frontend Components

The `@nubase/frontend` package provides React components and utilities for building Nubase applications. It includes a comprehensive component library with form controls, navigation, theming, and application shell components.

## Installation

```bash
npm install @nubase/frontend @nubase/core
```

## Basic Usage

```typescript
import { SchemaForm } from '@nubase/frontend';
import { nu, type Infer } from '@nubase/core';
import '@nubase/frontend/styles.css'; // Import base styles

// Define your schema - fields are required by default
const userSchema = nu.object({
  name: nu.string().withMeta({
    label: "Full Name",
    description: "Enter your complete name"
  }),
  email: nu.string().withMeta({
    label: "Email Address", 
    description: "We'll send you updates here"
  }),
  phone: nu.string().optional().withMeta({
    label: "Phone Number",
    description: "Optional contact number"
  })
});

type UserData = Infer<typeof userSchema>;

function MyComponent() {
  const handleSubmit = (data: UserData) => {
    console.log('Form data:', data);
    // data is properly typed with required/optional fields
  };

  return (
    <SchemaForm 
      schema={userSchema}
      onSubmit={handleSubmit}
      submitText="Create Account"
    />
  );
}
```

## Form System

### SchemaForm Component

The `SchemaForm` component automatically generates forms from schema definitions:

**Features:**
- Automatic field type detection and rendering
- Built-in validation with error display
- Required field indicators (asterisks)
- Computed metadata support with debouncing
- Layout system integration
- Accessibility features

**Props:**
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

### Required vs Optional Fields

The `SchemaForm` component automatically:
- Shows **asterisks (*)** for required fields  
- Validates required fields on submit
- Allows optional fields to be left empty

```typescript
const contactSchema = nu.object({
  name: nu.string(),              // Required - shows *
  email: nu.string(),             // Required - shows *
  phone: nu.string().optional(),  // Optional - no *
  notes: nu.string().optional(),  // Optional - no *
});
```

## Form Controls

### FormControl

Form field wrapper that enhances child form elements with labels, validation, and error display:

```typescript
<FormControl
  label="Email Address"
  description="We'll never share your email"
  error="Please enter a valid email"
  required={true}
>
  <TextInput type="email" />
</FormControl>
```

### TextInput

Text input component with multiple types and validation states:

```typescript
<TextInput
  type="text" // "text" | "email" | "password" | "number" | "tel" | "url"
  placeholder="Enter text..."
  hasError={false}
  disabled={false}
/>
```

### Label

Form labels with required field indicators:

```typescript
<Label htmlFor="email" required>
  Email Address
</Label>
```

## Button System

### Button Component

Primary button component with 5 variants and 4 sizes:

**Variants:**
- `primary` - Main action button (blue)
- `secondary` - Secondary action (gray)
- `success` - Positive action (green)
- `danger` - Destructive action (red)
- `ghost` - Minimal button (transparent)

**Sizes:**
- `sm` - Small button
- `md` - Medium button (default)
- `lg` - Large button
- `xl` - Extra large button

```typescript
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>
```

### ButtonBar

Container for organizing multiple buttons with flexible alignment:

```typescript
<ButtonBar align="right" gap="md">
  <Button variant="ghost">Cancel</Button>
  <Button variant="primary">Save</Button>
</ButtonBar>
```

## Floating UI System

### Dialog

Confirmation dialogs with promise-based API:

```typescript
import { useDialog } from '@nubase/frontend';

function MyComponent() {
  const { showDialog } = useDialog();
  
  const handleDelete = async () => {
    const confirmed = await showDialog({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      type: "danger"
    });
    
    if (confirmed) {
      // Delete the item
    }
  };
}
```

### Modal

Multi-size modals with backdrop and stacking support:

```typescript
import { useModal } from '@nubase/frontend';

function MyComponent() {
  const { openModal } = useModal();
  
  const handleOpenModal = () => {
    openModal({
      title: "Edit Profile",
      content: <ProfileForm />,
      size: "lg" // "sm" | "md" | "lg" | "xl"
    });
  };
}
```

### Toast Notifications

Toast notifications with 6 types including promise toasts:

```typescript
import { showToast } from '@nubase/frontend';

// Basic usage
showToast("Operation completed successfully!", "success");
showToast("Something went wrong", "error");
showToast("Processing...", "info");

// Promise toast - automatically updates based on promise result
showToast(
  asyncOperation(),
  {
    loading: "Saving...",
    success: "Saved successfully!",
    error: "Failed to save"
  }
);
```

**Toast Types:**
- `success` - Green checkmark
- `error` - Red error icon
- `info` - Blue info icon
- `warning` - Yellow warning icon
- `loading` - Spinning loader
- `default` - No icon

## Navigation

### MainNav

Hierarchical navigation component with search and badges:

```typescript
const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "IconHome",
    href: "/dashboard"
  },
  {
    id: "users",
    label: "Users",
    icon: "IconUsers",
    badge: "12",
    children: [
      { id: "all-users", label: "All Users", href: "/users" },
      { id: "add-user", label: "Add User", href: "/users/new" }
    ]
  }
];

<MainNav items={navigationItems} />
```

### NubaseApp

Application shell component that provides:
- Complete routing infrastructure using TanStack Router
- Type-safe API client for backend communication  
- Fully functional navigation with hierarchical menu support
- Theme switching UI and runtime CSS variable injection
- Modal and dialog management systems

```typescript
import { NubaseApp } from '@nubase/frontend';

const config = {
  appName: "My App",
  mainMenu: navigationItems,
  views: { /* view configurations */ },
  resources: { /* resource configurations */ },
  apiEndpoints: { /* API endpoint definitions */ },
  apiBaseUrl: "http://localhost:3001",
  themeIds: ["light", "dark", "lightHC", "darkHC"],
  defaultThemeId: "light"
};

function App() {
  return <NubaseApp config={config} />;
}
```

## Theming System

### Material Design 3 Implementation

The theming system implements Google's Material Design 3 color specification with 26 semantic color roles:

**Primary Colors (4)**
- `primary` - Main brand color for prominent actions
- `onPrimary` - Text/icons on primary surfaces
- `primaryContainer` - Emphasized containers and badges
- `onPrimaryContainer` - Text/icons on primary containers

**Secondary Colors (4)**
- `secondary` - Supporting brand color for less prominent actions
- `onSecondary` - Text/icons on secondary surfaces
- `secondaryContainer` - Secondary buttons and containers
- `onSecondaryContainer` - Text/icons on secondary containers

**Surface Colors (4)**
- `surface` - Default background surfaces
- `onSurface` - Primary text color
- `surfaceVariant` - Subtle background variations
- `onSurfaceVariant` - Secondary text and placeholders

**Error Colors (4)**
- `error` - Error states and destructive actions
- `onError` - Text/icons on error surfaces
- `errorContainer` - Error containers and alerts
- `onErrorContainer` - Text/icons on error containers

### Available Themes

1. **Light Theme** - Standard Material Design 3 light color scheme
2. **Dark Theme** - Standard Material Design 3 dark color scheme  
3. **Dark High Contrast Theme** - High contrast dark theme for accessibility
4. **Light High Contrast Theme** - High contrast light theme for accessibility

### Runtime Theme Switching

```typescript
import { ThemeToggle } from '@nubase/frontend';

// Theme toggle component
<ThemeToggle />

// Programmatic theme switching
const { setTheme } = useTheme();
setTheme("dark");
```

### CSS Classes

All MD3 colors are available as Tailwind classes:
- **Backgrounds**: `bg-primary`, `bg-surface`, `bg-errorContainer`
- **Text**: `text-onPrimary`, `text-onSurface`, `text-error`
- **Borders**: `border-outline`, `border-primary`, `border-error`
- **Utilities**: `ring-primary/20`, `bg-scrim/30`

## Styling

Import the required CSS files:

```typescript
// Base component styles (required)
import '@nubase/frontend/styles.css';

// Theme styles (recommended)
import '@nubase/frontend/theme.css';
```

## Accessibility Features

All components include comprehensive accessibility support:
- **ARIA attributes** for screen readers
- **Keyboard navigation** support
- **Focus management** for modals and dialogs
- **Screen reader announcements** for dynamic content
- **High contrast themes** for visual accessibility
- **Semantic HTML** structure

## Storybook Development

This package includes comprehensive Storybook stories for component development:

```bash
cd packages/frontend
npm run storybook
```

**Story Features:**
- Interactive component examples
- Variant showcases
- Accessibility testing
- Dark mode preview
- Component documentation

## Best Practices

### Form Development

```typescript
// ✅ Good: Use schema-driven forms
const schema = nu.object({
  name: nu.string().withMeta({ label: "Name" }),
  email: nu.string().withMeta({ label: "Email" })
});

<SchemaForm schema={schema} onSubmit={handleSubmit} />

// ✅ Good: Handle required/optional correctly
const userSchema = nu.object({
  name: nu.string(),              // Required
  nickname: nu.string().optional() // Optional
});
```

### Theme Usage

```typescript
// ✅ Good: Use semantic color classes
<Button variant="primary">Primary Action</Button>
<div className="bg-surface text-onSurface">Content</div>

// ❌ Avoid: Hard-coded colors
<div style={{ backgroundColor: "#blue" }}>Content</div>
```

### Component Composition

```typescript
// ✅ Good: Use compound components
<FormControl label="Email" error={emailError}>
  <TextInput type="email" />
</FormControl>

// ✅ Good: Use hooks for programmatic control
const { showDialog } = useDialog();
const { openModal } = useModal();
```

## Integration with Core Package

The frontend package is designed to work seamlessly with `@nubase/core`:

```typescript
import { nu, type Infer } from '@nubase/core';
import { SchemaForm } from '@nubase/frontend';

// Schema drives the form automatically
const schema = nu.object({
  field1: nu.string().withMeta({ label: "Field 1" }),
  field2: nu.number().optional().withMeta({ label: "Field 2" })
});

// Type safety throughout
type FormData = Infer<typeof schema>;
const handleSubmit = (data: FormData) => {
  // data is properly typed with required/optional fields
};

<SchemaForm schema={schema} onSubmit={handleSubmit} />
```

This comprehensive frontend system enables rapid development of consistent, accessible, and well-designed business applications with minimal custom code.