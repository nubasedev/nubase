import path from "node:path";
import { loadSchema, saveSchema } from "@nubase/pg";
import type { PgSchema } from "@nubase/pg";

export function getSnapshotPath(
  snapshotsDir: string,
  envName: string,
): string {
  return path.join(snapshotsDir, `${envName}.json`);
}

export async function loadSnapshot(
  snapshotsDir: string,
  envName: string,
): Promise<PgSchema | null> {
  const filePath = getSnapshotPath(snapshotsDir, envName);
  try {
    return await loadSchema(filePath);
  } catch {
    return null;
  }
}

export async function saveSnapshot(
  snapshotsDir: string,
  envName: string,
  schema: PgSchema,
): Promise<void> {
  const filePath = getSnapshotPath(snapshotsDir, envName);
  await saveSchema(schema, filePath);
}
