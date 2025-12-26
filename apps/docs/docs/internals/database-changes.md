# Modifying the Questlog Database

This guide explains how to modify the database schema in the questlog example application. This workflow is designed for **development and testing only** - there is no production database.

## Overview

The questlog-backend uses:
- **PostgreSQL 17.5** running in Docker containers
- **Drizzle ORM** for type-safe schema definitions
- **Two separate databases**: dev (port 5434) and test (port 5435)
- **Row Level Security (RLS)** for multi-tenant isolation

## Database Users

The database has two users with different permission levels:

| User | Purpose | Permissions |
|------|---------|-------------|
| `questlog` | Admin (migrations, seeding) | Superuser, bypasses RLS |
| `questlog_app` | Application runtime | DML only, subject to RLS |

## Database Credentials

| Environment | Port | Database | App User | App Password | Admin User | Admin Password |
|-------------|------|----------|----------|--------------|------------|----------------|
| Development | 5434 | questlog | questlog_app | questlog_app | questlog | questlog |
| Test | 5435 | questlog | questlog_app | questlog_app | questlog | questlog |

## Source of Truth

The database schema is defined in a single SQL file:

```
questlog-example-app/backend/db/schema.sql
```

This file is the **source of truth** for the database structure. It contains:
- Table definitions
- Constraints and indexes
- User/role creation
- Permission grants
- Row Level Security policies

## Workflow for Schema Changes

### Option A: Direct SQL Editing (Recommended for new features)

#### Step 1: Edit the Schema File

Modify the source of truth directly:

```bash
# Edit the schema file
code questlog-example-app/backend/db/schema.sql
```

Add your changes following the existing patterns:

```sql
-- Add a new table
CREATE TABLE public.categories (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL
);

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.categories ADD CONSTRAINT categories_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.categories ADD CONSTRAINT categories_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- Don't forget RLS policy for tenant isolation
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_tenant_isolation ON public.categories
    TO questlog_app
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer);
```

#### Step 2: Sync Schema to Docker Folders

Copy the schema to the Docker init folders:

```bash
npm run db:schema-sync
```

This copies `db/schema.sql` to both:
- `docker/dev/postgresql-init/dump.sql`
- `docker/test/postgresql-init/dump.sql`

#### Step 3: Recreate the Databases

```bash
npm run db:kill && npm run db:up
```

#### Step 4: Update Drizzle Schema

Update the TypeScript schema files to match your database changes:

```typescript
// src/db/schema/category.ts
import { sql } from "drizzle-orm";
import { integer, pgPolicy, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenant";

export const categoriesTable = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenantsTable.id),
    name: varchar("name", { length: 255 }).notNull(),
  },
  (table) => [
    pgPolicy("categories_tenant_isolation", {
      as: "permissive",
      for: "all",
      to: "questlog_app",
      using: sql`${table.tenantId} = NULLIF(current_setting('app.current_tenant_id', true), '')::integer`,
      withCheck: sql`${table.tenantId} = NULLIF(current_setting('app.current_tenant_id', true), '')::integer`,
    }),
  ],
);
```

### Option B: Database-First (For exploratory changes)

#### Step 1: Connect to the Dev Database

```bash
PGPASSWORD=questlog psql -h localhost -p 5434 -U questlog -d questlog
```

#### Step 2: Make Changes with SQL

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL
);

-- Verify
\dt
\d categories
```

Exit with `\q`.

#### Step 3: Dump the Schema

Export the current database schema:

```bash
npm run db:pg-dump
```

This command:
1. Exports the schema from the dev database to `db/schema.sql`
2. Automatically syncs to Docker init folders

#### Step 4: Update Drizzle Schema

Same as Option A, Step 4.

## Seeding the Database

After recreating databases, seed with test data:

```bash
npm run db:seed
```

The seed script uses the admin connection (`DATABASE_URL_ADMIN`) which bypasses RLS.

## Quick Reference: All Commands

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start both dev and test database containers |
| `npm run db:down` | Stop both database containers |
| `npm run db:kill` | Stop containers and delete all data |
| `npm run db:seed` | Seed the dev database with test data |
| `npm run db:pg-dump` | Export schema from DB to `db/schema.sql` and sync |
| `npm run db:schema-sync` | Copy `db/schema.sql` to Docker init folders |
| `npm run db:pg-dump-data` | Export schema and data to SQL |

## File Locations

| File/Folder | Purpose |
|-------------|---------|
| `questlog-example-app/backend/db/schema.sql` | **Source of truth** - SQL schema definition |
| `questlog-example-app/backend/src/db/schema/` | Drizzle TypeScript schema definitions |
| `questlog-example-app/backend/docker/dev/postgresql-init/dump.sql` | Dev container init (copy of schema.sql) |
| `questlog-example-app/backend/docker/test/postgresql-init/dump.sql` | Test container init (copy of schema.sql) |
| `questlog-example-app/backend/.env.development` | Database connection strings |

## Row Level Security (RLS)

All tenant-scoped tables use RLS for data isolation:

- **Tickets**: Only accessible within tenant context
- **Users**: Only accessible within tenant context
- **Tenants**: No RLS (needed for tenant lookup before context is set)

The application sets the tenant context via:
```sql
SELECT set_config('app.current_tenant_id', '<tenant_id>', false);
```

RLS policies then filter all queries automatically.

## Connecting to Databases

### Development Database (Admin)
```bash
PGPASSWORD=questlog psql -h localhost -p 5434 -U questlog -d questlog
```

### Development Database (App User - for testing RLS)
```bash
PGPASSWORD=questlog_app psql -h localhost -p 5434 -U questlog_app -d questlog
```

### Test Database
```bash
PGPASSWORD=questlog psql -h localhost -p 5435 -U questlog -d questlog
```

## Troubleshooting

### Database container won't start

Check if the port is already in use:

```bash
lsof -i :5434   # Check dev port
lsof -i :5435   # Check test port
```

### Schema changes not applying

Make sure to run the full cycle:

```bash
npm run db:kill && npm run db:up
```

The `dump.sql` files only run on **first container initialization**. If the data volume already exists, the init scripts are skipped.

### RLS blocking queries

If queries return no rows unexpectedly:
1. Check if tenant context is set: `SELECT current_setting('app.current_tenant_id', true);`
2. Verify you're using the app user, not the admin user
3. Ensure the tenant_id in your data matches the context

### Drizzle schema out of sync

If you modified the database directly but forgot to update Drizzle schemas:

```bash
cd questlog-example-app/backend
npx drizzle-kit pull
```

This generates TypeScript schema files from the current database state.
