import path from "node:path";
import { loadSchema, saveSchema } from "@nubase/pg";
import type { PgSchema } from "@nubase/pg";

// The snapshot is a single file per project, not per environment. It
// represents the *intended* schema state — the result of applying all known
// migrations to a clean database — and is environment-independent. See
// apps/docs/docs/technical-decisions/0005-unified-schema-snapshot.mdx for
// rationale.
const SNAPSHOT_FILENAME = "schema.json";

export function getSnapshotPath(snapshotsDir: string): string {
  return path.join(snapshotsDir, SNAPSHOT_FILENAME);
}

export async function loadSnapshot(
  snapshotsDir: string,
): Promise<PgSchema | null> {
  const filePath = getSnapshotPath(snapshotsDir);
  try {
    return await loadSchema(filePath);
  } catch {
    return null;
  }
}

export async function saveSnapshot(
  snapshotsDir: string,
  schema: PgSchema,
): Promise<void> {
  const filePath = getSnapshotPath(snapshotsDir);
  await saveSchema(schema, filePath);
}
