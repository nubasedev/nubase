# CLAUDE.md

## About

Nubase is a system similar to NocoDB/AirTable for building internal tools and business applications. It uses a **dual-database architecture**: a Nubase DB for system metadata (users, workspaces, auth) and a Data DB for customer workspace data (tickets, CRM records, etc.).

The system is configuration-driven — the frontend auto-generates routes, forms, navigation, and CRUD screens from schema and resource definitions. It's built on reusable packages (`@nubase/core`, `@nubase/frontend`, `@nubase/backend`) that the main application (`apps/nubase/`) consumes.

## Monorepo Structure

Turborepo-based monorepo:

**Packages (reusable libraries):**

- `packages/core` — Schema system with Zod validation, computed metadata, layouts
- `packages/frontend` — React components, hooks, theming, and application shell (NubaseApp)
- `packages/backend` — Backend utilities, typed handler factory, auth interfaces
- `packages/pg` — PostgreSQL schema extraction and diffing
- `packages/cli` — Database schema management CLI (init, diff, pull, push, reset)

**Application:**

- `apps/nubase/backend` — Hono backend with Drizzle ORM (port 3001)
- `apps/nubase/frontend` — React/Vite frontend (port 3002)
- `apps/nubase/schema` — Shared TypeScript schemas and endpoint definitions used by both frontend and backend
- `apps/docs` — Documentation site

## Dual Database Architecture

### Two Databases

**Nubase DB (`nubase_db`)** — System database for multi-tenancy:
- Tables: `workspaces`, `users`, `user_workspaces`
- Has Row Level Security (RLS) on workspace-scoped tables
- Users exist at root level (can belong to multiple workspaces)
- Schema: `apps/nubase/backend/db/nubase-db-schema.sql`

**Data DB (`data_db`)** — Customer workspace data:
- Tables: `tickets` (and future application tables)
- No RLS — entire database belongs to the customer
- Each row has a `workspace_id` for scoping
- Schema: `apps/nubase/backend/db/data-db-schema.sql`

### Cross-Database References

The only entity in the Nubase DB referenceable from the Data DB is **user**, via **email strings** (not foreign keys). Example: `tickets.assignee_email` stores a user's email. The backend resolves these to display names by querying `nubase_db.users` by email.

### Database Connections

Four functions in `apps/nubase/backend/src/db/helpers/drizzle.ts`:

- `getDb()` — App connection to nubase_db (subject to RLS)
- `getAdminDb()` — Admin connection to nubase_db (bypasses RLS, for seeding/migrations)
- `getDataDb()` — App connection to data_db (no RLS)
- `getDataAdminDb()` — Admin connection to data_db (for seeding)

### Docker

Both databases run in a single PostgreSQL 17.5 container. Dev on port 5434, test on port 5435. The init script (`apps/nubase/backend/db/init-databases.sh`) creates both databases and applies their schemas.

## Development Commands

### Build & Verification

- `npm run build` — Build all packages
- `npm run typecheck` — TypeScript type checking across all packages
- `npm run lint` / `npm run lint:fix` — Lint (Biome)
- `cd packages/core && npm run test` — Core package tests (Vitest)

### Database Management

- `npm run db:reset` — Full reset: kill containers, sync schemas, restart, seed
- `npm run db:up` / `npm run db:down` / `npm run db:kill` — Container lifecycle
- `npm run db:seed` — Seed dev database
- `npm run db:schema-sync` — Copy SQL files to Docker init folders

### Publishing

- `npm run publish:all` — Build and publish `@nubase/core` and `@nubase/frontend`

## Development Rules

- **NEVER run `npm run dev`, `npm run storybook`, or any dev servers** — assume the user is already running them. Port conflicts will occur.
- **ALWAYS run `npm run typecheck` and `npm run lint:fix`** at the end of every task
- Uses **Biome** for formatting and linting (configured in `biome.json`)
- Uses **Tailwind CSS v4** with Material Design 3 color system. See `packages/frontend/src/theme/theme.css` for available color classes
- **Documentation** goes in `apps/docs/` (Docusaurus) — do NOT create README.md files in source packages
- Tests use **Vitest**. Test files follow `.test.ts` naming convention

## Coding Conventions

### Component Exports

- Each component directory has an `index.ts` with **explicit named exports** (never `export *`)
- Props types are exported inline, directly before the component definition
- Use `ActivityIndicator` component for all loading states (import from `@nubase/frontend`)
- Don't add size variants (sm, md, lg) unless explicitly requested

### Storybook

- Story titles: `"Category/ComponentName"` (never start with "Components")
- Never create dark mode stories — Storybook has an automatic dark mode toggle
- Stories must be self-contained using the `render` function — never create external components
- `ToastProvider` and `ModalProvider` are already in `.storybook/preview.tsx` — never wrap stories with them
- Use `showToast()` directly in stories, not `useToast` hook

### Code Style

- Prefer inline event handlers for simple functions
- Icons from https://tabler.io/icons (SVG inline in components)
- Field renderers are in `packages/frontend/src/components/form/renderers/` with subfolder per type
