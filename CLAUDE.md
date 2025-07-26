# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build, Development and Code quality
- `npm run build` - Build all packages using Turbo
- `npm run dev` - Start development mode for all packages 
- `npm run typecheck` - Run TypeScript type checking across all packages
- `npm run lint` - Run linting across all packages

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
- **Material Design 3 Theming** - Complete MD3 color system with 26 semantic color roles, runtime theme switching
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

#### React Package - Theming System
- `packages/react/src/theming/theme.ts` - Material Design 3 theme interface and color type definitions
- `packages/react/src/theming/themes/light/lightTheme.ts` - Standard MD3 light theme
- `packages/react/src/theming/themes/dark/darkTheme.ts` - Standard MD3 dark theme
- `packages/react/src/theming/themes/darkhc/darkHighContrastTheme.ts` - Dark high contrast MD3 theme
- `packages/react/src/theming/themes/lighthc/lightHighContrastTheme.ts` - Light high contrast MD3 theme
- `packages/react/src/theming/runtime-theme-generator.ts` - Runtime CSS variable generation and theme switching
- `packages/react/src/theme/theme.css` - Tailwind v4 theme configuration with MD3 color mappings

## Theming System

### Material Design 3 Implementation

The theming system implements Google's Material Design 3 color specification with 26 semantic color roles. This provides consistent, accessible color usage across all components.

#### Theme Structure

Each theme (`NubaseTheme`) contains:
- `id`: Unique theme identifier
- `name`: Display name for the theme
- `type`: Either "light" or "dark" for system preference matching
- `colors`: 26 Material Design 3 color roles

#### Color Roles

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

**Tertiary Colors (4)**
- `tertiary` - Accent color for balance and contrast
- `onTertiary` - Text/icons on tertiary surfaces
- `tertiaryContainer` - Tertiary containers and highlights
- `onTertiaryContainer` - Text/icons on tertiary containers

**Error Colors (4)**
- `error` - Error states and destructive actions
- `onError` - Text/icons on error surfaces
- `errorContainer` - Error containers and alerts
- `onErrorContainer` - Text/icons on error containers

**Surface Colors (4)**
- `surface` - Default background surfaces
- `onSurface` - Primary text color
- `surfaceVariant` - Subtle background variations
- `onSurfaceVariant` - Secondary text and placeholders

**Other Colors (6)**
- `outline` - Borders and dividers
- `outlineVariant` - Subtle borders
- `shadow` - Drop shadows
- `scrim` - Modal backdrops
- `inverseSurface` - High contrast surfaces
- `onInverseSurface` - Text on inverse surfaces

#### Available Themes

1. **Light Theme** (`lightTheme`) - Standard Material Design 3 light color scheme
2. **Dark Theme** (`darkTheme`) - Standard Material Design 3 dark color scheme  
3. **Dark High Contrast Theme** (`darkHighContrastTheme`) - High contrast dark theme for accessibility
4. **Light High Contrast Theme** (`lightHighContrastTheme`) - High contrast light theme for accessibility

#### Runtime Theme System

**CSS Variable Generation**
- Themes are converted to CSS variables at runtime via `runtime-theme-generator.ts`
- Pattern: theme color `primary` becomes `--theme-color-primary`
- Automatically injected into document head when themes change

**Tailwind Integration**
- `packages/react/src/theme/theme.css` maps MD3 colors to Tailwind classes
- Pattern: `--color-primary: var(--theme-color-primary)`
- Enables classes like `bg-primary`, `text-onPrimary`, `border-outline`

**Usage in Components**
```tsx
// Semantic color usage following MD3 guidelines
<Button variant="primary">        // bg-primary text-onPrimary
<Button variant="secondary">      // bg-secondaryContainer text-onSecondaryContainer
<Button variant="danger">         // bg-error text-onError

<TextInput />                     // bg-surface text-onSurface border-outline
<TextInput hasError />            // border-error focus:ring-error/10

<Dialog title="...">              // border-outline text-onSurface
<Modal>                           // bg-surface ring-outline/20
```

**Theme Switching**
- Themes can be switched at runtime via the theme context
- Component styles automatically update through CSS variable changes
- No component re-renders required for theme changes

#### Adding New Themes

1. Create new theme file in `packages/react/src/theming/themes/[name]/`
2. Implement all 26 color roles following MD3 contrast requirements
3. Export theme with unique `id` and appropriate `type`
4. Register theme in application theme provider

#### Color Class Reference

All MD3 colors are available as Tailwind classes:
- **Backgrounds**: `bg-primary`, `bg-surface`, `bg-errorContainer`
- **Text**: `text-onPrimary`, `text-onSurface`, `text-error`
- **Borders**: `border-outline`, `border-primary`, `border-error`
- **Utilities**: `ring-primary/20`, `bg-scrim/30`

## Development Notes

- Uses Biome for code formatting and linting (configured in biome.json)
- Tailwind CSS v4 for styling with Material Design 3 color system
- Icons from https://tabler.io/icons (SVG icons inline in components)
- Storybook for component development
- Vitest for testing
- All packages are published to npm under @nubase scope

## Component Development Guidelines

### Size Variants
- **Do not** add size variants (sm, md, lg) to new components unless explicitly requested
- Components should have a single, well-designed default size
- Only implement size variants when there is a clear use case and explicit requirement

## Storybook Guidelines

### Story Naming Convention
- **Never** start story titles with "Components" - skip directly to the category
- Use format: `"Category/ComponentName"` instead of `"Components/Category/ComponentName"`
- Examples:
  - ✅ Good: `title: "Form Controls/Label"`
  - ✅ Good: `title: "Buttons/Button"`
  - ✅ Good: `title: "Floating/Toast"`
  - ❌ Bad: `title: "Components/Form Controls/Label"`

### Dark Mode Stories
- **Never** create stories specifically for dark mode (e.g., `DarkModeDemo`, `DarkMode` stories)
- Storybook has an automatic dark mode plugin with a toggle that shows all stories in both light and dark modes
- Focus on creating comprehensive stories that demonstrate functionality, variants, and use cases
- The dark mode plugin will automatically test visual appearance in both themes

### Story Structure and Presentation
- **Never** add wrapper components with borders, padding, or explanatory text around stories
- **Never** include explanatory text like "The component appears below" or similar descriptions
- Use `args` directly instead of custom render functions whenever possible
- Let the story title and component props speak for themselves
- Keep stories clean and minimal - focus on demonstrating component functionality
- Avoid visual noise like borders, background colors, or unnecessary containers unless they're part of the component's intended usage

## Testing

- Core package: `cd packages/core && npm run test`
- Tests use Vitest framework
- Test files follow `.test.ts` naming convention