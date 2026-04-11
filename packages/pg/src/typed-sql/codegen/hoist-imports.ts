/**
 * Collect `import("pkg").Name` TypeScript type references out of a set of
 * expressions, dedupe them, and return both:
 *
 *  1. The expressions rewritten to use the bare (possibly aliased) local name
 *  2. A list of `import type { ... } from "..."` statements for the top of the
 *     generated file
 *
 * Handles cross-module name collisions by aliasing: if `Foo` appears in both
 * `"@/a"` and `"@/b"`, the second one becomes `Foo as Foo_2` and the
 * pasted expression is rewritten to `Foo_2`.
 */

const IMPORT_TYPE_RE =
  /import\(\s*(?:"([^"]+)"|'([^']+)')\s*\)\.([A-Za-z_$][\w$]*)/g;

export interface HoistResult {
  /** Original expressions, rewritten with bare names (and aliases if needed). */
  rewritten: string[];
  /** `import type { ... } from "..."` lines, in stable order. */
  importLines: string[];
}

interface ImportKey {
  module: string;
  original: string;
}

export function hoistImports(expressions: string[]): HoistResult {
  // module → original → localAlias
  const registry = new Map<string, Map<string, string>>();
  // Track all local aliases already taken across all modules, to resolve
  // collisions deterministically.
  const takenAliases = new Set<string>();

  // First pass — collect all import references across all expressions so we
  // assign aliases deterministically (by module path, then name).
  const collected: ImportKey[] = [];
  for (const expr of expressions) {
    IMPORT_TYPE_RE.lastIndex = 0;
    let match: RegExpExecArray | null = IMPORT_TYPE_RE.exec(expr);
    while (match) {
      const module = match[1] ?? match[2] ?? "";
      const original = match[3] ?? "";
      collected.push({ module, original });
      match = IMPORT_TYPE_RE.exec(expr);
    }
  }

  // Sort so alias assignment is stable regardless of expression order.
  const sortedKeys = [...collected].sort((a, b) => {
    if (a.module !== b.module) return a.module.localeCompare(b.module);
    return a.original.localeCompare(b.original);
  });

  for (const { module, original } of sortedKeys) {
    let moduleMap = registry.get(module);
    if (!moduleMap) {
      moduleMap = new Map();
      registry.set(module, moduleMap);
    }
    if (moduleMap.has(original)) continue;
    let alias = original;
    let counter = 2;
    while (takenAliases.has(alias)) {
      alias = `${original}_${counter}`;
      counter++;
    }
    moduleMap.set(original, alias);
    takenAliases.add(alias);
  }

  // Second pass — rewrite expressions using the assigned aliases.
  const rewritten = expressions.map((expr) => {
    IMPORT_TYPE_RE.lastIndex = 0;
    return expr.replace(IMPORT_TYPE_RE, (_m, dq, sq, original) => {
      const module = dq ?? sq ?? "";
      const moduleMap = registry.get(module);
      const alias = moduleMap?.get(original);
      return alias ?? original;
    });
  });

  // Build import lines, sorted by module path, with named imports sorted.
  const importLines: string[] = [];
  const sortedModules = [...registry.keys()].sort();
  for (const mod of sortedModules) {
    const entries = [...(registry.get(mod)?.entries() ?? [])];
    entries.sort(([a], [b]) => a.localeCompare(b));
    const parts = entries.map(([orig, alias]) =>
      orig === alias ? orig : `${orig} as ${alias}`,
    );
    importLines.push(`import type { ${parts.join(", ")} } from "${mod}";`);
  }

  return { rewritten, importLines };
}
