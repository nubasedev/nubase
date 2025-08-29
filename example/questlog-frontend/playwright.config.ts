import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Global setup for initializing test environment */
  globalSetup: "./e2e/global-setup.ts",
  /* Run tests in files in parallel */
  fullyParallel: false, // Set to false to ensure proper cleanup between tests
  /* Limit max workers to 1 for sequential execution */
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4000",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Enable video recording for better debugging */
    video: "retain-on-failure",
    /* Capture console logs and errors */
    launchOptions: {
      // Enable console API and capture logs
      args: ["--enable-logging", "--log-level=0"],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "npm run dev:test",
      url: "http://localhost:4000",
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../questlog-backend && npm run dev:test",
      url: "http://localhost:4001",
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://questlog:questlog@localhost:5435/questlog",
      },
    },
  ],
});
