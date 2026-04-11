/**
 * Translate a byte offset inside the *rewritten* SQL (what we sent to
 * Postgres, with `$1`/`$2`/... in place of `:name`) back to a
 * `(line, column)` position in the *original* source (the `.sql` file's
 * on-disk contents).
 *
 * The preprocessor records a list of `NamedParamRewrite` spans when it
 * does the `:name` → `$N` substitution; this function walks those
 * rewrites to adjust the offset, then counts newlines.
 *
 * Inputs:
 * - `source`: the original `.sql` file contents
 * - `rewrites`: the rewrites produced by `preprocessNamedParams`
 * - `pgPosition1Based`: the `position` field from Postgres' ErrorResponse,
 *   which is **1-based** (Postgres convention).
 *
 * Returns `{ line, column, offset }`, all 1-based except `offset` which
 * is 0-based. Returns `null` if position is out of range.
 */

import type { NamedParamRewrite } from "../preprocess/named-params.js";

export interface SourceLocation {
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  column: number;
  /** 0-based character offset into the original source. */
  offset: number;
}

export function mapRewrittenPositionToSource(
  source: string,
  rewrites: NamedParamRewrite[],
  pgPosition1Based: number,
): SourceLocation | null {
  // Convert to 0-based.
  const rewrittenOffset = pgPosition1Based - 1;
  if (rewrittenOffset < 0) return null;

  // Walk the rewrites in order. For each rewrite that ends at or before
  // the rewritten offset, the rewritten text is shorter or longer than
  // the original by `(original.length - replacement.length)` — we add
  // that delta to get back to the original offset.
  //
  // If the rewritten offset falls *inside* a replacement's span (e.g.
  // pointing at a `$1`), we map it to the start of the original `:name`.
  let originalOffset = rewrittenOffset;
  let rewrittenCursor = 0;
  for (const r of rewrites) {
    const originalLen = r.originalEnd - r.originalStart;
    const replacementLen = r.replacement.length;
    const rewritePosInRewritten =
      rewrittenCursor + (r.originalStart - rewrittenCursor);
    //   ^ equivalent to r.originalStart if no prior rewrites overlapped
    //     (which they can't, since they're sequential non-overlapping spans)

    const rewriteEndInRewritten = rewritePosInRewritten + replacementLen;

    if (rewrittenOffset < rewritePosInRewritten) {
      // The error is before this rewrite; nothing more to adjust.
      break;
    }

    if (rewrittenOffset < rewriteEndInRewritten) {
      // The error points inside a replacement — map to the original start.
      originalOffset = r.originalStart;
      break;
    }

    // The error is past this rewrite; add the delta and keep going.
    originalOffset += originalLen - replacementLen;
    rewrittenCursor = rewriteEndInRewritten;
  }

  if (originalOffset < 0 || originalOffset > source.length) return null;

  // Count lines/columns in the original source up to `originalOffset`.
  let line = 1;
  let column = 1;
  for (let i = 0; i < originalOffset; i++) {
    if (source.charAt(i) === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column, offset: originalOffset };
}
