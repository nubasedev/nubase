# E2E Testing Setup with Playwright

This document describes the complete Playwright end-to-end testing setup for the Questlog application.

## Overview

The e2e testing infrastructure includes:
- **Playwright** for browser automation
- **Test Database** isolation using Docker PostgreSQL on port 5435
- **Database Cleanup** between tests via API endpoints
- **Test Fixtures** for common operations
- **Parallel Safety** with proper test isolation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Playwright    │ ─► │    Frontend     │ ─► │    Backend      │
│     Tests       │    │  (Port 4002)    │    │  (Port 4001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Test Database   │
                                               │  (Port 5435)    │
                                               └─────────────────┘

Note: All URLs use the subdomain format: tavern.localhost:4002 (frontend), tavern.localhost:4001 (backend)
```

## Installation

1. **Install Playwright dependencies:**
   ```bash
   cd questlog-example-app/frontend
   npm install
   npm run e2e:install
   ```

2. **Start the test database:**
   ```bash
   npm run test:setup
   ```

## Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm run e2e

# Run with browser UI
npm run e2e:ui

# Run in headed mode (visible browser)
npm run e2e:headed

# Debug tests
npm run e2e:debug

# View test report
npm run e2e:report
```

### Test Environment

The tests automatically:
1. Start the test PostgreSQL database (port 5435)
2. Start the backend server with test configuration
3. Start the frontend development server
4. Clear the database before each test
5. Run tests with isolated data

## Test Structure

### Fixtures (`e2e/fixtures/`)

- **`base.ts`** - Extends Playwright with `testAPI` fixture
- **`test-api.ts`** - API client for database operations

### Global Setup (`e2e/global-setup.ts`)

- Waits for backend to be ready
- Performs initial database cleanup

### Test Files (`e2e/*.spec.ts`)

- **`ticket.spec.ts`** - Main ticket functionality tests

## Key Features

### Database Isolation

Each test starts with a clean database:

```typescript
test('should create a ticket', async ({ testAPI }) => {
  // Database is automatically cleared before this test
  const stats = await testAPI.getDatabaseStats();
  expect(stats.tickets.count).toBe(0);
  
  // ... test logic
});
```

### API Integration

Tests can interact with the backend directly:

```typescript
// Clear database
await testAPI.clearDatabase();

// Seed test data
await testAPI.seedTestData({
  tickets: [
    { title: 'Test Ticket', description: 'Test description' }
  ]
});

// Get statistics
const stats = await testAPI.getDatabaseStats();
```

### Frontend Testing

Tests interact with the actual UI:

```typescript
test('should create ticket via UI', async ({ page }) => {
  await page.goto('/r/ticket/create');
  await page.fill('input[name="title"]', 'My Ticket');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/r\/ticket\/view\?id=\d+/);
});
```

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './e2e',
  globalSetup: require.resolve('./e2e/global-setup'),
  fullyParallel: false, // Ensures proper cleanup
  
  webServer: [
    {
      command: 'npm run dev:test',
      url: 'http://tavern.localhost:4002', // Frontend (test mode)
    },
    {
      command: 'cd ../backend && npm run dev:test',
      url: 'http://tavern.localhost:4001', // Backend (test mode)
      env: {
        DB_PORT: '5435', // Test database
      },
    },
  ],
});
```

### Backend Test Routes

The backend includes test-only endpoints (only available when `DB_PORT=5435`):

- `POST /api/test/clear-database` - Clear all test data
- `POST /api/test/seed` - Seed test data
- `GET /api/test/stats` - Get database statistics

## Test Cases

### Ticket Creation Flow

1. Navigate to `/r/ticket/create`
2. Fill in form fields
3. Submit form
4. Verify redirect to view page
5. Verify ticket data via API

### Validation Testing

1. Try to submit form without required title
2. Verify validation error appears
3. Verify form doesn't submit
4. Verify no data created in database

### Data Isolation

1. Each test starts with clean database
2. Test data doesn't affect other tests
3. Parallel test safety (if enabled)

## Environment Variables

The backend uses these environment variables for test mode:

```bash
NODE_ENV=test          # Enables test endpoints
DB_HOST=localhost      # Test database host
DB_PORT=5435          # Test database port (different from dev)
DB_USER=questlog      # Test database user
DB_PASSWORD=questlog  # Test database password
DB_NAME=questlog      # Test database name
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if test database is running
docker ps | grep postgres

# Start test database
npm run test:setup
```

### Tests Fail to Clean Database
```bash
# Verify backend is using test port
curl http://localhost:3001/api/test/stats

# Should return database statistics
```

### Port Conflicts
```bash
# Check what's using ports
lsof -ti:4001,4002,5435

# Kill processes if needed
kill $(lsof -ti:4001,4002,5435)
```

### Reset Everything
```bash
# Stop all services
npm run test:teardown

# Clean up containers
docker-compose -f ../backend/docker/test/docker-compose.yml down -v

# Restart
npm run test:setup
```

## CI/CD Integration

For CI environments, add these steps:

```yaml
- name: Setup Test Database
  run: |
    cd questlog-example-app/backend
    docker-compose -f docker/test/docker-compose.yml up -d
    
- name: Install Playwright
  run: |
    cd questlog-example-app/frontend
    npm install
    npm run e2e:install
    
- name: Run E2E Tests
  run: |
    cd questlog-example-app/frontend
    npm run e2e
    
- name: Cleanup
  run: |
    cd questlog-example-app/backend
    docker-compose -f docker/test/docker-compose.yml down
```

## Best Practices

1. **Always use the `testAPI` fixture** for database operations
2. **Don't rely on previous test data** - each test should be independent
3. **Use descriptive test names** that explain the expected behavior
4. **Test both success and failure cases**
5. **Verify data changes via API** in addition to UI assertions
6. **Keep tests focused** - test one behavior per test case

## Maintenance

- **Regular updates**: Keep Playwright and dependencies updated
- **Monitor test stability**: Watch for flaky tests and improve waits/assertions
- **Performance**: Monitor test execution times and optimize slow tests
- **Documentation**: Keep this guide updated with any changes to the setup