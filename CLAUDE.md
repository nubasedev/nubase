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

The React package provides a comprehensive component library organized into these categories:

#### Component Categories
1. **Button System** - Button (5 variants, 4 sizes), ButtonBar (flexible alignment)
2. **Form Controls** - FormControl (TanStack Form integration), TextInput (multiple types), Label (required indicators)
3. **Form System** - SchemaForm (schema-driven forms with computed metadata and layouts)
4. **Floating UI** - Dialog (confirmations), Modal (multi-size), Toast (6 types including promise toasts)
5. **Navigation** - MainNav (hierarchical navigation with search and badges)
6. **Application Shell** - NubaseApp (router integration and app bootstrap)

#### Design Patterns
- **Class Variance Authority (CVA)** - Type-safe variant-based styling across all components
- **Compound Components** - FormControl enhances child form elements with labels, hints, and error states
- **Hook-based APIs** - Custom hooks (useDialog, useModal, useToast) for programmatic control
- **Provider Pattern** - Context-based state management for floating UI components
- **Schema Integration** - Automatic form generation from @nubase/core ObjectSchema definitions

#### Key Features
- **Type Safety** - Full TypeScript support with generics preserving schema types
- **Accessibility** - ARIA attributes, screen reader support, keyboard navigation, focus management
- **Theme Support** - Dark mode via data-theme attributes, consistent design tokens
- **Performance** - Debounced form updates (200ms), memoized filtering, efficient re-rendering
- **Storybook Integration** - Comprehensive documentation with interactive examples and variant showcases

### Key Files to Understand

#### Core Package
- `packages/core/src/schema/schema.ts` - Core schema definitions and types
- `packages/core/src/schema/nu.ts` - Schema builder utilities

#### React Package - Components
- `packages/react/src/components/form/SchemaForm.tsx` - Main schema-driven form component
- `packages/react/src/components/form-controls/FormControl/` - Form control wrapper with validation
- `packages/react/src/components/buttons/Button/` - Primary button component with CVA variants
- `packages/react/src/components/floating/dialog/` - Confirmation dialog system
- `packages/react/src/components/floating/modal/` - Modal system with backdrop and stacking
- `packages/react/src/components/floating/toast/` - Toast notification system
- `packages/react/src/components/main-nav/` - Hierarchical navigation component
- `packages/react/src/components/nubase-app/` - Application shell and router integration

#### React Package - Hooks & Utilities
- `packages/react/src/hooks/useComputedMetadata.ts` - Computed metadata hook with debouncing
- `packages/react/src/hooks/useLayout.ts` - Layout management hook for schema forms
- `packages/react/src/hooks/useDialog.ts` - Programmatic dialog control
- `packages/react/src/hooks/useModal.ts` - Programmatic modal control
- `packages/react/src/hooks/useToast.ts` - Toast notification management

## Development Notes

- Uses Biome for code formatting and linting (configured in biome.json)
- Tailwind CSS v4 for styling (classes defined in packages/react/src/theme/theme.css)
- Icons from https://tabler.io/icons (SVG icons inline in components)
- Storybook for component development
- Vitest for testing
- All packages are published to npm under @nubase scope

## Testing

- Core package: `cd packages/core && npm run test`
- Tests use Vitest framework
- Test files follow `.test.ts` naming convention