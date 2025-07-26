import type { NubaseTheme } from "./theme";

/**
 * Converts a theme property name to a CSS variable name
 * Example: "primaryContainer" -> "--primary-container"
 * Example: "onPrimaryContainer" -> "--on-primary-container"
 */
export function themePropertyToCSSVariable(property: string): string {
  // Convert camelCase to kebab-case
  const kebabCase = property
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, ""); // Remove leading dash if present

  return `--${kebabCase}`;
}

/**
 * Converts VS Code theme colors object to CSS variable declarations
 */
export function generateCSSVariables(colors: Record<string, string>): string {
  return Object.entries(colors)
    .map(
      ([property, value]) =>
        `  ${themePropertyToCSSVariable(property)}: ${value};`,
    )
    .join("\n");
}

/**
 * Generates CSS rule for a theme with all its variables
 */
export function generateThemeCSS(theme: NubaseTheme): string {
  const cssVariables = generateCSSVariables(theme.colors);
  return `  [data-theme="${theme.id}"] {\n${cssVariables}\n  }`;
}

/**
 * Generates CSS for multiple themes
 */
export function generateThemesCSS(themes: NubaseTheme[]): string {
  return themes.map((theme) => generateThemeCSS(theme)).join("\n\n");
}

/**
 * Injects theme CSS variables into the DOM
 */
export function injectThemeVariables(themes: NubaseTheme[]): void {
  const css = generateThemesCSS(themes);

  if (!css.trim()) {
    console.warn("No theme CSS generated");
    return;
  }

  // Remove existing theme variables style element if it exists
  const existingStyle = document.getElementById("nubase-theme-variables");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element
  const style = document.createElement("style");
  style.id = "nubase-theme-variables";
  style.type = "text/css";
  style.textContent = css;

  // Insert into document head
  document.head.appendChild(style);

  console.log(`Injected ${themes.length} VS Code theme(s) into DOM`);
}
