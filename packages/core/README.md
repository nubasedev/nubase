# @nubase/core

Core schema and types for the nubase ecosystem.

## Installation

```bash
npm install @nubase/core
```

## Usage

```typescript
import { BaseSchema, nu } from '@nubase/core';

// Example usage of base schema
const mySchema = new BaseSchema({
  fields: {
    name: { type: 'string', required: true },
    age: { type: 'number', required: false }
  }
});

// Example usage of nu types
const result = nu.string().parse('hello world');
```

## Features

- Type-safe schema definitions
- Zod-based validation
- TypeScript-first design
- Extensible base schema system

## API Reference

### BaseSchema

Base class for creating type-safe schemas with metadata.

### nu

Utility functions and types for schema validation.

## Contributing

Please see the main repository for contributing guidelines.

## License

MIT
