import type { ColumnModification, SchemaDiff, TableDiff } from "../types/diff";
import type { PgColumn, PgSchema, PgTable } from "../types/schema";
import * as cmp from "./comparators";
import { diffObjectSets, hasChanges } from "./object-diff";

export function diffSchemas(from: PgSchema, to: PgSchema): SchemaDiff {
  // Diff top-level objects
  const enums = diffObjectSets(from.enums, to.enums, cmp.enumsEqual);
  const sequences = diffObjectSets(
    from.sequences,
    to.sequences,
    cmp.sequencesEqual,
  );
  const views = diffObjectSets(from.views, to.views, cmp.viewsEqual);
  const materializedViews = diffObjectSets(
    from.materializedViews,
    to.materializedViews,
    cmp.materializedViewsEqual,
  );
  const functions = diffObjectSets(
    from.functions,
    to.functions,
    cmp.functionsEqual,
  );
  const triggers = diffObjectSets(
    from.triggers,
    to.triggers,
    cmp.triggersEqual,
  );
  const extensions = diffObjectSets(
    from.extensions,
    to.extensions,
    cmp.extensionsEqual,
  );
  const domains = diffObjectSets(from.domains, to.domains, cmp.domainsEqual);
  const collations = diffObjectSets(
    from.collations,
    to.collations,
    cmp.collationsEqual,
  );
  const policies = diffObjectSets(
    from.policies,
    to.policies,
    cmp.policiesEqual,
  );
  const privileges = diffObjectSets(
    from.privileges,
    to.privileges,
    cmp.privilegesEqual,
  );

  // Diff tables (special handling for internal diffs)
  const tablesAdded: Record<string, PgTable> = {};
  const tablesRemoved: Record<string, PgTable> = {};
  const tablesModified: Record<string, TableDiff> = {};

  for (const [key, table] of Object.entries(from.tables)) {
    const toTable = to.tables[key];
    if (!toTable) {
      tablesRemoved[key] = table;
    } else {
      const tableDiff = diffTable(table, toTable);
      if (tableDiff) {
        tablesModified[key] = tableDiff;
      }
    }
  }

  for (const [key, table] of Object.entries(to.tables)) {
    if (!from.tables[key]) {
      tablesAdded[key] = table;
    }
  }

  const tables = {
    added: tablesAdded,
    removed: tablesRemoved,
    modified: tablesModified,
  };

  const hasDifferences =
    Object.keys(tables.added).length > 0 ||
    Object.keys(tables.removed).length > 0 ||
    Object.keys(tables.modified).length > 0 ||
    hasChanges(enums) ||
    hasChanges(sequences) ||
    hasChanges(views) ||
    hasChanges(materializedViews) ||
    hasChanges(functions) ||
    hasChanges(triggers) ||
    hasChanges(extensions) ||
    hasChanges(domains) ||
    hasChanges(collations) ||
    hasChanges(policies) ||
    hasChanges(privileges);

  return {
    hasDifferences,
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

function diffTable(from: PgTable, to: PgTable): TableDiff | null {
  // Diff columns
  const columnsAdded: Record<string, PgColumn> = {};
  const columnsRemoved: Record<string, PgColumn> = {};
  const columnsModified: Record<string, ColumnModification> = {};

  for (const [name, col] of Object.entries(from.columns)) {
    const toCol = to.columns[name];
    if (!toCol) {
      columnsRemoved[name] = col;
    } else if (!cmp.columnsEqual(col, toCol)) {
      const changedProperties = (
        Object.keys(col) as Array<keyof PgColumn>
      ).filter(
        (key) => JSON.stringify(col[key]) !== JSON.stringify(toCol[key]),
      );
      columnsModified[name] = { from: col, to: toCol, changedProperties };
    }
  }

  for (const [name, col] of Object.entries(to.columns)) {
    if (!from.columns[name]) {
      columnsAdded[name] = col;
    }
  }

  const constraints = diffObjectSets(
    from.constraints,
    to.constraints,
    cmp.constraintsEqual,
  );
  const indexes = diffObjectSets(from.indexes, to.indexes, cmp.indexesEqual);
  const rlsChanged =
    from.rlsEnabled !== to.rlsEnabled || from.rlsForced !== to.rlsForced;

  const hasTableChanges =
    Object.keys(columnsAdded).length > 0 ||
    Object.keys(columnsRemoved).length > 0 ||
    Object.keys(columnsModified).length > 0 ||
    hasChanges(constraints) ||
    hasChanges(indexes) ||
    rlsChanged;

  if (!hasTableChanges) return null;

  return {
    from,
    to,
    columns: {
      added: columnsAdded,
      removed: columnsRemoved,
      modified: columnsModified,
    },
    constraints,
    indexes,
    rlsChanged,
  };
}
