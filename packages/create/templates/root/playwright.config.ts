import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./e2e",
	/* Global setup for initializing test environment */
	globalSetup: "./e2e/global-setup.ts",
	/* Run tests in files in parallel */
	fullyParallel: false,
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
		baseURL: "http://localhost:__TEST_PORT_APP__",
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		/* Screenshot on failure */
		screenshot: "only-on-failure",
		/* Enable video recording for better debugging */
		video: "retain-on-failure",
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	/* Run the unified dev server before starting the tests */
	webServer: {
		command: "npm run dev:test",
		url: "http://localhost:__TEST_PORT_APP__/tavern",
		reuseExistingServer: true,
		timeout: 120 * 1000,
	},
});
