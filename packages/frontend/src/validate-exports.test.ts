/**
 * Export Validation Test
 *
 * This test ensures that all components with an index.ts file in the components
 * directory are properly exported from the package. It scans the components
 * directory structure and verifies that each component's exports are accessible
 * from the main package entry point.
 *
 * This catches cases where:
 * - A new component is added but not exported from components/index.ts
 * - An export is accidentally removed
 * - A component's index.ts exports something that doesn't get re-exported
 *
 * IMPORTANT: This test validates against the BUILT package (dist/index.mjs).
 * Run `npm run build` before running tests if you've made changes to exports.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const COMPONENTS_DIR = join(__dirname, "components");
const DIST_PATH = join(__dirname, "..", "dist", "index.mjs");

/**
 * Recursively find all directories that contain an index.ts file
 * and are meant to be exported (not internal utilities)
 */
function findExportableComponentDirs(dir: string): string[] {
  const results: string[] = [];

  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = join(dir, entry.name);

    // Skip internal directories that aren't meant to be exported
    const skipDirs = [
      "icons", // Internal icon components
      "monaco", // Internal monaco editor setup
      "page-headers", // Internal page header components
      "page-layouts", // Internal page layout components
      "resize-handle", // Internal resize handle component
      "utils", // Utility functions within components
      "cellRenderers", // Internal cell renderers for data-grid
      "renderers", // Internal form renderers
      "modal", // Sub-components of views
      "screen", // Sub-components of views
    ];

    if (skipDirs.includes(entry.name)) {
      continue;
    }

    // Check if this directory has an index.ts
    const indexPath = join(fullPath, "index.ts");
    try {
      statSync(indexPath);
      results.push(fullPath);
    } catch {
      // No index.ts, check subdirectories
    }

    // Recursively check subdirectories
    const subDirs = findExportableComponentDirs(fullPath);
    results.push(...subDirs);
  }

  return results;
}

/**
 * Parse an index.ts file and extract named exports
 * This is a simple regex-based parser that handles common export patterns:
 * - export { Foo, Bar } from "./file"
 * - export { Foo, type FooProps } from "./file"
 * - export type { FooType } from "./file"
 * - export { Foo as Bar } from "./file"
 * - export * from "./file"
 */
function parseExports(indexPath: string): {
  namedExports: string[];
  hasStarExports: boolean;
} {
  const content = readFileSync(indexPath, "utf-8");
  const namedExports: string[] = [];
  let hasStarExports = false;

  // Match: export { Name1, Name2, type Type1 } from "..."
  // But NOT: export type { ... } from "..." (pure type exports)
  const namedExportRegex = /export\s+\{([^}]+)\}\s*from/g;
  const typeOnlyExportRegex = /export\s+type\s+\{([^}]+)\}\s*from/g;

  // First, collect all type-only exports to exclude them
  const typeOnlyExports = new Set<string>();
  for (const match of content.matchAll(typeOnlyExportRegex)) {
    const exports = match[1].split(",").map((e) => e.trim());
    for (const exp of exports) {
      // Handle "Foo as Bar" pattern - use the exported name
      const asMatch = exp.match(/(\w+)\s+as\s+(\w+)/);
      if (asMatch) {
        typeOnlyExports.add(asMatch[2]);
      } else {
        typeOnlyExports.add(exp.trim());
      }
    }
  }

  for (const match of content.matchAll(namedExportRegex)) {
    // Skip if this is a "export type {" (already handled above)
    const fullMatch = match[0];
    if (/export\s+type\s+\{/.test(fullMatch)) {
      continue;
    }

    const exports = match[1].split(",").map((e) => e.trim());
    for (const exp of exports) {
      // Skip inline type exports: "type FooType"
      if (exp.startsWith("type ")) {
        continue;
      }

      // Handle "Foo as Bar" pattern - use the exported name (Bar)
      const asMatch = exp.match(/(\w+)\s+as\s+(\w+)/);
      let exportName: string;
      if (asMatch) {
        exportName = asMatch[2];
      } else {
        exportName = exp.trim();
      }

      // Only add if it's a valid identifier and not a type-only export
      if (exportName && /^\w+$/.test(exportName)) {
        namedExports.push(exportName);
      }
    }
  }

  // Check for star exports: export * from "..."
  if (/export\s*\*\s*from/.test(content)) {
    hasStarExports = true;
  }

  return { namedExports, hasStarExports };
}

/**
 * Extract exported names from the built ESM bundle by parsing export statements
 */
function getExportedNamesFromBundle(): Set<string> {
  if (!existsSync(DIST_PATH)) {
    throw new Error(
      `Built package not found at ${DIST_PATH}. Run "npm run build" first.`,
    );
  }

  const content = readFileSync(DIST_PATH, "utf-8");
  const exportedNames = new Set<string>();

  // Match named exports: export { Name1, Name2 as Alias }
  // The bundle typically has exports at the end
  const namedExportRegex = /export\s*\{([^}]+)\}/g;

  for (const match of content.matchAll(namedExportRegex)) {
    const exports = match[1].split(",").map((e) => e.trim());
    for (const exp of exports) {
      // Handle "originalName as exportedName" pattern
      const asMatch = exp.match(/(\w+)\s+as\s+(\w+)/);
      if (asMatch) {
        exportedNames.add(asMatch[2]); // Use the exported name (alias)
      } else {
        const cleanName = exp.trim();
        if (cleanName && /^\w+$/.test(cleanName)) {
          exportedNames.add(cleanName);
        }
      }
    }
  }

  return exportedNames;
}

describe("Package Exports Validation", () => {
  const componentDirs = findExportableComponentDirs(COMPONENTS_DIR);

  it("should find component directories to validate", () => {
    expect(componentDirs.length).toBeGreaterThan(0);
  });

  it("should have a built package to validate against", () => {
    expect(
      existsSync(DIST_PATH),
      `Built package not found at ${DIST_PATH}. Run "npm run build" first.`,
    ).toBe(true);
  });

  // Get all exported names from the built package
  let exportedNames: Set<string>;
  try {
    exportedNames = getExportedNamesFromBundle();
  } catch {
    // If we can't parse exports, create an empty set
    // The "should have a built package" test will fail with a better message
    exportedNames = new Set();
  }

  for (const dir of componentDirs) {
    const relativePath = relative(COMPONENTS_DIR, dir);
    const indexPath = join(dir, "index.ts");

    describe(`components/${relativePath}`, () => {
      it("should have all named exports available from package", () => {
        // Skip if no built package
        if (exportedNames.size === 0) {
          return;
        }

        const { namedExports, hasStarExports } = parseExports(indexPath);

        // Skip validation for components that only have star exports
        // as we can't easily determine what they export without deeper analysis
        if (namedExports.length === 0 && hasStarExports) {
          return;
        }

        const missingExports: string[] = [];

        for (const exportName of namedExports) {
          // Skip type exports (they won't appear in runtime exports)
          if (exportName.endsWith("Props") || exportName.endsWith("Type")) {
            continue;
          }

          if (!exportedNames.has(exportName)) {
            missingExports.push(exportName);
          }
        }

        if (missingExports.length > 0) {
          throw new Error(
            `Component "${relativePath}" has exports that are not available from @nubase/frontend:\n` +
              `  Missing: ${missingExports.join(", ")}\n` +
              `  Ensure these are exported in components/index.ts`,
          );
        }
      });
    });
  }

  it("should export common components", () => {
    // Skip if no built package
    if (exportedNames.size === 0) {
      return;
    }

    // Verify some key components are exported
    const expectedExports = [
      "ActivityIndicator",
      "ActionBar",
      "Button",
      "SchemaForm",
      "Modal",
      "ModalProvider",
      "Toast",
      "Dialog",
      "MainNav",
      "NubaseApp",
      "DataGrid",
    ];

    const missingExports = expectedExports.filter(
      (name) => !exportedNames.has(name),
    );

    if (missingExports.length > 0) {
      throw new Error(
        `Expected components are not exported from @nubase/frontend:\n` +
          `  Missing: ${missingExports.join(", ")}`,
      );
    }
  });
});
