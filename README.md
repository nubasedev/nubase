# Nubase

[![Build Status](https://github.com/nubasedev/nubase/workflows/CI/badge.svg)](https://github.com/nubasedev/nubase/actions)
[![Docs](https://img.shields.io/badge/docs-deployed-brightgreen?logo=vercel)](https://www.nubase.dev)
[![Storybook](https://img.shields.io/badge/storybook-deployed-brightgreen?logo=vercel)](https://storybook.nubase.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A highly-opinionated, batteries-included, meta-framework for building business applications and internal tools with TypeScript.

## What is Nubase?

Nubase is primarily a frontend framework for the web that focuses on applications centered around dashboards and CRUD operations (Create, Read, Update, Delete). Think of Nubase as an open-source alternative to platforms like Retool and Airtable, except that you have full control over the code and data.

### Perfect for:
- Business applications (CRM, ERP, Ticket Management)
- Internal tools (Admin panels, Data management systems)
- Dashboard-centric applications

## Why Nubase?

Every business application has common requirements:
- Authentication and authorization
- Dashboards
- Searching, filtering, viewing and editing data
- Configuration pages
- Theming

Nubase eliminates the need to reinvent these core components for each new project. By deliberately choosing low-flexibility in favor of exceptional gains in development speed, consistency, and out-of-the-box quality, Nubase is designed to excel at the 85% of common business application requirements.

## How it Works

Nubase is a schema-driven framework where you define your application as a collection of schemas and business logic. A selected Nubase runtime executes and renders the application for you. Instead of writing frontend code directly, you describe your application structure, and Nubase handles the rendering.

```tsx
<NubaseApplication config={config} />
```

## Architecture

This is a Turborepo-based monorepo with the following structure:

### Core Packages

- **[@nubase/core](./packages/core)** - Core schema system with Zod-based validation, computed metadata, and layout definitions
- **[@nubase/frontend](./packages/frontend)** - React components, form controls, and hooks for building nubase applications

### Example Applications

- **[apps/docs](./apps/docs)** - Docusaurus documentation site
- **[examples/internal/frontend](./examples/internal/frontend)** - React frontend example using Vite
- **[examples/internal/backend](./examples/internal/backend)** - Node.js backend example
- **[examples/internal/schema](./examples/internal/schema)** - Shared schema definitions for example app

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 10.9.2

### Installation

```bash
git clone https://github.com/your-org/nubase.git
cd nubase
npm install
```

### Development

```bash
# Start development mode for all packages
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
cd packages/core && npm run test
```

### Building

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:core
npm run build:frontend
```

## Key Features

### Schema System
- **Type-safe by default** - Fields are required unless explicitly made optional with `.optional()`
- **BaseSchema** - Abstract base class with `.optional()` method for type-safe optional fields  
- **Primitive Schemas** - StringSchema, NumberSchema, BooleanSchema for basic types
- **Complex Schemas** - ObjectSchema with proper TypeScript inference for required/optional fields
- **Schema Composition** - extend, omit, and partial operations with type safety
- **Layout System** - Flexible layout configurations (form, grid, tabs, accordion) with groups and fields
- **Computed Metadata** - Async functions that compute metadata based on form data
- **Zod Integration** - Convert schemas to Zod with `toZod()` function

### React Components
- **Form System** - SchemaForm component with TanStack Form integration
- **Form Controls** - TextInput, Button, Label, FormControl components
- **Hooks** - useComputedMetadata, useLayout for schema-driven UI
- **Routing** - TanStack Router integration for navigation
- **Styling** - Tailwind CSS v4 with theme support

## Tech Stack

- **TypeScript** - Static type checking
- **React 19** - UI framework
- **Zod** - Schema validation
- **TanStack Form** - Form management
- **TanStack Router** - Routing
- **TanStack Table** - Data tables
- **Tailwind CSS v4** - Styling
- **Biome** - Code formatting and linting
- **Vitest** - Testing
- **Storybook** - Component development
- **Turborepo** - Monorepo management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Commands

See [CLAUDE.md](./CLAUDE.md) for detailed development commands and project guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- 📚 [Documentation](./apps/docs)
- 🐛 [Issues](https://github.com/your-org/nubase/issues)
- 💬 [Discussions](https://github.com/your-org/nubase/discussions)