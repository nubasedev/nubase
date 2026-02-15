import { mkdirSync } from "node:fs";
import path from "node:path";
import { writeMigrationFile } from "../db/migration-files.js";
import { findProjectRoot } from "../config/find-project-root.js";
import { log } from "../output/logger.js";

export async function migrationNew(name: string): Promise<void> {
  const projectRoot = findProjectRoot();
  const migrationsDir = path.join(projectRoot, "migrations");
  mkdirSync(migrationsDir, { recursive: true });

  const header = `-- Migration: ${name}\n\n`;
  const filePath = writeMigrationFile(migrationsDir, name, header);

  log.success(`Created migration: ${path.relative(process.cwd(), filePath)}`);
}
