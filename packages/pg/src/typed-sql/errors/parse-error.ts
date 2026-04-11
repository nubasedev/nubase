/**
 * Format a Postgres `IParseError` (returned by the vendored
 * `getTypes()`) into a developer-facing diagnostic string.
 *
 * The output looks like:
 *
 *   ✖ path/to/listOpenTickets.sql
 *     42703: column "titel" does not exist
 *
 *        4 │   t.id,
 *        5 │   t.titel,
 *          │     ^^^^^
 *        6 │   t.status
 *          │
 *          │ Hint: Perhaps you meant to reference the column "tickets.title".
 *          │
 *          │ ↪ Postgres error code 42703 (undefined_column)
 *
 * Two context lines above and one below, with a caret underline at the
 * error column. The caret length falls back to 1 if the error span is
 * unknown.
 */

import type { NamedParamRewrite } from "../preprocess/named-params.js";
import type { IParseError } from "../query/actions.js";
import { mapRewrittenPositionToSource } from "./source-map.js";
import { sqlstateName } from "./sqlstates.js";

export interface FormatParseErrorInput {
  /** Path to the .sql file, relative to the project root (for clickable output). */
  filePath: string;
  /** The original `.sql` source text. */
  source: string;
  /** Rewrites produced by the preprocessor (for source-map translation). */
  rewrites: NamedParamRewrite[];
  /** The error as returned by the vendored getTypes(). */
  error: IParseError;
}

const CONTEXT_LINES_BEFORE = 2;
const CONTEXT_LINES_AFTER = 1;

export function formatParseError(input: FormatParseErrorInput): string {
  const { filePath, source, rewrites, error } = input;
  const lines: string[] = [];
  lines.push(`✖ ${filePath}`);
  lines.push(`  ${error.errorCode}: ${error.message}`);
  lines.push("");

  if (error.position) {
    const pgPos = Number.parseInt(error.position, 10);
    if (Number.isFinite(pgPos)) {
      const loc = mapRewrittenPositionToSource(source, rewrites, pgPos);
      if (loc) {
        const srcLines = source.split("\n");
        const errorLineIdx = loc.line - 1;
        const startIdx = Math.max(0, errorLineIdx - CONTEXT_LINES_BEFORE);
        const endIdx = Math.min(
          srcLines.length - 1,
          errorLineIdx + CONTEXT_LINES_AFTER,
        );
        const gutterWidth = String(endIdx + 1).length;
        for (let i = startIdx; i <= endIdx; i++) {
          const lineNum = String(i + 1).padStart(gutterWidth, " ");
          const prefix = `  ${lineNum} │ `;
          lines.push(`${prefix}${srcLines[i] ?? ""}`);
          if (i === errorLineIdx) {
            const padding = " ".repeat(loc.column - 1);
            lines.push(`  ${" ".repeat(gutterWidth)} │ ${padding}^`);
          }
        }
        lines.push(`  ${" ".repeat(gutterWidth)} │`);
      }
    }
  }

  if (error.hint) {
    lines.push(`  │ Hint: ${error.hint}`);
    lines.push(`  │`);
  }

  const name = sqlstateName(error.errorCode);
  if (name) {
    lines.push(`  ↪ Postgres error code ${error.errorCode} (${name})`);
  } else {
    lines.push(`  ↪ Postgres error code ${error.errorCode}`);
  }

  return lines.join("\n");
}
