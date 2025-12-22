import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";
import { TestReporter } from "../utils/test-reporter";
import { TEST_USER, TestAPI } from "./test-api";

/**
 * Helper function to perform login via the UI.
 * Can be used directly in tests that need to test login functionality.
 */
export async function performLogin(
  page: Page,
  username: string = TEST_USER.username,
  password: string = TEST_USER.password,
) {
  // Navigate to signin page
  await page.goto("/signin");

  // Fill in credentials
  await page.fill("#username", username);
  await page.fill("#password", password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for redirect to home page (successful login)
  await page.waitForURL("/");
}

// Extend basic test by providing enhanced fixtures
export const test = base.extend<{
  testAPI: TestAPI;
  reporter: TestReporter;
  authenticatedPage: Page;
}>({
  testAPI: async ({ request }, use) => {
    const testAPI = new TestAPI(request);

    // Clear database before each test (this also seeds the test user)
    await testAPI.clearDatabase();

    // Use the fixture in the test
    await use(testAPI);

    // Optional: Clear database after each test (already cleared before next test)
    // await testAPI.clearDatabase();
  },

  /**
   * Provides a page that is already authenticated with the test user.
   * Use this fixture for tests that require an authenticated session.
   */
  authenticatedPage: async ({ page, testAPI: _testAPI }, use) => {
    // testAPI fixture runs first and clears/seeds the database with test user
    // Now perform login via the UI
    await performLogin(page);

    // Provide the authenticated page to the test
    await use(page);
  },

  reporter: async ({ page }, use, testInfo) => {
    const reporter = new TestReporter(testInfo.title);

    // Set up comprehensive page event logging
    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();

      // Filter out noise and focus on our events
      if (
        text.includes("RENDERER") ||
        text.includes("CREATE SUCCESS") ||
        text.includes("SCHEMA FORM") ||
        text.includes("Navigation")
      ) {
        reporter.log("console", `${type}: ${text}`);
      }
    });

    page.on("pageerror", (exception) => {
      reporter.log("error", "Page error", {
        message: exception.message,
        stack: exception.stack,
      });
    });

    page.on("request", (request) => {
      if (request.url().includes("tickets")) {
        reporter.log("network", "Request", {
          method: request.method(),
          url: request.url(),
          postData: request.postData(),
        });
      }
    });

    page.on("response", (response) => {
      if (response.url().includes("tickets")) {
        response
          .json()
          .then((data) => {
            reporter.log("network", "Response", {
              status: response.status(),
              url: response.url(),
              data,
            });
          })
          .catch(() => {
            reporter.log("network", "Response", {
              status: response.status(),
              url: response.url(),
              data: "Could not parse JSON",
            });
          });
      }
    });

    // Inject test reporter into page context
    await page.addInitScript(() => {
      window.testReporter = {
        log: (category: string, event: string, data?: any) => {
          console.log(`TEST_EVENT: [${category}] ${event}`, data);
        },
      } as any;
    });

    await use(reporter);

    // Generate test summary
    reporter.summary();
  },
});

export { expect } from "@playwright/test";
export { TEST_USER } from "./test-api";
