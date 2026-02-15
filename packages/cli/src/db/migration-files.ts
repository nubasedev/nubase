import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface MigrationFile {
  name: string;
  filename: string;
  filePath: string;
  sql: string;
}

export function listMigrationFiles(migrationsDir: string): MigrationFile[] {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.map((filename) => {
    const filePath = path.join(migrationsDir, filename);
    return {
      name: filename.replace(/\.sql$/, ""),
      filename,
      filePath,
      sql: readFileSync(filePath, "utf-8"),
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

export function writeMigrationFile(
  migrationsDir: string,
  name: string,
  sql: string,
): string {
  const timestamp = generateTimestamp();
  const filename = `${timestamp}_${name}.sql`;
  const filePath = path.join(migrationsDir, filename);
  writeFileSync(filePath, sql, "utf-8");
  return filePath;
}
