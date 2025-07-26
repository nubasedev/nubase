import { test as base } from "@playwright/test";
import { TestReporter } from "../utils/test-reporter";
import { TestAPI } from "./test-api";

// Extend basic test by providing enhanced fixtures
export const test = base.extend<{
  testAPI: TestAPI;
  reporter: TestReporter;
}>({
  testAPI: async ({ request }, use) => {
    const testAPI = new TestAPI(request);

    // Clear database before each test
    await testAPI.clearDatabase();

    // Use the fixture in the test
    await use(testAPI);

    // Optional: Clear database after each test (already cleared before next test)
    // await testAPI.clearDatabase();
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
