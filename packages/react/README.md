# @nubase/react

React components and utilities for the nubase ecosystem.

## Installation

```bash
npm install @nubase/react @nubase/core
```

## Usage

```typescript
import { SchemaForm } from '@nubase/react';
import { nu, type Infer } from '@nubase/core';
import '@nubase/react/styles.css'; // Import base styles

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

## Styling

The package includes CSS files that you can import:

```typescript
// Base component styles
import '@nubase/react/styles.css';

// Theme styles (optional)
import '@nubase/react/theme.css';
```

## Components

### Form Components
- `SchemaForm` - Schema-driven form with automatic field rendering and validation
- `FormFieldRenderer` - Renders individual form fields based on schema type

### Form Controls  
- `FormControl` - Form field wrapper with label, validation, and error display
- `TextInput` - Text input with validation states and accessibility
- `Label` - Form labels with required field indicators

### Button System
- `Button` - Primary button component with 5 variants and 4 sizes
- `ButtonBar` - Button container with flexible alignment options

### Floating UI
- `Dialog` - Confirmation dialogs with promise-based API
- `Modal` - Multi-size modals with backdrop and stacking support  
- `Toast` - Toast notifications with 6 types including promise toasts

### Navigation
- `MainNav` - Hierarchical navigation with search and badges
- `NubaseApp` - Application shell with router integration

### Theming
- Material Design 3 theming system with 26 semantic color roles
- Runtime theme switching with CSS variables
- 4 built-in themes: Light, Dark, Light High Contrast, Dark High Contrast

## Storybook

This package includes Storybook stories for component development:

```bash
npm run storybook
```

## Peer Dependencies

- React 19+

## Contributing

Please see the main repository for contributing guidelines.

## License

MIT
