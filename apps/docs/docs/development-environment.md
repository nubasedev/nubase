---
sidebar_position: 1.5
---

# Development Environment

This guide explains how to set up and run the Nubase example application locally, including all the different services, ports, and environments.

## Quick Start

From the repository root:

```bash
# Install dependencies
npm install

# Start the databases
npm run db:up

# Seed the development database
npm run db:seed

# Start all services
npm run dev
```

This starts the complete development environment with all services running.

## Architecture Overview

The example application (Questlog) consists of three main parts:

| Component | Description |
|-----------|-------------|
| **questlog-frontend** | React frontend using Vite |
| **questlog-backend** | Node.js/Hono backend with REST API |
| **questlog-schema** | Shared TypeScript schema definitions |

## Environments

There are two separate environments: **Development** and **Test**. Each has its own ports and database to prevent conflicts.

### Development Environment

Used for day-to-day development work.

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://tavern.localhost:5173 |
| Backend | 3001 | http://tavern.localhost:3001 |
| PostgreSQL | 5434 | localhost:5434 |
| Storybook | 6006 | http://localhost:6006 |
| Documentation | 3002 | http://localhost:3002 |

### Test Environment

Used for E2E testing with Playwright. Runs on separate ports with a separate database.

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4000 | http://tavern.localhost:4000 |
| Backend | 4001 | http://tavern.localhost:4001 |
| PostgreSQL | 5435 | localhost:5435 |

## Subdomain-Based Multi-Tenancy

The example application uses subdomain-based multi-tenancy. The default tenant is **tavern**, so all URLs use:

- `tavern.localhost:5173` (not `localhost:5173`)
- `tavern.localhost:3001` (not `localhost:3001`)

Different subdomains represent different tenants. For example, `acme.localhost:5173` would be a different tenant.

:::warning Important
Always use the subdomain URLs. The application will return "Tenant not found" if you access it without a subdomain.
:::

## Database Configuration

### Development Database

```
Host: localhost
Port: 5434
Database: questlog
User: questlog
Password: questlog
```

### Test Database

```
Host: localhost
Port: 5435
Database: questlog
User: questlog
Password: questlog
```

### Database Commands

```bash
# Start both databases
npm run db:up

# Start only development database
npm run db:dev:up

# Start only test database
npm run db:test:up

# Stop all databases
npm run db:down

# Remove databases and their data
npm run db:kill

# Seed development database
npm run db:seed
```

## Running Services

### Start Everything

```bash
npm run dev
```

This starts:
- Frontend at http://tavern.localhost:5173
- Backend at http://tavern.localhost:3001
- Storybook at http://localhost:6006
- Playwright UI (for E2E testing)

### Start Individual Services

```bash
# Frontend only
cd example/questlog-frontend && npm run dev

# Backend only
cd example/questlog-backend && npm run dev

# Storybook only
cd packages/frontend && npm run storybook

# Documentation only
cd apps/docs && npm run dev
```

## E2E Testing

Playwright E2E tests run against the test environment (ports 4000/4001).

```bash
# Run all E2E tests
npm run e2e

# Open Playwright UI
npm run e2e:ui

# Run tests with visible browser
npm run e2e:headed

# Debug tests
npm run e2e:debug
```

:::tip
The test environment uses a separate database (port 5435) that gets cleared before each test run. Your development data is safe.
:::

## Debug Authentication

For API testing with curl, you can use debug tokens instead of logging in:

```bash
# Format: debug:<userId>:<secret>
curl -H "Authorization: Bearer debug:1:dev-secret-123" \
  http://tavern.localhost:3001/tickets
```

This authenticates as user ID 1 without needing to log in. The secret (`dev-secret-123`) is configured in `.env.development` and `.env.test`.

## Environment Files

### Frontend

| File | Purpose |
|------|---------|
| `.env.development` | Development config (API at port 3001) |
| `.env.test` | Test config (API at port 4001) |

### Backend

| File | Purpose |
|------|---------|
| `.env.development` | Development config (DB at port 5434) |
| `.env.test` | Test config (DB at port 5435) |

## Common Issues

### "Tenant not found" Error

You're accessing the app without a subdomain. Use `tavern.localhost` instead of `localhost`.

### Port Already in Use

Another process is using the port. Either stop that process or the databases might already be running.

```bash
# Check what's using a port (e.g., 5434)
lsof -i :5434

# Kill the process if needed
kill -9 <PID>
```

### Database Connection Failed

Make sure the databases are running:

```bash
npm run db:up
```

### Playwright Tests Stuck on "Loading..."

The test backend might not have the tenant seeded. Restart the test backend:

```bash
# The global setup will seed the tenant
npm run e2e:ui
```

## Summary Table

| Service | Dev Port | Test Port | URL Pattern |
|---------|----------|-----------|-------------|
| Frontend | 5173 | 4000 | `tavern.localhost:<port>` |
| Backend | 3001 | 4001 | `tavern.localhost:<port>` |
| PostgreSQL | 5434 | 5435 | `localhost:<port>` |
| Storybook | 6006 | - | `localhost:6006` |
| Docs | 3002 | - | `localhost:3002` |
