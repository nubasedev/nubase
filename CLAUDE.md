# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `npm run build` - Build all packages using Turbo
- `npm run dev` - Start development mode for all packages 
- `npm run typecheck` - Run TypeScript type checking across all packages
- `npm run check-types` - Alias for typecheck

### Code Quality
- `npm run lint` - Run linting across all packages
- `npm run format-and-lint` - Run Biome formatting and linting
- `npm run format-and-lint:fix` - Run Biome with auto-fix

### Package-Specific Commands
- `cd packages/core && npm run test` - Run Vitest tests for core package
- `cd packages/react && npm run storybook` - Start Storybook development server
- `cd packages/react && npm run build:storybook` - Build Storybook for production

### Publishing
- `npm run publish:core` - Build and publish @nubase/core package
- `npm run publish:react` - Build and publish @nubase/react package  
- `npm run publish:all` - Publish both core and react packages

## Project Architecture

### Monorepo Structure
This is a Turborepo-based monorepo with the following structure:

**Core Packages:**
- `packages/core` - [@nubase/core] Core schema system with Zod-based validation, computed metadata, and layout definitions
- `packages/react` - [@nubase/react] React components, form controls, and hooks for building nubase applications

**Example Applications:**
- `apps/docs` - Docusaurus documentation site
- `example/frontend` - React frontend example using Vite
- `example/backend` - Node.js backend example
- `example/schema` - Shared schema definitions for example app

### Schema System Architecture

The core package implements a schema system with these key concepts:

1. **BaseSchema** - Abstract base class for all schemas with metadata support
2. **Primitive Schemas** - StringSchema, NumberSchema, BooleanSchema for basic types
3. **Complex Schemas** - ObjectSchema for object validation with computed metadata and layout support
4. **Layout System** - Flexible layout configurations (form, grid, tabs, accordion) with groups and fields
5. **Computed Metadata** - Async functions that compute metadata based on form data

### React Component Architecture

The React package provides:

1. **Form System** - SchemaForm component with TanStack Form integration
2. **Form Controls** - TextInput, Button, Label, FormControl components
3. **Hooks** - useComputedMetadata, useLayout for schema-driven UI
4. **Routing** - TanStack Router integration for navigation
5. **Styling** - Tailwind CSS with theme support

### Key Files to Understand

- `packages/core/src/schema/schema.ts` - Core schema definitions and types
- `packages/core/src/schema/nu.ts` - Schema builder utilities
- `packages/react/src/form/SchemaForm.tsx` - Main form component
- `packages/react/src/hooks/useComputedMetadata.ts` - Computed metadata hook
- `packages/react/src/hooks/useLayout.ts` - Layout management hook

## Development Notes

- Uses Biome for code formatting and linting (configured in biome.json)
- TypeScript configuration shared via @repo/typescript-config
- Tailwind CSS v4 for styling
- Storybook for component development
- Vitest for testing
- All packages are published to npm under @nubase scope

## Testing

- Core package: `cd packages/core && npm run test`
- Tests use Vitest framework
- Test files follow `.test.ts` naming convention