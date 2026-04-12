import { readdirSync } from "node:fs";
import path from "node:path";
import type { Migration, MigrationProvider } from "kysely";
import { createJiti } from "jiti";

export class NubaseMigrationProvider implements MigrationProvider {
  readonly #migrationsDir: string;

  constructor(migrationsDir: string) {
    this.#migrationsDir = migrationsDir;
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    const files = readdirSync(this.#migrationsDir)
      .filter((f) => f.endsWith(".ts"))
      .sort();

    const jiti = createJiti(this.#migrationsDir);
    const migrations: Record<string, Migration> = {};

    for (const filename of files) {
      const filePath = path.join(this.#migrationsDir, filename);
      const mod = (await jiti.import(filePath)) as Record<string, unknown>;

      if (typeof mod.up !== "function") {
        continue;
      }

      const key = filename.replace(/\.ts$/, "");
      migrations[key] = mod as unknown as Migration;
    }

    return migrations;
  }
}
