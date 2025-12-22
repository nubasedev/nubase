import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures/base";

/**
 * Helper to open the command palette by clicking the trigger.
 */
async function openCommandPalette(page: Page) {
  const trigger = page.getByTestId("command-palette-trigger");
  await trigger.click();
  await expect(page.getByTestId("command-palette")).toBeVisible();
}

test.describe("Command Palette", () => {
  test("should open command palette when clicking the search bar", async ({
    authenticatedPage,
  }) => {
    const trigger = authenticatedPage.getByTestId("command-palette-trigger");
    await trigger.click();

    const commandPalette = authenticatedPage.getByTestId("command-palette");
    await expect(commandPalette).toBeVisible();

    const searchInput = authenticatedPage.getByTestId(
      "command-palette-navigator-search",
    );
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
  });

  test("should close command palette when pressing Escape", async ({
    authenticatedPage,
  }) => {
    await openCommandPalette(authenticatedPage);

    await authenticatedPage.keyboard.press("Escape");

    await expect(
      authenticatedPage.getByTestId("command-palette"),
    ).not.toBeVisible();
  });

  test("should filter commands when typing in search", async ({
    authenticatedPage,
  }) => {
    await openCommandPalette(authenticatedPage);

    const searchInput = authenticatedPage.getByTestId(
      "command-palette-navigator-search",
    );
    await searchInput.fill("theme");

    await expect(
      authenticatedPage.getByTestId(
        "command-palette-navigator-list-item-workbench.setTheme",
      ),
    ).toBeVisible();
  });
});

/**
 * Helper to open the theme picker via the command palette.
 */
async function openThemePicker(page: Page) {
  await openCommandPalette(page);

  const searchInput = page.getByTestId("command-palette-navigator-search");
  await searchInput.fill("theme");

  await page
    .getByTestId("command-palette-navigator-list-item-workbench.setTheme")
    .click();

  await expect(page.getByTestId("theme-picker")).toBeVisible();
}

test.describe("Theme Switching", () => {
  test("should open theme picker from command palette", async ({
    authenticatedPage,
  }) => {
    await openThemePicker(authenticatedPage);

    await expect(authenticatedPage.getByTestId("theme-picker")).toBeVisible();

    const themeSearchInput = authenticatedPage.getByTestId(
      "theme-picker-navigator-search",
    );
    await expect(themeSearchInput).toBeVisible();
    await expect(themeSearchInput).toBeFocused();
  });

  test("should switch to light theme", async ({ authenticatedPage }) => {
    await openThemePicker(authenticatedPage);

    await authenticatedPage
      .getByTestId("theme-picker-navigator-list-item-light")
      .click();

    await expect(
      authenticatedPage.getByTestId("theme-picker"),
    ).not.toBeVisible();

    await expect(authenticatedPage.locator("html")).toHaveAttribute(
      "data-theme",
      "light",
    );
  });

  test("should switch to dark theme", async ({ authenticatedPage }) => {
    await openThemePicker(authenticatedPage);

    await authenticatedPage
      .getByTestId("theme-picker-navigator-list-item-dark")
      .click();

    await expect(
      authenticatedPage.getByTestId("theme-picker"),
    ).not.toBeVisible();

    await expect(authenticatedPage.locator("html")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  });

  test("should navigate themes with keyboard and select with Enter", async ({
    authenticatedPage,
  }) => {
    await openThemePicker(authenticatedPage);

    await authenticatedPage.keyboard.press("ArrowDown");
    await authenticatedPage.keyboard.press("ArrowDown");
    await authenticatedPage.keyboard.press("Enter");

    await expect(
      authenticatedPage.getByTestId("theme-picker"),
    ).not.toBeVisible();
  });

  test("should preview theme on focus and revert on dismiss", async ({
    authenticatedPage,
  }) => {
    const html = authenticatedPage.locator("html");
    const initialTheme = await html.getAttribute("data-theme");

    await openThemePicker(authenticatedPage);

    // Navigate to trigger preview
    await authenticatedPage.keyboard.press("ArrowDown");
    await authenticatedPage.keyboard.press("ArrowDown");

    // Dismiss without selecting
    await authenticatedPage.keyboard.press("Escape");

    // Theme should revert to initial
    await expect(html).toHaveAttribute("data-theme", initialTheme!);
  });

  test("should filter themes when searching", async ({ authenticatedPage }) => {
    await openThemePicker(authenticatedPage);

    await authenticatedPage
      .getByTestId("theme-picker-navigator-search")
      .fill("light");

    await expect(
      authenticatedPage.getByTestId("theme-picker-navigator-list-item-light"),
    ).toBeVisible();

    await expect(
      authenticatedPage.getByTestId("theme-picker-navigator-list-item-dark"),
    ).not.toBeVisible();
  });
});
