# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**Nubase is a framework.** It is highly opinionated and configuration-driven, aimed at internal tools and business applications. The framework lives in `packages/`.

**Questlog is the in-repo example app**, used to develop the framework against. It lives in `apps/questlog` and imports `@nubase/*` from local sources via the workspace. When in doubt about how an app should be structured, **questlog is the canonical example**.

**The starter** in `packages/create/templates/` is the code that ships to end users via `npx @nubase/create`. End users see this code, not questlog's. Keeping the starter in sync with the framework is a hard rule (see Conventions).

## Documentation

All user-facing documentation lives in **`apps/docs`** (Docusaurus). Write docs there — never as `README.md` files inside source packages. Architectural decisions go in `apps/docs/docs/adrs/` as numbered ADRs.

## Daily commands

- `npm run typecheck` — TypeScript across all packages.
- `npm run lint:fix` — Biome with auto-fix.
- `npm run build` — Turbo build (also builds the docs site, which catches broken MDX and broken doc links).
- `cd packages/core && npm run test` — Vitest. Test files use `.test.ts`.

**After every change, run `typecheck`, `lint:fix`, AND `build`.** Build catches things that typecheck does not — broken MDX, broken doc cross-references, package re-export drift, Storybook compilation, frontend bundling.

**Do not** start dev servers (`npm run dev`, `npm run storybook`). Assume the user is already running them; trying to start them again will collide on ports.

## Project layout

Turborepo monorepo.

**Framework packages (`packages/`):**

- `core` — `@nubase/core` — schema system (Zod-based) with computed metadata and layouts.
- `frontend` — `@nubase/frontend` — React components, the `NubaseApp` shell, hooks, theming.
- `backend` — `@nubase/backend` — typed handlers, auth controller interface, Hono middleware, NQL.
- `cli` — `@nubase/cli` — `nubase db diff/pull/push/reset` migration workflow.
- `pg` — `@nubase/pg` — Postgres schema extraction & migration SQL generation (used by the CLI).
- `create` — `@nubase/create` — the `npx @nubase/create` scaffolder. Templates live in `templates/`.

**Apps (`apps/`):**

- `questlog` — single fullstack example app served by one Vite dev server on `http://localhost:3000`. Vite + `@hono/vite-dev-server` mount the API at `/api/*` on the same port. Layout:
  - `src/frontend` — React frontend; `frontend-config.tsx` is the entry config.
  - `src/backend` — Hono API; `backend-config.ts` is the entry config.
  - `src/common` — types and API endpoint definitions shared by both sides.
  - `nubase/` — migration SQL and the `schema.json` snapshot, managed by `@nubase/cli`.
- `docs` — Docusaurus documentation site.

## Conventions

### Framework + starter coupling

**Any infrastructural change to the framework requires the matching change in `packages/create/templates/`.** End users get the starter, not questlog. If you add a field to `NubaseBackendConfig`, update the starter's `backend-config.ts`. If you rename a hook or change a controller signature, the starter must follow. The starter is part of the framework's public API.

**Indent template files with 2 spaces, not tabs.** Biome does not run inside `packages/create/templates/` — those files are template input, not project source — so there is no auto-format to clean up tabs. When you create or edit anything under `packages/create/templates/`, write 2-space indentation by hand and don't copy whitespace from elsewhere in the repo without checking it.

### Code style

- **Use `type`, not `interface`.** Even for object shapes. Reserve `interface` for the rare case where declaration merging is genuinely needed.
- **No barrel `index.ts` files.** Don't create `index.ts` files whose only purpose is re-exporting from siblings. Import from the file that defines the thing. Public package entry points (`packages/*/src/index.ts`) are the only exception, since they're the package's external surface.
- **Explicit named exports** — never `export *`. This applies inside packages and inside apps.
- **Inline event handlers** for short handlers; extract to a named function only when the handler grows complex.
- **No comments** unless the WHY is non-obvious. Don't narrate what the code does — names should do that.

### Application configuration

Each app has exactly two config files:

- `src/frontend/frontend-config.tsx` — exports `config: NubaseFrontendConfig`.
- `src/backend/backend-config.ts` — exports `config: NubaseBackendConfig`.

Both types are owned by the framework (`@nubase/frontend` and `@nubase/backend`). See `apps/docs/docs/application-config.mdx` and ADR 0009 for the full convention.

### URL parameter coercion

URL params arrive as strings; schemas expect typed values. Both the frontend router (search params) and the backend `createHttpHandler` (path params) automatically coerce via `ObjectSchema.toZodWithCoercion()`. Just define schemas with the right types — coercion is handled.

## Component conventions

- **Centralised `<ActivityIndicator>`** for loading states; don't roll your own spinner. Use `<Button isLoading>` for submitting buttons.
- **No size variants** (sm/md/lg) on new components unless explicitly requested. Pick one well-tuned default.
- **Field renderers** live in `packages/frontend/src/components/form/renderers/{string,number,boolean,unsupported}/`. Import each renderer from its own file. The renderer maps live in `renderer-factory.tsx`.
- **Type definitions inline before the component**, e.g. `export type CardProps = ...` immediately above the `Card` component, not grouped at the top of the file.

## Storybook

- **Title format**: `Category/ComponentName` — never `Components/Category/ComponentName`.
- **`ToastProvider` and `ModalProvider` are already wired** in `.storybook/preview.tsx`. Don't wrap stories in them.
- **Self-contained stories**: use `render: () => { ... }` with all logic inline. No external helper components.
- **No dark-mode stories** — the dark-mode plugin renders every story in both themes.
- **No wrapper containers, borders, or explanatory copy** around stories. Let the component speak for itself.
- **`showToast(...)` directly** from `../../floating/toast` inside stories — not `useToast`.

## Theming

Tailwind v4 + CSS variables. The complete colour list and Tailwind mapping is in `packages/frontend/src/theme/theme.css`. Themes live in `packages/frontend/src/theming/themes/`. To add a theme, register it in `packages/frontend/src/theming/themes/index.ts` and add its id to `apps/questlog/src/frontend/frontend-config.tsx`'s `themeIds` array.

## Help

If the user asks about feedback or reporting issues:

- `/help` for Claude Code help.
- Issues: <https://github.com/anthropics/claude-code/issues>
