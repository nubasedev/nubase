# Repository Guidelines

## Project Structure & Module Organization
- `packages/` contains the publishable libraries: `@nubase/core`, `@nubase/frontend`, and `@nubase/backend`, with source in `src/` and tests in `tests/`.
- `apps/docs` builds the Docusaurus site; sync it whenever public concepts shift.
- `examples/internal/` holds the Questlog demo split into frontend, backend, and schema so runtime, API, and typing evolve together.
- Store shared assets under `assets/`, `docs/`, and `coordination/`. Touch root configs (`package.json`, `turbo.json`, `biome.json`) only when coordinated.

## Build, Test, and Development Commands
- Avoid launching shared dev servers (`npm run dev`, `npm run storybook`); lean on `npm run typecheck` and `npm run lint` for feedback when another session may be active.
- `npm run dev` runs every workspace; trim scope with `turbo run dev --filter=<package>`.
- `npm run build` compiles the repo, while `npm run build:<target>` handles individual packages.
- Run `npm run test` before a PR and apply lint fixes through `npm run lint:fix` or `npm run format-and-lint:fix`.
- Storybook lives in `packages/frontend`; use `npm run storybook` locally and `npm run build:storybook` for static output.

## Coding Style & Naming Conventions
- Biome enforces 2-space indentation, double quotes, and lint rules; run `npm run format-and-lint` before staging.
- Use TypeScript/TSX ES modules. Components follow PascalCase filenames; hooks and helpers stay camelCase.
- Keep package entrypoints (`packages/*/src/index.ts`) minimal so published APIs remain stable.

## Testing Guidelines
- Vitest powers tests; place specs beside source or under each package’s `tests/`.
- Name suites after the unit (`<Module>.spec.ts`) and scope fixtures to the package.
- Expand coverage in both core and frontend when schema or UI behavior changes.

## Commit & Pull Request Guidelines
- Maintain imperative, one-line summaries (e.g., `Add schema coercion helpers`) with optional scopes.
- Note related issues, breaking changes, and documentation or example updates in the body.
- PRs should include intent, testing notes, and UI evidence when visuals change.

## Development Environment Notes
- Turborepo workflows require Node 18+ and npm 10.9.2; install dependencies at the root to keep workspaces aligned.
- Mirror configuration changes that affect automation in `coordination/` so downstream contributors and agents stay synced.

## Architecture Overview
- Nubase is schema-driven: the Questlog schema workspace defines resources and views consumed by both frontend and backend runtimes.
- `packages/frontend/src/components/nubase-app/NubaseApp.tsx` assembles navigation, routing, theming, and CRUD flows automatically from configuration; reflect schema contract changes in the demo apps and `apps/docs`.
