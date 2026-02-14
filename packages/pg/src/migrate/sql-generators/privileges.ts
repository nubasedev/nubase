import type { SchemaDiff } from "../../types/diff";
import type { MigrationStatement } from "../generate-migration";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export function generatePrivilegeStatements(
  diff: SchemaDiff,
): MigrationStatement[] {
  const statements: MigrationStatement[] = [];

  for (const [key, priv] of Object.entries(diff.privileges.added)) {
    const privList = priv.privileges.join(", ");
    let sql = `GRANT ${privList} ON ${priv.objectType} ${priv.objectName} TO ${quoteIdent(priv.grantee)}`;
    if (priv.withGrantOption) sql += " WITH GRANT OPTION";
    sql += ";";

    statements.push({
      sql,
      priority: 250,
      isDestructive: false,
      description: `Grant privileges on ${key}`,
    });
  }

  for (const [key, priv] of Object.entries(diff.privileges.removed)) {
    const privList = priv.privileges.join(", ");
    statements.push({
      sql: `REVOKE ${privList} ON ${priv.objectType} ${priv.objectName} FROM ${quoteIdent(priv.grantee)};`,
      priority: 260,
      isDestructive: true,
      description: `Revoke privileges on ${key}`,
    });
  }

  for (const [key, { from, to }] of Object.entries(diff.privileges.modified)) {
    // Revoke old, grant new
    const oldPrivList = from.privileges.join(", ");
    statements.push({
      sql: `REVOKE ${oldPrivList} ON ${from.objectType} ${from.objectName} FROM ${quoteIdent(from.grantee)};`,
      priority: 260,
      isDestructive: true,
      description: `Revoke old privileges on ${key}`,
    });

    const newPrivList = to.privileges.join(", ");
    let sql = `GRANT ${newPrivList} ON ${to.objectType} ${to.objectName} TO ${quoteIdent(to.grantee)}`;
    if (to.withGrantOption) sql += " WITH GRANT OPTION";
    sql += ";";

    statements.push({
      sql,
      priority: 250,
      isDestructive: false,
      description: `Grant new privileges on ${key}`,
    });
  }

  return statements;
}
