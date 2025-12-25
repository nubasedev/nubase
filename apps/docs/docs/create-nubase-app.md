---
sidebar_position: 2
---

# Create a Nubase App

The fastest way to get started with Nubase is to use `npx @nubase/create`. This CLI tool scaffolds a complete Nubase application with a backend, frontend, and shared schema package.

## Quick Start

```bash
npx @nubase/create my-app
cd my-app
npm run db:up      # Start PostgreSQL
npm run db:seed    # Seed with sample data
npm run dev        # Start development servers
```

Your app will be running at:
- **Frontend**: http://localhost:3002/default
- **Backend API**: http://localhost:3001

**Default credentials**: `demo@example.com` / `password123`

## What Gets Created

Running `npx @nubase/create my-app` generates a monorepo with three packages:

```
my-app/
├── package.json              # Root workspace config
├── turbo.json                # Turborepo configuration
├── biome.json                # Linting and formatting
│
├── schema/                   # Shared API schemas
│   └── src/
│       ├── index.ts
│       ├── api-endpoints.ts  # API endpoint definitions
│       └── schema/
│           ├── ticket.ts     # Example entity schema
│           └── auth.ts       # Authentication schemas
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── index.ts          # Hono server entry
│   │   ├── auth/             # Authentication logic
│   │   ├── api/routes/       # API route handlers
│   │   ├── db/schema/        # Drizzle ORM schemas
│   │   └── middleware/       # Workspace middleware
│   ├── docker/
│   │   ├── dev/              # Dev PostgreSQL (port 5434)
│   │   └── test/             # Test PostgreSQL (port 5435)
│   └── db/schema.sql         # Database schema
│
└── frontend/                 # React frontend
    └── src/
        ├── main.tsx          # Entry point
        ├── config.tsx        # Nubase configuration
        ├── auth/             # Auth controller
        ├── resources/        # Resource definitions
        └── styles/           # Custom styles
```

## Project Architecture

### Schema Package

The schema package is the **source of truth** for your API. Both the backend and frontend depend on it.

```typescript
// schema/src/schema/ticket.ts
import { emptySchema, nu, type RequestSchema } from "@nubase/core";

export const ticketBaseSchema = nu
  .object({
    id: nu.number(),
    title: nu.string().withMeta({
      label: "Title",
      description: "Enter ticket title",
    }),
    description: nu.string().optional().withMeta({
      label: "Description",
      renderer: "multiline",
    }),
  })
  .withId("id")
  .withTableLayouts({
    default: {
      fields: [
        { name: "id", columnWidthPx: 80 },
        { name: "title", columnWidthPx: 300 },
      ],
      metadata: { linkFields: ["title"] },
    },
  });

export const getTicketsSchema = {
  method: "GET",
  path: "/tickets",
  requestParams: emptySchema,
  responseBody: nu.array(ticketBaseSchema),
} satisfies RequestSchema;
```

### Backend Package

The backend uses [Hono](https://hono.dev) for HTTP and [Drizzle ORM](https://orm.drizzle.team) for PostgreSQL.

```typescript
// backend/src/api/routes/ticket.ts
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../../db/helpers/drizzle";
import { tickets } from "../../db/schema";

export const ticketHandlers = {
  async getTickets(c: Context) {
    const allTickets = await db.select().from(tickets);
    return c.json(allTickets);
  },
  // ... more handlers
};
```

### Frontend Package

The frontend is a Vite + React app that uses the `NubaseApp` component.

```typescript
// frontend/src/config.tsx
import { type NubaseFrontendConfig, defaultKeybindings } from "@nubase/frontend";
import { apiEndpoints } from "schema";
import { ticketResource } from "./resources/ticket";

export const config: NubaseFrontendConfig<typeof apiEndpoints> = {
  appName: "MyApp",
  mainMenu: [
    { id: "tickets", label: "Tickets", href: "/r/ticket/search" },
  ],
  resources: {
    [ticketResource.id]: ticketResource,
  },
  apiBaseUrl: "http://localhost:3001",
  apiEndpoints,
  keybindings: defaultKeybindings.extend(),
  themeIds: ["dark", "light"],
  defaultThemeId: "dark",
};
```

## CLI Options

```bash
npx @nubase/create [project-name] [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--db-name <name>` | Database name | `project_name` (underscores) |
| `--db-user <user>` | Database user | Same as db-name |
| `--db-password <pass>` | Database password | Same as db-name |
| `--dev-port <port>` | Dev database port | `5434` |
| `--test-port <port>` | Test database port | `5435` |
| `--backend-port <port>` | Backend server port | `3001` |
| `--frontend-port <port>` | Frontend dev server port | `3002` |
| `--skip-install` | Skip npm install | `false` |

### Examples

```bash
# Create with custom ports (useful if defaults are in use)
npx @nubase/create my-app --dev-port 5440 --backend-port 4001 --frontend-port 4002

# Create with custom database credentials
npx @nubase/create my-app --db-name mydb --db-user admin --db-password secret123

# Create without installing dependencies
npx @nubase/create my-app --skip-install
```

## Available Scripts

After creating your app, these scripts are available:

### Root Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend and frontend in development mode |
| `npm run build` | Build all packages |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run linting |
| `npm run lint:fix` | Fix linting issues |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:kill` | Remove PostgreSQL container and data |
| `npm run db:seed` | Seed database with sample data |

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run tests |
| `npm run db:dev:up` | Start dev database |
| `npm run db:test:up` | Start test database |

### Frontend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Database

The scaffolded app includes a PostgreSQL setup with:

- **Row Level Security (RLS)** for multi-tenant data isolation
- **Workspaces** for organizing data by tenant
- **Users and authentication** with bcrypt password hashing
- **Example tickets table** as a starting point

### Default Tables

| Table | Description |
|-------|-------------|
| `workspaces` | Multi-tenant workspace isolation |
| `users` | User accounts with hashed passwords |
| `user_workspaces` | User-workspace associations (with RLS) |
| `tickets` | Example entity (with RLS) |

### Connecting to the Database

```bash
# Dev database
psql -h localhost -p 5434 -U my_app -d my_app

# Or using the connection string from .env.development
DATABASE_URL="postgres://my_app_app:my_app@localhost:5434/my_app"
```

## Multi-Tenancy

Nubase apps use **path-based multi-tenancy**. The workspace slug is part of the URL:

```
http://localhost:3002/default/r/ticket/search
                      ↑
                      workspace slug
```

The backend middleware extracts the workspace from the path and sets the PostgreSQL session variable for RLS:

```typescript
// Middleware sets: SET app.current_workspace_id = '1'
// RLS policies filter queries to current workspace
```

## Adding a New Entity

1. **Define the schema** in `schema/src/schema/`:

```typescript
// schema/src/schema/customer.ts
import { emptySchema, nu, type RequestSchema } from "@nubase/core";

export const customerSchema = nu.object({
  id: nu.number(),
  name: nu.string().withMeta({ label: "Name" }),
  email: nu.string().withMeta({ label: "Email" }),
});

export const getCustomersSchema = {
  method: "GET",
  path: "/customers",
  requestParams: emptySchema,
  responseBody: nu.array(customerSchema),
} satisfies RequestSchema;
```

2. **Add to API endpoints** in `schema/src/api-endpoints.ts`:

```typescript
export const apiEndpoints = {
  // ... existing endpoints
  getCustomers: getCustomersSchema,
};
```

3. **Create database table** in `backend/src/db/schema/`:

```typescript
// customer.ts
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});
```

4. **Add API route** in `backend/src/api/routes/`:

```typescript
// customer.ts
export const customerHandlers = {
  async getCustomers(c: Context) {
    const all = await db.select().from(customers);
    return c.json(all);
  },
};
```

5. **Create resource** in `frontend/src/resources/`:

```typescript
// customer.ts
import { createResource } from "@nubase/frontend";
import { apiEndpoints } from "schema";

export const customerResource = createResource("customer")
  .withApiEndpoints(apiEndpoints)
  .withViews({
    search: {
      type: "resource-search",
      id: "search-customers",
      title: "Customers",
      schemaGet: (api) => api.getCustomers.responseBody,
      breadcrumbs: () => [{ label: "Customers", to: "/r/customer/search" }],
      onLoad: async ({ context }) => {
        return context.http.getCustomers({ params: {} });
      },
    },
  });
```

6. **Add to config** in `frontend/src/config.tsx`:

```typescript
resources: {
  [ticketResource.id]: ticketResource,
  [customerResource.id]: customerResource,
},
mainMenu: [
  { id: "tickets", label: "Tickets", href: "/r/ticket/search" },
  { id: "customers", label: "Customers", href: "/r/customer/search" },
],
```

## Next Steps

- Read the [Schema documentation](./schema.md) to learn about schema features
- Explore [Resources](./resources.md) for CRUD operations
- Check out [Authentication](./authentication.md) for auth customization
- Learn about [Dashboards](./dashboards.md) for data visualization
