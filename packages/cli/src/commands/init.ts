import fs from "node:fs";
import path from "node:path";
import { log } from "../output/logger.js";

const CONFIG_CONTENT = `import { defineConfig } from "@nubase/cli";

export default defineConfig({
  environments: {
    local: {
      url: process.env.DATABASE_URL!,
    },
  },
  defaultEnvironment: "local",
  schemas: ["public"],
});
`;

const GITIGNORE_CONTENT = "snapshots/\n";

export async function init(): Promise<void> {
  const nubaseDir = path.join(process.cwd(), "nubase");

  if (fs.existsSync(nubaseDir)) {
    log.error(
      "A nubase/ directory already exists in this project. Aborting.",
    );
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(nubaseDir, { recursive: true });
  fs.writeFileSync(
    path.join(nubaseDir, "nubase.config.ts"),
    CONFIG_CONTENT,
    "utf-8",
  );
  fs.writeFileSync(
    path.join(nubaseDir, ".gitignore"),
    GITIGNORE_CONTENT,
    "utf-8",
  );

  const migrationsDir = path.join(nubaseDir, "migrations");
  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.writeFileSync(path.join(migrationsDir, ".gitkeep"), "", "utf-8");

  const snapshotsDir = path.join(nubaseDir, "snapshots");
  fs.mkdirSync(snapshotsDir, { recursive: true });
  fs.writeFileSync(path.join(snapshotsDir, ".gitkeep"), "", "utf-8");

  log.success("Initialized nubase/ directory");
  log.step("Created nubase/nubase.config.ts");
  log.step("Created nubase/migrations/");
  log.step("Created nubase/snapshots/");
  log.dim(
    "\nSet the DATABASE_URL environment variable, then run: npx nubase db pull",
  );
}
