import { existsSync } from "node:fs";
import path from "node:path";

const CONFIG_FILENAME = "nubase.config.ts";
const NUBASE_DIR = "nubase";

export function findProjectRoot(startDir: string = process.cwd()): string {
  let current = path.resolve(startDir);

  while (true) {
    const nubaseDir = path.join(current, NUBASE_DIR);
    const configFile = path.join(nubaseDir, CONFIG_FILENAME);

    if (existsSync(configFile)) {
      return nubaseDir;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(
        `Could not find ${NUBASE_DIR}/${CONFIG_FILENAME}. Run this command from within a Nubase project.`,
      );
    }
    current = parent;
  }
}
