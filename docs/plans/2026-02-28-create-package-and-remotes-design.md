# Design: @nubase/create Repurpose + Remotes + Testing Architecture

**Date:** 2026-02-28
**Status:** Approved

## Context

Nubase evolved from a framework (where apps ran standalone) to a platform (where apps are uploaded to a server). The old `@nubase/create` scaffolded entire Turborepo monorepos with backend/frontend/schema/database — 96 files. This is no longer appropriate.

A Nubase app is now a lightweight extension (hooks, validations, endpoints, actions) built with `@nubase/sdk` and deployed via `nubase push`. The example is `nubase-example-app` — ~10 files total.

## Goals

1. Repurpose `@nubase/create` to scaffold minimal Nubase apps
2. Add a git-like remote system to `@nubase/cli` for managing multiple servers
3. Establish a testable architecture with workspace-linked examples and e2e verification

## 1. Remote System in @nubase/cli

### Commands

```
nubase remote add <name> --url <url> --workspace <slug> [--token <token>]
nubase remote remove <name>
nubase remote use <name>
nubase remote list
```

### Storage

`.nubase/remotes.json` (gitignored):

```json
{
  "active": "origin",
  "remotes": {
    "origin": {
      "url": "http://localhost:3001",
      "workspace": "tavern",
      "token": "sk-..."
    }
  }
}
```

### Pull/Push Integration

- `nubase pull` and `nubase push` use the active remote by default
- `--remote <name>` flag overrides with a named remote
- The remote provides url, workspace, and token for the operation

### Config Simplification

`nubase.config.ts` no longer contains `server` or `workspace`. It only has:

```ts
import { defineConfig } from "@nubase/sdk/config";

export default defineConfig({
  output: { typesDir: ".nubase/types" },
  app: { entry: "src/index.ts" },
});
```

## 2. @nubase/create — Minimal App Scaffolder

### Invocation

```bash
npx @nubase/create
```

### Interactive Prompts

1. Project name (kebab-case, defaults to directory name)
2. Server URL (defaults to `http://localhost:3001`)
3. Workspace slug (kebab-case)
4. API token (optional)

### Generated Files

```
my-app/
├── .nubase/
│   └── remotes.json
├── .gitignore
├── src/
│   └── index.ts
├── nubase.config.ts
├── tsconfig.json
└── package.json
```

**package.json:**
- Dependencies: `@nubase/sdk`
- DevDependencies: `@nubase/cli`, `typescript`
- Scripts: `pull`, `push`, `typecheck`

**src/index.ts:**
```ts
import { defineApp } from "@nubase/sdk";
export default defineApp({});
```

**.nubase/remotes.json:** Populated with the user's answers as the "origin" remote.

### Post-Scaffold

1. Runs `npm install`
2. Prints next steps: `cd my-app`, `npx nubase pull`, then start building

### Implementation

- Dependencies: `chalk`, `commander`, `fs-extra`, `prompts`
- Template files in `packages/create/templates/`
- Placeholder interpolation for project name in package.json
- `@nubase/create` writes `.nubase/remotes.json` directly (initial file only)

## 3. Example App & Workspace Layout

### Move Example

Move `nubase-example-app` from repo root to `examples/nubase-example-app/`.

### Workspace Configuration

Root `package.json`:
```json
"workspaces": [
  "apps/docs",
  "apps/nubase/*",
  "packages/*",
  "examples/*"
]
```

Example app `package.json`:
```json
{
  "dependencies": { "@nubase/sdk": "*" },
  "devDependencies": { "@nubase/cli": "*", "typescript": "^5.9.3" }
}
```

Using `"*"` makes npm resolve to the local workspace packages automatically.

## 4. Testing Architecture

### Layer 1: Workspace-Linked Example (Continuous Regression)

`examples/nubase-example-app/` is part of the monorepo workspace. Running `npm run typecheck` via Turbo verifies it compiles against the latest local `@nubase/sdk`. Any breaking SDK change is caught immediately.

### Layer 2: E2E Test for @nubase/create (CI)

A test that verifies the full create-to-working-app flow:

1. **Build:** `npm pack` @nubase/sdk and @nubase/cli into tarballs
2. **Scaffold:** Run `@nubase/create` non-interactively in a temp directory
3. **Patch:** Rewrite generated package.json to reference tarballs
4. **Install:** `npm install` in the temp directory
5. **Verify:** Run `npm run typecheck` and `npm run lint` (both must pass)
6. **Cleanup:** Delete temp directory

This runs as a CI step, not in `npm run test`. It catches:
- Template errors (invalid TypeScript, missing imports)
- SDK API changes that break generated apps
- Missing dependencies in generated package.json
- CLI bugs in @nubase/create

## Architecture Diagram

```
Monorepo
├── packages/
│   ├── sdk/              # @nubase/sdk — defineApp, types, codegen
│   ├── cli/              # @nubase/cli — pull, push, remote commands
│   ├── create/           # @nubase/create — scaffolds new apps
│   ├── core/             # @nubase/core
│   ├── frontend/         # @nubase/frontend
│   ├── backend/          # @nubase/backend
│   └── pg/               # @nubase/pg
├── examples/
│   └── nubase-example-app/   # Workspace-linked, always tests latest SDK
├── apps/
│   ├── nubase/           # Main Nubase application
│   └── docs/             # Documentation
└── docs/
    └── plans/            # Design documents
```

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scaffold scope | Minimal starter | Users add structure as needed |
| CLI UX | Interactive prompts with arg fallbacks | Best of both worlds |
| Remote storage | Gitignored in .nubase/ | Tokens stay local, per-developer config |
| Remote = | Server URL + workspace | Simplifies commands, one concept per remote |
| Remote selection | Active remote + --remote flag | Familiar git-like UX |
| Architecture | Unified CLI (Approach 1) | Centralized remote management, thin create |
| Example location | examples/nubase-example-app/ | Clean separation, workspace-linked |
| E2E testing | npm pack + tarballs | Tests real published artifact, no registry needed |
| Remote setup during create | Yes, prompt during create | App is ready to pull immediately |
