import { injectThemeVariables } from "../../theming/runtime-theme-generator";
import type { NubaseTheme } from "../../theming/theme";
import { validateThemeColors } from "./validateStyles";

/**
 * Initializes styles by injecting CSS variables derived from themes
 */
export async function initializeStyles(themes: NubaseTheme[]): Promise<void> {
  try {
    // Validate theme colors for accessibility compliance
    for (const theme of themes) {
      validateThemeColors(theme);
    }

    // Inject the CSS variables into the DOM
    injectThemeVariables(themes);
  } catch (error) {
    console.error("Failed to initialize styles:", error);
    throw error;
  }
}
