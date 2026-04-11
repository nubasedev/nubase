/**
 * Preprocess a `.sql` file's source to convert pgtyped-style named
 * parameters (`:name`) into native Postgres positional parameters
 * (`$1`, `$2`, ...).
 *
 * Produces a source map (`rewrites`) so that Postgres error positions
 * (which reference the rewritten SQL) can be translated back to character
 * offsets in the original source for diagnostics.
 *
 * Rules:
 * - `:name` becomes `$N`. The first unique name gets `$1`, the second `$2`,
 *   and so on. Repeated names collapse to the same `$N`.
 * - `::` is a type cast, not a named parameter. Skipped.
 * - Contents of single-quoted strings, double-quoted identifiers, line
 *   comments (`-- ...`), block comments (`/* ... *\/`), and dollar-quoted
 *   strings (`$$...$$` / `$tag$...$tag$`) are not scanned for named params.
 * - Standalone `$` and native placeholders (`$1`) pass through unchanged.
 *   Mixing native and named syntax is discouraged but not forbidden here.
 */

export interface NamedParamRewrite {
  /** 0-based character offset in the original source where `:` begins. */
  originalStart: number;
  /** 0-based character offset in the original source just past the last identifier char (exclusive). */
  originalEnd: number;
  /** Positional placeholder substituted into the rewritten SQL (e.g. `"$1"`). */
  replacement: string;
  /** The named parameter without its leading colon. */
  paramName: string;
}

export interface Preprocessed {
  /** The SQL to send to Postgres — with `:names` rewritten to `$N`. */
  sql: string;
  /** Ordered list of unique parameter names. `params[N - 1]` is the name for `$N`. */
  params: string[];
  /** Per-occurrence rewrite spans, in source order. */
  rewrites: NamedParamRewrite[];
}

const IDENT_START = /[A-Za-z_]/;
const IDENT_CONT = /[A-Za-z0-9_]/;

export function preprocessNamedParams(source: string): Preprocessed {
  const paramOrder: string[] = [];
  const paramIndex = new Map<string, number>();
  const rewrites: NamedParamRewrite[] = [];

  const n = source.length;
  let i = 0;

  while (i < n) {
    const ch = source.charAt(i);
    const next = source.charAt(i + 1);

    // Line comment: -- ... \n
    if (ch === "-" && next === "-") {
      while (i < n && source.charAt(i) !== "\n") i++;
      continue;
    }

    // Block comment: /* ... */  (not nesting — Postgres supports nesting,
    // but the common case is enough for parameter scanning.)
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < n - 1) {
        if (source.charAt(i) === "*" && source.charAt(i + 1) === "/") {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    // Single-quoted string. Postgres escapes internal `'` by doubling.
    if (ch === "'") {
      i++;
      while (i < n) {
        if (source.charAt(i) === "'") {
          if (source.charAt(i + 1) === "'") {
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // Double-quoted identifier.
    if (ch === '"') {
      i++;
      while (i < n && source.charAt(i) !== '"') i++;
      if (i < n) i++;
      continue;
    }

    // Dollar-quoted string: $$ ... $$  or  $tag$ ... $tag$
    if (ch === "$") {
      let j = i + 1;
      while (j < n && IDENT_CONT.test(source.charAt(j))) j++;
      if (j < n && source.charAt(j) === "$") {
        const tag = source.slice(i, j + 1);
        i = j + 1;
        while (i < n) {
          if (source.slice(i, i + tag.length) === tag) {
            i += tag.length;
            break;
          }
          i++;
        }
        continue;
      }
      // Standalone `$` (e.g. `$1` native placeholder) — pass through.
      i++;
      continue;
    }

    // `::` cast
    if (ch === ":" && next === ":") {
      i += 2;
      continue;
    }

    // `:name`
    if (ch === ":" && IDENT_START.test(next)) {
      const nameStart = i + 1;
      let nameEnd = nameStart;
      while (nameEnd < n && IDENT_CONT.test(source.charAt(nameEnd))) nameEnd++;
      const paramName = source.slice(nameStart, nameEnd);

      let pIdx = paramIndex.get(paramName);
      if (pIdx === undefined) {
        paramOrder.push(paramName);
        pIdx = paramOrder.length;
        paramIndex.set(paramName, pIdx);
      }

      rewrites.push({
        originalStart: i,
        originalEnd: nameEnd,
        replacement: `$${pIdx}`,
        paramName,
      });

      i = nameEnd;
      continue;
    }

    i++;
  }

  // Stitch the rewritten SQL.
  let sql = "";
  let cursor = 0;
  for (const r of rewrites) {
    sql += source.slice(cursor, r.originalStart);
    sql += r.replacement;
    cursor = r.originalEnd;
  }
  sql += source.slice(cursor);

  return { sql, params: paramOrder, rewrites };
}
