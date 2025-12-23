import { expect, TENANT_PREFIX, TEST_USER, test } from "./fixtures/base";

test.describe("Authentication", () => {
  test("should successfully sign in with valid credentials", async ({
    page,
    testAPI: _testAPI,
  }) => {
    // testAPI fixture clears the database and seeds the test user

    // Navigate to signin page
    await page.goto(`${TENANT_PREFIX}/signin`);

    // Verify we're on the signin page
    await expect(page.locator("h1")).toContainText("Sign In");

    // Fill in valid credentials
    await page.fill("#username", TEST_USER.username);
    await page.fill("#password", TEST_USER.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL(`${TENANT_PREFIX}`);

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
    await page.goto(`${TENANT_PREFIX}/signin`);

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
    await page.goto(`${TENANT_PREFIX}/signin`);

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
    await page.goto(`${TENANT_PREFIX}/r/ticket/create`);

    // Should be redirected to signin
    await page.waitForURL(`${TENANT_PREFIX}/signin`);
    expect(page.url()).toContain("/signin");
  });

  test("should allow access to protected routes after login", async ({
    authenticatedPage,
  }) => {
    // authenticatedPage is already logged in and at home page
    // Navigate to the protected route
    await authenticatedPage.goto(`${TENANT_PREFIX}/r/ticket/create`);

    // Wait for the page to be ready and check for the heading
    await expect(
      authenticatedPage.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await expect(authenticatedPage.locator("h1")).toContainText(
      "Create Ticket",
    );
  });

  test("should display user avatar when logged in", async ({
    authenticatedPage,
  }) => {
    // authenticatedPage is already logged in and at home page
    // Check that the user avatar is visible
    const userAvatar = authenticatedPage.getByTestId("user-avatar");
    await expect(userAvatar).toBeVisible();

    // Avatar should show the user's initials (TE for "testuser")
    await expect(userAvatar).toContainText("TE");
  });

  test("should sign out successfully when clicking sign out", async ({
    authenticatedPage,
  }) => {
    // authenticatedPage is already logged in and at home page
    // Click the user avatar to open the dropdown
    const userAvatar = authenticatedPage.getByTestId("user-avatar");
    await userAvatar.click();

    // Click the sign out button
    const signOutButton = authenticatedPage.getByTestId("sign-out-button");
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    // Should be redirected to signin page
    await authenticatedPage.waitForURL(`${TENANT_PREFIX}/signin`);
    expect(authenticatedPage.url()).toContain("/signin");

    // User avatar should no longer be visible (we're on signin page)
    await expect(userAvatar).not.toBeVisible();
  });

  test("should redirect to signin after sign out when accessing protected route", async ({
    authenticatedPage,
  }) => {
    // Sign out first
    const userAvatar = authenticatedPage.getByTestId("user-avatar");
    await userAvatar.click();

    const signOutButton = authenticatedPage.getByTestId("sign-out-button");
    await signOutButton.click();

    // Wait for redirect to signin
    await authenticatedPage.waitForURL(`${TENANT_PREFIX}/signin`);

    // Try to access a protected route
    await authenticatedPage.goto(`${TENANT_PREFIX}/r/ticket/create`);

    // Should be redirected back to signin
    await authenticatedPage.waitForURL(`${TENANT_PREFIX}/signin`);
    expect(authenticatedPage.url()).toContain("/signin");
  });
});
