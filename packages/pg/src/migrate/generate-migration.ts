import type { SchemaDiff } from "../types/diff";
import { generateCollationStatements } from "./sql-generators/collations";
import { generateColumnStatements } from "./sql-generators/columns";
import { generateConstraintStatements } from "./sql-generators/constraints";
import { generateDomainStatements } from "./sql-generators/domains";
import { generateEnumStatements } from "./sql-generators/enums";
import { generateExtensionStatements } from "./sql-generators/extensions";
import { generateFunctionStatements } from "./sql-generators/functions";
import { generateIndexStatements } from "./sql-generators/indexes";
import { generatePolicyStatements } from "./sql-generators/policies";
import { generatePrivilegeStatements } from "./sql-generators/privileges";
import { generateSequenceStatements } from "./sql-generators/sequences";
import { generateTableStatements } from "./sql-generators/tables";
import { generateTriggerStatements } from "./sql-generators/triggers";
import { generateViewStatements } from "./sql-generators/views";
import { sortByPriority } from "./topological-sort";

export interface MigrationStatement {
  sql: string;
  priority: number;
  isDestructive: boolean;
  description: string;
}

export interface MigrationResult {
  statements: string[];
  warnings: MigrationStatement[];
  allStatements: MigrationStatement[];
}

export interface GenerateMigrationOptions {
  includeDestructive?: boolean;
}

export function generateMigration(
  diff: SchemaDiff,
  options: GenerateMigrationOptions = {},
): MigrationResult {
  const { includeDestructive = false } = options;

  if (!diff.hasDifferences) {
    return { statements: [], warnings: [], allStatements: [] };
  }

  const allStatements: MigrationStatement[] = [
    ...generateExtensionStatements(diff),
    ...generateEnumStatements(diff),
    ...generateSequenceStatements(diff),
    ...generateTableStatements(diff),
    ...generateColumnStatements(diff),
    ...generateConstraintStatements(diff),
    ...generateIndexStatements(diff),
    ...generateViewStatements(diff),
    ...generateFunctionStatements(diff),
    ...generateTriggerStatements(diff),
    ...generatePolicyStatements(diff),
    ...generateDomainStatements(diff),
    ...generateCollationStatements(diff),
    ...generatePrivilegeStatements(diff),
  ];

  const sorted = sortByPriority(allStatements);

  const warnings = sorted.filter((s) => s.isDestructive && !includeDestructive);
  const statements = includeDestructive
    ? sorted.map((s) => s.sql)
    : sorted.filter((s) => !s.isDestructive).map((s) => s.sql);

  return { statements, warnings, allStatements: sorted };
}
