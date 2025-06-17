# @nubase/react

React components and utilities for the nubase ecosystem.

## Installation

```bash
npm install @nubase/react @nubase/core
```

## Usage

```typescript
import { SchemaForm, Button, TextInput } from '@nubase/react';
import '@nubase/react/styles.css'; // Import base styles

// Example usage
function MyComponent() {
  return (
    <SchemaForm onSubmit={handleSubmit}>
      <TextInput name="username" label="Username" />
      <Button type="submit">Submit</Button>
    </SchemaForm>
  );
}
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
- `SchemaForm` - Form component with schema validation
- `FormExample` - Example form implementation

### Form Controls
- `Button` - Customizable button component
- `TextInput` - Text input with validation
- `FormControl` - Base form control wrapper
- `Label` - Form label component

### Table Components
- Table utilities for displaying data

### Utilities
- Type utilities and helper functions

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
