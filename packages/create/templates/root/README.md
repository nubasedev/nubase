# __PROJECT_NAME_PASCAL__

A Nubase application.

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker and Docker Compose
- npm

### Setup

1. Install dependencies:

```bash
npm install
```

2. Start the database:

```bash
npm run db:up
```

3. Seed the database with sample data:

```bash
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:__PORT__/tavern

### Default Credentials

- Email: demo@example.com
- Password: password123

## Project Structure

```
__PROJECT_NAME__/
├── src/
│   ├── backend/     # Hono API server
│   ├── frontend/    # React frontend (Vite + Nubase)
│   └── common/      # Shared API schemas and types
├── docker/          # Docker Compose configs
├── e2e/             # Playwright E2E tests
├── vite.config.ts   # Unified Vite config (dev + build)
└── package.json     # Project configuration
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend on single port)
- `npm run build` - Build for production (client + server)
- `npm run start` - Start production server
- `npm run db:up` - Start PostgreSQL database
- `npm run db:down` - Stop PostgreSQL database
- `npm run db:seed` - Seed database with sample data
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues

## Database

The application uses PostgreSQL with Row Level Security (RLS) for multi-tenant data isolation.

### Connection Details

- Host: localhost
- Port: __DEV_PORT__
- Database: __DB_NAME__
- User: __DB_USER__
- Password: __DB_PASSWORD__

### Schema

The database includes the following tables:
- `workspaces` - Multi-tenant workspace isolation
- `users` - User accounts
- `user_workspaces` - User-workspace associations
- `tickets` - Sample entity with RLS policies

## Learn More

- [Nubase Documentation](https://nubase.dev)
- [Hono](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [TanStack Router](https://tanstack.com/router)
