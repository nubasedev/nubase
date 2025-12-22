import { expect, TEST_USER, test } from "./fixtures/base";

test.describe("Authentication", () => {
  test("should successfully sign in with valid credentials", async ({
    page,
    testAPI: _testAPI,
  }) => {
    // testAPI fixture clears the database and seeds the test user

    // Navigate to signin page
    await page.goto("/signin");

    // Verify we're on the signin page
    await expect(page.locator("h1")).toContainText("Sign In");

    // Fill in valid credentials
    await page.fill("#username", TEST_USER.username);
    await page.fill("#password", TEST_USER.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL("/");

    // Verify we're logged in (should see the app shell with main navigation)
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
  });

  test("should show error message with invalid credentials", async ({
    page,
    testAPI: _testAPI,
  }) => {
    // testAPI fixture clears the database and seeds the test user

    // Navigate to signin page
    await page.goto("/signin");

    // Fill in invalid credentials
    await page.fill("#username", "wronguser");
    await page.fill("#password", "wrongpassword");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    const errorMessage = page.getByTestId("signin-error");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Invalid username or password");

    // Should still be on signin page
    expect(page.url()).toContain("/signin");
  });

  test("should show error for empty username", async ({
    page,
    testAPI: _testAPI,
  }) => {
    // Navigate to signin page
    await page.goto("/signin");

    // Leave username empty, fill password
    await page.fill("#password", "somepassword");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for error message
    const errorMessage = page.getByTestId("signin-error");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(
      "Please enter both username and password",
    );

    // Should still be on signin page
    expect(page.url()).toContain("/signin");
  });

  test("should redirect to signin when accessing protected route unauthenticated", async ({
    page,
    testAPI: _testAPI,
  }) => {
    // Try to access a protected route directly
    await page.goto("/r/ticket/create");

    // Should be redirected to signin
    await page.waitForURL("/signin");
    expect(page.url()).toContain("/signin");
  });

  test("should allow access to protected routes after login", async ({
    authenticatedPage,
  }) => {
    // authenticatedPage is already logged in and at home page
    // Navigate to the protected route
    await authenticatedPage.goto("/r/ticket/create");

    // Wait for the page to be ready and check for the heading
    await expect(
      authenticatedPage.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await expect(authenticatedPage.locator("h1")).toContainText(
      "Create Ticket",
    );
  });
});
