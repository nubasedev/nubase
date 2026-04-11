/**
 * Orchestrator for `nubase data-layer generate`.
 *
 * Responsibilities:
 *  1. Discover every `.sql` file under the data-layer directory.
 *  2. Open one long-lived wire connection to Postgres.
 *  3. For each query, run `generateQuery` and either write the generated
 *     `.ts` file or collect the error.
 *  4. Clean up orphaned `.ts` files whose `.sql` siblings are gone.
 *  5. Return a structured `GenerateResult`.
 *
 * In `--check` mode (implemented in `check-stale.ts`), we don't write
 * files — we compare the generated content against what's on disk and
 * fail on any mismatch.
 */

import { readFile, writeFile } from "node:fs/promises";
import type { DiscoveredWarning } from "../discover/find-sql-files.js";
import { findSqlFiles } from "../discover/find-sql-files.js";
import {
  extractHashFromGeneratedFile,
  isGeneratedFile,
} from "../discover/hash.js";
import { cleanOrphans } from "../discover/orphan-cleanup.js";
import { parseDatabaseUrl } from "../parse-database-url.js";
import { startup } from "../query/actions.js";
import { AsyncQueue } from "../wire/queue.js";
import type {
  GeneratedQuery,
  GeneratedQueryError,
  GenerateQueryResult,
} from "./generate-query.js";
import { generateQuery } from "./generate-query.js";

export interface GenerateOptions {
  databaseUrl: string;
  /** Absolute path to the data-layer directory. */
  dataLayerDir: string;
  /** If true, don't write files — just compare against what's on disk. */
  check?: boolean;
}

export interface GenerateResult {
  /** Absolute paths of `.ts` files written or already up-to-date. */
  generated: string[];
  /** Absolute paths of `.ts` files that were already up-to-date (no write needed). */
  unchanged: string[];
  /** Absolute paths of orphaned `.ts` files removed (only in non-check mode). */
  deleted: string[];
  /** Per-file errors, in discovery order. */
  errors: GeneratedQueryError[];
  /** Discovery warnings (e.g. skipped invalid filenames). */
  warnings: DiscoveredWarning[];
  /** In check mode: files whose on-disk content doesn't match what we'd generate. */
  stale: string[];
  /** Total wall time in milliseconds. */
  durationMs: number;
}

async function openConnection(databaseUrl: string): Promise<AsyncQueue> {
  const parsed = parseDatabaseUrl(databaseUrl);
  const queue = new AsyncQueue();
  await startup(
    {
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      dbName: parsed.dbName,
      // See extract-query-types.ts — vendored code treats `ssl: false` as
      // "SSL enabled", so we omit the key when disabled.
      ...(parsed.ssl ? { ssl: true } : {}),
    },
    queue,
  );
  return queue;
}

function closeConnection(queue: AsyncQueue): void {
  try {
    queue.socket.end();
    queue.socket.destroy();
  } catch {
    // Best-effort teardown.
  }
}

async function writeIfChanged(
  path: string,
  content: string,
): Promise<"written" | "unchanged"> {
  try {
    const existing = await readFile(path, "utf8");
    if (existing === content) return "unchanged";
  } catch {
    // File doesn't exist — fall through to write.
  }
  await writeFile(path, content, "utf8");
  return "written";
}

async function readCurrentHash(path: string): Promise<string | null> {
  try {
    const existing = await readFile(path, "utf8");
    if (!isGeneratedFile(existing)) return null;
    return extractHashFromGeneratedFile(existing);
  } catch {
    return null;
  }
}

export async function generateAll(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const started = Date.now();
  const result: GenerateResult = {
    generated: [],
    unchanged: [],
    deleted: [],
    errors: [],
    warnings: [],
    stale: [],
    durationMs: 0,
  };

  const discovery = await findSqlFiles(options.dataLayerDir);
  result.warnings = discovery.warnings;

  if (discovery.queries.length === 0) {
    result.durationMs = Date.now() - started;
    return result;
  }

  const queue = await openConnection(options.databaseUrl);
  try {
    for (const query of discovery.queries) {
      const outcome: GenerateQueryResult = await generateQuery(query, queue);
      if (outcome.kind === "error") {
        result.errors.push(outcome);
        continue;
      }
      if (options.check) {
        const onDiskHash = await readCurrentHash(query.targetTsPath);
        if (onDiskHash !== outcome.sourceHash) {
          result.stale.push(query.targetTsPath);
        } else {
          result.unchanged.push(query.targetTsPath);
        }
      } else {
        const write = await writeIfChanged(query.targetTsPath, outcome.content);
        if (write === "written") {
          result.generated.push(query.targetTsPath);
        } else {
          result.unchanged.push(query.targetTsPath);
        }
      }
    }
  } finally {
    closeConnection(queue);
  }

  // Orphan cleanup — only in non-check mode.
  if (!options.check) {
    const orphanReport = await cleanOrphans(options.dataLayerDir);
    result.deleted = orphanReport.deleted;
  } else {
    // In check mode, any orphan is a "stale" condition we surface so CI fails.
    const orphanReport = await cleanOrphans(options.dataLayerDir, {
      dryRun: true,
    });
    for (const orphan of orphanReport.deleted) {
      result.stale.push(orphan);
    }
  }

  result.durationMs = Date.now() - started;
  return result;
}

export type { GeneratedQuery, GeneratedQueryError, GenerateQueryResult };
