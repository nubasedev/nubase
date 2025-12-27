# Styling System

This document explains how Nubase's styling system works, focusing on the centralized typography system and Tailwind CSS v4 integration.

## Overview

Nubase uses **Tailwind CSS v4** with a centralized styling approach. All core styles are defined in `packages/frontend/src/styles.css` using the `@theme` directive, which creates both CSS variables and corresponding Tailwind utility classes.

## Core Styling Architecture

### Main Styles File

The primary styling configuration is located at:
```
packages/frontend/src/styles.css
```

This file contains:
- **Typography scale** definitions using `@theme`
- **Color mappings** from theme variables to Tailwind classes
- **Radius variables** for consistent border-radius values
- **Base layer styles** for global defaults

### Import Structure

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./components/data-grid/styles/data-grid.css";
```

The styles file imports Tailwind core, animation utilities, and component-specific styles.

## Typography System

### Philosophy

Nubase follows industry standards for typography:

- **Base font size**: 16px (1rem) - respects browser defaults and accessibility
- **Rem units**: All font sizes use rem units for scalability
- **14px preference**: Most UI components use `text-sm` (14px) following industry patterns from Material Design, Shadcn/ui, and other modern design systems

### Typography Scale

The typography scale is defined using Tailwind v4's `@theme` directive:

```css
@theme {
  /* Typography scale - rem values based on 16px browser default */
  --text-2xs: 0.625rem;    /* 10px - tiny labels, badges */
  --text-xs: 0.75rem;      /* 12px - data grids, dense UI */
  --text-sm: 0.875rem;     /* 14px - secondary text, form labels */
  --text-base: 1rem;       /* 16px - body text default */
  --text-lg: 1.125rem;     /* 18px - emphasized body text */
  --text-xl: 1.25rem;      /* 20px - section headings */
  --text-2xl: 1.5rem;      /* 24px - page titles */
  --text-3xl: 1.875rem;    /* 30px - hero headings */
  --text-4xl: 2.25rem;     /* 36px - larger headings */
  --text-5xl: 3rem;        /* 48px - display text */
}
```

### Line Heights

Each font size has a corresponding line height for optimal readability:

```css
@theme {
  /* Line heights for better readability */
  --text-2xs--line-height: 0.875rem;   /* 14px */
  --text-xs--line-height: 1rem;        /* 16px */
  --text-sm--line-height: 1.25rem;     /* 20px */
  --text-base--line-height: 1.5rem;    /* 24px */
  --text-lg--line-height: 1.75rem;     /* 28px */
  --text-xl--line-height: 1.75rem;     /* 28px */
  --text-2xl--line-height: 2rem;       /* 32px */
  --text-3xl--line-height: 2.25rem;    /* 36px */
  --text-4xl--line-height: 2.5rem;     /* 40px */
  --text-5xl--line-height: 1;          /* relative */
}
```

## How @theme Works

### CSS Variables + Utility Classes

The `@theme` directive in Tailwind v4 is powerful because it:

1. **Creates CSS variables**: `--text-sm` becomes available as a CSS custom property
2. **Generates utility classes**: `text-sm` class is automatically created
3. **Enables theming**: Variables can be overridden for different themes

### Example Usage

When you define:
```css
@theme {
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;
}
```

You get:
- CSS variable: `var(--text-sm)` 
- Utility class: `text-sm` (sets font-size and line-height)
- Consistency: Both approaches use the same values

## Industry Standards & Design Decisions

### Why 14px (text-sm) is Everywhere

1. **Data density**: Modern UIs need to display more information in less space
2. **Shadcn/ui influence**: The most popular React component library uses `text-sm` extensively
3. **Material Design**: Google recommends 14px for UI components, 16px for body content
4. **Accessibility balance**: 14px is still readable while being more compact than 16px

### Why We Don't Override Root Font Size

**Industry best practice** is to NOT override the root font size:

```css
/* ❌ DON'T DO THIS */
html {
  font-size: 62.5%; /* Makes 1rem = 10px */
}

/* ✅ DO THIS - Leave root font size at browser default (16px) */
/* Define typography using rem assuming 1rem = 16px */
```

**Reasons:**
- **Accessibility**: Respects user browser preferences
- **Predictability**: Everyone expects 1rem = 16px
- **Third-party compatibility**: External components work correctly
- **Industry standard**: Google, Apple, GitHub, Atlassian all follow this pattern

## Component Integration

### Data Grid Example

Components should use theme variables instead of hardcoded values:

```css
/* Before: Hardcoded */
.rdg {
  --rdg-font-size: 12px;
}

/* After: Theme variable */
.rdg {
  --rdg-font-size: var(--text-xs, 0.75rem);
}
```

Benefits:
- **Global control**: Change typography from one place
- **Consistency**: All components use the same scale
- **Fallback**: `0.75rem` fallback ensures it works without theme

### Using Theme Variables in Components

You can reference theme variables in any CSS:

```css
.my-component {
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}
```

Or use the generated utility classes in HTML:

```html
<div className="text-sm">This uses the theme variable</div>
```

## Runtime Color System

Nubase uses a sophisticated **runtime theme injection system** that dynamically generates CSS variables for colors. This system is inspired by **Shadcn/ui's color variable conventions** but extends it with runtime capabilities.

### How Runtime Theming Works

1. **Theme Definition**: Themes are defined in TypeScript files with OKLCH color values
2. **Runtime Processing**: At app startup, theme colors are converted to CSS variables
3. **DOM Injection**: CSS variables are injected into the DOM as a `<style>` element
4. **Dynamic Switching**: Themes can be changed at runtime without page reload

### Theme Structure (Inspired by Shadcn)

Nubase follows Shadcn's **background/foreground color convention**:

```typescript
// packages/frontend/src/theming/themes/light.ts
export const light: NubaseTheme = {
  id: "light",
  name: "Light", 
  type: "light",
  colors: {
    // Base colors (Shadcn pattern)
    background: "oklch(1 0 0)",           // White background
    foreground: "oklch(0.145 0 0)",       // Dark text
    
    // Primary colors with foreground pair
    primary: "oklch(0.205 0 0)",          // Dark primary
    primaryForeground: "oklch(0.985 0 0)", // Light text on primary
    
    // Secondary colors with foreground pair  
    secondary: "oklch(0.97 0 0)",         // Light secondary
    secondaryForeground: "oklch(0.205 0 0)", // Dark text on secondary
    
    // Muted colors for subtle elements
    muted: "oklch(0.97 0 0)",
    mutedForeground: "oklch(0.556 0 0)",
    
    // Component-specific colors
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)", 
    popoverForeground: "oklch(0.145 0 0)",
    
    // Interactive states
    accent: "oklch(0.97 0 0)",
    accentForeground: "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    destructiveForeground: "oklch(0.985 0 0)",
    
    // Borders and inputs
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)", 
    ring: "oklch(0.708 0 0)",
    
    // Extended: Chart and sidebar colors
    chart1: "oklch(0.646 0.222 41.116)",
    // ... additional colors
  }
};
```

### Runtime CSS Variable Generation

The system converts theme properties to CSS variables using this process:

```typescript
// packages/frontend/src/theming/runtime-theme-generator.ts

// 1. Convert camelCase to CSS variables
themePropertyToCSSVariable("primaryForeground") 
// → "--primary-foreground"

// 2. Generate CSS for each theme
generateThemeCSS(lightTheme)
// → `[data-theme="light"] { --background: oklch(1 0 0); ... }`

// 3. Inject into DOM
injectThemeVariables([lightTheme, darkTheme])
// → Creates <style id="nubase-theme-variables"> in document head
```

### Generated CSS Output

When themes are injected, this CSS is generated:

```css
[data-theme="light"] {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  /* ... all theme colors */
}

[data-theme="dark"] {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... dark theme colors */
}
```

### Integration with Tailwind CSS

The `@theme` directive in `styles.css` maps these runtime variables to Tailwind classes:

```css
@theme {
  /* Map runtime variables to Tailwind color classes */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  /* ... etc */
}
```

This creates utility classes like:
- `bg-background` → `var(--background)`
- `text-foreground` → `var(--foreground)`
- `bg-primary` → `var(--primary)`
- `text-primary-foreground` → `var(--primary-foreground)`
- `border-border` → `var(--border)`

### Theme Switching Process

1. **App Initialization**: 
   - `NubaseApp` → `ServicesProvider` → `useCreateNubaseContext`
   - Calls `initializeNubaseApp()` → `initializeStyles()` → `injectThemeVariables()`

2. **Theme Selection**:
   - User selects theme or system detects preference
   - `setActiveThemeId()` updates state
   - `data-theme` attribute is set on `<html>` element

3. **CSS Cascade**:
   - Browser applies CSS based on `[data-theme="selected"]` selector
   - All components automatically use new color values
   - No component re-renders needed - pure CSS update

### Shadcn Inspiration

Nubase's color system is directly inspired by **Shadcn/ui**:

#### What We Adopted:
- **Background/Foreground Convention**: Every color has a paired foreground color for text
- **Semantic Naming**: `primary`, `secondary`, `muted`, `accent`, `destructive`
- **Component Colors**: `card`, `popover`, `border`, `input`, `ring`
- **OKLCH Color Space**: Modern color format for better perceptual uniformity

#### What We Extended:
- **Runtime Generation**: Themes are TypeScript objects, not static CSS
- **Dynamic Injection**: CSS is generated and injected at runtime
- **Multiple Themes**: Easy to switch between unlimited themes
- **Chart Colors**: Additional colors for data visualization
- **Sidebar Colors**: Extended set for complex layouts

### Benefits of This Approach

1. **Type Safety**: Themes defined in TypeScript with full type checking
2. **Runtime Flexibility**: Add/remove themes without rebuilding CSS
3. **Performance**: CSS variables change instantly, no component re-renders
4. **Consistency**: Follows proven Shadcn conventions developers know
5. **Extensibility**: Easy to add new colors or theme variants
6. **Developer Experience**: IntelliSense for theme properties

## Best Practices

### Typography Guidelines

1. **Use theme variables**: Always prefer `var(--text-sm)` over hardcoded values
2. **Follow conventions**: Use `text-sm` for UI components, `text-base` for body content
3. **Include fallbacks**: `var(--text-sm, 0.875rem)` ensures robustness
4. **Respect accessibility**: Don't go below 12px (`text-xs`) for interactive elements

### Adding New Sizes

To add a new typography size:

1. Add to `@theme` in `styles.css`:
```css
@theme {
  --text-tiny: 0.5rem;  /* 8px */
  --text-tiny--line-height: 0.75rem;  /* 12px */
}
```

2. Use in components:
```css
.label {
  font-size: var(--text-tiny);
}
```

3. Or use the generated class:
```html
<span className="text-tiny">Small label</span>
```

### Component Styling

When creating components:
- Use Tailwind utility classes when possible
- Use theme variables for custom CSS
- Avoid hardcoded pixel values
- Follow the established typography scale

## File Organization

```
packages/frontend/src/
├── styles.css                 # Main styles file
├── components/
│   └── data-grid/
│       └── styles/
│           ├── data-grid.css   # Component styles
│           ├── core.css
│           ├── cell.css
│           └── ...
```

Component-specific styles are kept separate but still reference the main theme variables for consistency.

## Migration Guide

### From Hardcoded to Theme Variables

1. **Identify hardcoded values**:
```css
/* Find these */
font-size: 14px;
font-size: 0.875rem;
```

2. **Replace with theme variables**:
```css
/* Replace with */
font-size: var(--text-sm, 0.875rem);
```

3. **Update utility class usage**:
```html
<!-- Ensure you're using consistent classes -->
<div className="text-sm">Content</div>
```

### Adding Custom Typography

If you need typography not in the default scale:

1. Add to `@theme` in `styles.css`
2. Use descriptive names: `--text-caption`, `--text-overline`
3. Include line heights: `--text-caption--line-height`
4. Document the use case in comments

## Debugging Typography

### Inspecting Theme Variables

In browser dev tools, you can inspect the computed CSS variables:

```css
/* Check if theme variables are loaded */
:root {
  /* Should show all --text-* variables */
}
```

### Common Issues

1. **Variable not defined**: Ensure it's in the `@theme` block
2. **Class not working**: Check Tailwind is processing the CSS file
3. **Inconsistent sizes**: Verify all components use theme variables

## Future Considerations

### Responsive Typography

Consider adding responsive typography modifiers:

```css
@theme {
  --text-sm-mobile: 0.75rem;   /* 12px on mobile */
  --text-sm-desktop: 0.875rem; /* 14px on desktop */
}
```

### Dark Mode

Typography may need adjustments for dark themes:

```css
@theme {
  --text-base--color-dark: #e5e5e5;
  --text-muted--color-dark: #a1a1aa;
}
```

### Performance

The current approach is optimal for performance:
- CSS variables are computed once
- Utility classes are generated at build time
- No runtime style calculations needed