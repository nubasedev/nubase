import type { MigrationStatement } from "./generate-migration";

export function sortByPriority(
  statements: MigrationStatement[],
): MigrationStatement[] {
  return [...statements].sort((a, b) => a.priority - b.priority);
}
