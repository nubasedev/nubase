import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function qualifiedName(schema: string, name: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(name)}`;
}

export function generateDomainStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, domain] of Object.entries(diff.domains.added)) {
    const qName = qualifiedName(domain.schema, domain.name);
    let sql = `CREATE DOMAIN ${qName} AS ${domain.dataType}`;
    if (domain.defaultValue !== null) sql += ` DEFAULT ${domain.defaultValue}`;
    if (!domain.isNullable) sql += " NOT NULL";
    for (const check of domain.checkConstraints) {
      sql += ` CONSTRAINT ${quoteIdent(check.name)} ${check.expression}`;
    }
    sql += ";";

    statements.push({
      sql,
      priority: 115,
      isDestructive: false,
      description: `Create domain ${key}`,
    });
  }

  for (const [key, domain] of Object.entries(diff.domains.removed)) {
    const qName = qualifiedName(domain.schema, domain.name);
    statements.push({
      sql: `DROP DOMAIN ${qName};`,
      priority: 88,
      isDestructive: true,
      description: `Drop domain ${key}`,
    });
  }

  for (const [key, { from, to }] of Object.entries(diff.domains.modified)) {
    const qName = qualifiedName(to.schema, to.name);

    if (from.defaultValue !== to.defaultValue) {
      if (to.defaultValue !== null) {
        statements.push({
          sql: `ALTER DOMAIN ${qName} SET DEFAULT ${to.defaultValue};`,
          priority: 115,
          isDestructive: false,
          description: `Set default for domain ${key}`,
        });
      } else {
        statements.push({
          sql: `ALTER DOMAIN ${qName} DROP DEFAULT;`,
          priority: 115,
          isDestructive: false,
          description: `Drop default for domain ${key}`,
        });
      }
    }

    if (from.isNullable !== to.isNullable) {
      statements.push({
        sql: `ALTER DOMAIN ${qName} ${to.isNullable ? "DROP NOT NULL" : "SET NOT NULL"};`,
        priority: 115,
        isDestructive: false,
        description: `${to.isNullable ? "Allow" : "Disallow"} NULL for domain ${key}`,
      });
    }

    // Handle check constraint changes
    const fromChecks = new Set(from.checkConstraints.map((c) => c.name));
    const toChecks = new Set(to.checkConstraints.map((c) => c.name));

    for (const check of from.checkConstraints) {
      if (!toChecks.has(check.name)) {
        statements.push({
          sql: `ALTER DOMAIN ${qName} DROP CONSTRAINT ${quoteIdent(check.name)};`,
          priority: 88,
          isDestructive: true,
          description: `Drop constraint ${check.name} from domain ${key}`,
        });
      }
    }

    for (const check of to.checkConstraints) {
      if (!fromChecks.has(check.name)) {
        statements.push({
          sql: `ALTER DOMAIN ${qName} ADD CONSTRAINT ${quoteIdent(check.name)} ${check.expression};`,
          priority: 115,
          isDestructive: false,
          description: `Add constraint ${check.name} to domain ${key}`,
        });
      }
    }
  }

  return statements;
}
