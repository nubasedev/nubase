import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateTypes } from "@nubase/sdk/codegen";
import type { SchemaMetadata } from "@nubase/sdk/codegen";
import { loadAppConfig } from "../config/load-app-config.js";
import { log } from "../output/logger.js";

/**
 * `nubase pull` — fetch schema from server and generate TypeScript types.
 */
export async function pull(options?: { remote?: string }): Promise<void> {
  log.step("Loading configuration...");
  const resolved = await loadAppConfig(options);

  const { remote, typesDir } = resolved;
  const schemaUrl = `${remote.url}/api/nubase/schema`;

  log.step(`Fetching schema from ${remote.name} (${schemaUrl})...`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (remote.token) {
    headers.Authorization = `Bearer ${remote.token}`;
  }

  const response = await fetch(schemaUrl, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.status} ${response.statusText}`,
    );
  }

  const schema: SchemaMetadata = await response.json();

  log.step("Generating types...");

  mkdirSync(typesDir, { recursive: true });

  const files = generateTypes(schema);

  for (const file of files) {
    const filePath = path.join(typesDir, file.path);
    writeFileSync(filePath, file.content, "utf-8");
    log.dim(`  ${file.path}`);
  }

  const metadataPath = path.join(
    path.dirname(typesDir),
    "schema-metadata.json",
  );
  writeFileSync(metadataPath, JSON.stringify(schema, null, 2), "utf-8");
  log.dim("  schema-metadata.json");

  const tableCount = Object.keys(schema.tables).length;
  const enumCount = Object.keys(schema.enums).length;

  log.success(
    `Generated types for ${tableCount} table${tableCount !== 1 ? "s" : ""} and ${enumCount} enum${enumCount !== 1 ? "s" : ""} in ${typesDir}`,
  );
}
