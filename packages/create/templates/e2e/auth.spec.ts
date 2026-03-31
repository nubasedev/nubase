import { expect, TEST_USER, test, WORKSPACE_PREFIX } from "./fixtures/base";

test.describe("Authentication", () => {
	test("should successfully sign in with valid credentials", async ({
		page,
		testAPI: _testAPI,
	}) => {
		// Navigate to signin page
		await page.goto("/signin");

		// Verify we're on the signin page
		await expect(page.locator("h1")).toContainText("Sign In");

		// Fill in valid credentials
		await page.fill("#email", TEST_USER.email);
		await page.fill("#password", TEST_USER.password);

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for redirect to workspace home page
		await page.waitForURL(`${WORKSPACE_PREFIX}`);

		// Verify we're logged in (should see the app shell with main navigation)
		await expect(
			page.getByRole("navigation", { name: "Main navigation" }),
		).toBeVisible();
	});

	test("should show error message with invalid credentials", async ({
		page,
		testAPI: _testAPI,
	}) => {
		// Navigate to signin page
		await page.goto("/signin");

		// Fill in invalid credentials
		await page.fill("#email", "wrong@example.com");
		await page.fill("#password", "wrongpassword");

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for error message to appear
		const errorMessage = page.getByTestId("signin-error");
		await expect(errorMessage).toBeVisible();
		await expect(errorMessage).toContainText("Invalid email or password");

		// Should still be on signin page
		expect(page.url()).toContain("/signin");
	});

	test("should redirect to signin when accessing protected route unauthenticated", async ({
		page,
		testAPI: _testAPI,
	}) => {
		// Try to access a protected route directly
		await page.goto(`${WORKSPACE_PREFIX}/r/ticket/create`);

		// Should be redirected to signin
		await page.waitForURL("/signin");
		expect(page.url()).toContain("/signin");
	});

	test("should allow access to protected routes after login", async ({
		authenticatedPage,
	}) => {
		// authenticatedPage is already logged in and at home page
		// Navigate to the protected route
		await authenticatedPage.goto(`${WORKSPACE_PREFIX}/r/ticket/create`);

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
		// Check that the user avatar is visible
		const userAvatar = authenticatedPage.getByTestId("user-avatar");
		await expect(userAvatar).toBeVisible();

		// Avatar should show the user's initials (AU for "Admin User")
		await expect(userAvatar).toContainText("AU");
	});

	test("should sign out successfully when clicking sign out", async ({
		authenticatedPage,
	}) => {
		// Click the user avatar to open the dropdown
		const userAvatar = authenticatedPage.getByTestId("user-avatar");
		await userAvatar.click();

		// Click the sign out button
		const signOutButton = authenticatedPage.getByTestId("sign-out-button");
		await expect(signOutButton).toBeVisible();
		await signOutButton.click();

		// Should be redirected to signin page
		await authenticatedPage.waitForURL("/signin");
		expect(authenticatedPage.url()).toContain("/signin");

		// User avatar should no longer be visible
		await expect(userAvatar).not.toBeVisible();
	});
});
