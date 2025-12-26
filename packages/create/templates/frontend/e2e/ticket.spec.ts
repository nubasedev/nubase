import { expect, test, WORKSPACE_PREFIX } from "./fixtures/base";

test.describe("Ticket Management", () => {
	test("should create a ticket and view it", async ({ authenticatedPage }) => {
		// authenticatedPage fixture already logged in the test user
		// Navigate to create ticket page
		await authenticatedPage.goto(`${WORKSPACE_PREFIX}/r/ticket/create`);

		// Fill in the ticket form
		await authenticatedPage.fill('input[name="title"]', "Test Ticket Title");
		await authenticatedPage.fill(
			'textarea[name="description"]',
			"This is a test ticket description",
		);

		// Submit the form using test-id - wait for button to be visible and enabled
		const submitButton = authenticatedPage.locator('[data-testid="form-submit-button"]');
		await expect(submitButton).toBeVisible();
		await expect(submitButton).toBeEnabled();

		// Click and wait for navigation
		await Promise.all([
			authenticatedPage.waitForURL(/\/r\/ticket\/view\?id=\d+/, { timeout: 15000 }),
			submitButton.click(),
		]);

		// Extract the ticket ID from URL
		const url = new URL(authenticatedPage.url());
		const ticketId = url.searchParams.get("id");
		expect(ticketId).toBeTruthy();

		// Verify the page loaded correctly - h1 should show "View Ticket"
		await expect(authenticatedPage.locator("h1").first()).toContainText(
			"View Ticket",
		);

		// The navigation to view page confirms the ticket was created successfully
		// The API now requires authentication, so we verify the creation through the UI
	});

	test("should not allow saving a ticket without a title", async ({
		authenticatedPage,
	}) => {
		// authenticatedPage fixture already logged in the test user
		// Navigate to create ticket page
		await authenticatedPage.goto(`${WORKSPACE_PREFIX}/r/ticket/create`);

		// Leave title empty, fill description
		await authenticatedPage.fill(
			'textarea[name="description"]',
			"Description without title",
		);

		// Try to submit
		await authenticatedPage.click('[data-testid="form-submit-button"]');

		// Wait for any validation or navigation attempt
		await authenticatedPage.waitForTimeout(2000);

		// The key test: should NOT have navigated to view page
		// If validation works, we stay on create page
		expect(authenticatedPage.url()).toContain("/r/ticket/create");
		expect(authenticatedPage.url()).not.toContain("/r/ticket/view");

		// Form should prevent submission - submit button should either:
		// 1. Be disabled due to validation, or
		// 2. Form should not submit due to required field validation
		const isStillOnCreatePage = authenticatedPage
			.url()
			.includes("/r/ticket/create");
		expect(isStillOnCreatePage).toBe(true);
	});
});
