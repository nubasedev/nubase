# End-to-End Testing with Playwright

This guide covers how to run and work with end-to-end (e2e) tests in the Nubase project using Playwright with isolated test environments.

## Overview

The Nubase project includes comprehensive end-to-end testing infrastructure that validates the complete user workflows, particularly focusing on:

- Resource creation and navigation flows
- Form validation and submission
- Data persistence and retrieval
- Cross-page navigation and state management

The e2e tests use **Playwright** with the **questlog-frontend** example application, providing real-world testing scenarios for the Nubase framework.

## Environment Architecture

The testing infrastructure uses **separate environments** for development and testing to ensure complete isolation:

### Development Environment
- **Frontend**: `http://tavern.localhost:3002` (Vite dev server)
- **Backend**: `http://tavern.localhost:3001` (Hono server)
- **Database**: PostgreSQL on port `5434` (development data)

### Test Environment
- **Frontend**: `http://tavern.localhost:4002` (Vite test server)
- **Backend**: `http://tavern.localhost:4001` (Hono test server)
- **Database**: PostgreSQL on port `5435` (clean test data)

This separation ensures that:
- Tests never interfere with development work
- Each test run starts with a clean database state
- Development and testing can run simultaneously
- Test failures don't affect development data

## Quick Start

### Prerequisites

1. **Node.js**: Ensure you have Node.js 18+ installed
2. **Docker**: Required for running the test database
3. **Project Dependencies**: Run `npm install` in the project root

### Initial Setup

From the project root, install Playwright browsers:

```bash
npm run e2e:install
```

### Environment Configuration

The test environment uses specific ports and environment variables:

#### Environment Variables
- **VITE_API_BASE_URL**: Automatically configured based on environment
  - Development: `http://tavern.localhost:3001`
  - Test: `http://tavern.localhost:4001`
- **PORT**: Frontend server port (4002 for tests, 3002 for dev)
- **API_PORT**: Backend server port (4001 for tests, 3001 for dev)
- **DB_PORT**: Database port (5435 for tests, 5434 for dev)

#### Configuration Files
The test setup uses these configuration files:
- `.env.test` - Test environment variables (automatically created)
- `examples/internal/frontend/.env.local` - Local development overrides
- `examples/internal/backend/.env` - Backend configuration

### Running Tests

The test environment automatically starts dedicated servers on test ports to ensure isolation.

#### Headless Mode (CI/Production)
```bash
# Setup test database and run all tests
npm run e2e:setup    # Starts PostgreSQL on port 5435
npm run e2e          # Starts frontend:4002, backend:4001, runs tests

# Teardown when done
npm run e2e:teardown # Stops database and cleans up
```

#### Interactive UI Mode (Development)
```bash
# Setup test database
npm run e2e:setup

# Open Playwright UI for interactive test development
npm run e2e:ui       # Frontend:4002, Backend:4001

# Teardown when done
npm run e2e:teardown
```

#### Debug Mode
```bash
# Setup test database
npm run e2e:setup

# Run tests with debugging enabled
npm run e2e:debug    # Step-by-step execution with browsers visible

# Teardown when done
npm run e2e:teardown
```

## Available Scripts

All e2e scripts are available at the project root level:

| Script | Description |
|--------|-------------|
| `npm run e2e:setup` | Start the test database (PostgreSQL on port 5435) |
| `npm run e2e:teardown` | Stop and clean up the test database |
| `npm run e2e` | Run all tests in headless mode (auto-starts frontend:4002, backend:4001) |
| `npm run e2e:ui` | Open Playwright test UI for interactive development |
| `npm run e2e:headed` | Run tests with visible browser windows |
| `npm run e2e:debug` | Run tests in debug mode with step-by-step execution |
| `npm run e2e:report` | View the HTML test report |
| `npm run e2e:install` | Install Playwright browsers |

### Development Scripts (for manual testing)

| Script | Description |
|--------|-------------|
| `npm run dev:test:frontend` | Start frontend on test port (:4002) with test API URL |
| `npm run dev:test:backend` | Start backend on test port (:4001) with test database |
| `npm run dev:test` | Start both frontend and backend in test mode (concurrent) |

## Test Architecture

### Infrastructure Components

```
DEVELOPMENT ENVIRONMENT (ports 3001-3002, 5434):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │ ─► │    Frontend     │ ─► │    Backend      │
│      Work       │    │  (Port 3002)    │    │  (Port 3001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Dev Database   │
                                               │  (Port 5434)    │
                                               └─────────────────┘

TEST ENVIRONMENT (ports 4001-4002, 5435):
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
```

### Key Features

- **Environment Isolation**: Complete separation between development and test environments
- **Database Isolation**: Each test starts with a clean database state on port 5435
- **Automatic Server Management**: Playwright manages dedicated test servers (ports 4001-4002)
- **API Integration**: Tests can interact with backend APIs directly via port 4001
- **Environment Variables**: Automatic configuration via VITE_API_BASE_URL
- **Visual Testing**: Screenshots and traces captured on failures
- **Parallel Safety**: Tests are designed to run safely in parallel
- **Port Management**: No conflicts with development servers running simultaneously

## Test Scenarios Covered

### Ticket Management Workflow

1. **Create → View Navigation**: 
   - Create a new ticket via form
   - Automatically redirect to ticket view page
   - Verify ticket data persistence

2. **Form Validation**:
   - Test required field validation
   - Verify error handling for invalid submissions
   - Ensure form state management

3. **Patch Operations**:
   - Edit ticket fields in view mode
   - Verify real-time updates via API
   - Test field-level validation

4. **Data Isolation**:
   - Verify clean database state between tests
   - Test concurrent data operations
   - Validate test independence

## Writing New Tests

### Test Structure

Tests are located in `examples/internal/frontend/e2e/` and follow this pattern:

```typescript
import { expect, test } from "./fixtures/base";

test.describe("Feature Name", () => {
  test("should do something specific", async ({ page, testAPI }) => {
    // Navigate to page
    await page.goto("/r/resource/create");
    
    // Interact with UI
    await page.fill('input[name="field"]', "value");
    await page.click('[data-testid="submit-button"]');
    
    // Assert UI changes
    await page.waitForURL(/\/r\/resource\/view\?id=\d+/);
    
    // Verify via API
    const data = await testAPI.getData();
    expect(data).toMatchObject({ field: "value" });
  });
});
```

### Test Fixtures

The testing framework provides these fixtures:

- **`page`**: Playwright Page object for browser automation
- **`testAPI`**: Custom API client for backend interactions
  - `clearDatabase()`: Reset database state
  - `seedTestData(data)`: Insert test data
  - `getDatabaseStats()`: Get record counts
  - `createTicket(data)`: Create ticket via API
  - `getTicket(id)`: Retrieve ticket by ID

### Best Practices

1. **Use Test IDs**: Always use `data-testid` attributes for reliable element selection
   ```typescript
   await page.click('[data-testid="form-submit-button"]');
   ```

2. **Verify Both UI and Data**: Test UI changes and verify backend state
   ```typescript
   // UI assertion
   await expect(page.locator(".success-message")).toBeVisible();
   
   // API verification
   const record = await testAPI.getRecord(id);
   expect(record.status).toBe("active");
   ```

3. **Test Independence**: Each test should work in isolation
   ```typescript
   test("should work independently", async ({ testAPI }) => {
     // Database is automatically cleared before this test
     const stats = await testAPI.getDatabaseStats();
     expect(stats.records.count).toBe(0);
   });
   ```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using the test ports
lsof -ti:4001,4002,5435

# Kill conflicting processes
kill $(lsof -ti:4001,4002,5435)

# If development ports are also conflicting
lsof -ti:3001,3002,5434

# Check all relevant ports at once
lsof -ti:3001,3002,4001,4002,5434,5435
```

#### Environment Variable Issues
```bash
# Check if VITE_API_BASE_URL is set correctly
echo $VITE_API_BASE_URL  # Should be http://tavern.localhost:4001 for tests

# Verify .env.test file exists and has correct values
cat .env.test

# Check frontend environment in browser console
# Should show API calls going to localhost:4001

# Verify backend is connecting to test database
# Backend logs should show: "Connected to database on port 5435"
```

#### Server Startup Issues
```bash
# Check if servers are running on correct ports
curl http://tavern.localhost:4002  # Frontend should respond
curl http://tavern.localhost:4001/  # Backend should respond

# Check server logs for environment confirmation
# Frontend should show: "Local: http://localhost:4002"
# Backend should show: "Server running on port 4001"

# Verify API URL configuration in browser
# Open http://tavern.localhost:4002, check Network tab
# API calls should go to tavern.localhost:4001, not tavern.localhost:3001
```

#### Environment Isolation Issues
```bash
# Verify test and dev environments are separate
lsof -i :3002  # Should show dev frontend (if running)
lsof -i :3001  # Should show dev backend (if running)
lsof -i :4002  # Should show test frontend (during tests)
lsof -i :4001  # Should show test backend (during tests)

# Check database connections
# Dev backend should connect to :5434
# Test backend should connect to :5435
```

#### Database Connection Issues
```bash
# Check if test database is running
docker ps | grep postgres

# Restart the test setup
npm run e2e:teardown
npm run e2e:setup
```

#### Test Flakiness
- Increase timeouts for slow operations
- Use proper wait conditions instead of `waitForTimeout`
- Verify element visibility before interaction
- Check network stability for API calls

#### Browser Installation
```bash
# Reinstall Playwright browsers
npm run e2e:install

# For specific browser
npx playwright install chromium
```

### Debug Strategies

1. **Visual Debugging**: Use headed mode to see what's happening
   ```bash
   npm run e2e:headed
   ```

2. **Step-by-Step**: Use debug mode to pause at each step
   ```bash
   npm run e2e:debug
   ```

3. **Screenshots**: Check failure screenshots in `test-results/`

4. **Console Logs**: Add logging to your tests
   ```typescript
   page.on('console', msg => console.log(`PAGE: ${msg.text()}`));
   ```

5. **Network Monitoring**: Watch API calls
   ```typescript
   page.on('request', req => console.log(`${req.method()} ${req.url()}`));
   page.on('response', res => console.log(`${res.status()} ${res.url()}`));
   ```

## CI/CD Integration

For continuous integration, use the headless mode:

```yaml
- name: Setup Test Database
  run: npm run e2e:setup
  
- name: Install Playwright
  run: npm run e2e:install
  
- name: Run E2E Tests
  run: npm run e2e
  
- name: Cleanup
  run: npm run e2e:teardown
```

## Test Configuration

The test configuration is located in `examples/internal/frontend/playwright.config.ts`:

- **Test Directory**: `./e2e`
- **Global Setup**: Database initialization and server readiness checks
- **Parallel Execution**: Disabled for database isolation (can be enabled if needed)
- **Retries**: Configured for CI environments
- **Reporters**: HTML report with traces and screenshots
- **Base URL**: `http://tavern.localhost:4002` (test environment)
- **Timeout**: 30 seconds per test (configurable)

### Environment Configuration Files

#### `.env.test` (Auto-generated)
```bash
VITE_API_BASE_URL=http://tavern.localhost:4001
PORT=4002
API_PORT=4001
DB_PORT=5435
NODE_ENV=test
```

#### `examples/internal/frontend/.env.local` (Optional overrides)
```bash
# Local development overrides
# Only affects development environment (ports 3001-3002)
VITE_API_BASE_URL=http://tavern.localhost:3001
```

#### `examples/internal/backend/.env`
```bash
# Backend configuration
# PORT is overridden by scripts (3001 for dev, 4001 for test)
DB_PORT=5434  # Overridden to 5435 for tests
DB_NAME=questlog
DB_USER=questlog
DB_PASSWORD=questlog
DB_HOST=localhost
```

## Performance Considerations

- **Database Reset**: Each test starts with `clearDatabase()` - consider bulk operations for speed
- **Server Startup**: Servers start fresh for each test run - factor in ~30-60 second startup time
- **Parallel Tests**: Currently disabled for simplicity, but can be enabled with proper isolation
- **Resource Cleanup**: Tests automatically clean up but manual cleanup may be needed for long-running sessions

## Detailed Testing Process

### Step-by-Step Test Execution

1. **Setup Phase**
   ```bash
   npm run e2e:setup
   ```
   - Starts PostgreSQL container on port 5435
   - Creates clean test database
   - Waits for database to be ready

2. **Test Execution Phase**
   ```bash
   npm run e2e
   ```
   - Creates `.env.test` with test environment variables
   - Starts backend server on port 4001 (connected to test DB)
   - Starts frontend server on port 4002 (with VITE_API_BASE_URL=http://tavern.localhost:4001)
   - Waits for both servers to be ready
   - Runs Playwright tests against http://tavern.localhost:4002
   - Automatically stops servers after tests complete

3. **Cleanup Phase**
   ```bash
   npm run e2e:teardown
   ```
   - Stops and removes PostgreSQL container
   - Cleans up temporary files
   - Removes `.env.test` file

### Manual Testing with Test Environment

For debugging or manual testing with the isolated test environment:

```bash
# Terminal 1: Start test database
npm run e2e:setup

# Terminal 2: Start backend in test mode
npm run dev:test:backend  # Runs on :4001 with test DB

# Terminal 3: Start frontend in test mode
npm run dev:test:frontend  # Runs on :4002 with API_URL=tavern.localhost:4001

# Or use concurrent mode
npm run dev:test  # Starts both frontend:4002 and backend:4001

# When done
npm run e2e:teardown
```

## Advanced Usage

### Custom Test Environment Variables

The test environment automatically configures ports and URLs, but you can customize them:

```bash
# Use different test ports (must update both frontend and backend)
PORT=4500 API_PORT=4501 npm run e2e

# Different database port
DB_PORT=5436 npm run e2e:setup

# Different API base URL (for testing with external backend)
VITE_API_BASE_URL=http://localhost:8080 npm run e2e
```

### Environment-specific Testing

```bash
# Test with development database (not recommended)
DB_PORT=5432 npm run e2e

# Test against staging environment
VITE_API_BASE_URL=https://api.staging.example.com npm run e2e
```

### Selective Test Execution

```bash
# Run specific test file
npm run e2e -- ticket.spec.ts

# Run tests matching pattern
npm run e2e -- --grep "should create"

# Run tests in specific browser
npm run e2e -- --project=chromium
```

### Custom Test Data

```typescript
test("should handle complex data", async ({ testAPI }) => {
  await testAPI.seedTestData({
    tickets: [
      { title: "Urgent Bug", priority: "high" },
      { title: "Feature Request", priority: "low" }
    ]
  });
  
  // Test with pre-seeded data
});
```

## Summary of Test Environment Configuration

### Key Improvements

The updated E2E testing setup provides **complete environment isolation** with the following key features:

#### Port Separation
- **Development**: Frontend :3002, Backend :3001, Database :5434
- **Testing**: Frontend :4002, Backend :4001, Database :5435
- **Benefit**: Development and testing can run simultaneously without conflicts

#### Environment Variables
- **Automatic Configuration**: VITE_API_BASE_URL automatically set based on environment
- **Test-specific .env**: `.env.test` file created automatically during test runs
- **Clean Separation**: Development `.env.local` doesn't affect test environment

#### New Scripts
- `npm run dev:test:frontend` - Frontend on :4002 with test API URL
- `npm run dev:test:backend` - Backend on :4001 with test database
- `npm run dev:test` - Both services in test mode (concurrent)

#### Database Isolation
- **Separate Database**: Test DB on port 5435 with clean state per test
- **Docker Container**: Isolated PostgreSQL instance for testing
- **No Data Pollution**: Development data never affected by test runs

### Migration from Previous Setup

If you're updating from the previous configuration:

1. **Port Changes**: Tests now run on :4002 instead of :3002
2. **Environment Variables**: VITE_API_BASE_URL now points to :4001 for tests
3. **Database**: Test database uses :5435 (dev uses :5434)
4. **Configuration**: `.env.test` file automatically managed
5. **Scripts**: New `dev:test` scripts available for manual testing

This comprehensive e2e testing setup ensures that all Nubase features work correctly in real-world scenarios, provides complete isolation from development work, and gives confidence for production deployments.