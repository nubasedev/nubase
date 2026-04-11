# Typed SQL codegen for `@nubase/pg`

**Status:** Design, approved for implementation planning
**Date:** 2026-04-11
**Owner:** Andre Pena

## Background

Nubase currently uses Drizzle ORM in `apps/questlog/src/backend/db/` for both schema definition and query construction. We want to experiment with moving queries (not schema) off Drizzle and onto a pgtyped-inspired "write SQL, generate typed TS wrappers" workflow. This spec covers only the **experimental alternative**; Drizzle is not removed and the two systems coexist.

`packages/pg` already owns the Postgres side of Nubase: schema extraction, diff, migration generation, snapshot I/O. Query codegen is a natural extension of the same package — it's another thing we do by talking to Postgres.

## Goals

- Developers write SQL in `.sql` files inside a `data-layer/` tree; the Nubase CLI generates a sibling `.ts` file with typed params, typed return rows, and a function that runs the query.
- Types are inferred from Postgres itself via the Extended Query Protocol (Parse/Describe), so the generator understands joins, CTEs, expressions, casts, nullability, etc., without implementing a SQL parser.
- Design-time validation comes for free: if Postgres can't Parse the query, codegen fails with a beautiful `file:line:col` diagnostic.
- Generated `.ts` files are committed to git; CI verifies freshness via an embedded content hash.
- The runtime surface of generated functions depends only on `pg` (node-postgres). No `@nubase/pg` code runs in production.
- JSON column shapes can be expressed via magic comments using standard TypeScript `import()` type syntax.

## Non-goals

- Replacing Drizzle. The two coexist. No code in `src/backend/db/` is touched.
- A query builder. There is no `select().from().where()` — just `.sql` files.
- Runtime row validation. Postgres already guarantees the row shape.
- Supporting pgtyped's TypeScript-file query mode (tagged templates in `.ts`). SQL files only.
- Supporting pgtyped's multi-query-per-file syntax, `/* @name */` annotations, or `!`/`[]` param-nullability hint syntax. One query per file; nullability comes from Postgres.
- A file watcher (`--watch`). One-shot CLI only.
- Any change to the existing `nubase db pull`/`db diff`/`db push` workflow.

## High-level architecture

Two distinct phases that use completely different code:

**Build time (CLI):** Vendored pgtyped wire protocol + type extraction. Talks to Postgres directly via TCP (no `pg` dependency for the wire code), sends `Parse` + `Describe` for each query, resolves OIDs via `pg_type`/`pg_attribute`/`pg_description`, renders TypeScript.

**Runtime (generated code):** Each generated `.ts` file is a standalone function that takes a `pg.Client | pg.Pool | pg.PoolClient`, calls `db.query(sql, params)`, and returns the typed rows. No vendored code ships to production.

## Module layout (`packages/pg/src/`)

New additions marked `+`:

```
packages/pg/src/
  diff/                        (unchanged)
  extract/                     (unchanged)
  io/                          (unchanged)
  migrate/                     (unchanged)
  types/                       (unchanged)
+ typed-sql/
+   wire/                      ← vendored from @pgtyped/wire (MIT, attributed)
+     messages.ts              ← Postgres frontend/backend message codecs
+     protocol.ts              ← low-level wire protocol
+     queue.ts                 ← AsyncQueue
+     helpers.ts               ← utilities
+     index.ts                 ← public exports for the typed-sql internals
+   query/                     ← vendored + adapted from @pgtyped/query
+     actions.ts               ← startup, getTypeData, getTypes, reduceTypeRows, getComments
+     sasl-helpers.ts          ← SCRAM-SHA-256 auth
+     type.ts                  ← MappableType, OID → TS mapping
+   preprocess/
+     named-params.ts          ← :userId → $1; source map
+     json-annotations.ts      ← @json <name>: <ts-type-expression> parser
+   codegen/
+     render-typescript.ts     ← produce the final .ts string from a QueryModel
+     hoist-imports.ts         ← dedupe inline import("...") types into top-level imports
+     format.ts                ← run Biome on generated output
+   discover/
+     find-sql-files.ts        ← walk data-layer/ tree
+     hash.ts                  ← sha256(sourceBytes) truncated to 16 hex chars
+   generate/
+     generate-query.ts        ← one file: read → preprocess → getTypes → render → write
+     generate-all.ts          ← orchestrate; single wire connection; sequential
+     check-stale.ts           ← --check mode
+     orphan-cleanup.ts        ← delete .ts with no .sql sibling
+   errors/
+     parse-error.ts           ← IParseError → diagnostic string
+     source-map.ts            ← byte offset in rewritten SQL → (line, col) in source
+     sqlstates.ts             ← SQLSTATE → human-readable error name
+   index.ts                   ← public exports for @nubase/pg consumers
  index.ts                     ← re-exports typed-sql public surface
```

**Public surface exported from `@nubase/pg`** (consumed by `packages/cli`):

```ts
export { generateAll, checkStale } from "./typed-sql/generate";
export type { GenerateOptions, GenerateResult, GenerateError } from "./typed-sql";
```

Everything under `wire/`, `query/`, `codegen/`, `preprocess/`, `errors/` is internal.

### Vendoring from pgtyped

pgtyped is MIT-licensed. We copy specific files, attribute in-file, and maintain the copy.

| Source | File | What we take | Adaptation |
|---|---|---|---|
| `@pgtyped/wire` | `src/messages.ts`, `queue.ts`, `protocol.ts`, `helpers.ts` | All | Straight copy |
| `@pgtyped/query` | `src/actions.ts` | `startup`, `getTypeData`, `getTypes`, `reduceTypeRows`, `runTypesCatalogQuery`, `getComments` | Remove `process.exit(1)` on connection failure; throw instead |
| `@pgtyped/query` | `src/sasl-helpers.ts` | All | Straight copy |
| `@pgtyped/query` | `src/type.ts` | `MappableType` + OID mapping tables | May extend mapping for uncovered types |

**Not vendored:** `@pgtyped/parser` (grammar-based multi-query SQL parser), `@pgtyped/runtime` (SQL tag support, their preprocessor), `@pgtyped/cli` (their CLI, watcher, worker pool, config loader).

Total vendored: ~1500–2500 LoC.

**License hygiene:** Each vendored file gets a header comment pointing to the original. `packages/pg/LICENSE-pgtyped.md` contains the full MIT text from the pgtyped repo.

### Dependencies

No new runtime dependencies. `pg@^8` is already in `@nubase/pg`. The vendored wire code uses only Node built-ins (`net`, `tls`, `crypto`). Biome is already a root dev dep and is used for formatting generated output.

## Developer workflow

### Directory layout

```
apps/questlog/src/backend/
  data-layer/
    tickets/                        ← context (just a folder for grouping; no semantics)
      getTicketById.sql             ← dev writes
      getTicketById.ts              ← CLI generates (sibling)
      listTicketsByStatus.sql
      listTicketsByStatus.ts
      insertTicket.sql
      insertTicket.ts
      deleteTicket.sql
      deleteTicket.ts
    users/
      getUserByEmail.sql
      getUserByEmail.ts
      ...
```

- **One query per file.** File basename is the function name (must be a valid JS identifier, `[A-Za-z][A-Za-z0-9]*`).
- **Context folders are organizational only.** No `index.ts`, no registry, no semantics.
- **Top-level `data-layer/` is discoverable by convention**, overridable via `nubase.config.ts`:

```ts
export default defineConfig({
  dataLayer: {
    dir: "src/backend/data-layer",   // default
  },
});
```

### Writing a query

```sql
-- apps/questlog/src/backend/data-layer/tickets/listTicketsByStatus.sql
SELECT
  t.id,
  t.title,
  t.status,
  t.created_at,
  t.author_id,
  u.email AS author_email
FROM tickets t
LEFT JOIN users u ON u.id = t.author_id
WHERE t.status = :status
ORDER BY t.created_at DESC
LIMIT :limit;
```

- **Named params** with `:` prefix. No `!`/`[]`/`(...)` nullability hints — nullability comes from Postgres via `pg_attribute.attnotnull`.
- **No `/* @name */` comment.** File name is the query name.
- **The file is a valid SQL file** — you can paste it into `psql` and run it (modulo `:params`, which psql handles with its own `\set`).

### Generated TypeScript

```ts
// ───────────────────────────────────────────────────────────────────────────
// Generated by @nubase/pg. DO NOT EDIT.
// Source: listTicketsByStatus.sql
// Hash:   sha256:8f3a2c1d4e7b9a0f
// ───────────────────────────────────────────────────────────────────────────
import type { Client, Pool, PoolClient } from "pg";

export type ListTicketsByStatusParams = {
  status: string;
  limit: number;
};

export type ListTicketsByStatusRow = {
  id: number;
  title: string;
  status: string;
  created_at: Date;
  author_id: number;
  author_email: string | null;   // nullable: LEFT JOIN right side
};

const SQL = `SELECT
  t.id,
  t.title,
  t.status,
  t.created_at,
  t.author_id,
  u.email AS author_email
FROM tickets t
LEFT JOIN users u ON u.id = t.author_id
WHERE t.status = $1
ORDER BY t.created_at DESC
LIMIT $2`;

export async function listTicketsByStatus(
  db: Client | Pool | PoolClient,
  params: ListTicketsByStatusParams,
): Promise<ListTicketsByStatusRow[]> {
  const result = await db.query<ListTicketsByStatusRow>(SQL, [
    params.status,
    params.limit,
  ]);
  return result.rows;
}
```

**Properties:**
- Function signature is `async function <name>(db, params): Promise<Row[]>`.
- `SQL` is a top-level const for readability and debuggability.
- Param order is determined by first appearance in the SQL. Duplicates collapse to one `$N`.
- `Row` is a plain object type; no classes, no branded types, no decorators.
- Nullability is exclusively from Postgres.
- Call site: `const rows = await listTicketsByStatus(ctx.db, { status: "open", limit: 50 });`
- Tree-shakeable per query; no barrel file.

### Mutations

**With `RETURNING`** — same shape as `SELECT`, generator branches on `RowDescription.fields.length > 0`:

```sql
-- createTicket.sql
INSERT INTO tickets (title, status, author_id)
VALUES (:title, :status, :authorId)
RETURNING id, created_at;
```

Generates `createTicket(db, params): Promise<CreateTicketRow[]>` returning `[{ id, created_at }]`.

**Without `RETURNING`** — different return shape:

```sql
-- deleteTicket.sql
DELETE FROM tickets WHERE id = :id;
```

```ts
export async function deleteTicket(
  db: Client | Pool | PoolClient,
  params: DeleteTicketParams,
): Promise<{ rowCount: number }> {
  const result = await db.query(SQL, [params.id]);
  return { rowCount: result.rowCount ?? 0 };
}
```

No `Row` type is exported. The branch is ~15 LoC in the generator; both branches share 90% of the code.

### JSON column typing

Postgres can't tell us the shape of a `jsonb`/`json` column. The dev expresses it via **magic comments at the top of the `.sql` file** using standard TypeScript `import()` type syntax:

```sql
-- @json metadata: import("@questlog/common/schemas").TicketMetadata
-- @json tags: string[]
SELECT id, title, metadata, tags
FROM tickets
WHERE id = :id;
```

**Syntax:**
- One `-- @json <name>: <ts-type-expression>` per line.
- Scanned from the top of the file until the first non-comment, non-blank line. Once we hit SQL, no more annotations are parsed (an `@json`-looking comment inside the SQL body is ignored).
- `<name>` matches a column alias *or* a param name. Scoping is by name only; disjoint in practice.
- `<ts-type-expression>` is pasted **verbatim** into the generated `.ts`. It can be any valid TS type:
  - Bare identifier: `TicketMetadata` (must be imported by the generator or reference a global)
  - Import type: `import("@questlog/common/schemas").TicketMetadata`
  - Union: `import("...").TicketMetadata | null`
  - Array: `string[]`
  - Inline: `{ priority: "low" | "med" | "high"; tags: string[] }`
- **Default for unannotated JSON columns is `unknown`**, not `any`. Not a warning, not a failure — just `unknown`, which forces the dev to narrow at the call site.

**Import hoisting:** The codegen collects every `import("pkg").Name` reference inside pasted `@json` expressions (a single expression can contain multiple, e.g., `import("a").X | import("b").Y`), dedupes, and hoists each to a top-level `import type { Name } from "pkg"` statement. The pasted expressions are then rewritten to use the bare imported name (`X | Y`). Output looks hand-written. Collisions (two different modules exporting `Name`) are handled by aliasing: `import type { Name as Name_1 } from "other-pkg"`, with the pasted expression rewritten accordingly.

**Error handling:** Malformed `@json` comments produce a per-file error with code `NU001` (or similar), reported at the comment's line and column. We know the exact location because we parse the comments ourselves.

## Generator pipeline

### Phase 0 — Config and connection setup

```ts
const resolved = await loadConfig(options.env);          // existing packages/cli
const url = resolved.environment.url;                    // typically DATABASE_URL

// `loadConfig` finds the `nubase/` directory (projectRoot) and the app root is its parent.
// `dataLayer.dir` is resolved relative to the app root, matching how the runtime resolves paths.
const appRoot = path.dirname(resolved.projectRoot);
const dataLayerDir = path.resolve(
  appRoot,
  resolved.config.dataLayer?.dir ?? "src/backend/data-layer",
);
```

We parse `url` into `{ host, port, user, password, dbName, ssl }` ourselves because the vendored wire code talks TCP directly. ~20 LoC using Node's `URL` parser plus a few conventions (e.g., `sslmode=require`).

### Phase 1 — Discover

Walk `dataLayerDir` recursively for `.sql` files. For each:

```ts
type DiscoveredQuery = {
  absPath: string;
  relPath: string;                 // relative to data-layer/
  context: string;                 // first path segment
  name: string;                    // basename without extension
  targetTsPath: string;
  sourceBytes: Buffer;             // eagerly read for hash + error reporting
};
```

**Skipped:** hidden files (`.` prefix), anything in `node_modules/`, basenames not matching `[A-Za-z][A-Za-z0-9]*`. Skips produce warnings, not errors.

### Phase 2 — Open one wire connection

```ts
const queue = new AsyncQueue();
await startup({ host, port, user, password, dbName, ssl }, queue);
```

One long-lived connection, reused for every query's Parse/Describe. SCRAM-SHA-256 auth happens once. No connection pool in v1 (premature optimization for 20–50 queries on localhost).

### Phase 3 — Process each query, sequentially

Per-file pipeline:

1. **Scan leading comments** for `@json` annotations; build a `JsonOverrides` map.
2. **Preprocess `:names`** into `$N`; record the original ranges for source mapping:
   ```ts
   type Preprocessed = {
     sql: string;                          // to send to Postgres
     params: string[];                     // paramName at index $N - 1
     rewrites: NamedParamRewrite[];        // source map for diagnostics
   };
   ```
3. **Send `Parse` + `Describe` + `Sync`** over the wire (`getTypeData`).
4. **On parse error:** format a diagnostic (see Error handling), push onto `result.errors`, continue. We don't stop on first error — dev wants to see all mistakes at once.
5. **On success:** fetch `pg_type`/`pg_attribute`/`pg_description` rows for all referenced OIDs (`getTypes`).
6. **Build `QueryModel`:**
   ```ts
   type QueryModel = {
     name: string;
     sql: string;                          // the rewritten SQL with $1, $2, ...
     params: Array<{ name: string; tsType: string }>;
     returnFields: Array<{ name: string; tsType: string; nullable: boolean }> | null;
     //                                                                        ^
     // null means "no RowDescription" — the command mutation branch
     imports: Map<string, Set<string>>;    // module → type names, from hoisting
   };
   ```
   JSON overrides applied here by matching column/param name against the `JsonOverrides` map.
7. **Render TypeScript** from the model. Hoisted imports go at the top; `SQL` const next; param/row types next; function last.
8. **Format with Biome** so output matches project style.
9. **Write the file** only if content differs from what's already on disk (keeps mtimes stable for Vite/tsc).

### Phase 4 — Orphan cleanup

After all queries process, walk `dataLayerDir` for `.ts` files whose `.sql` sibling doesn't exist. Files identified as "ours" by the `Generated by @nubase/pg` header comment are deleted. Hand-written `.ts` files without the header are left alone.

### Phase 5 — Return structured result

```ts
type GenerateResult = {
  generated: string[];         // paths written or unchanged
  deleted: string[];           // orphans removed
  errors: GenerateError[];     // per-file diagnostics
  durationMs: number;
};
```

## Error handling

### Parse errors (from Postgres)

Raw `IParseError` from `getTypeData`:

```ts
{ errorCode: "42703", message: '...', hint: '...', position: "40" }
```

**`position` is a 1-based byte offset into the rewritten SQL (what we sent to Postgres)**, not the original source. We use the source map from preprocessing to translate back to the original file's `(line, col)`.

The source-map translation walks `rewrites`, adjusting the offset for each `:name` → `$N` substitution that came before the error position, then counts newlines up to the adjusted offset.

### Diagnostic format

```
✖ apps/questlog/src/backend/data-layer/tickets/listOpenTickets.sql
  42703: column "titel" does not exist

     4 │   t.id,
     5 │   t.titel,
       │     ^^^^^
     6 │   t.status
       │
       │ Hint: Perhaps you meant to reference the column "tickets.title".
       │
       │ ↪ Postgres error code 42703 (undefined_column)
```

- Path is relative to project root, clickable in most terminals.
- Three lines of source context around the error.
- Caret underline sized to the offending identifier when possible (we know it for `42703`, `42601` etc.; unknown SQLSTATEs get a single `^`).
- Hint rendered only if Postgres provides one.
- SQLSTATE looked up in `sqlstates.ts` — a small table of ~30 common codes, unknown codes fall back to just the number.

### Non-parse errors

- **Connection errors** — emitted once at the top, abort the whole run.
- **`@json` annotation errors** — per-file, our error codes (`NU001` malformed comment, `NU002` unresolvable type, etc.), formatted the same way.
- **OID resolution failures** (unmapped custom/composite type) — warning, falls back to `unknown`, query still generates.

### Aggregate summary

```
  ✔ 18 queries generated
  ✖ 2 queries failed
  ↻ 1 orphan removed

  Generation failed — see errors above.
```

Exit code 1 if any query failed, 0 otherwise. Failed queries do not overwrite their previous `.ts` — so `tsc` doesn't break on a partially-written file.

## CLI command

### Registration

New command in `packages/cli/src/commands/data-layer-generate.ts`, wired into `packages/cli/src/cli.ts` next to the existing `db-*` commands. Follows the exact same pattern.

### Usage

```
nubase data-layer generate [options]

Options:
  --env <name>      Environment from nubase.config.ts (default: "local")
  --check           Don't write anything; exit 1 if any file would change or has a stale hash
  --verbose         Print per-file timings and diagnostics
  --help            Show help
```

### Implementation sketch

```ts
export async function dataLayerGenerate(options: {
  env?: string;
  check?: boolean;
  verbose?: boolean;
}): Promise<void> {
  const resolved = await loadConfig(options.env);
  const dataLayerDir = resolveDataLayerDir(resolved);
  const fn = options.check ? checkStale : generateAll;
  const result = await fn({
    databaseUrl: resolved.environment.url,
    dataLayerDir,
    verbose: options.verbose ?? false,
  });
  const { output, exitCode } = formatGenerateResult(result, { check: options.check });
  process.stdout.write(output);
  process.exit(exitCode);
}
```

## Staleness check

### Hash scheme

Generated `.ts` files embed a hash of the source `.sql` in the header:

```ts
// Hash: sha256:8f3a2c1d4e7b9a0f
```

- Algorithm: SHA-256 of the raw source bytes, truncated to 16 hex chars (64 bits — collision-resistant enough for one repo).
- Covers **source only, not generated output.** This means: upgrading `@nubase/pg` doesn't invalidate existing generated files as long as the source hasn't changed. CI asks the right question: "do these `.ts` correspond to these `.sql`?" not "were these `.ts` produced by the exact current generator?"

### `--check` mode

Same pipeline as `generate`, but:

1. Runs Parse/Describe against the live DB (requires Postgres in CI).
2. Computes the would-be output in memory without writing.
3. For each discovered `.sql`, reads the existing `.ts` (if any), extracts the hash, compares with `sha256(sourceBytes)`.
4. Fails on any mismatch, any missing `.ts`, any orphan, any parse error.

**Why require a live DB in CI?** The alternative is hash-only checking, which catches "dev forgot to regenerate after editing `.sql`" but not "dev regenerated against a stale schema." Requiring the live DB makes `--check` the strongest possible guarantee: the committed `.ts` matches the committed `.sql` *and* the queries still parse against the current schema.

CI flow:

```yaml
- run: docker compose up -d postgres
- run: npx nubase db push                     # apply migrations
- run: npx nubase data-layer generate --check
```

## Testing

### Unit (no DB)

- Named-param preprocessor (including edge cases: literals, comments, `::casts`, duplicates)
- `@json` annotation parser (well-formed, malformed, TS expressions)
- OID → TS mapping table
- Source-map offset translation
- Import hoisting in codegen
- Error formatter (snapshot tests, one per error class)
- Hash function (deterministic, truncation)

Location: `packages/pg/src/typed-sql/**/*.test.ts`. Runs with existing `npm run test`.

### Integration (real Postgres)

Reuses the existing `packages/pg/vitest.integration.config.ts` and `docker/` harness.

- End-to-end type extraction accuracy against a fixture schema (tickets, users, enums, arrays, jsonb, timestamptz, uuid, LEFT JOIN nullability). Table of `{ sql, expectedTsSnapshot }` cases.
- Error reporting: deliberately broken queries produce expected diagnostics (snapshot tests).
- JSON override wiring.
- Mutation shapes: `INSERT ... RETURNING`, bare `DELETE`, `UPDATE`, etc.
- Orphan cleanup.
- `--check` mode: clean and dirty cases.
- **Smoke test:** convert ~3 real queries in `apps/questlog` to `.sql` files, generate siblings, run `npm run typecheck` across the whole repo. This is the acceptance gate.

Location: `packages/pg/src/typed-sql/**/*.integration.test.ts`. Runs with existing `npm run test:integration`.

### Not tested

- Vendored wire protocol (pgtyped's production code, exercised end-to-end by integration tests)
- Postgres' type inference (not our responsibility)
- Generated code runtime behavior (`db.query()` is node-postgres' job)

## Drizzle coexistence

The two systems are orthogonal. Both talk to the same database through the same `pg.Pool`. Neither knows about the other.

```ts
// apps/questlog/src/backend/api/tickets.ts
import { db } from "../db/client";                       // existing Drizzle
import { listTicketsByStatus } from "../data-layer/tickets/listTicketsByStatus";

app.get("/tickets", async (c) => {
  const counts = await db.select({ ... }).from(ticketsTable)...;
  const rows = await listTicketsByStatus(db.$client, { status: "open", limit: 50 });
  return c.json({ counts, rows });
});
```

Transactions work because Drizzle exposes the underlying `pg.PoolClient` during a transaction callback, and the generated function accepts that client directly. Both Drizzle statements and raw typed-sql calls run in the same transaction.

If you later decide to move fully off Drizzle, the migration is incremental — one `.sql` at a time, no big bang. This spec does not cover that decision.

## Open questions and deferred work

- **Connection pooling for parallel generation** — deferred. One sequential connection is fast enough for questlog. Revisit if large projects (500+ queries) feel slow.
- **`@type` annotations for non-JSON type overrides** — deferred. The `@json` syntax is structured to extend naturally (`@type paramName: Foo`) if a real need arises.
- **Generator version in hash** — deferred. If we ever want CI to also gate on "was this produced by the current generator version," add a `Generator:` header line and include it in `--check`.
- **Nubase schema generation** — deferred. Emitting `nu.object({...})` schemas alongside TS types would enable reuse in forms and API responses, but adds a translation layer (Postgres types → nubase schemas). Out of scope for this experiment.
- **Watch mode** — explicitly excluded. Devs re-run the command manually.
- **Editor integration** (LSP-style error reporting) — out of scope. The structured `GenerateResult` makes it feasible later.

## Implementation phases (high-level)

1. **Vendor** pgtyped wire + query code; add license attribution; verify it builds and the existing `extract/` tests still pass.
2. **Preprocessor + source map** — named params, `@json` annotations, with unit tests.
3. **Wire integration** — wrap `startup`/`getTypeData`/`getTypes` behind a clean internal API; integration test that opens a connection to the existing `docker/` Postgres and extracts types for a simple `SELECT 1 AS n, 'x' AS s`.
4. **Codegen** — render TS from a `QueryModel`, hoist imports, format with Biome, with unit tests.
5. **Pipeline** — `generate-all`, discovery, orphan cleanup, hashing, `--check` mode.
6. **Error diagnostics** — formatter, source-map translation, SQLSTATE table, snapshot tests.
7. **CLI command** — `data-layer-generate.ts`, wired into `cli.ts`.
8. **Questlog smoke test** — convert 3 real queries, typecheck, land.

Each phase is independently reviewable and lands as its own PR or commit series.

## Acceptance criteria

- [ ] `packages/pg/src/typed-sql/` exists with the module layout above.
- [ ] Vendored pgtyped files have attribution headers; `packages/pg/LICENSE-pgtyped.md` exists.
- [ ] Unit tests pass under `npm run test` in `packages/pg`.
- [ ] Integration tests pass under `npm run test:integration` in `packages/pg`.
- [ ] `npx nubase data-layer generate` works from within `apps/questlog`, generates `.ts` siblings for `.sql` files, and produces beautiful diagnostics for malformed queries.
- [ ] `npx nubase data-layer generate --check` fails on stale files, passes on clean state.
- [ ] Three hand-picked questlog queries are converted from Drizzle to typed-sql, `npm run typecheck` and `npm run lint` pass across the whole repo.
- [ ] Drizzle-based queries in `apps/questlog` continue to function unchanged.
