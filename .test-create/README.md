# .testCreate

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

4. Start the development servers:

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3002/default
- Backend API: http://localhost:3001

### Default Credentials

- Email: demo@example.com
- Password: password123

## Project Structure

```
.test-create/
├── .test-create-schema/    # Shared API schemas and types
├── .test-create-backend/   # Node.js backend (Hono + PostgreSQL)
├── .test-create-frontend/  # React frontend (Vite + Nubase)
└── package.json                # Root workspace configuration
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all packages
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
- Port: 5434
- Database: .test_create
- User: .test_create
- Password: .test_create

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
