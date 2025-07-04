---
sidebar_position: 1
---

# Welcome to Nubase

Let's discover **Nubase in less than 5 minutes**.

## What is Nubase?

Nubase is a powerful framework for building applications with **type-safe schemas** and **computed metadata**. It provides a comprehensive solution for managing data structures, forms, and business logic in a declarative way.

## Key Features

- **Type-safe schemas**: Define your data structures with full TypeScript support
- **Computed metadata**: Automatically derive properties and validation rules
- **React integration**: Built-in React components for forms and data display
- **Flexible architecture**: Works with any backend or database

## Getting Started

Get started by **installing Nubase** in your project:

```bash
npm install @nubase/core @nubase/react
```

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 18.0 or above
- TypeScript for full type safety benefits
- React (if using the React components)

## Your First Schema

Create a simple schema to get started:

```typescript
import { defineSchema } from '@nubase/core';

const userSchema = defineSchema({
  name: 'User',
  fields: {
    id: { type: 'string', required: true },
    email: { type: 'email', required: true },
    name: { type: 'string', required: true },
    age: { type: 'number', min: 0, max: 150 },
    isActive: { type: 'boolean', default: true }
  }
});
```

## Next Steps

- Check out the [Resources](./resources) page for more examples
- Explore the tutorial sections to learn about advanced features
- Visit our [GitHub repository](https://github.com/your-org/nubase) for source code and examples

Ready to build something amazing with Nubase? Let's dive in!
