/**
 * Walk a `data-layer/` directory recursively and return every `.sql` file
 * the generator should process. Skips hidden files, `node_modules/`, and
 * basenames that aren't valid JS identifiers.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import * as path from "node:path";

export interface DiscoveredQuery {
  /** Absolute path to the `.sql` file. */
  absPath: string;
  /** Path relative to `data-layer/` (forward slashes). */
  relPath: string;
  /** First path segment under `data-layer/` (the "context" folder). */
  context: string;
  /** File basename without the `.sql` extension — used as the function name. */
  name: string;
  /** Absolute path where the generated `.ts` should be written. */
  targetTsPath: string;
  /** Raw source bytes, read eagerly for hashing and error reporting. */
  source: string;
}

export interface DiscoveredWarning {
  path: string;
  reason: string;
}

export interface DiscoveryResult {
  queries: DiscoveredQuery[];
  warnings: DiscoveredWarning[];
}

const VALID_IDENTIFIER = /^[A-Za-z][A-Za-z0-9]*$/;
const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "dist", "build"]);

async function walk(dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      await walk(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".sql")) {
      out.push(full);
    }
  }
}

export async function findSqlFiles(
  dataLayerDir: string,
): Promise<DiscoveryResult> {
  const absRoot = path.resolve(dataLayerDir);
  try {
    const stats = await stat(absRoot);
    if (!stats.isDirectory()) {
      throw new Error(`data-layer path is not a directory: ${absRoot}`);
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`data-layer directory does not exist: ${absRoot}`);
    }
    throw e;
  }

  const absPaths: string[] = [];
  await walk(absRoot, absPaths);
  absPaths.sort();

  const queries: DiscoveredQuery[] = [];
  const warnings: DiscoveredWarning[] = [];

  for (const absPath of absPaths) {
    const relPath = path.relative(absRoot, absPath).split(path.sep).join("/");
    const basename = path.basename(absPath, ".sql");

    if (!VALID_IDENTIFIER.test(basename)) {
      warnings.push({
        path: absPath,
        reason: `File basename "${basename}" is not a valid JavaScript identifier. Skipped.`,
      });
      continue;
    }

    const segments = relPath.split("/");
    const context = segments.length > 1 ? segments[0]! : "";
    const targetTsPath = absPath.replace(/\.sql$/, ".ts");
    const source = await readFile(absPath, "utf8");

    queries.push({
      absPath,
      relPath,
      context,
      name: basename,
      targetTsPath,
      source,
    });
  }

  return { queries, warnings };
}
