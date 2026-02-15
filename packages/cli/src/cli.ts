#!/usr/bin/env node

import { Command } from "commander";
import { log } from "./output/logger.js";

const program = new Command();

program
  .name("nubase")
  .description("Nubase CLI — database schema management")
  .version("0.1.0");

const db = program
  .command("db")
  .description("Database commands");

db.command("diff")
  .description("Show differences between snapshot and live database")
  .option("--env <name>", "Target environment")
  .option("-f, --file <name>", "Generate a migration file with this name")
  .action(async (options) => {
    try {
      const { dbDiff } = await import("./commands/db-diff.js");
      await dbDiff(options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

db.command("push")
  .description("Apply pending migrations to the database")
  .option("--env <name>", "Target environment")
  .option("--dry-run", "Show pending migrations without applying")
  .option("--yes", "Skip confirmation prompt")
  .action(async (options) => {
    try {
      const { dbPush } = await import("./commands/db-push.js");
      await dbPush(options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

db.command("pull")
  .description("Extract schema from database and save as snapshot")
  .option("--env <name>", "Target environment")
  .action(async (options) => {
    try {
      const { dbPull } = await import("./commands/db-pull.js");
      await dbPull(options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

db.command("reset")
  .description("Drop and recreate schema, then replay all migrations")
  .option("--env <name>", "Target environment")
  .option("--force", "Allow reset on non-local environments")
  .option("--yes", "Skip confirmation prompt")
  .action(async (options) => {
    try {
      const { dbReset } = await import("./commands/db-reset.js");
      await dbReset(options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

program
  .command("migration")
  .description("Migration commands")
  .command("new")
  .description("Create a new empty migration file")
  .argument("<name>", "Migration name")
  .action(async (name) => {
    try {
      const { migrationNew } = await import("./commands/migration-new.js");
      await migrationNew(name);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

program.parse();
