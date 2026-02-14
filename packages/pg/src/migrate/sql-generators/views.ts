import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateViewStatements(diff: SchemaDiff): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  // Regular views
  for (const [key, view] of Object.entries(diff.views.added)) {
    const qName = qualifiedName(view.schema, view.name);
    statements.push({
      sql: `CREATE VIEW ${qName} AS ${view.definition}`,
      priority: 170,
      isDestructive: false,
      description: `Create view ${key}`,
    });
  }

  for (const [key, view] of Object.entries(diff.views.removed)) {
    const qName = qualifiedName(view.schema, view.name);
    statements.push({
      sql: `DROP VIEW ${qName};`,
      priority: 40,
      isDestructive: true,
      description: `Drop view ${key}`,
    });
  }

  for (const [key, { to }] of Object.entries(diff.views.modified)) {
    const qName = qualifiedName(to.schema, to.name);
    statements.push({
      sql: `CREATE OR REPLACE VIEW ${qName} AS ${to.definition}`,
      priority: 170,
      isDestructive: false,
      description: `Replace view ${key}`,
    });
  }

  // Materialized views
  for (const [key, view] of Object.entries(diff.materializedViews.added)) {
    const qName = qualifiedName(view.schema, view.name);
    statements.push({
      sql: `CREATE MATERIALIZED VIEW ${qName} AS ${view.definition};`,
      priority: 170,
      isDestructive: false,
      description: `Create materialized view ${key}`,
    });
  }

  for (const [key, view] of Object.entries(diff.materializedViews.removed)) {
    const qName = qualifiedName(view.schema, view.name);
    statements.push({
      sql: `DROP MATERIALIZED VIEW ${qName};`,
      priority: 40,
      isDestructive: true,
      description: `Drop materialized view ${key}`,
    });
  }

  for (const [key, { to }] of Object.entries(diff.materializedViews.modified)) {
    const qName = qualifiedName(to.schema, to.name);
    statements.push({
      sql: `DROP MATERIALIZED VIEW ${qName};`,
      priority: 40,
      isDestructive: true,
      description: `Drop materialized view ${key} (for recreation)`,
    });
    statements.push({
      sql: `CREATE MATERIALIZED VIEW ${qName} AS ${to.definition};`,
      priority: 170,
      isDestructive: false,
      description: `Recreate materialized view ${key}`,
    });
  }

  return statements;
}
