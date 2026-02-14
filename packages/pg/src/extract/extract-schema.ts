import type { Client } from "pg";
import type { PgSchema } from "../types/schema";
import { withConnection } from "./connection";
import { extractCollations } from "./queries/collations";
import { extractConstraints } from "./queries/constraints";
import { extractDomains } from "./queries/domains";
import { extractEnums } from "./queries/enums";
import { extractExtensions } from "./queries/extensions";
import { extractFunctions } from "./queries/functions";
import { extractIndexes } from "./queries/indexes";
import { extractPolicies } from "./queries/policies";
import { extractPrivileges } from "./queries/privileges";
import { extractSequences } from "./queries/sequences";
import { extractTables } from "./queries/tables";
import { extractTriggers } from "./queries/triggers";
import { extractMaterializedViews, extractViews } from "./queries/views";

export async function extractSchemaFromClient(
  client: Client,
): Promise<PgSchema> {
  const versionResult = await client.query("SHOW server_version");
  const pgVersion = versionResult.rows[0]?.server_version ?? "unknown";

  const dbResult = await client.query("SELECT current_database()");
  const databaseName = dbResult.rows[0]?.current_database ?? "unknown";

  const [
    tables,
    constraintsByTable,
    indexesByTable,
    enums,
    sequences,
    views,
    materializedViews,
    functions,
    triggers,
    extensions,
    domains,
    collations,
    policies,
    privileges,
  ] = await Promise.all([
    extractTables(client),
    extractConstraints(client),
    extractIndexes(client),
    extractEnums(client),
    extractSequences(client),
    extractViews(client),
    extractMaterializedViews(client),
    extractFunctions(client),
    extractTriggers(client),
    extractExtensions(client),
    extractDomains(client),
    extractCollations(client),
    extractPolicies(client),
    extractPrivileges(client),
  ]);

  // Merge constraints and indexes into their parent tables
  for (const [tableKey, table] of Object.entries(tables)) {
    const tableConstraints = constraintsByTable[tableKey];
    if (tableConstraints) {
      for (const constraint of tableConstraints) {
        table.constraints[constraint.name] = constraint;
      }
    }

    const tableIndexes = indexesByTable[tableKey];
    if (tableIndexes) {
      for (const index of tableIndexes) {
        table.indexes[index.name] = index;
      }
    }
  }

  // Merge indexes into materialized views
  for (const [_viewKey, matView] of Object.entries(materializedViews)) {
    const viewTableKey = `${matView.schema}.${matView.name}`;
    const matViewIndexes = indexesByTable[viewTableKey];
    if (matViewIndexes) {
      for (const index of matViewIndexes) {
        matView.indexes[index.name] = index;
      }
    }
  }

  return {
    pgVersion,
    databaseName,
    extractedAt: new Date().toISOString(),
    tables,
    enums,
    sequences,
    views,
    materializedViews,
    functions,
    triggers,
    extensions,
    domains,
    collations,
    policies,
    privileges,
  };
}

export async function extractSchema(
  connectionString: string,
): Promise<PgSchema> {
  return withConnection(connectionString, extractSchemaFromClient);
}
