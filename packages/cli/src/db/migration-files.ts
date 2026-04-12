import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface MigrationFile {
  name: string;
  filename: string;
  filePath: string;
}

export function listMigrationFiles(migrationsDir: string): MigrationFile[] {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".ts"))
    .sort();

  return files.map((filename) => {
    const filePath = path.join(migrationsDir, filename);
    return {
      name: filename.replace(/\.ts$/, ""),
      filename,
      filePath,
    };
  });
}

export function generateTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

/**
 * Escape SQL for use inside a tagged template literal.
 * Backticks become \` and ${ becomes \${ to avoid template interpolation.
 */
function escapeSqlForTemplate(sql: string): string {
  return sql.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

/**
 * Generate a Kysely migration file wrapping raw SQL.
 */
function buildMigrationTs(sql: string): string {
  const escaped = escapeSqlForTemplate(sql);
  return `import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql\`${escaped}\`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // TODO: implement down migration
}
`;
}

/**
 * Generate an empty Kysely migration file.
 */
function buildEmptyMigrationTs(name: string): string {
  return `import type { Kysely } from "kysely";

// Migration: ${name}

export async function up(db: Kysely<any>): Promise<void> {
  // TODO: implement migration
}

export async function down(db: Kysely<any>): Promise<void> {
  // TODO: implement rollback
}
`;
}

export function writeMigrationFile(
  migrationsDir: string,
  name: string,
  sql: string,
): string {
  const timestamp = generateTimestamp();
  const filename = `${timestamp}_${name}.ts`;
  const filePath = path.join(migrationsDir, filename);
  const content = buildMigrationTs(sql);
  writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export function writeEmptyMigrationFile(
  migrationsDir: string,
  name: string,
): string {
  const timestamp = generateTimestamp();
  const filename = `${timestamp}_${name}.ts`;
  const filePath = path.join(migrationsDir, filename);
  const content = buildEmptyMigrationTs(name);
  writeFileSync(filePath, content, "utf-8");
  return filePath;
}
