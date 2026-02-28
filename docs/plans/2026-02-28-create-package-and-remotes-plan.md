# @nubase/create Repurpose + Remotes + Testing Architecture — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repurpose `@nubase/create` as a minimal app scaffolder, add a git-like remote system to `@nubase/cli`, and establish a two-layer testing architecture with a workspace-linked example and e2e verification via npm pack.

**Architecture:** Remote management lives in `@nubase/cli` with data stored in `.nubase/remotes.json` (gitignored). `@nubase/create` scaffolds minimal apps and writes the initial remotes file. `examples/nubase-example-app/` is workspace-linked for continuous regression. A CI e2e test verifies the create-to-working-app flow using npm pack tarballs.

**Tech Stack:** TypeScript, Commander.js, prompts, chalk, fs-extra, Vitest, tsup, npm workspaces

**Design doc:** `docs/plans/2026-02-28-create-package-and-remotes-design.md`

---

### Task 1: Remote Types and File Management

**Files:**
- Create: `packages/cli/src/remotes/types.ts`
- Create: `packages/cli/src/remotes/remotes-file.ts`
- Create: `packages/cli/src/remotes/remotes-file.test.ts`

**Step 1: Write the failing tests**

Create `packages/cli/src/remotes/remotes-file.test.ts`:

```ts
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  loadRemotes,
  saveRemotes,
  getActiveRemote,
  addRemote,
  removeRemote,
  setActiveRemote,
} from "./remotes-file.js";
import type { RemotesConfig } from "./types.js";

describe("remotes-file", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), "nubase-remotes-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("loadRemotes", () => {
    it("returns empty config when file does not exist", () => {
      const result = loadRemotes(tmpDir);
      expect(result).toEqual({ active: null, remotes: {} });
    });

    it("loads existing remotes file", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      saveRemotes(tmpDir, config);
      const result = loadRemotes(tmpDir);
      expect(result).toEqual(config);
    });
  });

  describe("addRemote", () => {
    it("adds a remote and sets it as active if first", () => {
      const config = addRemote(
        { active: null, remotes: {} },
        "origin",
        { url: "http://localhost:3001", workspace: "tavern" },
      );
      expect(config.active).toBe("origin");
      expect(config.remotes.origin).toEqual({
        url: "http://localhost:3001",
        workspace: "tavern",
      });
    });

    it("adds a second remote without changing active", () => {
      let config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      config = addRemote(config, "staging", {
        url: "https://staging.example.com",
        workspace: "tavern-staging",
      });
      expect(config.active).toBe("origin");
      expect(config.remotes.staging).toBeDefined();
    });

    it("throws if remote name already exists", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      expect(() =>
        addRemote(config, "origin", { url: "http://other.com", workspace: "x" }),
      ).toThrow('Remote "origin" already exists');
    });
  });

  describe("removeRemote", () => {
    it("removes a remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
          staging: { url: "https://staging.example.com", workspace: "tavern-staging" },
        },
      };
      const result = removeRemote(config, "staging");
      expect(result.remotes.staging).toBeUndefined();
      expect(result.active).toBe("origin");
    });

    it("clears active if removing the active remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      const result = removeRemote(config, "origin");
      expect(result.active).toBeNull();
      expect(result.remotes.origin).toBeUndefined();
    });

    it("throws if remote does not exist", () => {
      expect(() =>
        removeRemote({ active: null, remotes: {} }, "origin"),
      ).toThrow('Remote "origin" does not exist');
    });
  });

  describe("setActiveRemote", () => {
    it("sets the active remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
          staging: { url: "https://staging.example.com", workspace: "tavern-staging" },
        },
      };
      const result = setActiveRemote(config, "staging");
      expect(result.active).toBe("staging");
    });

    it("throws if remote does not exist", () => {
      expect(() =>
        setActiveRemote({ active: null, remotes: {} }, "origin"),
      ).toThrow('Remote "origin" does not exist');
    });
  });

  describe("getActiveRemote", () => {
    it("returns the active remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      const result = getActiveRemote(config);
      expect(result).toEqual({
        name: "origin",
        url: "http://localhost:3001",
        workspace: "tavern",
      });
    });

    it("throws if no active remote is set", () => {
      expect(() =>
        getActiveRemote({ active: null, remotes: {} }),
      ).toThrow("No active remote. Run `nubase remote add` to add one.");
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/cli && npx vitest run src/remotes/remotes-file.test.ts`
Expected: FAIL — modules don't exist yet

**Step 3: Create the types file**

Create `packages/cli/src/remotes/types.ts`:

```ts
export interface RemoteConfig {
  url: string;
  workspace: string;
  token?: string;
}

export interface RemotesConfig {
  active: string | null;
  remotes: Record<string, RemoteConfig>;
}
```

**Step 4: Create the remotes file management module**

Create `packages/cli/src/remotes/remotes-file.ts`:

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RemoteConfig, RemotesConfig } from "./types.js";

const REMOTES_DIR = ".nubase";
const REMOTES_FILE = "remotes.json";

function remotesPath(projectRoot: string): string {
  return path.join(projectRoot, REMOTES_DIR, REMOTES_FILE);
}

export function loadRemotes(projectRoot: string): RemotesConfig {
  const filePath = remotesPath(projectRoot);
  if (!existsSync(filePath)) {
    return { active: null, remotes: {} };
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as RemotesConfig;
}

export function saveRemotes(
  projectRoot: string,
  config: RemotesConfig,
): void {
  const dirPath = path.join(projectRoot, REMOTES_DIR);
  mkdirSync(dirPath, { recursive: true });
  const filePath = remotesPath(projectRoot);
  writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function addRemote(
  config: RemotesConfig,
  name: string,
  remote: RemoteConfig,
): RemotesConfig {
  if (config.remotes[name]) {
    throw new Error(`Remote "${name}" already exists`);
  }
  const remotes = { ...config.remotes, [name]: remote };
  const active = config.active ?? name;
  return { active, remotes };
}

export function removeRemote(
  config: RemotesConfig,
  name: string,
): RemotesConfig {
  if (!config.remotes[name]) {
    throw new Error(`Remote "${name}" does not exist`);
  }
  const { [name]: _, ...remotes } = config.remotes;
  const active = config.active === name ? null : config.active;
  return { active, remotes };
}

export function setActiveRemote(
  config: RemotesConfig,
  name: string,
): RemotesConfig {
  if (!config.remotes[name]) {
    throw new Error(`Remote "${name}" does not exist`);
  }
  return { ...config, active: name };
}

export function getActiveRemote(
  config: RemotesConfig,
): RemoteConfig & { name: string } {
  if (!config.active || !config.remotes[config.active]) {
    throw new Error(
      "No active remote. Run `nubase remote add` to add one.",
    );
  }
  return { name: config.active, ...config.remotes[config.active] };
}
```

**Step 5: Add vitest config to CLI package if not present**

Check if `packages/cli/package.json` has a `test` script. If not, add:
```json
"test": "vitest run"
```

Also ensure `vitest` is in devDependencies (it's in root, should be fine with workspace hoisting).

**Step 6: Run tests to verify they pass**

Run: `cd packages/cli && npx vitest run src/remotes/remotes-file.test.ts`
Expected: ALL PASS

**Step 7: Commit**

```bash
git add packages/cli/src/remotes/
git commit -m "feat(cli): add remote types and file management with tests"
```

---

### Task 2: Remote CLI Commands

**Files:**
- Create: `packages/cli/src/commands/remote-add.ts`
- Create: `packages/cli/src/commands/remote-remove.ts`
- Create: `packages/cli/src/commands/remote-use.ts`
- Create: `packages/cli/src/commands/remote-list.ts`
- Modify: `packages/cli/src/cli.ts`

**Step 1: Create `remote-add.ts`**

```ts
import { loadAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import { addRemote, loadRemotes, saveRemotes } from "../remotes/remotes-file.js";

interface RemoteAddOptions {
  url: string;
  workspace: string;
  token?: string;
}

export async function remoteAdd(
  name: string,
  options: RemoteAddOptions,
): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);

  const remote = {
    url: options.url,
    workspace: options.workspace,
    ...(options.token ? { token: options.token } : {}),
  };

  const updated = addRemote(config, name, remote);
  saveRemotes(projectRoot, updated);

  log.success(`Remote "${name}" added (${options.url}, workspace: ${options.workspace})`);
  if (updated.active === name) {
    log.dim(`  Set as active remote`);
  }
}
```

Note: `findAppProjectRoot` needs to be exported from `load-app-config.ts`. Currently it's a private function. We need to export it — see Step 5.

**Step 2: Create `remote-remove.ts`**

```ts
import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import { loadRemotes, removeRemote, saveRemotes } from "../remotes/remotes-file.js";

export async function remoteRemove(name: string): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);
  const updated = removeRemote(config, name);
  saveRemotes(projectRoot, updated);
  log.success(`Remote "${name}" removed`);
}
```

**Step 3: Create `remote-use.ts`**

```ts
import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import {
  loadRemotes,
  saveRemotes,
  setActiveRemote,
} from "../remotes/remotes-file.js";

export async function remoteUse(name: string): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);
  const updated = setActiveRemote(config, name);
  saveRemotes(projectRoot, updated);
  log.success(`Active remote set to "${name}"`);
}
```

**Step 4: Create `remote-list.ts`**

```ts
import chalk from "chalk";
import { findAppProjectRoot } from "../config/load-app-config.js";
import { log } from "../output/logger.js";
import { loadRemotes } from "../remotes/remotes-file.js";

export async function remoteList(): Promise<void> {
  const projectRoot = findAppProjectRoot();
  const config = loadRemotes(projectRoot);

  const names = Object.keys(config.remotes);
  if (names.length === 0) {
    log.info("No remotes configured. Run `nubase remote add` to add one.");
    return;
  }

  for (const name of names) {
    const remote = config.remotes[name];
    const isActive = name === config.active;
    const marker = isActive ? chalk.green("* ") : "  ";
    const label = isActive ? chalk.bold(name) : name;
    console.log(`${marker}${label}  ${remote.url}  (${remote.workspace})`);
  }
}
```

**Step 5: Export `findAppProjectRoot` from `load-app-config.ts`**

Modify `packages/cli/src/config/load-app-config.ts:70` — change `function` to `export function`:

```ts
// Before:
function findAppProjectRoot(startDir: string = process.cwd()): string {

// After:
export function findAppProjectRoot(startDir: string = process.cwd()): string {
```

**Step 6: Register remote commands in `cli.ts`**

Add this block to `packages/cli/src/cli.ts` after the `push` command registration (after line 124):

```ts
const remote = program
  .command("remote")
  .description("Manage remote Nubase servers");

remote
  .command("add")
  .description("Add a new remote")
  .argument("<name>", "Remote name (e.g. origin, staging)")
  .requiredOption("--url <url>", "Server URL")
  .requiredOption("--workspace <slug>", "Workspace slug")
  .option("--token <token>", "API token")
  .action(async (name, options) => {
    try {
      const { remoteAdd } = await import("./commands/remote-add.js");
      await remoteAdd(name, options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

remote
  .command("remove")
  .description("Remove a remote")
  .argument("<name>", "Remote name to remove")
  .action(async (name) => {
    try {
      const { remoteRemove } = await import("./commands/remote-remove.js");
      await remoteRemove(name);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

remote
  .command("use")
  .description("Set the active remote")
  .argument("<name>", "Remote name to activate")
  .action(async (name) => {
    try {
      const { remoteUse } = await import("./commands/remote-use.js");
      await remoteUse(name);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

remote
  .command("list")
  .description("List all remotes")
  .action(async () => {
    try {
      const { remoteList } = await import("./commands/remote-list.js");
      await remoteList();
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });
```

**Step 7: Build and verify**

Run: `cd packages/cli && npm run build`
Expected: Build succeeds

**Step 8: Commit**

```bash
git add packages/cli/src/commands/remote-*.ts packages/cli/src/cli.ts packages/cli/src/config/load-app-config.ts
git commit -m "feat(cli): add nubase remote add/remove/use/list commands"
```

---

### Task 3: Update pull/push to Use Remotes

**Files:**
- Modify: `packages/cli/src/commands/pull.ts`
- Modify: `packages/cli/src/commands/push.ts`
- Modify: `packages/cli/src/config/load-app-config.ts`
- Modify: `packages/cli/src/cli.ts`

**Step 1: Add `resolveRemote` helper to `load-app-config.ts`**

Add to `packages/cli/src/config/load-app-config.ts`, after the existing imports:

```ts
import { getActiveRemote, loadRemotes } from "../remotes/remotes-file.js";
import type { RemoteConfig } from "../remotes/types.js";
```

Add new exported function and update `ResolvedAppConfig`:

```ts
export interface ResolvedAppConfig {
  remote: RemoteConfig & { name: string };
  projectRoot: string;
  typesDir: string;
  entry: string;
}

export async function loadAppConfig(options?: {
  remote?: string;
}): Promise<ResolvedAppConfig> {
  const projectRoot = findAppProjectRoot();

  // Load .env from the project root
  dotenv.config({ path: path.join(projectRoot, ".env") });

  // Load nubase.config.ts for output/app settings
  const configPath = path.join(projectRoot, "nubase.config.ts");
  let output: { typesDir?: string } | undefined;
  let app: { entry?: string } | undefined;

  if (existsSync(configPath)) {
    const module = await jiti.import(configPath);
    const config = (
      module && typeof module === "object" && "default" in module
        ? module.default
        : module
    ) as { output?: { typesDir?: string }; app?: { entry?: string } };
    output = config.output;
    app = config.app;
  }

  // Resolve remote
  const remotesConfig = loadRemotes(projectRoot);
  let remote: RemoteConfig & { name: string };

  if (options?.remote) {
    const namedRemote = remotesConfig.remotes[options.remote];
    if (!namedRemote) {
      throw new Error(
        `Remote "${options.remote}" not found. Run \`nubase remote list\` to see available remotes.`,
      );
    }
    remote = { name: options.remote, ...namedRemote };
  } else {
    remote = getActiveRemote(remotesConfig);
  }

  const typesDir = path.join(
    projectRoot,
    output?.typesDir ?? ".nubase/types",
  );

  const entry = app?.entry ?? "src/index.ts";

  return { remote, projectRoot, typesDir, entry };
}
```

Remove the old `AppConfig` interface (no longer needed — config is simplified).

**Step 2: Update `pull.ts` to use remotes**

Replace `packages/cli/src/commands/pull.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateTypes } from "@nubase/sdk/codegen";
import type { SchemaMetadata } from "@nubase/sdk/codegen";
import { loadAppConfig } from "../config/load-app-config.js";
import { log } from "../output/logger.js";

export async function pull(options?: { remote?: string }): Promise<void> {
  log.step("Loading configuration...");
  const resolved = await loadAppConfig(options);

  const { remote, typesDir } = resolved;
  const schemaUrl = `${remote.url}/api/nubase/schema`;

  log.step(`Fetching schema from ${remote.name} (${schemaUrl})...`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (remote.token) {
    headers.Authorization = `Bearer ${remote.token}`;
  }

  const response = await fetch(schemaUrl, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.status} ${response.statusText}`,
    );
  }

  const schema: SchemaMetadata = await response.json();

  log.step("Generating types...");

  mkdirSync(typesDir, { recursive: true });

  const files = generateTypes(schema);

  for (const file of files) {
    const filePath = path.join(typesDir, file.path);
    writeFileSync(filePath, file.content, "utf-8");
    log.dim(`  ${file.path}`);
  }

  const metadataPath = path.join(
    path.dirname(typesDir),
    "schema-metadata.json",
  );
  writeFileSync(metadataPath, JSON.stringify(schema, null, 2), "utf-8");
  log.dim("  schema-metadata.json");

  const tableCount = Object.keys(schema.tables).length;
  const enumCount = Object.keys(schema.enums).length;

  log.success(
    `Generated types for ${tableCount} table${tableCount !== 1 ? "s" : ""} and ${enumCount} enum${enumCount !== 1 ? "s" : ""} in ${typesDir}`,
  );
}
```

**Step 3: Update `push.ts` to use remotes**

In `packages/cli/src/commands/push.ts`, change the destructuring and server references:

```ts
// Line 17 — change destructuring:
const resolved = await loadAppConfig(options);
const { remote, projectRoot, entry } = resolved;

// Line 96 — change deploy URL:
log.step(`Deploying to ${remote.name} (${remote.url})...`);
const deployUrl = `${remote.url}/api/nubase/apps/deploy`;

// Lines 99-104 — change token reference:
const headers: Record<string, string> = {
  "Content-Type": "application/json",
};
if (remote.token) {
  headers.Authorization = `Bearer ${remote.token}`;
}
```

Also update the function signature:
```ts
export async function push(options?: { remote?: string }): Promise<void> {
```

**Step 4: Add `--remote` flag to pull/push in `cli.ts`**

Update the pull command registration in `packages/cli/src/cli.ts`:

```ts
program
  .command("pull")
  .description("Fetch schema from Nubase server and generate TypeScript types")
  .option("--remote <name>", "Use a specific remote instead of the active one")
  .action(async (options) => {
    try {
      const { pull } = await import("./commands/pull.js");
      await pull(options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });
```

Same for push:

```ts
program
  .command("push")
  .description("Bundle and deploy app code to Nubase server")
  .option("--remote <name>", "Use a specific remote instead of the active one")
  .action(async (options) => {
    try {
      const { push } = await import("./commands/push.js");
      await push(options);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });
```

**Step 5: Build and verify**

Run: `cd packages/cli && npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add packages/cli/src/
git commit -m "feat(cli): update pull/push to use remotes with --remote flag"
```

---

### Task 4: Simplify @nubase/sdk Config

**Files:**
- Modify: `packages/sdk/src/config.ts`

**Step 1: Update `NubaseConfig` to remove server/workspace**

Replace `packages/sdk/src/config.ts`:

```ts
// @nubase/sdk/config — configuration for nubase app projects

export interface NubaseConfig {
  output?: {
    typesDir?: string;
  };
  app?: {
    entry?: string;
  };
}

/**
 * Define the configuration for a Nubase app project.
 * Used in `nubase.config.ts` at the root of the app project.
 *
 * @example
 * ```ts
 * import { defineConfig } from "@nubase/sdk/config";
 *
 * export default defineConfig({
 *   output: { typesDir: ".nubase/types" },
 *   app: { entry: "src/index.ts" },
 * });
 * ```
 */
export function defineConfig(config: NubaseConfig): NubaseConfig {
  return config;
}
```

**Step 2: Build and verify**

Run: `cd packages/sdk && npm run build && npm run typecheck`
Expected: Both pass

**Step 3: Commit**

```bash
git add packages/sdk/src/config.ts
git commit -m "feat(sdk): simplify NubaseConfig — remove server/workspace (now in remotes)"
```

---

### Task 5: Move Example App to examples/

**Files:**
- Move: `nubase-example-app/` → `examples/nubase-example-app/`
- Modify: `package.json` (root)
- Modify: `examples/nubase-example-app/package.json`
- Modify: `examples/nubase-example-app/nubase.config.ts`
- Create: `examples/nubase-example-app/.nubase/remotes.json`
- Create: `examples/nubase-example-app/.gitignore`

**Step 1: Move the directory**

```bash
mkdir -p examples
git mv nubase-example-app examples/nubase-example-app
```

**Step 2: Update root `package.json` workspaces**

In `/package.json`, change workspaces from:
```json
"workspaces": [
  "apps/docs",
  "apps/nubase/*",
  "packages/*"
]
```
To:
```json
"workspaces": [
  "apps/docs",
  "apps/nubase/*",
  "packages/*",
  "examples/*"
]
```

**Step 3: Update example app `package.json`**

Replace `examples/nubase-example-app/package.json`:

```json
{
  "name": "nubase-example-app",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "pull": "nubase pull",
    "push": "nubase push",
    "typecheck": "tsc --noEmit",
    "lint": "biome check ."
  },
  "dependencies": {
    "@nubase/sdk": "*"
  },
  "devDependencies": {
    "@nubase/cli": "*",
    "typescript": "^5.9.3"
  }
}
```

**Step 4: Update `nubase.config.ts`**

Replace `examples/nubase-example-app/nubase.config.ts`:

```ts
import { defineConfig } from "@nubase/sdk/config";

export default defineConfig({
  output: { typesDir: ".nubase/types" },
  app: { entry: "src/index.ts" },
});
```

**Step 5: Create `.nubase/remotes.json`**

Create `examples/nubase-example-app/.nubase/remotes.json`:

```json
{
  "active": "origin",
  "remotes": {
    "origin": {
      "url": "http://localhost:3001",
      "workspace": "tavern"
    }
  }
}
```

**Step 6: Create `.gitignore`**

Create `examples/nubase-example-app/.gitignore`:

```
node_modules
.nubase/types/
.nubase/remotes.json
.nubase/schema-metadata.json
```

Note: The `.nubase/remotes.json` we created in Step 5 is for development convenience — it will be gitignored going forward. We include it once so the example works out of the box for monorepo developers.

Actually, since `.gitignore` will ignore `remotes.json`, we need to either: (a) not gitignore it for the example (since it has no secrets), or (b) add setup instructions. Let's keep `remotes.json` committed for the example since it has no real tokens — remove `.nubase/remotes.json` from `.gitignore`:

```
node_modules
.nubase/types/
.nubase/schema-metadata.json
```

**Step 7: Run npm install and typecheck**

```bash
npm install
npm run typecheck
```

Expected: Both pass (Turbo should include the example app now)

**Step 8: Commit**

```bash
git add -A
git commit -m "refactor: move nubase-example-app to examples/ with workspace linking and remotes"
```

---

### Task 6: Create @nubase/create Package

**Files:**
- Create: `packages/create/package.json`
- Create: `packages/create/tsconfig.json`
- Create: `packages/create/src/index.ts`
- Create: `packages/create/templates/package.json.template`
- Create: `packages/create/templates/tsconfig.json.template`
- Create: `packages/create/templates/nubase.config.ts.template`
- Create: `packages/create/templates/src/index.ts.template`
- Create: `packages/create/templates/gitignore.template`

**Step 1: Create `packages/create/package.json`**

```json
{
  "name": "@nubase/create",
  "version": "0.1.29",
  "description": "Create a new Nubase app",
  "type": "module",
  "bin": {
    "nubase-create": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm --clean",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "test": "vitest run"
  },
  "dependencies": {
    "chalk": "^5.4.1",
    "commander": "^13.1.0",
    "fs-extra": "^11.3.0",
    "prompts": "^2.4.2"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/prompts": "^2.4.9",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

**Step 2: Create `packages/create/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create template files**

Create `packages/create/templates/package.json.template`:

```json
{
  "name": "__PROJECT_NAME__",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "pull": "nubase pull",
    "push": "nubase push",
    "typecheck": "tsc --noEmit",
    "lint": "biome check ."
  },
  "dependencies": {
    "@nubase/sdk": "^0.1.29"
  },
  "devDependencies": {
    "@nubase/cli": "^0.1.29",
    "@biomejs/biome": "^2.4.4",
    "typescript": "^5.9.3"
  }
}
```

Create `packages/create/templates/tsconfig.json.template`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*", ".nubase/**/*", "nubase.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Create `packages/create/templates/nubase.config.ts.template`:

```ts
import { defineConfig } from "@nubase/sdk/config";

export default defineConfig({
  output: { typesDir: ".nubase/types" },
  app: { entry: "src/index.ts" },
});
```

Create `packages/create/templates/src/index.ts.template`:

```ts
import { defineApp } from "@nubase/sdk";

export default defineApp({});
```

Create `packages/create/templates/gitignore.template`:

```
node_modules
.nubase/types/
.nubase/remotes.json
.nubase/schema-metadata.json
```

**Step 4: Create the main CLI script**

Create `packages/create/src/index.ts`:

```ts
#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { Command } from "commander";
import fsExtra from "fs-extra";
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
  .action(async (projectNameArg: string | undefined, options: CreateOptions) => {
    try {
      await create(projectNameArg, options);
    } catch (error) {
      if (error instanceof Error && error.message === "cancelled") {
        console.log(chalk.dim("\nCancelled."));
        process.exit(0);
      }
      console.error(chalk.red("✗"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

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
          /^[a-z][a-z0-9-]*$/.test(v)
            ? true
            : "Must be kebab-case",
      })
    ).value;

  if (!workspace) throw new Error("cancelled");

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
  copyTemplate(
    "nubase.config.ts.template",
    projectDir,
    "nubase.config.ts",
    {},
  );
  copyTemplate("gitignore.template", projectDir, ".gitignore", {});

  // Create src directory and index.ts
  mkdirSync(path.join(projectDir, "src"), { recursive: true });
  copyTemplate(
    "src/index.ts.template",
    projectDir,
    "src/index.ts",
    {},
  );

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
    JSON.stringify(remotesConfig, null, 2) + "\n",
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
```

**Step 5: Build**

```bash
npm install
cd packages/create && npm run build
```

Expected: Build succeeds

**Step 6: Verify typecheck and lint across the monorepo**

```bash
npm run typecheck
npm run lint:fix
```

**Step 7: Commit**

```bash
git add packages/create/ package.json
git commit -m "feat: add @nubase/create package for scaffolding minimal Nubase apps"
```

---

### Task 7: E2E Test for @nubase/create

**Files:**
- Create: `packages/create/e2e/create-app.sh`
- Modify: root `package.json` (add `e2e:create` script)

**Step 1: Create the e2e test script**

Create `packages/create/e2e/create-app.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== @nubase/create E2E Test ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "→ Building packages..."
cd "$REPO_ROOT"
npm run build --workspace=@nubase/sdk
npm run build --workspace=@nubase/cli
npm run build --workspace=@nubase/create

echo ""
echo "→ Packing @nubase/sdk..."
SDK_TARBALL=$(cd packages/sdk && npm pack --pack-destination "$TEMP_DIR" 2>/dev/null | tail -1)

echo "→ Packing @nubase/cli..."
CLI_TARBALL=$(cd packages/cli && npm pack --pack-destination "$TEMP_DIR" 2>/dev/null | tail -1)

echo ""
echo "→ Scaffolding test app..."
node packages/create/dist/index.js "$TEMP_DIR/test-app" \
  --url http://localhost:3001 \
  --workspace test \
  --skip-install

echo ""
echo "→ Patching package.json to use tarballs..."
cd "$TEMP_DIR/test-app"

# Use node to patch package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.dependencies['@nubase/sdk'] = 'file:$TEMP_DIR/$SDK_TARBALL';
pkg.devDependencies['@nubase/cli'] = 'file:$TEMP_DIR/$CLI_TARBALL';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo ""
echo "→ Installing dependencies..."
npm install

echo ""
echo "→ Running typecheck..."
npx tsc --noEmit

echo ""
echo "✓ @nubase/create E2E test passed!"
```

**Step 2: Make it executable**

```bash
chmod +x packages/create/e2e/create-app.sh
```

**Step 3: Add root script**

In root `package.json`, add to scripts:

```json
"e2e:create": "bash packages/create/e2e/create-app.sh"
```

**Step 4: Run the test**

```bash
npm run e2e:create
```

Expected: All steps pass — scaffold, install, typecheck succeed

**Step 5: Commit**

```bash
git add packages/create/e2e/ package.json
git commit -m "test: add e2e test for @nubase/create (scaffold → install → typecheck)"
```

---

### Task 8: Final Verification & Cleanup

**Step 1: Full build**

```bash
npm run build
```

Expected: All packages build successfully

**Step 2: Full typecheck**

```bash
npm run typecheck
```

Expected: All packages pass (including `examples/nubase-example-app`)

**Step 3: Full lint**

```bash
npm run lint:fix
```

Expected: All packages pass

**Step 4: Run all tests**

```bash
npm run test
```

Expected: All unit tests pass (including new remotes-file tests)

**Step 5: Run e2e create test**

```bash
npm run e2e:create
```

Expected: Full create-to-typecheck flow passes

**Step 6: Final commit (if any lint fixes were needed)**

```bash
git add -A
git commit -m "chore: lint fixes and final verification"
```
