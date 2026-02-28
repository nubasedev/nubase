#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

interface CreateOptions {
  url?: string;
  workspace?: string;
  token?: string;
  skipInstall?: boolean;
}

const program = new Command();

program
  .name("@nubase/create")
  .description("Create a new Nubase app")
  .argument("[project-name]", "Project name (kebab-case)")
  .option("--url <url>", "Server URL")
  .option("--workspace <slug>", "Workspace slug")
  .option("--token <token>", "API token")
  .option("--skip-install", "Skip npm install")
  .action(
    async (projectNameArg: string | undefined, options: CreateOptions) => {
      try {
        await create(projectNameArg, options);
      } catch (error) {
        if (error instanceof Error && error.message === "cancelled") {
          console.log(chalk.dim("\nCancelled."));
          process.exit(0);
        }
        console.error(
          chalk.red("✗"),
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    },
  );

program.parse();

async function create(
  projectNameArg: string | undefined,
  options: CreateOptions,
): Promise<void> {
  console.log();
  console.log(chalk.bold("Create a new Nubase app"));
  console.log();

  // 1. Project name
  const projectName = projectNameArg ?? (await promptProjectName());

  if (!/^[a-z][a-z0-9-]*$/.test(projectName)) {
    throw new Error(
      "Project name must be kebab-case (lowercase letters, numbers, and hyphens)",
    );
  }

  const projectDir = path.resolve(process.cwd(), projectName);

  if (existsSync(projectDir)) {
    throw new Error(`Directory "${projectName}" already exists`);
  }

  // 2. Server URL
  const url =
    options.url ??
    (
      await prompts({
        type: "text",
        name: "value",
        message: "Server URL",
        initial: "http://localhost:3001",
      })
    ).value;

  if (!url) throw new Error("cancelled");

  // 3. Workspace slug
  const workspace =
    options.workspace ??
    (
      await prompts({
        type: "text",
        name: "value",
        message: "Workspace slug",
        validate: (v: string) =>
          /^[a-z][a-z0-9-]*$/.test(v) ? true : "Must be kebab-case",
      })
    ).value;

  if (!workspace) throw new Error("cancelled");

  if (!/^[a-z][a-z0-9-]*$/.test(workspace)) {
    throw new Error(
      "Workspace slug must be kebab-case (lowercase letters, numbers, and hyphens)",
    );
  }

  // 4. API token (optional)
  const token =
    options.token ??
    (
      await prompts({
        type: "text",
        name: "value",
        message: "API token (optional, press Enter to skip)",
      })
    ).value;

  // Create project directory
  mkdirSync(projectDir, { recursive: true });

  console.log();
  console.log(chalk.cyan("→"), "Scaffolding project...");

  // Copy and interpolate templates
  copyTemplate("package.json.template", projectDir, "package.json", {
    __PROJECT_NAME__: projectName,
  });
  copyTemplate("tsconfig.json.template", projectDir, "tsconfig.json", {});
  copyTemplate("nubase.config.ts.template", projectDir, "nubase.config.ts", {});
  copyTemplate("gitignore.template", projectDir, ".gitignore", {});

  // Create src directory and index.ts
  mkdirSync(path.join(projectDir, "src"), { recursive: true });
  copyTemplate("src/index.ts.template", projectDir, "src/index.ts", {});

  // Create .nubase/remotes.json
  mkdirSync(path.join(projectDir, ".nubase"), { recursive: true });
  const remotesConfig = {
    active: "origin",
    remotes: {
      origin: {
        url,
        workspace,
        ...(token ? { token } : {}),
      },
    },
  };
  writeFileSync(
    path.join(projectDir, ".nubase", "remotes.json"),
    `${JSON.stringify(remotesConfig, null, 2)}\n`,
    "utf-8",
  );

  console.log(chalk.green("✓"), "Project scaffolded");

  // Install dependencies
  if (!options.skipInstall) {
    console.log(chalk.cyan("→"), "Installing dependencies...");
    execSync("npm install", { cwd: projectDir, stdio: "inherit" });
    console.log(chalk.green("✓"), "Dependencies installed");
  }

  // Print next steps
  console.log();
  console.log(chalk.bold("Next steps:"));
  console.log();
  console.log(`  cd ${projectName}`);
  console.log("  npx nubase pull    # Generate types from server");
  console.log("  # Start building your app in src/index.ts");
  console.log();
}

async function promptProjectName(): Promise<string> {
  const response = await prompts({
    type: "text",
    name: "value",
    message: "Project name",
    validate: (v: string) =>
      /^[a-z][a-z0-9-]*$/.test(v) ? true : "Must be kebab-case",
  });
  if (!response.value) throw new Error("cancelled");
  return response.value;
}

function copyTemplate(
  templatePath: string,
  projectDir: string,
  outputPath: string,
  replacements: Record<string, string>,
): void {
  const sourcePath = path.join(TEMPLATES_DIR, templatePath);
  let content = readFileSync(sourcePath, "utf-8");

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(key, value);
  }

  const destPath = path.join(projectDir, outputPath);
  const destDir = path.dirname(destPath);
  mkdirSync(destDir, { recursive: true });
  writeFileSync(destPath, content, "utf-8");
}
