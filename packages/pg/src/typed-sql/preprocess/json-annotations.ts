/**
 * Parse leading `@json` annotations from a `.sql` file.
 *
 * Devs express the shape of `jsonb` / `json` columns and params using plain
 * TypeScript type expressions in SQL line comments at the top of the file.
 * Postgres can't infer the shape of JSON, so the annotation is how the
 * generator learns it.
 *
 * Syntax:
 *
 *   -- @json metadata: import("@/schemas").TicketMetadata
 *   -- @json tags: string[]
 *   SELECT id, metadata, tags FROM tickets;
 *
 * Rules:
 * - Annotations must appear at the top of the file, before any non-comment,
 *   non-blank line. Once we hit real SQL, scanning stops — an `@json`-looking
 *   comment inside the query body is ignored.
 * - Each annotation is a single `--` line comment (not block-comment form).
 * - `<name>` is a column alias or a param name.
 * - `<ts-type-expression>` is pasted verbatim into the generated TypeScript
 *   — it can be any valid TS type (unions, imports, object literals, etc.).
 *   The parser does NOT validate it beyond "non-empty"; `tsc` will catch
 *   malformed types when the generated file is compiled.
 */

export interface JsonAnnotation {
  /** The column alias or parameter name this annotation applies to. */
  name: string;
  /** The TypeScript type expression, pasted verbatim into generated code. */
  tsType: string;
  /** 1-based line number in the source where this annotation was declared. */
  line: number;
  /** 1-based column number where `@json` starts. */
  column: number;
}

export interface JsonAnnotationError {
  message: string;
  /** 1-based line number. */
  line: number;
  /** 1-based column number where the error starts. */
  column: number;
  /** Nubase-specific error code (e.g. NU001) for diagnostic output. */
  code: "NU001" | "NU002";
}

export interface JsonAnnotationParseResult {
  annotations: JsonAnnotation[];
  errors: JsonAnnotationError[];
}

const ANNOTATION_RE =
  /^\s*--\s*@json\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+?)\s*$/;

export function parseJsonAnnotations(
  source: string,
): JsonAnnotationParseResult {
  const annotations: JsonAnnotation[] = [];
  const errors: JsonAnnotationError[] = [];

  const lines = source.split(/\r?\n/);
  const seenNames = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();

    // Blank line — keep scanning, still in the header region.
    if (trimmed === "") continue;

    // Any non-comment line ends the header region.
    if (!trimmed.startsWith("--")) break;

    // Line comment that doesn't start with `@json` — ignore, keep scanning.
    // This lets devs mix regular comments with annotations.
    if (!/^\s*--\s*@json\b/.test(rawLine)) {
      // But if it looks like `-- @json` with bad syntax, flag it.
      if (/^\s*--\s*@json/.test(rawLine)) {
        errors.push({
          code: "NU001",
          message:
            "Malformed @json annotation. Expected `-- @json <name>: <ts-type>`.",
          line: i + 1,
          column: rawLine.indexOf("@json") + 1,
        });
      }
      continue;
    }

    const match = rawLine.match(ANNOTATION_RE);
    if (!match) {
      errors.push({
        code: "NU001",
        message:
          "Malformed @json annotation. Expected `-- @json <name>: <ts-type>`.",
        line: i + 1,
        column: rawLine.indexOf("@json") + 1,
      });
      continue;
    }

    const name = match[1];
    const tsType = match[2];
    if (!name || !tsType) {
      errors.push({
        code: "NU001",
        message:
          "Malformed @json annotation. Expected `-- @json <name>: <ts-type>`.",
        line: i + 1,
        column: rawLine.indexOf("@json") + 1,
      });
      continue;
    }

    if (seenNames.has(name)) {
      errors.push({
        code: "NU002",
        message: `Duplicate @json annotation for "${name}". First declared on line ${seenNames.get(name)}.`,
        line: i + 1,
        column: rawLine.indexOf(name) + 1,
      });
      continue;
    }

    seenNames.set(name, i + 1);
    annotations.push({
      name,
      tsType,
      line: i + 1,
      column: rawLine.indexOf("@json") + 1,
    });
  }

  return { annotations, errors };
}
